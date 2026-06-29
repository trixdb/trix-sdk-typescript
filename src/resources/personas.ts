/**
 * Personas resource
 */

import type { Trix } from '../client.js';
import type {
  Persona,
  CreatePersonaParams,
  UpdatePersonaParams,
  AddPersonaSpaceParams,
  PersonaSpace,
} from '../types.js';
import { BaseResource } from './base.js';
import { validateId } from '../utils/security.js';

export class Personas extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async create(params: CreatePersonaParams): Promise<Persona> {
    return this.request<Persona>({ method: 'POST', path: '/agents', body: params });
  }

  async list(): Promise<Persona[]> {
    // Personas were merged into agents (API personas surface is 410 Gone); the
    // agents list endpoint returns its rows under the `agents` key.
    const result = await this.request<{ agents: Persona[] }>({ method: 'GET', path: '/agents' });
    return result.agents;
  }

  async get(id: string): Promise<Persona> {
    validateId(id, 'persona');
    return this.request<Persona>({ method: 'GET', path: `/agents/${id}` });
  }

  async getBySlug(slug: string): Promise<Persona> {
    if (!slug || typeof slug !== 'string') throw new Error('Slug must be a non-empty string');
    return this.request<Persona>({ method: 'GET', path: `/agents/${encodeURIComponent(slug)}` });
  }

  async update(id: string, params: UpdatePersonaParams): Promise<Persona> {
    validateId(id, 'persona');
    return this.request<Persona>({ method: 'PATCH', path: `/agents/${id}`, body: params });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'persona');
    return this.request<void>({ method: 'DELETE', path: `/agents/${id}` });
  }

  async addSpace(personaId: string, params: AddPersonaSpaceParams): Promise<PersonaSpace> {
    validateId(personaId, 'persona');
    return this.request<PersonaSpace>({
      method: 'POST',
      path: `/agents/${personaId}/spaces`,
      body: params,
    });
  }

  async removeSpace(personaId: string, spaceId: string): Promise<void> {
    validateId(personaId, 'persona');
    validateId(spaceId, 'space');
    return this.request<void>({
      method: 'DELETE',
      path: `/agents/${personaId}/spaces/${spaceId}`,
    });
  }

  async getSpaces(personaId: string): Promise<PersonaSpace[]> {
    validateId(personaId, 'persona');
    const persona = await this.get(personaId);
    return persona.spaces || [];
  }
}
