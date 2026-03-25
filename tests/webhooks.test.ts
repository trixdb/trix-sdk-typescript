/**
 * Tests for Webhooks resource - Webhook subscription management
 */

import { Webhooks } from '../src/resources/webhooks';

const mockClient = {
  request: jest.fn(),
};

const WEBHOOK = {
  id: 'wh_123',
  url: 'https://example.com/webhook',
  events: ['memory.created', 'memory.updated'],
  active: true,
  secret: 'whsec_abc',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Webhooks', () => {
  let webhooks: Webhooks;

  beforeEach(() => {
    jest.clearAllMocks();
    webhooks = new Webhooks(mockClient as any);
  });

  describe('create', () => {
    it('should create a webhook with valid URL', async () => {
      mockClient.request.mockResolvedValue(WEBHOOK);

      const result = await webhooks.create({
        url: 'https://example.com/webhook',
        events: ['memory.created', 'memory.updated'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/webhooks',
        body: {
          url: 'https://example.com/webhook',
          events: ['memory.created', 'memory.updated'],
        },
      });
      expect(result.id).toBe('wh_123');
      expect(result.url).toBe('https://example.com/webhook');
    });

    it('should reject invalid URL', async () => {
      await expect(
        webhooks.create({ url: 'not-a-url', events: ['memory.created'] })
      ).rejects.toThrow();
    });

    it('should reject empty URL', async () => {
      await expect(
        webhooks.create({ url: '', events: ['memory.created'] })
      ).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should get a webhook by ID', async () => {
      mockClient.request.mockResolvedValue(WEBHOOK);

      const result = await webhooks.get('wh_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/webhooks/wh_123',
      });
      expect(result.id).toBe('wh_123');
    });

    it('should throw for empty ID', async () => {
      await expect(webhooks.get('')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list webhooks', async () => {
      mockClient.request.mockResolvedValue({
        data: [WEBHOOK],
        pagination: { total: 1, page: 1, limit: 10, hasMore: false },
      });

      const result = await webhooks.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/webhooks',
        query: undefined,
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list with filters', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, hasMore: false },
      });

      await webhooks.list({ active: true, limit: 5 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/webhooks',
        query: { active: true, limit: 5 },
      });
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      mockClient.request.mockResolvedValue({
        ...WEBHOOK,
        active: false,
      });

      const result = await webhooks.update('wh_123', { active: false });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/webhooks/wh_123',
        body: { active: false },
      });
      expect(result.active).toBe(false);
    });

    it('should validate URL when updating URL', async () => {
      await expect(
        webhooks.update('wh_123', { url: 'not-valid' })
      ).rejects.toThrow();
    });

    it('should allow update without URL', async () => {
      mockClient.request.mockResolvedValue({
        ...WEBHOOK,
        events: ['memory.created'],
      });

      await webhooks.update('wh_123', {
        events: ['memory.created'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/webhooks/wh_123',
        body: { events: ['memory.created'] },
      });
    });
  });

  describe('delete', () => {
    it('should delete a webhook', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await webhooks.delete('wh_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/webhooks/wh_123',
      });
    });

    it('should throw for empty ID', async () => {
      await expect(webhooks.delete('')).rejects.toThrow();
    });
  });

  describe('test', () => {
    it('should test a webhook', async () => {
      mockClient.request.mockResolvedValue({
        success: true,
        statusCode: 200,
        responseTime: 150,
      });

      const result = await webhooks.test('wh_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/webhooks/wh_123/test',
        body: { eventType: undefined },
      });
      expect(result.success).toBe(true);
    });

    it('should test with specific event type', async () => {
      mockClient.request.mockResolvedValue({
        success: true,
        statusCode: 200,
      });

      await webhooks.test('wh_123', 'memory.created');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/webhooks/wh_123/test',
        body: { eventType: 'memory.created' },
      });
    });

    it('should handle test failure', async () => {
      mockClient.request.mockResolvedValue({
        success: false,
        error: 'Connection refused',
      });

      const result = await webhooks.test('wh_123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
    });
  });
});
