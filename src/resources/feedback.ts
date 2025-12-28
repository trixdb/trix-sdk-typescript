/**
 * Feedback resource
 */

import type { Trix } from '../client.js';
import type {
  SubmitFeedbackParams,
  FeedbackResult,
  QuickFeedbackParams,
  QuickFeedbackResult,
  BatchFeedbackParams,
  BatchFeedbackResult,
} from '../types.js';
import { validateId } from '../utils/security.js';

/**
 * Feedback resource for submitting user feedback on memories
 *
 * @example
 * ```typescript
 * const result = await client.feedback.submit({
 *   memoryId: 'mem_123',
 *   type: 'positive',
 *   comment: 'Very helpful!'
 * });
 * ```
 */
export class Feedback {
  constructor(private readonly client: Trix) {}

  /**
   * Submit feedback for a memory
   *
   * @param params - Feedback parameters
   * @returns Feedback result
   *
   * @example
   * ```typescript
   * const feedback = await client.feedback.submit({
   *   memoryId: 'mem_123',
   *   type: 'positive',
   *   comment: 'This memory was very useful',
   *   metadata: { source: 'user_rating' }
   * });
   * ```
   */
  async submit(params: SubmitFeedbackParams): Promise<FeedbackResult> {
    validateId(params.memoryId, 'memory');
    return this.client.request<FeedbackResult>({
      method: 'POST',
      path: '/feedback',
      body: params,
    });
  }

  /**
   * Submit quick feedback (thumbs up/down)
   *
   * @param params - Quick feedback parameters
   * @returns Quick feedback result
   *
   * @example
   * ```typescript
   * const result = await client.feedback.quick({
   *   memoryId: 'mem_123',
   *   type: 'thumbs_up'
   * });
   * ```
   */
  async quick(params: QuickFeedbackParams): Promise<QuickFeedbackResult> {
    validateId(params.memoryId, 'memory');
    return this.client.request<QuickFeedbackResult>({
      method: 'POST',
      path: '/feedback/quick',
      body: params,
    });
  }

  /**
   * Submit feedback for multiple memories at once
   *
   * @param params - Batch feedback parameters
   * @returns Batch feedback result
   *
   * @example
   * ```typescript
   * const result = await client.feedback.batch({
   *   feedback: [
   *     { memoryId: 'mem_1', type: 'positive', comment: 'Great!' },
   *     { memoryId: 'mem_2', type: 'neutral' },
   *     { memoryId: 'mem_3', type: 'negative', comment: 'Not relevant' }
   *   ]
   * });
   *
   * console.log(`Submitted ${result.success} feedback items`);
   * ```
   */
  async batch(params: BatchFeedbackParams): Promise<BatchFeedbackResult> {
    return this.client.request<BatchFeedbackResult>({
      method: 'POST',
      path: '/feedback/batch',
      body: params,
    });
  }
}
