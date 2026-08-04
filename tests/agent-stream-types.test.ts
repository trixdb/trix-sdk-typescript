/**
 * Agent streaming event type tests — iter 102.
 */

import { describe, it, expect } from '@jest/globals';
import {
	collectStreamText,
	collectStreamToolResults,
	isAgentEventOfType,
	type AgentStreamEvent,
} from '../src/types/agent-stream.types.js';

async function* scripted(events: readonly AgentStreamEvent[]): AsyncIterable<AgentStreamEvent> {
	for (const e of events) yield e;
}

describe('isAgentEventOfType — type guard', () => {
	it('narrows to content_delta', () => {
		const ev: AgentStreamEvent = { type: 'content_delta', delta: 'hi', contentIndex: 0 };
		if (isAgentEventOfType(ev, 'content_delta')) {
			expect(ev.delta).toBe('hi');
			expect(ev.contentIndex).toBe(0);
		} else {
			throw new Error('guard failed');
		}
	});

	it('returns false for non-matching type', () => {
		const ev: AgentStreamEvent = { type: 'stop', reason: 'end_turn' };
		expect(isAgentEventOfType(ev, 'content_delta')).toBe(false);
	});
});

describe('collectStreamText', () => {
	it('concatenates content_delta events', async () => {
		const events: AgentStreamEvent[] = [
			{ type: 'message_start', message: { id: 'm1', model: 'opus' }, usage: { input_tokens: 100, output_tokens: 0 } },
			{ type: 'content_delta', delta: 'Hello ', contentIndex: 0 },
			{ type: 'content_delta', delta: 'world', contentIndex: 0 },
			{ type: 'message_stop', stopReason: 'end_turn', usage: { input_tokens: 100, output_tokens: 50 } },
		];
		const r = await collectStreamText(scripted(events));
		expect(r.text).toBe('Hello world');
		expect(r.stopReason).toBe('end_turn');
		expect(r.usage!.output_tokens).toBe(50);
	});

	it('empty stream → empty text, null usage', async () => {
		const r = await collectStreamText(scripted([]));
		expect(r.text).toBe('');
		expect(r.usage).toBeNull();
		expect(r.stopReason).toBeNull();
	});

	it('stream with no content_delta → empty text', async () => {
		const events: AgentStreamEvent[] = [
			{ type: 'tool_use_start', toolUseId: 't1', name: 'Read' },
			{ type: 'tool_result', toolUseId: 't1', output: 'file content' },
		];
		const r = await collectStreamText(scripted(events));
		expect(r.text).toBe('');
	});
});

describe('collectStreamToolResults', () => {
	it('pairs tool_use_start name with tool_result', async () => {
		const events: AgentStreamEvent[] = [
			{ type: 'tool_use_start', toolUseId: 't1', name: 'Read' },
			{ type: 'tool_use_delta', toolUseId: 't1', inputDelta: '{"file_path":"/a"}' },
			{ type: 'tool_result', toolUseId: 't1', output: 'file content' },
			{ type: 'tool_use_start', toolUseId: 't2', name: 'Bash' },
			{ type: 'tool_result', toolUseId: 't2', output: 'ok', isError: false },
		];
		const r = await collectStreamToolResults(scripted(events));
		expect(r).toHaveLength(2);
		expect(r[0]!.name).toBe('Read');
		expect(r[0]!.output).toBe('file content');
		expect(r[1]!.name).toBe('Bash');
	});

	it('isError propagated when present', async () => {
		const events: AgentStreamEvent[] = [
			{ type: 'tool_use_start', toolUseId: 't1', name: 'Bash' },
			{ type: 'tool_result', toolUseId: 't1', output: 'command not found', isError: true },
		];
		const r = await collectStreamToolResults(scripted(events));
		expect(r[0]!.isError).toBe(true);
	});

	it('tool_result without prior start → name "unknown"', async () => {
		const events: AgentStreamEvent[] = [
			{ type: 'tool_result', toolUseId: 'orphan', output: 'x' },
		];
		const r = await collectStreamToolResults(scripted(events));
		expect(r[0]!.name).toBe('unknown');
	});

	it('empty stream → empty results', async () => {
		const r = await collectStreamToolResults(scripted([]));
		expect(r).toEqual([]);
	});
});

describe('AgentStreamEvent — exhaustive type coverage', () => {
	it('every event type is constructible', () => {
		const events: AgentStreamEvent[] = [
			{ type: 'message_start', message: { id: '1', model: 'm' }, usage: { input_tokens: 0, output_tokens: 0 } },
			{ type: 'content_delta', delta: 'x', contentIndex: 0 },
			{ type: 'thinking_delta', delta: 'y' },
			{ type: 'tool_use_start', toolUseId: 't', name: 'n' },
			{ type: 'tool_use_delta', toolUseId: 't', inputDelta: '{}' },
			{ type: 'tool_result', toolUseId: 't', output: null },
			{ type: 'message_stop', stopReason: 'end_turn', usage: { input_tokens: 0, output_tokens: 0 } },
			{ type: 'memory_retrieved', memoryIds: ['m1'], latencyMs: 10, timedOut: false },
			{ type: 'memory_cited', memoryId: 'm1' },
			{ type: 'memory_consolidated', newFacts: 1, reinforced: 0, weakened: 0 },
			{ type: 'stage_start', stage: 'verify' },
			{ type: 'stage_end', stage: 'verify', status: 'ok' },
			{ type: 'budget_state', spent: { tokens: 100, usd: 0.01 }, band: 'ok', pct: 0.1 },
			{ type: 'budget_warning', remaining: { tokens: 9000 } },
			{ type: 'cache_report', hit: true, hitRate: 0.8 },
			{ type: 'retry_attempt', provider: 'anthropic', attempt: 1, reason: 'timeout' },
			{ type: 'permission_request', tool: 'Bash', input: { command: 'rm -rf /' } },
			{ type: 'web_search_status', status: 'started', query: 'test' },
			{ type: 'sources', sources: [{ uri: 'https://x.com', title: 'X' }] },
			{ type: 'stop', reason: 'end_turn' },
			{ type: 'error', error: { code: 'E001', message: 'bad' } },
		];
		expect(events).toHaveLength(21);
		expect(new Set(events.map((e) => e.type)).size).toBe(21);
	});
});
