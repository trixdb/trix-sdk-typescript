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
