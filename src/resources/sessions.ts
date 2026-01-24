/**
 * CLI Sessions resource for managing conversation, project, and task contexts
 */

import type { Trix } from '../client.js';
import type {
  CLISession,
  CreateCLISessionParams,
  UpdateCLISessionParams,
  CompleteCLISessionParams,
  ListCLISessionsParams,
  CLISessionsResponse,
  PaginatedResponse,
  Memory,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

/**
 * CLI Sessions resource for managing session lifecycle
 *
 * Sessions provide first-class support for managing conversation, project, and task contexts
 * with comprehensive lifecycle management including pause, resume, and completion states.
 *
 * @example
 * ```typescript
 * // Create a new session
 * const session = await client.sessions.create({
 *   name: 'Project Planning',
 *   type: 'project',
 *   description: 'Planning for Q1 2025',
 *   tags: ['planning', 'q1']
 * });
 *
 * // List active sessions
 * const active = await client.sessions.getActive();
 *
 * // Pause a session
 * await client.sessions.pause(session.id);
 *
 * // Resume a session
 * await client.sessions.resume(session.id);
 *
 * // Complete a session with summary
 * await client.sessions.complete(session.id, {
 *   summary: 'Completed project planning for Q1 2025'
 * });
 * ```
 */
export class Sessions extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a new CLI session
   *
   * @param params - Session creation parameters
   * @returns Created session
   *
   * @example
   * ```typescript
   * const session = await client.sessions.create({
   *   name: 'My Project',
   *   type: 'project',
   *   description: 'Working on feature implementation',
   *   spaceId: 'space_123',
   *   tags: ['development', 'feature-x'],
   *   retentionPolicy: 'permanent',
   *   isPrivate: false,
   *   metadata: { project: 'feature-x' }
   * });
   * ```
   */
  async create(params: CreateCLISessionParams): Promise<CLISession> {
    return this.request<CLISession>({
      method: 'POST',
      path: '/cli-sessions',
      body: params,
    });
  }

  /**
   * List CLI sessions with optional filtering and search
   *
   * Supports filtering by status, type, space, tags, and text search.
   * Results are paginated and can be sorted by various fields.
   *
   * @param params - List parameters with filters
   * @returns Paginated list of sessions
   *
   * @example
   * ```typescript
   * // List all active project sessions
   * const result = await client.sessions.list({
   *   status: 'active',
   *   type: 'project',
   *   limit: 20,
   *   sortBy: 'lastActiveAt',
   *   sortOrder: 'desc'
   * });
   *
   * // Search sessions by name
   * const searchResult = await client.sessions.list({
   *   search: 'planning',
   *   tags: ['q1']
   * });
   * ```
   */
  async list(params?: ListCLISessionsParams): Promise<CLISessionsResponse> {
    return this.request<CLISessionsResponse>({
      method: 'GET',
      path: '/cli-sessions',
      params: buildParams(params || {}),
    });
  }

  /**
   * Get all active sessions
   *
   * Convenience method to retrieve only sessions with 'active' status.
   * Equivalent to calling list({ status: 'active' }).
   *
   * @returns Paginated list of active sessions
   *
   * @example
   * ```typescript
   * const activeSessions = await client.sessions.getActive();
   * console.log(`You have ${activeSessions.data.length} active sessions`);
   * ```
   */
  async getActive(): Promise<CLISessionsResponse> {
    return this.request<CLISessionsResponse>({
      method: 'GET',
      path: '/cli-sessions/active',
    });
  }

  /**
   * Get a specific session by ID
   *
   * @param id - Session ID
   * @returns Session object
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if session doesn't exist
   *
   * @example
   * ```typescript
   * const session = await client.sessions.get('session_123');
   * console.log(`Session: ${session.name}`);
   * console.log(`Status: ${session.status}`);
   * console.log(`Memories: ${session.memoryCount}`);
   * ```
   */
  async get(id: string): Promise<CLISession> {
    validateId(id, 'session');
    return this.request<CLISession>({
      method: 'GET',
      path: `/cli-sessions/${id}`,
    });
  }

  /**
   * Update a session
   *
   * Allows updating session metadata, tags, retention policy, and other properties.
   * Cannot be used to change session status (use pause, resume, complete instead).
   *
   * @param id - Session ID
   * @param params - Update parameters
   * @returns Updated session
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if session doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await client.sessions.update('session_123', {
   *   name: 'Updated Project Name',
   *   tags: ['updated', 'current'],
   *   metadata: { phase: 'implementation' }
   * });
   * ```
   */
  async update(id: string, params: UpdateCLISessionParams): Promise<CLISession> {
    validateId(id, 'session');
    return this.request<CLISession>({
      method: 'PATCH',
      path: `/cli-sessions/${id}`,
      body: params,
    });
  }

  /**
   * Delete a session
   *
   * Permanently deletes a session and all associated data.
   * This action cannot be undone.
   *
   * @param id - Session ID
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if session doesn't exist
   *
   * @example
   * ```typescript
   * await client.sessions.delete('session_123');
   * ```
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'session');
    return this.request<void>({
      method: 'DELETE',
      path: `/cli-sessions/${id}`,
    });
  }

  /**
   * Pause a session
   *
   * Transitions a session from 'active' to 'paused' status.
   * Paused sessions can be resumed later.
   *
   * @param id - Session ID
   * @returns Updated session with paused status
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if session doesn't exist
   *
   * @example
   * ```typescript
   * const paused = await client.sessions.pause('session_123');
   * console.log(`Session paused at: ${paused.pausedAt}`);
   * ```
   */
  async pause(id: string): Promise<CLISession> {
    validateId(id, 'session');
    return this.request<CLISession>({
      method: 'POST',
      path: `/cli-sessions/${id}/pause`,
    });
  }

  /**
   * Resume a paused session
   *
   * Transitions a session from 'paused' to 'active' status.
   *
   * @param id - Session ID
   * @returns Updated session with active status
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if session doesn't exist
   *
   * @example
   * ```typescript
   * const resumed = await client.sessions.resume('session_123');
   * console.log(`Session resumed, status: ${resumed.status}`);
   * ```
   */
  async resume(id: string): Promise<CLISession> {
    validateId(id, 'session');
    return this.request<CLISession>({
      method: 'POST',
      path: `/cli-sessions/${id}/resume`,
    });
  }

  /**
   * Complete a session
   *
   * Transitions a session to 'completed' status with an optional summary.
   * Completed sessions cannot be resumed but can be referenced.
   *
   * @param id - Session ID
   * @param params - Completion parameters including optional summary
   * @returns Updated session with completed status
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if session doesn't exist
   *
   * @example
   * ```typescript
   * // Complete without summary
   * await client.sessions.complete('session_123');
   *
   * // Complete with summary
   * const completed = await client.sessions.complete('session_123', {
   *   summary: 'Successfully completed project planning. Key decisions documented.'
   * });
   * console.log(`Completed at: ${completed.completedAt}`);
   * ```
   */
  async complete(
    id: string,
    params?: CompleteCLISessionParams
  ): Promise<CLISession> {
    validateId(id, 'session');
    return this.request<CLISession>({
      method: 'POST',
      path: `/cli-sessions/${id}/complete`,
      body: params || {},
    });
  }

  /**
   * List memories associated with a session
   *
   * Retrieves all memories that belong to a specific session.
   * Results are paginated.
   *
   * @param id - Session ID
   * @param params - Pagination parameters
   * @returns Paginated list of memories
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if session doesn't exist
   *
   * @example
   * ```typescript
   * const memories = await client.sessions.getMemories('session_123', {
   *   limit: 50,
   *   page: 1
   * });
   *
   * for (const memory of memories.data) {
   *   console.log(`Memory: ${memory.content}`);
   * }
   * ```
   */
  async getMemories(
    id: string,
    params?: { limit?: number; page?: number }
  ): Promise<PaginatedResponse<Memory>> {
    validateId(id, 'session');
    return this.request<PaginatedResponse<Memory>>({
      method: 'GET',
      path: `/cli-sessions/${id}/memories`,
      params: buildParams(params || {}),
    });
  }
}
