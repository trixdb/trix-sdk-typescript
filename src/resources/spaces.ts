/**
 * Spaces resource
 */

import type { Trix } from '../client.js';
import type {
  Space,
  CreateSpaceParams,
  UpdateSpaceParams,
} from '../types.js';
import { BaseResource } from './base.js';
import { validateId } from '../utils/security.js';

/**
 * Spaces resource for managing isolated knowledge spaces
 *
 * Spaces allow you to organize memories into separate containers,
 * enabling multi-tenancy or logical separation of knowledge bases.
 *
 * @example
 * ```typescript
 * const space = await client.spaces.create({
 *   name: 'Personal',
 *   description: 'My personal knowledge base'
 * });
 * ```
 */
export class Spaces extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a new space
   *
   * @param params - Space creation parameters
   * @returns Created space
   *
   * @example
   * ```typescript
   * const space = await client.spaces.create({
   *   name: 'Work Projects',
   *   description: 'Professional knowledge base',
   *   metadata: { department: 'engineering' }
   * });
   * ```
   */
  async create(params: CreateSpaceParams): Promise<Space> {
    return this.request<Space>({
      method: 'POST',
      path: '/spaces',
      body: params,
    });
  }

  /**
   * List all spaces
   *
   * @returns Array of spaces
   *
   * @example
   * ```typescript
   * const spaces = await client.spaces.list();
   * console.log(`You have ${spaces.length} spaces`);
   * ```
   */
  async list(): Promise<Space[]> {
    return this.request<Space[]>({
      method: 'GET',
      path: '/spaces',
    });
  }

  /**
   * Get a specific space by ID
   *
   * @param id - Space ID
   * @returns Space object
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if space doesn't exist
   *
   * @example
   * ```typescript
   * const space = await client.spaces.get('space_123');
   * ```
   */
  async get(id: string): Promise<Space> {
    validateId(id, 'space');
    return this.request<Space>({
      method: 'GET',
      path: `/spaces/${id}`,
    });
  }

  /**
   * Update a space
   *
   * @param id - Space ID
   * @param params - Update parameters
   * @returns Updated space
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if space doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await client.spaces.update('space_123', {
   *   name: 'Updated Name'
   * });
   * ```
   */
  async update(id: string, params: UpdateSpaceParams): Promise<Space> {
    validateId(id, 'space');
    return this.request<Space>({
      method: 'PATCH',
      path: `/spaces/${id}`,
      body: params,
    });
  }

  /**
   * Delete a space
   *
   * @param id - Space ID
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if space doesn't exist
   *
   * @example
   * ```typescript
   * await client.spaces.delete('space_123');
   * ```
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'space');
    return this.request<void>({
      method: 'DELETE',
      path: `/spaces/${id}`,
    });
  }
}
