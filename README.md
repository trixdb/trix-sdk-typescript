# Trix TypeScript SDK

Official TypeScript SDK for Trix — a memory and knowledge management API.

[![npm version](https://img.shields.io/npm/v/@trixdb/client.svg)](https://www.npmjs.com/package/@trixdb/client)
[![version](https://img.shields.io/badge/version-0.6.0-blue.svg)](https://www.npmjs.com/package/@trixdb/client)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

## Features

- **Full TypeScript support** — complete type definitions for every endpoint
- **Promise-based API** — modern `async`/`await` throughout
- **Automatic retries** — exponential backoff with jitter, honoring `Retry-After`
- **Automatic idempotency** — a per-request `Idempotency-Key` on every write, so a retried mutation never double-applies
- **Pagination helpers** — async iterators (`for await`) that fetch every page for you
- **SSE streaming** — stream bot runs step-by-step with `bots.runStream`
- **File uploads** — multipart upload and signed downloads
- **Inbound webhook verification** — constant-time HMAC-SHA256 signature checks, built in
- **Testing utilities** — a shipped `MockTrix` under `@trixdb/client/testing`
- **Zero dependencies** — native `fetch` and Web Crypto (Node.js 20+, Deno, Bun, workers, browser)

## Installation

```bash
npm install @trixdb/client
```

```bash
yarn add @trixdb/client
```

```bash
pnpm add @trixdb/client
```

## Quick Start

```typescript
import { Trix } from '@trixdb/client';

const client = new Trix({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.trixdb.com', // optional, defaults to the production API
});

// Create a memory
const memory = await client.memories.create({
  content: 'Important information to remember',
  tags: ['important', 'note'],
  metadata: { source: 'user_input' },
});

// Search memories
const results = await client.memories.list({
  q: 'important',
  mode: 'hybrid',
  limit: 10,
});

// Relate two memories
const rel = await client.relationships.create(memory.id, otherMemory.id, {
  relationshipType: 'related_to',
  weight: 0.8,
});
```

## Authentication

Provide your API key to the constructor, or read it from the environment.

```typescript
import { Trix } from '@trixdb/client';

// 1. Pass the key explicitly
const client = new Trix({ apiKey: 'your_api_key' });

// 2. Or read TRIX_API_KEY (and optional TRIX_BASE_URL) from the environment
const fromEnv = Trix.fromEnv();
```

`Trix.fromEnv()` throws if `TRIX_API_KEY` is not set.

## Configuration

```typescript
const client = new Trix({
  apiKey: 'your_api_key',            // Required
  baseUrl: 'https://api.trixdb.com', // Optional, default shown
  maxRetries: 3,                     // Optional (default: 3)
  timeout: 30000,                    // Optional request timeout in ms (default: 30000)
  fetch: customFetch,                // Optional custom fetch / HTTP client
  allowInsecure: false,              // Optional: permit non-HTTPS base URLs (default: false)
});
```

Add custom headers (or observe requests/responses/errors) with interceptors:

```typescript
const remove = client.addRequestInterceptor((req) => {
  req.headers['X-Tenant-Id'] = 'acme';
  return req;
});
// ...later: remove(); to detach it
```

`addResponseInterceptor` and `addErrorInterceptor` are available too.

## Usage

### Memories

```typescript
// Create a text memory
const memory = await client.memories.create({
  content: 'Remember to buy milk',
  type: 'text',
  tags: ['shopping', 'personal'],
});

// Create a markdown memory
const mdMemory = await client.memories.create({
  content: '# Meeting Notes\n\n- Discussed project timeline',
  type: 'markdown',
  tags: ['meeting', 'work'],
});

// Get / update / delete
const retrieved = await client.memories.get(memory.id);
const updated = await client.memories.update(memory.id, {
  content: 'Updated content',
  tags: ['updated', 'important'],
});
await client.memories.delete(memory.id);

// List with search
const results = await client.memories.list({
  q: 'meeting',
  mode: 'hybrid',
  limit: 20,
  tags: ['work'],
});

// Iterate through every memory
for await (const m of client.memories.listAll({ limit: 100 })) {
  console.log(m.content);
}

// Bulk create
const bulkResult = await client.memories.bulkCreate([
  { content: 'Memory 1', tags: ['bulk'] },
  { content: 'Memory 2', tags: ['bulk'] },
]);
```

### Relationships

```typescript
// Create a relationship
const relationship = await client.relationships.create(
  sourceMemoryId,
  targetMemoryId,
  {
    relationshipType: 'supports',
    weight: 0.9,
    metadata: { context: 'research' },
  }
);

// Relationships are addressed by their (sourceId, targetId, type) key
const { sourceId, targetId, relationshipType } = relationship;

// Incoming / outgoing
const incoming = await client.relationships.getIncoming(memoryId);
const outgoing = await client.relationships.getOutgoing(memoryId);

// Update / reinforce / delete
const reweighted = await client.relationships.update(sourceId, targetId, relationshipType, {
  weight: 0.95,
});
const reinforced = await client.relationships.reinforce(sourceId, targetId, relationshipType, {
  boost: 0.1,
});
await client.relationships.delete(sourceId, targetId, relationshipType);
```

### Clusters

```typescript
const cluster = await client.clusters.create({
  name: 'Project Alpha',
  description: 'All memories related to Project Alpha',
  memoryIds: ['mem_1', 'mem_2'],
});

const clusters = await client.clusters.list({ limit: 20, sortBy: 'name' });

await client.clusters.addMemory(cluster.id, memoryId, 0.9);
const expansion = await client.clusters.expand(cluster.id, { limit: 10, threshold: 0.7 });
await client.clusters.removeMemory(cluster.id, memoryId);
```

### Spaces

```typescript
const space = await client.spaces.create({
  name: 'Personal',
  description: 'My personal knowledge base',
  metadata: { owner: 'user@example.com' },
});

const spaces = await client.spaces.list();
const updated = await client.spaces.update(space.id, { name: 'Personal Knowledge' });
await client.spaces.delete(space.id);
```

### Graph Operations

```typescript
// Traverse the graph
const graph = await client.graph.traverse({
  startNodeId: 'mem_123',
  maxDepth: 3,
  relationshipTypes: ['related_to', 'supports'],
  direction: 'both',
  limit: 100,
});

// Context around a memory
const context = await client.graph.getContext({
  memoryId: 'mem_123',
  depth: 2,
  includeMetadata: true,
});

// Shortest path between two memories
const path = await client.graph.shortestPath(sourceMemoryId, targetMemoryId, { maxDepth: 5 });
if (path.found) {
  console.log(`Path distance: ${path.distance}`);
}
```

### Search

```typescript
// Find similar memories
const similar = await client.search.similar('mem_123', {
  limit: 20,
  threshold: 0.75,
  includeEmbedding: false,
});
similar.results.forEach(({ memory, similarity }) => {
  console.log(`${memory.content} (${similarity.toFixed(2)})`);
});

// Generate embeddings
const embeddings = await client.search.embed(['mem_1', 'mem_2', 'mem_3']);
const embedAll = await client.search.embedAll(100);

// Search configuration
const config = await client.search.getConfig();
console.log(`Embedding model: ${config.embeddingModel}`);
```

### Bots

```typescript
const bot = await client.bots.create({
  name: 'Summarizer',
  system_prompt: 'You summarize meetings and extract action items.',
});

// Run and get the final result
const run = await client.bots.run(bot.id, { message: "Summarize today's standup" });

// Or run and poll until it finishes
const finished = await client.bots.runAndWait(bot.id, { message: 'Summarize' });
```

See [Streaming](#streaming) for token-by-token bot runs.

### Agent Sessions

```typescript
// Create a session
const session = await client.agent.createSession({
  name: 'Customer Support - Ticket #123',
  metadata: { ticketId: '123', agent: 'bot' },
});

// Add memories to the session
const sessionMemory = await client.agent.addSessionMemory(session.id, {
  content: 'User asked about pricing',
  tags: ['question', 'pricing'],
});

// Session history
const history = await client.agent.getSession(session.id, {
  includeMemories: true,
  limit: 50,
});

// Retrieve agent context
const context = await client.agent.getContext({
  sessionId: session.id,
  query: 'What did we discuss about pricing?',
  limit: 10,
  includeRelated: true,
});

// End the session
const ended = await client.agent.endSession(session.id);
```

### Feedback

```typescript
// Detailed feedback
const feedback = await client.feedback.submit({
  memoryId: 'mem_123',
  type: 'positive',
  comment: 'This memory was very useful',
  metadata: { source: 'user_rating' },
});

// Quick feedback
await client.feedback.quick({ memoryId: 'mem_123', type: 'thumbs_up' });

// Batch feedback
const batchResult = await client.feedback.batch({
  feedback: [
    { memoryId: 'mem_1', type: 'positive', comment: 'Great!' },
    { memoryId: 'mem_2', type: 'neutral' },
    { memoryId: 'mem_3', type: 'negative', comment: 'Not relevant' },
  ],
});
```

### Highlights

```typescript
// Create a highlight
const highlight = await client.highlights.create('mem_123', {
  text: 'This is the highlighted text',
  startOffset: 100,
  endOffset: 128,
  color: 'yellow',
  note: 'Remember this for later',
});

// List highlights for a memory
const highlights = await client.highlights.list('mem_123', { limit: 20 });

// Extract important highlights using AI
const extracted = await client.highlights.extract('mem_123', {
  method: 'ai',
  limit: 5,
  minLength: 20,
});

// Delete a highlight
await client.highlights.delete(highlight.id);
```

### Facts

The facts surface is read-mostly: list account facts, read the facts attached to a
memory, and attach new (subject–predicate–object) facts to a memory.

```typescript
// List facts across the account (paginated)
const { data: facts } = await client.facts.list({ limit: 20 });

// Read the facts attached to a specific memory
const memoryFacts = await client.facts.listForMemory('mem_123');
console.log(`${memoryFacts.total} facts on this memory`);

// Attach a new fact (subject–predicate–object triple) to a memory
const fact = await client.facts.createForMemory('mem_123', {
  subject: 'Albert Einstein',
  predicate: 'was_born_in',
  object: 'Ulm, Germany',
  confidence: 0.95,
});
```

### Entities

Named entities in the knowledge graph are read-mostly, plus a merge for
deduplication.

```typescript
// List entities (paginated), optionally filtered by type
const { data: entities } = await client.entities.list({ type: 'person', limit: 20 });

// Get one entity
const entity = await client.entities.get('ent_123');

// Filter by type
const people = await client.entities.findByType('person');

// Facts where the entity is the subject or object
const { facts } = await client.entities.getFacts('ent_123');

// Merge a duplicate into a canonical entity (the source is merged in and deleted)
const merged = await client.entities.merge('ent_canonical', 'ent_duplicate');
```

## Pagination

Every list endpoint supports manual paging and an auto-paginating async iterator.

### Manual

```typescript
const page1 = await client.memories.list({ page: 1, limit: 100 });
const page2 = await client.memories.list({ page: 2, limit: 100 });
```

### Async iteration (recommended)

```typescript
// Automatically fetches every page
for await (const memory of client.memories.listAll({ limit: 100 })) {
  console.log(memory.content);
}
```

`listAll` is also available on other paginated resources (e.g. `clusters.listAll`,
`highlights.listAll`, `webhooks.listAll`).

## Streaming

Stream a bot run over Server-Sent Events with `bots.runStream`. It returns an async
generator that yields typed `BotRunStep` events as the run progresses.

```typescript
import { Trix } from '@trixdb/client';

const client = new Trix({ apiKey: process.env.TRIX_API_KEY! });

const bot = await client.bots.create({
  name: 'Summarizer',
  system_prompt: 'You summarize meetings and extract action items.',
});

for await (const step of client.bots.runStream(bot.id, { message: "Summarize today's standup" })) {
  console.log(step.type, step.data); // 'thinking' | 'tool_call' | 'message' | 'done' | ...
  if (step.type === 'done') break;
}
```

## File Uploads

Upload files via multipart form data and fetch signed download URLs.

```typescript
import { readFile } from 'node:fs/promises';

const bytes = await readFile('./diagram.png');

const file = await client.files.upload({
  file: new Blob([bytes]),
  filename: 'diagram.png',
  conversationId: 'conv_123',
});

// Signed, time-limited download URL
const download = await client.files.getDownloadUrl(file.id);
console.log(download.url);

// Storage quota for the account
const quota = await client.files.getQuota();
```

`file` accepts a `Blob` or `Buffer`. Uploads are validated client-side against
`MAX_FILE_SIZE`; oversized files throw a `FileSizeError` before any request is sent.
`validateFileSize` is exported if you want to check ahead of time.

## Idempotency

Every mutating request (`POST`, `PUT`, `PATCH`, `DELETE`) automatically carries an
`Idempotency-Key` header — a fresh UUID v4 generated **once per logical request,
before any retry**. If a network error hides an already-successful write, the
built-in retry reuses the same key, so the server de-duplicates it instead of
applying it twice.

You never have to manage this. If you set your own `Idempotency-Key` (for example
via a request interceptor), the SDK detects it and leaves it untouched.

## Webhooks

### Managing webhooks

```typescript
// Create a webhook
const webhook = await client.webhooks.create({
  url: 'https://api.example.com/webhook',
  events: ['memory.created', 'memory.updated', 'memory.deleted'],
  secret: 'your_webhook_secret',
  active: true,
});

// List, test, inspect deliveries, retry, delete
const list = await client.webhooks.list({ active: true });
const testResult = await client.webhooks.test(webhook.id, 'memory.created');
const deliveries = await client.webhooks.getDeliveries(webhook.id, { status: 'failed', limit: 20 });
await client.webhooks.retryDelivery(webhook.id, 'del_456');
await client.webhooks.delete(webhook.id);
```

`getEvents`, `getEventTypes`, `getStats`, `bulkCreate`, and `bulkDelete` are also
available.

### Verifying inbound webhooks

Trix signs every delivery with an `X-Webhook-Signature: t=<unix>,v1=<hex>` header —
an **HMAC-SHA256** of `` `${t}.${rawBody}` `` keyed by the endpoint's signing secret.
`client.webhooks.verifySignature` recomputes it, compares in **constant time**, and
enforces a **replay window** (default **300 seconds**, `DEFAULT_WEBHOOK_TOLERANCE_SECONDS`).
It **fails closed**: it returns `false` — never throws — for a bad signature, a wrong
secret, an expired timestamp, or a malformed header.

Always verify the **raw request bytes**. Re-serializing the JSON reorders keys and
breaks the HMAC.

```typescript
import express from 'express';
import { Trix } from '@trixdb/client';

const client = new Trix({ apiKey: process.env.TRIX_API_KEY! });
const app = express();

// Capture the raw body so the exact signed bytes are verified
app.post('/webhooks/trix', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = req.body.toString('utf8');
  const signature = req.header('X-Webhook-Signature') ?? '';
  const secret = process.env.TRIX_WEBHOOK_SECRET!;

  const ok = await client.webhooks.verifySignature(rawBody, signature, secret, {
    toleranceSeconds: 300, // optional; this is the default
  });
  if (!ok) return res.status(400).send('invalid signature');

  const event = JSON.parse(rawBody);
  // ...handle the verified event
  res.sendStatus(204);
});
```

Prefer `unwrap<T>` to verify and parse in one step. It throws a
`WebhookVerificationError` when verification fails, so a valid return value is proof
the payload is authentic:

```typescript
import { WebhookVerificationError } from '@trixdb/client';

try {
  const event = await client.webhooks.unwrap<{ type: string; data: unknown }>(
    rawBody,
    signature,
    secret
  );
  // event is verified AND parsed
} catch (err) {
  if (err instanceof WebhookVerificationError) {
    // reject the delivery
  }
}
```

The verification helpers are also exported standalone, so you can verify without
constructing a client (handy in edge functions and workers):

```typescript
import {
  verifyWebhookSignature,
  unwrapWebhookPayload,
  DEFAULT_WEBHOOK_TOLERANCE_SECONDS, // 300
} from '@trixdb/client';

const ok = await verifyWebhookSignature(rawBody, signature, secret);
const event = await unwrapWebhookPayload<{ type: string }>(rawBody, signature, secret);
```

Built on Web Crypto, so it runs unchanged on Node.js 20+, Deno, Bun, Cloudflare
Workers, and the browser.

## Error Handling

The SDK throws a typed hierarchy — every error extends `TrixError`.

```typescript
import {
  TrixError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  APIError,
} from '@trixdb/client';

try {
  const memory = await client.memories.get('invalid_id');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof NotFoundError) {
    console.error('Memory not found');
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof NetworkError) {
    console.error('Network error occurred');
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof APIError) {
    console.error('API error:', error.statusCode, error.response);
  }
}
```

`PermissionError`, `ConflictError`, `ServerError`, `FileSizeError`,
`WebhookVerificationError`, and `APIVersionMismatchError` are exported as well.

## Automatic Retries

Failed requests are retried automatically with exponential backoff and jitter for:

- Rate-limit responses (429) — honoring the `Retry-After` header
- Network errors
- Timeouts
- Server errors (5xx)

```typescript
const client = new Trix({
  apiKey: 'your_api_key',
  maxRetries: 3, // default: 3
  timeout: 30000, // ms, default: 30000
});
```

Retries reuse the same `Idempotency-Key` (see [Idempotency](#idempotency)), so a retried
write is de-duplicated rather than re-applied.

## Testing

The package ships a mock client at `@trixdb/client/testing` so you can unit-test code
that uses the SDK without any network calls.

```typescript
import { MockTrix, createMockMemory } from '@trixdb/client/testing';

const client = new MockTrix();

// Queue a response and record calls
client.memories.mockCreate(createMockMemory({ content: 'Hello' }));

const memory = await client.memories.create({ content: 'Hello' });

expect(memory.content).toBe('Hello');
expect(client.memories.createCalls).toHaveLength(1);
```

Factory helpers (`createMockMemory`, `createMockCluster`, `createMockEntity`,
`createMockFact`, `createMockRelationship`, `createMockPaginatedResponse`,
`createMockBulkResult`) build well-formed fixtures.

## TypeScript Support

The SDK is written in TypeScript and ships complete type definitions.

```typescript
import type {
  Memory,
  Cluster,
  Relationship,
  CreateMemoryParams,
  ListMemoriesParams,
  PaginatedResponse,
} from '@trixdb/client';

const params: CreateMemoryParams = {
  content: 'Typed memory creation',
  tags: ['typescript'],
};

const memory: Memory = await client.memories.create(params);
```

## Browser Usage

The SDK works in modern browsers with the Fetch API and Web Crypto:

```typescript
import { Trix } from '@trixdb/client';

const client = new Trix({ apiKey: 'your_api_key' });

const memory = await client.memories.create({
  content: 'Browser memory',
  tags: ['browser'],
});
```

## Advanced Usage

### Custom Fetch Implementation

Provide a custom `fetch` for testing or non-standard environments:

```typescript
import { Trix } from '@trixdb/client';
import fetch from 'node-fetch';

const client = new Trix({
  apiKey: 'your_api_key',
  fetch: fetch as unknown as typeof globalThis.fetch,
});
```

### Audio Transcription

```typescript
// Create an audio memory
const audioMemory = await client.memories.create({
  content: 'Audio recording',
  type: 'audio',
  audioFile: audioBlob, // Blob or Buffer
});

// Request transcription
const job = await client.memories.transcribe(audioMemory.id, { language: 'en' });

// Fetch the transcript once processing completes
const transcript = await client.memories.getTranscript(audioMemory.id);
console.log(transcript.text);

// Or stream the raw audio bytes
const stream = await client.memories.streamAudio(audioMemory.id);
```

## Requirements

- **Node.js 20+** (for native `fetch` and Web Crypto), or any runtime with the Fetch
  and Web Crypto APIs (Deno, Bun, Cloudflare Workers, modern browsers).

## Related SDKs

Trix ships official SDKs for several languages — pick the one that fits your stack:

- **Python** — [`trixdb/trix-sdk-python`](https://github.com/trixdb/trix-sdk-python) (`pip install trixdb`)
- **Go** — [`trixdb/trix-sdk-go`](https://github.com/trixdb/trix-sdk-go) — the streaming-focused client
- **C# / .NET** — [`trixdb/trix-sdk-csharp`](https://github.com/trixdb/trix-sdk-csharp) (NuGet)

## License

Copyright 2026 TrixDB.

Licensed under the [Apache License, Version 2.0](LICENSE).

## Support

- Website: [https://trixdb.com](https://trixdb.com)
- Documentation: [https://docs.trixdb.com](https://docs.trixdb.com)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Email: support@trixdb.com
