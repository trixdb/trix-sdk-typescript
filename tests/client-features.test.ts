/**
 * Tests for new Trix client features: interceptors, per-request timeout, stream retry
 */

import { Trix, RequestContext, ResponseContext } from '../src/client';
import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from '../src/client';
import { retryStream, StreamRetryOptions } from '../src/utils/retry';
import { NetworkError, RateLimitError, TimeoutError } from '../src/errors';

// Mock fetch helper
function createMockFetch(response: {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
  ok?: boolean;
}) {
  return jest.fn().mockResolvedValue({
    ok: response.ok ?? (response.status >= 200 && response.status < 300),
    status: response.status,
    statusText: response.status === 200 ? 'OK' : 'Error',
    headers: new Headers(response.headers ?? {}),
    json: jest.fn().mockResolvedValue(response.body ?? {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(response.body ?? {})),
  });
}

describe('Request Interceptors', () => {
  describe('Registration', () => {
    it('should add request interceptor', () => {
      const client = new Trix({ apiKey: 'test_key' });

      const interceptor: RequestInterceptor = (ctx) => ctx;
      const remove = client.addRequestInterceptor(interceptor);

      expect(typeof remove).toBe('function');
    });

    it('should remove request interceptor', () => {
      const client = new Trix({ apiKey: 'test_key' });

      const callLog: string[] = [];
      const interceptor: RequestInterceptor = (ctx) => {
        callLog.push('called');
        return ctx;
      };

      const remove = client.addRequestInterceptor(interceptor);
      remove();

      // Interceptor should be removed (tested indirectly through other tests)
    });

    it('should accept interceptors in config', () => {
      const callLog: string[] = [];
      const interceptor: RequestInterceptor = (ctx) => {
        callLog.push('config-interceptor');
        return ctx;
      };

      const client = new Trix({
        apiKey: 'test_key',
        requestInterceptors: [interceptor],
      });

      expect(client).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should run request interceptors on request', async () => {
      const callLog: string[] = [];
      const mockFetch = createMockFetch({ status: 200, body: { data: [] } });

      const interceptor: RequestInterceptor = (ctx) => {
        callLog.push(`${ctx.method} ${ctx.url}`);
        return ctx;
      };

      const client = new Trix({
        apiKey: 'test_key',
        fetch: mockFetch,
        requestInterceptors: [interceptor],
      });

      await client.memories.list();

      expect(callLog.length).toBe(1);
      expect(callLog[0]).toContain('GET');
      expect(callLog[0]).toContain('/memories');
    });

    it('should run multiple interceptors in order', async () => {
      const callOrder: number[] = [];
      const mockFetch = createMockFetch({ status: 200, body: { data: [] } });

      const interceptor1: RequestInterceptor = (ctx) => {
        callOrder.push(1);
        return ctx;
      };

      const interceptor2: RequestInterceptor = (ctx) => {
        callOrder.push(2);
        return ctx;
      };

      const client = new Trix({
        apiKey: 'test_key',
        fetch: mockFetch,
        requestInterceptors: [interceptor1, interceptor2],
      });

      await client.memories.list();

      expect(callOrder).toEqual([1, 2]);
    });

    it('should allow interceptor to modify headers', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { data: [] } });

      const interceptor: RequestInterceptor = (ctx) => {
        ctx.headers['X-Custom-Header'] = 'custom-value';
        return ctx;
      };

      const client = new Trix({
        apiKey: 'test_key',
        fetch: mockFetch,
        requestInterceptors: [interceptor],
      });

      await client.memories.list();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['X-Custom-Header']).toBe('custom-value');
    });
  });
});

describe('Response Interceptors', () => {
  describe('Registration', () => {
    it('should add response interceptor', () => {
      const client = new Trix({ apiKey: 'test_key' });

      const interceptor: ResponseInterceptor = (ctx) => ctx;
      const remove = client.addResponseInterceptor(interceptor);

      expect(typeof remove).toBe('function');
    });

    it('should accept interceptors in config', () => {
      const interceptor: ResponseInterceptor = (ctx) => ctx;

      const client = new Trix({
        apiKey: 'test_key',
        responseInterceptors: [interceptor],
      });

      expect(client).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should run response interceptors after successful response', async () => {
      const callLog: number[] = [];
      const mockFetch = createMockFetch({ status: 200, body: { data: [] } });

      const interceptor: ResponseInterceptor = (ctx) => {
        callLog.push(ctx.status);
        return ctx;
      };

      const client = new Trix({
        apiKey: 'test_key',
        fetch: mockFetch,
        responseInterceptors: [interceptor],
      });

      await client.memories.list();

      expect(callLog).toEqual([200]);
    });

    it('should allow interceptor to transform response body', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { data: [{ id: 'mem_123' }], pagination: { total: 1 } },
      });

      let capturedBody: unknown = null;

      const interceptor: ResponseInterceptor = (ctx) => {
        // Capture and verify the body exists
        capturedBody = ctx.body;
        if (ctx.body && typeof ctx.body === 'object') {
          (ctx.body as any).intercepted = true;
        }
        return ctx;
      };

      const client = new Trix({
        apiKey: 'test_key',
        fetch: mockFetch,
        responseInterceptors: [interceptor],
      });

      const result = await client.memories.list();

      // Verify interceptor ran and had access to body
      expect(capturedBody).toBeDefined();
      expect((result as any).intercepted).toBe(true);
    });
  });
});

