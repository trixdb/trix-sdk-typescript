/**
 * Graph traversal example for TrixDB SDK
 *
 * Demonstrates how to traverse and analyze the knowledge graph.
 */

import { TrixDB } from '../src/index.js';

async function exploreGraph() {
  const client = new TrixDB({
    apiKey: process.env.TRIXDB_API_KEY || 'your_api_key',
  });

  try {
    // Create a small knowledge graph
    console.log('Building a knowledge graph...');

    // Create memories
    const nodeA = await client.memories.create({
      content: 'Node A: Introduction to Graph Theory',
      tags: ['graph', 'theory'],
    });

    const nodeB = await client.memories.create({
      content: 'Node B: Graph Traversal Algorithms',
      tags: ['graph', 'algorithms'],
    });

    const nodeC = await client.memories.create({
      content: 'Node C: Breadth-First Search',
      tags: ['algorithms', 'bfs'],
    });

    const nodeD = await client.memories.create({
      content: 'Node D: Depth-First Search',
      tags: ['algorithms', 'dfs'],
    });

    const nodeE = await client.memories.create({
      content: 'Node E: Applications of Graph Algorithms',
      tags: ['applications'],
    });

    // Create relationships
    console.log('Creating relationships...');
    await client.relationships.create(nodeA.id, nodeB.id, {
      relationshipType: 'prerequisite',
      strength: 0.9,
    });

    await client.relationships.create(nodeB.id, nodeC.id, {
      relationshipType: 'includes',
      strength: 0.85,
    });

    await client.relationships.create(nodeB.id, nodeD.id, {
      relationshipType: 'includes',
      strength: 0.85,
    });

    await client.relationships.create(nodeC.id, nodeE.id, {
      relationshipType: 'used_in',
      strength: 0.7,
    });

    await client.relationships.create(nodeD.id, nodeE.id, {
      relationshipType: 'used_in',
      strength: 0.7,
    });

    console.log('Graph created successfully!');

    // Traverse the graph from node A
    console.log('\nTraversing graph from Node A...');
    const graph = await client.graph.traverse({
      startNodeId: nodeA.id,
      maxDepth: 3,
      direction: 'outgoing',
      limit: 100,
    });

    console.log(`Found ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
    console.log('\nNodes:');
    graph.nodes.forEach((node) => {
      console.log(`- Depth ${node.depth}: ${(node.data as any).content}`);
    });

    console.log('\nEdges:');
    graph.edges.forEach((edge) => {
      console.log(`- ${edge.relationship.relationshipType} (strength: ${edge.relationship.strength})`);
    });

    // Get context for Node B
    console.log('\nGetting context for Node B...');
    const context = await client.graph.getContext({
      memoryId: nodeB.id,
      depth: 2,
      includeMetadata: true,
    });

    console.log(`Context for "${context.central.content}"`);
    console.log(`Related memories: ${context.related.length}`);
    console.log(`Relationships: ${context.relationships.length}`);

    // Find shortest path from Node A to Node E
    console.log('\nFinding shortest path from Node A to Node E...');
    const path = await client.graph.shortestPath(nodeA.id, nodeE.id, {
      maxDepth: 5,
    });

    if (path.found) {
      console.log(`Path found! Distance: ${path.distance}`);
      console.log('Path:');
      path.path.forEach((step, index) => {
        console.log(`${index + 1}. ${step.node.content}`);
        if (step.relationship) {
          console.log(`   -> ${step.relationship.relationshipType}`);
        }
      });
    } else {
      console.log('No path found');
    }

    // Get incoming and outgoing relationships for Node B
    console.log('\nAnalyzing Node B relationships...');
    const incoming = await client.relationships.getIncoming(nodeB.id);
    const outgoing = await client.relationships.getOutgoing(nodeB.id);

    console.log(`Incoming relationships: ${incoming.length}`);
    incoming.forEach((rel) => {
      console.log(`  <- ${rel.relationshipType} (from ${rel.sourceId})`);
    });

    console.log(`Outgoing relationships: ${outgoing.length}`);
    outgoing.forEach((rel) => {
      console.log(`  -> ${rel.relationshipType} (to ${rel.targetId})`);
    });

    console.log('\nGraph traversal example completed!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

exploreGraph().catch(console.error);
