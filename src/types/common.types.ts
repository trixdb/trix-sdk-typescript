/**
 * Common type definitions shared across the Trix SDK.
 * Includes configuration, pagination, and base utility types.
 */

import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from '../client.js';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration options for the Trix client.
 */
export interface TrixConfig {
  /** API key or JWT token for authentication */
  apiKey: string;
  /** Base URL for the Trix API @default 'https://api.trixdb.com' */
  baseUrl?: string;
  /** Maximum number of retry attempts for failed requests @default 3 */
  maxRetries?: number;
  /** Timeout for requests in milliseconds @default 30000 */
  timeout?: number;
  /** Custom fetch implementation (useful for testing or specific environments) */
  fetch?: typeof fetch;
  /** Allow insecure connections (HTTP, localhost). Only use for local development. @default false */
  allowInsecure?: boolean;
  /** Request interceptors to run before each request */
  requestInterceptors?: RequestInterceptor[];
  /** Response interceptors to run after each successful response */
  responseInterceptors?: ResponseInterceptor[];
  /** Error interceptors to run when an error occurs */
  errorInterceptors?: ErrorInterceptor[];
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Common pagination parameters.
 */
export interface PaginationParams {
  limit?: number;
  page?: number;
  offset?: number;
}

/**
 * Common sort parameters.
 */
export interface SortParams<T extends string = string> {
  sortBy?: T;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Bulk Operation Types
// ============================================================================

/**
 * Bulk operation result.
 */
export interface BulkResult {
  success: number;
  failed: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
}

// ============================================================================
// Common Base Types
// ============================================================================

/**
 * Base entity with common fields.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Base entity with optional metadata.
 */
export interface BaseEntityWithMetadata extends BaseEntity {
  metadata?: Record<string, unknown>;
}

/**
 * Test result for connectivity/webhook tests.
 */
export interface TestResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
}
