/**
 * Response body limits (#10).
 *
 * The 50 MB cap previously only inspected the `content-length` header, so a
 * chunked/streamed response with no `content-length` bypassed it and went
 * straight to `response.json()`; and the streaming path cleared its timeout as
 * soon as headers arrived, leaving a stalled body with no deadline.
 */

import {
  MAX_RESPONSE_SIZE,
  readJsonWithCap,
  withInactivityTimeout,
} from '../src/utils/response-limits';
import { handleResponse } from '../src/client-request';
import { APIError, TimeoutError } from '../src/errors';

const encoder = new TextEncoder();

/** A single-chunk byte stream that then closes. */
function streamOf(text: string): ReadableStream<Uint8Array> {
  const bytes = encoder.encode(text);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

/** A multi-chunk byte stream (no content-length), then closes. */
function chunkedStreamOf(chunks: string[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

function jsonStreamResponse(obj: unknown): Response {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    body: streamOf(JSON.stringify(obj)),
  } as unknown as Response;
}

describe('readJsonWithCap', () => {
  it('has a 50 MB default cap', () => {
    expect(MAX_RESPONSE_SIZE).toBe(50 * 1024 * 1024);
  });

  it('parses a chunked JSON body with no content-length', async () => {
    const body = chunkedStreamOf(['{"a":', '1,"b"', ':2}']);
    const data = await readJsonWithCap({ body } as unknown as Response);
    expect(data).toEqual({ a: 1, b: 2 });
  });

  it('enforces the cap WHILE reading (chunked, no content-length) — the #10 bypass', async () => {
    // 200 bytes streamed with no content-length header; a 100-byte cap must
    // still reject it instead of buffering the whole (potentially huge) body.
    const body = streamOf('x'.repeat(200));
    await expect(readJsonWithCap({ body } as unknown as Response, 100)).rejects.toThrow(APIError);
    await expect(readJsonWithCap({ body: streamOf('y'.repeat(200)) } as unknown as Response, 100))
      .rejects.toThrow(/too large/i);
  });

  it('accepts a body exactly at the cap', async () => {
    const text = JSON.stringify({ pad: 'z'.repeat(50) });
    const data = await readJsonWithCap(
      { body: streamOf(text) } as unknown as Response,
      encoder.encode(text).byteLength
    );
    expect(data).toEqual({ pad: 'z'.repeat(50) });
  });

  it('falls back to response.json() when there is no readable body (mock compatibility)', async () => {
    const response = { json: async () => ({ ok: true }) } as unknown as Response;
    expect(await readJsonWithCap(response)).toEqual({ ok: true });
  });
});

describe('handleResponse integration', () => {
  it('parses a streamed JSON body through the byte-counting path', async () => {
    const data = await handleResponse<{ hello: string }>(jsonStreamResponse({ hello: 'world' }));
    expect(data).toEqual({ hello: 'world' });
  });
});

describe('withInactivityTimeout', () => {
  it('passes through all chunks that arrive in time', async () => {
    const onTimeout = jest.fn();
    const wrapped = withInactivityTimeout(chunkedStreamOf(['a', 'b', 'c']), 1000, onTimeout);
    const reader = wrapped.getReader();
    const seen: string[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      seen.push(new TextDecoder().decode(value));
    }
    expect(seen).toEqual(['a', 'b', 'c']);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('errors with TimeoutError and runs onTimeout when the body stalls', async () => {
    const onTimeout = jest.fn();
    // Emits one chunk, then never produces another (a stalled body).
    const stalling = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('first'));
      },
      pull() {
        return new Promise<void>(() => undefined); // never resolves
      },
    });

    const reader = withInactivityTimeout(stalling, 30, onTimeout).getReader();
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toBe('first');

    await expect(reader.read()).rejects.toThrow(TimeoutError);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
