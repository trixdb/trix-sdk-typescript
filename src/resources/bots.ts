/**
 * Bots resource for managing AI bots/agents.
 *
 * @example
 * ```typescript
 * const bot = await client.bots.create({
 *   name: 'Meeting Notes',
 *   system_prompt: 'You summarize meetings and extract action items.',
 * });
 *
 * const run = await client.bots.run(bot.id, { message: 'Summarize today' });
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Bot,
  BotRun,
  BotSpace,
  BotTrigger,
  CreateBotParams,
  UpdateBotParams,
  ListBotsParams,
  AddBotSpaceParams,
  CreateTriggerParams,
  UpdateTriggerParams,
  RunBotParams,
  ListRunsParams,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Bots extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async create(params: CreateBotParams): Promise<Bot> {
    return this.request<Bot>({ method: 'POST', path: '/bots', body: params });
  }

  async list(params?: ListBotsParams): Promise<Bot[]> {
    const result = await this.request<{ bots: Bot[] }>({
      method: 'GET',
      path: '/bots',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.bots;
  }

  async get(idOrSlug: string): Promise<Bot> {
    return this.request<Bot>({
      method: 'GET',
      path: `/bots/${encodeURIComponent(idOrSlug)}`,
    });
  }

  async update(id: string, params: UpdateBotParams): Promise<Bot> {
    validateId(id, 'bot');
    return this.request<Bot>({ method: 'PATCH', path: `/bots/${id}`, body: params });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'bot');
    return this.request<void>({ method: 'DELETE', path: `/bots/${id}` });
  }

  // Space access
  async addSpace(botId: string, params: AddBotSpaceParams): Promise<BotSpace> {
    validateId(botId, 'bot');
    return this.request<BotSpace>({
      method: 'POST',
      path: `/bots/${botId}/spaces`,
      body: params,
    });
  }

  async removeSpace(botId: string, spaceId: string): Promise<void> {
    validateId(botId, 'bot');
    validateId(spaceId, 'space');
    return this.request<void>({
      method: 'DELETE',
      path: `/bots/${botId}/spaces/${spaceId}`,
    });
  }

  // Triggers
  async addTrigger(botId: string, params: CreateTriggerParams): Promise<BotTrigger> {
    validateId(botId, 'bot');
    return this.request<BotTrigger>({
      method: 'POST',
      path: `/bots/${botId}/triggers`,
      body: params,
    });
  }

  async updateTrigger(
    botId: string,
    triggerId: string,
    params: UpdateTriggerParams,
  ): Promise<BotTrigger> {
    validateId(botId, 'bot');
    return this.request<BotTrigger>({
      method: 'PATCH',
      path: `/bots/${botId}/triggers/${triggerId}`,
      body: params,
    });
  }

  async removeTrigger(botId: string, triggerId: string): Promise<void> {
    validateId(botId, 'bot');
    return this.request<void>({
      method: 'DELETE',
      path: `/bots/${botId}/triggers/${triggerId}`,
    });
  }

  // Execution
  async run(botId: string, params?: RunBotParams): Promise<BotRun> {
    return this.request<BotRun>({
      method: 'POST',
      path: `/bots/${encodeURIComponent(botId)}/run`,
      body: params || {},
    });
  }

  async listRuns(botId: string, params?: ListRunsParams): Promise<BotRun[]> {
    const result = await this.request<{ runs: BotRun[] }>({
      method: 'GET',
      path: `/bots/${encodeURIComponent(botId)}/runs`,
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.runs;
  }

  async getRun(botId: string, runId: string): Promise<BotRun> {
    return this.request<BotRun>({
      method: 'GET',
      path: `/bots/${encodeURIComponent(botId)}/runs/${runId}`,
    });
  }
}
