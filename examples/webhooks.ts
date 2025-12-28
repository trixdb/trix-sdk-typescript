/**
 * Webhooks example for TrixDB SDK
 *
 * Demonstrates how to set up and manage webhooks for event notifications.
 */

import { TrixDB } from '../src/index.js';

async function setupWebhooks() {
  const client = new TrixDB({
    apiKey: process.env.TRIXDB_API_KEY || 'your_api_key',
  });

  try {
    // Create a webhook
    console.log('Creating webhook...');
    const webhook = await client.webhooks.create({
      url: 'https://api.example.com/trixdb-webhook',
      events: [
        'memory.created',
        'memory.updated',
        'memory.deleted',
        'cluster.created',
        'relationship.created',
      ],
      secret: 'your_webhook_secret_key',
      active: true,
      metadata: {
        description: 'Production webhook for memory events',
        environment: 'production',
      },
    });
    console.log(`Webhook created: ${webhook.id}`);
    console.log(`Listening for events:`, webhook.events);

    // Test the webhook
    console.log('\nTesting webhook...');
    const testResult = await client.webhooks.test(webhook.id, 'memory.created');

    if (testResult.success) {
      console.log('Webhook test successful!');
      console.log(`Status code: ${testResult.statusCode}`);
    } else {
      console.log('Webhook test failed!');
      console.log(`Error: ${testResult.error}`);
    }

    // List all webhooks
    console.log('\nListing webhooks...');
    const webhooks = await client.webhooks.list({
      active: true,
      limit: 10,
    });
    console.log(`Found ${webhooks.data.length} active webhooks`);

    // Create a memory to trigger webhook
    console.log('\nCreating memory (will trigger webhook)...');
    const memory = await client.memories.create({
      content: 'This memory creation will trigger a webhook event',
      tags: ['webhook-test'],
    });
    console.log(`Memory created: ${memory.id}`);

    // Wait a bit for webhook delivery
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check webhook deliveries
    console.log('\nChecking webhook deliveries...');
    const deliveries = await client.webhooks.getDeliveries(webhook.id, {
      limit: 10,
    });
    console.log(`Recent deliveries: ${deliveries.data.length}`);

    deliveries.data.forEach((delivery) => {
      console.log(
        `- Event: ${delivery.event}, Status: ${delivery.status}, Attempts: ${delivery.attempts}`
      );
    });

    // Check for failed deliveries and retry
    const failedDeliveries = deliveries.data.filter((d) => d.status === 'failed');
    if (failedDeliveries.length > 0) {
      console.log(`\nRetrying ${failedDeliveries.length} failed deliveries...`);
      for (const delivery of failedDeliveries) {
        await client.webhooks.retryDelivery(webhook.id, delivery.id);
        console.log(`Retried delivery: ${delivery.id}`);
      }
    }

    // Update webhook to disable it
    console.log('\nDisabling webhook...');
    const updated = await client.webhooks.update(webhook.id, {
      active: false,
    });
    console.log(`Webhook disabled: ${!updated.active}`);

    // Re-enable it
    console.log('\nRe-enabling webhook...');
    await client.webhooks.update(webhook.id, {
      active: true,
    });
    console.log('Webhook re-enabled');

    // Iterate through all webhooks
    console.log('\nIterating through all webhooks...');
    for await (const hook of client.webhooks.listAll()) {
      console.log(`- ${hook.url} (${hook.events.length} events)`);
    }

    console.log('\nWebhooks example completed!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

setupWebhooks().catch(console.error);
