/**
 * Webhooks resource
 */

import type { Trix } from '../client.js';
import type {
  Webhook,
  CreateWebhookParams,
  UpdateWebhookParams,
  ListWebhooksParams,
  PaginatedResponse,
  TestResult,
  Delivery,
  DeliveriesParams,
  WebhookEvent,
  WebhookEventType,
  WebhookStats,
  ListWebhookEventsParams,
  BulkResult,
} from '../types.js';
import { paginateIterator } from '../utils/pagination.js';
import { validateId, validateWebhookUrl } from '../utils/security.js';

/**
 * Webhooks resource for managing webhook subscriptions
 *
 * @example
 * ```typescript
 * const webhook = await client.webhooks.create({
 *   url: 'https://example.com/webhook',
 *   events: ['memory.created', 'memory.updated']
 * });
 * ```
 */
export class Webhooks {
  constructor(private readonly client: Trix) {}

  /**
   * Create a new webhook
   *
   * @param params - Webhook creation parameters
   * @returns Created webhook
   *
   * @example
   * ```typescript
   * const webhook = await client.webhooks.create({
   *   url: 'https://api.example.com/trix-webhook',
   *   events: ['memory.created', 'memory.deleted', 'cluster.updated'],
   *   secret: 'your_webhook_secret',
   *   active: true
   * });
   * ```
   */
  async create(params: CreateWebhookParams): Promise<Webhook> {
    // Validate webhook URL to prevent SSRF attacks
    validateWebhookUrl(params.url);
    return this.client.request<Webhook>({
      method: 'POST',
      path: '/webhooks',
      body: params,
    });
  }

  /**
   * List webhooks
   *
   * @param params - List parameters
   * @returns Paginated list of webhooks
   *
   * @example
   * ```typescript
   * const results = await client.webhooks.list({
   *   limit: 10,
   *   active: true
   * });
   * ```
   */
  async list(params?: ListWebhooksParams): Promise<PaginatedResponse<Webhook>> {
    return this.client.request<PaginatedResponse<Webhook>>({
      method: 'GET',
      path: '/webhooks',
      query: params,
    });
  }

  /**
   * Get all webhooks using async iteration
   *
   * @param params - List parameters
   * @returns Async iterator of webhooks
   *
   * @example
   * ```typescript
   * for await (const webhook of client.webhooks.listAll()) {
   *   console.log(webhook.url);
   * }
   * ```
   */
  listAll(params?: ListWebhooksParams): AsyncGenerator<Webhook, void, unknown> {
    return paginateIterator(
      (p) => this.list(p),
      params ?? {}
    );
  }

  /**
   * Get a specific webhook by ID
   *
   * @param id - Webhook ID
   * @returns Webhook object
   *
   * @example
   * ```typescript
   * const webhook = await client.webhooks.get('wh_123');
   * ```
   */
  async get(id: string): Promise<Webhook> {
    validateId(id, 'webhook');
    return this.client.request<Webhook>({
      method: 'GET',
      path: `/webhooks/${id}`,
    });
  }

  /**
   * Update a webhook
   *
   * @param id - Webhook ID
   * @param params - Update parameters
   * @returns Updated webhook
   *
   * @example
   * ```typescript
   * const updated = await client.webhooks.update('wh_123', {
   *   active: false,
   *   events: ['memory.created']
   * });
   * ```
   */
  async update(id: string, params: UpdateWebhookParams): Promise<Webhook> {
    validateId(id, 'webhook');
    // Validate webhook URL if being updated
    if (params.url) {
      validateWebhookUrl(params.url);
    }
    return this.client.request<Webhook>({
      method: 'PATCH',
      path: `/webhooks/${id}`,
      body: params,
    });
  }

