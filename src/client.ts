/**
 * Main Trix client class
 */

import type { TrixConfig } from './types.js';
import {
  APIError,
  APIVersionMismatchError,
  AuthenticationError,
  NetworkError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from './errors.js';
import {
  validateBaseUrl,
  getEnvCredential,
  redactSensitiveData,
} from './utils/security.js';

/** SDK version */
export const SDK_VERSION = '1.0.0';
/** Current API version */
export const API_VERSION = 'v1';
/** Minimum supported API version */
export const MIN_API_VERSION = 'v1';
/** Maximum supported API version */
export const MAX_API_VERSION = 'v1';

/** Debug logging function - can be overridden */
let debugLogger: ((message: string) => void) | null = null;

/**
 * Enable debug logging
 * @param logger - Custom logger function (defaults to console.debug)
 */
export function enableDebugLogging(logger?: (message: string) => void): void {
  debugLogger = logger ?? console.debug.bind(console);
}

/**
 * Disable debug logging
 */
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

/**
 * Check if API version is compatible
 */
function checkApiVersion(headers: Headers): void {
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
import { retry, retryStream, StreamRetryOptions } from './utils/retry.js';
import { Memories } from './resources/memories.js';
import { Relationships } from './resources/relationships.js';
import { Clusters } from './resources/clusters.js';
import { Spaces } from './resources/spaces.js';
import { Graph } from './resources/graph.js';
import { Search } from './resources/search.js';
import { Webhooks } from './resources/webhooks.js';
import { Agent } from './resources/agent.js';
import { Feedback } from './resources/feedback.js';
import { Highlights } from './resources/highlights.js';
import { Facts } from './resources/facts.js';
import { Entities } from './resources/entities.js';
import { Enrichments } from './resources/enrichments.js';
import { Invites } from './resources/invites.js';
import { Sessions } from './resources/sessions.js';
import { Resources } from './resources/resources.js';
import { Tasks } from './resources/tasks.js';
import { Habits } from './resources/habits.js';
import { Personas } from './resources/personas.js';
import { Bots } from './resources/bots.js';
import { Skills } from './resources/skills.js';
import { Goals } from './resources/goals.js';
import { SpaceConfigResource } from './resources/space-config.js';
import { Workflows } from './resources/workflows.js';
import { Notes } from './resources/notes.js';
import { Templates } from './resources/templates.js';
import { Crews } from './resources/crews.js';
import { Hubs } from './resources/hubs.js';
import { Files } from './resources/files.js';

/**
 * HTTP request options
 */
interface RequestOptions {
  method: string;
  path: string;
  body?: unknown;
  query?: object;
  headers?: Record<string, string>;
  /** Override default timeout for this request (in milliseconds) */
  timeout?: number;
}

/**
 * Request context passed to interceptors
 */
export interface RequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

/**
 * Response context passed to interceptors
 */
export interface ResponseContext {
  status: number;
  statusText: string;
  headers: Headers;
  body: unknown;
}

/**
 * Request interceptor function.
 * Can modify the request context before it's sent.
 * Return undefined to leave unchanged, or return modified context.
 *
 * **Interceptor Mutation Constraints:**
 *
 * When modifying the request context, be aware of the following limitations:
 *
 * 1. **Method**: Changing the HTTP method may cause unexpected behavior
 *    if the body format doesn't match (e.g., GET requests cannot have bodies).
 *
 * 2. **URL**: Modifying the URL is supported, but ensure the new URL is
 *    accessible and returns a compatible response format.
 *
 * 3. **Headers**: You can add or modify headers, but removing required headers
 *    (Authorization, Content-Type) may cause authentication or parsing failures.
 *
 * 4. **Body**: Modifying the body is supported for JSON requests. Ensure the
 *    modified body is JSON-serializable. Do not set body for GET/HEAD requests.
 *
 * Interceptors run sequentially. If an interceptor throws, the request is aborted.
 *
 * @example
 * ```typescript
 * // Safe: Adding a custom header
 * client.addRequestInterceptor((ctx) => {
 *   return { ...ctx, headers: { ...ctx.headers, 'X-Custom': 'value' } };
 * });
 *
 * // Safe: Logging request details
 * client.addRequestInterceptor((ctx) => {
 *   console.log(`${ctx.method} ${ctx.url}`);
 *   return ctx;
 * });
 * ```
 */
export type RequestInterceptor = (
  context: RequestContext
) => RequestContext | Promise<RequestContext> | void | Promise<void>;

/**
 * Response interceptor function.
 * Can modify or observe the response after it's received.
 * Return undefined to leave unchanged, or return modified context.
 *
 * **Interceptor Mutation Constraints:**
 *
 * When modifying the response context, be aware of the following:
 *
 * 1. **Body**: Modifying the body will change what the caller receives.
 *    Ensure the modified body matches the expected type.
 *
 * 2. **Headers/Status**: Modifying headers or status has no effect on the
 *    actual response, but may affect downstream interceptors that read them.
 *
 * Interceptors run sequentially after a successful response.
 */
export type ResponseInterceptor = (
  context: ResponseContext
) => ResponseContext | Promise<ResponseContext> | void | Promise<void>;

/**
 * Error interceptor function.
 * Can observe or transform errors before they're thrown.
 * Return the same or different error, or throw a new error.
 *
 * **Usage Notes:**
 *
 * 1. The error returned (or thrown) by the last interceptor is what the
 *    caller will receive.
 *
 * 2. You can transform errors (e.g., wrap in a custom error type) or
 *    log them for monitoring purposes.
 *
 * 3. To suppress an error (not recommended), return a non-Error value,
 *    but this may cause type issues for the caller.
 */
export type ErrorInterceptor = (
  error: unknown,
  request: RequestContext
) => unknown | Promise<unknown>;

/**
 * Multipart request options for file uploads
 */
interface MultipartRequestOptions {
  method: string;
  path: string;
  formData: FormData;
  query?: object;
  headers?: Record<string, string>;
  /** Override default timeout for this request (in milliseconds) */
  timeout?: number;
}

/**
 * Empty response type for 204 No Content responses
 */
export type EmptyResponse = void;

/**
 * Main Trix client
 *
 * @example
 * ```typescript
 * const client = new Trix({
 *   apiKey: 'your_api_key',
 *   baseUrl: 'https://api.trixdb.com'
 * });
 *
 * const memory = await client.memories.create({
 *   content: 'Important information',
 *   tags: ['important']
 * });
 * ```
 */
export class Trix {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;
  private _personaId?: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  public readonly memories: Memories;
  public readonly relationships: Relationships;
  public readonly clusters: Clusters;
  public readonly spaces: Spaces;
  public readonly graph: Graph;
  public readonly search: Search;
  public readonly webhooks: Webhooks;
  public readonly agent: Agent;
  public readonly feedback: Feedback;
  public readonly highlights: Highlights;
  public readonly facts: Facts;
  public readonly entities: Entities;
  public readonly enrichments: Enrichments;
  public readonly invites: Invites;
  public readonly sessions: Sessions;
  public readonly resources: Resources;
  public readonly tasks: Tasks;
  public readonly habits: Habits;
  public readonly personas: Personas;
  public readonly bots: Bots;
  public readonly skills: Skills;
  public readonly goals: Goals;
  public readonly workflows: Workflows;
  public readonly notes: Notes;
  public readonly templates: Templates;
  public readonly crews: Crews;
  public readonly hubs: Hubs;
  public readonly files: Files;
  public readonly spaceConfig: SpaceConfigResource;

  /**
   * Create a Trix client from environment variables.
   *
   * @param options - Optional configuration overrides
   * @returns Trix client instance
   * @throws Error if TRIX_API_KEY environment variable is not set
   *
   * @example
   * ```typescript
   * // Uses TRIX_API_KEY and optionally TRIX_BASE_URL
   * const client = Trix.fromEnv();
   *
   * // With overrides
   * const client = Trix.fromEnv({ timeout: 60000 });
   * ```
   */
  static fromEnv(options?: Partial<Omit<TrixConfig, 'apiKey'>>): Trix {
    const apiKey = getEnvCredential('TRIX_API_KEY', true);
    if (!apiKey) {
      throw new Error(
        'TRIX_API_KEY environment variable is not set. ' +
        'Set the environment variable or pass apiKey explicitly.'
      );
    }

    // Check for base URL in environment
    let baseUrl = options?.baseUrl;
    if (!baseUrl && typeof process !== 'undefined' && process.env) {
      baseUrl = process.env.TRIX_BASE_URL;
    }

    return new Trix({
      apiKey,
      baseUrl,
      ...options,
    });
  }

  /**
   * Create a new Trix client
   *
   * @param config - Client configuration
   */
  constructor(config: TrixConfig) {
    if (!config.apiKey) {
      throw new ValidationError('API key is required');
    }

    this.apiKey = config.apiKey;

    // Validate and normalize base URL
    const rawBaseUrl = config.baseUrl ?? 'https://api.trixdb.com';
    this.baseUrl = validateBaseUrl(rawBaseUrl, config.allowInsecure ?? false);

    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 30000;
    this.fetchImpl = config.fetch ?? fetch;

    // Initialize interceptors from config
    this.requestInterceptors = [...(config.requestInterceptors ?? [])];
    this.responseInterceptors = [...(config.responseInterceptors ?? [])];
    this.errorInterceptors = [...(config.errorInterceptors ?? [])];

    // Initialize resources
    this.memories = new Memories(this);
    this.relationships = new Relationships(this);
    this.clusters = new Clusters(this);
    this.spaces = new Spaces(this);
    this.graph = new Graph(this);
    this.search = new Search(this);
    this.webhooks = new Webhooks(this);
    this.agent = new Agent(this);
    this.feedback = new Feedback(this);
    this.highlights = new Highlights(this);
    this.facts = new Facts(this);
    this.entities = new Entities(this);
    this.enrichments = new Enrichments(this);
    this.invites = new Invites(this);
    this.sessions = new Sessions(this);
    this.resources = new Resources(this);
    this.tasks = new Tasks(this);
    this.habits = new Habits(this);
    this.personas = new Personas(this);
    this.bots = new Bots(this);
    this.skills = new Skills(this);
    this.goals = new Goals(this);
    this.workflows = new Workflows(this);
    this.notes = new Notes(this);
    this.templates = new Templates(this);
    this.crews = new Crews(this);
    this.hubs = new Hubs(this);
    this.files = new Files(this);
    this.spaceConfig = new SpaceConfigResource(this);
  }

  /**
   * Set the active persona for all subsequent requests.
   * @param personaId - The persona ID to use
   */
  setPersona(personaId: string): void {
    this._personaId = personaId;
  }

  /**
   * Clear the active persona.
   */
  clearPersona(): void {
    this._personaId = undefined;
  }

  /**
   * Add a request interceptor.
   * Interceptors run in the order they were added.
   *
   * @param interceptor - Function to run before each request
   * @returns Function to remove the interceptor
   *
   * @example
   * ```typescript
   * const removeInterceptor = client.addRequestInterceptor((ctx) => {
   *   console.log(`Request: ${ctx.method} ${ctx.url}`);
   *   return ctx;
   * });
   * // Later: removeInterceptor();
   * ```
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add a response interceptor.
   * Interceptors run in the order they were added.
   *
   * @param interceptor - Function to run after each successful response
   * @returns Function to remove the interceptor
   *
   * @example
   * ```typescript
   * const removeInterceptor = client.addResponseInterceptor((ctx) => {
   *   console.log(`Response: ${ctx.status}`);
   *   return ctx;
   * });
   * ```
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add an error interceptor.
   * Interceptors run in the order they were added.
   *
   * @param interceptor - Function to run when an error occurs
   * @returns Function to remove the interceptor
   *
   * @example
   * ```typescript
   * const removeInterceptor = client.addErrorInterceptor((error, request) => {
   *   console.error(`Error on ${request.url}:`, error);
   *   return error; // Or transform it
   * });
   * ```
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Run request interceptors
   * @internal
   */
  private async runRequestInterceptors(context: RequestContext): Promise<RequestContext> {
    let ctx = context;
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(ctx);
      if (result) {
        ctx = result;
      }
    }
    return ctx;
  }

  /**
   * Run response interceptors
   * @internal
   */
  private async runResponseInterceptors(context: ResponseContext): Promise<ResponseContext> {
    let ctx = context;
    for (const interceptor of this.responseInterceptors) {
      const result = await interceptor(ctx);
      if (result) {
        ctx = result;
      }
    }
    return ctx;
  }

  /**
   * Run error interceptors
   * @internal
   */
  private async runErrorInterceptors(error: unknown, request: RequestContext): Promise<unknown> {
    let err = error;
    for (const interceptor of this.errorInterceptors) {
      err = await interceptor(err, request);
    }
    return err;
  }

  /**
   * Make an HTTP request to the Trix API
   *
   * @param options - Request options
   * @returns Response data
   * @internal
   */
  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const headers = this.buildHeaders(options.headers);
    const requestTimeout = options.timeout ?? this.timeout;

    // Build initial request context for interceptors
    let requestContext: RequestContext = {
      method: options.method,
      url,
      headers,
      body: options.body,
    };

    // Run request interceptors
    if (this.requestInterceptors.length > 0) {
      requestContext = await this.runRequestInterceptors(requestContext);
    }

    return retry(
      async () => {
        debug(`Request: ${options.method} ${options.path}`, { query: options.query });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

        try {
          const response = await this.fetchImpl(requestContext.url, {
            method: requestContext.method,
            headers: requestContext.headers,
            body: requestContext.body ? JSON.stringify(requestContext.body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          debug(`Response: ${response.status} ${response.statusText}`);

          // Check API version compatibility
          checkApiVersion(response.headers);

          const data = await this.handleResponse<T>(response);

          // Run response interceptors
          if (this.responseInterceptors.length > 0) {
            const responseContext: ResponseContext = {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              body: data,
            };
            const finalContext = await this.runResponseInterceptors(responseContext);
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

          // Run error interceptors
          if (this.errorInterceptors.length > 0) {
            processedError = await this.runErrorInterceptors(processedError, requestContext);
          }

          throw processedError;
        }
      },
      {
        maxRetries: this.maxRetries,
        initialDelay: 1000,
        maxDelay: 60000,
        backoffMultiplier: 2,
        jitter: true,
      }
    );
  }

  /**
   * Make a streaming request (for audio, etc.)
   *
   * @param options - Request options
   * @returns Response stream
   * @internal
   */
  async requestStream(options: RequestOptions): Promise<ReadableStream> {
    const url = this.buildUrl(options.path, options.query);
    const headers = this.buildHeaders(options.headers);
    const requestTimeout = options.timeout ?? this.timeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
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

  /**
   * Make a streaming request with automatic retry on failure.
   *
   * Unlike requestStream, this method will automatically retry the entire
   * stream request if a retryable error occurs. Use this for audio streaming
   * or other cases where retry behavior is desired.
   *
   * @param options - Request options
   * @param retryOptions - Optional retry configuration
   * @returns Async generator that yields stream chunks
   * @internal
   */
  async *requestStreamWithRetry(
    options: RequestOptions,
    retryOptions?: Partial<StreamRetryOptions>
  ): AsyncGenerator<Uint8Array, void, unknown> {
    const streamRetryOptions: StreamRetryOptions = {
      maxRetries: retryOptions?.maxRetries ?? this.maxRetries,
      initialDelay: retryOptions?.initialDelay ?? 1000,
      maxDelay: retryOptions?.maxDelay ?? 60000,
      backoffMultiplier: retryOptions?.backoffMultiplier ?? 2,
      jitter: retryOptions?.jitter ?? true,
      onRetry: retryOptions?.onRetry,
    };

    yield* retryStream(
      () => this.requestStream(options),
      streamRetryOptions
    );
  }

  /**
   * Make a multipart/form-data request (for file uploads)
   *
   * @param options - Multipart request options
   * @returns Response data
   * @internal
   */
  async requestMultipart<T>(options: MultipartRequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query);
    const requestTimeout = options.timeout ?? this.timeout;

    // Don't set Content-Type - let the browser set it with the boundary
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': `trix-typescript-sdk/${SDK_VERSION}`,
      'X-SDK-Version': SDK_VERSION,
      'X-API-Version': API_VERSION,
      ...options.headers,
    };

    debug(`Multipart Request: ${options.method} ${options.path}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers,
        body: options.formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      debug(`Response: ${response.status} ${response.statusText}`);

      checkApiVersion(response.headers);

      return await this.handleResponse<T>(response);
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

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, query?: object): string {
    const url = new URL(path, this.baseUrl);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Build request headers
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': `trix-typescript-sdk/${SDK_VERSION}`,
      'X-SDK-Version': SDK_VERSION,
      'X-API-Version': API_VERSION,
      ...(this._personaId ? { 'X-Persona-Id': this._personaId } : {}),
      ...customHeaders,
    };
  }

  /**
   * Handle response and parse JSON
   *
   * @remarks
   * For void return types (like delete operations), 204 No Content is expected.
   * For object return types, the API should always return JSON.
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      // Handle 204 No Content - expected for delete operations and some updates
      if (response.status === 204) {
        // For void return types, this is the expected behavior
        // TypeScript's `void` type accepts undefined
        return undefined as unknown as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return data as T;
      }

      // Non-JSON successful response with content - return undefined
      // This handles edge cases like empty text responses
      return undefined as unknown as T;
    }

    await this.handleErrorResponse(response);
    throw new APIError('Unexpected error');
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
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
}
