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
