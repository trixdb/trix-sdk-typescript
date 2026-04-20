/**
 * ADR-121: Rich agent streaming event types.
 *
 * These types match the SSE events emitted by the `/v1/agent/stream` and
 * `/v1/agent/ws` endpoints (trix-api + trix-bots). They complement the
 * older `BotRunStep` types which only cover polling-style bot runs.
 *
 * SDK consumers iterate these as:
 *   for await (const event of client.agents.stream(opts)) {
 *     switch (event.type) { ... }
 *   }
 */

export interface AgentMessageRef {
	readonly id: string;
	readonly model: string;
}

export interface AgentUsage {
	readonly input_tokens: number;
	readonly output_tokens: number;
	readonly cache_read_tokens?: number;
	readonly cache_write_tokens?: number;
	readonly thinking_tokens?: number;
}

export type AgentStreamEvent =
	| { type: 'message_start'; message: AgentMessageRef; usage: AgentUsage }
	| { type: 'content_delta'; delta: string; contentIndex: number }
	| { type: 'thinking_delta'; delta: string }
	| { type: 'tool_use_start'; toolUseId: string; name: string }
	| { type: 'tool_use_delta'; toolUseId: string; inputDelta: string }
	| { type: 'tool_result'; toolUseId: string; output: unknown; isError?: boolean }
	| { type: 'message_stop'; stopReason: string; usage: AgentUsage }
	| { type: 'memory_retrieved'; memoryIds: string[]; latencyMs: number; timedOut: boolean }
	| { type: 'memory_cited'; memoryId: string }
	| { type: 'memory_consolidated'; newFacts: number; reinforced: number; weakened: number }
	| { type: 'stage_start'; stage: string }
	| { type: 'stage_end'; stage: string; status: 'ok' | 'error' }
	| { type: 'budget_state'; spent: { tokens: number; usd: number }; band: 'ok' | 'warn' | 'over'; pct: number }
	| { type: 'budget_warning'; remaining: { tokens?: number; usd?: number } }
	| { type: 'cache_report'; hit: boolean; hitRate: number }
	| { type: 'retry_attempt'; provider: string; attempt: number; reason: string }
	| { type: 'permission_request'; tool: string; input: unknown }
	| { type: 'web_search_status'; status: 'started' | 'done'; query?: string }
	| { type: 'sources'; sources: readonly { uri: string; title?: string }[] }
	| { type: 'stop'; reason: AgentExitReason }
	| { type: 'error'; error: { code: string; message: string } };

export type AgentStreamEventType = AgentStreamEvent['type'];

export type AgentExitReason =
	| 'end_turn'
	| 'stop_sequence'
	| 'max_tokens'
	| 'budget_exceeded'
	| 'cancelled'
	| 'error'
	| 'refusal';

export function isAgentEventOfType<T extends AgentStreamEventType>(
	ev: AgentStreamEvent,
	t: T,
): ev is Extract<AgentStreamEvent, { type: T }> {
	return ev.type === t;
}

/**
 * Extract all text content from a stream of events (concatenate content_delta).
 * Returns the assembled text after the stream ends.
 */
export async function collectStreamText(
	stream: AsyncIterable<AgentStreamEvent>,
): Promise<{ text: string; usage: AgentUsage | null; stopReason: string | null }> {
	const parts: string[] = [];
	let usage: AgentUsage | null = null;
	let stopReason: string | null = null;
	for await (const ev of stream) {
		if (ev.type === 'content_delta') parts.push(ev.delta);
		if (ev.type === 'message_stop') { usage = ev.usage; stopReason = ev.stopReason; }
	}
	return { text: parts.join(''), usage, stopReason };
}

/**
 * Extract tool results from a stream.
 */
export async function collectStreamToolResults(
	stream: AsyncIterable<AgentStreamEvent>,
): Promise<readonly { toolUseId: string; name: string; output: unknown; isError?: boolean }[]> {
	const tools: { toolUseId: string; name: string; output: unknown; isError?: boolean }[] = [];
	const names = new Map<string, string>();
	for await (const ev of stream) {
		if (ev.type === 'tool_use_start') names.set(ev.toolUseId, ev.name);
		if (ev.type === 'tool_result') {
			tools.push({
				toolUseId: ev.toolUseId,
				name: names.get(ev.toolUseId) ?? 'unknown',
				output: ev.output,
				isError: ev.isError,
			});
		}
	}
	return tools;
}
