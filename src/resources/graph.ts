/**
 * Graph resource
 */

import type { Trix } from '../client.js';
import type {
  TraverseParams,
  GraphResult,
  ContextParams,
  ContextResult,
  PathParams,
  PathResult,
  GraphNeighbors,
  GraphStats,
  ExpandParams,
  GraphExpansionResult,
} from '../types.js';
import { validateId } from '../utils/security.js';

/**
 * Graph resource for traversing and analyzing the knowledge graph
 *
 * @example
 * ```typescript
 * const graph = await client.graph.traverse({
 *   startNodeId: 'mem_123',
 *   maxDepth: 3
 * });
 * ```
 */
export class Graph {
  constructor(private readonly client: Trix) {}

  /**
   * Traverse the graph starting from a node
   *
   * @param params - Traversal parameters
   * @returns Graph result with nodes and edges
   *
   * @example
   * ```typescript
   * const result = await client.graph.traverse({
   *   startNodeId: 'mem_123',
   *   maxDepth: 2,
   *   relationshipTypes: ['related_to', 'supports'],
   *   direction: 'both',
   *   limit: 100
   * });
   *
   * console.log(`Found ${result.nodes.length} nodes`);
   * console.log(`Found ${result.edges.length} relationships`);
   * ```
   */
  async traverse(params: TraverseParams): Promise<GraphResult> {
    validateId(params.startNodeId, 'memory');
    return this.client.request<GraphResult>({
      method: 'POST',
      path: '/graph/traverse',
      body: params,
    });
  }

  /**
   * Get contextual information for a memory
   *
   * @param params - Context parameters
   * @returns Context result with related memories
   *
   * @example
   * ```typescript
   * const context = await client.graph.getContext({
   *   memoryId: 'mem_123',
   *   depth: 2,
   *   includeMetadata: true
   * });
   *
   * console.log(`Central memory: ${context.central.content}`);
   * console.log(`Related memories: ${context.related.length}`);
   * ```
   */
  async getContext(params: ContextParams): Promise<ContextResult> {
    validateId(params.memoryId, 'memory');
    return this.client.request<ContextResult>({
      method: 'POST',
      path: '/graph/context',
      body: params,
    });
  }

  /**
   * Find the shortest path between two memories
   *
   * @param sourceId - Source memory ID
   * @param targetId - Target memory ID
   * @param params - Path parameters
   * @returns Path result
   *
   * @example
   * ```typescript
   * const path = await client.graph.shortestPath(
   *   'mem_source',
   *   'mem_target',
   *   { maxDepth: 5 }
   * );
   *
   * if (path.found) {
   *   console.log(`Path distance: ${path.distance}`);
   *   console.log(`Path length: ${path.path.length}`);
   * }
   * ```
   */
  async shortestPath(
    sourceId: string,
    targetId: string,
    params?: PathParams
  ): Promise<PathResult> {
    validateId(sourceId, 'source memory');
    validateId(targetId, 'target memory');
    return this.client.request<PathResult>({
      method: 'POST',
      path: '/graph/shortest-path',
      body: {
        sourceId,
        targetId,
        ...params,
      },
    });
  }

  /**
   * Get neighbors of a node in the graph
   *
   * @param nodeId - Node ID
   * @returns Graph neighbors
   */
  async getNeighbors(nodeId: string): Promise<GraphNeighbors> {
    validateId(nodeId, 'node');
    return this.client.request<GraphNeighbors>({
      method: 'GET',
      path: `/graph/neighbors/${nodeId}`,
    });
  }

  /**
   * Get graph statistics
   *
   * @returns Graph statistics
   */
  async getStats(): Promise<GraphStats> {
    return this.client.request<GraphStats>({
      method: 'GET',
      path: '/graph/stats',
    });
  }

  /**
   * Expand graph from seed memories using traversal and optional hybrid scoring
   *
   * @param params - Expansion parameters
   * @returns Graph expansion result with expanded memories, relationships, and stats
   *
   * @example
   * ```typescript
   * // Basic expansion
   * const result = await client.graph.expand({
   *   seedMemoryIds: ['mem_123', 'mem_456']
   * });
   * console.log(`Expanded to ${result.stats.expandedCount} memories`);
   *
   * // Advanced expansion with hybrid scoring
   * const result = await client.graph.expand({
   *   seedMemoryIds: ['mem_123'],
   *   maxHops: 3,
   *   minWeight: 0.5,
   *   relationshipTypes: ['related_to', 'supports'],
   *   applyHybridScoring: true
   * });
   * console.log(`Scoring applied: ${result.scoring?.applied}`);
   * ```
   */
  async expand(params: ExpandParams): Promise<GraphExpansionResult> {
    if (!params.seedMemoryIds || params.seedMemoryIds.length === 0) {
      throw new Error('seed_memory_ids cannot be empty');
    }

    // Validate all seed memory IDs
    for (const id of params.seedMemoryIds) {
      validateId(id, 'memory');
    }

    return this.client.request<GraphExpansionResult>({
      method: 'POST',
      path: '/graph/expand',
      body: params,
    });
  }
}
