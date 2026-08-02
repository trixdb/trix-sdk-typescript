/**
 * Goal type definitions for the Trix SDK (ADR-035).
 *
 * Goals support outcome, process, and learning types with hierarchical
 * sub-goals, contributor tracking, and progress history.
 */

import type { PaginationParams } from './common.types.js';

// ============================================================================
// Enums and Constants
// ============================================================================

export type GoalType = 'outcome' | 'process' | 'learning';
export type GoalStatus = 'draft' | 'active' | 'completed' | 'paused' | 'abandoned';
export type GoalVisibility = 'private' | 'space' | 'account';
export type GoalProgressType = 'manual' | 'key_results' | 'tasks' | 'habits';

// ============================================================================
// Core Types
// ============================================================================

export interface GoalContributor {
  goalId: string;
  personaId: string;
  personaName: string;
  role: string;
  canUpdateProgress: boolean;
  addedAt: string;
}

export interface Goal {
  id: string;
  accountId: string;
  spaceId: string | null;
  personaId: string | null;
  parentGoalId: string | null;
  title: string;
  description: string | null;
  goalType: GoalType;
  status: GoalStatus;
  visibility: GoalVisibility;
  progress: number;
  progressType: GoalProgressType;
  targetValue: number | null;
  currentValue: number | null;
  targetUnit: string | null;
  priority: number;
  weight: number;
  depth: number;
  isKeyResult?: boolean;
  color: string | null;
  icon: string | null;
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  version: number;
  contributors?: GoalContributor[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Request Parameters
// ============================================================================

export interface CreateGoalParams {
  title: string;
  description?: string;
  spaceId?: string;
  personaId?: string;
  parentGoalId?: string;
  goalType?: GoalType;
  visibility?: GoalVisibility;
  progressType?: GoalProgressType;
  targetValue?: number;
  targetUnit?: string;
  priority?: number;
  weight?: number;
  color?: string;
  icon?: string;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateGoalParams {
  version: number;
  title?: string;
  description?: string | null;
  goalType?: GoalType;
  visibility?: GoalVisibility;
  progressType?: GoalProgressType;
  targetValue?: number | null;
  targetUnit?: string | null;
  priority?: number;
  weight?: number;
  color?: string | null;
  icon?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
}

export interface ListGoalsParams extends PaginationParams {
  status?: GoalStatus;
  spaceId?: string;
  goalType?: GoalType;
  personaId?: string;
  visibility?: GoalVisibility;
  parentGoalId?: string;
}

export interface GoalProgressUpdateParams {
  progress: number;
  source?: string;
  personaId?: string;
  note?: string;
}

export interface GoalStatusTransitionParams {
  status: GoalStatus;
}

export interface GoalContributorCreateParams {
  personaId: string;
  role?: string;
  canUpdateProgress?: boolean;
}

export interface GoalContributorUpdateParams {
  role?: string;
  canUpdateProgress?: boolean;
}

export type ProgressHistoryParams = PaginationParams;

// ============================================================================
// Response Types
// ============================================================================

export interface GoalListResult {
  goals: Goal[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProgressHistoryEntry {
  id: string;
  goalId: string;
  previousProgress: number;
  newProgress: number;
  source: string;
  personaId: string | null;
  note: string | null;
  createdAt: string;
}

export interface ProgressHistoryResult {
  entries: ProgressHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateKeyResultParams {
  title: string;
  description?: string;
  goalType?: GoalType;
  visibility?: GoalVisibility;
  progressType?: GoalProgressType;
  targetValue?: number;
  targetUnit?: string;
  priority?: number;
  weight?: number;
  color?: string;
  icon?: string;
  startDate?: string;
  targetDate?: string;
}

export interface PaceAnalysis {
  goalId: string;
  progress: number;
  expected: number | null;
  delta: number | null;
  status: 'on_track' | 'behind' | 'ahead' | 'overdue' | 'no_timeline';
}

// ============================================================================
// Memory Link Types (Phase 4)
// ============================================================================

export type GoalMemoryLinkType = 'related' | 'evidence' | 'blocker' | 'note';

export interface GoalMemoryLink {
  goalId: string;
  memoryId: string;
  linkType: GoalMemoryLinkType;
  content?: string;
  type?: string;
  tags?: string[];
  memoryCreatedAt?: string;
  createdAt: string;
}

export interface GoalMemoryListResponse {
  memories: GoalMemoryLink[];
  total: number;
  limit: number;
  offset: number;
}
