/**
 * Habit type definitions for the Trix SDK (ADR-034).
 *
 * Habits support boolean, numeric, and duration tracking types with
 * compassionate streak calculations including grace days.
 */

import type { PaginationParams } from './common.types.js';

// ============================================================================
// Enums and Constants
// ============================================================================

export type HabitType = 'boolean' | 'numeric' | 'duration';
export type HabitFrequency = 'daily' | 'weekly' | 'specific' | 'interval';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type CompletionSource = 'manual' | 'api' | 'daemon' | 'automation';

// ============================================================================
// Core Types
// ============================================================================

export interface StreakInfo {
  current: number;
  longest: number;
  lastCompletedDate?: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedDate: string;
  value?: number;
  note?: string;
  source: CompletionSource;
  createdAt: string;
}

export interface Habit {
  id: string;
  accountId: string;
  personaId?: string;
  spaceId?: string;
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  habitType: HabitType;
  frequency: HabitFrequency;
  frequencyDays?: number[];
  frequencyInterval?: number;
  targetValue?: number;
  targetUnit?: string;
  timezone: string;
  graceDays: number;
  status: HabitStatus;
  streak?: StreakInfo;
  pausedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Request Parameters
// ============================================================================

export interface CreateHabitParams {
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  habitType?: HabitType;
  frequency?: HabitFrequency;
  frequencyDays?: number[];
  frequencyInterval?: number;
  targetValue?: number;
  targetUnit?: string;
  timezone?: string;
  spaceId?: string;
  graceDays?: number;
}

export interface UpdateHabitParams {
  name?: string;
  description?: string | null;
  emoji?: string | null;
  color?: string | null;
  targetValue?: number | null;
  targetUnit?: string | null;
  graceDays?: number;
}

export interface ListHabitsParams extends PaginationParams {
  status?: HabitStatus;
  spaceId?: string;
}

export interface CheckInParams {
  date?: string;
  value?: number;
  note?: string;
  source?: CompletionSource;
}

export interface HabitHistoryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface HabitListResult {
  habits: Habit[];
  pagination: { total: number; limit: number; offset: number };
}

export interface CheckInResult {
  completion: HabitCompletion;
  streak: StreakInfo;
}

export interface HabitHistoryResult {
  completions: HabitCompletion[];
  streak: StreakInfo;
}

export interface DueHabitsResult {
  habits: Habit[];
  date: string;
}
