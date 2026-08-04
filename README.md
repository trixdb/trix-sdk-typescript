# Trix TypeScript SDK

Official TypeScript SDK for Trix - A memory and knowledge management API.

[![npm version](https://img.shields.io/npm/v/@trixdb/client.svg)](https://www.npmjs.com/package/@trixdb/client)

## Features

- **Full TypeScript Support** - Complete type definitions for all API endpoints
- **Promise-based API** - Modern async/await support
- **Automatic Retry** - Built-in retry logic with exponential backoff for rate limits
- **Pagination Helpers** - Async iterators for easy pagination
- **Tree-shakeable** - ESM and CJS builds for optimal bundle size
- **Zero Dependencies** - Uses native fetch and Web Crypto (Node.js 20+)
- **Resource-based API** - Clean, organized API structure
- **Works Everywhere** - Node.js and browser support

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
  baseUrl: 'https://api.trixdb.com' // optional, defaults to production API
});

// Create a memory
const memory = await client.memories.create({
  content: 'Important information to remember',
  tags: ['important', 'note'],
  metadata: { source: 'user_input' }
});

// Search memories
const results = await client.memories.list({
  q: 'important',
  mode: 'hybrid',
  limit: 10
});

// Create a relationship
const rel = await client.relationships.create(memory.id, otherMemory.id, {
  relationshipType: 'related_to',
  strength: 0.8
});
```

## Configuration

```typescript
const client = new Trix({
  apiKey: 'your_api_key',        // Required: Your Trix API key
  baseUrl: 'https://api.trixdb.com', // Optional: API base URL
  maxRetries: 3,                 // Optional: Max retry attempts (default: 3)
  timeout: 30000,                // Optional: Request timeout in ms (default: 30000)
});
```

## Usage Examples

### Memories

```typescript
// Create a text memory
const memory = await client.memories.create({
  content: 'Remember to buy milk',
  type: 'text',
  tags: ['shopping', 'personal']
});

// Create a markdown memory
const mdMemory = await client.memories.create({
  content: '# Meeting Notes\n\n- Discussed project timeline',
  type: 'markdown',
  tags: ['meeting', 'work']
});

// Get a memory
const retrieved = await client.memories.get(memory.id);

// Update a memory
const updated = await client.memories.update(memory.id, {
  content: 'Updated content',
  tags: ['updated', 'important']
});

// List memories with search
const results = await client.memories.list({
  q: 'meeting',
  mode: 'hybrid',
  limit: 20,
  tags: ['work']
});

// Iterate through all memories
for await (const memory of client.memories.listAll({ limit: 100 })) {
  console.log(memory.content);
}

// Bulk operations
const bulkResult = await client.memories.bulkCreate([
  { content: 'Memory 1', tags: ['bulk'] },
  { content: 'Memory 2', tags: ['bulk'] }
]);

// Delete a memory
await client.memories.delete(memory.id);
```

### Relationships

```typescript
// Create a relationship
const relationship = await client.relationships.create(
  sourceMemoryId,
  targetMemoryId,
  {
    relationshipType: 'supports',
    strength: 0.9,
    metadata: { context: 'research' }
  }
);

// Get incoming relationships
const incoming = await client.relationships.getIncoming(memoryId);

// Get outgoing relationships
const outgoing = await client.relationships.getOutgoing(memoryId);

// Update a relationship
const updated = await client.relationships.update(relationship.id, {
  strength: 0.95
});

// Reinforce a relationship
const reinforced = await client.relationships.reinforce(relationship.id, {
  amount: 0.1
});

// Delete a relationship
await client.relationships.delete(relationship.id);
```

### Clusters

```typescript
// Create a cluster
const cluster = await client.clusters.create({
  name: 'Project Alpha',
  description: 'All memories related to Project Alpha',
  memoryIds: ['mem_1', 'mem_2']
});

