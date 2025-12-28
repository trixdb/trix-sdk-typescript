/**
 * Facts resource - Knowledge Graph Triples
 *
 * Provides full CRUD + Query operations for managing knowledge facts
 * in Subject-Predicate-Object (SPO) triple format.
 *
 * @example
 * ```typescript
 * // Create a fact
 * const fact = await client.facts.create({
 *   subject: 'Albert Einstein',
 *   predicate: 'was_born_in',
 *   object: 'Ulm, Germany',
 *   confidence: 0.95,
 * });
 *
 * // Query facts
 * const results = await client.facts.query('Where was Einstein born?');
 *
 * // Extract facts from a memory
 * const extracted = await client.facts.extract('mem_123');
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Fact,
  CreateFactParams,
  UpdateFactParams,
  ListFactsParams,
  QueryFactsParams,
  ScoredFact,
  FactExtractionResult,
  FactVerificationResult,
  PaginatedResponse,
  BulkResult,
} from '../types.js';
import { BaseResource, buildParams, validateBulkArray } from './base.js';
import { validateId } from '../utils/security.js';

/**
 * Facts resource for managing knowledge graph triples
 *
 * Facts represent structured knowledge in Subject-Predicate-Object format,
 * enabling powerful reasoning and querying over your knowledge base.
 */
