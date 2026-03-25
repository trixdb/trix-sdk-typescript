/**
 * Tasks resource for managing task objects.
 *
 * Tasks integrate with Trix's memory system for context-aware task management.
 * They support hierarchy (4-level nesting), labels, assignment between humans
 * and AI agents, recurrence, and more.
 *
 * @module resources/tasks
 */

import type {
  Task,
  CreateTaskParams,
  CreateSubtaskParams,
  UpdateTaskParams,
  ListTasksParams,
  GetTaskOptions,
  TaskListResult,
} from '../types.js';
import { buildParams } from './base.js';
import { validateId } from '../utils/security.js';
import { toSnakeCase } from '../utils/case-conversion.js';
import { TasksBulk } from './tasks-bulk.js';

/**
 * Tasks resource for managing task objects.
 *
 * Extends TasksBulk which provides bulk operations, suggestions, and handoff.
 */
export class Tasks extends TasksBulk {
  /**
   * Create a new task.
   *
   * @param params - Task creation parameters
   * @returns Created task
   */
  async create(params: CreateTaskParams): Promise<Task> {
    return this.request<Task>({
      method: 'POST',
      path: '/tasks',
      body: toSnakeCase(params as unknown as Record<string, unknown>),
    });
  }

  /**
   * List tasks with optional filtering.
   *
   * @param params - List parameters including required spaceId
   * @returns Paginated list of tasks
   */
  async list(params: ListTasksParams): Promise<TaskListResult> {
    const apiParams = toSnakeCase(params as unknown as Record<string, unknown>);
    return this.request<TaskListResult>({
      method: 'GET',
      path: '/tasks',
      params: buildParams(apiParams),
    });
  }

  /**
   * Get a task by ID.
   *
   * @param id - Task ID
   * @param options - Options for what relations to include
   * @returns Task object
   */
  async get(id: string, options?: GetTaskOptions): Promise<Task> {
    validateId(id, 'task');
    const params: Record<string, unknown> = {};
    if (options?.includeSubtasks) {
      params.include_subtasks = true;
    }
    if (options?.include) {
      params.include = options.include;
    }
    return this.request<Task>({
      method: 'GET',
      path: `/tasks/${id}`,
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }

  /**
   * Update a task.
   *
   * @param id - Task ID
   * @param params - Update parameters
   * @returns Updated task
   */
  async update(id: string, params: UpdateTaskParams): Promise<Task> {
    validateId(id, 'task');
    return this.request<Task>({
      method: 'PATCH',
      path: `/tasks/${id}`,
      body: toSnakeCase(params as unknown as Record<string, unknown>),
    });
  }

  /**
   * Mark a task as completed.
   *
   * @param id - Task ID
   * @returns Updated task with status 'done'
   */
  async complete(id: string): Promise<Task> {
    return this.update(id, { status: 'done' });
  }

  /**
   * Delete a task (soft delete).
   *
   * @param id - Task ID
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'task');
    return this.request<void>({
      method: 'DELETE',
      path: `/tasks/${id}`,
    });
  }

  /**
   * Create a subtask under a parent task.
   *
   * Tasks can be nested up to 4 levels deep (depth 0-3).
   *
   * @param parentId - Parent task ID
   * @param params - Subtask creation parameters
   * @returns Created subtask
   */
  async createSubtask(parentId: string, params: CreateSubtaskParams): Promise<Task> {
    validateId(parentId, 'task');
    return this.request<Task>({
      method: 'POST',
      path: `/tasks/${parentId}/subtasks`,
      body: toSnakeCase(params as unknown as Record<string, unknown>),
    });
  }

  /**
   * Get subtasks of a parent task.
   *
   * @param parentId - Parent task ID
   * @returns Array of subtasks
   */
  async getSubtasks(parentId: string): Promise<{ subtasks: Task[] }> {
    validateId(parentId, 'task');
    return this.request<{ subtasks: Task[] }>({
      method: 'GET',
      path: `/tasks/${parentId}/subtasks`,
    });
  }
}
