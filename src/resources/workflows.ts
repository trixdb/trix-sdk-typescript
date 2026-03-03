/**
 * Workflows resource for automated multi-step process management.
 *
 * @example
 * ```typescript
 * // Create a workflow
 * const workflow = await client.workflows.create({
 *   name: 'Daily digest',
 *   steps: [{ type: 'search', query: 'recent' }],
 * });
 *
 * // Trigger a run
 * const run = await client.workflows.trigger(workflow.id);
 *
 * // List active workflows
 * const active = await client.workflows.list({ status: 'active' });
 * ```
 *
 * @module resources/workflows
 */

import type {
  Workflow,
  CreateWorkflowParams,
  UpdateWorkflowParams,
  ListWorkflowsParams,
  WorkflowListResult,
  WorkflowRun,
  WorkflowRunListResult,
  WorkflowTrigger,
  TriggerWorkflowParams,
  PaginationParams,
} from '../types.js';
import type {
  CreateTriggerParams,
  UpdateTriggerParams,
} from '../types/workflow.types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Workflows extends BaseResource {
  async create(params: CreateWorkflowParams): Promise<Workflow> {
    return this.request<Workflow>({
      method: 'POST',
      path: '/workflows',
      body: params,
    });
  }

  async list(params?: ListWorkflowsParams): Promise<WorkflowListResult> {
    return this.request<WorkflowListResult>({
      method: 'GET',
      path: '/workflows',
      params: buildParams(params || {}),
    });
  }

  async get(workflowId: string): Promise<Workflow> {
    validateId(workflowId, 'workflow');
    return this.request<Workflow>({
      method: 'GET',
      path: `/workflows/${workflowId}`,
    });
  }

  async update(workflowId: string, params: UpdateWorkflowParams): Promise<Workflow> {
    validateId(workflowId, 'workflow');
    return this.request<Workflow>({
      method: 'PATCH',
      path: `/workflows/${workflowId}`,
      body: params,
    });
  }

  async delete(workflowId: string): Promise<void> {
    validateId(workflowId, 'workflow');
    return this.request<void>({
      method: 'DELETE',
      path: `/workflows/${workflowId}`,
    });
  }

  async trigger(workflowId: string, params?: TriggerWorkflowParams): Promise<WorkflowRun> {
    validateId(workflowId, 'workflow');
    return this.request<WorkflowRun>({
      method: 'POST',
      path: `/workflows/${workflowId}/trigger`,
      body: params,
    });
  }

  async listRuns(
    workflowId: string,
    params?: PaginationParams
  ): Promise<WorkflowRunListResult> {
    validateId(workflowId, 'workflow');
    return this.request<WorkflowRunListResult>({
      method: 'GET',
      path: `/workflows/${workflowId}/runs`,
      params: params ? buildParams(params) : undefined,
    });
  }

  async listTriggers(workflowId: string): Promise<WorkflowTrigger[]> {
    validateId(workflowId, 'workflow');
    return this.request<WorkflowTrigger[]>({
      method: 'GET',
      path: `/workflows/${workflowId}/triggers`,
    });
  }

  async createTrigger(
    workflowId: string,
    params: CreateTriggerParams
  ): Promise<WorkflowTrigger> {
    validateId(workflowId, 'workflow');
    return this.request<WorkflowTrigger>({
      method: 'POST',
      path: `/workflows/${workflowId}/triggers`,
      body: params,
    });
  }

  async updateTrigger(
    workflowId: string,
    triggerId: string,
    params: UpdateTriggerParams
  ): Promise<WorkflowTrigger> {
    validateId(workflowId, 'workflow');
    validateId(triggerId, 'trigger');
    return this.request<WorkflowTrigger>({
      method: 'PATCH',
      path: `/workflows/${workflowId}/triggers/${triggerId}`,
      body: params,
    });
  }

  async deleteTrigger(workflowId: string, triggerId: string): Promise<void> {
    validateId(workflowId, 'workflow');
    validateId(triggerId, 'trigger');
    return this.request<void>({
      method: 'DELETE',
      path: `/workflows/${workflowId}/triggers/${triggerId}`,
    });
  }
}
