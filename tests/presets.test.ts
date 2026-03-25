/**
 * Tests for Presets resource - agent execution configurations
 */

import { Presets } from '../src/resources/presets';

const mockClient = {
  request: jest.fn(),
};

const PRESET = {
  id: 'preset_123',
  name: 'Fast Research',
  slug: 'fast-research',
  provider: 'openai',
  model: 'gpt-4.1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Presets', () => {
  let presets: Presets;

  beforeEach(() => {
    jest.clearAllMocks();
    presets = new Presets(mockClient as any);
  });

  describe('list', () => {
    it('should list all presets', async () => {
      mockClient.request.mockResolvedValue({ presets: [PRESET] });

      const result = await presets.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent-presets',
        query: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fast Research');
    });
  });

  describe('get', () => {
    it('should get a preset by ID', async () => {
      mockClient.request.mockResolvedValue({ preset: PRESET });

      const result = await presets.get('preset_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent-presets/preset_123',
      });
      expect(result.id).toBe('preset_123');
    });

    it('should get a preset by slug', async () => {
      mockClient.request.mockResolvedValue({ preset: PRESET });

      await presets.get('fast-research');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent-presets/fast-research',
      });
    });
  });

  describe('create', () => {
    it('should create a preset', async () => {
      mockClient.request.mockResolvedValue({ preset: PRESET });

      const result = await presets.create({
        name: 'Fast Research',
        provider: 'openai',
        model: 'gpt-4.1',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent-presets',
        body: { name: 'Fast Research', provider: 'openai', model: 'gpt-4.1' },
      });
      expect(result.name).toBe('Fast Research');
    });
  });

  describe('update', () => {
    it('should update a preset', async () => {
      mockClient.request.mockResolvedValue({
        preset: { ...PRESET, model: 'gpt-4.1-mini' },
      });

      const result = await presets.update('preset_123', { model: 'gpt-4.1-mini' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/agent-presets/preset_123',
        body: { model: 'gpt-4.1-mini' },
      });
      expect(result.model).toBe('gpt-4.1-mini');
    });
  });

  describe('delete', () => {
    it('should delete a preset', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await presets.delete('preset_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/agent-presets/preset_123',
      });
    });
  });
});
