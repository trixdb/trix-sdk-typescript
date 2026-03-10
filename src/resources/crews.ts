/**
 * Crews resource for managing groups of bots.
 *
 * @example
 * ```typescript
 * const crew = await client.crews.create({
 *   name: 'Research Team',
 *   members: [
 *     { bot_id: 'bot-1', role: 'researcher' },
 *     { bot_id: 'bot-2', role: 'writer' },
 *   ],
 * });
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Crew,
  CreateCrewParams,
  UpdateCrewParams,
  ListCrewsParams,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Crews extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async list(params?: ListCrewsParams): Promise<Crew[]> {
    const result = await this.request<{ crews: Crew[] }>({
      method: 'GET',
      path: '/crews',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.crews;
  }

  async get(id: string): Promise<Crew> {
    validateId(id, 'crew');
    return this.request<Crew>({
      method: 'GET',
      path: `/crews/${id}`,
    });
  }

  async create(params: CreateCrewParams): Promise<Crew> {
    return this.request<Crew>({
      method: 'POST',
      path: '/crews',
      body: params,
    });
  }

  async update(id: string, params: UpdateCrewParams): Promise<Crew> {
    validateId(id, 'crew');
    return this.request<Crew>({
      method: 'PATCH',
      path: `/crews/${id}`,
      body: params,
    });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'crew');
    return this.request<void>({ method: 'DELETE', path: `/crews/${id}` });
  }
}
