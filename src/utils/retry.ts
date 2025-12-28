/**
 * Retry utilities with exponential backoff
 */

import { RateLimitError, NetworkError, ServerError, TimeoutError } from '../errors.js';

/**
 * Options for retry behavior
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const initialDelay = options.initialDelay ?? 1000;
  const maxDelay = options.maxDelay ?? 60000;
  const backoffMultiplier = options.backoffMultiplier ?? 2;
  const jitter = options.jitter ?? true;

  let delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  delay = Math.min(delay, maxDelay);

  // Add jitter to prevent thundering herd
  if (jitter) {
    delay = delay * (0.5 + Math.random());
  }

  return delay;
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof RateLimitError) {
    return true;
  }
  if (error instanceof NetworkError) {
    return true;
  }
  if (error instanceof TimeoutError) {
    return true;
  }
  if (error instanceof ServerError) {
    return true;
  }
  return false;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Promise that resolves to the function result
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetch('https://api.example.com'),
 *   { maxRetries: 3 }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === options.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Calculate delay
      let delay = calculateDelay(attempt, options);

      // Use retry-after header if available for rate limits
      if (error instanceof RateLimitError && error.retryAfter) {
        delay = error.retryAfter * 1000;
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Options for stream retry behavior
 */
export interface StreamRetryOptions extends RetryOptions {
  /** Called when a retry is attempted */
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Retry a stream-producing function with exponential backoff.
 *
 * When the stream fails mid-consumption, this will retry the entire request.
 * For resumable streams (e.g., with Range header support), the caller should
 * handle partial progress externally.
 *
 * @param fn - Function that returns a ReadableStream
 * @param options - Retry options
 * @returns AsyncGenerator that yields chunks from the stream
 *
 * @example
 * ```typescript
 * const chunks: Uint8Array[] = [];
 * for await (const chunk of retryStream(
 *   () => fetchAudioStream(),
 *   { maxRetries: 3 }
 * )) {
 *   chunks.push(chunk);
 * }
 * ```
 */
export async function* retryStream(
  fn: () => Promise<ReadableStream<Uint8Array>>,
  options: StreamRetryOptions
): AsyncGenerator<Uint8Array, void, unknown> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= options.maxRetries) {
    try {
      const stream = await fn();
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return; // Stream completed successfully
          }
          if (value) {
            yield value;
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === options.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Notify about retry
      if (options.onRetry) {
        options.onRetry(attempt + 1, error);
      }

      // Calculate delay
      let delay = calculateDelay(attempt, options);

      // Use retry-after header if available for rate limits
      if (error instanceof RateLimitError && error.retryAfter) {
        delay = error.retryAfter * 1000;
      }

      // Wait before retrying
      await sleep(delay);
      attempt++;
    }
  }

  // All retries exhausted
  throw lastError;
}
