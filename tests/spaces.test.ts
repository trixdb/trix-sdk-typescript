/**
 * Tests for Spaces resource
 */

import { Trix } from '../src/client';
import type { Space, CreateSpaceParams, UpdateSpaceParams } from '../src/types';

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

describe('Spaces Resource', () => {
  const mockSpace: Space = {
    id: 'space_123',
    name: 'Test Space',
    slug: 'test-space',
    description: 'A test space',
    metadata: { key: 'value' },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  describe('slug field', () => {
    it('should include slug in created space', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const space = await client.spaces.create({
        name: 'Test Space',
      });

      expect(space.slug).toBe('test-space');
      expect(space.id).toBe('space_123');
      expect(space.name).toBe('Test Space');
    });

    it('should accept custom slug on create', async () => {
      const customSlugSpace = { ...mockSpace, slug: 'custom-slug' };
      const mockFetch = createMockFetch({ status: 200, body: customSlugSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const params: CreateSpaceParams = {
        name: 'Test Space',
        slug: 'custom-slug',
        description: 'A test space',
      };

      await client.spaces.create(params);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.slug).toBe('custom-slug');
    });

    it('should update slug', async () => {
      const updatedSpace = { ...mockSpace, slug: 'updated-slug' };
      const mockFetch = createMockFetch({ status: 200, body: updatedSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const params: UpdateSpaceParams = {
        slug: 'updated-slug',
      };

      const space = await client.spaces.update('space_123', params);

      expect(space.slug).toBe('updated-slug');
      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.slug).toBe('updated-slug');
    });
  });

  describe('getBySlug', () => {
    it('should get space by slug', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const space = await client.spaces.getBySlug('test-space');

      expect(space.id).toBe('space_123');
      expect(space.slug).toBe('test-space');
      expect(space.name).toBe('Test Space');
    });

    it('should call correct endpoint with encoded slug', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.getBySlug('my-test-space');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/spaces/my-test-space');
    });

    it('should encode special characters in slug', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.getBySlug('test space');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/spaces/test%20space');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.getBySlug('test-space');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });

    it('should throw error for empty slug', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.spaces.getBySlug('')).rejects.toThrow('Slug must be a non-empty string');
    });

    it('should handle 404 errors for non-existent slug', async () => {
      const mockFetch = createMockFetch({
        status: 404,
        ok: false,
        body: { message: 'Space not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.spaces.getBySlug('non-existent')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new space', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const space = await client.spaces.create({
        name: 'Test Space',
        description: 'A test space',
      });

      expect(space.id).toBe('space_123');
      expect(space.name).toBe('Test Space');
      expect(space.slug).toBe('test-space');
    });

    it('should use POST method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.create({ name: 'Test Space' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
    });

    it('should call /spaces endpoint', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.create({ name: 'Test Space' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/spaces');
    });
  });

  describe('list', () => {
    it('should list spaces', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: [mockSpace],
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const spaces = await client.spaces.list();

      expect(spaces).toHaveLength(1);
      expect(spaces[0].id).toBe('space_123');
      expect(spaces[0].slug).toBe('test-space');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: [],
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.list();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });
  });

  describe('get', () => {
    it('should get a space by ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const space = await client.spaces.get('space_123');

      expect(space.id).toBe('space_123');
      expect(space.slug).toBe('test-space');
      expect(space.name).toBe('Test Space');
    });

    it('should validate space ID', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.spaces.get('')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a space', async () => {
      const updatedSpace = { ...mockSpace, name: 'Updated Space' };
      const mockFetch = createMockFetch({ status: 200, body: updatedSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const space = await client.spaces.update('space_123', {
        name: 'Updated Space',
      });

      expect(space.name).toBe('Updated Space');
    });

    it('should use PATCH method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.update('space_123', { name: 'Updated' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PATCH');
    });
  });

  describe('delete', () => {
    it('should delete a space', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.spaces.delete('space_123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/spaces/space_123');
      expect(options.method).toBe('DELETE');
    });

    it('should validate space ID', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.spaces.delete('')).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle 404 errors', async () => {
      const mockFetch = createMockFetch({
        status: 404,
        ok: false,
        body: { message: 'Space not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.spaces.get('space_invalid')).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      const mockFetch = createMockFetch({
        status: 422,
        ok: false,
        body: {
          message: 'Validation failed',
          errors: [{ field: 'slug', message: 'Slug already exists' }],
        },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.spaces.create({ name: 'Test', slug: 'existing-slug' })
      ).rejects.toThrow();
    });
  });
});
