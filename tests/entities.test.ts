/**
 * Tests for the Entities resource.
 *
 * Covers the live API surface only: read-mostly under `/v1/knowledge/entities`
 * plus merge. The previous create/update/delete/search/resolve/bulk/extract/
 * link/getTypes methods targeted non-existent endpoints and were removed.
 */

import { Entities } from '../src/resources/entities';
import { buildParams } from '../src/resources/base';

// Mock client for testing
const mockClient = {
  request: jest.fn(),
};

describe('Entities', () => {
  let entities: Entities;

  beforeEach(() => {
    jest.clearAllMocks();
    entities = new Entities(mockClient as any);
  });

  describe('get', () => {
    it('should get an entity by ID', async () => {
      mockClient.request.mockResolvedValue({
        id: 'ent_123',
        name: 'Albert Einstein',
        type: 'person',
      });

      const result = await entities.get('ent_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/knowledge/entities/ent_123',
      });
      expect(result.id).toBe('ent_123');
    });

    it('should throw for invalid ID', async () => {
      await expect(entities.get('')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all entities at GET /knowledge/entities', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'ent_1', name: 'Einstein', type: 'person' },
          { id: 'ent_2', name: 'Berlin', type: 'location' },
        ],
        pagination: { total: 2, page: 1, limit: 10, hasMore: false },
      });

      const result = await entities.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/knowledge/entities',
        query: {},
      });
      expect(result.data).toHaveLength(2);
    });

    it('should filter by type', async () => {
      mockClient.request.mockResolvedValue({ data: [], pagination: {} });

      await entities.list({ type: 'person' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/knowledge/entities',
        query: { type: 'person' },
      });
    });
  });

  describe('findByType', () => {
    it('should find entities by type via the list endpoint', async () => {
      mockClient.request.mockResolvedValue({ data: [{ id: 'ent_1' }] });

      const result = await entities.findByType('person');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/knowledge/entities',
        query: { type: 'person' },
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getFacts', () => {
    it('should get facts about an entity', async () => {
      mockClient.request.mockResolvedValue({
        entity_id: 'ent_123',
        facts: [{ id: 'fact_1' }, { id: 'fact_2' }],
        total: 2,
      });

      const result = await entities.getFacts('ent_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/knowledge/entities/ent_123/facts',
      });
      expect(result.facts).toHaveLength(2);
    });

    it('should throw for invalid ID', async () => {
      await expect(entities.getFacts('')).rejects.toThrow();
    });
  });

  describe('merge', () => {
    it('should POST to /knowledge/entities/merge with both ids', async () => {
      mockClient.request.mockResolvedValue({
        mergedEntity: { id: 'ent_1', name: 'Albert Einstein' },
        deletedId: 'ent_2',
      });

      const result = await entities.merge('ent_1', 'ent_2');

      // The merge endpoint is not nested under an entity id; both ids ride in
      // the body (sourceId is snake-cased to source_id by the transport).
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/knowledge/entities/merge',
        body: { sourceId: 'ent_2', targetId: 'ent_1' },
      });
      expect(result.deletedId).toBe('ent_2');
    });

    it('should validate both ids', async () => {
      await expect(entities.merge('', 'ent_2')).rejects.toThrow();
      await expect(entities.merge('ent_1', '')).rejects.toThrow();
    });
  });
});

describe('buildParams for Entities', () => {
  it('should filter undefined values', () => {
    const params = buildParams({
      type: 'person',
      spaceId: undefined,
      limit: 10,
    });

    expect(params).toEqual({ type: 'person', limit: 10 });
    expect(params).not.toHaveProperty('spaceId');
  });
});
