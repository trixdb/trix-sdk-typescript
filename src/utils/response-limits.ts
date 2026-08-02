/**
 * Response body limits for the Trix client.
 *
 * Two protections a header-only `content-length` check cannot provide:
 *   1. a size cap enforced WHILE reading the body, so a chunked/streamed
 *      response that omits `content-length` still can't OOM the process; and
 *   2. a per-chunk inactivity timeout for streaming reads, so a body that
 *      stalls after headers arrive can't hang the caller forever.
 */

import { APIError, TimeoutError } from '../errors.js';

/** Maximum size of a buffered JSON response body (50 MB). */
export const MAX_RESPONSE_SIZE = 50 * 1024 * 1024;

/**
 * Read a JSON response body, enforcing `maxSize` while streaming it.
 *
 * Real `fetch` responses always expose a `ReadableStream` body, so we count
 * bytes as they arrive. Mocked responses (tests) and non-stream runtimes only
 * expose `json()`; for those we fall back to it unchanged.
 */
export async function readJsonWithCap(
  response: Response,
  maxSize = MAX_RESPONSE_SIZE
): Promise<unknown> {
  const body = response.body as ReadableStream<Uint8Array> | null | undefined;
  if (!body || typeof body.getReader !== 'function') {
    return response.json();
  }
  const text = await readStreamCapped(body, maxSize);
  return text.length === 0 ? undefined : JSON.parse(text);
}

/** Drain a byte stream into a string, aborting once `maxSize` is exceeded. */
async function readStreamCapped(
  body: ReadableStream<Uint8Array>,
  maxSize: number
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxSize) {
      await reader.cancel();
      throw new APIError(`Response too large: exceeds ${maxSize} bytes`);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

/**
 * Wrap a byte stream so each chunk must arrive within `timeoutMs` of the last.
 * On a stall the wrapped stream errors with a {@link TimeoutError} and
 * `onTimeout()` runs (used to abort the underlying request). The
 * time-to-headers deadline is cleared separately once headers arrive, so this
 * bounds only body inactivity.
 */
export function withInactivityTimeout<T>(
  source: ReadableStream<T>,
  timeoutMs: number,
  onTimeout: () => void
): ReadableStream<T> {
  const reader = source.getReader();
  return new ReadableStream<T>({
    async pull(controller) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const stall = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new TimeoutError(`Response stream stalled after ${timeoutMs}ms`)),
          timeoutMs
        );
        (timer as unknown as { unref?: () => void }).unref?.();
      });
      try {
        const result = await Promise.race([reader.read(), stall]);
        clearTimeout(timer);
        if (result.done) {
          controller.close();
          return;
        }
        controller.enqueue(result.value);
      } catch (error) {
        clearTimeout(timer);
        onTimeout();
        await reader.cancel(error).catch(() => undefined);
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}
