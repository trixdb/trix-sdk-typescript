/**
 * Metrics and observability utilities for TrixDB SDK.
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

/**
 * Create a new RequestMetrics object with defaults
 */
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
 *
 * @example
 * ```typescript
 * class DatadogCollector implements MetricsCollector {
 *   onRequestComplete(metrics: RequestMetrics): void {
 *     // Send to Datadog
 *     statsd.increment('trixdb.requests.total', {
 *       method: metrics.method,
 *       status: String(metrics.statusCode),
 *     });
 *     statsd.histogram('trixdb.requests.duration', metrics.durationMs);
 *   }
 * }
 * ```
 */
export interface MetricsCollector {
  /**
   * Called when a request completes (success or failure).
   */
  onRequestComplete(metrics: RequestMetrics): void;

  /**
   * Called when a request starts.
   */
  onRequestStart?(
    method: string,
    path: string,
    labels?: Record<string, string>
  ): void;

  /**
   * Called when a request is being retried.
   */
  onRetry?(
    method: string,
    path: string,
    attempt: number,
    error: Error,
    delayMs: number
  ): void;
}

/**
 * No-op metrics collector that does nothing.
 */
export class NoOpCollector implements MetricsCollector {
  onRequestComplete(_metrics: RequestMetrics): void {
    // No-op
  }
}

/**
 * Retry event data
 */
interface RetryEvent {
  method: string;
  path: string;
  attempt: number;
  error: string;
  delayMs: number;
  timestamp: number;
}

/**
 * In-memory metrics collector for testing and debugging.
 *
 * Stores metrics in memory for later inspection.
 *
 * @example
 * ```typescript
 * const collector = new InMemoryCollector();
 * setMetricsCollector(collector);
 * // ... make requests ...
 * console.log(`Total requests: ${collector.requestCount}`);
 * console.log(`Avg latency: ${collector.averageLatencyMs}ms`);
 * ```
 */
export class InMemoryCollector implements MetricsCollector {
  private _metrics: RequestMetrics[] = [];
  private _retries: RetryEvent[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  /** Get all recorded metrics */
  get metrics(): RequestMetrics[] {
    return [...this._metrics];
  }

  /** Get total number of requests */
  get requestCount(): number {
    return this._metrics.length;
  }

  /** Get number of successful requests */
  get successCount(): number {
    return this._metrics.filter((m) => m.success).length;
  }

  /** Get number of failed requests */
  get errorCount(): number {
    return this._metrics.filter((m) => !m.success).length;
  }

  /** Get total number of retries */
  get retryCount(): number {
    return this._retries.length;
  }

  /** Get average request latency in milliseconds */
  get averageLatencyMs(): number {
    if (this._metrics.length === 0) return 0;
    const sum = this._metrics.reduce((acc, m) => acc + m.durationMs, 0);
    return sum / this._metrics.length;
  }

  /** Get 50th percentile latency */
  get p50LatencyMs(): number {
    return this.percentile(50);
  }

  /** Get 95th percentile latency */
  get p95LatencyMs(): number {
    return this.percentile(95);
  }

  /** Get 99th percentile latency */
  get p99LatencyMs(): number {
    return this.percentile(99);
  }

  /**
   * Calculate percentile of latencies
   */
  private percentile(p: number): number {
    if (this._metrics.length === 0) return 0;
    const sorted = [...this._metrics].sort((a, b) => a.durationMs - b.durationMs);
    const idx = Math.floor(((sorted.length - 1) * p) / 100);
    return sorted[idx].durationMs;
  }

  /**
   * Get metrics filtered by HTTP method
   */
  getMetricsByMethod(method: string): RequestMetrics[] {
    return this._metrics.filter((m) => m.method === method);
  }

  /**
   * Get metrics filtered by path
   */
  getMetricsByPath(path: string): RequestMetrics[] {
    return this._metrics.filter((m) => m.path.includes(path));
  }

  /**
   * Get metrics for failed requests
   */
  getErrorMetrics(): RequestMetrics[] {
    return this._metrics.filter((m) => !m.success);
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this._metrics = [];
    this._retries = [];
  }

  onRequestComplete(metrics: RequestMetrics): void {
    if (this._metrics.length >= this.maxEntries) {
      this._metrics.shift();
    }
    this._metrics.push(metrics);
  }

  onRetry(
    method: string,
    path: string,
    attempt: number,
    error: Error,
    delayMs: number
  ): void {
    if (this._retries.length >= this.maxEntries) {
      this._retries.shift();
    }
    this._retries.push({
      method,
      path,
      attempt,
      error: error.name,
      delayMs,
      timestamp: Date.now(),
    });
  }
}

/**
 * Composite collector that delegates to multiple collectors.
 *
 * @example
 * ```typescript
 * const collector = new CompositeCollector([
 *   new PrometheusCollector(),
 *   new InMemoryCollector(),
 * ]);
 * ```
 */
export class CompositeCollector implements MetricsCollector {
  private collectors: MetricsCollector[];

