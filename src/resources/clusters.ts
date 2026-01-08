/**
 * Clusters resource
 */

import type { Trix } from '../client.js';
import type {
  Cluster,
  CreateClusterParams,
  UpdateClusterParams,
  ListClustersParams,
  PaginatedResponse,
  BulkResult,
  ClusterExpandParams,
  ClusterExpandResult,
  ClusterStats,
  ClusterQuality,
  ClusterTopics,
  IncrementalClusterParams,
  IncrementalClusterResult,
  GetClusterOptions,
} from '../types.js';
import { BaseResource, buildParams, validateBulkArray, validateIds } from './base.js';
import { paginateIterator } from '../utils/pagination.js';
import { validateId } from '../utils/security.js';

/**
 * Clusters resource for grouping related memories
 *
 * @example
 * ```typescript
 * const cluster = await client.clusters.create({
 *   name: 'Project Alpha',
 *   description: 'All memories related to Project Alpha'
 * });
 * ```
 */
export class Clusters extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a new cluster
   *
   * @param params - Cluster creation parameters
   * @returns Created cluster
   *
   * @example
   * ```typescript
   * const cluster = await client.clusters.create({
   *   name: 'Research Notes',
   *   description: 'Collection of research findings',
   *   memoryIds: ['mem_1', 'mem_2']
   * });
   * ```
   */
  async create(params: CreateClusterParams): Promise<Cluster> {
    return this.request<Cluster>({
      method: 'POST',
      path: '/clusters',
      body: params,
    });
  }

  /**
   * List clusters
   *
   * @param params - List parameters
   * @returns Paginated list of clusters
   *
   * @example
   * ```typescript
   * const results = await client.clusters.list({
   *   limit: 20,
   *   sortBy: 'name'
   * });
   * ```
   */
  async list(params?: ListClustersParams): Promise<PaginatedResponse<Cluster>> {
    return this.request<PaginatedResponse<Cluster>>({
      method: 'GET',
      path: '/clusters',
      params: buildParams(params || {}),
    });
  }

  /**
   * Get all clusters using async iteration
   *
   * @param params - List parameters
   * @returns Async iterator of clusters
   *
   * @example
   * ```typescript
   * for await (const cluster of client.clusters.listAll()) {
   *   console.log(cluster.name);
   * }
   * ```
   */
  listAll(params?: ListClustersParams): AsyncGenerator<Cluster, void, unknown> {
    return paginateIterator(
      (p) => this.list(p),
      params ?? {}
    );
  }

  /**
   * Get a specific cluster by ID
   *
   * @param id - Cluster ID
   * @param options - Optional parameters
   * @returns Cluster object
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if cluster doesn't exist
   *
   * @example
   * ```typescript
   * // Get cluster without memories
   * const cluster = await client.clusters.get('clus_123');
   *
   * // Get cluster with full memory objects
   * const withMemories = await client.clusters.get('clus_123', {
   *   includeMemories: true
   * });
   * console.log(withMemories.memories); // Array of Memory objects
   * ```
   */
  async get(id: string, options?: GetClusterOptions): Promise<Cluster> {
    validateId(id, 'cluster');
    return this.request<Cluster>({
      method: 'GET',
      path: `/clusters/${id}`,
      params: buildParams(options || {}),
    });
  }

  /**
   * Update a cluster
   *
   * @param id - Cluster ID
   * @param params - Update parameters
   * @returns Updated cluster
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if cluster doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await client.clusters.update('clus_123', {
   *   name: 'Updated Name',
   *   description: 'New description'
   * });
   * ```
   */
  async update(id: string, params: UpdateClusterParams): Promise<Cluster> {
    validateId(id, 'cluster');
    return this.request<Cluster>({
      method: 'PATCH',
      path: `/clusters/${id}`,
      body: params,
    });
  }

  /**
   * Delete a cluster
   *
   * @param id - Cluster ID
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if cluster doesn't exist
   *
   * @example
   * ```typescript
   * await client.clusters.delete('clus_123');
   * ```
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'cluster');
    return this.request<void>({
      method: 'DELETE',
      path: `/clusters/${id}`,
    });
  }

  /**
   * Bulk create clusters
   *
   * @param clusters - Array of cluster creation parameters
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   *
   * @example
   * ```typescript
   * const result = await client.clusters.bulkCreate([
   *   { name: 'Cluster 1' },
   *   { name: 'Cluster 2' }
   * ]);
   * ```
   */
  async bulkCreate(clusters: CreateClusterParams[]): Promise<BulkResult> {
    validateBulkArray(clusters, 'bulkCreate');
    return this.request<BulkResult>({
      method: 'POST',
      path: '/clusters/bulk',
      body: { clusters },
    });
  }

  /**
   * Bulk update clusters
   *
   * @param updates - Array of cluster updates
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   */
  async bulkUpdate(updates: Array<UpdateClusterParams & { id: string }>): Promise<BulkResult> {
    validateBulkArray(updates, 'bulkUpdate');
    updates.forEach((update, index) => validateId(update.id, `cluster[${index}]`));
    return this.request<BulkResult>({
      method: 'PATCH',
      path: '/clusters/bulk',
      body: { updates },
    });
  }

  /**
   * Bulk delete clusters
   *
   * @param ids - Array of cluster IDs to delete
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   *
   * @example
   * ```typescript
   * const result = await client.clusters.bulkDelete(['clus_1', 'clus_2']);
   * ```
   */
  async bulkDelete(ids: string[]): Promise<BulkResult> {
    validateBulkArray(ids, 'bulkDelete');
    validateIds(ids, 'cluster');
    return this.request<BulkResult>({
      method: 'DELETE',
      path: '/clusters/bulk',
      body: { ids },
    });
  }

  /**
   * Add a memory to a cluster
   *
   * @param clusterId - Cluster ID
   * @param memoryId - Memory ID
   * @param confidence - Optional confidence score (0-1)
   *
   * @throws ValidationError if ID format is invalid
   *
   * @example
   * ```typescript
   * await client.clusters.addMemory('clus_123', 'mem_456', 0.9);
   * ```
   */
  async addMemory(clusterId: string, memoryId: string, confidence?: number): Promise<void> {
    validateId(clusterId, 'cluster');
    validateId(memoryId, 'memory');
    return this.request<void>({
      method: 'POST',
      path: `/clusters/${clusterId}/memories`,
      body: { memoryId, confidence },
    });
  }

  /**
   * Remove a memory from a cluster
   *
   * @param clusterId - Cluster ID
   * @param memoryId - Memory ID
   *
   * @throws ValidationError if ID format is invalid
   *
   * @example
   * ```typescript
   * await client.clusters.removeMemory('clus_123', 'mem_456');
   * ```
   */
  async removeMemory(clusterId: string, memoryId: string): Promise<void> {
    validateId(clusterId, 'cluster');
    validateId(memoryId, 'memory');
    return this.request<void>({
      method: 'DELETE',
      path: `/clusters/${clusterId}/memories/${memoryId}`,
    });
  }

  /**
   * Expand a cluster by finding similar memories
   *
   * @param clusterId - Cluster ID
   * @param params - Expand parameters
   * @returns Expansion result with new memories
   *
   * @throws ValidationError if ID format is invalid
   *
   * @example
   * ```typescript
   * const result = await client.clusters.expand('clus_123', {
   *   limit: 10,
   *   threshold: 0.7
   * });
   * console.log(`Found ${result.newMemories.length} similar memories`);
   * ```
   */
  async expand(clusterId: string, params?: ClusterExpandParams): Promise<ClusterExpandResult> {
    validateId(clusterId, 'cluster');
    return this.request<ClusterExpandResult>({
      method: 'POST',
      path: `/clusters/${clusterId}/expand`,
      body: params,
    });
  }

  /**
   * Get cluster statistics
   *
   * @returns Cluster statistics
   */
  async getStats(): Promise<ClusterStats> {
    return this.request<ClusterStats>({
      method: 'GET',
      path: '/clusters/stats',
    });
  }

  /**
   * Trigger incremental clustering
   *
   * @param params - Incremental clustering parameters
   * @returns Clustering job result
   */
  async incrementalClustering(params?: IncrementalClusterParams): Promise<IncrementalClusterResult> {
    return this.request<IncrementalClusterResult>({
      method: 'POST',
      path: '/clusters/incremental',
      body: params,
    });
  }

  /**
   * Refresh quality metrics for a cluster
   *
   * @param clusterId - Cluster ID
   * @returns Updated cluster
   */
  async refreshMetrics(clusterId: string): Promise<Cluster> {
    validateId(clusterId, 'cluster');
    return this.request<Cluster>({
      method: 'POST',
      path: `/clusters/${clusterId}/refresh-metrics`,
    });
  }

  /**
   * Recompute centroid for a cluster
   *
   * @param clusterId - Cluster ID
   * @returns Updated cluster
   */
  async recomputeCentroid(clusterId: string): Promise<Cluster> {
    validateId(clusterId, 'cluster');
    return this.request<Cluster>({
      method: 'POST',
      path: `/clusters/${clusterId}/recompute-centroid`,
    });
  }

  /**
   * Get quality metrics for a cluster
   *
   * @param clusterId - Cluster ID
   * @returns Cluster quality metrics
   */
  async getQuality(clusterId: string): Promise<ClusterQuality> {
    validateId(clusterId, 'cluster');
    return this.request<ClusterQuality>({
      method: 'GET',
      path: `/clusters/${clusterId}/quality`,
    });
  }

  /**
   * Get topics for a cluster
   *
   * @param clusterId - Cluster ID
   * @returns Cluster topics
   */
  async getTopics(clusterId: string): Promise<ClusterTopics> {
    validateId(clusterId, 'cluster');
    return this.request<ClusterTopics>({
      method: 'GET',
      path: `/clusters/${clusterId}/topics`,
    });
  }
}
