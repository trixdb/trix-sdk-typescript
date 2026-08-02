/**
 * Security utilities for Trix SDK
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

// ============================================================================
// SSRF blocklist — shared by validateBaseUrl and validateWebhookUrl
// ============================================================================

/**
 * Normalize a URL hostname for blocklist matching: lowercase and strip the
 * brackets WHATWG URL keeps around IPv6 literals (`[::1]` → `::1`).
 */
function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, '');
}

/** True for the RFC-1918 172.16.0.0/12 block (172.16.x.x – 172.31.x.x). */
function isPrivate172(ip: string): boolean {
  if (!ip.startsWith('172.')) return false;
  const secondOctet = parseInt(ip.split('.')[1], 10);
  return secondOctet >= 16 && secondOctet <= 31;
}

/** Loopback, zero, RFC-1918 private and link-local (incl. cloud metadata) IPv4. */
function assertNotLoopbackOrPrivateV4(host: string, label: string): void {
  if (host === 'localhost' || host === '0.0.0.0' || host.startsWith('127.') || host === '::1') {
    throw new Error(`${label} cannot point to localhost`);
  }
  if (host === '::' || host === '0:0:0:0:0:0:0:0') {
    throw new Error(`${label} cannot point to the zero address`);
  }
  if (host.startsWith('10.') || host.startsWith('192.168.') || isPrivate172(host)) {
    throw new Error(`${label} cannot point to private IP addresses`);
  }
  // 169.254.0.0/16 link-local — also covers the 169.254.169.254 metadata endpoint.
  if (host.startsWith('169.254.')) {
    throw new Error(`${label} cannot point to link-local addresses`);
  }
}

/** Private (fc00::/7), link-local (fe80::/10) and deprecated site-local (fec0::/10) IPv6. */
function assertNotPrivateV6(host: string, label: string): void {
  if (host.startsWith('fc') || host.startsWith('fd')) {
    throw new Error(`${label} cannot point to private IPv6 addresses`);
  }
  if (/^fe[89ab]/.test(host)) {
    throw new Error(`${label} cannot point to IPv6 link-local addresses`);
  }
  if (/^fe[cdef]/.test(host)) {
    throw new Error(`${label} cannot point to deprecated IPv6 site-local addresses`);
  }
}

/** True if a dotted-decimal IPv4 is loopback/private/link-local/zero. */
function isBlockedV4Dotted(ip: string): boolean {
  if (ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') ||
      ip.startsWith('169.254.') || ip === '0.0.0.0') {
    return true;
  }
  return isPrivate172(ip);
}

/** True if the two 16-bit halves of an IPv4-mapped IPv6 tail decode to a blocked IPv4. */
function isBlockedV4Hex(firstPart: number, secondPart: number): boolean {
  const firstOctet = (firstPart >> 8) & 0xff;
  const secondOctet = firstPart & 0xff;
  if (firstOctet === 127 || firstOctet === 10) return true;
  if (firstOctet === 192 && secondOctet === 168) return true;
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) return true;
  if (firstOctet === 169 && secondOctet === 254) return true;
  return firstPart === 0 && secondPart === 0;
}

/**
 * Block IPv4-mapped IPv6 addresses (`::ffff:x.x.x.x`, or Node's normalized hex
 * form `::ffff:7f00:1`) that tunnel to a private/loopback IPv4 and would bypass
 * the IPv4 checks above.
 */
function assertNotMappedV4(host: string, label: string): void {
  if (!host.startsWith('::ffff:') && !host.includes(':ffff:')) return;
  const message = `${label} cannot point to private IPv4-mapped IPv6 addresses`;
  const dotted = host.match(/:ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (dotted) {
    if (isBlockedV4Dotted(dotted[1])) throw new Error(message);
    return;
  }
  const hex = host.match(/:ffff:([0-9a-f]+):([0-9a-f]+)$/i);
  if (hex && isBlockedV4Hex(parseInt(hex[1], 16), parseInt(hex[2], 16))) {
    throw new Error(message);
  }
}

/**
 * Reject hosts in internal/private address space (SSRF blocklist): loopback,
 * RFC-1918 private, link-local + the 169.254.169.254 cloud-metadata endpoint,
 * and the IPv6 equivalents including IPv4-mapped forms.
 *
 * Shared by {@link validateBaseUrl} and {@link validateWebhookUrl} so the two
 * validators can never drift. `label` prefixes the thrown error message.
 */
function assertPublicHost(hostname: string, label: string): void {
  const host = normalizeHost(hostname);
  assertNotLoopbackOrPrivateV4(host, label);
  assertNotPrivateV6(host, label);
  assertNotMappedV4(host, label);
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

  // Block internal/private address space in production (SSRF defense-in-depth,
  // matching validateWebhookUrl). The allowInsecure escape hatch (allowHttp)
  // skips this so localhost/private hosts still work for local development.
  if (!allowHttp) {
    assertPublicHost(parsed.hostname, 'Base URL');
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

  // Block internal/private IPs, loopback, link-local, metadata and IPv6 equivalents.
  assertPublicHost(parsed.hostname, 'Webhook URL');

  return url;
}

/**
 * Check if a key name suggests sensitive data.
 */
function isSensitiveKey(key: string): boolean {
  if (typeof key !== 'string') return false;
  const keyLower = key.toLowerCase().replace(/[_-]/g, '');
  for (const sensitive of SENSITIVE_KEYS) {
    if (keyLower.includes(sensitive.toLowerCase().replace(/[_-]/g, ''))) {
      return true;
    }
  }
  return false;
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
  envVar = 'TRIX_API_KEY',
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
