/**
 * Agent resource
 */

import type { Trix } from '../client.js';
import type {
  CreateSessionParams,
  Session,
  AddMemoryParams,
  SessionMemory,
  GetSessionParams,
  SessionHistory,
  ListSessionsParams,
  PaginatedResponse,
  GetContextParams,
  ContextResult,
  EndSessionParams,
  EndedSession,
  AddSessionMessageParams,
  SessionMessage,
} from '../types.js';
import { paginateIterator } from '../utils/pagination.js';
import { validateId } from '../utils/security.js';

/**
 * Agent resource for AI agent operations and session management
 *
 * @example
 * ```typescript
 * const session = await client.agent.createSession({
 *   name: 'Research Session'
 * });
 * ```
 */
export class Agent {
  constructor(private readonly client: Trix) {}

  /**
   * Create a new agent session
   *
   * @param params - Session creation parameters
   * @returns Created session
   *
   * @example
   * ```typescript
   * const session = await client.agent.createSession({
   *   name: 'Customer Support - Ticket #123',
   *   metadata: { ticketId: '123', agent: 'bot' }
   * });
   * ```
   */
  async createSession(params: CreateSessionParams): Promise<Session> {
    return this.client.request<Session>({
      method: 'POST',
      path: '/agent/sessions',
      body: params,
    });
  }

  /**
   * Add a memory to an agent session
   *
   * @param sessionId - Session ID
   * @param params - Memory parameters
   * @returns Session memory
   *
   * @example
   * ```typescript
   * const sessionMemory = await client.agent.addSessionMemory('sess_123', {
   *   content: 'User asked about pricing',
   *   tags: ['question', 'pricing']
   * });
   * ```
   */
  async addSessionMemory(sessionId: string, params: AddMemoryParams): Promise<SessionMemory> {
    validateId(sessionId, 'session');
    return this.client.request<SessionMemory>({
      method: 'POST',
      path: `/agent/sessions/${sessionId}/memories`,
      body: params,
    });
  }

  /**
   * Add a simple message to a session
   *
   * This is a simpler alternative to addSessionMemory for basic chat messages.
   *
   * @param sessionId - Session ID
   * @param params - Message parameters (role and content)
   * @returns Session message with turn number
   *
   * @example
   * ```typescript
   * // Add a user message
   * const userMsg = await client.agent.addSessionMessage('sess_123', {
   *   role: 'user',
   *   content: 'What is the weather today?'
   * });
   *
   * // Add an assistant response
   * const assistantMsg = await client.agent.addSessionMessage('sess_123', {
   *   role: 'assistant',
   *   content: 'The weather is sunny and 72°F.'
   * });
   *
   * console.log(`Turn ${userMsg.turnNumber}: ${userMsg.content}`);
   * ```
   */
  async addSessionMessage(
    sessionId: string,
    params: AddSessionMessageParams
  ): Promise<SessionMessage> {
    validateId(sessionId, 'session');
    return this.client.request<SessionMessage>({
      method: 'POST',
      path: `/agent/sessions/${sessionId}/message`,
      body: params,
    });
  }

  /**
   * Get a session with its history
   *
   * @param sessionId - Session ID
   * @param params - Get parameters
   * @returns Session history
   *
   * @example
   * ```typescript
   * const history = await client.agent.getSession('sess_123', {
   *   includeMemories: true,
   *   limit: 50
   * });
   *
   * console.log(`Session has ${history.memories?.length} memories`);
   * ```
   */
  async getSession(sessionId: string, params?: GetSessionParams): Promise<SessionHistory> {
    validateId(sessionId, 'session');
    return this.client.request<SessionHistory>({
      method: 'GET',
      path: `/agent/sessions/${sessionId}`,
      query: params,
    });
  }

  /**
   * List agent sessions
   *
   * @param params - List parameters
   * @returns Paginated list of sessions
   *
   * @example
   * ```typescript
   * const results = await client.agent.listSessions({
   *   active: true,
   *   limit: 20
   * });
   * ```
   */
  async listSessions(params?: ListSessionsParams): Promise<PaginatedResponse<Session>> {
    return this.client.request<PaginatedResponse<Session>>({
      method: 'GET',
      path: '/agent/sessions',
      query: params,
    });
  }

