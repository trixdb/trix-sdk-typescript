/**
 * Tests for Memories resource - Memory CRUD, bulk operations, pin/unpin
 */

import { Memories } from '../src/resources/memories';

const mockClient = {
  request: jest.fn(),
  requestMultipart: jest.fn(),
  requestStream: jest.fn(),
};

const MEMORY = {
  id: 'mem_123',
  content: 'Remember to buy milk',
  type: 'text',
  tags: ['shopping'],
  isPinned: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Memories', () => {
  let memories: Memories;

  beforeEach(() => {
    jest.clearAllMocks();
    memories = new Memories(mockClient as any);
  });

  describe('create', () => {
    it('should create a text memory', async () => {
      mockClient.request.mockResolvedValue(MEMORY);

      const result = await memories.create({
        content: 'Remember to buy milk',
        type: 'text',
        tags: ['shopping'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories',
        query: undefined,
        body: {
          content: 'Remember to buy milk',
          type: 'text',
          tags: ['shopping'],
        },
      });
      expect(result.id).toBe('mem_123');
      expect(result.content).toBe('Remember to buy milk');
    });

    it('should create a memory with minimal params', async () => {
      mockClient.request.mockResolvedValue({ ...MEMORY, tags: [] });

      const result = await memories.create({ content: 'Simple note' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories',
        query: undefined,
        body: { content: 'Simple note' },
      });
      expect(result.id).toBe('mem_123');
    });
  });

  describe('get', () => {
    it('should get a memory by ID', async () => {
      mockClient.request.mockResolvedValue(MEMORY);

      const result = await memories.get('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_123',
        query: undefined,
      });
      expect(result.id).toBe('mem_123');
      expect(result.content).toBe('Remember to buy milk');
    });

    it('should throw for empty ID', async () => {
      await expect(memories.get('')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list memories', async () => {
      mockClient.request.mockResolvedValue({
        data: [MEMORY],
        pagination: { total: 1, page: 1, limit: 10, hasMore: false },
      });

      const result = await memories.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list with pagination and filters', async () => {
      mockClient.request.mockResolvedValue({
        data: [MEMORY],
        pagination: { total: 50, page: 2, limit: 20, hasMore: true },
      });

      const result = await memories.list({
        limit: 20,
        offset: 20,
        q: 'shopping',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories',
        query: { limit: 20, offset: 20, q: 'shopping' },
      });
      expect(result.pagination.total).toBe(50);
    });

    it('should return empty when no results', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false },
      });

      const result = await memories.list({ q: 'nonexistent' });

      expect(result.data).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a memory', async () => {
      const updated = { ...MEMORY, content: 'Updated content', tags: ['updated'] };
      mockClient.request.mockResolvedValue(updated);

      const result = await memories.update('mem_123', {
        content: 'Updated content',
        tags: ['updated'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/memories/mem_123',
        query: undefined,
        body: { content: 'Updated content', tags: ['updated'] },
      });
      expect(result.content).toBe('Updated content');
      expect(result.tags).toEqual(['updated']);
    });

    it('should throw for empty ID', async () => {
      await expect(
        memories.update('', { content: 'test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a memory', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await memories.delete('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/memories/mem_123',
        query: undefined,
      });
    });

    it('should throw for empty ID', async () => {
      await expect(memories.delete('')).rejects.toThrow();
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create memories', async () => {
      mockClient.request.mockResolvedValue({
        success: 2,
        failed: 0,
        errors: [],
      });

      const result = await memories.bulkCreate([
        { content: 'Memory 1', tags: ['bulk'] },
        { content: 'Memory 2', tags: ['bulk'] },
      ]);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/bulk',
        query: undefined,
        body: {
          memories: [
            { content: 'Memory 1', tags: ['bulk'] },
            { content: 'Memory 2', tags: ['bulk'] },
          ],
        },
      });
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should throw for empty array', async () => {
      await expect(memories.bulkCreate([])).rejects.toThrow(
        'bulkCreate: array cannot be empty'
      );
    });
  });

  describe('pin', () => {
    it('should pin a memory', async () => {
      const pinned = { ...MEMORY, isPinned: true };
      mockClient.request.mockResolvedValue(pinned);

      const result = await memories.pin('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/pin',
        query: undefined,
      });
      expect(result.isPinned).toBe(true);
    });

    it('should throw for empty ID', async () => {
      await expect(memories.pin('')).rejects.toThrow();
    });
  });

  describe('unpin', () => {
    it('should unpin a memory', async () => {
      const unpinned = { ...MEMORY, isPinned: false };
      mockClient.request.mockResolvedValue(unpinned);

      const result = await memories.unpin('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/unpin',
        query: undefined,
      });
      expect(result.isPinned).toBe(false);
    });

    it('should throw for empty ID', async () => {
      await expect(memories.unpin('')).rejects.toThrow();
    });
  });
});
