/**
 * Tasks resource for managing task objects.
 *
 * Tasks integrate with Trix's memory system for context-aware task management.
 * They support hierarchy (4-level nesting), labels, assignment between humans
 * and AI agents, recurrence, and more.
 *
 * @example
 * ```typescript
 * // Create a task
 * const task = await client.tasks.create({
 *   title: 'Review research notes',
 *   spaceId: 'space_123',
 *   priority: 2,
 *   dueAt: '2026-02-01T09:00:00Z'
 * });
 *
 * // List pending tasks
 * const result = await client.tasks.list({
 *   spaceId: 'space_123',
 *   status: 'pending',
 *   limit: 20
 * });
 *
 * // Complete a task
 * await client.tasks.complete(task.id);
 * ```
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
import { BaseResource, buildParams, validateBulkArray } from './base.js';
import { validateId } from '../utils/security.js';
import { toSnakeCase } from '../utils/case-conversion.js';

/**
 * Tasks resource for managing task objects.
 *
 * @example
 * ```typescript
 * const task = await client.tasks.create({
 *   title: 'Important task',
 *   spaceId: 'space_123',
 *   priority: 1
 * });
 * ```
 */
export class Tasks extends BaseResource {
  /**
   * Create a new task.
   *
   * @param params - Task creation parameters
   * @returns Created task
   *
   * @throws ValidationError if required parameters are missing
   * @throws NotFoundError if space doesn't exist
   * @throws PermissionError if user lacks write access to space
   *
   * @example
   * ```typescript
   * const task = await client.tasks.create({
   *   title: 'Review quarterly report',
   *   spaceId: 'space_123',
   *   priority: 2,
   *   dueAt: '2026-02-01T17:00:00Z',
   *   labels: ['label_abc', 'label_def']
   * });
   * ```
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
   *
   * @throws ValidationError if spaceId is missing
   * @throws PermissionError if user lacks access to space
   *
   * @example
   * ```typescript
   * // List all pending tasks in a space
   * const result = await client.tasks.list({
   *   spaceId: 'space_123',
   *   status: 'pending',
   *   limit: 50
   * });
   *
   * // List overdue tasks
   * const overdue = await client.tasks.list({
   *   spaceId: 'space_123',
   *   dueBefore: new Date().toISOString(),
   *   includeCompleted: false
   * });
   * ```
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
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if task doesn't exist
   * @throws PermissionError if user lacks access to task
   *
   * @example
   * ```typescript
   * // Get task with all relations
   * const task = await client.tasks.get('task_123', {
   *   include: 'labels,links,subtasks,recurrence,reminders'
   * });
   *
   * // Get task with subtasks only
   * const task = await client.tasks.get('task_123', {
   *   includeSubtasks: true
   * });
   * ```
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
   * Supports optimistic locking via the `version` parameter. If provided,
   * the update will fail with a 409 Conflict if the task has been modified
   * since you last read it.
   *
   * @param id - Task ID
   * @param params - Update parameters
   * @returns Updated task
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if task doesn't exist
   * @throws PermissionError if user lacks write access
   * @throws APIError with status 409 if version conflict
   *
   * @example
   * ```typescript
   * // Simple update
   * const updated = await client.tasks.update('task_123', {
   *   status: 'in_progress',
   *   priority: 1
   * });
   *
   * // Update with optimistic locking
   * const task = await client.tasks.get('task_123');
   * const updated = await client.tasks.update('task_123', {
   *   title: 'Updated title',
   *   version: task.version
   * });
   * ```
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
   * Convenience method that sets status to 'done'.
   *
   * @param id - Task ID
   * @returns Updated task with status 'done'
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if task doesn't exist
   * @throws PermissionError if user lacks write access
   *
   * @example
   * ```typescript
   * const completed = await client.tasks.complete('task_123');
   * console.log(completed.status); // 'done'
   * console.log(completed.completedAt); // ISO timestamp
   * ```
   */
  async complete(id: string): Promise<Task> {
    return this.update(id, { status: 'done' });
  }

  /**
   * Delete a task (soft delete).
   *
   * The task and its subtasks are marked as deleted but can be recovered.
   *
   * @param id - Task ID
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if task doesn't exist
   * @throws PermissionError if user lacks write access
   *
   * @example
   * ```typescript
   * await client.tasks.delete('task_123');
   * ```
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
   *
   * @throws ValidationError if parent ID is invalid
   * @throws NotFoundError if parent task doesn't exist
   * @throws APIError if maximum nesting depth exceeded
   *
   * @example
   * ```typescript
   * const subtask = await client.tasks.createSubtask('task_123', {
   *   title: 'Sub-item 1',
   *   priority: 3
   * });
   * ```
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
   *
   * @throws ValidationError if parent ID is invalid
   * @throws NotFoundError if parent task doesn't exist
   *
   * @example
   * ```typescript
   * const { subtasks } = await client.tasks.getSubtasks('task_123');
   * console.log(`${subtasks.length} subtasks found`);
   * ```
   */
  async getSubtasks(parentId: string): Promise<{ subtasks: Task[] }> {
    validateId(parentId, 'task');
    return this.request<{ subtasks: Task[] }>({
      method: 'GET',
      path: `/tasks/${parentId}/subtasks`,
    });
  }

