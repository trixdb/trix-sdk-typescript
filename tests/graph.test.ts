/**
 * Tests for graph expansion functionality
 */

import { Trix } from '../src/client';
import type { GraphExpansionResult } from '../src/types';

// Mock fetch for testing
function createMockFetch(response: {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
  ok?: boolean;
}) {
  const defaultHeaders: Record<string, string> = response.body !== undefined
    ? { 'content-type': 'application/json' }
    : {};

  return jest.fn().mockResolvedValue({
    ok: response.ok ?? (response.status >= 200 && response.status < 300),
    status: response.status,
    statusText: response.status === 200 ? 'OK' : 'Error',
    headers: new Headers({ ...defaultHeaders, ...(response.headers ?? {}) }),
    json: jest.fn().mockResolvedValue(response.body ?? {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(response.body ?? {})),
  });
}

describe('Graph Expansion', () => {
  describe('expand', () => {
    it('should expand graph from seed memories', async () => {
      const mockResponse = {
        seedMemories: ['mem_1', 'mem_2'],
        expandedMemories: [
          {
            id: 'mem_3',
            spaceId: 'space_1',
            content: 'Related memory',
            type: 'text',
            tags: [],
            metadata: {},
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        relationships: [
          {
            id: 'rel_1',
            sourceId: 'mem_1',
            targetId: 'mem_3',
            relationshipType: 'related_to',
            strength: 0.8,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        stats: {
          seedCount: 2,
          expandedCount: 1,
          finalCount: 1,
          relationshipsFound: 1,
          hopsUsed: 1,
        },
        scoring: null,
      };

      const mockFetch = createMockFetch({ status: 200, body: mockResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.graph.expand({
        seedMemoryIds: ['mem_1', 'mem_2'],
      });

      expect(result).toBeDefined();
      expect(result.seedMemories).toEqual(['mem_1', 'mem_2']);
      expect(result.expandedMemories).toHaveLength(1);
      expect(result.expandedMemories[0].id).toBe('mem_3');
      expect(result.relationships).toHaveLength(1);
      expect(result.stats.seedCount).toBe(2);
      expect(result.stats.expandedCount).toBe(1);
      expect(result.scoring).toBeNull();
    });

    it('should expand with all optional parameters', async () => {
      const mockResponse = {
        seedMemories: ['mem_1'],
        expandedMemories: [],
        relationships: [],
        stats: {
          seedCount: 1,
          expandedCount: 0,
          finalCount: 0,
        },
        scoring: null,
      };

      const mockFetch = createMockFetch({ status: 200, body: mockResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.graph.expand({
        seedMemoryIds: ['mem_1'],
        maxHops: 3,
        minWeight: 0.5,
        relationshipTypes: ['related_to', 'supports'],
        direction: 'outgoing',
        includeContent: false,
        applyHybridScoring: false,
      });

      expect(result).toBeDefined();
      expect(result.seedMemories).toEqual(['mem_1']);
      expect(result.expandedMemories).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/graph/expand'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('mem_1'),
        })
      );
    });

    it('should expand with hybrid scoring enabled', async () => {
      const mockResponse = {
        seedMemories: ['mem_1'],
        expandedMemories: [
          {
            id: 'mem_2',
            spaceId: 'space_1',
            content: 'Scored memory',
            type: 'text',
            tags: [],
            metadata: {},
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            score: 0.85,
          },
        ],
        relationships: [],
        stats: {
          seedCount: 1,
          expandedCount: 1,
          finalCount: 1,
        },
        scoring: {
          applied: true,
          weights: {
            semantic: 0.4,
            graph: 0.3,
            coActivation: 0.2,
            recency: 0.05,
            salience: 0.05,
          },
        },
      };

      const mockFetch = createMockFetch({ status: 200, body: mockResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.graph.expand({
        seedMemoryIds: ['mem_1'],
        applyHybridScoring: true,
      });

      expect(result).toBeDefined();
      expect(result.scoring).not.toBeNull();
      expect(result.scoring?.applied).toBe(true);
      expect(result.scoring?.weights).toBeDefined();
      expect(result.scoring?.weights?.semantic).toBe(0.4);
      expect(result.scoring?.weights?.graph).toBe(0.3);
      expect(result.scoring?.weights?.coActivation).toBe(0.2);
    });

    it('should throw error with empty seed memories', async () => {
      const mockFetch = createMockFetch({ status: 200, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.graph.expand({
          seedMemoryIds: [],
        })
      ).rejects.toThrow('seed_memory_ids cannot be empty');
    });

    it('should validate seed memory IDs', async () => {
      const mockFetch = createMockFetch({ status: 200, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.graph.expand({
          seedMemoryIds: ['../invalid'],
        })
      ).rejects.toThrow('contains path traversal characters');
    });
  });
});
