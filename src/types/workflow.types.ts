/**
 * Workflow type definitions for the Trix SDK.
 *
 * Workflows support automated multi-step processes with cron and
 * event-based triggers, run tracking, and step state management.
 */

import type { PaginationParams } from './common.types.js';

// ============================================================================
// Enums and Constants
// ============================================================================

export type WorkflowStatus = 'active' | 'paused' | 'archived';
export type WorkflowRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
export type WorkflowTriggerType = 'cron' | 'event';

// ============================================================================
// Core Types
// ============================================================================

export interface Workflow {
  id: string;
  accountId: string;
  spaceId: string | null;
  name: string;
  description: string | null;
  trigger: Record<string, unknown> | null;
  steps: Record<string, unknown>[];
  status: WorkflowStatus;
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  accountId: string;
  status: WorkflowRunStatus;
  triggeredBy: string;
  triggeredById: string | null;
  stepStates: Record<string, unknown>;
  input: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
}

export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  type: WorkflowTriggerType;
  cronExpression: string | null;
  timezone: string;
  eventTypes: string[] | null;
  eventFilter: Record<string, unknown> | null;
  enabled: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

// ============================================================================
// Request Parameters
// ============================================================================

export interface CreateWorkflowParams {
  name: string;
  description?: string;
  spaceId?: string;
  trigger?: Record<string, unknown>;
  steps: Record<string, unknown>[];
}

export interface UpdateWorkflowParams {
  version: number;
  name?: string;
  description?: string | null;
  status?: WorkflowStatus;
  trigger?: Record<string, unknown> | null;
  steps?: Record<string, unknown>[];
}

export interface ListWorkflowsParams extends PaginationParams {
  status?: WorkflowStatus;
  spaceId?: string;
}

export interface TriggerWorkflowParams {
  input?: Record<string, unknown>;
}

export interface CreateTriggerParams {
  type: WorkflowTriggerType;
  cronExpression?: string;
  timezone?: string;
  eventTypes?: string[];
  eventFilter?: Record<string, unknown>;
  enabled?: boolean;
}

export interface UpdateTriggerParams {
  cronExpression?: string;
  timezone?: string;
  eventTypes?: string[];
  eventFilter?: Record<string, unknown>;
  enabled?: boolean;
}

// ============================================================================
// Response Types
// ============================================================================

export interface WorkflowListResult {
  workflows: Workflow[];
  total: number;
  limit: number;
  offset: number;
}

export interface WorkflowRunListResult {
  runs: WorkflowRun[];
  total: number;
  limit: number;
  offset: number;
}
