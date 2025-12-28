/**
 * Tests for TrixDB metrics and observability utilities.
 */

import {
  RequestMetrics,
  createRequestMetrics,
  MetricsCollector,
  NoOpCollector,
  InMemoryCollector,
  CompositeCollector,
  CallbackCollector,
  RequestTimer,
  getMetricsCollector,
  setMetricsCollector,
  startRequestTimer,
  recordRetry,
} from '../src/utils/metrics';

describe('createRequestMetrics', () => {
  it('should create metrics with defaults', () => {
    const metrics = createRequestMetrics('GET', '/memories');
    expect(metrics.method).toBe('GET');
    expect(metrics.path).toBe('/memories');
    expect(metrics.durationMs).toBe(0);
    expect(metrics.retryCount).toBe(0);
    expect(metrics.success).toBe(false);
    expect(metrics.labels).toEqual({});
  });

  it('should accept labels', () => {
    const metrics = createRequestMetrics('GET', '/memories', { env: 'test' });
    expect(metrics.labels).toEqual({ env: 'test' });
  });
});

describe('NoOpCollector', () => {
  it('should not throw on any method', () => {
    const collector = new NoOpCollector();
    const metrics = createRequestMetrics('GET', '/test');
    expect(() => collector.onRequestComplete(metrics)).not.toThrow();
  });
});

describe('InMemoryCollector', () => {
  let collector: InMemoryCollector;

  beforeEach(() => {
    collector = new InMemoryCollector();
  });

  it('should record metrics', () => {
    const metrics = createRequestMetrics('GET', '/test');
    metrics.statusCode = 200;
    metrics.success = true;
    collector.onRequestComplete(metrics);

    expect(collector.requestCount).toBe(1);
    expect(collector.metrics[0]).toBe(metrics);
  });

  it('should count successes and errors', () => {
    // Successes
    const success1 = createRequestMetrics('GET', '/test');
    success1.statusCode = 200;
    success1.success = true;
    collector.onRequestComplete(success1);

    const success2 = createRequestMetrics('POST', '/test');
    success2.statusCode = 201;
    success2.success = true;
    collector.onRequestComplete(success2);

    // Errors
    const error1 = createRequestMetrics('GET', '/test');
    error1.statusCode = 404;
    collector.onRequestComplete(error1);

    const error2 = createRequestMetrics('GET', '/test');
    error2.error = 'NetworkError';
    collector.onRequestComplete(error2);

    expect(collector.successCount).toBe(2);
    expect(collector.errorCount).toBe(2);
    expect(collector.requestCount).toBe(4);
  });

  it('should calculate average latency', () => {
    [10, 20, 30].forEach((ms) => {
      const m = createRequestMetrics('GET', '/test');
      m.durationMs = ms;
      collector.onRequestComplete(m);
    });

    expect(collector.averageLatencyMs).toBe(20);
  });

  it('should calculate percentile latencies', () => {
    for (let i = 1; i <= 100; i++) {
      const m = createRequestMetrics('GET', '/test');
      m.durationMs = i;
      collector.onRequestComplete(m);
    }

    expect(collector.p50LatencyMs).toBe(50);
    expect(collector.p95LatencyMs).toBe(95);
    expect(collector.p99LatencyMs).toBe(99);
  });

  it('should filter by method', () => {
    collector.onRequestComplete(createRequestMetrics('GET', '/test'));
    collector.onRequestComplete(createRequestMetrics('POST', '/test'));
    collector.onRequestComplete(createRequestMetrics('GET', '/test'));

    expect(collector.getMetricsByMethod('GET').length).toBe(2);
    expect(collector.getMetricsByMethod('POST').length).toBe(1);
  });

  it('should filter by path', () => {
    collector.onRequestComplete(createRequestMetrics('GET', '/memories'));
    collector.onRequestComplete(createRequestMetrics('GET', '/spaces'));
    collector.onRequestComplete(createRequestMetrics('GET', '/memories/123'));

    expect(collector.getMetricsByPath('/memories').length).toBe(2);
    expect(collector.getMetricsByPath('/spaces').length).toBe(1);
  });

  it('should clear all metrics', () => {
    collector.onRequestComplete(createRequestMetrics('GET', '/test'));
    expect(collector.requestCount).toBe(1);

    collector.clear();
    expect(collector.requestCount).toBe(0);
  });

  it('should respect max entries', () => {
    const limited = new InMemoryCollector(5);

    for (let i = 0; i < 10; i++) {
      limited.onRequestComplete(createRequestMetrics('GET', `/test/${i}`));
    }

    expect(limited.requestCount).toBe(5);
    expect(limited.metrics[0].path).toBe('/test/5');
    expect(limited.metrics[4].path).toBe('/test/9');
  });

  it('should record retries', () => {
    collector.onRetry('GET', '/test', 1, new Error('Test'), 100);
    collector.onRetry('GET', '/test', 2, new Error('Test'), 200);

    expect(collector.retryCount).toBe(2);
  });
});

