/**
 * Comprehensive tests for Agent resource —
 * session lifecycle, memory ops, context, pipeline management, error handling.
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

  // ==================== Session lifecycle ====================

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

  // ==================== Memory operations ====================

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

  describe('addSessionMessage', () => {
    it('should add a user message to a session', async () => {
      const msg = {
        id: 'msg_1',
        sessionId: 'sess_123',
        role: 'user',
        content: 'What is the weather today?',
        turnNumber: 1,
      };
      mockClient.request.mockResolvedValue(msg);

      const result = await agent.addSessionMessage('sess_123', {
        role: 'user',
        content: 'What is the weather today?',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions/sess_123/message',
        body: { role: 'user', content: 'What is the weather today?' },
      });
      expect(result.turnNumber).toBe(1);
      expect(result.role).toBe('user');
    });

    it('should add an assistant message to a session', async () => {
      const msg = {
        id: 'msg_2',
        sessionId: 'sess_123',
        role: 'assistant',
        content: 'The weather is sunny and 72F.',
        turnNumber: 2,
      };
      mockClient.request.mockResolvedValue(msg);

      const result = await agent.addSessionMessage('sess_123', {
        role: 'assistant',
        content: 'The weather is sunny and 72F.',
      });

      expect(result.role).toBe('assistant');
      expect(result.turnNumber).toBe(2);
    });

    it('should throw for empty session ID', async () => {
      await expect(
        agent.addSessionMessage('', { role: 'user', content: 'hi' })
      ).rejects.toThrow('session ID cannot be empty');
    });

    it('should throw for path traversal in session ID', async () => {
      await expect(
        agent.addSessionMessage('../evil', { role: 'user', content: 'hi' })
      ).rejects.toThrow();
    });
  });

  // ==================== Context retrieval ====================

  describe('getContext', () => {
    it('should retrieve context for a session query', async () => {
      const contextResult = {
        memories: [{ id: 'mem_1', content: 'Pricing is $10/mo', score: 0.95 }],
        totalResults: 1,
      };
      mockClient.request.mockResolvedValue(contextResult);

      const result = await agent.getContext({
        sessionId: 'sess_123',
        query: 'What did we discuss about pricing?',
        limit: 10,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/context',
        body: {
          sessionId: 'sess_123',
          query: 'What did we discuss about pricing?',
          limit: 10,
        },
      });
      expect(result.memories).toHaveLength(1);
      expect(result.memories[0].score).toBe(0.95);
    });

    it('should pass includeRelated option', async () => {
      mockClient.request.mockResolvedValue({ memories: [], totalResults: 0 });

      await agent.getContext({
        sessionId: 'sess_123',
        query: 'pricing',
        includeRelated: true,
      });

      const call = mockClient.request.mock.calls[0][0];
      expect(call.body.includeRelated).toBe(true);
    });

    it('should work without optional parameters', async () => {
      mockClient.request.mockResolvedValue({ memories: [], totalResults: 0 });

      await agent.getContext({
        sessionId: 'sess_123',
        query: 'anything',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/context',
        body: { sessionId: 'sess_123', query: 'anything' },
      });
    });
  });

  // ==================== Pipeline management (account-level) ====================

  describe('getDefaultPipeline', () => {
    it('returns the name when a default is set', async () => {
      mockClient.request.mockResolvedValue({ name: 'longmem-v1' });
      const result = await agent.getDefaultPipeline();
      expect(result).toBe('longmem-v1');
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/pipeline-presets/_default',
      });
    });

    it('returns null when no default is set', async () => {
      mockClient.request.mockResolvedValue({ name: null });
      const result = await agent.getDefaultPipeline();
      expect(result).toBeNull();
    });

    it('returns null when response is falsy', async () => {
      mockClient.request.mockResolvedValue(null);
      const result = await agent.getDefaultPipeline();
      expect(result).toBeNull();
    });
  });

  describe('setDefaultPipeline', () => {
    it('POSTs to the set-default path and returns the name', async () => {
      mockClient.request.mockResolvedValue({ name: 'longmem-v1' });
      const result = await agent.setDefaultPipeline('longmem-v1');
      expect(result).toEqual({ name: 'longmem-v1' });
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/pipeline-presets/longmem-v1/set-default',
        body: {},
      });
    });

    it('URL-encodes preset names with special characters', async () => {
      mockClient.request.mockResolvedValue({ name: 'a b' });
      await agent.setDefaultPipeline('a b');
      const call = mockClient.request.mock.calls[0][0];
      expect(call.path).toBe('/pipeline-presets/a%20b/set-default');
    });
  });

  describe('clearDefaultPipeline', () => {
    it('DELETEs the _default path', async () => {
      mockClient.request.mockResolvedValue(undefined);
      await agent.clearDefaultPipeline();
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/pipeline-presets/_default',
      });
    });
  });

  // ==================== Pipeline management (space-level) ====================

  describe('getSpaceDefaultPipeline', () => {
    it('returns the name when a space default is set', async () => {
      mockClient.request.mockResolvedValue({ name: 'space-preset' });
      const result = await agent.getSpaceDefaultPipeline('space_abc');
      expect(result).toBe('space-preset');
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/spaces/space_abc/default-pipeline',
      });
    });

    it('returns null when no space default is set', async () => {
      mockClient.request.mockResolvedValue({ name: null });
      const result = await agent.getSpaceDefaultPipeline('space_abc');
      expect(result).toBeNull();
    });
  });

  describe('setSpaceDefaultPipeline', () => {
    it('POSTs to the space default pipeline path', async () => {
      mockClient.request.mockResolvedValue({ name: 'my-preset' });
      const result = await agent.setSpaceDefaultPipeline('space_abc', 'my-preset');
      expect(result).toEqual({ name: 'my-preset' });
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/spaces/space_abc/default-pipeline/my-preset',
        body: {},
      });
    });

    it('URL-encodes space ID and preset name', async () => {
      mockClient.request.mockResolvedValue({ name: 'a b' });
      await agent.setSpaceDefaultPipeline('sp 1', 'a b');
      const call = mockClient.request.mock.calls[0][0];
      expect(call.path).toBe('/spaces/sp%201/default-pipeline/a%20b');
    });
  });

  describe('clearSpaceDefaultPipeline', () => {
    it('DELETEs the space default pipeline path', async () => {
      mockClient.request.mockResolvedValue(undefined);
      await agent.clearSpaceDefaultPipeline('space_abc');
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/spaces/space_abc/default-pipeline',
      });
    });
  });

  // ==================== Pipeline resolution ====================

  describe('resolvePipeline', () => {
    it('omits query params when called with no args', async () => {
      mockClient.request.mockResolvedValue({
        name: null,
        source: null,
        preset: null,
      });

      const result = await agent.resolvePipeline();

      expect(result).toEqual({ name: null, source: null, preset: null });
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/pipeline-presets/_resolve',
      });
    });

    it('sends pipeline query param when caller preset provided', async () => {
      mockClient.request.mockResolvedValue({
        name: 'longmem-v1',
        source: 'caller',
        preset: { name: 'longmem-v1' },
      });

      await agent.resolvePipeline({ pipeline: 'longmem-v1' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/pipeline-presets/_resolve?pipeline=longmem-v1',
      });
    });

    it('sends both space_id and pipeline params', async () => {
      mockClient.request.mockResolvedValue({
        name: 'space-pref',
        source: 'space',
        preset: { name: 'space-pref' },
      });

      await agent.resolvePipeline({ spaceId: 'space-123', pipeline: 'caller' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/pipeline-presets/_resolve?space_id=space-123&pipeline=caller',
      });
    });

    it('url-encodes space_id that needs escaping', async () => {
      mockClient.request.mockResolvedValue({
        name: null,
        source: null,
        preset: null,
      });

      await agent.resolvePipeline({ spaceId: 'my space' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/pipeline-presets/_resolve?space_id=my%20space',
      });
    });

    it('sends only spaceId when pipeline is omitted', async () => {
      mockClient.request.mockResolvedValue({
        name: 'acct-default',
        source: 'account',
        preset: { name: 'acct-default' },
      });

      await agent.resolvePipeline({ spaceId: 'space_1' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/pipeline-presets/_resolve?space_id=space_1',
      });
    });
  });

  // ==================== Ingestion-pipeline triggers ====================

  describe('summarizeSession', () => {
    it('should enqueue a session summary job', async () => {
      const response = {
        session_id: 'sess_123',
        enqueued: true,
        job_id: 'job_abc',
        pipeline: null,
      };
      mockClient.request.mockResolvedValue(response);

      const result = await agent.summarizeSession('sess_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions/sess_123/summarize',
        body: {},
      });
      expect(result.enqueued).toBe(true);
      expect(result.job_id).toBe('job_abc');
    });

    it('should pass pipeline param when provided', async () => {
      mockClient.request.mockResolvedValue({
        enqueued: true,
        job_id: 'job_xyz',
        pipeline: 'longmem-v1',
      });

      await agent.summarizeSession('sess_123', { pipeline: 'longmem-v1' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/sessions/sess_123/summarize',
        body: { pipeline: 'longmem-v1' },
      });
    });

    it('should throw for empty session ID', async () => {
      await expect(agent.summarizeSession('')).rejects.toThrow();
    });
  });

  describe('triggerMegaSummary', () => {
    it('should enqueue a mega-summary job with defaults', async () => {
      const response = {
        scope_id: 'acc_1',
        scope_type: 'account',
        enqueued: true,
        job_id: 'job_mega',
        pipeline: null,
      };
      mockClient.request.mockResolvedValue(response);

      const result = await agent.triggerMegaSummary({ scope_id: 'acc_1' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/mega-summary/trigger',
        body: { scope_type: 'account', scope_id: 'acc_1' },
      });
      expect(result.enqueued).toBe(true);
    });

    it('should allow overriding scope_type to space', async () => {
      mockClient.request.mockResolvedValue({
        enqueued: true,
        job_id: 'job_sp',
        pipeline: null,
      });

      await agent.triggerMegaSummary({
        scope_id: 'space_1',
        scope_type: 'space',
      });

      const call = mockClient.request.mock.calls[0][0];
      expect(call.body.scope_type).toBe('space');
    });
  });

  describe('triggerScopedFacts', () => {
    it('should enqueue a scoped-facts job with defaults', async () => {
      const response = {
        scope_id: 'sess_123',
        scope_type: 'session',
        enqueued: true,
        job_id: 'job_facts',
        pipeline: null,
      };
      mockClient.request.mockResolvedValue(response);

      const result = await agent.triggerScopedFacts({ scope_id: 'sess_123' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/agent/scoped-facts/harvest',
        body: { scope_type: 'session', scope_id: 'sess_123' },
      });
      expect(result.enqueued).toBe(true);
    });

    it('should allow overriding scope_type to window', async () => {
      mockClient.request.mockResolvedValue({
        enqueued: true,
        job_id: 'job_w',
        pipeline: null,
      });

      await agent.triggerScopedFacts({
        scope_id: 'win_1',
        scope_type: 'window',
        pipeline: 'custom',
      });

      const call = mockClient.request.mock.calls[0][0];
      expect(call.body.scope_type).toBe('window');
      expect(call.body.pipeline).toBe('custom');
    });
  });

  // ==================== Error handling ====================

  describe('error handling', () => {
    it('should reject with auth error from request', async () => {
      mockClient.request.mockRejectedValue(
        new Error('Authentication failed')
      );

      await expect(
        agent.createSession({ name: 'fail' })
      ).rejects.toThrow('Authentication failed');
    });

    it('should reject with not-found error from request', async () => {
      mockClient.request.mockRejectedValue(
        new Error('Resource not found')
      );

      await expect(
        agent.getSession('sess_nonexistent')
      ).rejects.toThrow('Resource not found');
    });

    it('should throw for path-traversal session IDs', async () => {
      await expect(agent.getSession('../etc/passwd')).rejects.toThrow();
      await expect(agent.endSession('sess/../../bad')).rejects.toThrow();
      await expect(
        agent.addSessionMemory('a\\b', { content: 'x' })
      ).rejects.toThrow();
    });

    it('should propagate network errors on getContext', async () => {
      mockClient.request.mockRejectedValue(new Error('Network request failed'));

      await expect(
        agent.getContext({ sessionId: 'sess_123', query: 'test' })
      ).rejects.toThrow('Network request failed');
    });

    it('should propagate rate-limit errors on pipeline ops', async () => {
      mockClient.request.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(agent.getDefaultPipeline()).rejects.toThrow('Rate limit exceeded');
    });

    it('should propagate server errors on summarizeSession', async () => {
      mockClient.request.mockRejectedValue(new Error('Internal server error'));

      await expect(
        agent.summarizeSession('sess_123')
      ).rejects.toThrow('Internal server error');
    });
  });
});
