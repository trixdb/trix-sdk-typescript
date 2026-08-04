/**
 * Search type definitions for the Trix SDK.
 */

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
 * Options for {@link Search.query} against the unified `GET /search` endpoint.
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity threshold */
  threshold?: number;
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
  contentType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  // Audio-segment fields
  audioFileId?: string;
  text?: string;
  highlight?: string;
  startTime?: number;
  endTime?: number;
  clipUrl?: string | null;
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
  spaceId?: string;
  tags?: string[];
  groupBy?: 'tags' | 'clusters' | 'content_type' | 'priority';
}

/**
 * Result from a batch search operation.
 */
export interface BatchSearchResult {
  totalResults: number;
  strategies: Array<{
    strategy: string;
    status: string;
    count: number;
    durationMs: number;
    error?: string;
  }>;
  memories: Array<Record<string, unknown>>;
  durationMs: number;
}

// ============================================================================
// Strategy Recommendation
// ============================================================================

/**
 * Recommendation for which search strategy to use.
 */
export interface StrategyRecommendation {
  query: string;
  recommendedStrategy: string;
  confidence: number;
  reason: string;
  alternatives: Array<{ strategy: string; reason: string }>;
  usageHint: string;
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
  spaceId?: string;
  detectContradictions?: boolean;
}

/**
 * Result from a store-and-organize operation.
 */
export interface StoreAndOrganizeResult {
  memory: { id: string; content: string } | null;
  // `stages` is an opaque map (arbitrary stage-name keys) — the inbound
  // converter does not recurse into it, so its inner value stays wire-shaped
  // (`duration_ms`), unlike the typed `strategies[]` array above.
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
  totalMemories: number;
  groups: Array<{
    label: string;
    count: number;
    memories: Array<{ id: string; contentPreview: string }>;
  }>;
  summary: string;
  knowledgeGaps: string[];
}

/**
 * Result from converting memories to a note.
 */
export interface ToNoteResult {
  note: { id: string; title: string } | null;
  memoriesIncluded: number;
  message: string;
}
