/**
 * Security utilities for TrixDB SDK
 */

/** Pattern for valid resource IDs - alphanumeric, underscores, hyphens */
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,255}$/;

/** Sensitive keys that should be redacted in logs */
const SENSITIVE_KEYS = new Set([
  'api_key', 'apikey', 'api-key', 'apiKey',
  'token', 'jwt_token', 'jwt', 'bearer', 'jwtToken',
  'password', 'secret', 'credential',
  'authorization', 'auth',
]);

/**
 * Validate a resource ID to prevent path traversal attacks.
 *
 * @param resourceId - The ID to validate
 * @param resourceType - Type of resource for error messages
 * @returns The validated ID
 * @throws Error if the ID is invalid
 */
export function validateId(resourceId: string, resourceType = 'resource'): string {
  if (!resourceId) {
    throw new Error(`${resourceType} ID cannot be empty`);
  }

  if (typeof resourceId !== 'string') {
    throw new Error(`${resourceType} ID must be a string`);
  }

  // Check for path traversal attempts
  if (resourceId.includes('..') || resourceId.includes('/') || resourceId.includes('\\')) {
    throw new Error(`Invalid ${resourceType} ID: contains path traversal characters`);
  }

  // Validate against pattern
  if (!ID_PATTERN.test(resourceId)) {
    throw new Error(
      `Invalid ${resourceType} ID: must be 1-255 characters, ` +
      'containing only letters, numbers, underscores, and hyphens'
    );
  }

  return resourceId;
}

/**
 * Validate a base URL for the API.
 *
 * @param url - The URL to validate
 * @param allowHttp - Whether to allow HTTP (insecure, for local dev only)
 * @returns The validated URL (without trailing slash)
 * @throws Error if the URL is invalid or insecure
 */
export function validateBaseUrl(url: string, allowHttp = false): string {
  if (!url) {
    throw new Error('Base URL cannot be empty');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // Check scheme
  if (parsed.protocol === 'http:') {
    if (!allowHttp) {
      throw new Error(
        'HTTP is not allowed for security reasons. Use HTTPS. ' +
        'Set allowInsecure option only for local development.'
      );
    }
  } else if (parsed.protocol !== 'https:') {
    throw new Error(`Invalid URL scheme '${parsed.protocol}'. Only HTTPS is allowed.`);
  }

  // Check host
  if (!parsed.host) {
    throw new Error('URL must include a host');
  }

  // Block localhost in production (unless allowHttp is set)
  if (!allowHttp) {
    const host = parsed.hostname.toLowerCase();
    // Remove brackets from IPv6 addresses
    const normalizedHost = host.replace(/^\[|\]$/g, '');
    if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1' ||
        normalizedHost === '::1' || normalizedHost === '0.0.0.0') {
      throw new Error(
        'Localhost URLs are not allowed in production. ' +
        'Set allowInsecure option for local development.'
      );
    }
  }

  return url.replace(/\/+$/, '');
}

/**
 * Validate a webhook URL.
 *
 * @param url - The webhook URL to validate
 * @returns The validated URL
 * @throws Error if the URL is invalid or insecure
 */