  /**
   * Get AI-prioritized task suggestions.
   *
   * Returns recommended tasks based on context, priority, due dates,
   * and linked memories. Useful for agents to decide what to work on.
   *
   * @param params - Suggestion parameters
   * @returns Prioritized task suggestions with reasoning
   *
   * @example
   * ```typescript
   * const { suggestions } = await client.tasks.suggested({
   *   context: 'Working on quarterly planning',
   *   spaceId: 'space_123',
   *   limit: 5,
   *   availableMinutes: 120
   * });
   *
   * for (const { task, reason } of suggestions) {
   *   console.log(`${task.title}: ${reason}`);
   * }
   * ```
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
   * Creates up to 100 tasks in a single transaction. If validation fails
   * for some tasks, successfully created tasks are returned along with
   * error details for failed ones.
   *
   * @param tasks - Array of task creation parameters
   * @returns Result with succeeded tasks and failed items
   *
   * @throws Error if array is empty or exceeds limit
   *
   * @example
   * ```typescript
   * const result = await client.tasks.bulkCreate([
   *   { title: 'Task 1', spaceId: 'space_123' },
   *   { title: 'Task 2', spaceId: 'space_123' },
   *   { title: 'Task 3', spaceId: 'space_123' }
   * ]);
   *
   * console.log(`Created: ${result.succeeded.length}`);
   * console.log(`Failed: ${result.failed.length}`);
   * ```
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
   * Updates up to 100 tasks in a single transaction. Each update must
   * include the task ID.
   *
   * @param updates - Array of task updates with IDs
   * @returns Result with succeeded tasks and failed items
   *
   * @throws Error if array is empty or exceeds limit
   *
   * @example
   * ```typescript
   * const result = await client.tasks.bulkUpdate([
   *   { id: 'task_1', status: 'done' },
   *   { id: 'task_2', priority: 1 },
   *   { id: 'task_3', labels: ['label_123'] }
   * ]);
   * ```
   */
  async bulkUpdate(updates: BulkUpdateTaskItem[]): Promise<BulkUpdateTasksResult> {
    validateBulkArray(updates, 'bulkUpdate', 100);

    // Validate all IDs
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
   * Soft-deletes up to 100 tasks in a single transaction. By default,
   * subtasks are also deleted (cascade).
   *
   * @param ids - Array of task IDs to delete
   * @param options - Delete options
   * @returns Result with deleted IDs and failed items
   *
   * @throws Error if array is empty or exceeds limit
   *
   * @example
   * ```typescript
   * const result = await client.tasks.bulkDelete(['task_1', 'task_2', 'task_3']);
   *
   * console.log(`Deleted: ${result.deletedCount}`);
   * if (result.failed?.length) {
   *   console.log('Some deletions failed:', result.failed);
   * }
   * ```
   */
  /**
   * Hand off a task to another agent.
   *
   * Transfers task assignment to a different agent, optionally storing
   * handoff notes and checkpoint data for continuity.
   *
   * @param taskId - Task ID
   * @param params - Handoff parameters
   * @returns Handoff result with task and metadata
   *
   * @throws ValidationError if task ID format is invalid
   * @throws NotFoundError if task doesn't exist
   * @throws PermissionError if user lacks write access
   *
   * @example
   * ```typescript
   * const result = await client.tasks.handoff('task_123', {
   *   targetAgentId: 'agent_456',
   *   handoffNotes: 'Completed research phase, ready for writing',
   *   checkpointData: { researchUrls: ['https://example.com'] }
   * });
   * ```
   */
  async handoff(taskId: string, params: TaskHandoffParams): Promise<TaskHandoffResult> {
    validateId(taskId, 'task');
    return this.request<TaskHandoffResult>({
      method: 'POST',
      path: `/tasks/${taskId}/handoff`,
      body: toSnakeCase(params as unknown as Record<string, unknown>),
    });
  }

  async bulkDelete(
    ids: string[],
    options?: { cascade?: boolean }
  ): Promise<BulkDeleteTasksResult> {
    validateBulkArray(ids, 'bulkDelete', 100);

    // Validate all IDs
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
}
