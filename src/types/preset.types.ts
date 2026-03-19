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
  account_id?: string;
  name: string;
  slug: string;
  description?: string;
  is_system: boolean;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  step_overrides?: Record<string, unknown>;
  tools_allowed?: string[] | null;
  tools_blocked?: string[];
  memory_strategy?: PresetMemoryStrategy;
  search_limit?: number;
  context_window?: number;
  retrieval_preset?: string;
  guardrails?: string[];
  autonomy_level?: PresetAutonomyLevel;
  max_cost_per_run?: number;
  max_budget_usd?: number;
  budget_period?: PresetBudgetPeriod;
  created_at?: string;
  updated_at?: string;
}

/** Parameters for creating an agent preset */
export interface CreatePresetParams {
  name: string;
  slug?: string;
  description?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  step_overrides?: Record<string, unknown>;
  tools_allowed?: string[] | null;
  tools_blocked?: string[];
  memory_strategy?: PresetMemoryStrategy;
  search_limit?: number;
  context_window?: number;
  retrieval_preset?: string;
  guardrails?: string[];
  autonomy_level?: PresetAutonomyLevel;
  max_cost_per_run?: number;
  max_budget_usd?: number;
  budget_period?: PresetBudgetPeriod;
}

/** Parameters for updating an agent preset */
export interface UpdatePresetParams {
  name?: string;
  slug?: string;
  description?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  step_overrides?: Record<string, unknown>;
  tools_allowed?: string[] | null;
  tools_blocked?: string[];
  memory_strategy?: PresetMemoryStrategy;
  search_limit?: number;
  context_window?: number;
  retrieval_preset?: string;
  guardrails?: string[];
  autonomy_level?: PresetAutonomyLevel;
  max_cost_per_run?: number;
  max_budget_usd?: number;
  budget_period?: PresetBudgetPeriod;
}

/** Parameters for listing agent presets */
export interface ListPresetsParams {
  include_system?: boolean;
}
