/**
 * Tests for Relationships resource - Memory relationship management
 */

import { Relationships } from '../src/resources/relationships';

const mockClient = {
  request: jest.fn(),
};

const RELATIONSHIP = {
  id: 'rel_123',
  sourceId: 'mem_1',
  targetId: 'mem_2',
  relationshipType: 'supports',
  strength: 0.8,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Relationships', () => {
  let relationships: Relationships;

  beforeEach(() => {
    jest.clearAllMocks();
    relationships = new Relationships(mockClient as any);
  });

  describe('create', () => {
    it('should create a relationship between memories', async () => {
      mockClient.request.mockResolvedValue(RELATIONSHIP);

      const result = await relationships.create('mem_1', 'mem_2', {
        relationshipType: 'supports',
        strength: 0.8,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships',
        body: {
          sourceId: 'mem_1',
          targetId: 'mem_2',
          relationshipType: 'supports',
          strength: 0.8,
        },
      });
      expect(result.id).toBe('rel_123');
      expect(result.strength).toBe(0.8);
    });

    it('should create with metadata', async () => {
      mockClient.request.mockResolvedValue({
        ...RELATIONSHIP,
        metadata: { context: 'research' },
      });

      await relationships.create('mem_1', 'mem_2', {
        relationshipType: 'related_to',
        metadata: { context: 'research' },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships',
        body: {
          sourceId: 'mem_1',
          targetId: 'mem_2',
          relationshipType: 'related_to',
          metadata: { context: 'research' },
        },
      });
    });

    it('should throw for empty source ID', async () => {
      await expect(
        relationships.create('', 'mem_2', { relationshipType: 'supports' })
      ).rejects.toThrow();
    });

    it('should throw for empty target ID', async () => {
      await expect(
        relationships.create('mem_1', '', { relationshipType: 'supports' })
      ).rejects.toThrow();
    });
  });

  describe('getIncoming', () => {
    it('should get incoming relationships', async () => {
      mockClient.request.mockResolvedValue([RELATIONSHIP]);

      const result = await relationships.getIncoming('mem_2');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_2/relationships/incoming',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('rel_123');
    });

    it('should return empty array when none exist', async () => {
      mockClient.request.mockResolvedValue([]);

      const result = await relationships.getIncoming('mem_999');

      expect(result).toHaveLength(0);
    });

    it('should throw for empty memory ID', async () => {
      await expect(relationships.getIncoming('')).rejects.toThrow();
    });
  });

  describe('getOutgoing', () => {
    it('should get outgoing relationships', async () => {
      mockClient.request.mockResolvedValue([RELATIONSHIP]);

      const result = await relationships.getOutgoing('mem_1');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_1/relationships/outgoing',
      });
      expect(result).toHaveLength(1);
    });

    it('should throw for empty memory ID', async () => {
      await expect(relationships.getOutgoing('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a relationship', async () => {
      mockClient.request.mockResolvedValue({
        ...RELATIONSHIP,
        strength: 0.95,
      });

      const result = await relationships.update('rel_123', {
        strength: 0.95,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/relationships/rel_123',
        body: { strength: 0.95 },
      });
      expect(result.strength).toBe(0.95);
    });

    it('should update with metadata', async () => {
      mockClient.request.mockResolvedValue({
        ...RELATIONSHIP,
        metadata: { verified: true },
      });

      await relationships.update('rel_123', {
        metadata: { verified: true },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/relationships/rel_123',
        body: { metadata: { verified: true } },
      });
    });

    it('should throw for empty relationship ID', async () => {
      await expect(
        relationships.update('', { strength: 0.5 })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a relationship', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await relationships.delete('rel_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/relationships/rel_123',
      });
    });

    it('should throw for empty relationship ID', async () => {
      await expect(relationships.delete('')).rejects.toThrow();
    });
  });

  describe('reinforce', () => {
    it('should reinforce a relationship', async () => {
      mockClient.request.mockResolvedValue({
        ...RELATIONSHIP,
        strength: 0.9,
      });

      const result = await relationships.reinforce('rel_123', {
        amount: 0.1,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/rel_123/reinforce',
        body: { amount: 0.1 },
      });
      expect(result.strength).toBe(0.9);
    });

    it('should reinforce without params', async () => {
      mockClient.request.mockResolvedValue({
        ...RELATIONSHIP,
        strength: 0.85,
      });

      await relationships.reinforce('rel_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/rel_123/reinforce',
        body: undefined,
      });
    });
  });

  describe('weaken', () => {
    it('should weaken a relationship', async () => {
      mockClient.request.mockResolvedValue({
        ...RELATIONSHIP,
        strength: 0.5,
      });

      const result = await relationships.weaken('rel_123', {
        amount: 0.3,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/rel_123/weaken',
        body: { amount: 0.3 },
      });
      expect(result.strength).toBe(0.5);
    });

    it('should weaken without params', async () => {
      mockClient.request.mockResolvedValue({
        ...RELATIONSHIP,
        strength: 0.7,
      });

      await relationships.weaken('rel_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/rel_123/weaken',
        body: undefined,
      });
    });
  });
});
