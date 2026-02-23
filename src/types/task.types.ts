/**
 * Task type definitions for the Trix SDK.
 *
 * Tasks are actionable items that integrate with Trix's memory system.
 * They support hierarchy (subtasks), labels, recurrence, reminders,
 * and assignment between humans and AI agents.
 */

import type { BaseEntity, PaginationParams } from './common.types.js';

// ============================================================================
// Enums and Constants
// ============================================================================

/**
 * Task status values.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled' | 'stale';

/**
 * Task priority levels (1 = highest, 5 = lowest).
 */
export type TaskPriority = 1 | 2 | 3 | 4 | 5;

/**
 * Assignee type for task assignment.
 */
export type AssigneeType = 'user' | 'agent';

/**
 * Link types for task-entity relationships.
 */
export type TaskLinkType = 'derived_from' | 'produces' | 'related_to' | 'references';

/**
 * Entity types that can be linked to tasks.
 */
export type TaskLinkEntityType = 'memory' | 'session' | 'cluster' | 'space';

// ============================================================================
// Task Entity
// ============================================================================

/**
 * A task label for categorization.
 */
export interface TaskLabel {
  id: string;
  name: string;
  color?: string;
}

/**
 * A link between a task and another entity.
 */
export interface TaskLink {
  id: string;
  taskId: string;
  entityType: TaskLinkEntityType;
  entityId: string;
  linkType: TaskLinkType;
  createdAt: string;
}

/**
 * Task recurrence configuration (RFC 5545 RRULE).
 */
export interface TaskRecurrence {
  taskId: string;
  rrule: string;
  originalString?: string;
  timezone?: string;
  basedOnCompletion: boolean;
  nextOccurrenceAt?: string;
}

/**
 * Task reminder configuration.
 */
export interface TaskReminder {
  id: string;
  taskId: string;
  triggerAt?: string;
  triggerOffset?: string;
  channel: 'push' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
}

/**
 * Task object.
 */
export interface Task extends BaseEntity {
  /** Account ID that owns this task */
  accountId: string;
  /** Space ID the task belongs to */
  spaceId: string;
  /** Section ID within the space (optional) */
  sectionId?: string;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Current status */
  status: TaskStatus;
  /** Priority level (1-5, 1 being highest) */
  priority: TaskPriority;
  /** Estimated duration in minutes */
  estimatedMinutes?: number;
  /** Scheduled start time */
  startAt?: string;
  /** Due date/time */
  dueAt?: string;
  /** When the task was completed */
  completedAt?: string;
  /** Parent task ID for subtask hierarchy */
  parentTaskId?: string;
  /** Nesting depth (0-3) */
  depth: number;
  /** Order among siblings */
  childOrder: number;
  /** Profile ID or API key ID of assignee */
  assigneeId?: string;
  /** Type of assignee */
  assigneeType?: AssigneeType;
  /** Who delegated this task */
  delegatedBy?: string;
  /** When the task was delegated */
  delegatedAt?: string;
  /** Who created the task */
  createdBy: string;
  /** Version for optimistic locking */
  version: number;
  /** Soft delete timestamp */
  deletedAt?: string;
  /** Labels attached to this task */
  labels?: TaskLabel[];
  /** Entity links */
  links?: TaskLink[];
  /** Subtasks (when requested) */
  subtasks?: Task[];
  /** Recurrence configuration (when requested) */
  recurrence?: TaskRecurrence;
  /** Reminders (when requested) */
  reminders?: TaskReminder[];
}

// ============================================================================
// Task Create Parameters
// ============================================================================

/**
 * Parameters for creating a task.
 */
export interface CreateTaskParams {
  /** Task title (required) */
  title: string;
  /** Space ID (required) */
  spaceId: string;
  /** Task description */
  description?: string;
  /** Priority level (1-5) */
  priority?: TaskPriority;
  /** Initial status */
  status?: TaskStatus;
  /** Due date/time (ISO 8601) */
  dueAt?: string;
  /** Parent task ID for creating subtasks */
  parentTaskId?: string;
  /** Section ID within the space */
  sectionId?: string;
  /** Label IDs to attach */
  labels?: string[];
}

/**
 * Parameters for creating a subtask.
 */
