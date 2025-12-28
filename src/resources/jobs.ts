/**
 * Jobs resource
 */

import type { Trix } from '../client.js';
import type {
  Job,
  JobStats,
  ListJobsParams,
  PaginatedResponse,
  CleanParams,
  CleanResult,
} from '../types.js';
import { paginateIterator } from '../utils/pagination.js';
import { validateId } from '../utils/security.js';

/**
 * Jobs resource for managing background jobs
 *
 * @example
 * ```typescript
 * const stats = await client.jobs.getStats();
 * console.log(`Active jobs: ${stats.queues[0].active}`);
 * ```
 */
export class Jobs {
  constructor(private readonly client: Trix) {}

  /**
   * Get statistics for all job queues
   *
   * @returns Job statistics
   *
   * @example
   * ```typescript
   * const stats = await client.jobs.getStats();
   *
   * stats.queues.forEach(queue => {
   *   console.log(`Queue: ${queue.name}`);
   *   console.log(`  Waiting: ${queue.waiting}`);
   *   console.log(`  Active: ${queue.active}`);
   *   console.log(`  Completed: ${queue.completed}`);
   *   console.log(`  Failed: ${queue.failed}`);
   * });
   * ```
   */
  async getStats(): Promise<JobStats> {
    return this.client.request<JobStats>({
      method: 'GET',
      path: '/jobs/stats',
    });
  }

  /**
   * Get a specific job
   *
   * @param queue - Queue name
   * @param id - Job ID
   * @returns Job object
   *
   * @example
   * ```typescript
   * const job = await client.jobs.get('transcription', 'job_123');
   * console.log(`Job status: ${job.status}`);
   * ```
   */
  async get(queue: string, id: string): Promise<Job> {
    validateId(queue, 'queue');
    validateId(id, 'job');
    return this.client.request<Job>({
      method: 'GET',
      path: `/jobs/${queue}/${id}`,
    });
  }

  /**
   * List jobs
   *
   * @param params - List parameters
   * @returns Paginated list of jobs
   *
   * @example
   * ```typescript
   * const results = await client.jobs.list({
   *   queue: 'transcription',
   *   status: 'failed',
   *   limit: 20
   * });
   * ```
   */
  async list(params?: ListJobsParams): Promise<PaginatedResponse<Job>> {
    return this.client.request<PaginatedResponse<Job>>({
      method: 'GET',
      path: '/jobs',
      query: params,
    });
  }

  /**
   * Get all jobs using async iteration
   *
   * @param params - List parameters
   * @returns Async iterator of jobs
   *
   * @example
   * ```typescript
   * for await (const job of client.jobs.listAll({ status: 'failed' })) {
   *   console.log(`Failed job: ${job.id} - ${job.failedReason}`);
   * }
   * ```
   */
  listAll(params?: ListJobsParams): AsyncGenerator<Job, void, unknown> {
    return paginateIterator(
      (p) => this.list(p),
      params ?? {}
    );
  }

  /**
   * Retry a failed job
   *
   * @param queue - Queue name
   * @param id - Job ID
   *
   * @example
   * ```typescript
   * await client.jobs.retry('transcription', 'job_123');
   * ```
   */
  async retry(queue: string, id: string): Promise<void> {
    validateId(queue, 'queue');
    validateId(id, 'job');
    return this.client.request<void>({
      method: 'POST',
      path: `/jobs/${queue}/${id}/retry`,
    });
  }

  /**
   * Remove a job from the queue
   *
   * @param queue - Queue name
   * @param id - Job ID
   *
   * @example
   * ```typescript
   * await client.jobs.remove('transcription', 'job_123');
   * ```
   */
  async remove(queue: string, id: string): Promise<void> {
    validateId(queue, 'queue');
    validateId(id, 'job');
    return this.client.request<void>({
      method: 'DELETE',
      path: `/jobs/${queue}/${id}`,
    });
  }

  /**
   * Clean up old jobs from a queue
   *
   * @param queue - Queue name
   * @param params - Clean parameters
   * @returns Clean result
   *
   * @example
   * ```typescript
   * const result = await client.jobs.clean('transcription', {
   *   status: 'completed',
   *   grace: 86400000, // 24 hours in ms
   *   limit: 100
   * });
   *
   * console.log(`Removed ${result.removed} old jobs`);
   * ```
   */
  async clean(queue: string, params?: CleanParams): Promise<CleanResult> {
    validateId(queue, 'queue');
    return this.client.request<CleanResult>({
      method: 'POST',
      path: `/jobs/${queue}/clean`,
      body: params,
    });
  }
}
