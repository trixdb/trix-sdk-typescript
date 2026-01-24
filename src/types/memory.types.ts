/**
 * Memory type definitions for the Trix SDK.
 */

import type { BaseEntityWithMetadata, PaginationParams, SortParams } from './common.types.js';

// ============================================================================
// Memory Enums and Literals
// ============================================================================

/** Memory types supported by Trix */
export type MemoryType = 'text' | 'markdown' | 'url' | 'audio' | 'image';

/** Origin types for memory context classification */
export type OriginType = 'work' | 'private' | 'shared' | 'learning';

/** Source types for memory provenance tracking */
export type SourceType =
  | 'email' | 'meeting' | 'chat' | 'document' | 'webpage'
  | 'audio' | 'video' | 'screenshot' | 'manual' | 'agent' | 'api' | 'import';

/** Relationship types for memory-resource associations */
export type ResourceRelationshipType = 'primary' | 'related' | 'mentioned' | 'derived';

/**
 * Protection level for memories.
 * - 'none': No protection, can be deleted normally
 * - 'soft': Protected from automatic cleanup, can be manually deleted
 * - 'hard': Fully protected, requires explicit unprotection before deletion
 */
export type ProtectionLevel = 'none' | 'soft' | 'hard';

// ============================================================================
// Origin/Context Fields (Shared)
// ============================================================================

/**
 * Common origin/context fields for memories.
 */
export interface MemoryOriginContext {
  /** Session ID this memory belongs to */
  sessionId?: string;
  /** Life domain context */
  originType?: OriginType;
  /** Ingestion method */
  sourceType?: SourceType;
  /** External ID in source system */
  sourceId?: string;
  /** Rich context from source */
  sourceMetadata?: Record<string, unknown>;
}

/**
 * Protection and pinning fields for memories.
 */
export interface MemoryProtectionFields {
  /** Whether this memory is pinned (protected from auto-archival) */
  isPinned?: boolean;
  /** Protection level for this memory */
  protectionLevel?: ProtectionLevel;
}

// ============================================================================
// Memory Entity
// ============================================================================

/**
 * Memory object.
 */
export interface Memory extends BaseEntityWithMetadata, MemoryOriginContext, MemoryProtectionFields {
  spaceId: string;
  type: MemoryType;
  content: string;
  embedding?: number[];
  tags?: string[];
  transcriptStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  /** Whether this memory has been soft deleted */
  isDeleted?: boolean;
  /** Timestamp when memory was soft deleted */
  deletedAt?: string;
  /** Quality score for this memory (0-1) */
  qualityScore?: number;
}

// ============================================================================
// Memory Parameters
// ============================================================================

/**
 * Parameters for creating a memory.
 */
export interface CreateMemoryParams extends MemoryOriginContext, MemoryProtectionFields {
  content: string;
  type?: MemoryType;
  tags?: string[];
  metadata?: Record<string, unknown>;
  spaceId?: string;
  embedding?: number[];
  audioFile?: Blob | Buffer;
  /** Resource IDs to link this memory to */
  resourceIds?: string[];
}

/**
 * Parameters for updating a memory.
 */
export interface UpdateMemoryParams extends Partial<MemoryOriginContext>, MemoryProtectionFields {
  id?: string;
  content?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  embedding?: number[];
}

/**
 * Parameters for listing memories.
 */
export interface ListMemoriesParams extends PaginationParams, SortParams<'createdAt' | 'updatedAt' | 'relevance'>, MemoryOriginContext {
  q?: string;
  mode?: 'semantic' | 'keyword' | 'hybrid';
  tags?: string[];
  type?: MemoryType;
  spaceId?: string;
  /** Filter by resource ID */
  resourceId?: string;
  /** Filter by multiple resource IDs (comma-separated) */
  resourceIds?: string;
  /** Filter by pinned status */
  pinned?: boolean;
  /** Filter by protection status (any non-'none' protection level) */
  protected?: boolean;
  /** Filter by minimum quality score (0-1) */
  minQuality?: number;
  /** Include soft-deleted memories in results */
  includeDeleted?: boolean;
}

// ============================================================================
// Memory Configuration and Stats
// ============================================================================

/**
 * Memory configuration.
 */
export interface MemoryConfig {
  maxContentLength: number;
  supportedTypes: MemoryType[];
  maxTagsPerMemory: number;
  maxAudioDuration: number;
}

/**
 * Parameters for getting memory stats.
 */
export interface MemoryStatsParams {
  spaceId?: string;
  createdAfter?: string;
  createdBefore?: string;
  includeTypeDistribution?: boolean;
  includeTagDistribution?: boolean;
  includeTimeline?: boolean;
  timelineGranularity?: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Memory statistics.
 */
export interface MemoryStats {
  total: number;
  byType?: Record<string, number>;
  byTag?: Record<string, number>;
  timeline?: Array<{ period: string; count: number }>;
  avgContentLength?: number;
  totalSize?: number;
}
