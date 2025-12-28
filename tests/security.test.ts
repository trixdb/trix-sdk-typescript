/**
 * TDD-style tests for security utilities
 * Tests written first, then implementation verified
 */

import {
  validateId,
  validateBaseUrl,
  validateWebhookUrl,
  redactSensitiveData,
  getEnvCredential,
  maskCredential,
} from '../src/utils/security';

describe('validateId', () => {
  describe('valid IDs', () => {
    it('should accept alphanumeric IDs', () => {
      expect(validateId('mem123')).toBe('mem123');
      expect(validateId('MEM123')).toBe('MEM123');
      expect(validateId('abc')).toBe('abc');
    });

    it('should accept IDs with underscores', () => {
      expect(validateId('mem_123')).toBe('mem_123');
      expect(validateId('my_memory_id')).toBe('my_memory_id');
    });

    it('should accept IDs with hyphens', () => {
      expect(validateId('mem-123')).toBe('mem-123');
      expect(validateId('my-memory-id')).toBe('my-memory-id');
    });

    it('should accept IDs with mixed characters', () => {
      expect(validateId('mem_123-abc')).toBe('mem_123-abc');
      expect(validateId('MEM-123_ABC')).toBe('MEM-123_ABC');
    });

    it('should accept single character IDs', () => {
      expect(validateId('a')).toBe('a');
      expect(validateId('1')).toBe('1');
    });

    it('should accept 255 character IDs', () => {
      const longId = 'a'.repeat(255);
      expect(validateId(longId)).toBe(longId);
    });
  });

  describe('invalid IDs - empty/null', () => {
    it('should reject empty string', () => {
      expect(() => validateId('')).toThrow(/cannot be empty/);
    });

    it('should reject null-like values', () => {
      expect(() => validateId(null as unknown as string)).toThrow();
      expect(() => validateId(undefined as unknown as string)).toThrow();
    });
  });

  describe('invalid IDs - path traversal', () => {
    it('should reject IDs with double dots', () => {
      expect(() => validateId('..')).toThrow(/path traversal/);
      expect(() => validateId('mem/../etc')).toThrow(/path traversal/);
      expect(() => validateId('..mem')).toThrow(/path traversal/);
    });

    it('should reject IDs with forward slashes', () => {
      expect(() => validateId('mem/123')).toThrow(/path traversal/);
      expect(() => validateId('/mem')).toThrow(/path traversal/);
      expect(() => validateId('mem/')).toThrow(/path traversal/);
    });

    it('should reject IDs with backslashes', () => {
      expect(() => validateId('mem\\123')).toThrow(/path traversal/);
      expect(() => validateId('\\mem')).toThrow(/path traversal/);
    });
  });

  describe('invalid IDs - special characters', () => {
    it('should reject IDs with spaces', () => {
      expect(() => validateId('mem 123')).toThrow();
    });

    it('should reject IDs with periods (except in ..)', () => {
      expect(() => validateId('mem.123')).toThrow();
    });

    it('should reject IDs with special characters', () => {
      expect(() => validateId('mem@123')).toThrow();
      expect(() => validateId('mem#123')).toThrow();
      expect(() => validateId('mem$123')).toThrow();
      expect(() => validateId('mem%123')).toThrow();
    });

    it('should reject IDs exceeding 255 characters', () => {
      const tooLongId = 'a'.repeat(256);
      expect(() => validateId(tooLongId)).toThrow();
    });
  });

  describe('custom resource type in error messages', () => {
    it('should include resource type in error message', () => {
      expect(() => validateId('', 'memory')).toThrow(/memory ID cannot be empty/);
      expect(() => validateId('', 'cluster')).toThrow(/cluster ID cannot be empty/);
    });
  });
});

