/**
 * Tests for the Facts resource.
 *
 * Covers the live API surface only: account-wide list (`/v1/knowledge/facts`)
 * and memory-scoped read/create (`/v1/memories/:id/facts`). The previous
 * create/query/bulk/verify/extract methods targeted non-existent endpoints and
 * were removed.
 */

import { Facts } from '../src/resources/facts';
import { buildParams } from '../src/resources/base';

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

  describe('list', () => {
    it('should list all facts at GET /knowledge/facts', async () => {
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
        path: '/knowledge/facts',
        query: {},
      });
      expect(result.data).toHaveLength(2);
    });

    it('should pass through filters', async () => {
      mockClient.request.mockResolvedValue({ data: [], pagination: {} });

      await facts.list({ subject: 'Einstein', limit: 5 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/knowledge/facts',
        query: { subject: 'Einstein', limit: 5 },
      });
    });
  });

  describe('listForMemory', () => {
    it('should call GET /memories/:id/facts', async () => {
      mockClient.request.mockResolvedValue({
        memory_id: 'mem_123',
        facts: [{ id: 'fact_1' }],
        total: 1,
      });

      const result = await facts.listForMemory('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_123/facts',
        query: undefined,
      });
      expect(result.total).toBe(1);
    });

    it('should reject an invalid memory id', async () => {
      await expect(facts.listForMemory('../etc/passwd')).rejects.toThrow();
    });
  });

  describe('createForMemory', () => {
    it('should POST to /memories/:id/facts with the body', async () => {
      const body = { subject: 'A', predicate: 'is', object: 'B' };
      mockClient.request.mockResolvedValue({ id: 'fact_9', ...body });

      const result = await facts.createForMemory('mem_123', body);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/facts',
        body,
      });
      expect(result.id).toBe('fact_9');
    });

    it('should reject an invalid memory id', async () => {
      await expect(
        facts.createForMemory('', { subject: 'A', predicate: 'is', object: 'B' })
      ).rejects.toThrow();
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
