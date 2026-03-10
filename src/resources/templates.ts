/**
 * Templates resource for managing agent templates.
 *
 * @example
 * ```typescript
 * const template = await client.templates.create({
 *   name: 'Research Assistant',
 *   system_prompt: 'You help with research tasks.',
 * });
 *
 * const marketplace = await client.templates.browse({ sort: 'popular' });
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Template,
  TemplateReview,
  CreateTemplateParams,
  UpdateTemplateParams,
  ListTemplatesParams,
  BrowseTemplatesParams,
  InstallTemplateParams,
  CreateTemplateReviewParams,
  PaginatedResponse,
} from '../types.js';
import type { Bot } from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Templates extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async list(params?: ListTemplatesParams): Promise<Template[]> {
    const result = await this.request<{ templates: Template[] }>({
      method: 'GET',
      path: '/agent-templates',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.templates;
  }

  async get(id: string): Promise<Template> {
    validateId(id, 'template');
    return this.request<Template>({
      method: 'GET',
      path: `/agent-templates/${id}`,
    });
  }

  async create(params: CreateTemplateParams): Promise<Template> {
    return this.request<Template>({
      method: 'POST',
      path: '/agent-templates',
      body: params,
    });
  }

  async update(id: string, params: UpdateTemplateParams): Promise<Template> {
    validateId(id, 'template');
    return this.request<Template>({
      method: 'PATCH',
      path: `/agent-templates/${id}`,
      body: params,
    });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'template');
    return this.request<void>({ method: 'DELETE', path: `/agent-templates/${id}` });
  }

  async browse(params?: BrowseTemplatesParams): Promise<Template[]> {
    const result = await this.request<{ templates: Template[] }>({
      method: 'GET',
      path: '/agent-templates/marketplace',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.templates;
  }

  async install(id: string, params: InstallTemplateParams): Promise<Bot> {
    validateId(id, 'template');
    return this.request<Bot>({
      method: 'POST',
      path: `/agent-templates/${id}/install`,
      body: params,
    });
  }

  /**
   * Browse the marketplace with convenience parameters.
   *
   * @param params - Optional marketplace filter params
   * @returns Paginated list of marketplace templates
   */
  async marketplace(params?: {
    category?: string;
    sort?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Template>> {
    return this.request<PaginatedResponse<Template>>({
      method: 'GET',
      path: '/agent-templates/marketplace',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
  }

  async review(id: string, data: CreateTemplateReviewParams): Promise<TemplateReview> {
    validateId(id, 'template');
    return this.request<TemplateReview>({
      method: 'POST',
      path: `/agent-templates/${id}/reviews`,
      body: data,
    });
  }
}
