# Quick Start Guide

Get up and running with the Trix TypeScript SDK in 5 minutes.

## Installation

```bash
npm install @trix/client
```

Or with yarn:
```bash
yarn add @trix/client
```

Or with pnpm:
```bash
pnpm add @trix/client
```

## Basic Setup

```typescript
import { Trix } from '@trix/client';

const client = new Trix({
  apiKey: 'your_api_key'  // Get your API key from https://trixdb.com/dashboard
});
```

## Your First Memory

```typescript
// Create a memory
const memory = await client.memories.create({
  content: 'Trix is a powerful knowledge management system',
  tags: ['introduction', 'knowledge-base']
});

console.log('Memory created:', memory.id);
```

## Search Memories

```typescript
// Search for memories
const results = await client.memories.list({
  q: 'knowledge',
  mode: 'hybrid',  // Use hybrid search (semantic + keyword)
  limit: 10
});

results.data.forEach(memory => {
  console.log(memory.content);
});
```

## Connect Memories

```typescript
// Create another memory
const memory2 = await client.memories.create({
  content: 'Graph databases enable efficient relationship queries'
});

// Create a relationship
const relationship = await client.relationships.create(
  memory.id,
  memory2.id,
  {
    relationshipType: 'related_to',
    strength: 0.9
  }
);

console.log('Relationship created:', relationship.id);
```

## Organize with Clusters

```typescript
// Create a cluster
const cluster = await client.clusters.create({
  name: 'Knowledge Management',
  description: 'Memories about knowledge management systems',
  memoryIds: [memory.id, memory2.id]
});

console.log('Cluster created:', cluster.id);
```

## Explore the Graph

```typescript
// Traverse the graph
const graph = await client.graph.traverse({
  startNodeId: memory.id,
  maxDepth: 2,
  direction: 'both'
});

console.log(`Found ${graph.nodes.length} connected memories`);
```

## Find Similar Memories

```typescript
// Find similar memories
const similar = await client.search.similar(memory.id, {
  limit: 5,
  threshold: 0.7
});

similar.results.forEach(({ memory, similarity }) => {
  console.log(`${memory.content} (${similarity.toFixed(2)})`);
});
```

## Error Handling

```typescript
import { NotFoundError, ValidationError } from '@trix/client';

try {
  const memory = await client.memories.get('invalid_id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Memory not found');
  } else if (error instanceof ValidationError) {
    console.error('Invalid parameters:', error.errors);
  }
}
```

## Pagination Made Easy

```typescript
// Iterate through all memories automatically
for await (const memory of client.memories.listAll({ limit: 100 })) {
  console.log(memory.content);
  // No need to handle pagination manually!
}
```

## Complete Example

```typescript
import { Trix } from '@trix/client';

async function main() {
  const client = new Trix({
    apiKey: process.env.TRIX_API_KEY
  });

  // Create memories
  const mem1 = await client.memories.create({
    content: 'Machine learning enables computers to learn from data',
    tags: ['AI', 'ML']
  });

  const mem2 = await client.memories.create({
    content: 'Neural networks are inspired by biological neurons',
    tags: ['AI', 'neural-networks']
  });

  // Link them
  await client.relationships.create(mem1.id, mem2.id, {
    relationshipType: 'related_to',
    strength: 0.85
  });

  // Search
  const results = await client.memories.list({
    q: 'machine learning',
    mode: 'semantic',
    limit: 5
  });

  console.log(`Found ${results.data.length} related memories`);
}

main().catch(console.error);
```

## Next Steps

- Read the [full documentation](./README.md)
- Explore [examples](./examples/)
- Check the [API reference](https://docs.trixdb.com)
- Join our [Discord community](https://discord.gg/trix)

## Common Patterns

### Agent Sessions

```typescript
// Create a session for tracking conversations
const session = await client.agent.createSession({
  name: 'Customer Support Chat'
});

// Add memories to the session
await client.agent.addSessionMemory(session.id, {
  content: 'User asked about pricing'
});

// Get context for next response
const context = await client.agent.getContext({
  sessionId: session.id,
  query: 'pricing',
  limit: 5
});
```

### Webhooks

```typescript
// Get notified of changes
const webhook = await client.webhooks.create({
  url: 'https://your-app.com/webhook',
  events: ['memory.created', 'memory.updated']
});

// Test it
const result = await client.webhooks.test(webhook.id);
```

### Bulk Operations

```typescript
// Create multiple memories at once
const result = await client.memories.bulkCreate([
  { content: 'Memory 1', tags: ['bulk'] },
  { content: 'Memory 2', tags: ['bulk'] },
  { content: 'Memory 3', tags: ['bulk'] }
]);

console.log(`Created ${result.success} memories`);
```

## Tips

1. **Use semantic search** for better results when searching natural language
2. **Tag your memories** for easier organization and filtering
3. **Set relationship strength** based on how strongly connected concepts are
4. **Use clusters** to group related memories automatically
5. **Enable webhooks** to keep your app in sync with Trix

## Configuration Options

```typescript
const client = new Trix({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.trixdb.com',  // Optional: custom API endpoint
  maxRetries: 3,                      // Optional: max retry attempts
  timeout: 30000                      // Optional: request timeout (ms)
});
```

## TypeScript Support

The SDK is fully typed. Your IDE will provide autocomplete and type checking:

```typescript
import type { Memory, CreateMemoryParams } from '@trix/client';

const params: CreateMemoryParams = {
  content: 'Typed content',
  tags: ['typescript']
};

const memory: Memory = await client.memories.create(params);
// TypeScript knows the exact shape of `memory`
```

## Browser Usage

The SDK works in browsers too:

```html
<script type="module">
  import { Trix } from 'https://cdn.skypack.dev/@trix/client';

  const client = new Trix({
    apiKey: 'your_api_key'
  });

  const memory = await client.memories.create({
    content: 'Created from the browser!'
  });
</script>
```

## Need Help?

- Documentation: [README.md](./README.md)
- Issues: [GitHub Issues](https://github.com/trix/trix-typescript-sdk/issues)
- Email: support@trixdb.com

Happy building with Trix!