  /**
   * Get all sessions using async iteration
   *
   * @param params - List parameters
   * @returns Async iterator of sessions
   *
   * @example
   * ```typescript
   * for await (const session of client.agent.listSessionsAll({ active: true })) {
   *   console.log(session.name);
   * }
   * ```
   */
  listSessionsAll(params?: ListSessionsParams): AsyncGenerator<Session, void, unknown> {
    return paginateIterator(
      (p) => this.listSessions(p),
      params ?? {}
    );
  }

  /**
   * Get contextual information for an agent
   *
   * @param params - Context parameters
   * @returns Context result
   *
   * @example
   * ```typescript
   * const context = await client.agent.getContext({
   *   sessionId: 'sess_123',
   *   query: 'What did we discuss about pricing?',
   *   limit: 10,
   *   includeRelated: true
   * });
   * ```
   */
  async getContext(params: GetContextParams): Promise<ContextResult> {
    return this.client.request<ContextResult>({
      method: 'POST',
      path: '/agent/context',
      body: params,
    });
  }

  /**
   * End an agent session
   *
   * @param sessionId - Session ID
   * @param params - End session parameters
   * @returns Ended session
   *
   * @example
   * ```typescript
   * const ended = await client.agent.endSession('sess_123', {
   *   metadata: { resolution: 'resolved' }
   * });
   * ```
   */
  async endSession(sessionId: string, params?: EndSessionParams): Promise<EndedSession> {
    validateId(sessionId, 'session');
    return this.client.request<EndedSession>({
      method: 'POST',
      path: `/agent/sessions/${sessionId}/end`,
      body: params,
    });
  }

  // ==================== ADR-112 P10 — Ingestion-pipeline triggers ====================

  /**
   * Enqueue a session_summary job for the given session.
   * Returns 202 immediately; worker generates asynchronously.
   */
  async summarizeSession(
    sessionId: string,
    params?: { pipeline?: string }
  ): Promise<TriggerJobResponse> {
    validateId(sessionId, 'session');
    return this.client.request<TriggerJobResponse>({
      method: 'POST',
      path: `/agent/sessions/${sessionId}/summarize`,
      body: params || {},
    });
  }

  /**
   * Enqueue a cross-session mega-summary generation job.
   * scope_type defaults to 'account'; pass 'space' for per-space.
   */
  async triggerMegaSummary(params: TriggerMegaSummaryParams): Promise<TriggerJobResponse> {
    return this.client.request<TriggerJobResponse>({
      method: 'POST',
      path: '/agent/mega-summary/trigger',
      body: { scope_type: 'account', ...params },
    });
  }

  /**
   * Enqueue a scoped fact harvest job.
   * scope_type defaults to 'session'; also supports 'space' and 'window'.
   */
  async triggerScopedFacts(params: TriggerScopedFactsParams): Promise<TriggerJobResponse> {
    return this.client.request<TriggerJobResponse>({
      method: 'POST',
      path: '/agent/scoped-facts/harvest',
      body: { scope_type: 'session', ...params },
    });
  }

  // ==================== ADR-109a — Account-level default preset ====================
  // Placed here pragmatically; pipeline-presets has no dedicated SDK
  // resource yet. Thin wrappers over /v1/pipeline-presets/_default.

  /**
   * Return the account's current default pipeline preset name (null if unset).
   */
  async getDefaultPipeline(): Promise<string | null> {
    const resp = await this.client.request<{ name: string | null }>({
      method: 'GET',
      path: '/pipeline-presets/_default',
    });
    return resp?.name ?? null;
  }

  /**
   * Set the account default pipeline preset. Throws on unknown name.
   */
  async setDefaultPipeline(name: string): Promise<{ name: string }> {
    return this.client.request<{ name: string }>({
      method: 'POST',
      path: `/pipeline-presets/${encodeURIComponent(name)}/set-default`,
      body: {},
    });
  }

  /**
   * Clear the account default pipeline preset.
   */
  async clearDefaultPipeline(): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: '/pipeline-presets/_default',
    });
  }
}

// ==================== ADR-112 P10 — Trigger types ====================

export interface TriggerJobResponse {
  scope_id?: string;
  session_id?: string;
  scope_type?: string;
  enqueued: boolean;
  job_id: string | null;
  pipeline: string | null;
}

export interface TriggerMegaSummaryParams {
  scope_id: string;
  scope_type?: 'account' | 'space';
  pipeline?: string;
}

export interface TriggerScopedFactsParams {
  scope_id: string;
  scope_type?: 'session' | 'space' | 'window';
  pipeline?: string;
}
