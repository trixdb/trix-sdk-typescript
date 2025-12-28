/**
 * Enrichments resource - Memory enrichment operations
 */

import type { Trix } from '../client.js';
import type {
  Enrichment,
  EnrichmentResult,
  TriggerEnrichmentParams,
  ListEnrichmentsParams,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

/**
 * Enrichments resource for managing memory enrichments
 *
 * Enrichments are automatic processing operations that add value to memories,
 * such as entity extraction, summarization, sentiment analysis, etc.
 *
 * @example
 * ```typescript
 * // Get all enrichments for a memory
 * const enrichments = await client.enrichments.list('mem_123');
 *
 * // Trigger specific enrichment
 * await client.enrichments.trigger('mem_123', { types: ['entities', 'summary'] });
 * ```
 */
export class Enrichments extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * List all enrichments for a memory
   *
   * @param memoryId - Memory ID
   * @param params - Optional list parameters
   * @returns List of enrichments
   *
   * @example
   * ```typescript
   * const enrichments = await client.enrichments.list('mem_123');
   * console.log(`Found ${enrichments.length} enrichments`);
   * ```
   */
  async list(memoryId: string, params?: ListEnrichmentsParams): Promise<Enrichment[]> {
    validateId(memoryId, 'memory');
    const response = await this.request<{ data: Enrichment[] }>({
      method: 'GET',
      path: `/memories/${memoryId}/enrichments`,
      params: buildParams(params || {}),
    });
    return response.data;
  }

  /**
   * Get a specific enrichment by type
   *
   * @param memoryId - Memory ID
   * @param type - Enrichment type (e.g., 'entities', 'summary', 'sentiment')
   * @returns Enrichment object
   *
   * @example
   * ```typescript
   * const entities = await client.enrichments.get('mem_123', 'entities');
   * console.log(entities.data);
   * ```
   */
  async get(memoryId: string, type: string): Promise<Enrichment> {
    validateId(memoryId, 'memory');
    if (!type || typeof type !== 'string') {
      throw new Error('Enrichment type is required');
    }
    return this.request<Enrichment>({
      method: 'GET',
      path: `/memories/${memoryId}/enrichments/${type}`,
    });
  }

  /**
   * Trigger enrichment processing for a memory
   *
   * @param memoryId - Memory ID
   * @param params - Enrichment parameters
   * @returns Enrichment result with job info
   *
   * @example
   * ```typescript
   * // Trigger specific enrichments
   * const result = await client.enrichments.trigger('mem_123', {
   *   types: ['entities', 'summary'],
   *   priority: 'high'
   * });
   *
   * // Trigger all applicable enrichments
   * const result = await client.enrichments.trigger('mem_123');
   * ```
   */
  async trigger(memoryId: string, params?: TriggerEnrichmentParams): Promise<EnrichmentResult> {
    validateId(memoryId, 'memory');
    return this.request<EnrichmentResult>({
      method: 'POST',
      path: `/memories/${memoryId}/enrichments`,
      body: params || {},
    });
  }

  /**
   * Retry failed enrichments for a memory
   *
   * @param memoryId - Memory ID
   * @param types - Optional specific types to retry (retries all failed if not specified)
   * @returns Enrichment result with job info
   *
   * @example
   * ```typescript
   * // Retry all failed enrichments
   * const result = await client.enrichments.retry('mem_123');
   *
   * // Retry specific failed enrichments
   * const result = await client.enrichments.retry('mem_123', ['entities']);
   * ```
   */
  async retry(memoryId: string, types?: string[]): Promise<EnrichmentResult> {
    validateId(memoryId, 'memory');
    return this.request<EnrichmentResult>({
      method: 'POST',
      path: `/memories/${memoryId}/enrichments/retry`,
      body: types ? { types } : {},
    });
  }

  /**
   * Trigger full enrichment pipeline for a memory
   *
   * This runs all enrichment types, regardless of previous status.
   * Useful for reprocessing after content updates.
   *
   * @param memoryId - Memory ID
   * @param params - Optional parameters
   * @returns Enrichment result with job info
   *
   * @example
   * ```typescript
   * const result = await client.enrichments.triggerFull('mem_123', {
   *   priority: 'high'
   * });
   * ```
   */
  async triggerFull(memoryId: string, params?: TriggerEnrichmentParams): Promise<EnrichmentResult> {
    validateId(memoryId, 'memory');
    return this.request<EnrichmentResult>({
      method: 'POST',
      path: `/memories/${memoryId}/enrichments/full`,
      body: params || {},
    });
  }
}
