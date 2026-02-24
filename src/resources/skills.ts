/**
 * Skills resource for managing reusable instruction packages.
 *
 * @example
 * ```typescript
 * const skill = await client.skills.create({
 *   name: 'code-review',
 *   description: 'Review code for best practices and bugs.',
 *   content: '# Code Review\n\n## Instructions\n...',
 * });
 *
 * await client.skills.attachToBot(skill.id, { bot_id: 'bot-uuid' });
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Skill,
  CreateSkillParams,
  UpdateSkillParams,
  ListSkillsParams,
  MarketplaceSearchParams,
  AttachSkillParams,
  UpdateBotSkillParams,
  BotSkillAttachment,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Skills extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async create(params: CreateSkillParams): Promise<Skill> {
    return this.request<Skill>({ method: 'POST', path: '/skills', body: params });
  }

  async list(params?: ListSkillsParams): Promise<Skill[]> {
    const result = await this.request<{ skills: Skill[] }>({
      method: 'GET',
      path: '/skills',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.skills;
  }

  async get(idOrSlug: string): Promise<Skill> {
    return this.request<Skill>({
      method: 'GET',
      path: `/skills/${encodeURIComponent(idOrSlug)}`,
    });
  }

  async update(id: string, params: UpdateSkillParams): Promise<Skill> {
    validateId(id, 'skill');
    return this.request<Skill>({ method: 'PATCH', path: `/skills/${id}`, body: params });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'skill');
    return this.request<void>({ method: 'DELETE', path: `/skills/${id}` });
  }

  async publish(id: string): Promise<Skill> {
    validateId(id, 'skill');
    return this.request<Skill>({ method: 'POST', path: `/skills/${id}/publish` });
  }

  async install(id: string): Promise<Skill> {
    validateId(id, 'skill');
    return this.request<Skill>({ method: 'POST', path: `/skills/${id}/install` });
  }

  // Marketplace
  async marketplace(params?: MarketplaceSearchParams): Promise<Skill[]> {
    const result = await this.request<{ skills: Skill[] }>({
      method: 'GET',
      path: '/skills/marketplace',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.skills;
  }

  // Bot skill attachments
  async attachToBot(skillId: string, params: AttachSkillParams): Promise<BotSkillAttachment> {
    validateId(skillId, 'skill');
    return this.request<BotSkillAttachment>({
      method: 'POST',
      path: `/skills/${skillId}/bots`,
      body: params,
    });
  }

  async detachFromBot(skillId: string, botId: string): Promise<void> {
    validateId(skillId, 'skill');
    validateId(botId, 'bot');
    return this.request<void>({
      method: 'DELETE',
      path: `/skills/${skillId}/bots/${botId}`,
    });
  }

  async updateBotSkill(
    skillId: string,
    botId: string,
    params: UpdateBotSkillParams,
  ): Promise<BotSkillAttachment> {
    validateId(skillId, 'skill');
    validateId(botId, 'bot');
    return this.request<BotSkillAttachment>({
      method: 'PATCH',
      path: `/skills/${skillId}/bots/${botId}`,
      body: params,
    });
  }

  async listBots(skillId: string): Promise<BotSkillAttachment[]> {
    validateId(skillId, 'skill');
    const result = await this.request<{ bots: BotSkillAttachment[] }>({
      method: 'GET',
      path: `/skills/${skillId}/bots`,
    });
    return result.bots;
  }
}
