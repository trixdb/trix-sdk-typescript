/**
 * Entities resource - Named Entity Management
 *
 * Provides full CRUD + Query operations for managing named entities
 * with support for flexible properties, aliases, and memory linking.
 *
 * @example
 * ```typescript
 * // Create an entity
 * const entity = await client.entities.create({
 *   name: 'Albert Einstein',
 *   type: 'person',
 *   aliases: ['Einstein', 'A. Einstein'],
 *   properties: { birthYear: 1879, field: 'physics' },
 * });
 *
 * // Search entities
 * const results = await client.entities.search('Einstein');
 *
 * // Extract entities from a memory
 * const extracted = await client.entities.extract('mem_123', { save: true });
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Entity,
  CreateEntityParams,
  UpdateEntityParams,
  ListEntitiesParams,
  SearchEntitiesParams,
  ResolveEntityParams,
  ScoredEntity,
  EntityResolutionResult,
  EntityMergeResult,
  EntityMemoryLinkResult,
  EntityExtractionResult,
  EntityTypesResult,
  EntityFactsResult,
  PaginatedResponse,
  BulkResult,
} from '../types.js';
import { BaseResource, buildParams, validateBulkArray } from './base.js';
import { validateId } from '../utils/security.js';

/**
 * Entities resource for managing named entities
 *
 * Entities represent people, places, organizations, concepts, and other
 * named objects in your knowledge base. They support flexible schemas
 * and can be linked to memories.
 */
