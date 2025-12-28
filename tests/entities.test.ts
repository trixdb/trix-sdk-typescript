/**
 * Tests for Entities resource - Named Entity Management
 */

import { Entities } from '../src/resources/entities';
import {
  validateBulkArray,
  findDuplicateIds,
  buildParams,
} from '../src/resources/base';

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

  describe('create', () => {
    it('should create an entity with name and type', async () => {
      const entityData = {
        name: 'Albert Einstein',
        type: 'person',
      };

      mockClient.request.mockResolvedValue({
        id: 'ent_123',
        ...entityData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await entities.create(entityData);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities',
        body: entityData,
      });
      expect(result.id).toBe('ent_123');
      expect(result.name).toBe('Albert Einstein');
      expect(result.type).toBe('person');
    });

    it('should create an entity with aliases', async () => {
      const entityData = {
        name: 'Albert Einstein',
        type: 'person',
        aliases: ['Einstein', 'A. Einstein', 'Prof. Einstein'],
      };

      mockClient.request.mockResolvedValue({
        id: 'ent_124',
        ...entityData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await entities.create(entityData);

      expect(result.aliases).toEqual(['Einstein', 'A. Einstein', 'Prof. Einstein']);
    });

    it('should create an entity with properties', async () => {
      const entityData = {
        name: 'Trix',
        type: 'product',
        properties: {
          category: 'database',
          language: 'TypeScript',
          openSource: true,
          version: '1.0.0',
        },
      };

      mockClient.request.mockResolvedValue({
        id: 'ent_125',
        ...entityData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await entities.create(entityData);

      expect(result.properties?.category).toBe('database');
      expect(result.properties?.openSource).toBe(true);
    });

    it('should create an entity with description', async () => {
      const entityData = {
        name: 'Princeton University',
        type: 'organization',
        description: 'Private Ivy League research university in Princeton, NJ',
      };

      mockClient.request.mockResolvedValue({
        id: 'ent_126',
        ...entityData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await entities.create(entityData);

      expect(result.description).toContain('Ivy League');
    });

    it('should create an entity linked to memories', async () => {
      const entityData = {
        name: 'Berlin',
        type: 'location',
        memoryIds: ['mem_1', 'mem_2', 'mem_3'],
      };

      mockClient.request.mockResolvedValue({
        id: 'ent_127',
        ...entityData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await entities.create(entityData);

      expect(result.memoryIds).toHaveLength(3);
    });

    it('should create an entity with custom type', async () => {
      const entityData = {
        name: 'Quantum Mechanics',
        type: 'scientific_theory',
        properties: {
          field: 'physics',
          foundedYear: 1925,
        },
      };

      mockClient.request.mockResolvedValue({
        id: 'ent_128',
        ...entityData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await entities.create(entityData);

      expect(result.type).toBe('scientific_theory');
    });
  });

  describe('get', () => {
    it('should get an entity by ID', async () => {
      mockClient.request.mockResolvedValue({
        id: 'ent_123',
        name: 'Albert Einstein',
        type: 'person',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await entities.get('ent_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/entities/ent_123',
      });
      expect(result.id).toBe('ent_123');
    });

    it('should throw for invalid ID', async () => {
      await expect(entities.get('')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all entities', async () => {
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
        path: '/entities',
        query: {},
      });
      expect(result.data).toHaveLength(2);
    });

    it('should filter by type', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false },
      });

      await entities.list({ type: 'person' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/entities',
        query: { type: 'person' },
      });
    });

    it('should filter by space', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false },
      });

      await entities.list({ spaceId: 'space_123' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/entities',
        query: { spaceId: 'space_123' },
      });
    });

    it('should paginate results', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 100, page: 2, limit: 10, hasMore: true },
      });

      await entities.list({ limit: 10, page: 2 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/entities',
        query: { limit: 10, page: 2 },
      });
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      mockClient.request.mockResolvedValue({
        id: 'ent_123',
        name: 'Albert Einstein',
        type: 'person',
        description: 'Theoretical physicist',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      });

      const result = await entities.update('ent_123', {
        description: 'Theoretical physicist',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/entities/ent_123',
        body: { description: 'Theoretical physicist' },
      });
      expect(result.description).toBe('Theoretical physicist');
    });

    it('should update aliases', async () => {
      mockClient.request.mockResolvedValue({
        id: 'ent_123',
        aliases: ['Einstein', 'E=mc² guy'],
        updatedAt: '2024-01-02T00:00:00Z',
      });

      await entities.update('ent_123', {
        aliases: ['Einstein', 'E=mc² guy'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/entities/ent_123',
        body: { aliases: ['Einstein', 'E=mc² guy'] },
      });
    });

    it('should update properties', async () => {
      mockClient.request.mockResolvedValue({
        id: 'ent_123',
        properties: { birthYear: 1879, deathYear: 1955 },
        updatedAt: '2024-01-02T00:00:00Z',
      });

      await entities.update('ent_123', {
        properties: { birthYear: 1879, deathYear: 1955 },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/entities/ent_123',
        body: { properties: { birthYear: 1879, deathYear: 1955 } },
      });
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await entities.delete('ent_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/entities/ent_123',
      });
    });
  });

  describe('search', () => {
    it('should search entities by name', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'ent_1', name: 'Albert Einstein', type: 'person', score: 0.98 },
        ],
      });

      const result = await entities.search('Einstein');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/search',
        body: { query: 'Einstein' },
      });
      expect(result.data).toHaveLength(1);
    });

    it('should search with type filter', async () => {
      mockClient.request.mockResolvedValue({ data: [] });

      await entities.search('Einstein', { type: 'person' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/search',
        body: { query: 'Einstein', type: 'person' },
      });
    });

    it('should search with limit', async () => {
      mockClient.request.mockResolvedValue({ data: [] });

      await entities.search('Berlin', { limit: 5 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/search',
        body: { query: 'Berlin', limit: 5 },
      });
    });
  });

  describe('findByType', () => {
    it('should find entities by type', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'ent_1', name: 'Einstein', type: 'person' },
          { id: 'ent_2', name: 'Newton', type: 'person' },
        ],
      });

      const result = await entities.findByType('person');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/entities',
        query: { type: 'person' },
      });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('findByMemory', () => {
    it('should find entities linked to a memory', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'ent_1', name: 'Einstein', type: 'person' },
          { id: 'ent_2', name: 'Princeton', type: 'location' },
        ],
      });

      const result = await entities.findByMemory('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_123/entities',
      });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('resolve', () => {
    it('should resolve text to entity', async () => {
      mockClient.request.mockResolvedValue({
        text: 'Einstein',
        entity: { id: 'ent_123', name: 'Albert Einstein', type: 'person' },
        confidence: 0.95,
      });

      const result = await entities.resolve('Einstein');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/resolve',
        body: { text: 'Einstein' },
      });
      expect(result.entity?.id).toBe('ent_123');
      expect(result.confidence).toBe(0.95);
    });

    it('should resolve with context', async () => {
      mockClient.request.mockResolvedValue({
        text: 'Einstein',
        entity: { id: 'ent_123', name: 'Albert Einstein', type: 'person' },
        confidence: 0.99,
      });

      await entities.resolve('Einstein', { context: 'Physics Nobel Prize' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/resolve',
        body: { text: 'Einstein', context: 'Physics Nobel Prize' },
      });
    });
  });

  describe('merge', () => {
    it('should merge two entities', async () => {
      mockClient.request.mockResolvedValue({
        mergedEntity: {
          id: 'ent_1',
          name: 'Albert Einstein',
          aliases: ['Einstein', 'A. Einstein'],
        },
        deletedId: 'ent_2',
      });

      const result = await entities.merge('ent_1', 'ent_2');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/ent_1/merge',
        body: { sourceId: 'ent_2' },
      });
      expect(result.deletedId).toBe('ent_2');
    });
  });

  describe('linkToMemory', () => {
    it('should link entity to memory', async () => {
      mockClient.request.mockResolvedValue({
        entityId: 'ent_123',
        memoryId: 'mem_456',
        linked: true,
      });

      const result = await entities.linkToMemory('ent_123', 'mem_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/ent_123/memories',
        body: { memoryId: 'mem_456' },
      });
      expect(result.linked).toBe(true);
    });
  });

  describe('unlinkFromMemory', () => {
    it('should unlink entity from memory', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await entities.unlinkFromMemory('ent_123', 'mem_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/entities/ent_123/memories/mem_456',
      });
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple entities', async () => {
      const entitiesData = [
        { name: 'Einstein', type: 'person' },
        { name: 'Berlin', type: 'location' },
      ];

      mockClient.request.mockResolvedValue({
        success: 2,
        failed: 0,
        entities: [
          { id: 'ent_1', ...entitiesData[0] },
          { id: 'ent_2', ...entitiesData[1] },
        ],
      });

      const result = await entities.bulkCreate(entitiesData);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/entities/bulk',
        body: { entities: entitiesData },
      });
      expect(result.success).toBe(2);
    });

    it('should throw for empty array', async () => {
      await expect(entities.bulkCreate([])).rejects.toThrow('array cannot be empty');
    });

    it('should throw for exceeding max limit', async () => {
      const tooMany = Array(1001).fill({ name: 'Test', type: 'thing' });
      await expect(entities.bulkCreate(tooMany)).rejects.toThrow('exceeds maximum');
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple entities', async () => {
      mockClient.request.mockResolvedValue({
        success: 3,
        failed: 0,
      });

      const result = await entities.bulkDelete(['ent_1', 'ent_2', 'ent_3']);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/entities/bulk',
        body: { ids: ['ent_1', 'ent_2', 'ent_3'] },
      });
      expect(result.success).toBe(3);
    });
  });

  describe('extract', () => {
    it('should extract entities from a memory', async () => {
      mockClient.request.mockResolvedValue({
        memoryId: 'mem_123',
        entities: [
          { name: 'Albert Einstein', type: 'person', confidence: 0.95 },
          { name: 'Germany', type: 'location', confidence: 0.88 },
        ],
      });

      const result = await entities.extract('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/extract-entities',
        body: {},
      });
      expect(result.entities).toHaveLength(2);
    });

    it('should extract with save and link options', async () => {
      mockClient.request.mockResolvedValue({
        memoryId: 'mem_123',
        entities: [],
        saved: true,
        linked: true,
      });

      await entities.extract('mem_123', { save: true, link: true });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/extract-entities',
        body: { save: true, link: true },
      });
    });
  });

  describe('getTypes', () => {
    it('should get all entity types', async () => {
      mockClient.request.mockResolvedValue({
        types: [
          { name: 'person', count: 150 },
          { name: 'location', count: 75 },
          { name: 'organization', count: 50 },
        ],
      });

      const result = await entities.getTypes();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/entities/types',
      });
      expect(result.types).toHaveLength(3);
    });
  });

  describe('getFacts', () => {
    it('should get facts about an entity', async () => {
      mockClient.request.mockResolvedValue({
        entityId: 'ent_123',
        facts: [
          { id: 'fact_1', subject: 'ent_123', predicate: 'born_in', object: 'Germany' },
          { id: 'fact_2', subject: 'ent_123', predicate: 'worked_at', object: 'Princeton' },
        ],
      });

      const result = await entities.getFacts('ent_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/entities/ent_123/facts',
      });
      expect(result.facts).toHaveLength(2);
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
