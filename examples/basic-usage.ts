/**
 * Basic usage example for Trix SDK
 */

import { Trix } from '../src/index.js';

async function main() {
  // Initialize the client
  const client = new Trix({
    apiKey: process.env.TRIX_API_KEY || 'your_api_key',
    baseUrl: 'https://api.trixdb.com',
  });

  try {
    // Create a memory
    console.log('Creating a memory...');
    const memory = await client.memories.create({
      content: 'Trix is a powerful memory and knowledge management system',
      tags: ['introduction', 'knowledge-base'],
      metadata: {
        source: 'example',
        importance: 'high',
      },
    });
    console.log('Memory created:', memory.id);

    // Create another memory
    const memory2 = await client.memories.create({
      content: 'TypeScript provides excellent type safety for API clients',
      tags: ['typescript', 'development'],
    });
    console.log('Second memory created:', memory2.id);

    // Create a relationship
    console.log('\nCreating a relationship...');
    const relationship = await client.relationships.create(memory.id, memory2.id, {
      relationshipType: 'related_to',
      strength: 0.85,
      metadata: {
        reason: 'Both about software development',
      },
    });
    console.log('Relationship created:', relationship.id);

    // Search for memories
    console.log('\nSearching for memories...');
    const searchResults = await client.memories.list({
      q: 'TypeScript',
      mode: 'hybrid',
      limit: 10,
    });
    console.log(`Found ${searchResults.data.length} memories`);

    // Create a cluster
    console.log('\nCreating a cluster...');
    const cluster = await client.clusters.create({
      name: 'Development Knowledge',
      description: 'Memories about software development',
      memoryIds: [memory.id, memory2.id],
    });
    console.log('Cluster created:', cluster.id);

    // Get context for a memory
    console.log('\nGetting context...');
    const context = await client.graph.getContext({
      memoryId: memory.id,
      depth: 2,
      includeMetadata: true,
    });
    console.log(`Context includes ${context.related.length} related memories`);

    // Find similar memories
    console.log('\nFinding similar memories...');
    const similar = await client.search.similar(memory.id, {
      limit: 5,
      threshold: 0.7,
    });
    console.log(`Found ${similar.results.length} similar memories`);

    // List all memories using async iteration
    console.log('\nIterating through memories...');
    let count = 0;
    for await (const mem of client.memories.listAll({ limit: 10 })) {
      count++;
      console.log(`- ${mem.content.substring(0, 50)}...`);
      if (count >= 5) break; // Just show first 5 for example
    }

    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Run the example
main().catch(console.error);