  /**
   * Delete a webhook
   *
   * @param id - Webhook ID
   *
   * @example
   * ```typescript
   * await client.webhooks.delete('wh_123');
   * ```
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'webhook');
    return this.client.request<void>({
      method: 'DELETE',
      path: `/webhooks/${id}`,
    });
  }

  /**
   * Test a webhook by sending a test event
   *
   * @param id - Webhook ID
   * @param eventType - Optional event type to test (defaults to 'test')
   * @returns Test result
   *
   * @example
   * ```typescript
   * const result = await client.webhooks.test('wh_123', 'memory.created');
   *
   * if (result.success) {
   *   console.log('Webhook test successful!');
   * } else {
   *   console.error('Webhook test failed:', result.error);
   * }
   * ```
   */
  async test(id: string, eventType?: string): Promise<TestResult> {
    validateId(id, 'webhook');
    return this.client.request<TestResult>({
      method: 'POST',
      path: `/webhooks/${id}/test`,
      body: { eventType },
    });
  }

  /**
   * Get delivery history for a webhook
   *
   * @param id - Webhook ID
   * @param params - Delivery parameters
   * @returns Paginated list of deliveries
   *
   * @example
   * ```typescript
   * const deliveries = await client.webhooks.getDeliveries('wh_123', {
   *   status: 'failed',
   *   limit: 20
   * });
   *
   * console.log(`Found ${deliveries.data.length} failed deliveries`);
   * ```
   */
  async getDeliveries(
    id: string,
    params?: DeliveriesParams
  ): Promise<PaginatedResponse<Delivery>> {
    validateId(id, 'webhook');
    return this.client.request<PaginatedResponse<Delivery>>({
      method: 'GET',
      path: `/webhooks/${id}/deliveries`,
      query: params,
    });
  }

  /**
   * Retry a failed webhook delivery
   *
   * @param webhookId - Webhook ID
   * @param deliveryId - Delivery ID to retry
   *
   * @example
   * ```typescript
   * await client.webhooks.retryDelivery('wh_123', 'del_456');
   * ```
   */
  async retryDelivery(webhookId: string, deliveryId: string): Promise<void> {
    validateId(webhookId, 'webhook');
    validateId(deliveryId, 'delivery');
    return this.client.request<void>({
      method: 'POST',
      path: `/webhooks/${webhookId}/deliveries/${deliveryId}/retry`,
    });
  }

  /**
   * Get webhook events
   *
   * @param params - Event parameters
   * @returns Paginated list of events
   */
  async getEvents(params?: ListWebhookEventsParams): Promise<PaginatedResponse<WebhookEvent>> {
    return this.client.request<PaginatedResponse<WebhookEvent>>({
      method: 'GET',
      path: '/webhooks/events',
      query: params,
    });
  }

  /**
   * Get available webhook event types
   *
   * @returns List of event types
   */
  async getEventTypes(): Promise<WebhookEventType[]> {
    const response = await this.client.request<{ types: WebhookEventType[] }>({
      method: 'GET',
      path: '/webhooks/event-types',
    });
    return response.types;
  }

  /**
   * Get webhook statistics
   *
   * @returns Webhook statistics
   */
  async getStats(): Promise<WebhookStats> {
    return this.client.request<WebhookStats>({
      method: 'GET',
      path: '/webhooks/stats',
    });
  }

  /**
   * Bulk create webhooks
   *
   * @param webhooks - Array of webhook creation parameters
   * @returns Bulk operation result
   */
  async bulkCreate(webhooks: CreateWebhookParams[]): Promise<BulkResult> {
    // Validate all webhook URLs
    webhooks.forEach((webhook) => validateWebhookUrl(webhook.url));
    return this.client.request<BulkResult>({
      method: 'POST',
      path: '/webhooks/bulk',
      body: { webhooks },
    });
  }

  /**
   * Bulk delete webhooks
   *
   * @param ids - Array of webhook IDs to delete
   * @returns Bulk operation result
   */
  async bulkDelete(ids: string[]): Promise<BulkResult> {
    ids.forEach((id) => validateId(id, 'webhook'));
    return this.client.request<BulkResult>({
      method: 'DELETE',
      path: '/webhooks/bulk',
      body: { ids },
    });
  }
}
