/**
 * Main Trix client class
 */

import type { TrixConfig } from './types.js';
import { ValidationError } from './errors.js';
import { validateBaseUrl, validateId, getEnvCredential } from './utils/security.js';
import type { StreamRetryOptions } from './utils/retry.js';

import {
  SDK_VERSION,
  API_VERSION,
  MIN_API_VERSION,
  MAX_API_VERSION,
  enableDebugLogging,
  disableDebugLogging,
  executeRequest,
  executeStreamRequest,
  executeStreamRequestWithRetry,
  executeMultipartRequest,
} from './client-request.js';

import type {
  RequestOptions,
  MultipartRequestOptions,
  RequestConfig,
} from './client-request.js';

export { SDK_VERSION, API_VERSION, MIN_API_VERSION, MAX_API_VERSION };
export { enableDebugLogging, disableDebugLogging };
export type { EmptyResponse } from './client-request.js';

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
import { Presets } from './resources/presets.js';
import { CalendarResource } from './resources/calendar.js';

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
 */
export type RequestInterceptor = (
  context: RequestContext
) => RequestContext | Promise<RequestContext> | void | Promise<void>;

/**
 * Response interceptor function.
 * Can modify or observe the response after it's received.
 * Return undefined to leave unchanged, or return modified context.
 */
export type ResponseInterceptor = (
  context: ResponseContext
) => ResponseContext | Promise<ResponseContext> | void | Promise<void>;

/**
 * Error interceptor function.
 * Can observe or transform errors before they're thrown.
 * Return the same or different error, or throw a new error.
 */
export type ErrorInterceptor = (
  error: unknown,
  request: RequestContext
) => unknown | Promise<unknown>;

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
  public readonly presets: Presets;
  public readonly calendar: CalendarResource;
  public readonly spaceConfig: SpaceConfigResource;

  /**
   * Create a Trix client from environment variables.
   */
  static fromEnv(options?: Partial<Omit<TrixConfig, 'apiKey'>>): Trix {
    const apiKey = getEnvCredential('TRIX_API_KEY', true);
    if (!apiKey) {
      throw new Error(
        'TRIX_API_KEY environment variable is not set. ' +
        'Set the environment variable or pass apiKey explicitly.'
      );
    }

    let baseUrl = options?.baseUrl;
    if (!baseUrl && typeof process !== 'undefined' && process.env) {
      baseUrl = process.env.TRIX_BASE_URL;
    }

    return new Trix({ apiKey, baseUrl, ...options });
  }

  constructor(config: TrixConfig) {
    if (!config.apiKey) {
      throw new ValidationError('API key is required');
    }

    this.apiKey = config.apiKey;
    const rawBaseUrl = config.baseUrl ?? 'https://api.trixdb.com';
    this.baseUrl = validateBaseUrl(rawBaseUrl, config.allowInsecure ?? false);
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 30000;
    this.fetchImpl = config.fetch ?? fetch;

    this.requestInterceptors = [...(config.requestInterceptors ?? [])];
    this.responseInterceptors = [...(config.responseInterceptors ?? [])];
    this.errorInterceptors = [...(config.errorInterceptors ?? [])];

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
    this.presets = new Presets(this);
    this.calendar = new CalendarResource(this);
    this.spaceConfig = new SpaceConfigResource(this);
  }

  /** Set the active persona for all subsequent requests. */
  setPersona(personaId: string): void {
    validateId(personaId, 'persona');
    this._personaId = personaId;
  }

  /** Clear the active persona. */
  clearPersona(): void {
    this._personaId = undefined;
  }

  /** Add a request interceptor. Returns a function to remove it. */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  /** Add a response interceptor. Returns a function to remove it. */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  /** Add an error interceptor. Returns a function to remove it. */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  /** Get the request configuration for delegation to request functions. */
  private getRequestConfig(): RequestConfig {
    return {
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      fetchImpl: this.fetchImpl,
      personaId: this._personaId,
      requestInterceptors: this.requestInterceptors,
      responseInterceptors: this.responseInterceptors,
      errorInterceptors: this.errorInterceptors,
    };
  }

  /** Make an HTTP request to the Trix API. @internal */
  async request<T>(options: RequestOptions): Promise<T> {
    return executeRequest<T>(this.getRequestConfig(), options);
  }

  /** Make a streaming request. @internal */
  async requestStream(options: RequestOptions): Promise<ReadableStream> {
    return executeStreamRequest(this.getRequestConfig(), options);
  }

  /** Make a streaming request with automatic retry. @internal */
  async *requestStreamWithRetry(
    options: RequestOptions,
    retryOptions?: Partial<StreamRetryOptions>
  ): AsyncGenerator<Uint8Array, void, unknown> {
    yield* executeStreamRequestWithRetry(this.getRequestConfig(), options, retryOptions);
  }

  /** Make a multipart/form-data request (for file uploads). @internal */
  async requestMultipart<T>(options: MultipartRequestOptions): Promise<T> {
    return executeMultipartRequest<T>(this.getRequestConfig(), options);
  }
}
