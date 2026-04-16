/**
 * Tests for ADR-143 health-check ping() on Trix client.
 */

import { Trix } from '../src/client';

function createMockFetch(response: { status: number; body: unknown }): typeof fetch {
  return ((async () =>
    new Response(
      typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
      {
        status: response.status,
        headers: { 'content-type': 'application/json', 'x-api-version': 'v1' },
      }
    )) as unknown) as typeof fetch;
}

describe('Trix.ping()', () => {
  it('returns ok=true + version + latency when server reports ok', async () => {
    const trix = new Trix({
      apiKey: 'test_key',
      fetch: createMockFetch({
        status: 200,
        body: {
          status: 'ok',
          version: '0.6.0',
          uptime: 123.4,
          timestamp: '2026-04-16T09:00:00Z',
        },
      }),
    });

    const result = await trix.ping();

    expect(result.ok).toBe(true);
    expect(result.version).toBe('0.6.0');
    expect(typeof result.latencyMs).toBe('number');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns ok=false when server status is not "ok"', async () => {
    const trix = new Trix({
      apiKey: 'test_key',
      fetch: createMockFetch({
        status: 200,
        body: { status: 'degraded', version: '0.6.0' },
      }),
    });

    const result = await trix.ping();
    expect(result.ok).toBe(false);
    expect(result.version).toBe('0.6.0');
  });

  it('returns ok=false when status field missing', async () => {
    const trix = new Trix({
      apiKey: 'test_key',
      fetch: createMockFetch({
        status: 200,
        body: { uptime: 1.0 },
      }),
    });

    const result = await trix.ping();
    expect(result.ok).toBe(false);
    expect(result.version).toBeUndefined();
  });
});