export class Entities extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a new entity
   *
   * @param params - Entity creation parameters
   * @returns Created entity
   *
   * @example
   * ```typescript
   * const entity = await client.entities.create({
   *   name: 'Trix',
   *   type: 'product',
   *   description: 'A powerful memory database',
   *   properties: { language: 'TypeScript', openSource: true },
   * });
   * ```
   */
  async create(params: CreateEntityParams): Promise<Entity> {
    return this.request<Entity>({
      method: 'POST',
      path: '/entities',
      body: params,
    });
  }

  /**
   * Get an entity by ID
   *
   * @param id - Entity ID
   * @returns Entity object
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if entity doesn't exist
   */
  async get(id: string): Promise<Entity> {
    validateId(id, 'entity');
    return this.request<Entity>({
      method: 'GET',
      path: `/entities/${id}`,
    });
  }

  /**
   * List entities with optional filters
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of entities
   *
   * @example
   * ```typescript
   * // List all person entities
   * const people = await client.entities.list({ type: 'person' });
   *
   * // List entities in a space
   * const spaceEntities = await client.entities.list({ spaceId: 'space_123' });
   * ```
   */
  async list(params?: ListEntitiesParams): Promise<PaginatedResponse<Entity>> {
    return this.request<PaginatedResponse<Entity>>({
      method: 'GET',
      path: '/entities',
      params: buildParams(params || {}),
    });
  }

  /**
   * Update an entity
   *
   * @param id - Entity ID
   * @param params - Update parameters
   * @returns Updated entity
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if entity doesn't exist
   */
  async update(id: string, params: UpdateEntityParams): Promise<Entity> {
    validateId(id, 'entity');
    return this.request<Entity>({
      method: 'PATCH',
      path: `/entities/${id}`,
      body: params,
    });
  }

  /**
   * Delete an entity
   *
   * @param id - Entity ID
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if entity doesn't exist
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'entity');
    return this.request<void>({
      method: 'DELETE',
      path: `/entities/${id}`,
    });
  }

  /**
   * Search entities by name or alias
   *
   * @param query - Search query
   * @param options - Search options
   * @returns List of matching entities with scores
   *
   * @example
   * ```typescript
   * const results = await client.entities.search('Einstein', {
   *   type: 'person',
   *   limit: 5,
   * });
   * ```
   */
  async search(
    query: string,
    options?: SearchEntitiesParams
  ): Promise<{ data: ScoredEntity[] }> {
    return this.request<{ data: ScoredEntity[] }>({
      method: 'POST',
      path: '/entities/search',
      body: { query, ...options },
    });
  }

  /**
   * Find entities by type
   *
   * @param type - Entity type to filter by
   * @param options - Additional filter options
   * @returns List of entities of the specified type
   */
  async findByType(
    type: string,
    options?: Omit<ListEntitiesParams, 'type'>
  ): Promise<PaginatedResponse<Entity>> {
    return this.list({ ...options, type });
  }

  /**
   * Find entities linked to a memory
   *
   * @param memoryId - Memory ID
   * @returns List of entities linked to the memory
   */
  async findByMemory(memoryId: string): Promise<{ data: Entity[] }> {
    validateId(memoryId, 'memory');
    return this.request<{ data: Entity[] }>({
      method: 'GET',
      path: `/memories/${memoryId}/entities`,
    });
  }

  /**
   * Resolve text to an entity
   *
   * Attempts to match text to an existing entity, with optional context
   * for disambiguation.
   *
   * @param text - Text to resolve
   * @param options - Resolution options
   * @returns Resolution result with matched entity and confidence
   *
   * @example
   * ```typescript
   * const result = await client.entities.resolve('Einstein', {
   *   context: 'Nobel Prize in Physics',
   * });
   * if (result.entity) {
   *   console.log(`Resolved to ${result.entity.name} (${result.confidence})`);
   * }
   * ```
   */
  async resolve(
    text: string,
    options?: ResolveEntityParams
  ): Promise<EntityResolutionResult> {
    return this.request<EntityResolutionResult>({
      method: 'POST',
      path: '/entities/resolve',
      body: { text, ...options },
    });
  }

  /**
   * Merge two entities
   *
   * Merges the source entity into the target entity, combining their
   * properties, aliases, and memory links.
   *
   * @param targetId - ID of entity to merge into
   * @param sourceId - ID of entity to merge from (will be deleted)
   * @returns Merge result with the merged entity
   *
   * @example
   * ```typescript
   * // Merge duplicate entities
   * const result = await client.entities.merge('ent_1', 'ent_2');
   * console.log(`Merged into ${result.mergedEntity.name}`);
   * console.log(`Deleted entity ${result.deletedId}`);
   * ```
   */
  async merge(targetId: string, sourceId: string): Promise<EntityMergeResult> {
    validateId(targetId, 'entity');
    validateId(sourceId, 'entity');
    return this.request<EntityMergeResult>({
      method: 'POST',
      path: `/entities/${targetId}/merge`,
      body: { sourceId },
    });
  }

  /**
   * Link an entity to a memory
   *
   * @param entityId - Entity ID
   * @param memoryId - Memory ID
   * @returns Link result
   */
  async linkToMemory(
    entityId: string,
    memoryId: string
  ): Promise<EntityMemoryLinkResult> {
    validateId(entityId, 'entity');
    validateId(memoryId, 'memory');
    return this.request<EntityMemoryLinkResult>({
      method: 'POST',
      path: `/entities/${entityId}/memories`,
      body: { memoryId },
    });
  }

  /**
   * Unlink an entity from a memory
   *
   * @param entityId - Entity ID
   * @param memoryId - Memory ID
   */
  async unlinkFromMemory(entityId: string, memoryId: string): Promise<void> {
    validateId(entityId, 'entity');
    validateId(memoryId, 'memory');
    return this.request<void>({
      method: 'DELETE',
      path: `/entities/${entityId}/memories/${memoryId}`,
    });
  }

  /**
   * Create multiple entities in bulk
   *
   * @param entities - Array of entities to create
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   *
   * @example
   * ```typescript
   * const result = await client.entities.bulkCreate([
   *   { name: 'Einstein', type: 'person' },
   *   { name: 'Berlin', type: 'location' },
   * ]);
   * console.log(`Created ${result.success} entities`);
   * ```
   */
  async bulkCreate(
    entities: CreateEntityParams[]
  ): Promise<BulkResult & { entities?: Entity[] }> {
    validateBulkArray(entities, 'bulkCreate');
    return this.request<BulkResult & { entities?: Entity[] }>({
      method: 'POST',
      path: '/entities/bulk',
      body: { entities },
    });
  }

  /**
   * Delete multiple entities in bulk
   *
   * @param ids - Array of entity IDs to delete
   * @returns Bulk operation result
   */
  async bulkDelete(ids: string[]): Promise<BulkResult> {
    validateBulkArray(ids, 'bulkDelete');
    return this.request<BulkResult>({
      method: 'DELETE',
      path: '/entities/bulk',
      body: { ids },
    });
  }

  /**
   * Extract entities from a memory
   *
   * Uses NER (Named Entity Recognition) to extract entities from memory content.
   *
   * @param memoryId - Memory ID to extract from
   * @param options - Extraction options
   * @returns Extracted entities
   *
   * @example
   * ```typescript
   * // Extract, save, and link entities
   * const result = await client.entities.extract('mem_123', {
   *   save: true,
   *   link: true,
   * });
   * console.log(`Extracted ${result.entities.length} entities`);
   * ```
   */
  async extract(
    memoryId: string,
    options?: { save?: boolean; link?: boolean }
  ): Promise<EntityExtractionResult> {
    validateId(memoryId, 'memory');
    return this.request<EntityExtractionResult>({
      method: 'POST',
      path: `/memories/${memoryId}/extract-entities`,
      body: options || {},
    });
  }

  /**
   * Get all entity types in the system
   *
   * @returns List of entity types with counts
   *
   * @example
   * ```typescript
   * const result = await client.entities.getTypes();
   * for (const type of result.types) {
   *   console.log(`${type.name}: ${type.count} entities`);
   * }
   * ```
   */
  async getTypes(): Promise<EntityTypesResult> {
    return this.request<EntityTypesResult>({
      method: 'GET',
      path: '/entities/types',
    });
  }

  /**
   * Get facts about an entity
   *
   * Returns all facts where the entity is the subject or object.
   *
   * @param entityId - Entity ID
   * @returns List of facts about the entity
   *
   * @example
   * ```typescript
   * const result = await client.entities.getFacts('ent_123');
   * for (const fact of result.facts) {
   *   console.log(`${fact.subject} ${fact.predicate} ${fact.object}`);
   * }
   * ```
   */
  async getFacts(entityId: string): Promise<EntityFactsResult> {
    validateId(entityId, 'entity');
    return this.request<EntityFactsResult>({
      method: 'GET',
      path: `/entities/${entityId}/facts`,
    });
  }
}
