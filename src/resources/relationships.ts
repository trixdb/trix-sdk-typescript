/**
 * Relationships resource
 */

import type { Trix } from '../client.js';
import type {
  Relationship,
  CreateRelationshipParams,
  UpdateRelationshipParams,
  ReinforceParams,
  RelationshipType,
  WeakenParams,
  RelatedMemoriesResult,
  ReinforceGroupParams,
  ReinforceGroupResult,
} from '../types.js';
import { validateId } from '../utils/security.js';
import { ValidationError } from '../errors.js';

/**
 * Relationships resource for managing connections between memories.
 *
 * A relationship is keyed by the triple `(sourceId, targetId, type)` — the
 * same composite key the REST API uses — not by a standalone id.
 *
 * @example
 * ```typescript
 * const rel = await client.relationships.create('mem_1', 'mem_2', {
 *   relationshipType: 'related_to',
 *   weight: 0.8
 * });
 * ```
 */
export class Relationships {
  constructor(private readonly client: Trix) {}

  /** Validate the composite key and build the `/relationships/:s/:t/:type` path. */
  private tripleKeyPath(sourceId: string, targetId: string, type: string): string {
    validateId(sourceId, 'source memory');
    validateId(targetId, 'target memory');
    if (!type) throw new ValidationError('relationship type is required');
    const [s, t, ty] = [sourceId, targetId, type].map(encodeURIComponent);
    return `/relationships/${s}/${t}/${ty}`;
  }

  /**
   * Create a relationship between two memories (ADR-145 wire contract).
   *
   * Sends `POST /v1/relationships/:sourceId` with snake_case body fields
   * that match the REST route. `relationshipType` is serialized as
   * `relationship_type`; `weight` passes through unchanged; `description`,
   * `bidirectional`, and `metadata` are forwarded when present.
   *
   * @param sourceId - Source memory ID
   * @param targetId - Target memory ID
   * @param params - Relationship parameters
   * @returns Created relationship
   *
   * @example
   * ```typescript
   * const relationship = await client.relationships.create(
   *   'mem_source',
   *   'mem_target',
   *   {
   *     relationshipType: 'supports',
   *     weight: 0.9,
   *     metadata: { context: 'research' }
   *   }
   * );
   * ```
   */
  async create(
    sourceId: string,
    targetId: string,
    params: CreateRelationshipParams
  ): Promise<Relationship> {
    validateId(sourceId, 'source memory');
    validateId(targetId, 'target memory');
    return this.client.request<Relationship>({
      method: 'POST',
      path: `/relationships/${encodeURIComponent(sourceId)}`,
      body: {
        target_id: targetId,
        relationship_type: params.relationshipType,
        weight: params.weight,
        metadata: params.metadata,
      },
    });
  }

  /**
   * Get incoming relationships for a memory
   *
   * @param memoryId - Memory ID
   * @returns Array of incoming relationships
   *
   * @example
   * ```typescript
   * const incoming = await client.relationships.getIncoming('mem_123');
   * console.log(`Found ${incoming.length} incoming relationships`);
   * ```
   */
  async getIncoming(memoryId: string): Promise<Relationship[]> {
    validateId(memoryId, 'memory');
    const res = await this.client.request<{ relationships: Relationship[] }>({
      method: 'GET',
      path: `/relationships/${encodeURIComponent(memoryId)}`,
      query: { direction: 'incoming' },
    });
    return res.relationships;
  }

  /**
   * Get outgoing relationships for a memory
   *
   * @param memoryId - Memory ID
   * @returns Array of outgoing relationships
   *
   * @example
   * ```typescript
   * const outgoing = await client.relationships.getOutgoing('mem_123');
   * console.log(`Found ${outgoing.length} outgoing relationships`);
   * ```
   */
  async getOutgoing(memoryId: string): Promise<Relationship[]> {
    validateId(memoryId, 'memory');
    const res = await this.client.request<{ relationships: Relationship[] }>({
      method: 'GET',
      path: `/relationships/${encodeURIComponent(memoryId)}`,
      query: { direction: 'outgoing' },
    });
    return res.relationships;
  }

