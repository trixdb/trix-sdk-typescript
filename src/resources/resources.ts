import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';
import type {
  Resource,
  CreateResourceParams,
  UpdateResourceParams,
  ListResourcesParams,
  ResourceListResult,
  ResourceMemoriesResult,
} from '../types.js';

/**
 * Resources API - Manage resources (projects, topics, etc.) and their relationships with memories
 */
export class Resources extends BaseResource {
  /**
   * Create a new resource
   *
   * @param params - Resource creation parameters
   * @returns The created resource
   *
   * @example
   * ```ts
   * const resource = await client.resources.create({
   *   name: 'My Project',
   *   type: 'project',
   *   description: 'Project description',
   *   metadata: { key: 'value' }
   * });
   * ```
   */
  async create(params: CreateResourceParams): Promise<Resource> {
    return this.request<Resource>({
      method: 'POST',
      path: '/resources',
      body: params,
    });
  }

  /**
   * List resources with optional filtering and pagination
   *
   * @param params - List parameters
   * @returns Paginated list of resources
   *
   * @example
   * ```ts
   * const result = await client.resources.list({
   *   type: 'project',
   *   search: 'my project',
   *   sort: 'name',
   *   order: 'asc',
   *   limit: 50
   * });
   * ```
   */
  async list(params?: ListResourcesParams): Promise<ResourceListResult> {
    return this.request<ResourceListResult>({
      method: 'GET',
      path: '/resources',
      params: buildParams(params || {}),
    });
  }

  /**
   * Get a resource by ID
   *
   * @param id - Resource ID
   * @returns The resource
   *
   * @example
   * ```ts
   * const resource = await client.resources.get('res_123456');
   * ```
   */
  async get(id: string): Promise<Resource> {
    validateId(id, 'resource');
    return this.request<Resource>({
      method: 'GET',
      path: `/resources/${id}`,
    });
  }

  /**
   * Update a resource
   *
   * @param id - Resource ID
   * @param params - Update parameters
   * @returns The updated resource
   *
   * @example
   * ```ts
   * const updated = await client.resources.update('res_123456', {
   *   name: 'Updated Name',
   *   description: 'New description'
   * });
   * ```
   */
  async update(
    id: string,
    params: UpdateResourceParams
  ): Promise<Resource> {
    validateId(id, 'resource');
    return this.request<Resource>({
      method: 'PATCH',
      path: `/resources/${id}`,
      body: params,
    });
  }

  /**
   * Delete a resource
   *
   * @param id - Resource ID
   *
   * @example
   * ```ts
   * await client.resources.delete('res_123456');
   * ```
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'resource');
    return this.request<void>({
      method: 'DELETE',
      path: `/resources/${id}`,
    });
  }

  /**
   * Get memories linked to a resource
   *
   * @param id - Resource ID
   * @param params - Pagination parameters
   * @returns List of memories linked to this resource
   *
   * @example
   * ```ts
   * const result = await client.resources.getMemories('res_123456', {
   *   limit: 50,
   *   offset: 0
   * });
   * ```
   */
  async getMemories(
    id: string,
    params?: { limit?: number; offset?: number }
  ): Promise<ResourceMemoriesResult> {
    validateId(id, 'resource');
    return this.request<ResourceMemoriesResult>({
      method: 'GET',
      path: `/resources/${id}/memories`,
      params: params || {},
    });
  }
}
