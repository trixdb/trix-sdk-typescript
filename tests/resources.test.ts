import { Trix } from '../src/client';
import {
  Resource,
  CreateResourceParams,
  UpdateResourceParams,
  ListResourcesParams,
  LinkResourceParams,
  MemoryResource,
} from '../src/types';

// Helper to create mock fetch
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

describe('Resources', () => {
  const mockResource: Resource = {
    id: 'res_123456',
    name: 'My Project',
    type: 'project',
    description: 'Project description',
    metadata: { key: 'value' },
    createdAt: '2026-01-07T00:00:00Z',
    updatedAt: '2026-01-07T00:00:00Z',
  };

  describe('create', () => {
    it('should create a resource with name only', async () => {
      const mockFetch = createMockFetch({ status: 201, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.resources.create({ name: 'My Project' });

      expect(result.id).toBe('res_123456');
      expect(result.name).toBe('My Project');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should create a resource with all fields', async () => {
      const mockFetch = createMockFetch({ status: 201, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const params: CreateResourceParams = {
        name: 'My Project',
        type: 'project',
        description: 'Project description',
        metadata: { key: 'value' },
      };

      const result = await client.resources.create(params);

      expect(result.id).toBe('res_123456');
      expect(result.type).toBe('project');
      expect(result.description).toBe('Project description');
    });

    it('should send POST request to /resources', async () => {
      const mockFetch = createMockFetch({ status: 201, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.create({ name: 'Test' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/resources');
      expect(options.method).toBe('POST');
    });

    it('should include request body', async () => {
      const mockFetch = createMockFetch({ status: 201, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.create({
        name: 'Test Project',
        type: 'topic',
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.name).toBe('Test Project');
      expect(body.type).toBe('topic');
    });

    it('should throw error if name is missing', async () => {
      const mockFetch = createMockFetch({ status: 400, ok: false, body: { message: 'Name is required' } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.resources.create({} as any)).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list resources with default pagination', async () => {
      const listResponse = {
        data: [mockResource],
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      };
      const mockFetch = createMockFetch({ status: 200, body: listResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.resources.list();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('res_123456');
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by type', async () => {
      const listResponse = {
        data: [mockResource],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      };
      const mockFetch = createMockFetch({ status: 200, body: listResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.list({ type: 'project' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('type=project');
    });

    it('should support search query', async () => {
      const listResponse = {
        data: [mockResource],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      };
      const mockFetch = createMockFetch({ status: 200, body: listResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.list({ search: 'project' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('search=project');
    });

    it('should support sorting', async () => {
      const listResponse = {
        data: [mockResource],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      };
      const mockFetch = createMockFetch({ status: 200, body: listResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.list({ sort: 'name', order: 'asc' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('sort=name');
      expect(url).toContain('order=asc');
    });

    it('should support pagination parameters', async () => {
      const listResponse = {
        data: [mockResource],
        pagination: { total: 100, limit: 50, offset: 50, hasMore: false },
      };
      const mockFetch = createMockFetch({ status: 200, body: listResponse });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.list({ limit: 50, offset: 50 });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('limit=50');
      expect(url).toContain('offset=50');
    });
  });

  describe('get', () => {
    it('should get a resource by id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.resources.get('res_123456');

      expect(result.id).toBe('res_123456');
      expect(result.name).toBe('My Project');
    });

    it('should send GET request to /resources/:id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.get('res_123456');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/resources/res_123456');
      expect(options.method).toBe('GET');
    });

    it('should validate resource id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.resources.get('')).rejects.toThrow();
      await expect(client.resources.get('../invalid')).rejects.toThrow();
    });

    it('should throw NotFoundError for non-existent resource', async () => {
      const mockFetch = createMockFetch({
        status: 404,
        ok: false,
        body: { message: 'Resource not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.resources.get('nonexistent')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      const updatedResource = { ...mockResource, name: 'Updated Name' };
      const mockFetch = createMockFetch({ status: 200, body: updatedResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.resources.update('res_123456', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should send PATCH request to /resources/:id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.update('res_123456', { name: 'Updated' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/resources/res_123456');
      expect(options.method).toBe('PATCH');
    });

    it('should include update fields in body', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.update('res_123456', {
        name: 'New Name',
        description: 'New description',
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.name).toBe('New Name');
      expect(body.description).toBe('New description');
    });

    it('should validate resource id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockResource });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.resources.update('', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a resource', async () => {
      const mockFetch = createMockFetch({ status: 204, body: null });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.delete('res_123456');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should send DELETE request to /resources/:id', async () => {
      const mockFetch = createMockFetch({ status: 204, body: null });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.delete('res_123456');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/resources/res_123456');
      expect(options.method).toBe('DELETE');
    });

    it('should validate resource id', async () => {
      const mockFetch = createMockFetch({ status: 204, body: null });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.resources.delete('')).rejects.toThrow();
    });

    it('should throw NotFoundError for non-existent resource', async () => {
      const mockFetch = createMockFetch({
        status: 404,
        ok: false,
        body: { message: 'Resource not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.resources.delete('nonexistent')).rejects.toThrow();
    });
  });

  describe('getMemories', () => {
    it('should get memories linked to a resource', async () => {
      const memoryWithLink = {
        id: 'mem_123',
        content: 'Test memory',
        relationshipType: 'related',
        linkedAt: '2026-01-07T00:00:00Z',
      };
      const response = {
        resourceId: 'res_123456',
        data: [memoryWithLink],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      };
      const mockFetch = createMockFetch({ status: 200, body: response });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.resources.getMemories('res_123456');

      expect(result.resourceId).toBe('res_123456');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('mem_123');
    });

    it('should send GET request to /resources/:id/memories', async () => {
      const response = {
        resourceId: 'res_123456',
        data: [],
        pagination: { total: 0, limit: 20, offset: 0, hasMore: false },
      };
      const mockFetch = createMockFetch({ status: 200, body: response });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.getMemories('res_123456');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/resources/res_123456/memories');
      expect(options.method).toBe('GET');
    });

    it('should support pagination', async () => {
      const response = {
        resourceId: 'res_123456',
        data: [],
        pagination: { total: 0, limit: 50, offset: 100, hasMore: false },
      };
      const mockFetch = createMockFetch({ status: 200, body: response });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.resources.getMemories('res_123456', {
        limit: 50,
        offset: 100,
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('limit=50');
      expect(url).toContain('offset=100');
    });

    it('should validate resource id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.resources.getMemories('')).rejects.toThrow();
    });
  });

  describe('Memory resource linking methods', () => {
    const mockLinkResponse = {
      linked: true,
      memoryId: 'mem_123',
      resourceId: 'res_456',
      relationshipType: 'related',
    };

    describe('linkResource', () => {
      it('should link a resource to a memory', async () => {
        const mockFetch = createMockFetch({
          status: 200,
          body: mockLinkResponse,
        });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        const result = await client.memories.linkResource('mem_123', {
          resourceId: 'res_456',
        });

        expect(result.linked).toBe(true);
        expect(result.memoryId).toBe('mem_123');
        expect(result.resourceId).toBe('res_456');
      });

      it('should send POST request to /memories/:id/resources', async () => {
        const mockFetch = createMockFetch({
          status: 200,
          body: mockLinkResponse,
        });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        await client.memories.linkResource('mem_123', {
          resourceId: 'res_456',
        });

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/memories/mem_123/resources');
        expect(options.method).toBe('POST');
      });

      it('should support relationship type', async () => {
        const mockFetch = createMockFetch({
          status: 200,
          body: { ...mockLinkResponse, relationshipType: 'primary' },
        });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        await client.memories.linkResource('mem_123', {
          resourceId: 'res_456',
          relationshipType: 'primary',
        });

        const [, options] = mockFetch.mock.calls[0];
        const body = JSON.parse(options.body);
        expect(body.relationship_type).toBe('primary');
      });

      it('should validate memory and resource ids', async () => {
        const mockFetch = createMockFetch({
          status: 200,
          body: mockLinkResponse,
        });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        await expect(
          client.memories.linkResource('', { resourceId: 'res_456' })
        ).rejects.toThrow();

        await expect(
          client.memories.linkResource('mem_123', { resourceId: '' })
        ).rejects.toThrow();
      });
    });

    describe('getResources', () => {
      it('should get resources linked to a memory', async () => {
        const response = {
          memoryId: 'mem_123',
          data: [
            {
              ...mockResource,
              relationshipType: 'related',
              linkedAt: '2026-01-07T00:00:00Z',
            },
          ],
        };
        const mockFetch = createMockFetch({ status: 200, body: response });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        const result = await client.memories.getResources('mem_123');

        expect(result.memoryId).toBe('mem_123');
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe('res_123456');
      });

      it('should send GET request to /memories/:id/resources', async () => {
        const response = { memoryId: 'mem_123', data: [] };
        const mockFetch = createMockFetch({ status: 200, body: response });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        await client.memories.getResources('mem_123');

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/memories/mem_123/resources');
        expect(options.method).toBe('GET');
      });

      it('should validate memory id', async () => {
        const mockFetch = createMockFetch({ status: 200, body: {} });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        await expect(client.memories.getResources('')).rejects.toThrow();
      });
    });

    describe('unlinkResource', () => {
      it('should unlink a resource from a memory', async () => {
        const response = {
          unlinked: true,
          memoryId: 'mem_123',
          resourceId: 'res_456',
        };
        const mockFetch = createMockFetch({ status: 200, body: response });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        const result = await client.memories.unlinkResource(
          'mem_123',
          'res_456'
        );

        expect(result.unlinked).toBe(true);
      });

      it('should send DELETE request to /memories/:id/resources/:resourceId', async () => {
        const response = {
          unlinked: true,
          memoryId: 'mem_123',
          resourceId: 'res_456',
        };
        const mockFetch = createMockFetch({ status: 200, body: response });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        await client.memories.unlinkResource('mem_123', 'res_456');

        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/memories/mem_123/resources/res_456');
        expect(options.method).toBe('DELETE');
      });

      it('should validate memory and resource ids', async () => {
        const mockFetch = createMockFetch({ status: 200, body: {} });
        const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

        await expect(
          client.memories.unlinkResource('', 'res_456')
        ).rejects.toThrow();

        await expect(
          client.memories.unlinkResource('mem_123', '')
        ).rejects.toThrow();
      });
    });
  });
});
