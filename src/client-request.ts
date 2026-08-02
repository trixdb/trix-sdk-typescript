/**
 * HTTP request handling for the Trix client.
 */

import {
  APIError,
  APIVersionMismatchError,
  AuthenticationError,
  ConflictError,
  NetworkError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from './errors.js';
import { redactSensitiveData } from './utils/security.js';
import { retry, retryStream, StreamRetryOptions } from './utils/retry.js';
import { toSnakeCase, isPlainObject } from './utils/case-conversion.js';
import { SDK_VERSION } from './version.js';
import type {
  RequestContext,
  ResponseContext,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from './client.js';

/** SDK version — single-sourced from package.json (see {@link ./version}). */
export { SDK_VERSION };
/** Current API version */
export const API_VERSION = 'v1';
/** Minimum supported API version */
export const MIN_API_VERSION = 'v1';
/** Maximum supported API version */
export const MAX_API_VERSION = 'v1';

/** Debug logging function - can be overridden */
let debugLogger: ((message: string) => void) | null = null;

/** Enable debug logging */
export function enableDebugLogging(logger?: (message: string) => void): void {
  debugLogger = logger ?? console.debug.bind(console);
}

/** Disable debug logging */
export function disableDebugLogging(): void {
  debugLogger = null;
}

function debug(message: string, data?: unknown): void {
  if (debugLogger) {
    if (data !== undefined) {
      const safeData = redactSensitiveData(data);
      debugLogger(`[Trix] ${message} ${JSON.stringify(safeData)}`);
    } else {
      debugLogger(`[Trix] ${message}`);
    }
  }
}

/** Check if API version is compatible */
export function checkApiVersion(headers: Headers): void {
  const apiVersion = headers.get('X-API-Version');
  if (apiVersion) {
    const apiNum = parseInt(apiVersion.replace('v', ''), 10);
    const minNum = parseInt(MIN_API_VERSION.replace('v', ''), 10);
    const maxNum = parseInt(MAX_API_VERSION.replace('v', ''), 10);

    if (!isNaN(apiNum) && (apiNum < minNum || apiNum > maxNum)) {
      throw new APIVersionMismatchError(
        `API version ${apiVersion} is not supported by this SDK. ` +
          `Supported versions: ${MIN_API_VERSION} to ${MAX_API_VERSION}. ` +
          `Please upgrade or downgrade the SDK.`,
        SDK_VERSION,
        apiVersion,
        MIN_API_VERSION,
        MAX_API_VERSION
      );
    }
  }
}

/** HTTP request options */
export interface RequestOptions {
  method: string;
  path: string;
  body?: unknown;
  query?: object;
  headers?: Record<string, string>;
  /** Override default timeout for this request (in milliseconds) */
  timeout?: number;
}

/** Multipart request options for file uploads */
export interface MultipartRequestOptions {
  method: string;
  path: string;
  formData: FormData;
  query?: object;
  headers?: Record<string, string>;
  /** Override default timeout for this request (in milliseconds) */
  timeout?: number;
}

/** Empty response type for 204 No Content responses */
export type EmptyResponse = void;

/** Internal configuration passed from the Trix client to request functions. */
export interface RequestConfig {
  apiKey: string;
  baseUrl: string;
  maxRetries: number;
  timeout: number;
  fetchImpl: typeof fetch;
  personaId?: string;
  requestInterceptors: RequestInterceptor[];
  responseInterceptors: ResponseInterceptor[];
  errorInterceptors: ErrorInterceptor[];
}

/** API version path segment derived from {@link API_VERSION}, e.g. `/v1`. */
export const API_PREFIX = `/${API_VERSION}`;

/** Ensure a path carries `/v1` exactly once (the transport owns the version, so
 * resources use unversioned paths and we never emit `/v1/v1`). */
export function withApiVersion(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === API_PREFIX || normalized.startsWith(`${API_PREFIX}/`)) {
    return normalized;
  }
  return `${API_PREFIX}${normalized}`;
}

/** Build the full, versioned URL with query parameters. Concatenates onto the
 * base URL rather than `new URL(path, baseUrl)` (which drops a base path for
 * leading-slash paths); query keys are snake_case'd and arrays CSV-serialized. */
export function buildUrl(baseUrl: string, path: string, query?: object): string {
  const base = baseUrl.replace(/\/+$/, '');
  const url = new URL(base + withApiVersion(path));

  if (query) {
    const normalized = toSnakeCase(query as Record<string, unknown>);
    for (const [key, value] of Object.entries(normalized)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        url.searchParams.append(key, value.map((v) => String(v)).join(','));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

/** Convert top-level camelCase keys of a request body to snake_case.
 *
 * Only plain objects are touched. Arrays, Buffers, FormData, etc. pass
 * through — they have structural meaning. Nested objects (`metadata`,
 * `settings`, `tools[].config`, …) are user-controlled bags and are NOT
 * recursed into; rewriting keys inside them would corrupt the user's data.
 */
function normalizeBody(body: unknown): unknown {
  if (!isPlainObject(body)) return body;
  return toSnakeCase(body);
}

/** HTTP methods the API treats as mutating (and that we auto-retry). These are
 * the same methods trix-api's idempotency plugin honors an Idempotency-Key for. */
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Generate a UUID v4 for use as an Idempotency-Key.
 *
 * Uses Web Crypto (`globalThis.crypto`), available in Node 19+, Deno, Bun,
 * browsers, and edge runtimes — consistent with the SDK's existing reliance on
 * web globals (`fetch`, `Headers`, `ReadableStream`). Never `Math.random`:
 * this value must be collision-free so it cannot alias another write's key. */
function generateIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

/** Case-insensitive check for an existing Idempotency-Key so a caller-supplied
 * key (in any casing) is never overwritten. */
function hasIdempotencyKey(headers: Record<string, string>): boolean {
  return Object.keys(headers).some((k) => k.toLowerCase() === 'idempotency-key');
}

/** Build request headers */
export function buildHeaders(
  apiKey: string,
  personaId?: string,
  customHeaders?: Record<string, string>
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'User-Agent': `trix-typescript-sdk/${SDK_VERSION}`,
    'X-SDK-Version': SDK_VERSION,
    'X-API-Version': API_VERSION,
    'X-Correlation-Id': Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
    ...(personaId ? { 'X-Persona-Id': personaId } : {}),
    ...customHeaders,
  };
}

/** Handle response and parse JSON */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const MAX_RESPONSE_SIZE = 50 * 1024 * 1024; // 50MB
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      throw new APIError(`Response too large: ${contentLength} bytes`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }

    return undefined as unknown as T;
  }

  await handleErrorResponse(response);
  throw new APIError('Unexpected error');
}

/** Handle error responses */
export async function handleErrorResponse(response: Response): Promise<never> {
  let errorData: Record<string, unknown> = {};

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      errorData = await response.json() as Record<string, unknown>;
    } else {
      errorData = { message: await response.text() };
    }
  } catch {
    errorData = { message: 'Unknown error' };
  }

  const message = String(errorData.message || errorData.error || `HTTP ${response.status}`);

  switch (response.status) {
    case 401:
      throw new AuthenticationError(message);
    case 403:
      throw new PermissionError(message);
    case 404:
      throw new NotFoundError(message);
    case 409:
      throw new ConflictError(message, errorData);
    case 422:
      throw new ValidationError(message, errorData.errors as { field: string; message: string; }[] | undefined);
    case 429: {
      const retryAfter = response.headers.get('retry-after');
      throw new RateLimitError(message, retryAfter ? parseInt(retryAfter, 10) : undefined);
    }
    default:
      if (response.status >= 500) {
        throw new ServerError(message, response.status, errorData);
      }
      throw new APIError(message, response.status, errorData);
  }
}

