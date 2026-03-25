/**
 * Metrics collector implementations for Trix SDK.
 *
 * Provides InMemoryCollector, CompositeCollector, and CallbackCollector.
 */

import type { MetricsCollector, RequestMetrics } from './metrics.js';

/** Retry event data */
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

  get metrics(): RequestMetrics[] {
    return [...this._metrics];
  }

  get requestCount(): number {
    return this._metrics.length;
  }

  get successCount(): number {
    return this._metrics.filter((m) => m.success).length;
  }

  get errorCount(): number {
    return this._metrics.filter((m) => !m.success).length;
  }

  get retryCount(): number {
    return this._retries.length;
  }

  get averageLatencyMs(): number {
    if (this._metrics.length === 0) return 0;
    const sum = this._metrics.reduce((acc, m) => acc + m.durationMs, 0);
    return sum / this._metrics.length;
  }

  get p50LatencyMs(): number {
    return this.percentile(50);
  }

  get p95LatencyMs(): number {
    return this.percentile(95);
  }

  get p99LatencyMs(): number {
    return this.percentile(99);
  }

  private percentile(p: number): number {
    if (this._metrics.length === 0) return 0;
    const sorted = [...this._metrics].sort((a, b) => a.durationMs - b.durationMs);
    const idx = Math.floor(((sorted.length - 1) * p) / 100);
    return sorted[idx].durationMs;
  }

  getMetricsByMethod(method: string): RequestMetrics[] {
    return this._metrics.filter((m) => m.method === method);
  }

  getMetricsByPath(path: string): RequestMetrics[] {
    return this._metrics.filter((m) => m.path.includes(path));
  }

  getErrorMetrics(): RequestMetrics[] {
    return this._metrics.filter((m) => !m.success);
  }

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

  add(collector: MetricsCollector): void {
    this.collectors.push(collector);
  }

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
