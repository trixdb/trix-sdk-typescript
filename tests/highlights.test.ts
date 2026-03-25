/**
 * Tests for Highlights resource - Highlight CRUD and search
 */

import { Highlights } from '../src/resources/highlights';

const mockClient = {
  request: jest.fn(),
};

const HIGHLIGHT = {
  id: 'hl_123',
  memoryId: 'mem_456',
  text: 'Important passage about AI safety',
  startOffset: 100,
  endOffset: 135,
  color: 'yellow',
  note: 'Key insight',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Highlights', () => {
  let highlights: Highlights;

  beforeEach(() => {
    jest.clearAllMocks();
    highlights = new Highlights(mockClient as any);
  });

  describe('create', () => {
    it('should create a highlight in a memory', async () => {
      mockClient.request.mockResolvedValue(HIGHLIGHT);

      const result = await highlights.create('mem_456', {
        text: 'Important passage about AI safety',
        startOffset: 100,
        endOffset: 135,
        color: 'yellow',
        note: 'Key insight',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_456/highlights',
        body: {
          text: 'Important passage about AI safety',
          startOffset: 100,
          endOffset: 135,
          color: 'yellow',
          note: 'Key insight',
        },
      });
      expect(result.id).toBe('hl_123');
      expect(result.text).toBe('Important passage about AI safety');
    });

    it('should throw for empty memory ID', async () => {
      await expect(
        highlights.create('', { text: 'test', startOffset: 0, endOffset: 4 })
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list highlights for a memory', async () => {
      mockClient.request.mockResolvedValue({
        data: [HIGHLIGHT],
        pagination: { total: 1, page: 1, limit: 10, hasMore: false },
      });

      const result = await highlights.list('mem_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_456/highlights',
        query: undefined,
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list with pagination', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 20, hasMore: false },
      });

      await highlights.list('mem_456', { limit: 20 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_456/highlights',
        query: { limit: 20 },
      });
    });

    it('should throw for empty memory ID', async () => {
      await expect(highlights.list('')).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should get a highlight by ID', async () => {
      mockClient.request.mockResolvedValue(HIGHLIGHT);

      const result = await highlights.get('hl_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/highlights/hl_123',
      });
      expect(result.id).toBe('hl_123');
      expect(result.color).toBe('yellow');
    });

    it('should throw for empty ID', async () => {
      await expect(highlights.get('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a highlight', async () => {
      const updated = { ...HIGHLIGHT, color: 'green', note: 'Updated note' };
      mockClient.request.mockResolvedValue(updated);

      const result = await highlights.update('hl_123', {
        color: 'green',
        note: 'Updated note',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/highlights/hl_123',
        body: { color: 'green', note: 'Updated note' },
      });
      expect(result.color).toBe('green');
      expect(result.note).toBe('Updated note');
    });

    it('should throw for empty ID', async () => {
      await expect(
        highlights.update('', { color: 'red' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a highlight', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await highlights.delete('hl_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/highlights/hl_123',
      });
    });

    it('should throw for empty ID', async () => {
      await expect(highlights.delete('')).rejects.toThrow();
    });
  });
});
