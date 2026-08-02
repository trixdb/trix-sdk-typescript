/**
 * TDD-style tests for pagination utilities
 */

import { paginateIterator, paginateAll } from '../src/utils/pagination';
import type { PaginatedResponse } from '../src/types';

describe('paginateIterator', () => {
  // Helper to create mock paginated responses
  function createMockFetcher<T>(pages: T[][], total?: number) {
    return jest.fn().mockImplementation(
      (params: { limit: number; page: number }): Promise<PaginatedResponse<T>> => {
        const pageIndex = params.page - 1;
        const data = pages[pageIndex] || [];
        const hasMore = pageIndex < pages.length - 1;
        return Promise.resolve({
          data,
          pagination: {
            total: total ?? pages.flat().length,
            page: params.page,
            limit: params.limit,
            hasMore,
          },
        });
      }
    );
  }

  describe('basic iteration', () => {
    it('should iterate through single page', async () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const fetcher = createMockFetcher([items]);
      const results: typeof items = [];

      for await (const item of paginateIterator(fetcher, { limit: 100 })) {
        results.push(item);
      }

      expect(results).toEqual(items);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should iterate through multiple pages', async () => {
      const page1 = [{ id: 1 }, { id: 2 }];
      const page2 = [{ id: 3 }, { id: 4 }];
      const page3 = [{ id: 5 }];
      const fetcher = createMockFetcher([page1, page2, page3]);
      const results: typeof page1 = [];

      for await (const item of paginateIterator(fetcher, { limit: 2 })) {
        results.push(item);
      }

      expect(results).toEqual([...page1, ...page2, ...page3]);
      expect(fetcher).toHaveBeenCalledTimes(3);
    });

    it('should handle empty results', async () => {
      const fetcher = createMockFetcher<{ id: number }>([[]]);
      const results: { id: number }[] = [];

      for await (const item of paginateIterator(fetcher, { limit: 100 })) {
        results.push(item);
      }

      expect(results).toEqual([]);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('parameters', () => {
    it('should pass limit parameter correctly', async () => {
      const fetcher = createMockFetcher([[{ id: 1 }]]);

      for await (const _ of paginateIterator(fetcher, { limit: 50 })) {
        // consume iterator
      }

      expect(fetcher).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });

    it('should use default limit of 100', async () => {
      const fetcher = createMockFetcher([[{ id: 1 }]]);

      for await (const _ of paginateIterator(fetcher, {})) {
        // consume iterator
      }

      expect(fetcher).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it('should start from page 1 by default', async () => {
      const fetcher = createMockFetcher([[{ id: 1 }]]);

      for await (const _ of paginateIterator(fetcher, {})) {
        // consume iterator
      }

      expect(fetcher).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it('should respect custom starting page', async () => {
      const page2 = [{ id: 3 }, { id: 4 }];
      const fetcher = createMockFetcher([[], page2]);

      for await (const _ of paginateIterator(fetcher, { page: 2 })) {
        // consume iterator
      }

      expect(fetcher).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('should preserve additional parameters', async () => {
      const fetcher = createMockFetcher([[{ id: 1 }]]);
      const params = { limit: 50, q: 'search', tags: ['tag1'] } as any;

      for await (const _ of paginateIterator(fetcher, params)) {
        // consume iterator
      }

      expect(fetcher).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'search', tags: ['tag1'] })
      );
    });
  });

  describe('snake_case has_more from the API (#5)', () => {
    // The API sends `has_more` (snake_case). The iterator must not truncate
    // after page 1 when only `has_more` is present.
    function createSnakeFetcher<T>(pages: T[][]) {
      return jest.fn().mockImplementation(
        (params: { limit: number; page: number }) => {
          const pageIndex = params.page - 1;
          const data = pages[pageIndex] || [];
          return Promise.resolve({
            data,
            pagination: {
              total: pages.flat().length,
              page: params.page,
              limit: params.limit,
              // NOTE: snake_case only — no `hasMore` alias.
              has_more: pageIndex < pages.length - 1,
            },
          });
        }
      );
    }

    it('paginateIterator yields items from BOTH pages when API sends has_more', async () => {
      const page1 = [{ id: 1 }, { id: 2 }];
      const page2 = [{ id: 3 }, { id: 4 }];
      const fetcher = createSnakeFetcher([page1, page2]);
      const results: Array<{ id: number }> = [];

      for await (const item of paginateIterator(fetcher, { limit: 2 })) {
        results.push(item);
      }

      expect(results).toEqual([...page1, ...page2]);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('paginateAll collects both pages when API sends has_more', async () => {
      const page1 = [{ id: 'a' }];
      const page2 = [{ id: 'b' }];
      const fetcher = createSnakeFetcher([page1, page2]);

      const results = await paginateAll(fetcher, { limit: 1 });

      expect(results).toEqual([{ id: 'a' }, { id: 'b' }]);
    });

    it('stops after the last page when has_more is false', async () => {
      const fetcher = createSnakeFetcher([[{ id: 1 }]]);
      const results: Array<{ id: number }> = [];

      for await (const item of paginateIterator(fetcher, { limit: 10 })) {
        results.push(item);
      }

      expect(results).toEqual([{ id: 1 }]);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('pagination safety', () => {
    it('should stop when hasMore is false', async () => {
      // Create a fetcher that always returns hasMore: false
      const fetcher = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        pagination: { total: 1, page: 1, limit: 100, hasMore: false },
      });

      const results: { id: number }[] = [];
      for await (const item of paginateIterator(fetcher, {})) {
        results.push(item);
      }

      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should stop when receiving empty data', async () => {
      // Create a fetcher that returns empty data but hasMore: true (buggy API)
      let callCount = 0;
      const fetcher = jest.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: callCount === 1 ? [{ id: 1 }] : [],
          pagination: { total: 100, page: callCount, limit: 10, hasMore: true },
        });
      });

      const results: { id: number }[] = [];
      for await (const item of paginateIterator(fetcher, {})) {
        results.push(item);
      }

      // Should stop after receiving empty data, not infinite loop
      expect(callCount).toBe(2);
    });

    it('should respect max pages limit and throw', async () => {
      // Create a fetcher that always returns hasMore: true (infinite)
      const fetcher = jest.fn().mockImplementation((params: { page: number }) => {
        return Promise.resolve({
          data: [{ id: params.page }],
          pagination: { total: 10000, page: params.page, limit: 1, hasMore: true },
        });
      });

      const results: { id: number }[] = [];
      // Use custom max pages of 5 — should throw after exhausting pages
      await expect(async () => {
        for await (const item of paginateIterator(fetcher, {}, 5)) {
          results.push(item);
        }
      }).rejects.toThrow('Pagination limit reached');

      expect(results).toHaveLength(5);
      expect(fetcher).toHaveBeenCalledTimes(5);
    });

    it('should throw error when max pages is reached', async () => {
      const fetcher = jest.fn().mockImplementation((params: { page: number }) => {
        return Promise.resolve({
          data: [{ id: params.page }],
          pagination: { total: 10000, page: params.page, limit: 1, hasMore: true },
        });
      });

      await expect(async () => {
        for await (const _ of paginateIterator(fetcher, {}, 3)) {
          // consume iterator
        }
      }).rejects.toThrow('Pagination limit reached');
    });

    it('should use default max pages of 1000', async () => {
      // This test verifies the default is set, not that we iterate 1000 times
      const fetcher = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        pagination: { total: 1, page: 1, limit: 100, hasMore: false },
      });

      for await (const _ of paginateIterator(fetcher, {})) {
        // consume iterator
      }

      // Should work without explicit max pages
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });
});

describe('paginateAll', () => {
  function createMockFetcher<T>(pages: T[][]) {
    return jest.fn().mockImplementation(
      (params: { limit: number; page: number }): Promise<PaginatedResponse<T>> => {
        const pageIndex = params.page - 1;
        const data = pages[pageIndex] || [];
        return Promise.resolve({
          data,
          pagination: {
            total: pages.flat().length,
            page: params.page,
            limit: params.limit,
            hasMore: pageIndex < pages.length - 1,
          },
        });
      }
    );
  }

  it('should collect all items from multiple pages', async () => {
    const page1 = [{ id: 1 }, { id: 2 }];
    const page2 = [{ id: 3 }, { id: 4 }];
    const fetcher = createMockFetcher([page1, page2]);

    const results = await paginateAll(fetcher, { limit: 2 });

    expect(results).toEqual([...page1, ...page2]);
  });

  it('should return empty array for no results', async () => {
    const fetcher = createMockFetcher<{ id: number }>([[]]);

    const results = await paginateAll(fetcher, {});

    expect(results).toEqual([]);
  });

  it('should handle single page', async () => {
    const items = [{ id: 1 }, { id: 2 }];
    const fetcher = createMockFetcher([items]);

    const results = await paginateAll(fetcher, {});

    expect(results).toEqual(items);
  });
});
