/**
 * Space type definitions for the Trix SDK.
 */

import type { BaseEntityWithMetadata } from './common.types.js';

// ============================================================================
// Space Entity
// ============================================================================

/**
 * Space object.
 */
export interface Space extends BaseEntityWithMetadata {
  name: string;
  slug: string;
  description?: string;
}

// ============================================================================
// Space Parameters
// ============================================================================

/**
 * Parameters for creating a space.
 */
export interface CreateSpaceParams {
  name: string;
  slug?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a space.
 */
export interface UpdateSpaceParams {
  name?: string;
  slug?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
