/**
 * Facts resource — knowledge facts attached to memories.
 *
 * The live API surface is read-mostly under `/v1/knowledge` plus memory-scoped
 * read/create under `/v1/memories/:id/facts`. The previous create/query/bulk/
 * verify/extract methods targeted endpoints that do not exist (they 404), so
 * they have been removed; only the real surface is exposed here.
 *
 * @example
 * ```typescript
 * // List facts across the account
 * const { facts } = await client.facts.list({ limit: 20 });
 *
 * // Read or attach facts for a specific memory
 * const memoryFacts = await client.facts.listForMemory('mem_123');
 * const fact = await client.facts.createForMemory('mem_123', {
 *   content: 'Project deadline is Friday',
 *   importance: 0.8,
 * });
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Fact,
  CreateFactParams,
  ListFactsParams,
  PaginatedResponse,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

/** Facts returned for a single memory (`GET /v1/memories/:id/facts`). */
export interface MemoryFactsResult {
  memoryId: string;
  facts: Fact[];
  total: number;
}

/**
 * Facts resource for reading account/memory facts and attaching new ones.
 */
export class Facts extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * List facts with optional filters.
   *
   * `GET /v1/knowledge/facts`
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of facts
   */
  async list(params?: ListFactsParams): Promise<PaginatedResponse<Fact>> {
    return this.request<PaginatedResponse<Fact>>({
      method: 'GET',
      path: '/knowledge/facts',
      params: buildParams(params || {}),
    });
  }

  /**
   * List the facts attached to a specific memory.
   *
   * `GET /v1/memories/:id/facts`
   *
   * @param memoryId - Memory ID
   * @returns Facts for the memory
   */
  async listForMemory(memoryId: string): Promise<MemoryFactsResult> {
    validateId(memoryId, 'memory');
    return this.request<MemoryFactsResult>({
      method: 'GET',
      path: `/memories/${memoryId}/facts`,
    });
  }

  /**
   * Attach a new fact to a memory.
   *
   * `POST /v1/memories/:id/facts`
   *
   * @param memoryId - Memory ID to attach the fact to
   * @param params - Fact content and metadata
   * @returns Created fact
   */
  async createForMemory(memoryId: string, params: CreateFactParams): Promise<Fact> {
    validateId(memoryId, 'memory');
    return this.request<Fact>({
      method: 'POST',
      path: `/memories/${memoryId}/facts`,
      body: params,
    });
  }
}
