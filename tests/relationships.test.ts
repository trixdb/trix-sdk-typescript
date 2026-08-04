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
  weight: 0.8,
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
        weight: 0.8,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/mem_1',
        body: {
          target_id: 'mem_2',
          relationship_type: 'supports',
          weight: 0.8,
          metadata: undefined,
        },
      });
      expect(result.id).toBe('rel_123');
      expect(result.weight).toBe(0.8);
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
        path: '/relationships/mem_1',
        body: {
          target_id: 'mem_2',
          relationship_type: 'related_to',
          weight: undefined,
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
    it('should get incoming relationships and unwrap the envelope', async () => {
      mockClient.request.mockResolvedValue({ relationships: [RELATIONSHIP], count: 1 });

      const result = await relationships.getIncoming('mem_2');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/relationships/mem_2',
        query: { direction: 'incoming' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('rel_123');
    });

    it('should return empty array when none exist', async () => {
      mockClient.request.mockResolvedValue({ relationships: [], count: 0 });

      const result = await relationships.getIncoming('mem_999');

      expect(result).toHaveLength(0);
    });

    it('should throw for empty memory ID', async () => {
      await expect(relationships.getIncoming('')).rejects.toThrow();
    });
  });

  describe('getOutgoing', () => {
    it('should get outgoing relationships and unwrap the envelope', async () => {
      mockClient.request.mockResolvedValue({ relationships: [RELATIONSHIP], count: 1 });

      const result = await relationships.getOutgoing('mem_1');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/relationships/mem_1',
        query: { direction: 'outgoing' },
      });
      expect(result).toHaveLength(1);
    });

    it('should throw for empty memory ID', async () => {
      await expect(relationships.getOutgoing('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a relationship by its triple key', async () => {
      mockClient.request.mockResolvedValue({ ...RELATIONSHIP, weight: 0.95 });

      const result = await relationships.update('mem_1', 'mem_2', 'supports', {
        weight: 0.95,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/relationships/mem_1/mem_2/supports',
        body: { weight: 0.95 },
      });
      expect(result.weight).toBe(0.95);
    });

    it('should update with metadata', async () => {
      mockClient.request.mockResolvedValue({ ...RELATIONSHIP, metadata: { verified: true } });

      await relationships.update('mem_1', 'mem_2', 'supports', {
        metadata: { verified: true },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/relationships/mem_1/mem_2/supports',
        body: { metadata: { verified: true } },
      });
    });

    it('should throw for empty source ID', async () => {
      await expect(
        relationships.update('', 'mem_2', 'supports', { weight: 0.5 })
      ).rejects.toThrow();
    });

    it('should throw for empty type', async () => {
      await expect(
        relationships.update('mem_1', 'mem_2', '', { weight: 0.5 })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a relationship by its triple key', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await relationships.delete('mem_1', 'mem_2', 'supports');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/relationships/mem_1/mem_2/supports',
      });
    });

    it('should throw for empty source ID', async () => {
      await expect(relationships.delete('', 'mem_2', 'supports')).rejects.toThrow();
    });
  });

  describe('reinforce', () => {
    it('should reinforce a relationship and unwrap the result', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Relationship reinforced',
        relationship: { ...RELATIONSHIP, weight: 0.9 },
      });

      const result = await relationships.reinforce('mem_1', 'mem_2', 'supports', {
        boost: 0.1,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/mem_1/mem_2/supports/reinforce',
        body: { boost: 0.1 },
      });
      expect(result.weight).toBe(0.9);
    });

    it('should reinforce without params', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Relationship reinforced',
        relationship: { ...RELATIONSHIP, weight: 0.85 },
      });

      await relationships.reinforce('mem_1', 'mem_2', 'supports');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/mem_1/mem_2/supports/reinforce',
        body: undefined,
      });
    });
  });

  describe('weaken', () => {
    it('should weaken a relationship and unwrap the result', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Relationship weakened',
        relationship: { ...RELATIONSHIP, weight: 0.5 },
      });

      const result = await relationships.weaken('mem_1', 'mem_2', 'supports', {
        amount: 0.3,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/mem_1/mem_2/supports/weaken',
        body: { amount: 0.3 },
      });
      expect(result.weight).toBe(0.5);
    });

    it('should weaken without params', async () => {
      mockClient.request.mockResolvedValue({
        message: 'Relationship weakened',
        relationship: { ...RELATIONSHIP, weight: 0.7 },
      });

      await relationships.weaken('mem_1', 'mem_2', 'supports');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/relationships/mem_1/mem_2/supports/weaken',
        body: undefined,
      });
    });
  });
});