/** Run request interceptors */
async function runRequestInterceptors(
  interceptors: RequestInterceptor[],
  context: RequestContext
): Promise<RequestContext> {
  let ctx = context;
  for (const interceptor of interceptors) {
    const result = await interceptor(ctx);
    if (result) {
      ctx = result;
    }
  }
  return ctx;
}

/** Run response interceptors */
async function runResponseInterceptors(
  interceptors: ResponseInterceptor[],
  context: ResponseContext
): Promise<ResponseContext> {
  let ctx = context;
  for (const interceptor of interceptors) {
    const result = await interceptor(ctx);
    if (result) {
      ctx = result;
    }
  }
  return ctx;
}

/** Run error interceptors */
async function runErrorInterceptors(
  interceptors: ErrorInterceptor[],
  error: unknown,
  request: RequestContext
): Promise<unknown> {
  let err = error;
  for (const interceptor of interceptors) {
    err = await interceptor(err, request);
  }
  return err;
}

/** Make an HTTP request to the Trix API */
export async function executeRequest<T>(
  config: RequestConfig,
  options: RequestOptions
): Promise<T> {
  const url = buildUrl(config.baseUrl, options.path, options.query);
  const headers = buildHeaders(config.apiKey, config.personaId, options.headers);
  const requestTimeout = options.timeout ?? config.timeout;

  // Generate ONE Idempotency-Key per logical mutating request, BEFORE the
  // retry() closure below, so every retry attempt sends the SAME key. The
  // retry wrapper replays POST/PUT/PATCH/DELETE on transient 5xx/network/
  // timeout errors; without a stable key that turns a single logical write
  // into duplicate writes. trix-api's idempotency plugin (plugins/idempotency.js)
  // replays the first response for a repeated key instead of re-executing.
  // GETs are safe to replay and get no key; a caller-supplied key wins.
  if (MUTATING_METHODS.has(options.method.toUpperCase()) && !hasIdempotencyKey(headers)) {
    headers['Idempotency-Key'] = generateIdempotencyKey();
  }

  let requestContext: RequestContext = {
    method: options.method,
    url,
    headers,
    body: normalizeBody(options.body),
  };

  if (config.requestInterceptors.length > 0) {
    requestContext = await runRequestInterceptors(config.requestInterceptors, requestContext);
  }

  return retry(
    async () => {
      debug(`Request: ${options.method} ${options.path}`, { query: options.query });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      try {
        const response = await config.fetchImpl(requestContext.url, {
          method: requestContext.method,
          headers: requestContext.headers,
          body: requestContext.body ? JSON.stringify(requestContext.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        debug(`Response: ${response.status} ${response.statusText}`);
        checkApiVersion(response.headers);

        const data = await handleResponse<T>(response);

        if (config.responseInterceptors.length > 0) {
          const responseContext: ResponseContext = {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            body: data,
          };
          const finalContext = await runResponseInterceptors(
            config.responseInterceptors,
            responseContext
          );
          return finalContext.body as T;
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        let processedError = error;

        if (error instanceof Error && error.name === 'AbortError') {
          debug(`Request timeout after ${requestTimeout}ms`);
          processedError = new TimeoutError(`Request timeout after ${requestTimeout}ms`);
        } else if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
          debug(`Network error: ${error.message}`);
          processedError = new NetworkError(`Network request failed: ${error.message}`);
        }

        if (config.errorInterceptors.length > 0) {
          processedError = await runErrorInterceptors(
            config.errorInterceptors,
            processedError,
            requestContext
          );
        }

        throw processedError;
      }
    },
    {
      maxRetries: config.maxRetries,
      initialDelay: 1000,
      maxDelay: 60000,
      backoffMultiplier: 2,
      jitter: true,
    }
  );
}

/** Make a streaming request */
export async function executeStreamRequest(
  config: RequestConfig,
  options: RequestOptions
): Promise<ReadableStream> {
  const url = buildUrl(config.baseUrl, options.path, options.query);
  const headers = buildHeaders(config.apiKey, config.personaId, options.headers);
  const requestTimeout = options.timeout ?? config.timeout;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

  try {
    const normalizedBody = normalizeBody(options.body);
    const response = await config.fetchImpl(url, {
      method: options.method,
      headers,
      body: normalizedBody ? JSON.stringify(normalizedBody) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    if (!response.body) {
      throw new APIError('Response body is null');
    }

    return response.body;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(`Request timeout after ${requestTimeout}ms`);
    }

    throw error;
  }
}

/** Make a streaming request with automatic retry on failure. */
export async function* executeStreamRequestWithRetry(
  config: RequestConfig,
  options: RequestOptions,
  retryOptions?: Partial<StreamRetryOptions>
): AsyncGenerator<Uint8Array, void, unknown> {
  const streamRetryOptions: StreamRetryOptions = {
    maxRetries: retryOptions?.maxRetries ?? config.maxRetries,
    initialDelay: retryOptions?.initialDelay ?? 1000,
    maxDelay: retryOptions?.maxDelay ?? 60000,
    backoffMultiplier: retryOptions?.backoffMultiplier ?? 2,
    jitter: retryOptions?.jitter ?? true,
    onRetry: retryOptions?.onRetry,
  };

  yield* retryStream(
    () => executeStreamRequest(config, options),
    streamRetryOptions
  );
}

/** Make a multipart/form-data request (for file uploads) */
export async function executeMultipartRequest<T>(
  config: RequestConfig,
  options: MultipartRequestOptions
): Promise<T> {
  const url = buildUrl(config.baseUrl, options.path, options.query);
  const requestTimeout = options.timeout ?? config.timeout;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
    'User-Agent': `trix-typescript-sdk/${SDK_VERSION}`,
    'X-SDK-Version': SDK_VERSION,
    'X-API-Version': API_VERSION,
    ...options.headers,
  };

  debug(`Multipart Request: ${options.method} ${options.path}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

  try {
    const response = await config.fetchImpl(url, {
      method: options.method,
      headers,
      body: options.formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    debug(`Response: ${response.status} ${response.statusText}`);
    checkApiVersion(response.headers);

    return await handleResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      debug(`Request timeout after ${requestTimeout}ms`);
      throw new TimeoutError(`Request timeout after ${requestTimeout}ms`);
    }

    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      debug(`Network error: ${error.message}`);
      throw new NetworkError(`Network request failed: ${error.message}`);
    }

    throw error;
  }
}
