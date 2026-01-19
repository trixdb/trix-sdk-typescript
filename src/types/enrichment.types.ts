/**
 * Enrichment type definitions for the Trix SDK.
 */

// ============================================================================
// Enrichment Status and Types
// ============================================================================

/** Enrichment status */
export type EnrichmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Enrichment type */
export type EnrichmentType = 'entities' | 'summary' | 'sentiment' | 'topics' | 'keywords' | 'custom';

/** Enrichment operation types for enrich endpoint */
export type EnrichmentOperation = 'topics' | 'summary' | 'entities' | 'quality';

// ============================================================================
// Enrichment Entity
// ============================================================================

/**
 * Enrichment object.
 */
export interface Enrichment {
  type: EnrichmentType | string;
  status: EnrichmentStatus;
  data?: Record<string, unknown>;
  error?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Enrichment Parameters
// ============================================================================

/**
 * Parameters for listing enrichments.
 */
export interface ListEnrichmentsParams {
  status?: EnrichmentStatus;
}

/**
 * Parameters for triggering enrichments.
 */
export interface TriggerEnrichmentParams {
  types?: string[];
  priority?: 'low' | 'normal' | 'high';
  force?: boolean;
}

/**
 * Options for enriching a memory.
 */
export interface EnrichMemoryOptions {
  /** Specific operations to run (defaults to all) */
  operations?: EnrichmentOperation[];
}

// ============================================================================
// Enrichment Results
// ============================================================================

/**
 * Enrichment result.
 */
export interface EnrichmentResult {
  memoryId: string;
  triggered: string[];
  jobIds?: string[];
  status: 'queued' | 'processing';
}

/**
 * Result of memory enrichment.
 */
export interface EnrichMemoryResult {
  memoryId: string;
  operations: EnrichmentOperation[];
  results: Record<string, unknown>;
}

/**
 * Quality score result.
 */
export interface QualityScoreResult {
  memoryId: string;
  score: number;
  factors?: Record<string, number>;
}

// ============================================================================
// Topic Types
// ============================================================================

/**
 * Topic extracted from a memory.
 */
export interface Topic {
  /** Topic name/label */
  name: string;
  /** Relevance score (0-1) indicating how relevant the topic is to the memory */
  relevance: number;
  /** Category or domain of the topic */
  category: string;
}

/**
 * Options for getting topics from a memory.
 */
export interface GetTopicsOptions {
  /** Force refresh topics (re-extract even if cached) */
  refresh?: boolean;
  /** Minimum relevance score filter (0-1) */
  minRelevance?: number;
  /** Filter by topic categories */
  categories?: string[];
}

/**
 * Result of topic extraction.
 */
export interface TopicsResult {
  memoryId: string;
  topics: Topic[];
  extractedAt: string;
}
