/**
 * Tests for Clusters resource - Memory grouping and clustering
 */

import { Clusters } from '../src/resources/clusters';

const mockClient = {
  request: jest.fn(),
};

const CLUSTER = {
  id: 'clus_123',
  name: 'Research Notes',
  description: 'Collection of research findings',
  memoryCount: 5,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Clusters', () => {
  let clusters: Clusters;

  beforeEach(() => {
    jest.clearAllMocks();
    clusters = new Clusters(mockClient as any);
  });

  describe('create', () => {
    it('should create a cluster', async () => {
      mockClient.request.mockResolvedValue(CLUSTER);

      const result = await clusters.create({
        name: 'Research Notes',
        description: 'Collection of research findings',
      });

      // BaseResource translates params to query, but create uses body
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/clusters',
        body: {
          name: 'Research Notes',
          description: 'Collection of research findings',
        },
        query: undefined,
      });
      expect(result.id).toBe('clus_123');
      expect(result.name).toBe('Research Notes');
    });

    it('should create a cluster with memory IDs', async () => {
      mockClient.request.mockResolvedValue({
        ...CLUSTER,
        memoryCount: 2,
      });

      await clusters.create({
        name: 'Research Notes',
        memoryIds: ['mem_1', 'mem_2'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/clusters',
        body: {
          name: 'Research Notes',
          memoryIds: ['mem_1', 'mem_2'],
        },
        query: undefined,
      });
    });
  });

  describe('list', () => {
    it('should list clusters', async () => {
      mockClient.request.mockResolvedValue({
        data: [CLUSTER],
        pagination: { total: 1, page: 1, limit: 10, hasMore: false },
      });

      const result = await clusters.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/clusters',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list with pagination', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 50, page: 2, limit: 10, hasMore: true },
      });

      await clusters.list({ limit: 10, page: 2 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/clusters',
        query: { limit: 10, page: 2 },
      });
    });
  });

  describe('get', () => {
    it('should get a cluster by ID', async () => {
      mockClient.request.mockResolvedValue(CLUSTER);

      const result = await clusters.get('clus_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/clusters/clus_123',
        query: {},
      });
      expect(result.id).toBe('clus_123');
    });

    it('should get a cluster with memories included', async () => {
      mockClient.request.mockResolvedValue({
        ...CLUSTER,
        memories: [{ id: 'mem_1', content: 'Test' }],
      });

      const result = await clusters.get('clus_123', {
        includeMemories: true,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/clusters/clus_123',
        query: { includeMemories: true },
      });
      expect(result.memories).toHaveLength(1);
    });

    it('should throw for empty ID', async () => {
      await expect(clusters.get('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a cluster', async () => {
      mockClient.request.mockResolvedValue({
        ...CLUSTER,
        name: 'Updated Notes',
      });

      const result = await clusters.update('clus_123', {
        name: 'Updated Notes',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/clusters/clus_123',
        body: { name: 'Updated Notes' },
        query: undefined,
      });
      expect(result.name).toBe('Updated Notes');
    });

    it('should throw for empty ID', async () => {
      await expect(
        clusters.update('', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a cluster', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await clusters.delete('clus_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/clusters/clus_123',
        query: undefined,
      });
    });

    it('should throw for empty ID', async () => {
      await expect(clusters.delete('')).rejects.toThrow();
    });
  });

  describe('addMemory', () => {
    it('should add a memory to a cluster', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await clusters.addMemory('clus_123', 'mem_456', 0.9);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/clusters/clus_123/memories',
        body: { memoryId: 'mem_456', confidence: 0.9 },
        query: undefined,
      });
    });

    it('should add a memory without confidence', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await clusters.addMemory('clus_123', 'mem_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/clusters/clus_123/memories',
        body: { memoryId: 'mem_456', confidence: undefined },
        query: undefined,
      });
    });
  });

  describe('removeMemory', () => {
    it('should remove a memory from a cluster', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await clusters.removeMemory('clus_123', 'mem_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/clusters/clus_123/memories/mem_456',
        query: undefined,
      });
    });
  });
});
