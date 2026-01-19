/**
 * Entity type definitions for the Trix SDK.
 * Represents named entity management.
 */

import type { BaseEntityWithMetadata, PaginationParams } from './common.types.js';
import type { Fact } from './fact.types.js';

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Entity object - represents a named entity.
 */
export interface Entity extends BaseEntityWithMetadata {
  name: string;
  type: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
  memoryIds?: string[];
  spaceId?: string;
}

// ============================================================================
// Entity Parameters
// ============================================================================

/**
 * Parameters for creating an entity.
 */
export interface CreateEntityParams {
  name: string;
  type: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
  memoryIds?: string[];
  metadata?: Record<string, unknown>;
  spaceId?: string;
}

/**
 * Parameters for updating an entity.
 */
export interface UpdateEntityParams {
  name?: string;
  type?: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing entities.
 */
export interface ListEntitiesParams extends PaginationParams {
  type?: string;
  spaceId?: string;
}

/**
 * Parameters for searching entities.
 */
export interface SearchEntitiesParams {
  type?: string;
  spaceId?: string;
  limit?: number;
}

/**
 * Parameters for resolving text to entity.
 */
export interface ResolveEntityParams {
  context?: string;
  spaceId?: string;
}

// ============================================================================
// Entity Results
// ============================================================================

/**
 * Entity with relevance score.
 */
export interface ScoredEntity extends Entity {
  score: number;
}

/**
 * Result of entity resolution.
 */
export interface EntityResolutionResult {
  text: string;
  entity?: Entity;
  confidence: number;
  alternatives?: Array<{
    entity: Entity;
    confidence: number;
  }>;
}

/**
 * Result of entity merge.
 */
export interface EntityMergeResult {
  mergedEntity: Entity;
  deletedId: string;
}

/**
 * Result of entity-memory link.
 */
export interface EntityMemoryLinkResult {
  entityId: string;
  memoryId: string;
  linked: boolean;
}

/**
 * Result of entity extraction.
 */
export interface EntityExtractionResult {
  memoryId: string;
  entities: Array<{
    name: string;
    type: string;
    confidence: number;
    span?: {
      start: number;
      end: number;
    };
  }>;
  saved?: boolean;
  linked?: boolean;
}

/**
 * Entity type with count.
 */
export interface EntityTypeInfo {
  name: string;
  count: number;
}

/**
 * Result of getting entity types.
 */
export interface EntityTypesResult {
  types: EntityTypeInfo[];
}

/**
 * Result of getting entity facts.
 */
export interface EntityFactsResult {
  entityId: string;
  facts: Fact[];
}
