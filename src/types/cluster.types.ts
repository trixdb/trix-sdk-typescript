/**
 * Cluster type definitions for the Trix SDK.
 */

import type { BaseEntityWithMetadata, PaginationParams, SortParams } from './common.types.js';
import type { Memory } from './memory.types.js';

// ============================================================================
// Cluster Scale
// ============================================================================

/**
 * Cluster scale for multi-scale clustering.
 * - 'fine': Fine-grained clusters with fewer, highly similar memories
 * - 'medium': Medium-sized clusters with balanced similarity
 * - 'coarse': Coarse-grained clusters with more memories, broader topics
 */
export type ClusterScale = 'fine' | 'medium' | 'coarse';

// ============================================================================
// Cluster Entity
// ============================================================================

/**
 * Cluster object.
 */
export interface Cluster extends BaseEntityWithMetadata {
  spaceId: string;
  name: string;
  description?: string;
  memoryIds: string[];
  centroid?: number[];
  /** Scale of this cluster (fine, medium, coarse) */
  scale?: ClusterScale;
  /** Memory objects when includeMemories is true */
  memories?: Memory[];
}

// ============================================================================
// Cluster Parameters
// ============================================================================

/**
 * Parameters for creating a cluster.
 */
export interface CreateClusterParams {
  name: string;
  description?: string;
  memoryIds?: string[];
  spaceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a cluster.
 */
export interface UpdateClusterParams {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing clusters.
 */
export interface ListClustersParams extends PaginationParams, SortParams<'createdAt' | 'updatedAt' | 'name'> {
  spaceId?: string;
  /** Filter by cluster scale */
  scale?: ClusterScale;
}

/**
 * Options for getting a cluster.
 */
export interface GetClusterOptions {
  /** Include full memory objects in the response */
  includeMemories?: boolean;
}

/**
 * Parameters for expanding a cluster.
 */
export interface ClusterExpandParams {
  limit?: number;
  threshold?: number;
}

/**
 * Cluster expansion result.
 */
export interface ClusterExpandResult {
  clusterId: string;
  newMemories: Array<{
    memoryId: string;
    confidence: number;
  }>;
}

// ============================================================================
// Cluster Statistics and Quality
// ============================================================================

/**
 * Cluster statistics.
 */
export interface ClusterStats {
  total: number;
  avgSize: number;
  avgQuality: number;
  bySpace?: Record<string, number>;
}

/**
 * Cluster quality metrics.
 */
export interface ClusterQuality {
  clusterId: string;
  coherence: number;
  separation: number;
  silhouetteScore: number;
  outlierCount: number;
}

/**
 * Cluster topics.
 */
export interface ClusterTopics {
  clusterId: string;
  topics: Array<{
    label: string;
    score: number;
    keywords: string[];
  }>;
}

/**
 * Parameters for incremental clustering.
 */
export interface IncrementalClusterParams {
  spaceId?: string;
  threshold?: number;
  maxNewClusters?: number;
}

/**
 * Incremental clustering result.
 */
export interface IncrementalClusterResult {
  jobId: string;
  status: 'queued' | 'processing';
  estimatedMemories: number;
}

// ============================================================================
// Cluster Configuration and Status
// ============================================================================

/**
 * Clustering configuration for an account.
 */
export interface ClusterConfig {
  /** Minimum cluster size for automatic clustering */
  minClusterSize: number;
  /** Clustering algorithm to use */
  algorithm: string;
  /** Whether automatic clustering is enabled */
  autoEnabled: boolean;
  /** Success message (returned from API) */
  message?: string;
}

/**
 * Parameters for updating clustering configuration.
 */
export interface UpdateClusterConfigParams {
  /** Minimum cluster size for automatic clustering */
  minClusterSize?: number;
  /** Clustering algorithm to use */
  algorithm?: string;
  /** Whether automatic clustering is enabled */
  autoEnabled?: boolean;
}

/**
 * Clustering status for an account.
 */
export interface ClusterStatus {
  /** Current clustering status */
  status: 'not_run' | 'completed' | 'running' | 'failed';
  /** Clustering algorithm used */
  algorithm: string;
  /** Minimum cluster size configured */
  minClusterSize: number;
  /** Total number of memories */
  memoriesTotal: number;
  /** Number of clustered memories */
  memoriesClustered: number;
  /** Number of clusters found */
  clustersFound: number;
  /** Timestamp of last clustering run */
  lastRunAt: string | null;
  /** Timestamp of next scheduled clustering run */
  nextScheduledAt: string | null;
  /** Human-readable status message */
  message: string;
}
