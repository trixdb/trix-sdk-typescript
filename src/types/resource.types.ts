/**
 * Resource type definitions for the Trix SDK.
 * Resources represent projects, topics, or other groupings for memories.
 */

import type { BaseEntityWithMetadata, PaginationParams } from './common.types.js';
import type { ResourceRelationshipType } from './memory.types.js';

// ============================================================================
// Resource Entity
// ============================================================================

/**
 * Resource object - represents a project, topic, or other grouping for memories.
 */
export interface Resource extends BaseEntityWithMetadata {
  name: string;
  type: string;
  description?: string;
}

// ============================================================================
// Resource Parameters
// ============================================================================

/**
 * Parameters for creating a resource.
 */
export interface CreateResourceParams {
  name: string;
  type?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a resource.
 */
export interface UpdateResourceParams {
  name?: string;
  type?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing resources.
 */
export interface ListResourcesParams extends PaginationParams {
  type?: string;
  search?: string;
  sort?: 'created_at' | 'updated_at' | 'name' | 'type';
  order?: 'asc' | 'desc';
}

// ============================================================================
// Resource Results
// ============================================================================

/**
 * Resource list response.
 */
export interface ResourceListResult {
  data: Resource[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Memory-resource link.
 */
export interface MemoryResource {
  memoryId: string;
  resourceId: string;
  relationshipType: ResourceRelationshipType;
  createdAt: string;
  resource?: Resource;
}

/**
 * Memory resources list response.
 */
export interface MemoryResourcesResult {
  memoryId: string;
  data: Array<Resource & { relationshipType: ResourceRelationshipType; linkedAt: string }>;
}

/**
 * Resource memories list response.
 */
export interface ResourceMemoriesResult {
  resourceId: string;
  data: Array<{
    id: string;
    content: string;
    relationshipType: ResourceRelationshipType;
    linkedAt: string;
    [key: string]: unknown;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Parameters for linking a resource to a memory.
 */
export interface LinkResourceParams {
  resourceId: string;
  relationshipType?: ResourceRelationshipType;
}

/**
 * Result of linking a resource to a memory.
 */
export interface LinkResourceResult {
  memoryId: string;
  resourceId: string;
  relationshipType: ResourceRelationshipType;
  linked: boolean;
}

/**
 * Result of unlinking a resource from a memory.
 */
export interface UnlinkResourceResult {
  memoryId: string;
  resourceId: string;
  unlinked: boolean;
}