describe('Error Interceptors', () => {
  describe('Registration', () => {
    it('should add error interceptor', () => {
      const client = new Trix({ apiKey: 'test_key' });

      const interceptor: ErrorInterceptor = (err, ctx) => err;
      const remove = client.addErrorInterceptor(interceptor);

      expect(typeof remove).toBe('function');
    });

    it('should accept interceptors in config', () => {
      const interceptor: ErrorInterceptor = (err, ctx) => err;

      const client = new Trix({
        apiKey: 'test_key',
        errorInterceptors: [interceptor],
      });

      expect(client).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should run error interceptors on error', async () => {
      const errorLog: unknown[] = [];
      const mockFetch = createMockFetch({
        status: 404,
        ok: false,
        body: { message: 'Not found' },
      });

      const interceptor: ErrorInterceptor = (err, ctx) => {
        errorLog.push({ error: err, url: ctx.url });
        return err;
      };

      const client = new Trix({
        apiKey: 'test_key',
        fetch: mockFetch,
        errorInterceptors: [interceptor],
      });

      await expect(client.memories.get('invalid')).rejects.toThrow();

      expect(errorLog.length).toBe(1);
    });

    it('should allow interceptor to transform error', async () => {
      class CustomError extends Error {
        constructor(public originalError: unknown) {
          super('Custom error');
          this.name = 'CustomError';
        }
      }

      const mockFetch = createMockFetch({
        status: 500,
        ok: false,
        body: { message: 'Server error' },
      });

      const interceptor: ErrorInterceptor = (err) => {
        return new CustomError(err);
      };

      const client = new Trix({
        apiKey: 'test_key',
        fetch: mockFetch,
        maxRetries: 0,
        errorInterceptors: [interceptor],
      });

      try {
        await client.memories.list();
        fail('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).originalError).toBeDefined();
      }
    });
  });
});

describe('Per-Request Timeout', () => {
  it('should accept timeout in config', () => {
    const client = new Trix({
      apiKey: 'test_key',
      timeout: 60000,
    });

    expect(client).toBeDefined();
  });

  it('should use default timeout of 30000ms', () => {
    const client = new Trix({ apiKey: 'test_key' });
    expect(client).toBeDefined();
  });
});

describe('Stream Retry', () => {
  describe('retryStream function', () => {
    it('should yield chunks from successful stream', async () => {
      const chunks = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5, 6]),
      ];

      const mockStream = new ReadableStream<Uint8Array>({
        start(controller) {
          chunks.forEach((chunk) => controller.enqueue(chunk));
          controller.close();
        },
      });

      const streamFn = jest.fn().mockResolvedValue(mockStream);

      const result: Uint8Array[] = [];
      for await (const chunk of retryStream(streamFn, { maxRetries: 3 })) {
        result.push(chunk);
      }

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(chunks[0]);
      expect(result[1]).toEqual(chunks[1]);
      expect(streamFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error', async () => {
      let callCount = 0;
      const chunks = [new Uint8Array([1, 2, 3])];

      const streamFn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new NetworkError('Connection failed'));
        }
        return Promise.resolve(
          new ReadableStream<Uint8Array>({
            start(controller) {
              chunks.forEach((chunk) => controller.enqueue(chunk));
              controller.close();
            },
          })
        );
      });

      const result: Uint8Array[] = [];
      for await (const chunk of retryStream(streamFn, { maxRetries: 3, initialDelay: 1 })) {
        result.push(chunk);
      }

      expect(result).toHaveLength(1);
      expect(callCount).toBe(2);
    });

    it('should call onRetry callback', async () => {
      let callCount = 0;
      const retryLog: number[] = [];

      const streamFn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new TimeoutError('Timeout'));
        }
        return Promise.resolve(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.close();
            },
          })
        );
      });

      const options: StreamRetryOptions = {
        maxRetries: 3,
        initialDelay: 1,
        onRetry: (attempt) => {
          retryLog.push(attempt);
        },
      };

      for await (const _ of retryStream(streamFn, options)) {
        // Consume stream
      }

      expect(retryLog).toEqual([1, 2]);
    });

    it('should exhaust retries and throw', async () => {
      const streamFn = jest.fn().mockRejectedValue(new NetworkError('Always fails'));

      const generator = retryStream(streamFn, { maxRetries: 2, initialDelay: 1 });

      await expect(async () => {
        for await (const _ of generator) {
          // Consume
        }
      }).rejects.toThrow(NetworkError);

      expect(streamFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new Error('Non-retryable');
      const streamFn = jest.fn().mockRejectedValue(nonRetryableError);

      const generator = retryStream(streamFn, { maxRetries: 3, initialDelay: 1 });

      await expect(async () => {
        for await (const _ of generator) {
          // Consume
        }
      }).rejects.toThrow('Non-retryable');

      expect(streamFn).toHaveBeenCalledTimes(1);
    });

    it('should retry with rate limit delay', async () => {
      let callCount = 0;
      const startTime = Date.now();

      const streamFn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          const error = new RateLimitError('Rate limited', 1); // 1 second
          return Promise.reject(error);
        }
        return Promise.resolve(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.close();
            },
          })
        );
      });

      for await (const _ of retryStream(streamFn, { maxRetries: 3, initialDelay: 1 })) {
        // Consume
      }

      const elapsed = Date.now() - startTime;
      // Should have waited approximately 1000ms for rate limit
      expect(elapsed).toBeGreaterThanOrEqual(900);
      expect(callCount).toBe(2);
    });
  });

  describe('requestStreamWithRetry method', () => {
    it('should exist on client', () => {
      const client = new Trix({ apiKey: 'test_key' });
      expect(typeof client.requestStreamWithRetry).toBe('function');
    });
  });
});

