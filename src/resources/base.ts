/**
 * Base resource classes and utilities for Trix SDK.
 *
 * This module provides base classes that eliminate duplication between
 * resource implementations.
 */

import type { Trix } from '../client.js';
import { validateId } from '../utils/security.js';

/**
 * Request options for resource methods.
 */
export interface RequestOptions {
  method: string;
  path: string;
  params?: Record<string, unknown>;
  body?: unknown;
  timeout?: number;
}

/**
 * Validate a list of IDs.
 *
 * @param ids - List of IDs to validate (can be undefined)
 * @param resourceType - Type name for error messages
 * @throws ValidationError if any ID is invalid
 */
export function validateIds(ids: string[] | undefined, resourceType: string): void {
  if (ids) {
    for (const id of ids) {
      validateId(id, resourceType);
    }
  }
}

/**
 * Default maximum items for bulk operations.
 */
export const DEFAULT_BULK_LIMIT = 1000;

/**
 * Validate bulk operation array.
 *
 * Checks:
 * - Array is not empty
 * - Array doesn't exceed max size
 *
 * @param items - Array of items to validate
 * @param operationName - Name of operation for error messages
 * @param maxItems - Maximum allowed items (default: 1000)
 * @throws Error if validation fails
 */
export function validateBulkArray<T>(
  items: T[],
  operationName: string,
  maxItems: number = DEFAULT_BULK_LIMIT
): void {
  if (!items || items.length === 0) {
    throw new Error(`${operationName}: array cannot be empty`);
  }
  if (items.length > maxItems) {
    throw new Error(
      `${operationName}: array exceeds maximum of ${maxItems} items (got ${items.length})`
    );
  }
}

/**
 * Check for duplicate IDs in an array.
 *
 * @param items - Array of items with id property
 * @param idField - Field name containing the ID (default: 'id')
 * @returns Array of duplicate IDs found
 */
export function findDuplicateIds<T extends Record<string, unknown>>(
  items: T[],
  idField: string = 'id'
): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const item of items) {
    const id = item[idField] as string;
    if (id) {
      if (seen.has(id)) {
        duplicates.push(id);
      } else {
        seen.add(id);
      }
    }
  }

  return duplicates;
}

/**
 * Build request params, filtering out undefined values.
 *
 * @param params - Object with potential undefined values
 * @returns Object with undefined values removed
 *
 * @example
 * ```typescript
 * const params = buildParams({
 *   limit: 10,
 *   offset: undefined,
 *   query: 'test',
 * });
 * // Returns { limit: 10, query: 'test' }
 * ```
 */
export function buildParams<T extends object>(
  params: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Base class for all resource implementations.
 *
 * Provides common utilities for resources:
 * - Client reference and request delegation
 * - Parameter building helpers
 * - Standard CRUD operation patterns
 *
 * @example
 * ```typescript
 * class MemoriesResource extends BaseResource {
 *   async list(params?: ListParams): Promise<Memory[]> {
 *     const response = await this.request({
 *       method: 'GET',
 *       path: '/memories',
 *       params: buildParams({ limit: params?.limit }),
 *     });
 *     return response.data;
 *   }
 * }
 * ```
 */
export class BaseResource {
  protected client: Trix;

  constructor(client: Trix) {
    this.client = client;
  }

  /**
   * Make an HTTP request through the client.
   *
   * Translates the resource-level `params` option to the client's `query` option
   * for a consistent interface across resources.
   *
   * @param options - Request options
   * @returns Response data from API
   */
  protected async request<T>(options: RequestOptions): Promise<T> {
    // Translate params to query for client compatibility
    const { params, ...rest } = options;
    return this.client.request<T>({
      ...rest,
      query: params,
    });
  }
}
