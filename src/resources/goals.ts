/**
 * Goals resource for goal tracking and progress management (ADR-035).
 *
 * @example
 * ```typescript
 * // Create a goal
 * const goal = await client.goals.create({
 *   title: 'Learn TypeScript',
 *   goalType: 'learning',
 *   targetDate: '2026-06-01',
 * });
 *
 * // Update progress
 * await client.goals.updateProgress(goal.id, { progress: 50 });
 *
 * // List active goals
 * const active = await client.goals.list({ status: 'active' });
 * ```
 *
 * @module resources/goals
 */

import type {
  Goal,
  CreateGoalParams,
  CreateKeyResultParams,
  UpdateGoalParams,
  ListGoalsParams,
  GoalListResult,
  GoalProgressUpdateParams,
  GoalStatusTransitionParams,
  GoalContributor,
  GoalContributorCreateParams,
  GoalContributorUpdateParams,
  PaceAnalysis,
  PaginationParams,
  ProgressHistoryParams,
  ProgressHistoryResult,
  GoalMemoryLink,
  GoalMemoryLinkType,
  GoalMemoryListResponse,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Goals extends BaseResource {
  async create(params: CreateGoalParams): Promise<Goal> {
    return this.request<Goal>({
      method: 'POST',
      path: '/goals',
      body: params,
    });
  }

  async list(params?: ListGoalsParams): Promise<GoalListResult> {
    return this.request<GoalListResult>({
      method: 'GET',
      path: '/goals',
      params: buildParams(params || {}),
    });
  }

  async get(goalId: string): Promise<Goal> {
    validateId(goalId, 'goal');
    return this.request<Goal>({
      method: 'GET',
      path: `/goals/${goalId}`,
    });
  }

  async update(goalId: string, params: UpdateGoalParams): Promise<Goal> {
    validateId(goalId, 'goal');
    return this.request<Goal>({
      method: 'PATCH',
      path: `/goals/${goalId}`,
      body: params,
    });
  }

  async delete(goalId: string): Promise<void> {
    validateId(goalId, 'goal');
    return this.request<void>({
      method: 'DELETE',
      path: `/goals/${goalId}`,
    });
  }

  async updateProgress(
    goalId: string,
    params: GoalProgressUpdateParams
  ): Promise<Goal> {
    validateId(goalId, 'goal');
    return this.request<Goal>({
      method: 'POST',
      path: `/goals/${goalId}/progress`,
      body: params,
    });
  }

  async transitionStatus(
    goalId: string,
    params: GoalStatusTransitionParams
  ): Promise<Goal> {
    validateId(goalId, 'goal');
    return this.request<Goal>({
      method: 'POST',
      path: `/goals/${goalId}/status`,
      body: params,
    });
  }

  async getProgressHistory(
    goalId: string,
    params?: ProgressHistoryParams
  ): Promise<ProgressHistoryResult> {
    validateId(goalId, 'goal');
    return this.request<ProgressHistoryResult>({
      method: 'GET',
      path: `/goals/${goalId}/progress-history`,
      params: params ? buildParams(params) : undefined,
    });
  }

  async listContributors(goalId: string): Promise<GoalContributor[]> {
    validateId(goalId, 'goal');
    return this.request<GoalContributor[]>({
      method: 'GET',
      path: `/goals/${goalId}/contributors`,
    });
  }

  async addContributor(
    goalId: string,
    params: GoalContributorCreateParams
  ): Promise<GoalContributor> {
    validateId(goalId, 'goal');
    return this.request<GoalContributor>({
      method: 'POST',
      path: `/goals/${goalId}/contributors`,
      body: params,
    });
  }

  async updateContributor(
    goalId: string,
    personaId: string,
    params: GoalContributorUpdateParams
  ): Promise<GoalContributor> {
    validateId(goalId, 'goal');
    validateId(personaId, 'persona');
    return this.request<GoalContributor>({
      method: 'PATCH',
      path: `/goals/${goalId}/contributors/${personaId}`,
      body: params,
    });
  }

  async removeContributor(goalId: string, personaId: string): Promise<void> {
    validateId(goalId, 'goal');
    validateId(personaId, 'persona');
    return this.request<void>({
      method: 'DELETE',
      path: `/goals/${goalId}/contributors/${personaId}`,
    });
  }

  async addKeyResult(goalId: string, params: CreateKeyResultParams): Promise<Goal> {
    validateId(goalId, 'goal');
    return this.request<Goal>({
      method: 'POST',
      path: `/goals/${goalId}/key-results`,
      body: params,
    });
  }

  async getTree(goalId: string): Promise<Goal[]> {
    validateId(goalId, 'goal');
    return this.request<Goal[]>({
      method: 'GET',
      path: `/goals/${goalId}/tree`,
    });
  }

  async getChildren(goalId: string): Promise<Goal[]> {
    validateId(goalId, 'goal');
    return this.request<Goal[]>({
      method: 'GET',
      path: `/goals/${goalId}/children`,
    });
  }

  async getPace(goalId: string): Promise<PaceAnalysis> {
    validateId(goalId, 'goal');
    return this.request<PaceAnalysis>({
      method: 'GET',
      path: `/goals/${goalId}/pace`,
    });
  }

  async linkMemory(
    goalId: string,
    memoryId: string,
    linkType: GoalMemoryLinkType = 'related'
  ): Promise<GoalMemoryLink> {
    validateId(goalId, 'goal');
    return this.request<GoalMemoryLink>({
      method: 'POST',
      path: `/goals/${goalId}/memories`,
      body: { memory_id: memoryId, link_type: linkType },
    });
  }

  async unlinkMemory(goalId: string, memoryId: string): Promise<void> {
    validateId(goalId, 'goal');
    return this.request<void>({
      method: 'DELETE',
      path: `/goals/${goalId}/memories/${memoryId}`,
    });
  }

  async getMemories(
    goalId: string,
    params?: PaginationParams
  ): Promise<GoalMemoryListResponse> {
    validateId(goalId, 'goal');
    return this.request<GoalMemoryListResponse>({
      method: 'GET',
      path: `/goals/${goalId}/memories`,
      params: params ? buildParams(params) : undefined,
    });
  }
}
