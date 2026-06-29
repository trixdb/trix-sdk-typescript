/**
 * Knowledge resource for summaries and note generation.
 */

import type { Trix } from '../client.js';
import type { KnowledgeSummaryResult, ToNoteResult } from '../types.js';

/**
 * Knowledge resource for topic summaries and note creation
 *
 * @example
 * ```typescript
 * const summary = await client.knowledge.summary('machine learning');
 * console.log(summary.summary);
 * ```
 */
export class Knowledge {
  constructor(private readonly client: Trix) {}

  /**
   * Get a knowledge summary for a topic
   *
   * @param topic - Topic to summarize
   * @param options - Summary options
   * @returns Grouped summary with knowledge gaps
   *
   * @example
   * ```typescript
   * const summary = await client.knowledge.summary('project goals', {
   *   limit: 50,
   *   groupBy: 'tags',
   * });
   * console.log(`${summary.total_memories} memories about "${summary.topic}"`);
   * ```
   */
  async summary(
    topic: string,
    options?: { limit?: number; spaceId?: string; groupBy?: 'tags' | 'clusters' },
  ): Promise<KnowledgeSummaryResult> {
    return this.client.request<KnowledgeSummaryResult>({
      method: 'POST',
      path: '/knowledge/summary',
      body: {
        topic,
        limit: options?.limit ?? 30,
        space_id: options?.spaceId,
        group_by: options?.groupBy ?? 'tags',
      },
    });
  }

  /**
   * Convert memories into a structured note
   *
   * @param options - Selection criteria and note options
   * @returns Created note with summary
   *
   * @example
   * ```typescript
   * const result = await client.knowledge.toNote({
   *   query: 'weekly standup notes',
   *   title: 'Standup Summary',
   * });
   * if (result.note) {
   *   console.log(`Created note: ${result.note.title}`);
   * }
   * ```
   */
  async toNote(options: {
    memoryIds?: string[];
    query?: string;
    title?: string;
    spaceId?: string;
    limit?: number;
  }): Promise<ToNoteResult> {
    return this.client.request<ToNoteResult>({
      method: 'POST',
      path: '/knowledge/to-note',
      body: {
        memory_ids: options.memoryIds,
        query: options.query,
        title: options.title,
        space_id: options.spaceId,
        limit: options.limit ?? 20,
      },
    });
  }
}
