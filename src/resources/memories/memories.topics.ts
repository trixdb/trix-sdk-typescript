/**
 * Memory topic and enrichment operations.
 *
 * Provides topic extraction, enrichment, and quality scoring operations.
 */

import type { Trix } from '../../client.js';
import type {
  Memory,
  Topic,
  GetTopicsOptions,
  TopicsResult,
  SearchByTopicOptions,
  EnrichMemoryOptions,
  EnrichMemoryResult,
  QualityScoreResult,
  PaginatedResponse,
} from '../../types.js';
import { BaseResource, buildParams } from '../base.js';
import { validateId } from '../../utils/security.js';

/**
 * Memory topic and enrichment operations mixin.
 */
export class MemoriesTopics extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Get topics extracted from a memory.
   *
   * @param id - Memory ID
   * @param options - Topic retrieval options
   * @returns List of topics with relevance scores
   */
  async getTopics(id: string, options?: GetTopicsOptions): Promise<Topic[]> {
    validateId(id, 'memory');
    const response = await this.request<TopicsResult>({
      method: 'GET',
      path: `/memories/${id}/topics`,
      params: buildParams(options || {}),
    });
    return response.topics;
  }

  /**
   * Search memories by topic.
   *
   * @param topic - Topic name to search for
   * @param options - Search options
   * @returns Memories matching the topic
   */
  async searchByTopic(topic: string, options?: SearchByTopicOptions): Promise<Memory[]> {
    const response = await this.request<PaginatedResponse<Memory>>({
      method: 'GET',
      path: '/memories/search/by-topic',
      params: buildParams({
        topic,
        ...options,
      }),
    });
    return response.data;
  }

  /**
   * Enrich a memory with additional metadata.
   *
   * Runs enrichment operations like topic extraction, summarization,
   * entity detection, and quality scoring.
   *
   * @param id - Memory ID
   * @param options - Enrichment options
   * @returns Enrichment results
   */
  async enrich(id: string, options?: EnrichMemoryOptions): Promise<EnrichMemoryResult> {
    validateId(id, 'memory');
    return this.request<EnrichMemoryResult>({
      method: 'POST',
      path: `/memories/${id}/enrich`,
      body: options || {},
    });
  }

  /**
   * Get quality score for a memory.
   *
   * Quality score (0-1) indicates the overall quality of the memory
   * based on factors like content length, structure, and relevance.
   *
   * @param id - Memory ID
   * @returns Quality score (0-1)
   */
  async getQualityScore(id: string): Promise<number> {
    validateId(id, 'memory');
    const response = await this.request<QualityScoreResult>({
      method: 'GET',
      path: `/memories/${id}/quality`,
    });
    return response.score;
  }
}
