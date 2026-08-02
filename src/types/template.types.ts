/**
 * Template type definitions for the Trix SDK.
 */

export type TemplateVisibility = 'private' | 'public' | 'unlisted';
export type TemplateCategory = 'assistant' | 'automation' | 'research' | 'creative' | 'productivity' | 'custom';

export interface TemplateReview {
  id: string;
  templateId: string;
  accountId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Template {
  id: string;
  accountId: string;
  name: string;
  slug: string;
  description?: string;
  category: TemplateCategory;
  visibility: TemplateVisibility;
  systemPrompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: { server: string; tools?: string[] }[];
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  installCount: number;
  avgRating?: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateParams {
  name: string;
  slug?: string;
  description?: string;
  category?: TemplateCategory;
  visibility?: TemplateVisibility;
  systemPrompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
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
  systemPrompt?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
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
  spaceIds?: string[];
}

export interface CreateTemplateReviewParams {
  rating: number;
  comment?: string;
}
