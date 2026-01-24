/**
 * Comprehensive tests for Trix TypeScript SDK
 */

import {
  Trix,
  SDK_VERSION,
  API_VERSION,
  MIN_API_VERSION,
  MAX_API_VERSION,
  enableDebugLogging,
  disableDebugLogging,
} from '../src/client';
import {
  TrixError,
  APIError,
  APIVersionMismatchError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
} from '../src/errors';

// Mock fetch for testing
function createMockFetch(response: {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
  ok?: boolean;
}) {
  // Default to application/json content type for successful responses with body
  const defaultHeaders: Record<string, string> = response.body !== undefined
    ? { 'content-type': 'application/json' }
    : {};

  return jest.fn().mockResolvedValue({
    ok: response.ok ?? (response.status >= 200 && response.status < 300),
    status: response.status,
    statusText: response.status === 200 ? 'OK' : 'Error',
    headers: new Headers({ ...defaultHeaders, ...(response.headers ?? {}) }),
    json: jest.fn().mockResolvedValue(response.body ?? {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(response.body ?? {})),
  });
}

describe('Trix Client', () => {
  describe('Initialization', () => {
    it('should initialize with API key', () => {
      const client = new Trix({ apiKey: 'test_key' });
      expect(client).toBeInstanceOf(Trix);
    });

    it('should use default base URL', () => {
      const mockFetch = createMockFetch({ status: 200, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });
      expect(client).toBeDefined();
    });

    it('should accept custom base URL', () => {
      const client = new Trix({
        apiKey: 'test_key',
        baseUrl: 'https://custom.api.com',
      });
      expect(client).toBeDefined();
    });

    it('should accept custom timeout', () => {
      const client = new Trix({
        apiKey: 'test_key',
        timeout: 60000,
      });
      expect(client).toBeDefined();
    });

    it('should accept custom max retries', () => {
      const client = new Trix({
        apiKey: 'test_key',
        maxRetries: 5,
      });
      expect(client).toBeDefined();
    });

    it('should have all resource properties', () => {
      const client = new Trix({ apiKey: 'test_key' });
      expect(client.memories).toBeDefined();
      expect(client.relationships).toBeDefined();
      expect(client.clusters).toBeDefined();
      expect(client.spaces).toBeDefined();
      expect(client.graph).toBeDefined();
      expect(client.search).toBeDefined();
      expect(client.webhooks).toBeDefined();
      expect(client.agent).toBeDefined();
      expect(client.feedback).toBeDefined();
      expect(client.highlights).toBeDefined();
      expect(client.sessions).toBeDefined();
    });
  });

  describe('Version Constants', () => {
    it('should export SDK_VERSION', () => {
      expect(SDK_VERSION).toBeDefined();
      expect(typeof SDK_VERSION).toBe('string');
      expect(SDK_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should export API_VERSION', () => {
      expect(API_VERSION).toBeDefined();
      expect(API_VERSION).toBe('v1');
    });

    it('should export MIN_API_VERSION and MAX_API_VERSION', () => {
      expect(MIN_API_VERSION).toBeDefined();
      expect(MAX_API_VERSION).toBeDefined();
      expect(MIN_API_VERSION).toBe('v1');
      expect(MAX_API_VERSION).toBe('v1');
    });
  });

  describe('Debug Logging', () => {
    it('should enable debug logging with custom logger', () => {
      const mockLogger = jest.fn();
      enableDebugLogging(mockLogger);
      disableDebugLogging();
    });

    it('should enable debug logging with default logger', () => {
      enableDebugLogging();
      disableDebugLogging();
    });

    it('should disable debug logging', () => {
      enableDebugLogging();
      disableDebugLogging();
    });
  });

  describe('Request Headers', () => {
    it('should include Authorization header', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { data: [] } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.list();

      expect(mockFetch).toHaveBeenCalled();
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test_key');
    });

    it('should include SDK version headers', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { data: [] } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.list();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['X-SDK-Version']).toBe(SDK_VERSION);
      expect(options.headers['X-API-Version']).toBe(API_VERSION);
    });

    it('should include User-Agent header', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { data: [] } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.list();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['User-Agent']).toContain('trix-typescript-sdk');
      expect(options.headers['User-Agent']).toContain(SDK_VERSION);
    });

    it('should include Content-Type header', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { id: 'mem_123' } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.create({ content: 'test' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Type']).toBe('application/json');
    });
  });
});

