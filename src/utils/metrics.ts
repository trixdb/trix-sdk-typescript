/**
 * Metrics and observability utilities for Trix SDK.
 *
 * Core interfaces, types, and the RequestTimer.
 * Collector implementations are in metrics-impl.ts.
 */

/**
 * Metrics for a single HTTP request.
 */
export interface RequestMetrics {
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Request path */
  path: string;
  /** HTTP status code (undefined if request failed) */
  statusCode?: number;
  /** Request duration in milliseconds */
  durationMs: number;
  /** Size of request body in bytes (if known) */
  requestSize?: number;
  /** Size of response body in bytes (if known) */
  responseSize?: number;
  /** Error type if request failed */
  error?: string;
  /** Number of retries before success/failure */
  retryCount: number;
  /** Unix timestamp when request started */
  timestamp: number;
  /** Additional custom labels */
  labels: Record<string, string>;
  /** Whether the request was successful */
  success: boolean;
}

/** Create a new RequestMetrics object with defaults */
export function createRequestMetrics(
  method: string,
  path: string,
  labels?: Record<string, string>
): RequestMetrics {
  return {
    method,
    path,
    durationMs: 0,
    retryCount: 0,
    timestamp: Date.now(),
    labels: labels ?? {},
    success: false,
  };
}

/**
 * Abstract interface for metrics collectors.
 *
 * Implement this interface to send metrics to your preferred
 * monitoring system (Prometheus, Datadog, OpenTelemetry, etc.).
 */
export interface MetricsCollector {
  /** Called when a request completes (success or failure). */
  onRequestComplete(metrics: RequestMetrics): void;
  /** Called when a request starts. */
  onRequestStart?(
    method: string,
    path: string,
    labels?: Record<string, string>
  ): void;
  /** Called when a request is being retried. */
  onRetry?(
    method: string,
    path: string,
    attempt: number,
    error: Error,
    delayMs: number
  ): void;
}

/** No-op metrics collector that does nothing. */
export class NoOpCollector implements MetricsCollector {
  onRequestComplete(_metrics: RequestMetrics): void {
    // No-op
  }
}

// Re-export implementations for backward compatibility
export { InMemoryCollector, CompositeCollector, CallbackCollector } from './metrics-impl.js';

// Global metrics collector
let globalCollector: MetricsCollector = new NoOpCollector();

/** Get the global metrics collector. */
export function getMetricsCollector(): MetricsCollector {
  return globalCollector;
}

/** Set the global metrics collector. */
export function setMetricsCollector(collector: MetricsCollector): void {
  globalCollector = collector;
}

/** Timer for measuring request duration. */
export class RequestTimer {
  private startTime: number;
  private metrics: RequestMetrics;
  private collector: MetricsCollector;

  constructor(
    method: string,
    path: string,
    labels?: Record<string, string>,
    collector?: MetricsCollector
  ) {
    this.startTime = performance.now();
    this.metrics = createRequestMetrics(method, path, labels);
    this.collector = collector ?? globalCollector;
    this.collector.onRequestStart?.(method, path, labels);
  }

  setStatusCode(statusCode: number): void {
    this.metrics.statusCode = statusCode;
    this.metrics.success = statusCode >= 200 && statusCode < 400;
  }

  setError(error: Error): void {
    this.metrics.error = error.name;
    this.metrics.success = false;
  }

  setResponseSize(size: number): void {
    this.metrics.responseSize = size;
  }

  setRetryCount(count: number): void {
    this.metrics.retryCount = count;
  }

  complete(): RequestMetrics {
    this.metrics.durationMs = performance.now() - this.startTime;
    this.collector.onRequestComplete(this.metrics);
    return this.metrics;
  }
}

/** Start timing a request. */
export function startRequestTimer(
  method: string,
  path: string,
  labels?: Record<string, string>,
  collector?: MetricsCollector
): RequestTimer {
  return new RequestTimer(method, path, labels, collector);
}

/** Record a retry attempt. */
export function recordRetry(
  method: string,
  path: string,
  attempt: number,
  error: Error,
  delayMs: number,
  collector?: MetricsCollector
): void {
  const c = collector ?? globalCollector;
  c.onRetry?.(method, path, attempt, error, delayMs);
}
