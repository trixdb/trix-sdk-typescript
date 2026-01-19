/**
 * Fact type definitions for the Trix SDK.
 * Represents knowledge graph triples (Subject-Predicate-Object).
 */

import type { BaseEntityWithMetadata, PaginationParams } from './common.types.js';

// ============================================================================
// Fact Enums
// ============================================================================

/** Type of subject/object in a fact */
export type FactNodeType = 'entity' | 'text' | 'memory';

// ============================================================================
// Fact Source
// ============================================================================

/**
 * Source of a fact (how it was created).
 */
export interface FactSource {
  memoryId?: string;
  sessionId?: string;
  method?: 'manual' | 'extracted' | 'inferred';
}

// ============================================================================
// Fact Entity
// ============================================================================

/**
 * Fact object - represents a knowledge graph triple.
 */
export interface Fact extends BaseEntityWithMetadata {
  subject: string;
  predicate: string;
  object: string;
  subjectType?: FactNodeType;
  objectType?: FactNodeType;
  confidence: number;
  source?: FactSource;
  validFrom?: string;
  validTo?: string;
  spaceId?: string;
}

// ============================================================================
// Fact Parameters
// ============================================================================

/**
 * Parameters for creating a fact.
 */
export interface CreateFactParams {
  subject: string;
  predicate: string;
  object: string;
  subjectType?: FactNodeType;
  objectType?: FactNodeType;
  confidence?: number;
  source?: FactSource;
  validFrom?: string;
  validTo?: string;
  metadata?: Record<string, unknown>;
  spaceId?: string;
}

/**
 * Parameters for updating a fact.
 */
export interface UpdateFactParams {
  subject?: string;
  predicate?: string;
  object?: string;
  subjectType?: FactNodeType;
  objectType?: FactNodeType;
  confidence?: number;
  validFrom?: string;
  validTo?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing facts.
 */
export interface ListFactsParams extends PaginationParams {
  subject?: string;
  predicate?: string;
  object?: string;
  minConfidence?: number;
  spaceId?: string;
}

/**
 * Parameters for querying facts.
 */
export interface QueryFactsParams {
  limit?: number;
  minConfidence?: number;
  spaceId?: string;
}

// ============================================================================
// Fact Results
// ============================================================================

/**
 * Fact with relevance score.
 */
export interface ScoredFact extends Fact {
  score: number;
}

/**
 * Result of fact extraction.
 */
export interface FactExtractionResult {
  memoryId: string;
  facts: Array<{
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
  }>;
  saved?: boolean;
}

/**
 * Result of fact verification.
 */
export interface FactVerificationResult {
  factId: string;
  verified: boolean;
  confidence: number;
  supportingMemories: string[];
  contradictingMemories?: string[];
}