export class Facts extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a new fact
   *
   * @param params - Fact creation parameters
   * @returns Created fact
   *
   * @example
   * ```typescript
   * const fact = await client.facts.create({
   *   subject: 'Trix',
   *   predicate: 'is_a',
   *   object: 'memory database',
   *   confidence: 1.0,
   *   source: { method: 'manual' },
   * });
   * ```
   */
  async create(params: CreateFactParams): Promise<Fact> {
    return this.request<Fact>({
      method: 'POST',
      path: '/facts',
      body: params,
    });
  }

  /**
   * Get a fact by ID
   *
   * @param id - Fact ID
   * @returns Fact object
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if fact doesn't exist
   */
  async get(id: string): Promise<Fact> {
    validateId(id, 'fact');
    return this.request<Fact>({
      method: 'GET',
      path: `/facts/${id}`,
    });
  }

  /**
   * List facts with optional filters
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of facts
   *
   * @example
   * ```typescript
   * // List all facts about Einstein
   * const facts = await client.facts.list({ subject: 'Einstein' });
   *
   * // List high-confidence facts
   * const highConfidence = await client.facts.list({ minConfidence: 0.9 });
   * ```
   */
  async list(params?: ListFactsParams): Promise<PaginatedResponse<Fact>> {
    return this.request<PaginatedResponse<Fact>>({
      method: 'GET',
      path: '/facts',
      params: buildParams(params || {}),
    });
  }

  /**
   * Update a fact
   *
   * @param id - Fact ID
   * @param params - Update parameters
   * @returns Updated fact
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if fact doesn't exist
   */
  async update(id: string, params: UpdateFactParams): Promise<Fact> {
    validateId(id, 'fact');
    return this.request<Fact>({
      method: 'PATCH',
      path: `/facts/${id}`,
      body: params,
    });
  }

  /**
   * Delete a fact
   *
   * @param id - Fact ID
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if fact doesn't exist
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'fact');
    return this.request<void>({
      method: 'DELETE',
      path: `/facts/${id}`,
    });
  }

  /**
   * Query facts using natural language
   *
   * @param query - Natural language query
   * @param options - Query options
   * @returns List of relevant facts with scores
   *
   * @example
   * ```typescript
   * const results = await client.facts.query('Who discovered relativity?', {
   *   limit: 5,
   *   minConfidence: 0.8,
   * });
   * ```
   */
  async query(
    query: string,
    options?: QueryFactsParams
  ): Promise<{ data: ScoredFact[] }> {
    return this.request<{ data: ScoredFact[] }>({
      method: 'POST',
      path: '/facts/query',
      body: { query, ...options },
    });
  }

  /**
   * Find facts by subject
   *
   * @param subject - Subject to search for
   * @param options - Additional filter options
   * @returns List of facts with matching subject
   */
  async findBySubject(
    subject: string,
    options?: Omit<ListFactsParams, 'subject'>
  ): Promise<PaginatedResponse<Fact>> {
    return this.list({ ...options, subject });
  }

  /**
   * Find facts by predicate
   *
   * @param predicate - Predicate to search for
   * @param options - Additional filter options
   * @returns List of facts with matching predicate
   */
  async findByPredicate(
    predicate: string,
    options?: Omit<ListFactsParams, 'predicate'>
  ): Promise<PaginatedResponse<Fact>> {
    return this.list({ ...options, predicate });
  }

  /**
   * Find facts by object
   *
   * @param object - Object to search for
   * @param options - Additional filter options
   * @returns List of facts with matching object
   */
  async findByObject(
    object: string,
    options?: Omit<ListFactsParams, 'object'>
  ): Promise<PaginatedResponse<Fact>> {
    return this.list({ ...options, object });
  }

  /**
   * Create multiple facts in bulk
   *
   * @param facts - Array of facts to create
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   *
   * @example
   * ```typescript
   * const result = await client.facts.bulkCreate([
   *   { subject: 'A', predicate: 'is', object: 'B', confidence: 1.0 },
   *   { subject: 'C', predicate: 'has', object: 'D', confidence: 0.9 },
   * ]);
   * console.log(`Created ${result.success} facts`);
   * ```
   */
  async bulkCreate(
    facts: CreateFactParams[]
  ): Promise<BulkResult & { facts?: Fact[] }> {
    validateBulkArray(facts, 'bulkCreate');
    return this.request<BulkResult & { facts?: Fact[] }>({
      method: 'POST',
      path: '/facts/bulk',
      body: { facts },
    });
  }

  /**
   * Delete multiple facts in bulk
   *
   * @param ids - Array of fact IDs to delete
   * @returns Bulk operation result
   */
  async bulkDelete(ids: string[]): Promise<BulkResult> {
    validateBulkArray(ids, 'bulkDelete');
    return this.request<BulkResult>({
      method: 'DELETE',
      path: '/facts/bulk',
      body: { ids },
    });
  }

  /**
   * Extract facts from a memory
   *
   * Uses AI to extract Subject-Predicate-Object triples from memory content.
   *
   * @param memoryId - Memory ID to extract from
   * @param options - Extraction options
   * @returns Extracted facts
   *
   * @example
   * ```typescript
   * // Extract and save facts
   * const result = await client.facts.extract('mem_123', { save: true });
   * console.log(`Extracted ${result.facts.length} facts`);
   * ```
   */
  async extract(
    memoryId: string,
    options?: { save?: boolean }
  ): Promise<FactExtractionResult> {
    validateId(memoryId, 'memory');
    return this.request<FactExtractionResult>({
      method: 'POST',
      path: `/memories/${memoryId}/extract-facts`,
      body: options || {},
    });
  }

  /**
   * Verify a fact against the knowledge base
   *
   * Checks if a fact is supported or contradicted by existing memories.
   *
   * @param factId - Fact ID to verify
   * @param options - Verification options
   * @returns Verification result with supporting/contradicting evidence
   *
   * @example
   * ```typescript
   * const result = await client.facts.verify('fact_123');
   * if (result.verified) {
   *   console.log('Fact is supported by', result.supportingMemories.length, 'memories');
   * }
   * ```
   */
  async verify(
    factId: string,
    options?: { spaceId?: string }
  ): Promise<FactVerificationResult> {
    validateId(factId, 'fact');
    return this.request<FactVerificationResult>({
      method: 'POST',
      path: `/facts/${factId}/verify`,
      body: options || {},
    });
  }
}
