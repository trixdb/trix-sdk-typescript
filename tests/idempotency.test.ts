/**
 * Tests for automatic Idempotency-Key injection on mutating requests (#3).
 *
 * The transport auto-retries POST/PUT/PATCH/DELETE on transient 5xx / network /
 * timeout errors. Each logical mutating request must carry a single, stable
 * Idempotency-Key across ALL retry attempts so trix-api replays the first
 * response instead of duplicating the write. GETs must NOT carry one.
 */

import { Trix } from '../src/client';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idempotencyKeyOf(call: unknown[]): string | undefined {
  const options = call[1] as { headers: Record<string, string> };
  return options.headers['Idempotency-Key'];
}

describe('Idempotency-Key injection', () => {
  it('sends the SAME key on both attempts when a POST is retried after a 500', async () => {
    let callCount = 0;
    const mockFetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ message: 'transient' }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ id: 'mem_1' }),
      });
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch, maxRetries: 3 });
    await client.memories.create({ content: 'hello' });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const firstKey = idempotencyKeyOf(mockFetch.mock.calls[0]);
    const secondKey = idempotencyKeyOf(mockFetch.mock.calls[1]);

    expect(firstKey).toMatch(UUID_V4); // real UUID, not Math.random
    expect(secondKey).toBe(firstKey); // stable across the retry
  });

  it('does NOT send an Idempotency-Key on a GET (safe to replay)', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: [] }),
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });
    await client.memories.list();

    expect(idempotencyKeyOf(mockFetch.mock.calls[0])).toBeUndefined();
  });

  it('generates a distinct key per logical request', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ id: 'mem_x' }),
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });
    await client.memories.create({ content: 'a' });
    await client.memories.create({ content: 'b' });

    const keyA = idempotencyKeyOf(mockFetch.mock.calls[0]);
    const keyB = idempotencyKeyOf(mockFetch.mock.calls[1]);
    expect(keyA).toMatch(UUID_V4);
    expect(keyB).toMatch(UUID_V4);
    expect(keyA).not.toBe(keyB);
  });

  it('preserves a caller-supplied Idempotency-Key (case-insensitive)', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ id: 'mem_y' }),
    });

    const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });
    await client.request({
      method: 'POST',
      path: '/memories',
      body: { content: 'z' },
      headers: { 'idempotency-key': 'caller-key-123' },
    });

    // The auto-generated key must not clobber the caller's lower-cased one.
    const headers = (mockFetch.mock.calls[0][1] as { headers: Record<string, string> }).headers;
    expect(headers['idempotency-key']).toBe('caller-key-123');
    expect(headers['Idempotency-Key']).toBeUndefined();
  });
});
