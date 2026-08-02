/**
 * Tests for Search resource - Semantic search and embeddings
 */

import { Search } from '../src/resources/search';

const mockClient = {
  request: jest.fn(),
};

describe('Search', () => {
  let search: Search;

  beforeEach(() => {
    jest.clearAllMocks();
    search = new Search(mockClient as any);
  });

  describe('query', () => {
    // GET /v1/search returns `{ results, facets }` — not a `{ data }` wrapper.
    it('should read the `results` array from the unified-search response', async () => {
      mockClient.request.mockResolvedValue({
        results: [
          { type: 'memory', id: 'mem_1', score: 0.9, content: 'Machine learning basics' },
          { type: 'memory', id: 'mem_2', score: 0.8, content: 'Deep learning intro' },
        ],
        facets: { memories: 2, audio_segments: 0 },
      });

      const result = await search.query('machine learning');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/search',
        query: { q: 'machine learning' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('mem_1');
      expect(result[0].score).toBe(0.9);
    });

    it('should search with options', async () => {
      mockClient.request.mockResolvedValue({
        results: [{ type: 'memory', id: 'mem_1', score: 0.7, content: 'Neural networks' }],
        facets: { memories: 1, audio_segments: 0 },
      });

      const result = await search.query('neural networks', {
        clusterScale: 'fine',
        limit: 10,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/search',
        query: { q: 'neural networks', clusterScale: 'fine', limit: 10 },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when there are no results', async () => {
      mockClient.request.mockResolvedValue({ results: [], facets: { memories: 0 } });

      const result = await search.query('nonexistent topic');

      expect(result).toHaveLength(0);
    });

    it('should NOT read a legacy `data` field (regression for #6)', async () => {
      // The old code returned `response.data`; the API has no such field, so a
      // response with only `results` must still surface the results.
      mockClient.request.mockResolvedValue({
        data: undefined,
        results: [{ type: 'memory', id: 'mem_9', score: 0.5, content: 'hi' }],
        facets: { memories: 1 },
      });

      const result = await search.query('hi');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('mem_9');
    });
  });

  describe('similar', () => {
    it('should find similar memories', async () => {
      mockClient.request.mockResolvedValue({
        results: [
          { memory: { id: 'mem_2' }, similarity: 0.95 },
          { memory: { id: 'mem_3' }, similarity: 0.82 },
        ],
      });

      const result = await search.similar('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/search/similar/mem_123',
        query: undefined,
      });
      expect(result.results).toHaveLength(2);
      expect(result.results[0].similarity).toBe(0.95);
    });

    it('should find similar with threshold and limit', async () => {
      mockClient.request.mockResolvedValue({ results: [] });

      await search.similar('mem_123', { threshold: 0.8, limit: 5 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/search/similar/mem_123',
        query: { threshold: 0.8, limit: 5 },
      });
    });

    it('should throw for empty memory ID', async () => {
      await expect(search.similar('')).rejects.toThrow();
    });
  });

  describe('embed', () => {
    it('should generate embeddings for memory IDs', async () => {
      mockClient.request.mockResolvedValue({
        embeddings: [
          { memoryId: 'mem_1', embedding: [0.1, 0.2, 0.3] },
          { memoryId: 'mem_2', embedding: [0.4, 0.5, 0.6] },
        ],
      });

      const result = await search.embed(['mem_1', 'mem_2']);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/search/embed',
        body: { memoryIds: ['mem_1', 'mem_2'] },
      });
      expect(result.embeddings).toHaveLength(2);
    });

    it('should throw for invalid memory ID in array', async () => {
      await expect(search.embed(['mem_1', ''])).rejects.toThrow();
    });
  });

  describe('embedAll', () => {
    it('should embed all memories with default batch size', async () => {
      mockClient.request.mockResolvedValue({
        jobId: 'job_abc',
        total: 500,
      });

      const result = await search.embedAll();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/search/embed-all',
        body: { batchSize: undefined },
      });
      expect(result.jobId).toBe('job_abc');
      expect(result.total).toBe(500);
    });

    it('should embed all memories with custom batch size', async () => {
      mockClient.request.mockResolvedValue({
        jobId: 'job_def',
        total: 1000,
      });

      const result = await search.embedAll(100);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/search/embed-all',
        body: { batchSize: 100 },
      });
      expect(result.total).toBe(1000);
    });
  });

  describe('getConfig', () => {
    it('should return search configuration', async () => {
      mockClient.request.mockResolvedValue({
        embeddingModel: 'text-embedding-3-small',
        embeddingDimensions: 1536,
      });

      const result = await search.getConfig();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/search/config',
      });
      expect(result.embeddingModel).toBe('text-embedding-3-small');
      expect(result.embeddingDimensions).toBe(1536);
    });
  });
});