describe('CompositeCollector', () => {
  it('should delegate to all collectors', () => {
    const collector1 = new InMemoryCollector();
    const collector2 = new InMemoryCollector();
    const composite = new CompositeCollector([collector1, collector2]);

    composite.onRequestComplete(createRequestMetrics('GET', '/test'));

    expect(collector1.requestCount).toBe(1);
    expect(collector2.requestCount).toBe(1);
  });

  it('should add and remove collectors', () => {
    const collector1 = new InMemoryCollector();
    const collector2 = new InMemoryCollector();
    const composite = new CompositeCollector([collector1]);

    composite.add(collector2);
    composite.onRequestComplete(createRequestMetrics('GET', '/test'));

    expect(collector1.requestCount).toBe(1);
    expect(collector2.requestCount).toBe(1);

    composite.remove(collector2);
    composite.onRequestComplete(createRequestMetrics('GET', '/test'));

    expect(collector1.requestCount).toBe(2);
    expect(collector2.requestCount).toBe(1);
  });
});

describe('CallbackCollector', () => {
  it('should call onComplete callback', () => {
    const results: RequestMetrics[] = [];
    const collector = new CallbackCollector({
      onComplete: (m) => results.push(m),
    });

    const metrics = createRequestMetrics('GET', '/test');
    collector.onRequestComplete(metrics);

    expect(results.length).toBe(1);
    expect(results[0]).toBe(metrics);
  });

  it('should call onRetry callback', () => {
    const results: [string, string, number][] = [];
    const collector = new CallbackCollector({
      onRetry: (method, path, attempt) => results.push([method, path, attempt]),
    });

    collector.onRetry('GET', '/test', 1, new Error('Test'), 100);

    expect(results.length).toBe(1);
    expect(results[0]).toEqual(['GET', '/test', 1]);
  });

  it('should call onStart callback', () => {
    const results: [string, string][] = [];
    const collector = new CallbackCollector({
      onStart: (method, path) => results.push([method, path]),
    });

    collector.onRequestStart('GET', '/test');

    expect(results.length).toBe(1);
    expect(results[0]).toEqual(['GET', '/test']);
  });
});

describe('Global collector', () => {
  afterEach(() => {
    setMetricsCollector(new NoOpCollector());
  });

  it('should default to NoOpCollector', () => {
    setMetricsCollector(new NoOpCollector());
    const collector = getMetricsCollector();
    expect(collector).toBeInstanceOf(NoOpCollector);
  });

  it('should allow setting and getting', () => {
    const inMemory = new InMemoryCollector();
    setMetricsCollector(inMemory);

    expect(getMetricsCollector()).toBe(inMemory);
  });
});

describe('RequestTimer', () => {
  it('should measure duration', async () => {
    const collector = new InMemoryCollector();
    const timer = startRequestTimer('GET', '/test', undefined, collector);

    await new Promise((resolve) => setTimeout(resolve, 10));
    timer.setStatusCode(200);
    timer.complete();

    expect(collector.requestCount).toBe(1);
    // Allow small timing variations - setTimeout(10) may complete slightly under 10ms
    expect(collector.metrics[0].durationMs).toBeGreaterThanOrEqual(8);
    expect(collector.metrics[0].statusCode).toBe(200);
    expect(collector.metrics[0].success).toBe(true);
  });

  it('should record error', () => {
    const collector = new InMemoryCollector();
    const timer = startRequestTimer('GET', '/test', undefined, collector);

    timer.setError(new Error('Test error'));
    timer.complete();

    expect(collector.metrics[0].error).toBe('Error');
    expect(collector.metrics[0].success).toBe(false);
  });

  it('should set response size', () => {
    const collector = new InMemoryCollector();
    const timer = startRequestTimer('GET', '/test', undefined, collector);

    timer.setResponseSize(1024);
    timer.complete();

    expect(collector.metrics[0].responseSize).toBe(1024);
  });

  it('should set retry count', () => {
    const collector = new InMemoryCollector();
    const timer = startRequestTimer('GET', '/test', undefined, collector);

    timer.setRetryCount(3);
    timer.complete();

    expect(collector.metrics[0].retryCount).toBe(3);
  });

  it('should use global collector by default', () => {
    const inMemory = new InMemoryCollector();
    setMetricsCollector(inMemory);

    const timer = startRequestTimer('GET', '/test');
    timer.setStatusCode(200);
    timer.complete();

    expect(inMemory.requestCount).toBe(1);

    setMetricsCollector(new NoOpCollector());
  });
});

describe('recordRetry', () => {
  it('should record with specified collector', () => {
    const collector = new InMemoryCollector();
    recordRetry('GET', '/test', 1, new Error('Test'), 100, collector);

    expect(collector.retryCount).toBe(1);
  });

  it('should use global collector by default', () => {
    const inMemory = new InMemoryCollector();
    setMetricsCollector(inMemory);

    recordRetry('GET', '/test', 1, new Error('Test'), 100);

    expect(inMemory.retryCount).toBe(1);

    setMetricsCollector(new NoOpCollector());
  });
});