// List clusters
const clusters = await client.clusters.list({
  limit: 20,
  sortBy: 'name'
});

// Add a memory to a cluster
await client.clusters.addMemory(cluster.id, memoryId, 0.9);

// Expand a cluster (find similar memories)
const expansion = await client.clusters.expand(cluster.id, {
  limit: 10,
  threshold: 0.7
});

// Remove a memory from a cluster
await client.clusters.removeMemory(cluster.id, memoryId);
```

### Spaces

```typescript
// Create a space
const space = await client.spaces.create({
  name: 'Personal',
  description: 'My personal knowledge base',
  metadata: { owner: 'user@example.com' }
});

// List all spaces
const spaces = await client.spaces.list();

// Update a space
const updated = await client.spaces.update(space.id, {
  name: 'Personal Knowledge'
});

// Delete a space
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
  limit: 100
});

// Get context for a memory
const context = await client.graph.getContext({
  memoryId: 'mem_123',
  depth: 2,
  includeMetadata: true
});

// Find shortest path between memories
const path = await client.graph.shortestPath(
  sourceMemoryId,
  targetMemoryId,
  { maxDepth: 5 }
);

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
  includeEmbedding: false
});

similar.results.forEach(({ memory, similarity }) => {
  console.log(`${memory.content} (${similarity.toFixed(2)})`);
});

// Generate embeddings for specific memories
const embeddings = await client.search.embed(['mem_1', 'mem_2', 'mem_3']);

// Generate embeddings for all memories
const embedAll = await client.search.embedAll(100);

// Get search configuration
const config = await client.search.getConfig();
console.log(`Embedding model: ${config.embeddingModel}`);
```

### Webhooks

```typescript
// Create a webhook
const webhook = await client.webhooks.create({
  url: 'https://api.example.com/webhook',
  events: ['memory.created', 'memory.updated', 'memory.deleted'],
  secret: 'your_webhook_secret',
  active: true
});

// Test a webhook
const testResult = await client.webhooks.test(webhook.id, 'memory.created');

if (testResult.success) {
  console.log('Webhook test successful!');
}

// Get webhook deliveries
const deliveries = await client.webhooks.getDeliveries(webhook.id, {
  status: 'failed',
  limit: 20
});

// Retry a failed delivery
await client.webhooks.retryDelivery(webhook.id, deliveryId);

// Delete a webhook
await client.webhooks.delete(webhook.id);
```

### Agent Sessions

```typescript
// Create a session
const session = await client.agent.createSession({
  name: 'Customer Support - Ticket #123',
  metadata: { ticketId: '123', agent: 'bot' }
});

// Add memories to a session
const sessionMemory = await client.agent.addSessionMemory(session.id, {
  content: 'User asked about pricing',
  tags: ['question', 'pricing']
});

// Get session history
const history = await client.agent.getSession(session.id, {
  includeMemories: true,
  limit: 50
});

// Get agent context
const context = await client.agent.getContext({
  sessionId: session.id,
  query: 'What did we discuss about pricing?',
  limit: 10,
  includeRelated: true
});

// End a session with consolidation
const ended = await client.agent.endSession(session.id, {
  consolidate: true
});

// Consolidate memories
const consolidation = await client.agent.consolidate({
  threshold: 0.8,
  maxClusters: 100,
  priority: 'high'
});
```

### Feedback

```typescript
// Submit detailed feedback
const feedback = await client.feedback.submit({
  memoryId: 'mem_123',
  type: 'positive',
  comment: 'This memory was very useful',
  metadata: { source: 'user_rating' }
});

// Submit quick feedback
await client.feedback.quick({
  memoryId: 'mem_123',
  type: 'thumbs_up'
});

// Submit batch feedback
const batchResult = await client.feedback.batch({
  feedback: [
    { memoryId: 'mem_1', type: 'positive', comment: 'Great!' },
    { memoryId: 'mem_2', type: 'neutral' },
    { memoryId: 'mem_3', type: 'negative', comment: 'Not relevant' }
  ]
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
  note: 'Remember this for later'
});

