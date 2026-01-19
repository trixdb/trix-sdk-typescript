/**
 * Relationship type definitions for the Trix SDK.
 */

import type { BaseEntityWithMetadata } from './common.types.js';
import type { Memory } from './memory.types.js';

// ============================================================================
// Relationship Entity
// ============================================================================

/**
 * Relationship object.
 */
export interface Relationship extends BaseEntityWithMetadata {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
}

// ============================================================================
// Relationship Parameters
// ============================================================================

/**
 * Parameters for creating a relationship.
 */
export interface CreateRelationshipParams {
  relationshipType: string;
  strength?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a relationship.
 */
export interface UpdateRelationshipParams {
  relationshipType?: string;
  strength?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for reinforcing a relationship.
 */
export interface ReinforceParams {
  amount?: number;
}

/**
 * Parameters for weakening a relationship.
 */
export interface WeakenParams {
  amount?: number;
}

// ============================================================================
// Relationship Extended Types
// ============================================================================

/**
 * Relationship type info.
 */
export interface RelationshipType {
  name: string;
  count: number;
  description?: string;
}

/**
 * Related memories result.
 */
export interface RelatedMemoriesResult {
  memoryId: string;
  related: Array<{
    memory: Memory;
    relationship: Relationship;
    score: number;
  }>;
}

/**
 * Parameters for reinforcing a group of relationships.
 */
export interface ReinforceGroupParams {
  relationshipIds: string[];
  amount?: number;
}

/**
 * Reinforce group result.
 */
export interface ReinforceGroupResult {
  reinforced: number;
  failed: number;
}
