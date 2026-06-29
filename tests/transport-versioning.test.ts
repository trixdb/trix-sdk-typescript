/**
 * Contract test for the API-version transport fix + bots/personas namespace.
 *
 * Regression guard for the CRIT finding: the SDK omitted the `/v1` API-version
 * prefix, so every resource not in the deprecated unversioned mirror 404'd.
 * It also covers the namespace drift where `bots` hit `/bots/*` (404, real
 * namespace is `/agents`) and `personas` hit `/personas/*` (410 Gone, merged
 * into agents).
 *
 * Deterministic and network-free: a mock fetch captures the final request URL
 * that the transport actually builds, and we assert on that string.
 */

import { Trix } from '../src/client';

interface Captured {
  url: string;
  method: string;
}

/** A Trix client whose fetch records every final request URL. */
function makeClient(body: unknown = {}): { client: Trix; calls: Captured[] } {
  const calls: Captured[] = [];
  const fetchImpl = (async (url: unknown, init: { method?: string } = {}) => {
    calls.push({ url: String(url), method: init.method ?? 'GET' });
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;

  const client = new Trix({
    apiKey: 'test_key',
    baseUrl: 'https://api.trixdb.com',
    fetch: fetchImpl,
  });
  return { client, calls };
}

/** Count occurrences of the version segment in a URL path. */
function v1Count(url: string): number {
  return (url.match(/\/v1\//g) || []).length;
}

describe('transport prepends /v1', () => {
  // Representative idiomatic (unversioned) paths used by the resource classes.
  const REPRESENTATIVE_PATHS = [
    '/memories',
    '/spaces',
    '/clusters',
    '/search/query',
    '/agents',
    '/knowledge/facts',
    '/sessions',
  ];

  it.each(REPRESENTATIVE_PATHS)(
    'prefixes %s with the /v1 version segment',
    async (path) => {
      const { client, calls } = makeClient();
      await client.request({ method: 'GET', path });
      expect(calls[0].url).toBe(`https://api.trixdb.com/v1${path}`);
      expect(v1Count(calls[0].url)).toBe(1);
    }
  );

  it('does not double the version when a path already carries /v1', async () => {
    // A handful of resources hardcode /v1 (e.g. search.batch); the transport
    // must stay idempotent and never emit /v1/v1.
    const { client, calls } = makeClient();
    await client.request({ method: 'POST', path: '/v1/search/batch' });
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/search/batch');
    expect(v1Count(calls[0].url)).toBe(1);
  });

  it('preserves a base path segment instead of dropping it', async () => {
    const calls: Captured[] = [];
    const fetchImpl = (async (url: unknown, init: { method?: string } = {}) => {
      calls.push({ url: String(url), method: init.method ?? 'GET' });
      return new Response('{}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as unknown as typeof fetch;
    const client = new Trix({
      apiKey: 'k',
      baseUrl: 'https://gateway.example.com/api',
      fetch: fetchImpl,
    });
    await client.request({ method: 'GET', path: '/memories' });
    expect(calls[0].url).toBe('https://gateway.example.com/api/v1/memories');
  });
});

describe('bots resource maps onto /v1/agents', () => {
  it('list() calls GET /v1/agents and reads the `agents` key', async () => {
    const { client, calls } = makeClient({ agents: [{ id: 'agent_1' }] });
    const result = await client.bots.list();
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/agents');
    expect(calls[0].method).toBe('GET');
    expect(result).toHaveLength(1);
  });

  it('get() calls GET /v1/agents/:id', async () => {
    const { client, calls } = makeClient({ id: 'agent_1' });
    await client.bots.get('agent_1');
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/agents/agent_1');
  });

  it('run() calls POST /v1/agents/:id/run', async () => {
    const { client, calls } = makeClient({ id: 'run_1', status: 'running' });
    await client.bots.run('bot_123', { message: 'hi' });
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/agents/bot_123/run');
    expect(calls[0].method).toBe('POST');
  });

  it('getRun() addresses runs globally: GET /v1/agents/runs/:runId', async () => {
    const { client, calls } = makeClient({ id: 'run_456', status: 'completed' });
    await client.bots.getRun('bot_123', 'run_456');
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/agents/runs/run_456');
  });
});

describe('personas resource maps onto /v1/agents', () => {
  it('list() calls GET /v1/agents and reads the `agents` key', async () => {
    const { client, calls } = makeClient({ agents: [{ id: 'agent_1' }] });
    const result = await client.personas.list();
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/agents');
    expect(result).toHaveLength(1);
  });

  it('get() calls GET /v1/agents/:id (not the 410 Gone /personas)', async () => {
    const { client, calls } = makeClient({ id: 'persona_123' });
    await client.personas.get('persona_123');
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/agents/persona_123');
    expect(calls[0].url).not.toContain('/personas');
  });
});

describe('knowledge resource is versioned exactly once', () => {
  it('summary() calls POST /v1/knowledge/summary (no /v1/v1)', async () => {
    const { client, calls } = makeClient({ topic: 't', total_memories: 0 });
    await client.knowledge.summary('t');
    expect(calls[0].url).toBe('https://api.trixdb.com/v1/knowledge/summary');
    expect(v1Count(calls[0].url)).toBe(1);
  });
});