// List highlights for a memory
const highlights = await client.highlights.list('mem_123', {
  limit: 20
});

// Extract important highlights using AI
const extracted = await client.highlights.extract('mem_123', {
  method: 'ai',
  limit: 5,
  minLength: 20
});

extracted.highlights.forEach(({ text, score }) => {
  console.log(`${text} (score: ${score})`);
});

// Delete a highlight
await client.highlights.delete(highlight.id);
```

### Jobs

```typescript
// Get job statistics
const stats = await client.jobs.getStats();

stats.queues.forEach(queue => {
  console.log(`Queue: ${queue.name}`);
  console.log(`  Active: ${queue.active}`);
  console.log(`  Failed: ${queue.failed}`);
});

// Get a specific job
const job = await client.jobs.get('transcription', 'job_123');

// List jobs
const jobs = await client.jobs.list({
  queue: 'transcription',
  status: 'failed',
  limit: 20
});

// Retry a failed job
await client.jobs.retry('transcription', 'job_123');

// Clean up old jobs
const cleanResult = await client.jobs.clean('transcription', {
  status: 'completed',
  grace: 86400000, // 24 hours in ms
  limit: 100
});
```

### Facts (Knowledge Graph Triples)

```typescript
// Create a fact (Subject-Predicate-Object triple)
const fact = await client.facts.create({
  subject: 'Albert Einstein',
  predicate: 'was_born_in',
  object: 'Ulm, Germany',
  confidence: 0.95,
  source: { method: 'extracted', memoryId: 'mem_123' }
});

// Query facts using natural language
const results = await client.facts.query('Where was Einstein born?', {
  limit: 5,
  minConfidence: 0.8
});

// List facts with filters
const facts = await client.facts.list({
  subject: 'Einstein',
  minConfidence: 0.9
});

// Find facts by subject/predicate/object
const bySubject = await client.facts.findBySubject('Einstein');
const byPredicate = await client.facts.findByPredicate('discovered');
const byObject = await client.facts.findByObject('Theory of Relativity');

// Extract facts from a memory
const extracted = await client.facts.extract('mem_123', { save: true });

// Verify a fact against the knowledge base
const verification = await client.facts.verify('fact_123');
if (verification.verified) {
  console.log(`Supported by ${verification.supportingMemories.length} memories`);
}

// Bulk create facts
const bulk = await client.facts.bulkCreate([
  { subject: 'A', predicate: 'is', object: 'B', confidence: 1.0 },
  { subject: 'C', predicate: 'has', object: 'D', confidence: 0.9 }
]);

// Delete a fact
await client.facts.delete('fact_123');
```

### Entities (Named Entity Management)

```typescript
// Create an entity
const entity = await client.entities.create({
  name: 'Albert Einstein',
  type: 'person',
  aliases: ['Einstein', 'A. Einstein', 'Prof. Einstein'],
  description: 'Theoretical physicist',
  properties: { birthYear: 1879, field: 'physics' }
});

// Search entities
const results = await client.entities.search('Einstein', {
  type: 'person',
  limit: 10
});

// List entities by type
const people = await client.entities.findByType('person');

// Resolve text to an entity
const resolution = await client.entities.resolve('Einstein', {
  context: 'Nobel Prize in Physics'
});
if (resolution.entity) {
  console.log(`Resolved to ${resolution.entity.name} (${resolution.confidence})`);
}

// Extract entities from a memory
const extracted = await client.entities.extract('mem_123', {
  save: true,
  link: true
});

// Link/unlink entity to memory
await client.entities.linkToMemory('ent_123', 'mem_456');
await client.entities.unlinkFromMemory('ent_123', 'mem_456');

// Find entities in a memory
const memoryEntities = await client.entities.findByMemory('mem_123');

