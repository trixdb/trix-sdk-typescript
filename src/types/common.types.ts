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
    /**
     * Whether more pages remain. The API emits snake_case `has_more` on the
     * wire; responses are camelCased centrally in `handleResponse` (#4), so
     * consumers read `hasMore`.
     */
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

// ============================================================================
// Job Types
// ============================================================================

/** Job status */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Asynchronous job for long-running operations.
 */
export interface Job {
  /** Unique job identifier */
  id: string;
  /** Current job status */
  status: JobStatus;
  /** Job type (e.g., 'transcription', 'clustering') */
  type?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Error message if the job failed */
  error?: string;
  /** Result data when job completes */
  result?: Record<string, unknown>;
  /** When the job was created */
  createdAt: string;
  /** When the job was last updated */
  updatedAt: string;
  /** When the job started processing */
  startedAt?: string;
  /** When the job completed */
  completedAt?: string;
}

/**
 * Result of a health-check ping (ADR-143).
 *
 * Returned by {@link Trix.ping}. The server response shape is
 * `{status, timestamp, uptime, version}`; this envelope adds the
 * client-measured round-trip time so callers don't need a second
 * timing measurement.
 */
export interface PingResult {
  /** True when the server reports `status === 'ok'`. */
  ok: boolean;
  /** Server version string, when reported. */
  version?: string;
  /** Client-measured round-trip time in milliseconds. */
  latencyMs: number;
}