describe('validateBaseUrl', () => {
  describe('valid URLs', () => {
    it('should accept HTTPS URLs', () => {
      expect(validateBaseUrl('https://api.example.com')).toBe('https://api.example.com');
    });

    it('should accept HTTPS URLs with port', () => {
      expect(validateBaseUrl('https://api.example.com:8443')).toBe('https://api.example.com:8443');
    });

    it('should accept HTTPS URLs with path', () => {
      expect(validateBaseUrl('https://api.example.com/v1')).toBe('https://api.example.com/v1');
    });

    it('should strip trailing slashes', () => {
      expect(validateBaseUrl('https://api.example.com/')).toBe('https://api.example.com');
      expect(validateBaseUrl('https://api.example.com///')).toBe('https://api.example.com');
    });
  });

  describe('HTTP URLs', () => {
    it('should reject HTTP by default', () => {
      expect(() => validateBaseUrl('http://api.example.com')).toThrow(/HTTP is not allowed/);
    });

    it('should allow HTTP when allowHttp is true', () => {
      expect(validateBaseUrl('http://localhost:3000', true)).toBe('http://localhost:3000');
    });
  });

  describe('localhost URLs', () => {
    it('should reject localhost without allowHttp', () => {
      expect(() => validateBaseUrl('https://localhost')).toThrow(/Localhost/);
      expect(() => validateBaseUrl('https://127.0.0.1')).toThrow(/Localhost/);
      expect(() => validateBaseUrl('https://[::1]')).toThrow(/Localhost/);
      expect(() => validateBaseUrl('https://0.0.0.0')).toThrow(/Localhost/);
    });

    it('should allow localhost with allowHttp', () => {
      expect(validateBaseUrl('http://localhost:3000', true)).toBe('http://localhost:3000');
      expect(validateBaseUrl('http://127.0.0.1:3000', true)).toBe('http://127.0.0.1:3000');
    });
  });

  describe('invalid URLs', () => {
    it('should reject empty URL', () => {
      expect(() => validateBaseUrl('')).toThrow(/cannot be empty/);
    });

    it('should reject invalid URL format', () => {
      expect(() => validateBaseUrl('not-a-url')).toThrow(/Invalid URL/);
    });

    it('should reject unsupported schemes', () => {
      expect(() => validateBaseUrl('ftp://api.example.com')).toThrow(/Invalid URL scheme/);
      expect(() => validateBaseUrl('file:///path')).toThrow(/Invalid URL scheme/);
    });
  });
});

