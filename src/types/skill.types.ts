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
  accountId: string;
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
  allowedTools: string[];
  installCount: number;
  sourceUrl?: string;
  sourceSkillId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BotSkillAttachment {
  botId: string;
  skillId: string;
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
  allowedTools?: string[];
  sourceUrl?: string;
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
  allowedTools?: string[];
  sourceUrl?: string;
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
  botId: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  priority?: number;
}

export interface UpdateBotSkillParams {
  enabled?: boolean;
  config?: Record<string, unknown>;
  priority?: number;
}