  constructor(collectors: MetricsCollector[] = []) {
    this.collectors = collectors;
  }

  /**
   * Add a collector
   */
  add(collector: MetricsCollector): void {
    this.collectors.push(collector);
  }

  /**
   * Remove a collector
   */
  remove(collector: MetricsCollector): void {
    const idx = this.collectors.indexOf(collector);
    if (idx >= 0) {
      this.collectors.splice(idx, 1);
    }
  }

  onRequestStart(
    method: string,
    path: string,
    labels?: Record<string, string>
  ): void {
    for (const collector of this.collectors) {
      collector.onRequestStart?.(method, path, labels);
    }
  }

  onRequestComplete(metrics: RequestMetrics): void {
    for (const collector of this.collectors) {
      collector.onRequestComplete(metrics);
    }
  }

  onRetry(
    method: string,
    path: string,
    attempt: number,
    error: Error,
    delayMs: number
  ): void {
    for (const collector of this.collectors) {
      collector.onRetry?.(method, path, attempt, error, delayMs);
    }
  }
}

/**
 * Collector that calls user-provided callbacks.
 *
 * @example
 * ```typescript
 * const collector = new CallbackCollector({
 *   onComplete: (m) => console.log(`${m.method} ${m.path}: ${m.durationMs}ms`),
 * });
 * ```
 */
export class CallbackCollector implements MetricsCollector {
  private onComplete?: (metrics: RequestMetrics) => void;
  private onStart?: (
    method: string,
    path: string,
    labels?: Record<string, string>
  ) => void;
  private onRetryCallback?: (
    method: string,
    path: string,
    attempt: number,
    error: Error,
    delayMs: number
  ) => void;

  constructor(callbacks: {
    onComplete?: (metrics: RequestMetrics) => void;
    onStart?: (
      method: string,
      path: string,
      labels?: Record<string, string>
    ) => void;
    onRetry?: (
      method: string,
      path: string,
      attempt: number,
      error: Error,
      delayMs: number
    ) => void;
  }) {
    this.onComplete = callbacks.onComplete;
    this.onStart = callbacks.onStart;
    this.onRetryCallback = callbacks.onRetry;
  }

  onRequestStart(
    method: string,
    path: string,
    labels?: Record<string, string>
  ): void {
    this.onStart?.(method, path, labels);
  }

  onRequestComplete(metrics: RequestMetrics): void {
    this.onComplete?.(metrics);
  }

  onRetry(
    method: string,
    path: string,
    attempt: number,
    error: Error,
    delayMs: number
  ): void {
    this.onRetryCallback?.(method, path, attempt, error, delayMs);
  }
}

// Global metrics collector
let globalCollector: MetricsCollector = new NoOpCollector();

/**
 * Get the global metrics collector.
 */
export function getMetricsCollector(): MetricsCollector {
  return globalCollector;
}

/**
 * Set the global metrics collector.
 *
 * @example
 * ```typescript
 * import { setMetricsCollector, InMemoryCollector } from 'trixdb';
 * const collector = new InMemoryCollector();
 * setMetricsCollector(collector);
 * ```
 */
export function setMetricsCollector(collector: MetricsCollector): void {
  globalCollector = collector;
}

/**
 * Timer for measuring request duration.
 */
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

  /**
   * Set the status code
   */
  setStatusCode(statusCode: number): void {
    this.metrics.statusCode = statusCode;
    this.metrics.success = statusCode >= 200 && statusCode < 400;
  }

  /**
   * Set the error
   */
  setError(error: Error): void {
    this.metrics.error = error.name;
    this.metrics.success = false;
  }

  /**
   * Set response size
   */
  setResponseSize(size: number): void {
    this.metrics.responseSize = size;
  }

  /**
   * Set retry count
   */
  setRetryCount(count: number): void {
    this.metrics.retryCount = count;
  }

  /**
   * Complete the timing and record metrics
   */
  complete(): RequestMetrics {
    this.metrics.durationMs = performance.now() - this.startTime;
    this.collector.onRequestComplete(this.metrics);
    return this.metrics;
  }
}

/**
 * Start timing a request.
 *
 * @example
 * ```typescript
 * const timer = startRequestTimer('GET', '/memories');
 * try {
 *   const response = await fetch(url);
 *   timer.setStatusCode(response.status);
 * } catch (error) {
 *   timer.setError(error);
 * } finally {
 *   timer.complete();
 * }
 * ```
 */
export function startRequestTimer(
  method: string,
  path: string,
  labels?: Record<string, string>,
  collector?: MetricsCollector
): RequestTimer {
  return new RequestTimer(method, path, labels, collector);
}

/**
 * Record a retry attempt.
 */
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
