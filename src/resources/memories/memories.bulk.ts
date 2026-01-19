/**
 * Memory bulk operations.
 *
 * Provides bulk create, update, and delete operations for memories.
 */

import type { Trix } from '../../client.js';
import type {
  CreateMemoryParams,
  UpdateMemoryParams,
  BulkResult,
} from '../../types.js';
import { BaseResource, validateBulkArray, validateIds } from '../base.js';
import { validateId } from '../../utils/security.js';

/**
 * Memory bulk operations mixin.
 */
export class MemoriesBulk extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Bulk create memories.
   *
   * @param memories - Array of memory creation parameters
   * @returns Bulk operation result
   * @throws Error if array is empty or exceeds limit (1000)
   */
  async bulkCreate(memories: CreateMemoryParams[]): Promise<BulkResult> {
    validateBulkArray(memories, 'bulkCreate');
    return this.request<BulkResult>({
      method: 'POST',
      path: '/memories/bulk',
      body: { memories },
    });
  }

  /**
   * Bulk update memories.
   *
   * @param updates - Array of memory updates (must include id in each object)
   * @returns Bulk operation result
   * @throws Error if array is empty or exceeds limit (1000)
   */
  async bulkUpdate(updates: UpdateMemoryParams[]): Promise<BulkResult> {
    validateBulkArray(updates, 'bulkUpdate');
    updates.forEach((update, index) => {
      if (!update.id) {
        throw new Error(`Update at index ${index} is missing an id`);
      }
      validateId(update.id, `memory[${index}]`);
    });
    return this.request<BulkResult>({
      method: 'PATCH',
      path: '/memories/bulk',
      body: { updates },
    });
  }

  /**
   * Bulk delete memories.
   *
   * @param ids - Array of memory IDs to delete
   * @returns Bulk operation result
   * @throws Error if array is empty or exceeds limit (1000)
   */
  async bulkDelete(ids: string[]): Promise<BulkResult> {
    validateBulkArray(ids, 'bulkDelete');
    validateIds(ids, 'memory');
    return this.request<BulkResult>({
      method: 'DELETE',
      path: '/memories/bulk',
      body: { ids },
    });
  }
}