  /**
   * Update a relationship, identified by its `(sourceId, targetId, type)` key.
   *
   * @param sourceId - Source memory ID
   * @param targetId - Target memory ID
   * @param type - Relationship type (e.g. `related_to`)
   * @param params - Fields to update (weight, description, rules, metadata)
   * @returns Updated relationship
   *
   * @example
   * ```typescript
   * const updated = await client.relationships.update('mem_1', 'mem_2', 'supports', {
   *   weight: 0.95,
   *   metadata: { verified: true }
   * });
   * ```
   */
  async update(
    sourceId: string,
    targetId: string,
    type: string,
    params: UpdateRelationshipParams
  ): Promise<Relationship> {
    return this.client.request<Relationship>({
      method: 'PATCH',
      path: this.tripleKeyPath(sourceId, targetId, type),
      body: params,
    });
  }

  /**
   * Delete a relationship, identified by its `(sourceId, targetId, type)` key.
   *
   * @param sourceId - Source memory ID
   * @param targetId - Target memory ID
   * @param type - Relationship type (e.g. `related_to`)
   *
   * @example
   * ```typescript
   * await client.relationships.delete('mem_1', 'mem_2', 'supports');
   * ```
   */
  async delete(sourceId: string, targetId: string, type: string): Promise<void> {
    return this.client.request<void>({
      method: 'DELETE',
      path: this.tripleKeyPath(sourceId, targetId, type),
    });
  }

  /**
   * Reinforce a relationship (increase its weight), identified by its
   * `(sourceId, targetId, type)` key.
   *
   * @param sourceId - Source memory ID
   * @param targetId - Target memory ID
   * @param type - Relationship type (e.g. `related_to`)
   * @param params - Reinforce parameters (`boost`, `context`)
   * @returns Updated relationship
   *
   * @example
   * ```typescript
   * const reinforced = await client.relationships.reinforce('mem_1', 'mem_2', 'supports', {
   *   boost: 0.1
   * });
   * console.log(`New weight: ${reinforced.weight}`);
   * ```
   */
  async reinforce(
    sourceId: string,
    targetId: string,
    type: string,
    params?: ReinforceParams
  ): Promise<Relationship> {
    const res = await this.client.request<{ relationship: Relationship }>({
      method: 'POST',
      path: `${this.tripleKeyPath(sourceId, targetId, type)}/reinforce`,
      body: params,
    });
    return res.relationship;
  }

  /**
   * Get relationship types
   *
   * @returns List of relationship types
   */
  async getTypes(): Promise<RelationshipType[]> {
    const response = await this.client.request<{ types: RelationshipType[] }>({
      method: 'GET',
      path: '/relationships/types',
    });
    return response.types;
  }

  /**
   * Weaken a relationship (decrease its weight), identified by its
   * `(sourceId, targetId, type)` key.
   *
   * @param sourceId - Source memory ID
   * @param targetId - Target memory ID
   * @param type - Relationship type (e.g. `related_to`)
   * @param params - Weaken parameters (`amount`)
   * @returns Updated relationship
   */
  async weaken(
    sourceId: string,
    targetId: string,
    type: string,
    params?: WeakenParams
  ): Promise<Relationship> {
    const res = await this.client.request<{ relationship: Relationship }>({
      method: 'POST',
      path: `${this.tripleKeyPath(sourceId, targetId, type)}/weaken`,
      body: params,
    });
    return res.relationship;
  }

  /**
   * Get related memories for a memory
   *
   * @param memoryId - Memory ID
   * @returns Related memories with relationship info
   */
  async getRelated(memoryId: string): Promise<RelatedMemoriesResult> {
    validateId(memoryId, 'memory');
    return this.client.request<RelatedMemoriesResult>({
      method: 'GET',
      path: `/relationships/${memoryId}/related`,
    });
  }

  /**
   * Reinforce a group of relationships at once
   *
   * @param params - Reinforce group parameters
   * @returns Reinforce result
   */
  async reinforceGroup(params: ReinforceGroupParams): Promise<ReinforceGroupResult> {
    return this.client.request<ReinforceGroupResult>({
      method: 'POST',
      path: '/relationships/reinforce-group',
      body: params,
    });
  }
}
