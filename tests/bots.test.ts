/**
 * Tests for Bots resource - AI bot/agent management
 */

import { Bots } from '../src/resources/bots';

const mockClient = {
  request: jest.fn(),
  requestStream: jest.fn(),
};

const BOT = {
  id: 'bot_123',
  accountId: 'acc_1',
  name: 'Summarizer',
  slug: 'summarizer',
  systemPrompt: 'Summarize text.',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const RUN = {
  id: 'run_456',
  botId: 'bot_123',
  status: 'running',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('Bots', () => {
  let bots: Bots;

  beforeEach(() => {
    jest.clearAllMocks();
    bots = new Bots(mockClient as any);
  });

  describe('create', () => {
    it('should create a bot', async () => {
      mockClient.request.mockResolvedValue(BOT);

      const result = await bots.create({
        name: 'Summarizer',
        system_prompt: 'Summarize text.',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agents',
        body: { name: 'Summarizer', system_prompt: 'Summarize text.' },
      });
      expect(result.id).toBe('bot_123');
      expect(result.name).toBe('Summarizer');
    });
  });

  describe('list', () => {
    it('should list all bots', async () => {
      mockClient.request.mockResolvedValue({ agents: [BOT] });

      const result = await bots.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agents',
        query: undefined,
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockClient.request.mockResolvedValue({ agents: [] });

      await bots.list({ status: 'active' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agents',
        query: { status: 'active' },
      });
    });
  });

  describe('get', () => {
    it('should get a bot by ID', async () => {
      mockClient.request.mockResolvedValue(BOT);

      const result = await bots.get('bot_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agents/bot_123',
      });
      expect(result.id).toBe('bot_123');
    });
  });

  describe('update', () => {
    it('should update a bot', async () => {
      mockClient.request.mockResolvedValue({ ...BOT, name: 'Updated Bot' });

      const result = await bots.update('bot_123', { name: 'Updated Bot' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/agents/bot_123',
        body: { name: 'Updated Bot' },
      });
      expect(result.name).toBe('Updated Bot');
    });
  });

  describe('delete', () => {
    it('should delete a bot', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await bots.delete('bot_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/agents/bot_123',
      });
    });
  });

  describe('run', () => {
    it('should trigger a bot run', async () => {
      mockClient.request.mockResolvedValue(RUN);

      const result = await bots.run('bot_123', { message: 'Summarize today' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agents/bot_123/run',
        body: { message: 'Summarize today' },
      });
      expect(result.status).toBe('running');
    });
  });

  describe('listRuns', () => {
    it('should list bot runs', async () => {
      mockClient.request.mockResolvedValue({ runs: [RUN] });

      const result = await bots.listRuns('bot_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agents/bot_123/runs',
        query: undefined,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getRun', () => {
    it('should get a specific bot run', async () => {
      mockClient.request.mockResolvedValue({ ...RUN, status: 'completed' });

      const result = await bots.getRun('bot_123', 'run_456');

      // Runs are addressed globally by id, not nested under the agent.
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agents/runs/run_456',
      });
      expect(result.status).toBe('completed');
    });
  });

  describe('addSpace', () => {
    it('should grant space access to a bot', async () => {
      mockClient.request.mockResolvedValue({
        spaceId: 'space_1',
        permission: 'read',
      });

      await bots.addSpace('bot_123', { spaceId: 'space_1', permission: 'read' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agents/bot_123/spaces',
        body: { spaceId: 'space_1', permission: 'read' },
      });
    });
  });

  describe('removeSpace', () => {
    it('should revoke space access from a bot', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await bots.removeSpace('bot_123', 'space_1');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/agents/bot_123/spaces/space_1',
      });
    });
  });
});
