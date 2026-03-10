/**
 * Template type definitions for the Trix SDK.
 */

export type TemplateVisibility = 'private' | 'public' | 'unlisted';
export type TemplateCategory = 'assistant' | 'automation' | 'research' | 'creative' | 'productivity' | 'custom';

export interface TemplateReview {
  id: string;
  template_id: string;
  account_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Template {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  description?: string;
  category: TemplateCategory;
  visibility: TemplateVisibility;
  system_prompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: { server: string; tools?: string[] }[];
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  install_count: number;
  avg_rating?: number;
  review_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateParams {
  name: string;
  slug?: string;
  description?: string;
  category?: TemplateCategory;
  visibility?: TemplateVisibility;
  system_prompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: { server: string; tools?: string[] }[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateTemplateParams {
  name?: string;
  slug?: string;
  description?: string | null;
  category?: TemplateCategory;
  visibility?: TemplateVisibility;
  system_prompt?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: { server: string; tools?: string[] }[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface ListTemplatesParams {
  category?: TemplateCategory;
  visibility?: TemplateVisibility;
  limit?: number;
  offset?: number;
}

export interface BrowseTemplatesParams {
  category?: TemplateCategory;
  query?: string;
  sort?: 'popular' | 'recent' | 'rating';
  limit?: number;
  offset?: number;
}

export interface InstallTemplateParams {
  name?: string;
  space_ids?: string[];
}

export interface CreateTemplateReviewParams {
  rating: number;
  comment?: string;
}
