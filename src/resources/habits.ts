/**
 * Habits resource for personal habit tracking (ADR-034).
 *
 * @example
 * ```typescript
 * // Create a habit
 * const habit = await client.habits.create({
 *   name: 'Read for 30 minutes',
 *   habitType: 'duration',
 *   targetValue: 30,
 *   targetUnit: 'minutes',
 * });
 *
 * // Check in today
 * await client.habits.checkIn(habit.id, { value: 45 });
 *
 * // Get due habits
 * const due = await client.habits.due();
 * ```
 *
 * @module resources/habits
 */

import type {
  Habit,
  CreateHabitParams,
  UpdateHabitParams,
  ListHabitsParams,
  CheckInParams,
  CheckInResult,
  HabitHistoryParams,
  HabitHistoryResult,
  HabitListResult,
  DueHabitsResult,
  HabitAnalytics,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';
import { toSnakeCase } from '../utils/case-conversion.js';

export class Habits extends BaseResource {
  async create(params: CreateHabitParams): Promise<Habit> {
    return this.request<Habit>({
      method: 'POST',
      path: '/habits',
      body: toSnakeCase(params as unknown as Record<string, unknown>),
    });
  }

  async list(params?: ListHabitsParams): Promise<HabitListResult> {
    const apiParams = params ? toSnakeCase(params as unknown as Record<string, unknown>) : {};
    return this.request<HabitListResult>({
      method: 'GET',
      path: '/habits',
      params: buildParams(apiParams),
    });
  }

  async get(id: string): Promise<Habit> {
    validateId(id, 'habit');
    return this.request<Habit>({
      method: 'GET',
      path: `/habits/${id}`,
    });
  }

  async update(id: string, params: UpdateHabitParams): Promise<Habit> {
    validateId(id, 'habit');
    return this.request<Habit>({
      method: 'PATCH',
      path: `/habits/${id}`,
      body: toSnakeCase(params as unknown as Record<string, unknown>),
    });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'habit');
    return this.request<void>({
      method: 'DELETE',
      path: `/habits/${id}`,
    });
  }

  async checkIn(habitId: string, params?: CheckInParams): Promise<CheckInResult> {
    validateId(habitId, 'habit');
    return this.request<CheckInResult>({
      method: 'POST',
      path: `/habits/${habitId}/check-in`,
      body: params ? toSnakeCase(params as unknown as Record<string, unknown>) : undefined,
    });
  }

  async uncheck(habitId: string, date: string): Promise<void> {
    validateId(habitId, 'habit');
    return this.request<void>({
      method: 'DELETE',
      path: `/habits/${habitId}/check-in/${date}`,
    });
  }

  async history(habitId: string, params?: HabitHistoryParams): Promise<HabitHistoryResult> {
    validateId(habitId, 'habit');
    const apiParams = params ? toSnakeCase(params as unknown as Record<string, unknown>) : {};
    return this.request<HabitHistoryResult>({
      method: 'GET',
      path: `/habits/${habitId}/history`,
      params: Object.keys(apiParams).length > 0 ? apiParams : undefined,
    });
  }

  async due(date?: string): Promise<DueHabitsResult> {
    return this.request<DueHabitsResult>({
      method: 'GET',
      path: '/habits/due',
      params: date ? { date } : undefined,
    });
  }

  async analytics(id: string): Promise<HabitAnalytics> {
    validateId(id, 'habit');
    return this.request<HabitAnalytics>({
      method: 'GET',
      path: `/habits/${id}/analytics`,
    });
  }

  async pause(id: string): Promise<Habit> {
    validateId(id, 'habit');
    return this.request<Habit>({
      method: 'POST',
      path: `/habits/${id}/pause`,
    });
  }

  async resume(id: string): Promise<Habit> {
    validateId(id, 'habit');
    return this.request<Habit>({
      method: 'POST',
      path: `/habits/${id}/resume`,
    });
  }
}
