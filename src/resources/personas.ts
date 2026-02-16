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
    return this.request<Persona>({ method: 'POST', path: '/personas', body: params });
  }

  async list(): Promise<Persona[]> {
    const result = await this.request<{ data: Persona[] }>({ method: 'GET', path: '/personas' });
    return result.data;
  }

  async get(id: string): Promise<Persona> {
    validateId(id, 'persona');
    return this.request<Persona>({ method: 'GET', path: `/personas/${id}` });
  }

  async getBySlug(slug: string): Promise<Persona> {
    if (!slug || typeof slug !== 'string') throw new Error('Slug must be a non-empty string');
    return this.request<Persona>({ method: 'GET', path: `/personas/${encodeURIComponent(slug)}` });
  }

  async update(id: string, params: UpdatePersonaParams): Promise<Persona> {
    validateId(id, 'persona');
    return this.request<Persona>({ method: 'PATCH', path: `/personas/${id}`, body: params });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'persona');
    return this.request<void>({ method: 'DELETE', path: `/personas/${id}` });
  }

  async addSpace(personaId: string, params: AddPersonaSpaceParams): Promise<PersonaSpace> {
    validateId(personaId, 'persona');
    return this.request<PersonaSpace>({
      method: 'POST',
      path: `/personas/${personaId}/spaces`,
      body: params,
    });
  }

  async removeSpace(personaId: string, spaceId: string): Promise<void> {
    validateId(personaId, 'persona');
    validateId(spaceId, 'space');
    return this.request<void>({
      method: 'DELETE',
      path: `/personas/${personaId}/spaces/${spaceId}`,
    });
  }

  async getSpaces(personaId: string): Promise<PersonaSpace[]> {
    validateId(personaId, 'persona');
    const persona = await this.get(personaId);
    return persona.spaces || [];
  }
}
