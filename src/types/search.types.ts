/**
 * Search type definitions for the Trix SDK.
 */

import type { ClusterScale } from './cluster.types.js';

// ============================================================================
// Search Configuration
// ============================================================================

/**
 * Search configuration.
 */
export interface SearchConfig {
  embeddingModel: string;
  embeddingDimensions: number;
  maxBatchSize: number;
}

// ============================================================================
// Search Options
// ============================================================================

/**
 * Extended search options with cluster scale support.
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity threshold */
  threshold?: number;
  /** Cluster scale to search within */
  clusterScale?: ClusterScale;
  /** Space ID to search within */
  spaceId?: string;
}

// ============================================================================
// Unified Search Results
// ============================================================================

/**
 * A single result from unified search (`GET`/`POST /v1/search`).
 *
 * Unified search is cross-modal: `type` discriminates memory, audio, and
 * video hits, so many fields are optional and only present for one modality.
 * `score` is the fused relevance score and `match` records which search
 * leg(s) produced a memory hit.
 */
export interface UnifiedSearchResult {
  /** Result modality. */
  type: 'memory' | 'audio_segment' | 'video';
  /** Result identifier. */
  id: string;
  /** Fused relevance score (higher is more relevant). */
  score: number;
  /** Which search leg(s) matched (memory results only). */
  match?: 'semantic' | 'keyword' | 'hybrid';
  // Memory fields
  content?: string;
  content_type?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  // Audio-segment fields
  audio_file_id?: string;
  text?: string;
  highlight?: string;
  start_time?: number;
  end_time?: number;
  clip_url?: string | null;
  /** Forward-compatible: additional modality-specific fields. */
  [key: string]: unknown;
}

/**
 * Response envelope returned by unified search (`GET`/`POST /v1/search`):
 * `{ results, facets }`. The API does NOT wrap this in a `data` field.
 */
export interface UnifiedSearchResponse {
  /** Ranked, paginated results across the requested modalities. */
  results: UnifiedSearchResult[];
  /** Per-modality result counts (e.g. `{ memories, audio_segments, videos }`). */
  facets: Record<string, number>;
}

/**
 * Options for searching by topic.
 */
export interface SearchByTopicOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum relevance score */
  minRelevance?: number;
  /** Space ID to search within */
  spaceId?: string;
}

// ============================================================================
// Batch Search
// ============================================================================

/**
 * Configuration for a single search within a batch.
 */
export interface BatchSearchConfig {
  strategy: 'semantic' | 'fulltext' | 'aggregate';
  query: string;
  limit?: number;
  threshold?: number;
  space_id?: string;
  tags?: string[];
  group_by?: 'tags' | 'clusters' | 'content_type' | 'priority';
}

/**
 * Result from a batch search operation.
 */
export interface BatchSearchResult {
  total_results: number;
  strategies: Array<{
    strategy: string;
    status: string;
    count: number;
    duration_ms: number;
    error?: string;
  }>;
  memories: Array<Record<string, unknown>>;
  duration_ms: number;
}

// ============================================================================
// Strategy Recommendation
// ============================================================================

/**
 * Recommendation for which search strategy to use.
 */
export interface StrategyRecommendation {
  query: string;
  recommended_strategy: string;
  confidence: number;
  reason: string;
  alternatives: Array<{ strategy: string; reason: string }>;
  usage_hint: string;
}

// ============================================================================
// Store and Organize
// ============================================================================

/**
 * Options for the store-and-organize composite operation.
 */
export interface StoreAndOrganizeOptions {
  tags?: string[];
  metadata?: Record<string, unknown>;
  space_id?: string;
  detect_contradictions?: boolean;
}

/**
 * Result from a store-and-organize operation.
 */
export interface StoreAndOrganizeResult {
  memory: { id: string; content: string } | null;
  stages: Record<string, { status: string; duration_ms: number }>;
  summary: string;
}

// ============================================================================
// Knowledge
// ============================================================================

/**
 * Result from a knowledge summary query.
 */
export interface KnowledgeSummaryResult {
  topic: string;
  total_memories: number;
  groups: Array<{
    label: string;
    count: number;
    memories: Array<{ id: string; content_preview: string }>;
  }>;
  summary: string;
  knowledge_gaps: string[];
}

/**
 * Result from converting memories to a note.
 */
export interface ToNoteResult {
  note: { id: string; title: string } | null;
  memories_included: number;
  message: string;
}
