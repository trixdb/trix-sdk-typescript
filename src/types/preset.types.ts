/**
 * Agent preset type definitions.
 */

/** Memory retrieval strategy */
export type PresetMemoryStrategy = 'search' | 'auto_store' | 'read_only';

/** Agent autonomy level */
export type PresetAutonomyLevel = 'autonomous' | 'supervised' | 'approval-required';

/** Budget period */
export type PresetBudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'total';

/** Agent execution preset */
export interface AgentPreset {
  id: string;
  accountId?: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stepOverrides?: Record<string, unknown>;
  toolsAllowed?: string[] | null;
  toolsBlocked?: string[];
  memoryStrategy?: PresetMemoryStrategy;
  searchLimit?: number;
  contextWindow?: number;
  retrievalPreset?: string;
  guardrails?: string[];
  autonomyLevel?: PresetAutonomyLevel;
  maxCostPerRun?: number;
  maxBudgetUsd?: number;
  budgetPeriod?: PresetBudgetPeriod;
  createdAt?: string;
  updatedAt?: string;
}

/** Parameters for creating an agent preset */
export interface CreatePresetParams {
  name: string;
  slug?: string;
  description?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stepOverrides?: Record<string, unknown>;
  toolsAllowed?: string[] | null;
  toolsBlocked?: string[];
  memoryStrategy?: PresetMemoryStrategy;
  searchLimit?: number;
  contextWindow?: number;
  retrievalPreset?: string;
  guardrails?: string[];
  autonomyLevel?: PresetAutonomyLevel;
  maxCostPerRun?: number;
  maxBudgetUsd?: number;
  budgetPeriod?: PresetBudgetPeriod;
}

/** Parameters for updating an agent preset */
export interface UpdatePresetParams {
  name?: string;
  slug?: string;
  description?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stepOverrides?: Record<string, unknown>;
  toolsAllowed?: string[] | null;
  toolsBlocked?: string[];
  memoryStrategy?: PresetMemoryStrategy;
  searchLimit?: number;
  contextWindow?: number;
  retrievalPreset?: string;
  guardrails?: string[];
  autonomyLevel?: PresetAutonomyLevel;
  maxCostPerRun?: number;
  maxBudgetUsd?: number;
  budgetPeriod?: PresetBudgetPeriod;
}

/** Parameters for listing agent presets */
export interface ListPresetsParams {
  includeSystem?: boolean;
}
