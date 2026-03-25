/**
 * Tests for Enrichments resource - memory enrichment operations
 */

import { Enrichments } from '../src/resources/enrichments';

const mockClient = {
  request: jest.fn(),
};

const ENRICHMENT = {
  type: 'entities',
  status: 'completed',
  data: { entities: ['Einstein', 'Germany'] },
  createdAt: '2024-01-01T00:00:00Z',
};

const ENRICHMENT_RESULT = {
  jobId: 'job_789',
  status: 'queued',
  types: ['entities', 'summary'],
};

describe('Enrichments', () => {
  let enrichments: Enrichments;

  beforeEach(() => {
    jest.clearAllMocks();
    enrichments = new Enrichments(mockClient as any);
  });

  describe('list', () => {
    it('should list enrichments for a memory', async () => {
      mockClient.request.mockResolvedValue({ data: [ENRICHMENT] });

      const result = await enrichments.list('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_123/enrichments',
        query: {},
      });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('entities');
    });

    it('should throw for invalid memory ID', async () => {
      await expect(enrichments.list('')).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should get a specific enrichment by type', async () => {
      mockClient.request.mockResolvedValue(ENRICHMENT);

      const result = await enrichments.get('mem_123', 'entities');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/memories/mem_123/enrichments/entities',
      });
      expect(result.type).toBe('entities');
    });

    it('should throw for empty type', async () => {
      await expect(enrichments.get('mem_123', '')).rejects.toThrow();
    });
  });

  describe('trigger', () => {
    it('should trigger enrichment with specific types', async () => {
      mockClient.request.mockResolvedValue(ENRICHMENT_RESULT);

      const result = await enrichments.trigger('mem_123', {
        types: ['entities', 'summary'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/enrichments',
        body: { types: ['entities', 'summary'] },
      });
      expect(result.status).toBe('queued');
    });

    it('should trigger all enrichments when no params given', async () => {
      mockClient.request.mockResolvedValue(ENRICHMENT_RESULT);

      await enrichments.trigger('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/enrichments',
        body: {},
      });
    });
  });

  describe('retry', () => {
    it('should retry failed enrichments', async () => {
      mockClient.request.mockResolvedValue(ENRICHMENT_RESULT);

      await enrichments.retry('mem_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/enrichments/retry',
        body: {},
      });
    });

    it('should retry specific types', async () => {
      mockClient.request.mockResolvedValue(ENRICHMENT_RESULT);

      await enrichments.retry('mem_123', ['entities']);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/enrichments/retry',
        body: { types: ['entities'] },
      });
    });
  });

  describe('triggerFull', () => {
    it('should trigger full enrichment pipeline', async () => {
      mockClient.request.mockResolvedValue(ENRICHMENT_RESULT);

      await enrichments.triggerFull('mem_123', { priority: 'high' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/memories/mem_123/enrichments/full',
        body: { priority: 'high' },
      });
    });
  });
});
