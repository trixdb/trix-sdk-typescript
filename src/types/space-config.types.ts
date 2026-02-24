/**
 * Space configuration type definitions for the Trix SDK.
 *
 * These types support the ADR-042 Space Configuration Layer,
 * which provides per-space configuration for memory, LLM,
 * retrieval, and privacy settings.
 */

// ============================================================================
// Space Config Entities
// ============================================================================

/**
 * A configuration category with defaults, overrides, and effective values.
 *
 * - `defaults`: System-level defaults for this category
 * - `overrides`: Space-specific overrides set by the user
 * - `effective`: Computed values (defaults merged with overrides)
 */
export interface SpaceConfigCategory {
  defaults: Record<string, unknown>;
  overrides: Record<string, unknown>;
  effective: Record<string, unknown>;
}

/**
 * Full space configuration response.
 *
 * Contains all four configuration categories and an optimistic
 * concurrency version number.
 */
export interface SpaceConfig {
  config: {
    memory: SpaceConfigCategory;
    llm: SpaceConfigCategory;
    retrieval: SpaceConfigCategory;
    privacy: SpaceConfigCategory;
  };
  version: number;
}

// ============================================================================
// Space Config Parameters
// ============================================================================

/**
 * Partial configuration patch using JSON Merge Patch semantics.
 *
 * Only include the categories and keys you want to change.
 * Set a key to `null` to remove an override and revert to the default.
 */
export interface SpaceConfigPatch {
  memory?: Record<string, unknown>;
  llm?: Record<string, unknown>;
  retrieval?: Record<string, unknown>;
  privacy?: Record<string, unknown>;
}

// ============================================================================
// Space Config Validation
// ============================================================================

/**
 * Result of a dry-run configuration validation.
 */
export interface SpaceConfigValidation {
  valid: boolean;
  errors: string[];
  categories: string[];
}

// ============================================================================
// Space Config Audit
// ============================================================================

/**
 * A single audit trail event for a configuration change.
 */
export interface SpaceConfigAuditEvent {
  id: string;
  space_id: string;
  category: string;
  actor_user_id: string | null;
  source: string;
  patch: Record<string, unknown>;
  previous_value: Record<string, unknown>;
  created_at: string;
}

/**
 * Paginated audit trail response.
 */
export interface SpaceConfigAuditResponse {
  events: SpaceConfigAuditEvent[];
  total: number;
  limit: number;
  offset: number;
}
