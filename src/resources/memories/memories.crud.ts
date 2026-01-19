/**
 * Memory CRUD operations.
 *
 * Basic create, read, update, delete operations for memories.
 */

import type { Trix } from '../../client.js';
import type {
  Memory,
  CreateMemoryParams,
  UpdateMemoryParams,
  ListMemoriesParams,
  PaginatedResponse,
  MemoryConfig,
  MemoryStatsParams,
  MemoryStats,
  LinkResourceParams,
  LinkResourceResult,
  UnlinkResourceResult,
  MemoryResourcesResult,
} from '../../types.js';
import { BaseResource, buildParams } from '../base.js';
import { paginateIterator } from '../../utils/pagination.js';
import { validateId } from '../../utils/security.js';

/**
 * Memory CRUD operations mixin.
 *
 * Provides basic CRUD operations for memories.
 */
export class MemoriesCrud extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a new memory (non-file version).
   */
  async create(params: CreateMemoryParams): Promise<Memory> {
    if (params.audioFile) {
      throw new Error('Use createWithAudio for file uploads');
    }
    return this.request<Memory>({
      method: 'POST',
      path: '/memories',
      body: params,
    });
  }

  /**
   * List memories with optional filtering and search.
   */
  async list(params?: ListMemoriesParams): Promise<PaginatedResponse<Memory>> {
    return this.request<PaginatedResponse<Memory>>({
      method: 'GET',
      path: '/memories',
      params: buildParams(params || {}),
    });
  }

  /**
   * Get all memories using async iteration.
   */
  listAll(params?: ListMemoriesParams): AsyncGenerator<Memory, void, unknown> {
    return paginateIterator(
      (p) => this.list(p),
      params ?? {}
    );
  }

  /**
   * Get a specific memory by ID.
   */
  async get(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'GET',
      path: `/memories/${id}`,
    });
  }

  /**
   * Update a memory.
   */
  async update(id: string, params: UpdateMemoryParams): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'PATCH',
      path: `/memories/${id}`,
      body: params,
    });
  }

  /**
   * Delete a memory.
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'memory');
    return this.request<void>({
      method: 'DELETE',
      path: `/memories/${id}`,
    });
  }

  /**
   * Get memory configuration.
   */
  async getConfig(): Promise<MemoryConfig> {
    return this.request<MemoryConfig>({
      method: 'GET',
      path: '/memories/config',
    });
  }

  /**
   * Get memory statistics.
   */
  async getStats(params?: MemoryStatsParams): Promise<MemoryStats> {
    return this.request<MemoryStats>({
      method: 'GET',
      path: '/memories/stats',
      params: buildParams(params || {}),
    });
  }

  /**
   * Link a resource to a memory.
   */
  async linkResource(
    id: string,
    params: LinkResourceParams
  ): Promise<LinkResourceResult> {
    validateId(id, 'memory');
    validateId(params.resourceId, 'resource');

    return this.request<LinkResourceResult>({
      method: 'POST',
      path: `/memories/${id}/resources`,
      body: {
        resource_id: params.resourceId,
        relationship_type: params.relationshipType,
      },
    });
  }

  /**
   * Get resources linked to a memory.
   */
  async getResources(id: string): Promise<MemoryResourcesResult> {
    validateId(id, 'memory');
    return this.request<MemoryResourcesResult>({
      method: 'GET',
      path: `/memories/${id}/resources`,
    });
  }

  /**
   * Unlink a resource from a memory.
   */
  async unlinkResource(
    id: string,
    resourceId: string
  ): Promise<UnlinkResourceResult> {
    validateId(id, 'memory');
    validateId(resourceId, 'resource');

    return this.request<UnlinkResourceResult>({
      method: 'DELETE',
      path: `/memories/${id}/resources/${resourceId}`,
    });
  }
}
