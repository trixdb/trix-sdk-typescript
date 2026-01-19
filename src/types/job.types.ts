/**
 * Job type definitions for the Trix SDK.
 */

import type { PaginationParams } from './common.types.js';

// ============================================================================
// Job Entity
// ============================================================================

/**
 * Job object.
 */
export interface Job {
  id: string;
  queue: string;
  name: string;
  data: Record<string, unknown>;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  returnValue?: unknown;
  failedReason?: string;
  attempts: number;
  createdAt: string;
  processedAt?: string;
  finishedAt?: string;
}

/**
 * Job statistics.
 */
export interface JobStats {
  queues: Array<{
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }>;
}

// ============================================================================
// Job Parameters
// ============================================================================

/**
 * Parameters for listing jobs.
 */
export interface ListJobsParams extends Pick<PaginationParams, 'limit' | 'page'> {
  queue?: string;
  status?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
}

/**
 * Parameters for cleaning jobs.
 */
export interface CleanParams {
  grace?: number;
  limit?: number;
  status?: 'completed' | 'failed';
}

/**
 * Clean result.
 */
export interface CleanResult {
  removed: number;
}

// ============================================================================
// Consolidation Types
// ============================================================================

/**
 * Parameters for consolidation.
 */
export interface ConsolidateParams {
  spaceId?: string;
  threshold?: number;
  maxClusters?: number;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Consolidate result.
 */
export interface ConsolidateResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}