describe('validateWebhookUrl', () => {
  describe('valid webhook URLs', () => {
    it('should accept HTTPS URLs', () => {
      expect(validateWebhookUrl('https://webhook.example.com')).toBe('https://webhook.example.com');
    });

    it('should accept HTTPS URLs with paths', () => {
      expect(validateWebhookUrl('https://example.com/webhook')).toBe('https://example.com/webhook');
    });

    it('should accept HTTPS URLs with query strings', () => {
      expect(validateWebhookUrl('https://example.com/webhook?key=value')).toBe('https://example.com/webhook?key=value');
    });
  });

  describe('blocked - localhost', () => {
    it('should reject localhost', () => {
      expect(() => validateWebhookUrl('https://localhost/webhook')).toThrow(/localhost/);
    });

    it('should reject 0.0.0.0', () => {
      expect(() => validateWebhookUrl('https://0.0.0.0/webhook')).toThrow(/localhost/);
    });

    it('should reject IPv4 loopback (127.x.x.x)', () => {
      expect(() => validateWebhookUrl('https://127.0.0.1/webhook')).toThrow(/localhost/);
      expect(() => validateWebhookUrl('https://127.1.2.3/webhook')).toThrow(/localhost/);
      expect(() => validateWebhookUrl('https://127.255.255.255/webhook')).toThrow(/localhost/);
    });

    it('should reject IPv6 loopback (::1)', () => {
      expect(() => validateWebhookUrl('https://[::1]/webhook')).toThrow(/localhost/);
    });
  });

  describe('blocked - private IPv4 ranges', () => {
    it('should reject 10.x.x.x (10.0.0.0/8)', () => {
      expect(() => validateWebhookUrl('https://10.0.0.1/webhook')).toThrow(/private IP/);
      expect(() => validateWebhookUrl('https://10.255.255.255/webhook')).toThrow(/private IP/);
    });

    it('should reject 192.168.x.x (192.168.0.0/16)', () => {
      expect(() => validateWebhookUrl('https://192.168.0.1/webhook')).toThrow(/private IP/);
      expect(() => validateWebhookUrl('https://192.168.255.255/webhook')).toThrow(/private IP/);
    });

    it('should reject 172.16-31.x.x (172.16.0.0/12)', () => {
      expect(() => validateWebhookUrl('https://172.16.0.1/webhook')).toThrow(/private IP/);
      expect(() => validateWebhookUrl('https://172.31.255.255/webhook')).toThrow(/private IP/);
      expect(() => validateWebhookUrl('https://172.20.0.1/webhook')).toThrow(/private IP/);
    });

    it('should allow 172.15.x.x and 172.32.x.x (outside /12 range)', () => {
      // These are technically public IPs
      expect(() => validateWebhookUrl('https://172.15.0.1/webhook')).not.toThrow(/private IP/);
      expect(() => validateWebhookUrl('https://172.32.0.1/webhook')).not.toThrow(/private IP/);
    });
  });

  describe('blocked - link-local addresses', () => {
    it('should reject 169.254.x.x (169.254.0.0/16)', () => {
      expect(() => validateWebhookUrl('https://169.254.0.1/webhook')).toThrow(/link-local/);
      expect(() => validateWebhookUrl('https://169.254.255.255/webhook')).toThrow(/link-local/);
    });

    it('should reject metadata service (169.254.169.254)', () => {
      expect(() => validateWebhookUrl('https://169.254.169.254/webhook')).toThrow();
    });
  });

  describe('blocked - IPv6 private ranges', () => {
    it('should reject fc00::/7 (Unique Local Addresses)', () => {
      expect(() => validateWebhookUrl('https://[fc00::1]/webhook')).toThrow(/private IPv6/);
      expect(() => validateWebhookUrl('https://[fd00::1]/webhook')).toThrow(/private IPv6/);
    });

    it('should reject fe80::/10 (Link-local)', () => {
      expect(() => validateWebhookUrl('https://[fe80::1]/webhook')).toThrow(/link-local/);
      expect(() => validateWebhookUrl('https://[fe90::1]/webhook')).toThrow(/link-local/);
      expect(() => validateWebhookUrl('https://[fea0::1]/webhook')).toThrow(/link-local/);
      expect(() => validateWebhookUrl('https://[feb0::1]/webhook')).toThrow(/link-local/);
    });

    it('should reject fec0::/10 (deprecated site-local)', () => {
      expect(() => validateWebhookUrl('https://[fec0::1]/webhook')).toThrow(/site-local/);
      expect(() => validateWebhookUrl('https://[fed0::1]/webhook')).toThrow(/site-local/);
      expect(() => validateWebhookUrl('https://[fee0::1]/webhook')).toThrow(/site-local/);
      expect(() => validateWebhookUrl('https://[fef0::1]/webhook')).toThrow(/site-local/);
    });
  });

  describe('blocked - IPv6 zero address', () => {
    it('should reject :: (zero address)', () => {
      expect(() => validateWebhookUrl('https://[::]/webhook')).toThrow(/zero address/);
    });

    it('should reject expanded zero address', () => {
      expect(() => validateWebhookUrl('https://[0:0:0:0:0:0:0:0]/webhook')).toThrow(/zero address/);
    });
  });

  describe('blocked - IPv4-mapped IPv6 addresses', () => {
    it('should reject ::ffff: with private IPv4', () => {
      expect(() => validateWebhookUrl('https://[::ffff:127.0.0.1]/webhook')).toThrow(/IPv4-mapped/);
      expect(() => validateWebhookUrl('https://[::ffff:10.0.0.1]/webhook')).toThrow(/IPv4-mapped/);
      expect(() => validateWebhookUrl('https://[::ffff:192.168.1.1]/webhook')).toThrow(/IPv4-mapped/);
      expect(() => validateWebhookUrl('https://[::ffff:172.16.0.1]/webhook')).toThrow(/IPv4-mapped/);
      expect(() => validateWebhookUrl('https://[::ffff:169.254.1.1]/webhook')).toThrow(/IPv4-mapped/);
    });
  });

  describe('blocked - non-HTTPS', () => {
    it('should reject HTTP', () => {
      expect(() => validateWebhookUrl('http://example.com/webhook')).toThrow(/HTTPS/);
    });

    it('should reject other schemes', () => {
      expect(() => validateWebhookUrl('ftp://example.com/webhook')).toThrow(/HTTPS/);
    });
  });
});

