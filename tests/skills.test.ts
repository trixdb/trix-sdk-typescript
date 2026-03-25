/**
 * Tests for Skills resource - reusable instruction packages
 */

import { Skills } from '../src/resources/skills';

const mockClient = {
  request: jest.fn(),
};

const SKILL = {
  id: 'skill_123',
  name: 'code-review',
  slug: 'code-review',
  description: 'Review code for best practices.',
  content: '# Code Review\n\n## Instructions\n...',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Skills', () => {
  let skills: Skills;

  beforeEach(() => {
    jest.clearAllMocks();
    skills = new Skills(mockClient as any);
  });

  describe('list', () => {
    it('should list all skills', async () => {
      mockClient.request.mockResolvedValue({ skills: [SKILL] });

      const result = await skills.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/skills',
        query: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('code-review');
    });
  });

  describe('get', () => {
    it('should get a skill by ID', async () => {
      mockClient.request.mockResolvedValue(SKILL);

      const result = await skills.get('skill_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/skills/skill_123',
      });
      expect(result.id).toBe('skill_123');
    });

    it('should get a skill by slug', async () => {
      mockClient.request.mockResolvedValue(SKILL);

      await skills.get('code-review');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/skills/code-review',
      });
    });
  });

  describe('create', () => {
    it('should create a skill', async () => {
      mockClient.request.mockResolvedValue(SKILL);

      const result = await skills.create({
        name: 'code-review',
        description: 'Review code for best practices.',
        content: '# Code Review\n\n## Instructions\n...',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/skills',
        body: {
          name: 'code-review',
          description: 'Review code for best practices.',
          content: '# Code Review\n\n## Instructions\n...',
        },
      });
      expect(result.id).toBe('skill_123');
    });
  });

  describe('update', () => {
    it('should update a skill', async () => {
      mockClient.request.mockResolvedValue({ ...SKILL, name: 'updated-skill' });

      const result = await skills.update('skill_123', { name: 'updated-skill' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/skills/skill_123',
        body: { name: 'updated-skill' },
      });
      expect(result.name).toBe('updated-skill');
    });
  });

  describe('delete', () => {
    it('should delete a skill', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await skills.delete('skill_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/skills/skill_123',
      });
    });
  });

  describe('publish', () => {
    it('should publish a skill', async () => {
      mockClient.request.mockResolvedValue({ ...SKILL, published: true });

      await skills.publish('skill_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/skills/skill_123/publish',
      });
    });
  });

  describe('attachToBot', () => {
    it('should attach a skill to a bot', async () => {
      mockClient.request.mockResolvedValue({
        skillId: 'skill_123',
        botId: 'bot_456',
      });

      await skills.attachToBot('skill_123', { bot_id: 'bot_456' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/skills/skill_123/bots',
        body: { bot_id: 'bot_456' },
      });
    });
  });

  describe('detachFromBot', () => {
    it('should detach a skill from a bot', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await skills.detachFromBot('skill_123', 'bot_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/skills/skill_123/bots/bot_456',
      });
    });
  });
});
