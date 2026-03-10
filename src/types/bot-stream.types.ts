/**
 * Bot streaming and polling type definitions for the Trix SDK.
 */

export type BotRunStepType =
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'message'
  | 'memory_search'
  | 'memory_store'
  | 'error'
  | 'done';

export interface BotRunStep {
  type: BotRunStepType;
  run_id: string;
  bot_id: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface RunAndWaitOptions {
  /** Polling interval in milliseconds (default: 1000) */
  pollInterval?: number;
  /** Total timeout in milliseconds (default: 300000) */
  timeout?: number;
}
