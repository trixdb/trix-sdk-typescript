/**
 * Graph traversal type definitions for the Trix SDK.
 */

import type { Memory } from './memory.types.js';
import type { Cluster } from './cluster.types.js';
import type { Relationship } from './relationship.types.js';

// ============================================================================
// Graph Traversal Parameters
// ============================================================================

/**
 * Parameters for graph traversal.
 */
export interface TraverseParams {
  startNodeId: string;
  maxDepth?: number;
  relationshipTypes?: string[];
  direction?: 'outgoing' | 'incoming' | 'both';
  limit?: number;
}

/**
 * Graph result.
 */
export interface GraphResult {
  nodes: Array<{
    id: string;
    type: string;
    data: Memory | Cluster;
    depth: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationship: Relationship;
  }>;
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * Parameters for getting context.
 */
export interface ContextParams {
  memoryId: string;
  depth?: number;
  relationshipTypes?: string[];
  includeMetadata?: boolean;
}

/**
 * Context result.
 */
export interface ContextResult {
  central: Memory;
  related: Memory[];
  relationships: Relationship[];
  clusters?: Cluster[];
}

// ============================================================================
// Path Types
// ============================================================================

/**
 * Parameters for shortest path.
 */
export interface PathParams {
  relationshipTypes?: string[];
  maxDepth?: number;
}

/**
 * Path result.
 */
export interface PathResult {
  path: Array<{
    node: Memory;
    relationship?: Relationship;
  }>;
  distance: number;
  found: boolean;
}

// ============================================================================
// Similarity Types
// ============================================================================

/**
 * Parameters for similar search.
 */
export interface SimilarParams {
  limit?: number;
  threshold?: number;
  includeEmbedding?: boolean;
  spaceId?: string;
}

/**
 * Similar result.
 */
export interface SimilarResult {
  results: Array<{
    memory: Memory;
    similarity: number;
  }>;
}

// ============================================================================
// Embedding Types
// ============================================================================

/**
 * Embed result.
 */
export interface EmbedResult {
  embeddings: Array<{
    memoryId: string;
    embedding: number[];
  }>;
}

/**
 * Embed all result.
 */
export interface EmbedAllResult {
  total: number;
  processed: number;
  jobId?: string;
}

// ============================================================================
// Graph Extended Types
// ============================================================================

/**
 * Graph neighbors.
 */
export interface GraphNeighbors {
  nodeId: string;
  neighbors: Array<{
    id: string;
    type: string;
    relationship: Relationship;
  }>;
}

/**
 * Graph statistics.
 */
export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  avgDegree: number;
  density: number;
  components: number;
}

/**
 * Weights used in hybrid scoring.
 */
export interface HybridScoringWeights {
  semantic: number;
  graph: number;
  coActivation: number;
  recency: number;
  salience: number;
}

/**
 * Scoring metadata for graph expansion.
 */
export interface GraphExpansionScoring {
  applied: boolean;
  weights?: HybridScoringWeights;
}

/**
 * Statistics from graph expansion.
 */
export interface GraphExpansionStats {
  seedCount: number;
  expandedCount: number;
  finalCount: number;
  relationshipsFound?: number;
  hopsUsed?: number;
}

/**
 * Result of graph expansion from seed memories.
 */
export interface GraphExpansionResult {
  seedMemories: string[];
  expandedMemories: Memory[];
  relationships: Relationship[];
  stats: GraphExpansionStats;
  scoring?: GraphExpansionScoring;
}

/**
 * Parameters for graph expansion.
 */
export interface GraphExpandParams {
  seedMemoryIds: string[];
  maxHops?: number;
  minWeight?: number;
  relationshipTypes?: string[];
  direction?: 'incoming' | 'outgoing' | 'both';
  includeContent?: boolean;
  applyHybridScoring?: boolean;
}
