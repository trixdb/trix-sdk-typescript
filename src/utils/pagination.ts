/**
 * Pagination utilities and async iterators
 */

// Import from the defining module (not the `../types.js` barrel) so multi-entry
// dts chunking doesn't split this through the types/index cycle (#7).
import type { PaginatedResponse } from '../types/common.types.js';

/**
 * Options for pagination
 */
export interface PaginationOptions {
  limit?: number;
  page?: number;
}

/** Default maximum pages to prevent infinite loops */
const DEFAULT_MAX_PAGES = 1000;

/** Maximum size for duplicate detection set to prevent memory issues */
const MAX_SEEN_IDS_SIZE = 100000;

/**
 * Extract ID from an item for duplicate detection.
 * Supports objects with id, _id, or uses JSON stringification as fallback.
 */
function getItemId<T>(item: T): string {
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    if (typeof obj.id === 'string') return obj.id;
    if (typeof obj._id === 'string') return obj._id;
  }
  // Fallback: use stringified version (less efficient but handles edge cases)
  return JSON.stringify(item);
}

/**
 * Async iterator for paginated results with safety limits
 *
 * Includes duplicate detection to prevent infinite loops when the API
 * returns the same items repeatedly (e.g., due to cursor issues).
 *
 * @param fetchPage - Function to fetch a page of results
 * @param params - Pagination parameters
 * @param maxPages - Maximum number of pages to fetch (default: 1000)
 *
 * @example
 * ```typescript
 * for await (const item of client.memories.listAll({ limit: 100 })) {
 *   console.log(item);
 * }
 * ```
 */
export async function* paginateIterator<T, P extends PaginationOptions>(
  fetchPage: (params: P) => Promise<PaginatedResponse<T>>,
  params: P,
  maxPages: number = DEFAULT_MAX_PAGES
): AsyncGenerator<T, void, unknown> {
  let page = params.page ?? 1;
  const limit = params.limit ?? 100;
  let hasMore = true;
  let pagesIterated = 0;
  const seenIds = new Set<string>();
  let consecutiveDuplicatePages = 0;

  while (hasMore && pagesIterated < maxPages) {
    const response = await fetchPage({ ...params, page, limit } as P);

    // Defensive: a malformed or truncated envelope (missing `data`/`pagination`)
    // should terminate iteration cleanly rather than throw a TypeError mid-stream.
    const items = response?.data ?? [];

    // Track duplicates in this page
    let duplicatesInPage = 0;

    for (const item of items) {
      const itemId = getItemId(item);

      // Check for duplicate
      if (seenIds.has(itemId)) {
        duplicatesInPage++;
        continue; // Skip duplicate items
      }

      // Add to seen set (with size limit to prevent memory issues)
      if (seenIds.size < MAX_SEEN_IDS_SIZE) {
        seenIds.add(itemId);
      }

      yield item;
    }

    // Detect if entire page was duplicates (infinite loop condition)
    if (items.length > 0 && duplicatesInPage === items.length) {
      consecutiveDuplicatePages++;
      if (consecutiveDuplicatePages >= 3) {
        throw new Error(
          'Pagination stopped: detected 3 consecutive pages of duplicate items. ' +
          'This may indicate an API pagination issue.'
        );
      }
    } else {
      consecutiveDuplicatePages = 0;
    }

    // Responses are camelCased centrally in handleResponse (#4), so the wire's
    // `has_more` arrives as `hasMore`. A missing `pagination` envelope stops
    // iteration rather than throwing.
    hasMore = response?.pagination?.hasMore ?? false;
    page++;
    pagesIterated++;

    // Safety check: if we receive no data, stop iterating
    if (items.length === 0) {
      break;
    }
  }

  if (pagesIterated >= maxPages) {
    throw new Error(
      `Pagination limit reached (${maxPages} pages). ` +
      `Use a larger limit parameter or increase maxPages if more results are needed.`
    );
  }
}

/**
 * Collect all paginated results into an array
 *
 * @param fetchPage - Function that fetches a page of results
 * @param params - Pagination parameters
 * @returns Array of all results
 *
 * @example
 * ```typescript
 * const allMemories = await paginateAll(
 *   (params) => client.memories.list(params),
 *   { limit: 100 }
 * );
 * ```
 */
export async function paginateAll<T, P extends PaginationOptions>(
  fetchPage: (params: P) => Promise<PaginatedResponse<T>>,
  params: P
): Promise<T[]> {
  const results: T[] = [];

  for await (const item of paginateIterator(fetchPage, params)) {
    results.push(item);
  }

  return results;
}
