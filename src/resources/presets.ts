/**
 * Agent Presets resource for managing execution configurations.
 *
 * @example
 * ```typescript
 * const preset = await client.presets.create({
 *   name: 'Fast Research',
 *   provider: 'openai',
 *   model: 'gpt-4.1',
 * });
 *
 * const all = await client.presets.list();
 * ```
 */

import type { Trix } from '../client.js';
import type {
  AgentPreset,
  CreatePresetParams,
  UpdatePresetParams,
  ListPresetsParams,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Presets extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async list(params?: ListPresetsParams): Promise<AgentPreset[]> {
    const result = await this.request<{ presets: AgentPreset[] }>({
      method: 'GET',
      path: '/agent-presets',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.presets;
  }

  async get(idOrSlug: string): Promise<AgentPreset> {
    const result = await this.request<{ preset: AgentPreset }>({
      method: 'GET',
      path: `/agent-presets/${encodeURIComponent(idOrSlug)}`,
    });
    return result.preset;
  }

  async create(params: CreatePresetParams): Promise<AgentPreset> {
    const result = await this.request<{ preset: AgentPreset }>({
      method: 'POST',
      path: '/agent-presets',
      body: params,
    });
    return result.preset;
  }

  async update(id: string, params: UpdatePresetParams): Promise<AgentPreset> {
    validateId(id, 'preset');
    const result = await this.request<{ preset: AgentPreset }>({
      method: 'PATCH',
      path: `/agent-presets/${id}`,
      body: params,
    });
    return result.preset;
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'preset');
    return this.request<void>({ method: 'DELETE', path: `/agent-presets/${id}` });
  }
}