export interface CreateSubtaskParams {
  /** Subtask title (required) */
  title: string;
  /** Subtask description */
  description?: string;
  /** Priority level (1-5) */
  priority?: TaskPriority;
  /** Initial status */
  status?: TaskStatus;
  /** Due date/time (ISO 8601) */
  dueAt?: string;
  /** Label IDs to attach */
  labels?: string[];
}

// ============================================================================
// Task Update Parameters
// ============================================================================

/**
 * Parameters for updating a task.
 */
export interface UpdateTaskParams {
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string | null;
  /** Updated status */
  status?: TaskStatus;
  /** Updated priority */
  priority?: TaskPriority;
  /** Updated due date (null to clear) */
  dueAt?: string | null;
  /** Updated section ID (null to clear) */
  sectionId?: string | null;
  /** Replace all labels with these label IDs */
  labels?: string[];
  /** Version for optimistic locking */
  version?: number;
}

// ============================================================================
// Task List Parameters
// ============================================================================

/**
 * Parameters for listing tasks.
 */
export interface ListTasksParams extends PaginationParams {
  /** Space ID (required) */
  spaceId: string;
  /** Filter by status */
  status?: TaskStatus;
  /** Filter by priority */
  priority?: TaskPriority;
  /** Filter by assignee ID */
  assigneeId?: string;
  /** Filter tasks due before this date */
  dueBefore?: string;
  /** Filter tasks due after this date */
  dueAfter?: string;
  /** Filter by parent task ID (null for root tasks only) */
  parentTaskId?: string | null;
  /** Include completed tasks (default: false) */
  includeCompleted?: boolean;
}

// ============================================================================
// Task Get Options
// ============================================================================

/**
 * Options for getting a task.
 */
export interface GetTaskOptions {
  /** Include subtasks in response */
  includeSubtasks?: boolean;
  /** Relations to include (comma-separated: labels,links,subtasks,recurrence,reminders) */
  include?: string;
}

// ============================================================================
// Task List Response
// ============================================================================

/**
 * Response from listing tasks.
 */
export interface TaskListResult {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Task Suggested Parameters
// ============================================================================

/**
 * Parameters for getting suggested tasks.
 */
export interface SuggestedTasksParams {
  /** Context describing what you're working on */
  context?: string;
  /** Filter to specific space */
  spaceId?: string;
  /** Maximum suggestions to return (1-20, default: 5) */
  limit?: number;
  /** Available time in minutes (5-480, default: 60) */
  availableMinutes?: number;
  /** Include tasks assigned to others */
  includeAssignedToOthers?: boolean;
}

/**
 * A suggested task with priority reasoning.
 */
export interface TaskSuggestion {
  task: Task;
  priorityScore: number | null;
  reason: string;
}

/**
 * Response from suggested tasks endpoint.
 */
export interface SuggestedTasksResult {
  suggestions: TaskSuggestion[];
  reasoning: string;
  contextUsed: string | null;
  totalAvailable: number;
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Single task for bulk create.
 */
export interface BulkCreateTaskItem {
  title: string;
  spaceId: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueAt?: string;
  parentTaskId?: string;
  sectionId?: string;
  labels?: string[];
}

/**
 * Single task update for bulk update.
 */
export interface BulkUpdateTaskItem {
  id: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string | null;
  sectionId?: string | null;
  labels?: string[];
}

/**
 * Failed item in bulk operation.
 */
export interface BulkTaskFailure {
  index: number;
  id?: string;
  error: string;
  suggestion?: string;
}

/**
 * Result of bulk create operation.
 */
export interface BulkCreateTasksResult {
  succeeded: Task[];
  failed: BulkTaskFailure[];
}

/**
 * Result of bulk update operation.
 */
export interface BulkUpdateTasksResult {
  succeeded: Task[];
  failed: BulkTaskFailure[];
}

/**
 * Result of bulk delete operation.
 */
export interface BulkDeleteTasksResult {
  success: boolean;
  deletedCount: number;
  deletedIds: string[];
  failed?: BulkTaskFailure[];
}

// ============================================================================
// Task Handoff
// ============================================================================

/**
 * Parameters for handing off a task to another agent.
 */
export interface TaskHandoffParams {
  targetAgentId: string;
  handoffNotes?: string;
  checkpointData?: Record<string, unknown>;
}

/**
 * Result of a task handoff operation.
 */
export interface TaskHandoffResult {
  handoffId: string;
  task: Task;
  previousAssigneeId: string | null;
  newAssigneeId: string;
  checkpointStored: boolean;
}