describe('Error Handling', () => {
  describe('Exception Hierarchy', () => {
    it('all exceptions should inherit from TrixError', () => {
      const exceptions = [
        new APIError('test'),
        new APIVersionMismatchError('test', '1.0', 'v2', 'v1', 'v1'),
        new AuthenticationError(),
        new PermissionError(),
        new NotFoundError(),
        new ValidationError(),
        new RateLimitError(),
        new ServerError('test', 500),
        new NetworkError(),
        new TimeoutError(),
      ];

      exceptions.forEach((exc) => {
        expect(exc).toBeInstanceOf(TrixError);
        expect(exc).toBeInstanceOf(Error);
      });
    });

    it('APIVersionMismatchError should include version info', () => {
      const error = new APIVersionMismatchError(
        'Version mismatch',
        '1.0.0',
        'v2',
        'v1',
        'v1'
      );
      expect(error.sdkVersion).toBe('1.0.0');
      expect(error.apiVersion).toBe('v2');
      expect(error.minSupported).toBe('v1');
      expect(error.maxSupported).toBe('v1');
      expect(error.name).toBe('APIVersionMismatchError');
    });

    it('RateLimitError should include retryAfter', () => {
      const error = new RateLimitError('Rate limited', 60);
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('RateLimitError');
    });

    it('ServerError should include statusCode and response', () => {
      const error = new ServerError('Server error', 503, { detail: 'info' });
      expect(error.statusCode).toBe(503);
      expect(error.response).toEqual({ detail: 'info' });
      expect(error.name).toBe('ServerError');
    });

    it('ValidationError should include errors array', () => {
      const errors = [{ field: 'content', message: 'Required' }];
      const error = new ValidationError('Validation failed', errors);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('HTTP Error Response Mapping', () => {
    it('should throw AuthenticationError for 401', async () => {
      const mockFetch = createMockFetch({
        status: 401,
        ok: false,
        body: { message: 'Invalid credentials' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.list()).rejects.toThrow(AuthenticationError);
    });

    it('should throw PermissionError for 403', async () => {
      const mockFetch = createMockFetch({
        status: 403,
        ok: false,
        body: { message: 'Access denied' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.list()).rejects.toThrow(PermissionError);
    });

    it('should throw NotFoundError for 404', async () => {
      const mockFetch = createMockFetch({
        status: 404,
        ok: false,
        body: { message: 'Not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.get('invalid_id')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for 422', async () => {
      const mockFetch = createMockFetch({
        status: 422,
        ok: false,
        body: { message: 'Validation failed', errors: [{ field: 'content' }] },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.create({ content: '' })).rejects.toThrow(ValidationError);
    });

    it('should throw RateLimitError for 429 with retry-after header', async () => {
      const mockFetch = createMockFetch({
        status: 429,
        ok: false,
        headers: { 'retry-after': '60' },
        body: { message: 'Rate limited' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 0 });

      try {
        await client.memories.list();
        fail('Expected RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(60);
      }
    });

    it('should throw ServerError for 500', async () => {
      const mockFetch = createMockFetch({
        status: 500,
        ok: false,
        body: { message: 'Internal server error' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 0 });

      await expect(client.memories.list()).rejects.toThrow(ServerError);
    });

    it('should throw ServerError for 502', async () => {
      const mockFetch = createMockFetch({
        status: 502,
        ok: false,
        body: { message: 'Bad gateway' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 0 });

      await expect(client.memories.list()).rejects.toThrow(ServerError);
    });

    it('should throw ServerError for 503', async () => {
      const mockFetch = createMockFetch({
        status: 503,
        ok: false,
        body: { message: 'Service unavailable' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 0 });

      await expect(client.memories.list()).rejects.toThrow(ServerError);
    });

    it('should throw APIError for unknown status codes', async () => {
      const mockFetch = createMockFetch({
        status: 418,
        ok: false,
        body: { message: "I'm a teapot" },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.list()).rejects.toThrow(APIError);
    });
  });

  describe('API Version Checking', () => {
    it('should pass for compatible API version', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        headers: { 'X-API-Version': 'v1' },
        body: { data: [] },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.list()).resolves.toBeDefined();
    });

    it('should throw APIVersionMismatchError for incompatible version', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        headers: { 'X-API-Version': 'v99' },
        body: { data: [] },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.list()).rejects.toThrow(APIVersionMismatchError);
    });

    it('should pass when no version header is present', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: { data: [] },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.memories.list()).resolves.toBeDefined();
    });

    it('should pass for non-numeric version format', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        headers: { 'X-API-Version': 'invalid' },
        body: { data: [] },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      // Non-numeric versions are ignored
      await expect(client.memories.list()).resolves.toBeDefined();
    });
  });
});

describe('Memories Resource', () => {
  const mockMemory = {
    id: 'mem_123',
    spaceId: 'space_123',
    type: 'text',
    content: 'Test content',
    tags: ['test'],
    metadata: {},
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('create', () => {
    it('should create a memory', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockMemory });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const memory = await client.memories.create({ content: 'Test content' });

      expect(memory.id).toBe('mem_123');
      expect(memory.content).toBe('Test content');
    });

    it('should send correct request body', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockMemory });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.create({
        content: 'Test content',
        type: 'markdown',
        tags: ['tag1', 'tag2'],
        metadata: { key: 'value' },
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.content).toBe('Test content');
      expect(body.type).toBe('markdown');
      expect(body.tags).toEqual(['tag1', 'tag2']);
      expect(body.metadata).toEqual({ key: 'value' });
    });

    it('should use POST method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockMemory });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.create({ content: 'Test content' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
    });
  });

  describe('list', () => {
    it('should list memories', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: { data: [mockMemory], pagination: { total: 1, page: 1, limit: 100, hasMore: false } },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.memories.list();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('mem_123');
    });

    it('should pass query parameters', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: { data: [], pagination: { total: 0, page: 1, limit: 50, hasMore: false } },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.list({ q: 'search', limit: 50, page: 2 });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('q=search');
      expect(url).toContain('limit=50');
      expect(url).toContain('page=2');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: { data: [] },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.list();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });
  });

  describe('get', () => {
    it('should get a memory by ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockMemory });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const memory = await client.memories.get('mem_123');

      expect(memory.id).toBe('mem_123');
    });

    it('should call correct endpoint', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockMemory });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.get('mem_123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/memories/mem_123');
    });
  });

  describe('update', () => {
    it('should update a memory', async () => {
      const updatedMemory = { ...mockMemory, content: 'Updated content' };
      const mockFetch = createMockFetch({ status: 200, body: updatedMemory });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const memory = await client.memories.update('mem_123', { content: 'Updated content' });

      expect(memory.content).toBe('Updated content');
    });

    it('should use PATCH method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockMemory });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.update('mem_123', { content: 'Updated' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PATCH');
    });
  });

  describe('delete', () => {
    it('should delete a memory', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.memories.delete('mem_123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/memories/mem_123');
      expect(options.method).toBe('DELETE');
    });
  });
});