export function validateWebhookUrl(url: string): string {
  if (!url) {
    throw new Error('Webhook URL cannot be empty');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid webhook URL format: ${url}`);
  }

  // Must be HTTPS
  if (parsed.protocol !== 'https:') {
    throw new Error('Webhook URL must use HTTPS for security');
  }

  if (!parsed.host) {
    throw new Error('Webhook URL must include a host');
  }

  // Block internal/private IPs
  const host = parsed.hostname.toLowerCase();

  // Normalize IPv6 - remove brackets if present
  const normalizedHost = host.replace(/^\[|\]$/g, '');

  // Block localhost variants
  if (normalizedHost === 'localhost' || normalizedHost === '0.0.0.0') {
    throw new Error('Webhook URL cannot point to localhost');
  }

  // Block IPv4 loopback (127.0.0.0/8)
  if (normalizedHost.startsWith('127.')) {
    throw new Error('Webhook URL cannot point to localhost');
  }

  // Block IPv6 loopback (::1)
  if (normalizedHost === '::1') {
    throw new Error('Webhook URL cannot point to localhost');
  }

  // Block IPv6 zero address (::)
  if (normalizedHost === '::' || normalizedHost === '0:0:0:0:0:0:0:0') {
    throw new Error('Webhook URL cannot point to the zero address');
  }

  // Block private IPv4 ranges
  // 10.0.0.0/8
  if (normalizedHost.startsWith('10.')) {
    throw new Error('Webhook URL cannot point to private IP addresses');
  }
  // 192.168.0.0/16
  if (normalizedHost.startsWith('192.168.')) {
    throw new Error('Webhook URL cannot point to private IP addresses');
  }
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (normalizedHost.startsWith('172.')) {
    const secondOctet = parseInt(normalizedHost.split('.')[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) {
      throw new Error('Webhook URL cannot point to private IP addresses');
    }
  }

  // Block link-local addresses (169.254.0.0/16)
  if (normalizedHost.startsWith('169.254.')) {
    throw new Error('Webhook URL cannot point to link-local addresses');
  }

  // Block AWS/cloud metadata service
  if (normalizedHost === '169.254.169.254') {
    throw new Error('Webhook URL cannot point to metadata service');
  }

  // Block IPv6 private/link-local ranges
  // fc00::/7 (Unique Local Addresses - includes fc and fd prefixes)
  if (normalizedHost.startsWith('fc') || normalizedHost.startsWith('fd')) {
    throw new Error('Webhook URL cannot point to private IPv6 addresses');
  }
  // fe80::/10 (Link-local addresses)
  if (normalizedHost.startsWith('fe8') || normalizedHost.startsWith('fe9') ||
      normalizedHost.startsWith('fea') || normalizedHost.startsWith('feb')) {
    throw new Error('Webhook URL cannot point to IPv6 link-local addresses');
  }

  // Block IPv4-mapped IPv6 addresses (::ffff:x.x.x.x or ::ffff:XXYY:ZZWW in hex)
  // These could be used to bypass IPv4 checks
  // Node.js normalizes IPv4-mapped addresses to hex format: ::ffff:127.0.0.1 → ::ffff:7f00:1
  if (normalizedHost.startsWith('::ffff:') || normalizedHost.includes(':ffff:')) {
    // Try dotted decimal format first
    const ipv4Match = normalizedHost.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i) ||
                      normalizedHost.match(/:ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (ipv4Match) {
      const ipv4 = ipv4Match[1];
      if (ipv4.startsWith('127.') || ipv4.startsWith('10.') ||
          ipv4.startsWith('192.168.') || ipv4.startsWith('169.254.') ||
          ipv4 === '0.0.0.0') {
        throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
      }
      if (ipv4.startsWith('172.')) {
        const secondOctet = parseInt(ipv4.split('.')[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) {
          throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
        }
      }
    } else {
      // Try hex format (Node.js normalized): ::ffff:7f00:1 for 127.0.0.1
      const hexMatch = normalizedHost.match(/::ffff:([0-9a-f]+):([0-9a-f]+)$/i) ||
                       normalizedHost.match(/:ffff:([0-9a-f]+):([0-9a-f]+)$/i);
      if (hexMatch) {
        const firstPart = parseInt(hexMatch[1], 16);
        // Decode first part to get first two octets of IPv4
        const firstOctet = (firstPart >> 8) & 0xff;
        const secondOctet = firstPart & 0xff;

        // 127.x.x.x (loopback)
        if (firstOctet === 127) {
          throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
        }
        // 10.x.x.x (private)
        if (firstOctet === 10) {
          throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
        }
        // 192.168.x.x (private)
        if (firstOctet === 192 && secondOctet === 168) {
          throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
        }
        // 172.16-31.x.x (private)
        if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) {
          throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
        }
        // 169.254.x.x (link-local)
        if (firstOctet === 169 && secondOctet === 254) {
          throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
        }
        // 0.0.0.0 - check if both parts are 0
        if (firstPart === 0 && parseInt(hexMatch[2], 16) === 0) {
          throw new Error('Webhook URL cannot point to private IPv4-mapped IPv6 addresses');
        }
      }
    }
  }

  // Block site-local addresses (deprecated but still valid: fec0::/10)
  if (normalizedHost.startsWith('fec') || normalizedHost.startsWith('fed') ||
      normalizedHost.startsWith('fee') || normalizedHost.startsWith('fef')) {
    throw new Error('Webhook URL cannot point to deprecated IPv6 site-local addresses');
  }

  return url;
}

/**
 * Check if a key name suggests sensitive data.
 */
function isSensitiveKey(key: string): boolean {
  if (typeof key !== 'string') return false;
  const keyLower = key.toLowerCase().replace(/[_-]/g, '');
  return Array.from(SENSITIVE_KEYS).some(sensitive =>
    keyLower.includes(sensitive.toLowerCase().replace(/[_-]/g, ''))
  );
}

/**
 * Redact sensitive data from an object for safe logging.
 *
 * @param data - Data to redact
 * @param maxDepth - Maximum recursion depth
 * @returns Data with sensitive values replaced with "[REDACTED]"
 */
export function redactSensitiveData(data: unknown, maxDepth = 10): unknown {
  if (maxDepth <= 0) {
    return '[MAX DEPTH EXCEEDED]';
  }

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact Bearer tokens in strings
    if (data.startsWith('Bearer ')) {
      return 'Bearer [REDACTED]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, maxDepth - 1));
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redactSensitiveData(value, maxDepth - 1);
      }
    }
    return result;
  }

  return data;
}

/**
 * Get API credential from environment variable.
 * Only works in Node.js environments.
 *
 * @param envVar - Environment variable name
 * @param required - Whether to throw if not found
 * @returns The credential value or undefined
 * @throws Error if required and not found
 */
export function getEnvCredential(
  envVar = 'TRIXDB_API_KEY',
  required = true
): string | undefined {
  // Check if we're in a Node.js environment
  if (typeof process === 'undefined' || !process.env) {
    if (required) {
      throw new Error(
        `Cannot read environment variable ${envVar}: not in Node.js environment. ` +
        'Pass apiKey explicitly in browser environments.'
      );
    }
    return undefined;
  }

  const value = process.env[envVar]?.trim();

  if (!value) {
    if (required) {
      throw new Error(
        `Environment variable ${envVar} is not set. ` +
        `Either set ${envVar} or pass apiKey explicitly.`
      );
    }
    return undefined;
  }

  return value;
}

/**
 * Mask a credential for display, showing only the last few characters.
 *
 * @param credential - The credential to mask
 * @param visibleChars - Number of characters to show at the end
 * @returns Masked credential like "****abcd"
 */
export function maskCredential(credential: string, visibleChars = 4): string {
  if (!credential) {
    return '[EMPTY]';
  }

  if (credential.length <= visibleChars) {
    return '*'.repeat(credential.length);
  }

  return '*'.repeat(credential.length - visibleChars) + credential.slice(-visibleChars);
}
