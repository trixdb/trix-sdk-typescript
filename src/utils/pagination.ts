/**
 * Pagination utilities and async iterators
 */

import type { PaginatedResponse } from '../types.js';

/**
 * Options for pagination
 */
export interface PaginationOptions {
  limit?: number;
  page?: number;
}

/** Default maximum pages to prevent infinite loops */
const DEFAULT_MAX_PAGES = 1000;

/**
 * Async iterator for paginated results with safety limits
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

  while (hasMore && pagesIterated < maxPages) {
    const response = await fetchPage({ ...params, page, limit } as P);

    for (const item of response.data) {
      yield item;
    }

    hasMore = response.pagination.hasMore;
    page++;
    pagesIterated++;

    // Safety check: if we receive no data, stop iterating
    if (response.data.length === 0) {
      break;
    }
  }

  if (pagesIterated >= maxPages) {
    console.warn(
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
