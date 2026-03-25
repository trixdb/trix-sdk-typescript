/**
 * Tests for Agent resource - Session management and agent operations
 */

import { Agent } from '../src/resources/agent';

const mockClient = {
  request: jest.fn(),
};

const SESSION = {
  id: 'sess_123',
  name: 'Research Session',
  active: true,
  metadata: { agent: 'bot' },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Agent', () => {
  let agent: Agent;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new Agent(mockClient as any);
  });

  describe('createSession', () => {
    it('should create a session', async () => {
      mockClient.request.mockResolvedValue(SESSION);

      const result = await agent.createSession({
        name: 'Research Session',
        metadata: { agent: 'bot' },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions',
        body: { name: 'Research Session', metadata: { agent: 'bot' } },
      });
      expect(result.id).toBe('sess_123');
      expect(result.name).toBe('Research Session');
    });

    it('should create a session with minimal params', async () => {
      mockClient.request.mockResolvedValue({ ...SESSION, metadata: undefined });

      const result = await agent.createSession({ name: 'Basic Session' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions',
        body: { name: 'Basic Session' },
      });
      expect(result.id).toBe('sess_123');
    });
  });

  describe('getSession', () => {
    it('should get a session by ID', async () => {
      mockClient.request.mockResolvedValue({
        session: SESSION,
        memories: [],
      });

      const result = await agent.getSession('sess_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent/sessions/sess_123',
        query: undefined,
      });
      expect(result.session).toEqual(SESSION);
    });

    it('should get session with options', async () => {
      mockClient.request.mockResolvedValue({
        session: SESSION,
        memories: [{ id: 'mem_1' }],
      });

      const result = await agent.getSession('sess_123', {
        includeMemories: true,
        limit: 50,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent/sessions/sess_123',
        query: { includeMemories: true, limit: 50 },
      });
      expect(result.memories).toHaveLength(1);
    });

    it('should throw for empty session ID', async () => {
      await expect(agent.getSession('')).rejects.toThrow();
    });
  });

  describe('listSessions', () => {
    it('should list sessions', async () => {
      mockClient.request.mockResolvedValue({
        data: [SESSION],
        pagination: { total: 1, page: 1, limit: 10, hasMore: false },
      });

      const result = await agent.listSessions();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent/sessions',
        query: undefined,
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list sessions with filters', async () => {
      mockClient.request.mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 20, hasMore: false },
      });

      await agent.listSessions({ active: true, limit: 20 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/agent/sessions',
        query: { active: true, limit: 20 },
      });
    });
  });

  describe('addSessionMemory', () => {
    it('should add a memory to a session', async () => {
      const sessionMemory = {
        id: 'smem_1',
        sessionId: 'sess_123',
        content: 'User asked about pricing',
        tags: ['question', 'pricing'],
      };
      mockClient.request.mockResolvedValue(sessionMemory);

      const result = await agent.addSessionMemory('sess_123', {
        content: 'User asked about pricing',
        tags: ['question', 'pricing'],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions/sess_123/memories',
        body: {
          content: 'User asked about pricing',
          tags: ['question', 'pricing'],
        },
      });
      expect(result.content).toBe('User asked about pricing');
    });

    it('should throw for empty session ID', async () => {
      await expect(
        agent.addSessionMemory('', { content: 'test' })
      ).rejects.toThrow();
    });
  });

  describe('endSession', () => {
    it('should end a session', async () => {
      const ended = { ...SESSION, active: false, endedAt: '2024-01-02T00:00:00Z' };
      mockClient.request.mockResolvedValue(ended);

      const result = await agent.endSession('sess_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions/sess_123/end',
        body: undefined,
      });
      expect(result.active).toBe(false);
    });

    it('should end a session with metadata', async () => {
      const ended = { ...SESSION, active: false };
      mockClient.request.mockResolvedValue(ended);

      await agent.endSession('sess_123', {
        metadata: { resolution: 'resolved' },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions/sess_123/end',
        body: { metadata: { resolution: 'resolved' } },
      });
    });

    it('should throw for empty session ID', async () => {
      await expect(agent.endSession('')).rejects.toThrow();
    });
  });
});
