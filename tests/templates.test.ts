/**
 * Tests for Templates resource - agent template management
 */

import { Templates } from '../src/resources/templates';

const mockClient = {
  request: jest.fn(),
};

const TEMPLATE = {
  id: 'tmpl_123',
  name: 'Research Assistant',
  system_prompt: 'You help with research tasks.',
  category: 'productivity',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Templates', () => {
  let templates: Templates;

  beforeEach(() => {
    jest.clearAllMocks();
    templates = new Templates(mockClient as any);
  });

  describe('list', () => {
    it('should list all templates', async () => {
      mockClient.request.mockResolvedValue({ templates: [TEMPLATE] });

      const result = await templates.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent-templates',
        query: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Research Assistant');
    });
  });

  describe('get', () => {
    it('should get a template by ID', async () => {
      mockClient.request.mockResolvedValue(TEMPLATE);

      const result = await templates.get('tmpl_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent-templates/tmpl_123',
      });
      expect(result.id).toBe('tmpl_123');
    });

    it('should throw for invalid ID', async () => {
      await expect(templates.get('')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a template', async () => {
      mockClient.request.mockResolvedValue(TEMPLATE);

      const result = await templates.create({
        name: 'Research Assistant',
        system_prompt: 'You help with research tasks.',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent-templates',
        body: {
          name: 'Research Assistant',
          system_prompt: 'You help with research tasks.',
        },
      });
      expect(result.name).toBe('Research Assistant');
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      mockClient.request.mockResolvedValue({ ...TEMPLATE, name: 'Updated' });

      const result = await templates.update('tmpl_123', { name: 'Updated' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/agent-templates/tmpl_123',
        body: { name: 'Updated' },
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete a template', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await templates.delete('tmpl_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/agent-templates/tmpl_123',
      });
    });
  });

  describe('install', () => {
    it('should install a template as a bot', async () => {
      mockClient.request.mockResolvedValue({
        id: 'bot_456',
        name: 'Research Assistant',
      });

      const result = await templates.install('tmpl_123', {
        name: 'My Research Bot',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent-templates/tmpl_123/install',
        body: { name: 'My Research Bot' },
      });
      expect(result.id).toBe('bot_456');
    });
  });

  describe('browse', () => {
    it('should browse marketplace templates', async () => {
      mockClient.request.mockResolvedValue({ templates: [TEMPLATE] });

      const result = await templates.browse({ sort: 'popular' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent-templates/marketplace',
        query: { sort: 'popular' },
      });
      expect(result).toHaveLength(1);
    });
  });
});