// Merge duplicate entities
const merged = await client.entities.merge('ent_target', 'ent_source');

// Get facts about an entity
const entityFacts = await client.entities.getFacts('ent_123');

// Get all entity types
const types = await client.entities.getTypes();
types.types.forEach(t => console.log(`${t.name}: ${t.count} entities`));

// Bulk operations
const bulk = await client.entities.bulkCreate([
  { name: 'Einstein', type: 'person' },
  { name: 'Berlin', type: 'location' }
]);

// Delete an entity
await client.entities.delete('ent_123');
```

## Pagination

The SDK provides two ways to handle pagination:

### 1. Manual Pagination

```typescript
const page1 = await client.memories.list({ page: 1, limit: 100 });
const page2 = await client.memories.list({ page: 2, limit: 100 });
```

### 2. Async Iteration (Recommended)

```typescript
// Automatically fetches all pages
for await (const memory of client.memories.listAll({ limit: 100 })) {
  console.log(memory.content);
}
```

## Error Handling

The SDK provides specific error classes for different scenarios:

```typescript
import {
  TrixError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  APIError
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
    console.error('Rate limit exceeded, retry after:', error.retryAfter);
  } else if (error instanceof NetworkError) {
    console.error('Network error occurred');
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof APIError) {
    console.error('API error:', error.statusCode, error.response);
  }
}
```

## Automatic Retry

The SDK automatically retries failed requests with exponential backoff for:
- Rate limit errors (429)
- Network errors
- Timeout errors

Configuration:

```typescript
const client = new Trix({
  apiKey: 'your_api_key',
  maxRetries: 3, // Maximum number of retry attempts (default: 3)
  timeout: 30000 // Request timeout in milliseconds (default: 30000)
});
```

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions:

```typescript
import type {
  Memory,
  Cluster,
  Relationship,
  CreateMemoryParams,
  ListMemoriesParams,
  PaginatedResponse
} from '@trixdb/client';

const params: CreateMemoryParams = {
  content: 'Typed memory creation',
  tags: ['typescript']
};

const memory: Memory = await client.memories.create(params);
```

## Browser Usage

The SDK works in modern browsers that support the Fetch API:

```typescript
import { Trix } from '@trixdb/client';

const client = new Trix({
  apiKey: 'your_api_key'
});

// All methods work the same in browsers
const memory = await client.memories.create({
  content: 'Browser memory',
  tags: ['browser']
});
```

## Advanced Usage

### Custom Fetch Implementation

You can provide a custom fetch implementation for testing or specific environments:

```typescript
import { Trix } from '@trixdb/client';
import fetch from 'node-fetch';

const client = new Trix({
  apiKey: 'your_api_key',
  fetch: fetch as any
});
```

### Audio Transcription

```typescript
// Create an audio memory
const audioMemory = await client.memories.create({
  content: 'Audio recording',
  type: 'audio',
  audioFile: audioBlob // Blob or Buffer
});

// Request transcription
const job = await client.memories.transcribe(audioMemory.id, {
  language: 'en',
  priority: 'high'
});

// Check transcription status
const transcriptionJob = await client.jobs.get('transcription', job.id);

// Get transcript when ready
if (transcriptionJob.status === 'completed') {
  const transcript = await client.memories.getTranscript(audioMemory.id);
  console.log(transcript.text);
}

// Stream audio
const stream = await client.memories.streamAudio(audioMemory.id);
```

## License

Copyright © 2025 Trix. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Support

- Website: [https://trixdb.com](https://trixdb.com)
- Documentation: [https://docs.trixdb.com](https://docs.trixdb.com)
- Support: [https://trixdb.com/support](https://trixdb.com/support)
- Email: support@trixdb.com

## Changelog

### 0.1.0 (2025-12-30)

- Initial public release
- Full API coverage for Trix
- TypeScript support
- Automatic retry with exponential backoff
- Pagination helpers
- ESM and CJS builds
