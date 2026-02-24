/**
 * Skill type definitions for the Trix SDK.
 */

export type SkillVisibility = 'private' | 'public' | 'marketplace';
export type SkillStatus = 'draft' | 'published' | 'archived';

export interface SkillScript {
  name: string;
  path: string;
  language?: string;
  description?: string;
}

export interface SkillResource {
  name: string;
  path: string;
  type?: string;
  description?: string;
}

export interface Skill {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  license?: string;
  compatibility?: string;
  content: string;
  scripts: SkillScript[];
  resources: SkillResource[];
  metadata: Record<string, unknown>;
  visibility: SkillVisibility;
  status: SkillStatus;
  allowed_tools: string[];
  install_count: number;
  source_url?: string;
  source_skill_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BotSkillAttachment {
  bot_id: string;
  skill_id: string;
  enabled: boolean;
  config: Record<string, unknown>;
  priority: number;
}

export interface CreateSkillParams {
  name: string;
  slug?: string;
  description: string;
  version?: string;
  license?: string;
  compatibility?: string;
  content: string;
  scripts?: SkillScript[];
  resources?: SkillResource[];
  metadata?: Record<string, unknown>;
  visibility?: SkillVisibility;
  allowed_tools?: string[];
  source_url?: string;
}

export interface UpdateSkillParams {
  name?: string;
  slug?: string;
  description?: string;
  version?: string;
  license?: string;
  compatibility?: string;
  content?: string;
  scripts?: SkillScript[];
  resources?: SkillResource[];
  metadata?: Record<string, unknown>;
  visibility?: SkillVisibility;
  status?: SkillStatus;
  allowed_tools?: string[];
  source_url?: string;
}

export interface ListSkillsParams {
  status?: SkillStatus;
  visibility?: SkillVisibility;
}

export interface MarketplaceSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AttachSkillParams {
  bot_id: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  priority?: number;
}

export interface UpdateBotSkillParams {
  enabled?: boolean;
  config?: Record<string, unknown>;
  priority?: number;
}
