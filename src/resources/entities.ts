/**
 * Entities resource — named entities in the knowledge graph.
 *
 * The live API surface is read-mostly under `/v1/knowledge/entities` plus a
 * merge endpoint. The previous create/update/delete/search/resolve/bulk/
 * extract/link/getTypes methods targeted endpoints that do not exist (they
 * 404), so they have been removed; only the real surface is exposed here.
 *
 * @example
 * ```typescript
 * const { data } = await client.entities.list({ type: 'person' });
 * const entity = await client.entities.get('ent_123');
 * const { facts } = await client.entities.getFacts('ent_123');
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Entity,
  ListEntitiesParams,
  EntityMergeResult,
  EntityFactsResult,
  PaginatedResponse,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

/**
 * Entities resource for reading named entities and merging duplicates.
 */
export class Entities extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * List entities with optional filters.
   *
   * `GET /v1/knowledge/entities`
   *
   * @param params - Filter and pagination parameters
   * @returns Paginated list of entities
   */
  async list(params?: ListEntitiesParams): Promise<PaginatedResponse<Entity>> {
    return this.request<PaginatedResponse<Entity>>({
      method: 'GET',
      path: '/knowledge/entities',
      params: buildParams(params || {}),
    });
  }

  /**
   * Get an entity by ID.
   *
   * `GET /v1/knowledge/entities/:id`
   *
   * @param id - Entity ID
   * @returns Entity object
   */
  async get(id: string): Promise<Entity> {
    validateId(id, 'entity');
    return this.request<Entity>({
      method: 'GET',
      path: `/knowledge/entities/${id}`,
    });
  }

  /**
   * Find entities by type (filtered list).
   *
   * @param type - Entity type to filter by
   * @param options - Additional filter options
   * @returns Paginated list of entities of the specified type
   */
  async findByType(
    type: string,
    options?: Omit<ListEntitiesParams, 'type'>
  ): Promise<PaginatedResponse<Entity>> {
    return this.list({ ...options, type });
  }

  /**
   * Get facts about an entity.
   *
   * `GET /v1/knowledge/entities/:id/facts`
   *
   * @param entityId - Entity ID
   * @returns Facts where the entity is the subject or object
   */
  async getFacts(entityId: string): Promise<EntityFactsResult> {
    validateId(entityId, 'entity');
    return this.request<EntityFactsResult>({
      method: 'GET',
      path: `/knowledge/entities/${entityId}/facts`,
    });
  }

  /**
   * Merge two entities.
   *
   * `POST /v1/knowledge/entities/merge` (the source entity is merged into the
   * target and deleted). Note the body carries both ids — the endpoint is not
   * nested under an entity id.
   *
   * @param targetId - ID of the entity to merge into
   * @param sourceId - ID of the entity to merge from (will be deleted)
   * @returns Merge result with the merged entity
   */
  async merge(targetId: string, sourceId: string): Promise<EntityMergeResult> {
    validateId(targetId, 'entity');
    validateId(sourceId, 'entity');
    return this.request<EntityMergeResult>({
      method: 'POST',
      path: '/knowledge/entities/merge',
      body: { sourceId, targetId },
    });
  }
}
