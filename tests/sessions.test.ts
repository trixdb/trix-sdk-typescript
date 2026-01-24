/**
 * Tests for CLI Sessions resource
 */

import { Trix } from '../src/client';
import type {
  CLISession,
  CreateCLISessionParams,
  UpdateCLISessionParams,
  CompleteCLISessionParams,
  ListCLISessionsParams,
} from '../src/types';

// Mock fetch for testing
function createMockFetch(response: {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
  ok?: boolean;
}) {
  const defaultHeaders: Record<string, string> = response.body !== undefined
    ? { 'content-type': 'application/json' }
    : {};

  return jest.fn().mockResolvedValue({
    ok: response.ok ?? (response.status >= 200 && response.status < 300),
    status: response.status,
    statusText: response.status === 200 ? 'OK' : 'Error',
    headers: new Headers({ ...defaultHeaders, ...(response.headers ?? {}) }),
    json: jest.fn().mockResolvedValue(response.body ?? {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(response.body ?? {})),
  });
}

describe('CLI Sessions Resource', () => {
  const mockSession: CLISession = {
    id: 'session_123',
    accountId: 'acc_123',
    userId: 'user_123',
    createdBy: 'user_123',
    name: 'Test Session',
    description: 'A test session',
    type: 'conversation',
    status: 'active',
    spaceId: 'space_123',
    originType: 'cli',
    tags: ['test', 'demo'],
    retentionPolicy: 'permanent',
    retentionDays: undefined,
    summary: undefined,
    isPrivate: false,
    messageCount: 5,
    memoryCount: 10,
    metadata: { key: 'value' },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    lastActiveAt: '2025-01-01T00:00:00Z',
    pausedAt: undefined,
    completedAt: undefined,
    archivedAt: undefined,
  };

  describe('create', () => {
    it('should create a new session', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const session = await client.sessions.create({
        name: 'Test Session',
        description: 'A test session',
      });

      expect(session.id).toBe('session_123');
      expect(session.name).toBe('Test Session');
      expect(session.status).toBe('active');
    });

    it('should send correct request body', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const params: CreateCLISessionParams = {
        name: 'Test Session',
        description: 'A test session',
        type: 'project',
        spaceId: 'space_123',
        tags: ['test'],
        retentionPolicy: 'permanent',
        isPrivate: false,
        metadata: { key: 'value' },
      };

      await client.sessions.create(params);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.name).toBe('Test Session');
      expect(body.description).toBe('A test session');
      expect(body.type).toBe('project');
      expect(body.spaceId).toBe('space_123');
      expect(body.tags).toEqual(['test']);
      expect(body.retentionPolicy).toBe('permanent');
      expect(body.isPrivate).toBe(false);
      expect(body.metadata).toEqual({ key: 'value' });
    });

    it('should use POST method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.create({ name: 'Test Session' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
    });

    it('should call /cli-sessions endpoint', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.create({ name: 'Test Session' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions');
    });
  });

  describe('list', () => {
    it('should list sessions', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [mockSession],
          pagination: { total: 1, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.sessions.list();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('session_123');
      expect(result.pagination.total).toBe(1);
    });

    it('should pass query parameters', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 1, limit: 50, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const params: ListCLISessionsParams = {
        status: 'active',
        type: 'project',
        spaceId: 'space_123',
        tags: ['test'],
        search: 'query',
        limit: 50,
        page: 2,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      await client.sessions.list(params);

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('status=active');
      expect(url).toContain('type=project');
      expect(url).toContain('spaceId=space_123');
      expect(url).toContain('tags=test');
      expect(url).toContain('search=query');
      expect(url).toContain('limit=50');
      expect(url).toContain('page=2');
      expect(url).toContain('sortBy=createdAt');
      expect(url).toContain('sortOrder=desc');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.list();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });
  });

  describe('getActive', () => {
    it('should get active sessions', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [mockSession],
          pagination: { total: 1, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.sessions.getActive();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('active');
    });

    it('should call /cli-sessions/active endpoint', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.getActive();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions/active');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.getActive();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });
  });

  describe('get', () => {
    it('should get a session by ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const session = await client.sessions.get('session_123');

      expect(session.id).toBe('session_123');
      expect(session.name).toBe('Test Session');
    });

    it('should call correct endpoint', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.get('session_123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions/session_123');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.get('session_123');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });

    it('should validate session ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.get('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a session', async () => {
      const updatedSession = { ...mockSession, name: 'Updated Session' };
      const mockFetch = createMockFetch({ status: 200, body: updatedSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const session = await client.sessions.update('session_123', {
        name: 'Updated Session',
      });

      expect(session.name).toBe('Updated Session');
    });

    it('should send correct request body', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const params: UpdateCLISessionParams = {
        name: 'Updated Session',
        description: 'Updated description',
        tags: ['updated'],
        retentionPolicy: 'auto_delete',
        retentionDays: 30,
        isPrivate: true,
        metadata: { updated: true },
      };

      await client.sessions.update('session_123', params);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.name).toBe('Updated Session');
      expect(body.description).toBe('Updated description');
      expect(body.tags).toEqual(['updated']);
      expect(body.retentionPolicy).toBe('auto_delete');
      expect(body.retentionDays).toBe(30);
      expect(body.isPrivate).toBe(true);
      expect(body.metadata).toEqual({ updated: true });
    });

    it('should use PATCH method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.update('session_123', { name: 'Updated' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PATCH');
    });

    it('should validate session ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.update('', { name: 'Updated' })).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a session', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.delete('session_123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions/session_123');
      expect(options.method).toBe('DELETE');
    });

    it('should use DELETE method', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.delete('session_123');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('DELETE');
    });

    it('should validate session ID', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.delete('')).rejects.toThrow();
    });
  });

  describe('pause', () => {
    it('should pause a session', async () => {
      const pausedSession = {
        ...mockSession,
        status: 'paused',
        pausedAt: '2025-01-01T01:00:00Z',
      };
      const mockFetch = createMockFetch({ status: 200, body: pausedSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const session = await client.sessions.pause('session_123');

      expect(session.status).toBe('paused');
      expect(session.pausedAt).toBeDefined();
    });

    it('should call /cli-sessions/:id/pause endpoint', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.pause('session_123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions/session_123/pause');
    });

    it('should use POST method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.pause('session_123');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
    });

    it('should validate session ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.pause('')).rejects.toThrow();
    });
  });

  describe('resume', () => {
    it('should resume a session', async () => {
      const resumedSession = {
        ...mockSession,
        status: 'active',
        pausedAt: undefined,
      };
      const mockFetch = createMockFetch({ status: 200, body: resumedSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const session = await client.sessions.resume('session_123');

      expect(session.status).toBe('active');
    });

    it('should call /cli-sessions/:id/resume endpoint', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.resume('session_123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions/session_123/resume');
    });

    it('should use POST method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.resume('session_123');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
    });

    it('should validate session ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.resume('')).rejects.toThrow();
    });
  });

  describe('complete', () => {
    it('should complete a session', async () => {
      const completedSession = {
        ...mockSession,
        status: 'completed',
        completedAt: '2025-01-01T02:00:00Z',
        summary: 'Session completed successfully',
      };
      const mockFetch = createMockFetch({ status: 200, body: completedSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const session = await client.sessions.complete('session_123', {
        summary: 'Session completed successfully',
      });

      expect(session.status).toBe('completed');
      expect(session.completedAt).toBeDefined();
      expect(session.summary).toBe('Session completed successfully');
    });

    it('should complete without summary', async () => {
      const completedSession = {
        ...mockSession,
        status: 'completed',
        completedAt: '2025-01-01T02:00:00Z',
      };
      const mockFetch = createMockFetch({ status: 200, body: completedSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const session = await client.sessions.complete('session_123');

      expect(session.status).toBe('completed');
    });

    it('should send correct request body with summary', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const params: CompleteCLISessionParams = {
        summary: 'Session summary',
      };

      await client.sessions.complete('session_123', params);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.summary).toBe('Session summary');
    });

    it('should call /cli-sessions/:id/complete endpoint', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.complete('session_123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions/session_123/complete');
    });

    it('should use POST method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.complete('session_123');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
    });

    it('should validate session ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSession });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.complete('')).rejects.toThrow();
    });
  });

  describe('getMemories', () => {
    it('should get session memories', async () => {
      const mockMemories = {
        data: [
          {
            id: 'mem_1',
            spaceId: 'space_123',
            type: 'text',
            content: 'Memory 1',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 'mem_2',
            spaceId: 'space_123',
            type: 'text',
            content: 'Memory 2',
            createdAt: '2025-01-01T00:01:00Z',
            updatedAt: '2025-01-01T00:01:00Z',
          },
        ],
        pagination: { total: 2, page: 1, limit: 100, hasMore: false },
      };

      const mockFetch = createMockFetch({ status: 200, body: mockMemories });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.sessions.getMemories('session_123');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('mem_1');
      expect(result.data[1].id).toBe('mem_2');
    });

    it('should call /cli-sessions/:id/memories endpoint', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.getMemories('session_123');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/cli-sessions/session_123/memories');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.getMemories('session_123');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });

    it('should validate session ID', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 1, limit: 100, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.getMemories('')).rejects.toThrow();
    });

    it('should pass pagination parameters', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: {
          data: [],
          pagination: { total: 0, page: 2, limit: 50, hasMore: false },
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.sessions.getMemories('session_123', { limit: 50, page: 2 });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('limit=50');
      expect(url).toContain('page=2');
    });
  });

  describe('error handling', () => {
    it('should handle 404 errors', async () => {
      const mockFetch = createMockFetch({
        status: 404,
        ok: false,
        body: { message: 'Session not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.sessions.get('invalid_id')).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      const mockFetch = createMockFetch({
        status: 422,
        ok: false,
        body: {
          message: 'Validation failed',
          errors: [{ field: 'name', message: 'Required' }],
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.sessions.create({ name: '' })
      ).rejects.toThrow();
    });
  });
});
