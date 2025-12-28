/**
 * Highlights resource
 */

import type { Trix } from '../client.js';
import type {
  Highlight,
  CreateHighlightParams,
  UpdateHighlightParams,
  ListHighlightsParams,
  PaginatedResponse,
  ExtractParams,
  ExtractResult,
  SearchHighlightsParams,
  HighlightSearchResult,
  HighlightType,
  LinkHighlightParams,
  HighlightLinkResult,
} from '../types.js';
import { paginateIterator } from '../utils/pagination.js';
import { validateId } from '../utils/security.js';

/**
 * Highlights resource for managing text highlights within memories
 *
 * @example
 * ```typescript
 * const highlight = await client.highlights.create('mem_123', {
 *   text: 'Important passage',
 *   startOffset: 0,
 *   endOffset: 17,
 *   color: 'yellow'
 * });
 * ```
 */
export class Highlights {
  constructor(private readonly client: Trix) {}

  /**
   * Create a highlight in a memory
   *
   * @param memoryId - Memory ID
   * @param params - Highlight creation parameters
   * @returns Created highlight
   *
   * @example
   * ```typescript
   * const highlight = await client.highlights.create('mem_123', {
   *   text: 'This is the highlighted text',
   *   startOffset: 100,
   *   endOffset: 128,
   *   color: 'yellow',
   *   note: 'Remember this for later'
   * });
   * ```
   */
  async create(memoryId: string, params: CreateHighlightParams): Promise<Highlight> {
    validateId(memoryId, 'memory');
    return this.client.request<Highlight>({
      method: 'POST',
      path: `/memories/${memoryId}/highlights`,
      body: params,
    });
  }

  /**
   * List highlights for a memory
   *
   * @param memoryId - Memory ID
   * @param params - List parameters
   * @returns Paginated list of highlights
   *
   * @example
   * ```typescript
   * const results = await client.highlights.list('mem_123', {
   *   limit: 20
   * });
   * ```
   */
  async list(
    memoryId: string,
    params?: ListHighlightsParams
  ): Promise<PaginatedResponse<Highlight>> {
    validateId(memoryId, 'memory');
    return this.client.request<PaginatedResponse<Highlight>>({
      method: 'GET',
      path: `/memories/${memoryId}/highlights`,
      query: params,
    });
  }

  /**
   * Get all highlights using async iteration
   *
   * @param memoryId - Memory ID
   * @param params - List parameters
   * @returns Async iterator of highlights
   *
   * @example
   * ```typescript
   * for await (const highlight of client.highlights.listAll('mem_123')) {
   *   console.log(highlight.text);
   * }
   * ```
   */
  listAll(
    memoryId: string,
    params?: ListHighlightsParams
  ): AsyncGenerator<Highlight, void, unknown> {
    return paginateIterator(
      (p) => this.list(memoryId, p),
      params ?? {}
    );
  }

  /**
   * Get a specific highlight by ID
   *
   * @param highlightId - Highlight ID
   * @returns Highlight object
   *
   * @example
   * ```typescript
   * const highlight = await client.highlights.get('hl_123');
   * ```
   */
  async get(highlightId: string): Promise<Highlight> {
    validateId(highlightId, 'highlight');
    return this.client.request<Highlight>({
      method: 'GET',
      path: `/highlights/${highlightId}`,
    });
  }

  /**
   * Update a highlight
   *
   * @param highlightId - Highlight ID
   * @param params - Update parameters
   * @returns Updated highlight
   *
   * @example
   * ```typescript
   * const updated = await client.highlights.update('hl_123', {
   *   color: 'green',
   *   note: 'Updated note'
   * });
   * ```
   */
  async update(highlightId: string, params: UpdateHighlightParams): Promise<Highlight> {
    validateId(highlightId, 'highlight');
    return this.client.request<Highlight>({
      method: 'PATCH',
      path: `/highlights/${highlightId}`,
      body: params,
    });
  }

  /**
   * Delete a highlight
   *
   * @param highlightId - Highlight ID
   *
   * @example
   * ```typescript
   * await client.highlights.delete('hl_123');
   * ```
   */
  async delete(highlightId: string): Promise<void> {
    validateId(highlightId, 'highlight');
    return this.client.request<void>({
      method: 'DELETE',
      path: `/highlights/${highlightId}`,
    });
  }

  /**
   * Extract important highlights from a memory using AI
   *
   * @param memoryId - Memory ID
   * @param params - Extract parameters
   * @returns Extracted highlights
   *
   * @example
   * ```typescript
   * const result = await client.highlights.extract('mem_123', {
   *   method: 'ai',
   *   limit: 5,
   *   minLength: 20
   * });
   *
   * result.highlights.forEach(({ text, score }) => {
   *   console.log(`${text} (score: ${score})`);
   * });
   * ```
   */
  async extract(memoryId: string, params?: ExtractParams): Promise<ExtractResult> {
    validateId(memoryId, 'memory');
    return this.client.request<ExtractResult>({
      method: 'POST',
      path: `/memories/${memoryId}/highlights/extract`,
      body: params,
    });
  }

  /**
   * List all highlights across all memories
   *
   * @param params - List parameters
   * @returns Paginated list of highlights
   */
  async listGlobal(params?: ListHighlightsParams): Promise<PaginatedResponse<Highlight>> {
    return this.client.request<PaginatedResponse<Highlight>>({
      method: 'GET',
      path: '/highlights',
      query: params,
    });
  }

  /**
   * Search highlights semantically
   *
   * @param query - Search query
   * @param params - Search parameters
   * @returns Search results
   */
  async search(query: string, params?: SearchHighlightsParams): Promise<HighlightSearchResult> {
    return this.client.request<HighlightSearchResult>({
      method: 'POST',
      path: '/highlights/search',
      body: { query, ...params },
    });
  }

  /**
   * Get highlight types
   *
   * @returns List of highlight types
   */
  async getTypes(): Promise<HighlightType[]> {
    const response = await this.client.request<{ types: HighlightType[] }>({
      method: 'GET',
      path: '/highlights/types',
    });
    return response.types;
  }

  /**
   * Link a highlight to a memory
   *
   * @param highlightId - Highlight ID
   * @param params - Link parameters
   * @returns Link result
   */
  async link(highlightId: string, params: LinkHighlightParams): Promise<HighlightLinkResult> {
    validateId(highlightId, 'highlight');
    validateId(params.memoryId, 'memory');
    return this.client.request<HighlightLinkResult>({
      method: 'POST',
      path: `/highlights/${highlightId}/link`,
      body: params,
    });
  }
}
