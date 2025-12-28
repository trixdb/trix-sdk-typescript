/**
 * Tests for Facts resource - Knowledge Graph Triples
 */

import { Facts } from '../src/resources/facts';
import {
  validateBulkArray,
  findDuplicateIds,
  buildParams,
} from '../src/resources/base';

// Mock client for testing
const mockClient = {
  request: jest.fn(),
};

describe('Facts', () => {
  let facts: Facts;

  beforeEach(() => {
    jest.clearAllMocks();
    facts = new Facts(mockClient as any);
  });

  describe('create', () => {
    it('should create a fact with subject-predicate-object', async () => {
      const factData = {
        subject: 'Albert Einstein',
        predicate: 'was_born_in',
        object: 'Ulm, Germany',
        confidence: 0.95,
      };

      mockClient.request.mockResolvedValue({
        id: 'fact_123',
        ...factData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await facts.create(factData);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/facts',
        body: factData,
      });
      expect(result.id).toBe('fact_123');
      expect(result.subject).toBe('Albert Einstein');
      expect(result.predicate).toBe('was_born_in');
      expect(result.object).toBe('Ulm, Germany');
    });

    it('should create a fact with source attribution', async () => {
      const factData = {
        subject: 'TrixDB',
        predicate: 'is_a',
        object: 'memory database',
        confidence: 1.0,
        source: {
          memoryId: 'mem_456',
          method: 'extracted' as const,
        },
      };

      mockClient.request.mockResolvedValue({
        id: 'fact_124',
        ...factData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await facts.create(factData);

      expect(result.source?.memoryId).toBe('mem_456');
      expect(result.source?.method).toBe('extracted');
    });

    it('should create a fact with temporal validity', async () => {
      const factData = {
        subject: 'Company X',
        predicate: 'had_ceo',
        object: 'John Doe',
        confidence: 0.9,
        validFrom: '2020-01-01T00:00:00Z',
        validTo: '2023-12-31T23:59:59Z',
      };

      mockClient.request.mockResolvedValue({
        id: 'fact_125',
        ...factData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await facts.create(factData);

      expect(result.validFrom).toBe('2020-01-01T00:00:00Z');
      expect(result.validTo).toBe('2023-12-31T23:59:59Z');
    });

    it('should create a fact with typed subject/object', async () => {
      const factData = {
        subject: 'ent_einstein',
        subjectType: 'entity' as const,
        predicate: 'worked_at',
        object: 'ent_princeton',
        objectType: 'entity' as const,
        confidence: 0.99,
      };

      mockClient.request.mockResolvedValue({
        id: 'fact_126',
        ...factData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await facts.create(factData);

      expect(result.subjectType).toBe('entity');
      expect(result.objectType).toBe('entity');
    });
  });

  describe('get', () => {
    it('should get a fact by ID', async () => {
      mockClient.request.mockResolvedValue({
        id: 'fact_123',
        subject: 'Einstein',
        predicate: 'discovered',
        object: 'Theory of Relativity',
        confidence: 1.0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const result = await facts.get('fact_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts/fact_123',
      });
      expect(result.id).toBe('fact_123');
    });

    it('should throw for invalid ID', async () => {
      await expect(facts.get('')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all facts', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'fact_1', subject: 'A', predicate: 'is', object: 'B' },
          { id: 'fact_2', subject: 'C', predicate: 'has', object: 'D' },
        ],
        pagination: { total: 2, page: 1, limit: 10, hasMore: false },
      });

      const result = await facts.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts',
        query: {},
      });
      expect(result.data).toHaveLength(2);
    });

    it('should list facts with filters', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false },
      });

      await facts.list({
        subject: 'Einstein',
        predicate: 'discovered',
        limit: 5,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts',
        query: { subject: 'Einstein', predicate: 'discovered', limit: 5 },
      });
    });

    it('should filter by confidence threshold', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false },
      });

      await facts.list({ minConfidence: 0.8 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts',
        query: { minConfidence: 0.8 },
      });
    });

    it('should filter by space', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false },
      });

      await facts.list({ spaceId: 'space_123' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts',
        query: { spaceId: 'space_123' },
      });
    });
  });

  describe('update', () => {
    it('should update a fact', async () => {
      mockClient.request.mockResolvedValue({
        id: 'fact_123',
        subject: 'Einstein',
        predicate: 'discovered',
        object: 'General Relativity',
        confidence: 1.0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      });

      const result = await facts.update('fact_123', {
        object: 'General Relativity',
        confidence: 1.0,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/facts/fact_123',
        body: { object: 'General Relativity', confidence: 1.0 },
      });
      expect(result.object).toBe('General Relativity');
    });

    it('should update temporal validity', async () => {
      mockClient.request.mockResolvedValue({
        id: 'fact_123',
        validTo: '2024-06-30T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      });

      await facts.update('fact_123', {
        validTo: '2024-06-30T00:00:00Z',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/facts/fact_123',
        body: { validTo: '2024-06-30T00:00:00Z' },
      });
    });
  });

  describe('delete', () => {
    it('should delete a fact', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await facts.delete('fact_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/facts/fact_123',
      });
    });
  });

  describe('query', () => {
    it('should query facts by natural language', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          {
            id: 'fact_1',
            subject: 'Einstein',
            predicate: 'born_in',
            object: 'Germany',
            score: 0.95,
          },
        ],
      });

      const result = await facts.query('Where was Einstein born?');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/facts/query',
        body: { query: 'Where was Einstein born?' },
      });
      expect(result.data).toHaveLength(1);
    });

    it('should query with options', async () => {
      mockClient.request.mockResolvedValue({ data: [] });

      await facts.query('Einstein discoveries', {
        limit: 5,
        minConfidence: 0.9,
        spaceId: 'space_123',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/facts/query',
        body: {
          query: 'Einstein discoveries',
          limit: 5,
          minConfidence: 0.9,
          spaceId: 'space_123',
        },
      });
    });
  });

  describe('findBySubject', () => {
    it('should find facts by subject', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'fact_1', subject: 'Einstein', predicate: 'born_in', object: 'Germany' },
          { id: 'fact_2', subject: 'Einstein', predicate: 'discovered', object: 'Relativity' },
        ],
      });

      const result = await facts.findBySubject('Einstein');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts',
        query: { subject: 'Einstein' },
      });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('findByPredicate', () => {
    it('should find facts by predicate', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'fact_1', subject: 'Einstein', predicate: 'discovered', object: 'Relativity' },
          { id: 'fact_2', subject: 'Newton', predicate: 'discovered', object: 'Gravity' },
        ],
      });

      const result = await facts.findByPredicate('discovered');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts',
        query: { predicate: 'discovered' },
      });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('findByObject', () => {
    it('should find facts by object', async () => {
      mockClient.request.mockResolvedValue({
        data: [
          { id: 'fact_1', subject: 'Einstein', predicate: 'born_in', object: 'Germany' },
        ],
      });

      const result = await facts.findByObject('Germany');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/facts',
        query: { object: 'Germany' },
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple facts', async () => {
      const factsData = [
        { subject: 'A', predicate: 'is', object: 'B', confidence: 1.0 },
        { subject: 'C', predicate: 'has', object: 'D', confidence: 0.9 },
      ];

      mockClient.request.mockResolvedValue({
        success: 2,
        failed: 0,
        facts: [
          { id: 'fact_1', ...factsData[0] },
          { id: 'fact_2', ...factsData[1] },
        ],
      });

      const result = await facts.bulkCreate(factsData);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/facts/bulk',
        body: { facts: factsData },
      });
      expect(result.success).toBe(2);
    });

    it('should throw for empty array', async () => {
      await expect(facts.bulkCreate([])).rejects.toThrow('array cannot be empty');
    });

    it('should throw for exceeding max limit', async () => {
      const tooMany = Array(1001).fill({
        subject: 'A',
        predicate: 'is',
        object: 'B',
        confidence: 1.0,
      });

      await expect(facts.bulkCreate(tooMany)).rejects.toThrow('exceeds maximum');
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple facts', async () => {
      mockClient.request.mockResolvedValue({
        success: 3,
        failed: 0,
      });

      const result = await facts.bulkDelete(['fact_1', 'fact_2', 'fact_3']);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/facts/bulk',
        body: { ids: ['fact_1', 'fact_2', 'fact_3'] },
      });
      expect(result.success).toBe(3);
    });
  });

  describe('extract', () => {
    it('should extract facts from a memory', async () => {
      mockClient.request.mockResolvedValue({
        memoryId: 'mem_123',
        facts: [
          {
            subject: 'Einstein',
            predicate: 'developed',
            object: 'Theory of Relativity',
            confidence: 0.92,
          },
        ],
      });

      const result = await facts.extract('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/extract-facts',
        body: {},
      });
      expect(result.facts).toHaveLength(1);
    });

    it('should extract with save option', async () => {
      mockClient.request.mockResolvedValue({
        memoryId: 'mem_123',
        facts: [],
        saved: true,
      });

      await facts.extract('mem_123', { save: true });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/extract-facts',
        body: { save: true },
      });
    });
  });

  describe('verify', () => {
    it('should verify a fact against memories', async () => {
      mockClient.request.mockResolvedValue({
        factId: 'fact_123',
        verified: true,
        confidence: 0.95,
        supportingMemories: ['mem_1', 'mem_2'],
      });

      const result = await facts.verify('fact_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/facts/fact_123/verify',
        body: {},
      });
      expect(result.verified).toBe(true);
      expect(result.supportingMemories).toHaveLength(2);
    });
  });
});

describe('buildParams for Facts', () => {
  it('should filter undefined values', () => {
    const params = buildParams({
      subject: 'Einstein',
      predicate: undefined,
      limit: 10,
    });

    expect(params).toEqual({ subject: 'Einstein', limit: 10 });
    expect(params).not.toHaveProperty('predicate');
  });
});
