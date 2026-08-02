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
  SearchOptions,
  UnifiedSearchResult,
  UnifiedSearchResponse,
  BatchSearchConfig,
  BatchSearchResult,
  StrategyRecommendation,
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
      method: 'GET',
      path: `/search/similar/${memoryId}`,
      query: params,
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

  /**
   * Search memories by query text with optional cluster scale filtering
   *
   * This method performs semantic search across memories, with support for
   * multi-scale clustering to narrow down search scope.
   *
   * @param query - Search query text
   * @param options - Search options including cluster scale
   * @returns Array of unified search results (memory / audio / video)
   *
   * @example
   * ```typescript
   * // Basic semantic search
   * const results = await client.search.query('machine learning algorithms');
   *
   * // Search with cluster scale filter
   * const fineClusters = await client.search.query('neural networks', {
   *   clusterScale: 'fine',
   *   limit: 10
   * });
   *
   * // Search within coarse clusters for broader results
   * const broadResults = await client.search.query('artificial intelligence', {
   *   clusterScale: 'coarse',
   *   limit: 50
   * });
   * ```
   */
  async query(query: string, options?: SearchOptions): Promise<UnifiedSearchResult[]> {
    // GET /v1/search returns `{ results, facets }` — there is no `data` wrapper.
    const response = await this.client.request<UnifiedSearchResponse>({
      method: 'GET',
      path: '/search',
      query: {
        q: query,
        ...options,
      },
    });
    return response.results;
  }

  /**
   * Execute multiple search strategies in a single request
   *
   * @param searches - Array of search configurations to execute
   * @param options - Batch options (e.g. deduplication)
   * @returns Combined results from all strategies
   *
   * @example
   * ```typescript
   * const result = await client.search.batchSearch([
   *   { strategy: 'semantic', query: 'machine learning', limit: 10 },
   *   { strategy: 'fulltext', query: 'neural networks', limit: 5 },
   * ]);
   * console.log(`Found ${result.total_results} results`);
   * ```
   */
  async batchSearch(
    searches: BatchSearchConfig[],
    options?: { deduplicate?: boolean },
  ): Promise<BatchSearchResult> {
    return this.client.request<BatchSearchResult>({
      method: 'POST',
      path: '/v1/search/batch',
      body: { searches, deduplicate: options?.deduplicate ?? true },
    });
  }

  /**
   * Get a recommended search strategy for a query
   *
   * @param query - The search query to analyze
   * @returns Strategy recommendation with confidence and alternatives
   *
   * @example
   * ```typescript
   * const rec = await client.search.suggestStrategy('find all notes about AI');
   * console.log(`Use ${rec.recommended_strategy} (${rec.confidence})`);
   * ```
   */
  async suggestStrategy(query: string): Promise<StrategyRecommendation> {
    return this.client.request<StrategyRecommendation>({
      method: 'POST',
      path: '/v1/search/suggest-strategy',
      body: { query },
    });
  }
}
