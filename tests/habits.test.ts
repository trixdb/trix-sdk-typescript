/**
 * Habits Resource Tests (ADR-034)
 */

import { Trix } from '../src/client';

function createMockFetch(response: {
  status: number;
  body?: unknown;
  ok?: boolean;
}) {
  const defaultHeaders: Record<string, string> =
    response.body !== undefined ? { 'content-type': 'application/json' } : {};

  return jest.fn().mockResolvedValue({
    ok: response.ok ?? (response.status >= 200 && response.status < 300),
    status: response.status,
    statusText: response.status === 200 ? 'OK' : 'Error',
    headers: new Headers(defaultHeaders),
    json: jest.fn().mockResolvedValue(response.body ?? {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(response.body ?? {})),
  });
}

const MOCK_HABIT = {
  id: 'h-1',
  name: 'Meditate',
  habitType: 'boolean',
  frequency: 'daily',
  status: 'active',
  streak: { current: 5, longest: 12, lastCompletedDate: null },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Habits Resource', () => {
  describe('create', () => {
    it('should POST to /habits', async () => {
      const mockFetch = createMockFetch({ status: 201, body: MOCK_HABIT });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.habits.create({ name: 'Meditate', habitType: 'boolean' });

      expect(result.id).toBe('h-1');
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits');
      expect(options.method).toBe('POST');
    });

    it('should convert camelCase to snake_case in body', async () => {
      const mockFetch = createMockFetch({ status: 201, body: MOCK_HABIT });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.create({
        name: 'Water',
        habitType: 'numeric',
        targetValue: 8,
        targetUnit: 'glasses',
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.habit_type).toBe('numeric');
      expect(body.target_value).toBe(8);
      expect(body.target_unit).toBe('glasses');
    });
  });

  describe('list', () => {
    it('should GET /habits with query params', async () => {
      const listResult = { habits: [MOCK_HABIT], pagination: { total: 1 } };
      const mockFetch = createMockFetch({ status: 200, body: listResult });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.list({ status: 'active' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits');
      expect(url).toContain('status=active');
      expect(options.method).toBe('GET');
    });
  });

  describe('get', () => {
    it('should GET /habits/:id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: MOCK_HABIT });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.habits.get('h-1');

      expect(result.id).toBe('h-1');
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1');
      expect(options.method).toBe('GET');
    });

    it('should reject empty id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: MOCK_HABIT });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.habits.get('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should PATCH /habits/:id with snake_case body', async () => {
      const updated = { ...MOCK_HABIT, name: 'Evening Meditation' };
      const mockFetch = createMockFetch({ status: 200, body: updated });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.habits.update('h-1', { name: 'Evening Meditation', graceDays: 2 });

      expect(result.name).toBe('Evening Meditation');
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1');
      expect(options.method).toBe('PATCH');
      const body = JSON.parse(options.body);
      expect(body.grace_days).toBe(2);
    });
  });

  describe('delete', () => {
    it('should DELETE /habits/:id', async () => {
      const mockFetch = createMockFetch({ status: 204 });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.delete('h-1');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1');
      expect(options.method).toBe('DELETE');
    });
  });

  describe('checkIn', () => {
    it('should POST to /habits/:id/check-in', async () => {
      const checkInResult = {
        completion: { id: 'c-1', habitId: 'h-1', completedDate: '2026-02-24' },
        streak: { current: 6, longest: 12 },
      };
      const mockFetch = createMockFetch({ status: 200, body: checkInResult });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.checkIn('h-1', { value: 1 });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1/check-in');
      expect(options.method).toBe('POST');
    });

    it('should work without params (boolean check-in)', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { completion: {}, streak: {} } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.checkIn('h-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('uncheck', () => {
    it('should DELETE /habits/:id/check-in/:date', async () => {
      const mockFetch = createMockFetch({ status: 204 });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.uncheck('h-1', '2026-02-23');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1/check-in/2026-02-23');
      expect(options.method).toBe('DELETE');
    });
  });

  describe('history', () => {
    it('should GET /habits/:id/history', async () => {
      const historyResult = {
        completions: [{ id: 'c-1', completedDate: '2026-02-24' }],
        streak: { current: 5, longest: 12 },
      };
      const mockFetch = createMockFetch({ status: 200, body: historyResult });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.history('h-1', { limit: 10 });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1/history');
    });
  });

  describe('due', () => {
    it('should GET /habits/due', async () => {
      const dueResult = { habits: [MOCK_HABIT], date: '2026-02-24' };
      const mockFetch = createMockFetch({ status: 200, body: dueResult });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.due('2026-02-24');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/due');
      expect(url).toContain('date=2026-02-24');
    });

    it('should work without date param', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { habits: [], date: '2026-02-24' } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.habits.due();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/due');
      expect(url).not.toContain('date=');
    });
  });

  describe('pause', () => {
    it('should POST to /habits/:id/pause', async () => {
      const paused = { ...MOCK_HABIT, status: 'paused' };
      const mockFetch = createMockFetch({ status: 200, body: paused });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.habits.pause('h-1');

      expect(result.status).toBe('paused');
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1/pause');
      expect(options.method).toBe('POST');
    });
  });

  describe('resume', () => {
    it('should POST to /habits/:id/resume', async () => {
      const mockFetch = createMockFetch({ status: 200, body: MOCK_HABIT });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.habits.resume('h-1');

      expect(result.status).toBe('active');
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/habits/h-1/resume');
      expect(options.method).toBe('POST');
    });
  });
});
