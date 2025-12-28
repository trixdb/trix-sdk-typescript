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

/**
 * Relationships resource for managing connections between memories
 *
 * @example
 * ```typescript
 * const rel = await client.relationships.create('mem_1', 'mem_2', {
 *   relationshipType: 'related_to',
 *   strength: 0.8
 * });
 * ```
 */
export class Relationships {
  constructor(private readonly client: Trix) {}

  /**
   * Create a relationship between two memories
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
   *     strength: 0.9,
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
      path: '/relationships',
      body: {
        sourceId,
        targetId,
        ...params,
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
    return this.client.request<Relationship[]>({
      method: 'GET',
      path: `/memories/${memoryId}/relationships/incoming`,
    });
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
    return this.client.request<Relationship[]>({
      method: 'GET',
      path: `/memories/${memoryId}/relationships/outgoing`,
    });
  }

  /**
   * Update a relationship
   *
   * @param relationshipId - Relationship ID
   * @param params - Update parameters
   * @returns Updated relationship
   *
   * @example
   * ```typescript
   * const updated = await client.relationships.update('rel_123', {
   *   strength: 0.95,
   *   metadata: { verified: true }
   * });
   * ```
   */
  async update(
    relationshipId: string,
    params: UpdateRelationshipParams
  ): Promise<Relationship> {
    validateId(relationshipId, 'relationship');
    return this.client.request<Relationship>({
      method: 'PATCH',
      path: `/relationships/${relationshipId}`,
      body: params,
    });
  }

  /**
   * Delete a relationship
   *
   * @param relationshipId - Relationship ID
   *
   * @example
   * ```typescript
   * await client.relationships.delete('rel_123');
   * ```
   */
  async delete(relationshipId: string): Promise<void> {
    validateId(relationshipId, 'relationship');
    return this.client.request<void>({
      method: 'DELETE',
      path: `/relationships/${relationshipId}`,
    });
  }

  /**
   * Reinforce a relationship (increase its strength)
   *
   * @param relationshipId - Relationship ID
   * @param params - Reinforce parameters
   * @returns Updated relationship
   *
   * @example
   * ```typescript
   * const reinforced = await client.relationships.reinforce('rel_123', {
   *   amount: 0.1
   * });
   * console.log(`New strength: ${reinforced.strength}`);
   * ```
   */
  async reinforce(
    relationshipId: string,
    params?: ReinforceParams
  ): Promise<Relationship> {
    validateId(relationshipId, 'relationship');
    return this.client.request<Relationship>({
      method: 'POST',
      path: `/relationships/${relationshipId}/reinforce`,
      body: params,
    });
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
   * Weaken a relationship (decrease its strength)
   *
   * @param relationshipId - Relationship ID
   * @param params - Weaken parameters
   * @returns Updated relationship
   */
  async weaken(relationshipId: string, params?: WeakenParams): Promise<Relationship> {
    validateId(relationshipId, 'relationship');
    return this.client.request<Relationship>({
      method: 'POST',
      path: `/relationships/${relationshipId}/weaken`,
      body: params,
    });
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
