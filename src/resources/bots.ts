/**
 * Bots resource for managing AI bots/agents.
 *
 * @example
 * ```typescript
 * const bot = await client.bots.create({
 *   name: 'Meeting Notes',
 *   system_prompt: 'You summarize meetings and extract action items.',
 * });
 *
 * const run = await client.bots.run(bot.id, { message: 'Summarize today' });
 * ```
 */

import type { Trix } from '../client.js';
import type {
  Bot,
  BotRun,
  BotSpace,
  BotTrigger,
  CreateBotParams,
  UpdateBotParams,
  ListBotsParams,
  AddBotSpaceParams,
  CreateTriggerParams,
  UpdateTriggerParams,
  RunBotParams,
  ListRunsParams,
  BotRunStep,
  RunAndWaitOptions,
  BuildContextParams,
  BotContext,
  BotRunBatchRequest,
  BotRunBatchResult,
  Memory,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';
import { ValidationError, TimeoutError } from '../errors.js';

export class Bots extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async create(params: CreateBotParams): Promise<Bot> {
    return this.request<Bot>({ method: 'POST', path: '/bots', body: params });
  }

  async list(params?: ListBotsParams): Promise<Bot[]> {
    const result = await this.request<{ bots: Bot[] }>({
      method: 'GET',
      path: '/bots',
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.bots;
  }

  async get(idOrSlug: string): Promise<Bot> {
    return this.request<Bot>({
      method: 'GET',
      path: `/bots/${encodeURIComponent(idOrSlug)}`,
    });
  }

  async update(id: string, params: UpdateBotParams): Promise<Bot> {
    validateId(id, 'bot');
    return this.request<Bot>({ method: 'PATCH', path: `/bots/${id}`, body: params });
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'bot');
    return this.request<void>({ method: 'DELETE', path: `/bots/${id}` });
  }

  // Space access
  async addSpace(botId: string, params: AddBotSpaceParams): Promise<BotSpace> {
    validateId(botId, 'bot');
    return this.request<BotSpace>({
      method: 'POST',
      path: `/bots/${botId}/spaces`,
      body: params,
    });
  }

  async removeSpace(botId: string, spaceId: string): Promise<void> {
    validateId(botId, 'bot');
    validateId(spaceId, 'space');
    return this.request<void>({
      method: 'DELETE',
      path: `/bots/${botId}/spaces/${spaceId}`,
    });
  }

  // Triggers
  async addTrigger(botId: string, params: CreateTriggerParams): Promise<BotTrigger> {
    validateId(botId, 'bot');
    return this.request<BotTrigger>({
      method: 'POST',
      path: `/bots/${botId}/triggers`,
      body: params,
    });
  }

  async updateTrigger(
    botId: string,
    triggerId: string,
    params: UpdateTriggerParams,
  ): Promise<BotTrigger> {
    validateId(botId, 'bot');
    return this.request<BotTrigger>({
      method: 'PATCH',
      path: `/bots/${botId}/triggers/${triggerId}`,
      body: params,
    });
  }

  async removeTrigger(botId: string, triggerId: string): Promise<void> {
    validateId(botId, 'bot');
    return this.request<void>({
      method: 'DELETE',
      path: `/bots/${botId}/triggers/${triggerId}`,
    });
  }

  // Execution
  async run(botId: string, params?: RunBotParams): Promise<BotRun> {
    validateId(botId, 'bot');
    return this.request<BotRun>({
      method: 'POST',
      path: `/bots/${encodeURIComponent(botId)}/run`,
      body: params || {},
    });
  }

  async listRuns(botId: string, params?: ListRunsParams): Promise<BotRun[]> {
    validateId(botId, 'bot');
    const result = await this.request<{ runs: BotRun[] }>({
      method: 'GET',
      path: `/bots/${encodeURIComponent(botId)}/runs`,
      params: params ? buildParams(params as Record<string, unknown>) : undefined,
    });
    return result.runs;
  }

  async getRun(botId: string, runId: string): Promise<BotRun> {
    validateId(runId, 'run');
    return this.request<BotRun>({
      method: 'GET',
      path: `/bots/${encodeURIComponent(botId)}/runs/${runId}`,
    });
  }

  /**
   * Stream a bot run, yielding typed step events via SSE.
   *
   * @param botId - Bot ID
   * @param params - Run parameters
   * @yields BotRunStep events as they arrive
   */
  async *runStream(botId: string, params?: RunBotParams): AsyncGenerator<BotRunStep> {
    validateId(botId, 'bot');
    const stream = await this.client.requestStream({
      method: 'POST',
      path: `/bots/${encodeURIComponent(botId)}/run`,
      body: params || {},
      headers: { 'Accept': 'text/event-stream' },
    });
    yield* this.parseSSEStream(stream);
  }

  /**
   * Build a structured context object by searching memories.
   *
   * @param params - Context building parameters
   * @returns Structured context with relevant memories
   */
  async buildContext(params: BuildContextParams): Promise<BotContext> {
    const limit = params.limit ?? 20;
    const includeMemories = params.includeMemories ?? true;

    if (!includeMemories) {
      return { query: params.query, memories: [], totalFound: 0, sessionId: params.sessionId };
    }

    const results = await this.client.request<{ data: Memory[] }>({
      method: 'POST',
      path: '/search/query',
      body: { query: params.query, limit },
    });

    const memories = (results.data ?? []).map((m) => ({
      id: m.id,
      content: m.content,
      similarity: typeof (m as unknown as Record<string, unknown>).similarity === 'number'
        ? (m as unknown as Record<string, unknown>).similarity as number
        : undefined,
    }));

    return {
      query: params.query,
      memories,
      totalFound: memories.length,
      sessionId: params.sessionId,
    };
  }

  /**
   * Run multiple bots in parallel.
   *
   * @param requests - Array of bot run requests
   * @returns Array of results (one per request, in order)
   */
  async runBatch(requests: BotRunBatchRequest[]): Promise<BotRunBatchResult[]> {
    if (!requests.length) return [];
    if (requests.length > 50) {
      throw new ValidationError(`runBatch supports at most 50 requests, got ${requests.length}`);
    }
    const promises = requests.map(async (req) => {
      try {
        const run = await this.run(req.botId, { message: req.message, context: req.context });
        return { botId: req.botId, run } as BotRunBatchResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { botId: req.botId, error: message } as BotRunBatchResult;
      }
    });
    return Promise.all(promises);
  }

  /**
   * Iterate over all bots using cursor-based pagination.
   *
   * @param params - Optional list parameters
   * @yields Individual Bot objects
   */
  async *listAll(params?: ListBotsParams): AsyncGenerator<Bot> {
    const limit = 100;
    let offset = 0;

    while (true) {
      const result = await this.request<{ bots: Bot[] }>({
        method: 'GET',
        path: '/bots',
        params: { ...buildParams((params ?? {}) as Record<string, unknown>), limit, offset },
      });

      for (const bot of result.bots) {
        yield bot;
      }
      if (result.bots.length < limit) break;
      offset += limit;
    }
  }

  /**
   * Iterate over all runs for a bot using cursor-based pagination.
   *
   * @param botId - Bot ID
   * @param params - Optional list parameters
   * @yields Individual BotRun objects
   */
  async *listRunsAll(botId: string, params?: ListRunsParams): AsyncGenerator<BotRun> {
    validateId(botId, 'bot');
    const limit = params?.limit ?? 100;
    let offset = params?.offset ?? 0;

    while (true) {
      const result = await this.request<{ runs: BotRun[] }>({
        method: 'GET',
        path: `/bots/${encodeURIComponent(botId)}/runs`,
        params: { limit, offset },
      });

      for (const run of result.runs) {
        yield run;
      }
      if (result.runs.length < limit) break;
      offset += limit;
    }
  }

  /**
   * Trigger a bot run and poll until it completes, fails, or is cancelled.
   *
   * @param botId - Bot ID
   * @param params - Run parameters
   * @param opts - Polling options
   * @returns The final completed/failed/cancelled run
   */
  async runAndWait(
    botId: string,
    params?: RunBotParams,
    opts?: RunAndWaitOptions,
  ): Promise<BotRun> {
    validateId(botId, 'bot');
    const run = await this.run(botId, params);
    return this.pollRunUntilDone(botId, run.id, opts);
  }

  /** @internal */
  private async pollRunUntilDone(
    botId: string,
    runId: string,
    opts?: RunAndWaitOptions,
  ): Promise<BotRun> {
    const pollInterval = opts?.pollInterval ?? 1000;
    const timeout = opts?.timeout ?? 300_000;
    const deadline = Date.now() + timeout;
    const terminalStatuses = new Set(['completed', 'failed', 'cancelled']);

    while (Date.now() < deadline) {
      const run = await this.getRun(botId, runId);
      if (terminalStatuses.has(run.status)) {
        return run;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await sleep(Math.min(pollInterval, remaining));
    }

    throw new TimeoutError(`Bot run ${runId} timed out after ${timeout}ms`);
  }

  /** @internal */
  private async *parseSSEStream(stream: ReadableStream): AsyncGenerator<BotRunStep> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = extractSSEEvents(buffer);
        buffer = events.remaining;

        for (const event of events.parsed) {
          yield event;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SSEParseResult {
  parsed: BotRunStep[];
  remaining: string;
}

function extractSSEEvents(buffer: string): SSEParseResult {
  const parsed: BotRunStep[] = [];
  const blocks = buffer.split('\n\n');
  const remaining = blocks.pop() ?? '';

  for (const block of blocks) {
    const dataLine = block
      .split('\n')
      .find((line) => line.startsWith('data: '));
    if (!dataLine) continue;

    try {
      const event = JSON.parse(dataLine.slice(6)) as BotRunStep;
      parsed.push(event);
    } catch (e) {
      // Log malformed SSE events for debugging
      if (typeof console !== 'undefined') {
        console.debug?.('[trix-sse] Failed to parse SSE event:', dataLine?.slice(0, 100));
      }
    }
  }

  return { parsed, remaining };
}