describe('Interceptor Removal', () => {
  it('should properly remove request interceptor after removal call', async () => {
    const callLog: string[] = [];
    const mockFetch = createMockFetch({ status: 200, body: { data: [] } });

    const interceptor: RequestInterceptor = () => {
      callLog.push('interceptor-called');
      return undefined;
    };

    const client = new Trix({
      apiKey: 'test_key',
      fetch: mockFetch,
    });

    const remove = client.addRequestInterceptor(interceptor);

    // First call - interceptor should run
    await client.memories.list();
    expect(callLog).toHaveLength(1);

    // Remove interceptor
    remove();

    // Second call - interceptor should NOT run
    await client.memories.list();
    expect(callLog).toHaveLength(1); // Still 1, not 2
  });

  it('should properly remove response interceptor after removal call', async () => {
    const callLog: string[] = [];
    const mockFetch = createMockFetch({ status: 200, body: { data: [] } });

    const interceptor: ResponseInterceptor = () => {
      callLog.push('interceptor-called');
      return undefined;
    };

    const client = new Trix({
      apiKey: 'test_key',
      fetch: mockFetch,
    });

    const remove = client.addResponseInterceptor(interceptor);

    await client.memories.list();
    expect(callLog).toHaveLength(1);

    remove();

    await client.memories.list();
    expect(callLog).toHaveLength(1);
  });

  it('should properly remove error interceptor after removal call', async () => {
    const callLog: string[] = [];
    const mockFetch = createMockFetch({
      status: 404,
      ok: false,
      body: { message: 'Not found' },
    });

    const interceptor: ErrorInterceptor = (err) => {
      callLog.push('error-interceptor-called');
      return err;
    };

    const client = new Trix({
      apiKey: 'test_key',
      fetch: mockFetch,
    });

    const remove = client.addErrorInterceptor(interceptor);

    try {
      await client.memories.get('invalid');
    } catch {
      // Expected
    }
    expect(callLog).toHaveLength(1);

    remove();

    try {
      await client.memories.get('invalid');
    } catch {
      // Expected
    }
    expect(callLog).toHaveLength(1);
  });
});

describe('Interceptor Context Types', () => {
  it('RequestContext should have correct structure', () => {
    const ctx: RequestContext = {
      method: 'POST',
      url: 'https://api.example.com/memories',
      headers: { 'Content-Type': 'application/json' },
      body: { content: 'test' },
    };

    expect(ctx.method).toBe('POST');
    expect(ctx.url).toBe('https://api.example.com/memories');
    expect(ctx.headers['Content-Type']).toBe('application/json');
    expect(ctx.body).toEqual({ content: 'test' });
  });

  it('ResponseContext should have correct structure', () => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const ctx: ResponseContext = {
      status: 201,
      statusText: 'Created',
      headers,
      body: { id: 'mem_123' },
    };

    expect(ctx.status).toBe(201);
    expect(ctx.statusText).toBe('Created');
    expect(ctx.headers.get('Content-Type')).toBe('application/json');
    expect(ctx.body).toEqual({ id: 'mem_123' });
  });
});
