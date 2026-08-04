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
  weight: number;
}

// ============================================================================
// Relationship Parameters
// ============================================================================

/**
 * Parameters for creating a relationship.
 */
export interface CreateRelationshipParams {
  relationshipType: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a relationship. The relationship's key
 * (source, target, type) is addressed via the path, not the body — the type
 * itself is immutable, so it is not settable here.
 */
export interface UpdateRelationshipParams {
  description?: string;
  weight?: number;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for reinforcing a relationship.
 */
export interface ReinforceParams {
  /** Amount added to the relationship weight (server default: 0.1). */
  boost?: number;
  /** Free-form note stored as `last_reinforcement` in the metadata. */
  context?: unknown;
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
