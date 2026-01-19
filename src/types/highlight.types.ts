/**
 * Highlight type definitions for the Trix SDK.
 */

import type { BaseEntityWithMetadata, PaginationParams } from './common.types.js';

// ============================================================================
// Highlight Entity
// ============================================================================

/**
 * Highlight object.
 */
export interface Highlight extends BaseEntityWithMetadata {
  memoryId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color?: string;
  note?: string;
}

// ============================================================================
// Highlight Parameters
// ============================================================================

/**
 * Parameters for creating a highlight.
 */
export interface CreateHighlightParams {
  text: string;
  startOffset: number;
  endOffset: number;
  color?: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a highlight.
 */
export interface UpdateHighlightParams {
  color?: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing highlights.
 */
export interface ListHighlightsParams extends Pick<PaginationParams, 'limit' | 'page'> {}

/**
 * Parameters for extracting highlights.
 */
export interface ExtractParams {
  method?: 'ai' | 'keyword' | 'tfidf';
  limit?: number;
  minLength?: number;
}

/**
 * Extract result.
 */
export interface ExtractResult {
  highlights: Array<{
    text: string;
    startOffset: number;
    endOffset: number;
    score: number;
  }>;
}

// ============================================================================
// Highlight Extended Types
// ============================================================================

/**
 * Parameters for searching highlights.
 */
export interface SearchHighlightsParams {
  limit?: number;
  threshold?: number;
  spaceId?: string;
}

/**
 * Highlight search result.
 */
export interface HighlightSearchResult {
  highlights: Array<{
    highlight: Highlight;
    score: number;
  }>;
}

/**
 * Highlight type info.
 */
export interface HighlightType {
  name: string;
  count: number;
  color?: string;
}

/**
 * Parameters for linking highlight to memory.
 */
export interface LinkHighlightParams {
  memoryId: string;
}

/**
 * Highlight link result.
 */
export interface HighlightLinkResult {
  highlightId: string;
  memoryId: string;
  linked: boolean;
}
