/**
 * Tests for Personas resource
 */

import { Trix } from '../src/client';
import type {
  Persona,
  CreatePersonaParams,
  UpdatePersonaParams,
  AddPersonaSpaceParams,
  PersonaSpace,
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

describe('Personas Resource', () => {
  const mockPersona: Persona = {
    id: 'persona_123',
    name: 'Research',
    slug: 'research',
    purpose: 'Academic research assistant',
    system_prompt: 'You are a research assistant.',
    goals: [],
    settings: {},
    is_default: false,
    can_create_spaces: false,
    spaces: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockPersonaSpace: PersonaSpace = {
    space_id: 'space_456',
    role: 'member',
    can_create_memories: true,
    can_delete_memories: false,
    granted_at: '2026-01-01T00:00:00Z',
  };

  describe('create', () => {
    it('should create persona with minimal params', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const persona = await client.personas.create({ name: 'Research' });

      expect(persona.id).toBe('persona_123');
      expect(persona.name).toBe('Research');
      expect(persona.slug).toBe('research');
    });

    it('should create persona with all params', async () => {
      const fullPersona: Persona = {
        ...mockPersona,
        goals: [{ text: 'Learn fast', status: 'pending', priority: 1 }],
        settings: { theme: 'dark' },
      };
      const mockFetch = createMockFetch({ status: 200, body: fullPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });
      const params: CreatePersonaParams = {
        name: 'Research',
        slug: 'research',
        purpose: 'Academic research assistant',
        system_prompt: 'You are a research assistant.',
        goals: [{ text: 'Learn fast', status: 'pending', priority: 1 }],
        settings: { theme: 'dark' },
      };

      const persona = await client.personas.create(params);

      expect(persona.name).toBe('Research');
      expect(persona.goals).toHaveLength(1);
      expect(persona.settings).toEqual({ theme: 'dark' });
    });

    it('should send POST to /agents with body', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.create({
        name: 'Research',
        slug: 'research',
        purpose: 'Academic research assistant',
      });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.name).toBe('Research');
      expect(body.slug).toBe('research');
      expect(body.purpose).toBe('Academic research assistant');
    });
  });

  describe('list', () => {
    it('should list personas and extract data array', async () => {
      const mockFetch = createMockFetch({
        status: 200,
        body: { agents: [mockPersona] },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const personas = await client.personas.list();

      expect(personas).toHaveLength(1);
      expect(personas[0].id).toBe('persona_123');
      expect(personas[0].name).toBe('Research');
    });

    it('should return empty array when no personas', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { agents: [] } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const personas = await client.personas.list();

      expect(personas).toHaveLength(0);
    });

    it('should call GET /agents', async () => {
      const mockFetch = createMockFetch({ status: 200, body: { agents: [] } });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.list();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents');
      expect(options.method).toBe('GET');
    });
  });

  describe('get', () => {
    it('should get persona by id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const persona = await client.personas.get('persona_123');

      expect(persona.id).toBe('persona_123');
      expect(persona.name).toBe('Research');
      expect(persona.slug).toBe('research');
    });

    it('should call GET /agents/:id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.get('persona_123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents/persona_123');
      expect(options.method).toBe('GET');
    });

    it('should throw on empty id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.get('')).rejects.toThrow();
    });

    it('should throw on path traversal id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.get('../etc/passwd')).rejects.toThrow();
    });
  });

  describe('getBySlug', () => {
    it('should get persona by slug', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const persona = await client.personas.getBySlug('research');

      expect(persona.id).toBe('persona_123');
      expect(persona.slug).toBe('research');
    });

    it('should encode special characters in slug', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.getBySlug('my research');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents/my%20research');
    });

    it('should use GET method', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.getBySlug('research');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
    });

    it('should throw on empty slug', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.getBySlug('')).rejects.toThrow(
        'Slug must be a non-empty string'
      );
    });

    it('should handle 404 for non-existent slug', async () => {
      const mockFetch = createMockFetch({
        status: 404, ok: false, body: { message: 'Persona not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.getBySlug('non-existent')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update persona fields', async () => {
      const updatedPersona = { ...mockPersona, name: 'Updated Research' };
      const mockFetch = createMockFetch({ status: 200, body: updatedPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const persona = await client.personas.update('persona_123', {
        name: 'Updated Research',
      });

      expect(persona.name).toBe('Updated Research');
    });

    it('should send PATCH to /agents/:id with body', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });
      const params: UpdatePersonaParams = {
        name: 'Updated',
        purpose: 'New purpose',
        system_prompt: 'New prompt',
      };

      await client.personas.update('persona_123', params);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents/persona_123');
      expect(options.method).toBe('PATCH');
      const body = JSON.parse(options.body);
      expect(body.name).toBe('Updated');
      expect(body.purpose).toBe('New purpose');
      expect(body.system_prompt).toBe('New prompt');
    });

    it('should throw on invalid id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.personas.update('', { name: 'Updated' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should send DELETE to /agents/:id', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.delete('persona_123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents/persona_123');
      expect(options.method).toBe('DELETE');
    });

    it('should throw on invalid id', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.delete('')).rejects.toThrow();
    });

    it('should throw on path traversal id', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.delete('../hack')).rejects.toThrow();
    });
  });

  describe('addSpace', () => {
    it('should add space with default role', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersonaSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const result = await client.personas.addSpace('persona_123', {
        space_id: 'space_456',
      });

      expect(result.space_id).toBe('space_456');
      expect(result.role).toBe('member');
    });

    it('should add space with admin role and permissions', async () => {
      const adminSpace: PersonaSpace = { ...mockPersonaSpace, role: 'admin' };
      const mockFetch = createMockFetch({ status: 200, body: adminSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });
      const params: AddPersonaSpaceParams = {
        space_id: 'space_456',
        role: 'admin',
        can_create_memories: true,
        can_delete_memories: true,
      };

      const result = await client.personas.addSpace('persona_123', params);

      expect(result.role).toBe('admin');
    });

    it('should send POST to /agents/:id/spaces with body', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersonaSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.addSpace('persona_123', {
        space_id: 'space_456',
        role: 'admin',
      });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents/persona_123/spaces');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.space_id).toBe('space_456');
      expect(body.role).toBe('admin');
    });

    it('should throw on invalid persona id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersonaSpace });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.personas.addSpace('', { space_id: 'space_456' })
      ).rejects.toThrow();
    });
  });

  describe('removeSpace', () => {
    it('should send DELETE to /agents/:id/spaces/:spaceId', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.removeSpace('persona_123', 'space_456');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents/persona_123/spaces/space_456');
      expect(options.method).toBe('DELETE');
    });

    it('should throw on invalid persona id', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.personas.removeSpace('', 'space_456')
      ).rejects.toThrow();
    });

    it('should throw on invalid space id', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.personas.removeSpace('persona_123', '')
      ).rejects.toThrow();
    });

    it('should validate both ids for path traversal', async () => {
      const mockFetch = createMockFetch({ status: 204, body: {} });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(
        client.personas.removeSpace('../hack', 'space_456')
      ).rejects.toThrow();
      await expect(
        client.personas.removeSpace('persona_123', '../hack')
      ).rejects.toThrow();
    });
  });

  describe('getSpaces', () => {
    it('should return spaces from get response', async () => {
      const personaWithSpaces = { ...mockPersona, spaces: [mockPersonaSpace] };
      const mockFetch = createMockFetch({ status: 200, body: personaWithSpaces });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const spaces = await client.personas.getSpaces('persona_123');

      expect(spaces).toHaveLength(1);
      expect(spaces[0].space_id).toBe('space_456');
      expect(spaces[0].role).toBe('member');
    });

    it('should return empty array when no spaces', async () => {
      const personaNoSpaces = { ...mockPersona, spaces: undefined };
      const mockFetch = createMockFetch({ status: 200, body: personaNoSpaces });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      const spaces = await client.personas.getSpaces('persona_123');

      expect(spaces).toEqual([]);
    });

    it('should call GET /agents/:id internally', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await client.personas.getSpaces('persona_123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/agents/persona_123');
      expect(options.method).toBe('GET');
    });

    it('should throw on invalid persona id', async () => {
      const mockFetch = createMockFetch({ status: 200, body: mockPersona });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.getSpaces('')).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle 404 errors', async () => {
      const mockFetch = createMockFetch({
        status: 404, ok: false, body: { message: 'Persona not found' },
      });
      const client = new Trix({ apiKey: 'test_key', fetch: mockFetch });

      await expect(client.personas.get('persona_invalid')).rejects.toThrow();
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
        client.personas.create({ name: 'Test', slug: 'existing-slug' })
      ).rejects.toThrow();
    });
  });
});
