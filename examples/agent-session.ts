/**
 * Agent session example for TrixDB SDK
 *
 * Demonstrates how to use agent sessions for tracking conversations
 * and interactions with context-aware memory management.
 */

import { TrixDB } from '../src/index.js';

async function runAgentSession() {
  const client = new TrixDB({
    apiKey: process.env.TRIXDB_API_KEY || 'your_api_key',
  });

  try {
    // Create a new agent session
    console.log('Creating agent session...');
    const session = await client.agent.createSession({
      name: 'Customer Support - Q&A Session',
      metadata: {
        customerId: 'cust_123',
        channel: 'chat',
        agent: 'ai_assistant',
      },
    });
    console.log(`Session created: ${session.id}`);

    // Simulate a conversation with memory creation
    console.log('\nSimulating conversation...');

    // User question 1
    await client.agent.addSessionMemory(session.id, {
      content: 'User asked: How do I reset my password?',
      tags: ['question', 'authentication'],
      metadata: { role: 'user', timestamp: new Date().toISOString() },
    });

    // Agent response 1
    await client.agent.addSessionMemory(session.id, {
      content: 'Agent responded: You can reset your password by clicking "Forgot Password" on the login page.',
      tags: ['response', 'authentication'],
      metadata: { role: 'assistant', timestamp: new Date().toISOString() },
    });

    // User question 2
    await client.agent.addSessionMemory(session.id, {
      content: 'User asked: What are the pricing plans?',
      tags: ['question', 'pricing'],
      metadata: { role: 'user', timestamp: new Date().toISOString() },
    });

    // Get context to provide informed response
    console.log('\nGetting context for response...');
    const context = await client.agent.getContext({
      sessionId: session.id,
      query: 'pricing plans',
      limit: 5,
      includeRelated: true,
    });
    console.log(`Found ${context.related.length} related memories for context`);

    // Agent response 2
    await client.agent.addSessionMemory(session.id, {
      content: 'Agent responded: We offer three pricing plans: Basic ($10/mo), Pro ($25/mo), and Enterprise (custom).',
      tags: ['response', 'pricing'],
      metadata: { role: 'assistant', timestamp: new Date().toISOString() },
    });

    // Get full session history
    console.log('\nRetrieving session history...');
    const history = await client.agent.getSession(session.id, {
      includeMemories: true,
      limit: 100,
    });
    console.log(`Session has ${history.session.memoryCount} memories`);

    if (history.memories) {
      console.log('\nConversation history:');
      history.memories.forEach((memory, index) => {
        const role = memory.metadata?.role || 'unknown';
        console.log(`${index + 1}. [${role}] ${memory.content}`);
      });
    }

    // End the session and consolidate learnings
    console.log('\nEnding session with consolidation...');
    const ended = await client.agent.endSession(session.id, {
      consolidate: true,
      metadata: {
        resolution: 'resolved',
        satisfaction: 'high',
      },
    });

    if (ended.consolidationJobId) {
      console.log(`Consolidation job started: ${ended.consolidationJobId}`);
    }

    // List all sessions
    console.log('\nListing all sessions...');
    const sessions = await client.agent.listSessions({
      limit: 10,
    });
    console.log(`Total sessions: ${sessions.pagination.total}`);

    console.log('\nAgent session example completed!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

runAgentSession().catch(console.error);
