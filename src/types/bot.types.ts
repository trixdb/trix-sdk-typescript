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
  spaceId: string;
  permission: BotSpacePermission;
  spaceName?: string;
}

export interface BotTrigger {
  id: string;
  botId: string;
  type: TriggerType;
  cronExpression?: string;
  timezone?: string;
  eventTypes?: string[];
  eventFilter?: Record<string, unknown>;
  enabled: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface Bot {
  id: string;
  accountId: string;
  personaId?: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  status: BotStatus;
  model: string;
  provider: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  memoryStrategy: MemoryStrategy;
  searchLimit: number;
  tools: BotTool[];
  maxTurnsPerRun: number;
  requireApproval: string[];
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  isBuiltin: boolean;
  spaces?: BotSpace[];
  triggers?: BotTrigger[];
  createdAt: string;
  updatedAt: string;
}

export interface BotAction {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface BotRun {
  id: string;
  botId: string;
  accountId: string;
  triggerType: string;
  triggerId?: string;
  status: BotRunStatus;
  inputMessage?: string;
  inputContext?: Record<string, unknown>;
  outputMessage?: string;
  outputActions: BotAction[];
  memoriesStored: number;
  memoriesSearched: number;
  llmTokensUsed?: number;
  llmModel?: string;
  durationMs?: number;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateBotParams {
  name: string;
  slug?: string;
  description?: string;
  avatarUrl?: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  memoryStrategy?: MemoryStrategy;
  searchLimit?: number;
  tools?: BotTool[];
  maxTurnsPerRun?: number;
  requireApproval?: string[];
  personaId?: string;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateBotParams {
  name?: string;
  slug?: string;
  description?: string | null;
  avatarUrl?: string | null;
  status?: BotStatus;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  memoryStrategy?: MemoryStrategy;
  searchLimit?: number;
  tools?: BotTool[];
  maxTurnsPerRun?: number;
  requireApproval?: string[];
  personaId?: string | null;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ListBotsParams {
  status?: BotStatus;
}

export interface AddBotSpaceParams {
  spaceId: string;
  permission?: BotSpacePermission;
}

export interface CreateTriggerParams {
  type: TriggerType;
  cronExpression?: string;
  timezone?: string;
  eventTypes?: string[];
  eventFilter?: Record<string, unknown>;
  enabled?: boolean;
}

export interface UpdateTriggerParams {
  type?: TriggerType;
  cronExpression?: string;
  timezone?: string;
  eventTypes?: string[];
  eventFilter?: Record<string, unknown>;
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

/** Parameters for building bot context from memory search. */
export interface BuildContextParams {
  /** Query to search memories for context */
  query: string;
  /** Optional session ID for scoping */
  sessionId?: string;
  /** Include memory search results (default: true) */
  includeMemories?: boolean;
  /** Include related memories (default: false) */
  includeRelated?: boolean;
  /** Maximum number of memories to include (default: 20) */
  limit?: number;
}

/** Structured context object returned by buildContext. */
export interface BotContext {
  /** Original query used */
  query: string;
  /** Relevant memories found */
  memories: Array<{ id: string; content: string; similarity?: number }>;
  /** Total memories found before limit */
  totalFound: number;
  /** Session ID if provided */
  sessionId?: string;
}

/** Single request in a batch run. */
export interface BotRunBatchRequest {
  botId: string;
  message: string;
  context?: Record<string, unknown>;
}

/** Result of a single batch run item. */
export interface BotRunBatchResult {
  botId: string;
  run?: BotRun;
  error?: string;
}
