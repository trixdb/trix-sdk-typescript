/**
 * Memory protection and pinning operations.
 *
 * Provides pin, unpin, protection level, soft delete, and restore operations.
 */

import type { Trix } from '../../client.js';
import type { Memory, ProtectionLevel } from '../../types.js';
import { BaseResource } from '../base.js';
import { validateId } from '../../utils/security.js';

/**
 * Memory protection operations mixin.
 */
export class MemoriesProtection extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Pin a memory to protect it from automatic archival.
   *
   * @param id - Memory ID
   * @returns Updated memory with isPinned set to true
   */
  async pin(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/pin`,
    });
  }

  /**
   * Unpin a memory to allow automatic archival.
   *
   * @param id - Memory ID
   * @returns Updated memory with isPinned set to false
   */
  async unpin(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/unpin`,
    });
  }

  /**
   * Set protection level for a memory.
   *
   * Protection levels:
   * - 'none': No protection, can be deleted normally
   * - 'soft': Protected from automatic cleanup, can be manually deleted
   * - 'hard': Fully protected, requires explicit unprotection before deletion
   *
   * @param id - Memory ID
   * @param level - Protection level to set
   * @returns Updated memory with new protection level
   */
  async setProtectionLevel(id: string, level: ProtectionLevel): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/protection`,
      body: { level },
    });
  }

  /**
   * Soft delete a memory (mark as deleted without permanent removal).
   *
   * Soft-deleted memories can be restored with `restore()`.
   * Use `delete()` for permanent deletion.
   *
   * @param id - Memory ID
   * @returns Memory with isDeleted set to true
   */
  async softDelete(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/soft-delete`,
    });
  }

  /**
   * Restore a soft-deleted memory.
   *
   * @param id - Memory ID
   * @returns Restored memory with isDeleted set to false
   */
  async restore(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/restore`,
    });
  }
}
