/**
 * Space configuration resource
 */

import type { Trix } from '../client.js';
import type {
  SpaceConfig,
  SpaceConfigPatch,
  SpaceConfigValidation,
  SpaceConfigAuditResponse,
} from '../types.js';
import { validateId } from '../utils/security.js';

/**
 * Space configuration resource for managing per-space settings.
 *
 * Provides access to the ADR-042 Space Configuration Layer, which
 * supports per-space configuration for memory, LLM, retrieval, and
 * privacy settings with defaults/overrides semantics.
 *
 * @example
 * ```typescript
 * // Get current configuration
 * const config = await client.spaceConfig.get('space_123');
 * console.log(config.config.retrieval.effective);
 *
 * // Update retrieval settings
 * const updated = await client.spaceConfig.update('space_123', {
 *   retrieval: { top_k: 20, similarity_threshold: 0.8 }
 * });
 * ```
 */
export class SpaceConfigResource {
  constructor(private readonly client: Trix) {}

  /**
   * Get the full configuration for a space.
   *
   * Returns all four categories (memory, llm, retrieval, privacy)
   * with their defaults, overrides, and effective values.
   *
   * @param spaceId - Space ID
   * @returns Space configuration with version number
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if space doesn't exist
   *
   * @example
   * ```typescript
   * const config = await client.spaceConfig.get('space_123');
   * console.log(`Version: ${config.version}`);
   * console.log(`Top-K: ${config.config.retrieval.effective.top_k}`);
   * ```
   */
  async get(spaceId: string): Promise<SpaceConfig> {
    validateId(spaceId, 'space');
    return this.client.request<SpaceConfig>({
      method: 'GET',
      path: `/spaces/${spaceId}/config`,
    });
  }

  /**
   * Update space configuration using JSON Merge Patch semantics.
   *
   * Only include the categories and keys you want to change.
   * Set a key to `null` to remove an override and revert to the default.
   *
   * @param spaceId - Space ID
   * @param patch - Partial configuration patch
   * @returns Updated space configuration
   *
   * @throws ValidationError if ID format is invalid or patch is invalid
   * @throws NotFoundError if space doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await client.spaceConfig.update('space_123', {
   *   retrieval: { top_k: 20 },
   *   privacy: { pii_detection: true }
   * });
   * ```
   */
  async update(
    spaceId: string,
    patch: SpaceConfigPatch,
    options?: { expectedVersion?: number },
  ): Promise<SpaceConfig> {
    validateId(spaceId, 'space');
    const headers: Record<string, string> = {};
    if (options?.expectedVersion !== undefined) {
      headers['If-Match'] = String(options.expectedVersion);
    }
    return this.client.request<SpaceConfig>({
      method: 'PATCH',
      path: `/spaces/${spaceId}/config`,
      body: patch,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });
  }

  /**
   * Validate a configuration patch without applying it (dry run).
   *
   * Use this to check whether a patch is valid before applying it.
   *
   * @param spaceId - Space ID
   * @param patch - Configuration patch to validate
   * @returns Validation result with errors (if any) and affected categories
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if space doesn't exist
   *
   * @example
   * ```typescript
   * const result = await client.spaceConfig.validate('space_123', {
   *   retrieval: { top_k: -1 }
   * });
   * if (!result.valid) {
   *   console.error('Invalid config:', result.errors);
   * }
   * ```
   */
  async validate(
    spaceId: string,
    patch: SpaceConfigPatch,
  ): Promise<SpaceConfigValidation> {
    validateId(spaceId, 'space');
    return this.client.request<SpaceConfigValidation>({
      method: 'POST',
      path: `/spaces/${spaceId}/config/validate`,
      body: patch,
    });
  }

  /**
   * Get the configuration audit trail for a space.
   *
   * Returns a paginated list of all configuration changes,
   * including who made the change, what was changed, and the
   * previous values.
   *
   * @param spaceId - Space ID
   * @param params - Optional pagination parameters
   * @returns Paginated audit events
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if space doesn't exist
   *
   * @example
   * ```typescript
   * const audit = await client.spaceConfig.audit('space_123', {
   *   limit: 10,
   *   offset: 0
   * });
   * audit.events.forEach(event => {
   *   console.log(`${event.category} changed by ${event.source}`);
   * });
   * ```
   */
  async audit(
    spaceId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<SpaceConfigAuditResponse> {
    validateId(spaceId, 'space');
    return this.client.request<SpaceConfigAuditResponse>({
      method: 'GET',
      path: `/spaces/${spaceId}/config/audit`,
      query: params,
    });
  }
}
