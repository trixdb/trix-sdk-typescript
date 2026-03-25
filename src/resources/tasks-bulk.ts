/**
 * Bulk operations, suggestions, and handoff for the Tasks resource.
 */

import type {
  SuggestedTasksParams,
  SuggestedTasksResult,
  BulkCreateTaskItem,
  BulkUpdateTaskItem,
  BulkCreateTasksResult,
  BulkUpdateTasksResult,
  BulkDeleteTasksResult,
  TaskHandoffParams,
  TaskHandoffResult,
} from '../types.js';
import { BaseResource, validateBulkArray } from './base.js';
import { validateId } from '../utils/security.js';
import { toSnakeCase } from '../utils/case-conversion.js';

/**
 * Bulk and AI operations for tasks.
 *
 * This class is mixed into the Tasks resource and should not be
 * instantiated directly.
 */
export class TasksBulk extends BaseResource {
  /**
   * Get AI-prioritized task suggestions.
   *
   * Returns recommended tasks based on context, priority, due dates,
   * and linked memories. Useful for agents to decide what to work on.
   *
   * @param params - Suggestion parameters
   * @returns Prioritized task suggestions with reasoning
   */
  async suggested(params?: SuggestedTasksParams): Promise<SuggestedTasksResult> {
    const apiParams: Record<string, unknown> = {};
    if (params?.context) apiParams.context = params.context;
    if (params?.spaceId) apiParams.space_id = params.spaceId;
    if (params?.limit) apiParams.limit = params.limit;
    if (params?.availableMinutes) apiParams.available_minutes = params.availableMinutes;
    if (params?.includeAssignedToOthers !== undefined) {
      apiParams.include_assigned_to_others = params.includeAssignedToOthers;
    }

    return this.request<SuggestedTasksResult>({
      method: 'GET',
      path: '/tasks/suggested',
      params: Object.keys(apiParams).length > 0 ? apiParams : undefined,
    });
  }

  /**
   * Bulk create multiple tasks atomically.
   *
   * Creates up to 100 tasks in a single transaction.
   *
   * @param tasks - Array of task creation parameters
   * @returns Result with succeeded tasks and failed items
   * @throws Error if array is empty or exceeds limit
   */
  async bulkCreate(tasks: BulkCreateTaskItem[]): Promise<BulkCreateTasksResult> {
    validateBulkArray(tasks, 'bulkCreate', 100);

    const apiTasks = tasks.map((task) =>
      toSnakeCase(task as unknown as Record<string, unknown>)
    );

    return this.request<BulkCreateTasksResult>({
      method: 'POST',
      path: '/tasks/bulk',
      body: { tasks: apiTasks },
    });
  }

  /**
   * Bulk update multiple tasks atomically.
   *
   * Updates up to 100 tasks in a single transaction.
   *
   * @param updates - Array of task updates with IDs
   * @returns Result with succeeded tasks and failed items
   * @throws Error if array is empty or exceeds limit
   */
  async bulkUpdate(updates: BulkUpdateTaskItem[]): Promise<BulkUpdateTasksResult> {
    validateBulkArray(updates, 'bulkUpdate', 100);

    updates.forEach((update, index) => {
      if (!update.id) {
        throw new Error(`Update at index ${index} is missing an id`);
      }
      validateId(update.id, `task[${index}]`);
    });

    const apiUpdates = updates.map((update) =>
      toSnakeCase(update as unknown as Record<string, unknown>)
    );

    return this.request<BulkUpdateTasksResult>({
      method: 'PATCH',
      path: '/tasks/bulk',
      body: { updates: apiUpdates },
    });
  }

  /**
   * Bulk delete multiple tasks atomically.
   *
   * Soft-deletes up to 100 tasks in a single transaction.
   *
   * @param ids - Array of task IDs to delete
   * @param options - Delete options
   * @returns Result with deleted IDs and failed items
   * @throws Error if array is empty or exceeds limit
   */
  async bulkDelete(
    ids: string[],
    options?: { cascade?: boolean }
  ): Promise<BulkDeleteTasksResult> {
    validateBulkArray(ids, 'bulkDelete', 100);

    ids.forEach((id, index) => {
      validateId(id, `task[${index}]`);
    });

    return this.request<BulkDeleteTasksResult>({
      method: 'DELETE',
      path: '/tasks/bulk',
      body: {
        ids,
        cascade: options?.cascade ?? true,
      },
    });
  }

  /**
   * Hand off a task to another agent.
   *
   * Transfers task assignment to a different agent, optionally storing
   * handoff notes and checkpoint data for continuity.
   *
   * @param taskId - Task ID
   * @param params - Handoff parameters
   * @returns Handoff result with task and metadata
   */
  async handoff(taskId: string, params: TaskHandoffParams): Promise<TaskHandoffResult> {
    validateId(taskId, 'task');
    return this.request<TaskHandoffResult>({
      method: 'POST',
      path: `/tasks/${taskId}/handoff`,
      body: toSnakeCase(params as unknown as Record<string, unknown>),
    });
  }
}