describe('redactSensitiveData', () => {
  describe('redacts sensitive keys', () => {
    it('should redact api_key', () => {
      const data = { api_key: 'secret123', name: 'test' };
      const result = redactSensitiveData(data) as Record<string, unknown>;
      expect(result.api_key).toBe('[REDACTED]');
      expect(result.name).toBe('test');
    });

    it('should redact various key formats', () => {
      const data = {
        apiKey: 'secret1',
        api_key: 'secret2',
        'api-key': 'secret3',
        token: 'secret4',
        jwt_token: 'secret5',
        password: 'secret6',
        secret: 'secret7',
        authorization: 'secret8',
      };
      const result = redactSensitiveData(data) as Record<string, unknown>;

      expect(result.apiKey).toBe('[REDACTED]');
      expect(result.api_key).toBe('[REDACTED]');
      expect(result['api-key']).toBe('[REDACTED]');
      expect(result.token).toBe('[REDACTED]');
      expect(result.jwt_token).toBe('[REDACTED]');
      expect(result.password).toBe('[REDACTED]');
      expect(result.secret).toBe('[REDACTED]');
      expect(result.authorization).toBe('[REDACTED]');
    });
  });

  describe('handles nested objects', () => {
    it('should redact in nested objects', () => {
      const data = {
        config: {
          api_key: 'secret',
          name: 'test',
        },
      };
      const result = redactSensitiveData(data) as { config: Record<string, unknown> };
      expect(result.config.api_key).toBe('[REDACTED]');
      expect(result.config.name).toBe('test');
    });
  });

  describe('handles arrays', () => {
    it('should redact in arrays', () => {
      const data = [
        { api_key: 'secret1', name: 'test1' },
        { api_key: 'secret2', name: 'test2' },
      ];
      const result = redactSensitiveData(data) as Array<Record<string, unknown>>;
      expect(result[0].api_key).toBe('[REDACTED]');
      expect(result[0].name).toBe('test1');
      expect(result[1].api_key).toBe('[REDACTED]');
    });
  });

  describe('handles Bearer tokens', () => {
    it('should redact Bearer tokens in strings', () => {
      const result = redactSensitiveData('Bearer abc123xyz');
      expect(result).toBe('Bearer [REDACTED]');
    });

    it('should not modify non-Bearer strings', () => {
      const result = redactSensitiveData('normal string');
      expect(result).toBe('normal string');
    });
  });

  describe('handles max depth', () => {
    it('should stop at max depth', () => {
      const deepObj = { a: { b: { c: { d: { e: 'value' } } } } };
      const result = redactSensitiveData(deepObj, 2) as { a: { b: string } };
      expect(result.a.b).toBe('[MAX DEPTH EXCEEDED]');
    });
  });

  describe('handles primitives', () => {
    it('should return primitives unchanged', () => {
      expect(redactSensitiveData(123)).toBe(123);
      expect(redactSensitiveData(true)).toBe(true);
      expect(redactSensitiveData(null)).toBe(null);
      expect(redactSensitiveData(undefined)).toBe(undefined);
    });
  });
});

describe('maskCredential', () => {
  it('should mask all but last 4 characters by default', () => {
    expect(maskCredential('secretkey123')).toBe('********y123');
  });

  it('should mask with custom visible characters', () => {
    expect(maskCredential('secretkey123', 6)).toBe('******key123');
  });

  it('should handle short credentials', () => {
    expect(maskCredential('abc')).toBe('***');
    expect(maskCredential('ab')).toBe('**');
  });

  it('should handle empty credential', () => {
    expect(maskCredential('')).toBe('[EMPTY]');
  });

  it('should handle credential exactly equal to visible chars', () => {
    expect(maskCredential('abcd', 4)).toBe('****');
  });
});

describe('getEnvCredential', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should get credential from environment', () => {
    process.env.TRIX_API_KEY = 'test_key';
    expect(getEnvCredential('TRIX_API_KEY')).toBe('test_key');
  });

  it('should trim whitespace', () => {
    process.env.TRIX_API_KEY = '  test_key  ';
    expect(getEnvCredential('TRIX_API_KEY')).toBe('test_key');
  });

  it('should throw when required and not set', () => {
    delete process.env.TRIX_API_KEY;
    expect(() => getEnvCredential('TRIX_API_KEY', true)).toThrow(/not set/);
  });

  it('should return undefined when not required and not set', () => {
    delete process.env.TRIX_API_KEY;
    expect(getEnvCredential('TRIX_API_KEY', false)).toBeUndefined();
  });

  it('should throw when required and empty', () => {
    process.env.TRIX_API_KEY = '   ';
    expect(() => getEnvCredential('TRIX_API_KEY', true)).toThrow();
  });
});
