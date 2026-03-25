/**
 * Tests for SpaceConfigResource - per-space configuration management
 */

import { SpaceConfigResource } from '../src/resources/space-config';

const mockClient = {
  request: jest.fn(),
};

const CONFIG = {
  spaceId: 'space_123',
  version: 3,
  config: {
    memory: { effective: { auto_enrich: true } },
    retrieval: { effective: { top_k: 10, similarity_threshold: 0.7 } },
    llm: { effective: { model: 'gpt-4' } },
    privacy: { effective: { pii_detection: false } },
  },
};

describe('SpaceConfigResource', () => {
  let spaceConfig: SpaceConfigResource;

  beforeEach(() => {
    jest.clearAllMocks();
    spaceConfig = new SpaceConfigResource(mockClient as any);
  });

  describe('get', () => {
    it('should get space configuration', async () => {
      mockClient.request.mockResolvedValue(CONFIG);

      const result = await spaceConfig.get('space_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/spaces/space_123/config',
      });
      expect(result.version).toBe(3);
      expect(result.config.retrieval.effective.top_k).toBe(10);
    });

    it('should throw for invalid ID', async () => {
      await expect(spaceConfig.get('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update space configuration', async () => {
      const updated = {
        ...CONFIG,
        version: 4,
        config: {
          ...CONFIG.config,
          retrieval: { effective: { top_k: 20, similarity_threshold: 0.8 } },
        },
      };
      mockClient.request.mockResolvedValue(updated);

      const result = await spaceConfig.update('space_123', {
        retrieval: { top_k: 20, similarity_threshold: 0.8 },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/spaces/space_123/config',
        body: { retrieval: { top_k: 20, similarity_threshold: 0.8 } },
        headers: undefined,
      });
      expect(result.version).toBe(4);
    });

    it('should include If-Match header for optimistic concurrency', async () => {
      mockClient.request.mockResolvedValue({ ...CONFIG, version: 4 });

      await spaceConfig.update(
        'space_123',
        { retrieval: { top_k: 20 } },
        { expectedVersion: 3 },
      );

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/spaces/space_123/config',
        body: { retrieval: { top_k: 20 } },
        headers: { 'If-Match': '3' },
      });
    });
  });

  describe('validate', () => {
    it('should validate a config patch (valid)', async () => {
      mockClient.request.mockResolvedValue({
        valid: true,
        errors: [],
        affectedCategories: ['retrieval'],
      });

      const result = await spaceConfig.validate('space_123', {
        retrieval: { top_k: 20 },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/spaces/space_123/config/validate',
        body: { retrieval: { top_k: 20 } },
      });
      expect(result.valid).toBe(true);
    });

    it('should validate a config patch (invalid)', async () => {
      mockClient.request.mockResolvedValue({
        valid: false,
        errors: ['top_k must be positive'],
        affectedCategories: ['retrieval'],
      });

      const result = await spaceConfig.validate('space_123', {
        retrieval: { top_k: -1 },
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('top_k must be positive');
    });
  });

  describe('audit', () => {
    it('should get config audit trail', async () => {
      mockClient.request.mockResolvedValue({
        events: [{ category: 'retrieval', source: 'user', changedAt: '2024-01-01' }],
        total: 1,
      });

      const result = await spaceConfig.audit('space_123', { limit: 10 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/spaces/space_123/config/audit',
        query: { limit: 10 },
      });
      expect(result.events).toHaveLength(1);
    });
  });
});
