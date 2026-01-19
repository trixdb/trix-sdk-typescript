/**
 * Session type definitions for the Trix SDK.
 */

import type { PaginatedResponse, PaginationParams, SortParams } from './common.types.js';
import type { Memory, MemoryType } from './memory.types.js';

// ============================================================================
// Legacy Session Types (Original)
// ============================================================================

/**
 * Session object (legacy).
 */
export interface Session {
  id: string;
  spaceId?: string;
  name?: string;
  metadata?: Record<string, unknown>;
  startedAt: string;
  endedAt?: string;
  memoryCount: number;
}

/**
 * Parameters for creating a session (legacy).
 */
export interface CreateSessionParams {
  name?: string;
  spaceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Session memory.
 */
export interface SessionMemory {
  id: string;
  sessionId: string;
  memoryId: string;
  sequenceNumber: number;
  createdAt: string;
}

/**
 * Parameters for adding memory to session.
 */
export interface AddMemoryParams {
  memoryId?: string;
  content?: string;
  type?: MemoryType;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for getting session.
 */
export interface GetSessionParams {
  includeMemories?: boolean;
  limit?: number;
}

/**
 * Session history.
 */
export interface SessionHistory {
  session: Session;
  memories?: Memory[];
}

/**
 * Parameters for listing sessions.
 */
export interface ListSessionsParams extends Pick<PaginationParams, 'limit' | 'page'> {
  spaceId?: string;
  active?: boolean;
}

/**
 * Parameters for getting agent context.
 */
export interface GetContextParams {
  sessionId?: string;
  query?: string;
  limit?: number;
  includeRelated?: boolean;
}

/**
 * Parameters for ending session.
 */
export interface EndSessionParams {
  consolidate?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Ended session.
 */
export interface EndedSession {
  session: Session;
  consolidationJobId?: string;
}

// ============================================================================
// CLI Session Types (Extended)
// ============================================================================

/** Session type */
export type SessionType = 'conversation' | 'project' | 'task' | 'temporary';

/** Session status */
export type SessionStatus = 'active' | 'paused' | 'completed' | 'archived';

/** Session retention policy */
export type SessionRetentionPolicy = 'permanent' | 'auto_delete' | 'on_completion' | 'temporary';

/**
 * CLI Session object.
 */
export interface CLISession {
  id: string;
  accountId: string;
  userId: string;
  createdBy: string;
  name: string;
  description?: string;
  type: SessionType;
  status: SessionStatus;
  spaceId?: string;
  originType?: string;
  tags?: string[];
  retentionPolicy: SessionRetentionPolicy;
  retentionDays?: number;
  summary?: string;
  isPrivate: boolean;
  messageCount: number;
  memoryCount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  pausedAt?: string;
  completedAt?: string;
  archivedAt?: string;
}

/**
 * Parameters for creating a CLI session.
 */
export interface CreateCLISessionParams {
  name: string;
  description?: string;
  type?: SessionType;
  spaceId?: string;
  originType?: string;
  tags?: string[];
  retentionPolicy?: SessionRetentionPolicy;
  retentionDays?: number;
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a CLI session.
 */
export interface UpdateCLISessionParams {
  name?: string;
  description?: string;
  tags?: string[];
  retentionPolicy?: SessionRetentionPolicy;
  retentionDays?: number;
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for completing a CLI session.
 */
export interface CompleteCLISessionParams {
  summary?: string;
}

/**
 * Parameters for listing CLI sessions.
 */
export interface ListCLISessionsParams extends PaginationParams, SortParams<'createdAt' | 'updatedAt' | 'lastActiveAt' | 'name'> {
  status?: SessionStatus;
  type?: SessionType;
  spaceId?: string;
  tags?: string[];
  search?: string;
}

/**
 * CLI Sessions paginated response.
 */
export interface CLISessionsResponse extends PaginatedResponse<CLISession> {}

/**
 * CLI Session statistics.
 */
export interface CLISessionStats {
  total: number;
  byStatus: Record<SessionStatus, number>;
  byType: Record<SessionType, number>;
  avgMemoriesPerSession: number;
  avgDurationMinutes: number;
  activeSessionsCount: number;
  totalMemories: number;
}