describe('Retry Logic', () => {
  it('should retry on RateLimitError', async () => {
    let callCount = 0;
    const mockFetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ 'retry-after': '0' }),
          json: () => Promise.resolve({ message: 'Rate limited' }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ data: [] }),
      });
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 3 });

    await client.memories.list();

    expect(callCount).toBe(3);
  });

  it('should retry on ServerError', async () => {
    let callCount = 0;
    const mockFetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 2) {
        return Promise.resolve({
          ok: false,
          status: 503,
          headers: new Headers(),
          json: () => Promise.resolve({ message: 'Service unavailable' }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ data: [] }),
      });
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 3 });

    await client.memories.list();

    expect(callCount).toBe(2);
  });

  it('should not retry on AuthenticationError', async () => {
    let callCount = 0;
    const mockFetch = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 3 });

    await expect(client.memories.list()).rejects.toThrow(AuthenticationError);
    expect(callCount).toBe(1);
  });

  it('should not retry on ValidationError', async () => {
    let callCount = 0;
    const mockFetch = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: 422,
        headers: new Headers(),
        json: () => Promise.resolve({ message: 'Validation failed' }),
      });
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 3 });

    await expect(client.memories.create({ content: '' })).rejects.toThrow(ValidationError);
    expect(callCount).toBe(1);
  });

  it('should exhaust retries and throw', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers(),
      json: () => Promise.resolve({ message: 'Service unavailable' }),
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 2 });

    await expect(client.memories.list()).rejects.toThrow(ServerError);
    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});

describe('Relationships Resource', () => {
  const mockRelationship = {
    id: 'rel_123',
    sourceId: 'mem_123',
    targetId: 'mem_456',
    relationshipType: 'related_to',
    strength: 0.8,
    metadata: {},
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  it('should create a relationship', async () => {
    const mockFetch = createMockFetch({ status: 200, body: mockRelationship });
    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

    const relationship = await client.relationships.create('mem_123', 'mem_456', {
      relationshipType: 'related_to',
      strength: 0.8,
    });

    expect(relationship.sourceId).toBe('mem_123');
    expect(relationship.targetId).toBe('mem_456');
  });
});

describe('Clusters Resource', () => {
  const mockCluster = {
    id: 'cluster_123',
    spaceId: 'space_123',
    name: 'Test Cluster',
    description: 'A test cluster',
    memoryIds: [],
    metadata: {},
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  it('should create a cluster', async () => {
    const mockFetch = createMockFetch({ status: 200, body: mockCluster });
    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

    const cluster = await client.clusters.create({
      name: 'Test Cluster',
      description: 'A test cluster',
    });

    expect(cluster.name).toBe('Test Cluster');
  });
});
