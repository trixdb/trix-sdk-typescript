/**
 * Search resource
 */

import type { Trix } from '../client.js';
import type {
  SimilarParams,
  SimilarResult,
  EmbedResult,
  EmbedAllResult,
  SearchConfig,
} from '../types.js';
import { validateId } from '../utils/security.js';

/**
 * Search resource for semantic search and embeddings
 *
 * @example
 * ```typescript
 * const results = await client.search.similar('mem_123', {
 *   limit: 10,
 *   threshold: 0.7
 * });
 * ```
 */
export class Search {
  constructor(private readonly client: Trix) {}

  /**
   * Find similar memories to a given memory
   *
   * @param memoryId - Memory ID to find similarities for
   * @param params - Search parameters
   * @returns Similar memories with similarity scores
   *
   * @example
   * ```typescript
   * const results = await client.search.similar('mem_123', {
   *   limit: 20,
   *   threshold: 0.75,
   *   includeEmbedding: false
   * });
   *
   * results.results.forEach(({ memory, similarity }) => {
   *   console.log(`${memory.content} (${similarity.toFixed(2)})`);
   * });
   * ```
   */
  async similar(memoryId: string, params?: SimilarParams): Promise<SimilarResult> {
    validateId(memoryId, 'memory');
    return this.client.request<SimilarResult>({
      method: 'POST',
      path: '/search/similar',
      body: {
        memoryId,
        ...params,
      },
    });
  }

  /**
   * Generate embeddings for specific memories
   *
   * @param memoryIds - Array of memory IDs to embed
   * @returns Embeddings for the specified memories
   *
   * @example
   * ```typescript
   * const result = await client.search.embed(['mem_1', 'mem_2', 'mem_3']);
   *
   * result.embeddings.forEach(({ memoryId, embedding }) => {
   *   console.log(`Memory ${memoryId} has ${embedding.length} dimensions`);
   * });
   * ```
   */
  async embed(memoryIds: string[]): Promise<EmbedResult> {
    memoryIds.forEach((memoryId) => validateId(memoryId, 'memory'));
    return this.client.request<EmbedResult>({
      method: 'POST',
      path: '/search/embed',
      body: { memoryIds },
    });
  }

  /**
   * Generate embeddings for all memories (batch operation)
   *
   * @param batchSize - Optional batch size for processing
   * @returns Embed all result with job information
   *
   * @example
   * ```typescript
   * const result = await client.search.embedAll(100);
   *
   * if (result.jobId) {
   *   console.log(`Embedding job started: ${result.jobId}`);
   *   console.log(`Will process ${result.total} memories`);
   * }
   * ```
   */
  async embedAll(batchSize?: number): Promise<EmbedAllResult> {
    return this.client.request<EmbedAllResult>({
      method: 'POST',
      path: '/search/embed-all',
      body: { batchSize },
    });
  }

  /**
   * Get search configuration
   *
   * @returns Search configuration
   *
   * @example
   * ```typescript
   * const config = await client.search.getConfig();
   * console.log(`Using model: ${config.embeddingModel}`);
   * console.log(`Dimensions: ${config.embeddingDimensions}`);
   * ```
   */
  async getConfig(): Promise<SearchConfig> {
    return this.client.request<SearchConfig>({
      method: 'GET',
      path: '/search/config',
    });
  }
}
