/**
 * Bot type definitions for the Trix SDK.
 */

export type BotStatus = 'active' | 'paused' | 'disabled';
export type MemoryStrategy = 'search' | 'auto_store' | 'read_only';
export type TriggerType = 'mention' | 'cron' | 'event' | 'webhook';
export type BotRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type BotSpacePermission = 'read' | 'read_write';

export interface BotTool {
  server: string;
  tools?: string[];
}

export interface BotSpace {
  space_id: string;
  permission: BotSpacePermission;
  space_name?: string;
}

export interface BotTrigger {
  id: string;
  bot_id: string;
  type: TriggerType;
  cron_expression?: string;
  timezone?: string;
  event_types?: string[];
  event_filter?: Record<string, unknown>;
  enabled: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export interface Bot {
  id: string;
  account_id: string;
  persona_id?: string;
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  status: BotStatus;
  model: string;
  provider: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  memory_strategy: MemoryStrategy;
  search_limit: number;
  tools: BotTool[];
  max_turns_per_run: number;
  require_approval: string[];
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_builtin: boolean;
  spaces?: BotSpace[];
  triggers?: BotTrigger[];
  created_at: string;
  updated_at: string;
}

export interface BotAction {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface BotRun {
  id: string;
  bot_id: string;
  account_id: string;
  trigger_type: string;
  trigger_id?: string;
  status: BotRunStatus;
  input_message?: string;
  input_context?: Record<string, unknown>;
  output_message?: string;
  output_actions: BotAction[];
  memories_stored: number;
  memories_searched: number;
  llm_tokens_used?: number;
  llm_model?: string;
  duration_ms?: number;
  error_message?: string;
  metadata: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CreateBotParams {
  name: string;
  slug?: string;
  description?: string;
  avatar_url?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt: string;
  memory_strategy?: MemoryStrategy;
  search_limit?: number;
  tools?: BotTool[];
  max_turns_per_run?: number;
  require_approval?: string[];
  persona_id?: string;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateBotParams {
  name?: string;
  slug?: string;
  description?: string | null;
  avatar_url?: string | null;
  status?: BotStatus;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  memory_strategy?: MemoryStrategy;
  search_limit?: number;
  tools?: BotTool[];
  max_turns_per_run?: number;
  require_approval?: string[];
  persona_id?: string | null;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ListBotsParams {
  status?: BotStatus;
}

export interface AddBotSpaceParams {
  space_id: string;
  permission?: BotSpacePermission;
}

export interface CreateTriggerParams {
  type: TriggerType;
  cron_expression?: string;
  timezone?: string;
  event_types?: string[];
  event_filter?: Record<string, unknown>;
  enabled?: boolean;
}

export interface UpdateTriggerParams {
  type?: TriggerType;
  cron_expression?: string;
  timezone?: string;
  event_types?: string[];
  event_filter?: Record<string, unknown>;
  enabled?: boolean;
}

export interface RunBotParams {
  message?: string;
  context?: Record<string, unknown>;
}

export interface ListRunsParams {
  limit?: number;
  offset?: number;
}
