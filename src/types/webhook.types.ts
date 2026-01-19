/**
 * Webhook type definitions for the Trix SDK.
 */

import type { BaseEntityWithMetadata, PaginationParams } from './common.types.js';

// ============================================================================
// Webhook Entity
// ============================================================================

/**
 * Webhook object.
 */
export interface Webhook extends BaseEntityWithMetadata {
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
}

// ============================================================================
// Webhook Parameters
// ============================================================================

/**
 * Parameters for creating a webhook.
 */
export interface CreateWebhookParams {
  url: string;
  events: string[];
  secret?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a webhook.
 */
export interface UpdateWebhookParams {
  url?: string;
  events?: string[];
  secret?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing webhooks.
 */
export interface ListWebhooksParams extends Pick<PaginationParams, 'limit' | 'page'> {
  active?: boolean;
}

// ============================================================================
// Webhook Delivery
// ============================================================================

/**
 * Webhook delivery.
 */
export interface Delivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  attempts: number;
  nextRetry?: string;
  createdAt: string;
}

/**
 * Parameters for listing deliveries.
 */
export interface DeliveriesParams extends Pick<PaginationParams, 'limit' | 'page'> {
  status?: 'pending' | 'success' | 'failed';
}

// ============================================================================
// Webhook Extended Types
// ============================================================================

/**
 * Webhook event.
 */
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

/**
 * Webhook event type info.
 */
export interface WebhookEventType {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

/**
 * Webhook statistics.
 */
export interface WebhookStats {
  totalDeliveries: number;
  successRate: number;
  avgLatency: number;
  byEvent: Record<string, {
    count: number;
    successRate: number;
  }>;
}

/**
 * Parameters for listing webhook events.
 */
export interface ListWebhookEventsParams extends Pick<PaginationParams, 'limit' | 'page'> {
  type?: string;
}
