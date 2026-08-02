/**
 * OpenTelemetry integration for Trix SDK
 *
 * This module provides optional OpenTelemetry integration for distributed tracing.
 * The @opentelemetry/api package is an optional peer dependency.
 *
 * @example
 * ```typescript
 * import { trace } from '@opentelemetry/api';
 * import { Trix, configureTelemetry } from '@trixdb/client';
 *
 * // Configure with your tracer
 * configureTelemetry({
 *   tracer: trace.getTracer('my-service'),
 *   recordRequestBody: false,
 *   recordResponseBody: false,
 * });
 *
 * const client = new Trix({ apiKey: '...' });
 * // All requests will now create spans automatically
 * ```
 */

// Types that mirror OpenTelemetry API to avoid hard dependency
export interface Span {
  setAttribute(key: string, value: string | number | boolean): this;
  setStatus(status: { code: number; message?: string }): this;
  recordException(exception: Error): this;
  end(): void;
}

export interface Tracer {
  startSpan(name: string, options?: SpanOptions): Span;
}

export interface SpanOptions {
  attributes?: Record<string, string | number | boolean>;
  kind?: number;
}

export interface TelemetryConfig {
  /** OpenTelemetry Tracer instance */
  tracer?: Tracer;
  /** Whether to record request bodies in span attributes (default: false) */
  recordRequestBody?: boolean;
  /** Whether to record response bodies in span attributes (default: false) */
  recordResponseBody?: boolean;
  /** Custom span name prefix (default: 'trix') */
  spanNamePrefix?: string;
  /** Additional attributes to add to all spans */
  defaultAttributes?: Record<string, string | number | boolean>;
}

// Span status codes (mirrors OpenTelemetry)
export const SpanStatusCode = {
  UNSET: 0,
  OK: 1,
  ERROR: 2,
} as const;

// Span kinds (mirrors OpenTelemetry)
export const SpanKind = {
  INTERNAL: 0,
  SERVER: 1,
  CLIENT: 2,
  PRODUCER: 3,
  CONSUMER: 4,
} as const;

// Global telemetry configuration
let globalConfig: TelemetryConfig = {};

/**
 * Configure OpenTelemetry integration
 *
 * @param config - Telemetry configuration
 *
 * @example
 * ```typescript
 * import { trace } from '@opentelemetry/api';
 * import { configureTelemetry } from 'trix';
 *
 * configureTelemetry({
 *   tracer: trace.getTracer('my-service', '1.0.0'),
 *   spanNamePrefix: 'trix',
 *   defaultAttributes: {
 *     'service.name': 'my-app',
 *     'deployment.environment': 'production',
 *   },
 * });
 * ```
 */
export function configureTelemetry(config: TelemetryConfig): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get current telemetry configuration
 */
export function getTelemetryConfig(): TelemetryConfig {
  return globalConfig;
}

/**
 * Check if telemetry is enabled
 */
export function isTelemetryEnabled(): boolean {
  return globalConfig.tracer !== undefined;
}

/**
 * Create a span for an HTTP request
 *
 * @param method - HTTP method
 * @param path - Request path
 * @param operation - Operation name (e.g., 'memories.create')
 * @returns Span wrapper with helper methods
 */
export function createRequestSpan(
  method: string,
  path: string,
  operation: string
): RequestSpan {
  const config = globalConfig;

  if (!config.tracer) {
    return new NoOpRequestSpan();
  }

  const prefix = config.spanNamePrefix || 'trix';
  const spanName = `${prefix}.${operation}`;

  const span = config.tracer.startSpan(spanName, {
    kind: SpanKind.CLIENT,
    attributes: {
      'http.method': method,
      'http.url': path,
      'rpc.system': 'http',
      'rpc.service': 'trix',
      'rpc.method': operation,
      ...config.defaultAttributes,
    },
  });

  return new ActiveRequestSpan(span, config);
}

/**
 * Request span wrapper interface
 */
export interface RequestSpan {
  /** Set request body attribute (if enabled in config) */
  setRequestBody(body: unknown): void;
  /** Set response status code */
  setStatusCode(code: number): void;
  /** Set response body attribute (if enabled in config) */
  setResponseBody(body: unknown): void;
  /** Set response size in bytes */
  setResponseSize(bytes: number): void;
  /** Record an error */
  recordError(error: Error): void;
  /** Mark span as successful and end it */
  success(): void;
  /** Mark span as failed and end it */
  failure(message?: string): void;
  /** Add custom attribute */
  setAttribute(key: string, value: string | number | boolean): void;
}

/**
 * Active span implementation
 */
class ActiveRequestSpan implements RequestSpan {
  constructor(
    private readonly span: Span,
    private readonly config: TelemetryConfig
  ) {}

  setRequestBody(body: unknown): void {
    if (this.config.recordRequestBody && body) {
      try {
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        // Truncate large bodies
        this.span.setAttribute(
          'http.request.body',
          bodyStr.length > 1000 ? bodyStr.substring(0, 1000) + '...' : bodyStr
        );
      } catch (e) {
        // Log serialization errors at debug level for troubleshooting
        if (typeof console !== 'undefined') {
          console.debug?.('[trix-telemetry] Failed to serialize:', e);
        }
      }
    }
  }

  setStatusCode(code: number): void {
    this.span.setAttribute('http.status_code', code);
  }

  setResponseBody(body: unknown): void {
    if (this.config.recordResponseBody && body) {
      try {
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        this.span.setAttribute(
          'http.response.body',
          bodyStr.length > 1000 ? bodyStr.substring(0, 1000) + '...' : bodyStr
        );
      } catch (e) {
        // Log serialization errors at debug level for troubleshooting
        if (typeof console !== 'undefined') {
          console.debug?.('[trix-telemetry] Failed to serialize:', e);
        }
      }
    }
  }

  setResponseSize(bytes: number): void {
    this.span.setAttribute('http.response_content_length', bytes);
  }

  recordError(error: Error): void {
    this.span.recordException(error);
    this.span.setAttribute('error.type', error.name);
    this.span.setAttribute('error.message', error.message);
  }

  success(): void {
    this.span.setStatus({ code: SpanStatusCode.OK });
    this.span.end();
  }

  failure(message?: string): void {
    this.span.setStatus({
      code: SpanStatusCode.ERROR,
      message,
    });
    this.span.end();
  }

  setAttribute(key: string, value: string | number | boolean): void {
    this.span.setAttribute(key, value);
  }
}

/**
 * No-op span implementation when telemetry is disabled
 */
class NoOpRequestSpan implements RequestSpan {
  setRequestBody(): void {}
  setStatusCode(): void {}
  setResponseBody(): void {}
  setResponseSize(): void {}
  recordError(): void {}
  success(): void {}
  failure(): void {}
  setAttribute(): void {}
}

/**
 * Decorator to automatically create spans for async methods
 *
 * @param operation - Operation name for the span
 *
 * @example
 * ```typescript
 * class MyResource {
 *   @traced('myResource.doSomething')
 *   async doSomething(): Promise<Result> {
 *     // This method will automatically create a span
 *   }
 * }
 * ```
 */
export function traced(operation: string) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const span = createRequestSpan('INTERNAL', operation, operation);

      try {
        const result = await originalMethod.apply(this, args);
        span.success();
        return result;
      } catch (error) {
        if (error instanceof Error) {
          span.recordError(error);
        }
        span.failure(error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    } as T;

    return descriptor;
  };
}

/**
 * Utility to wrap an async function with tracing
 *
 * @param operation - Operation name for the span
 * @param fn - Async function to trace
 *
 * @example
 * ```typescript
 * const result = await withTracing('custom.operation', async () => {
 *   return await someAsyncWork();
 * });
 * ```
 */
export async function withTracing<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const span = createRequestSpan('INTERNAL', operation, operation);

  try {
    const result = await fn();
    span.success();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      span.recordError(error);
    }
    span.failure(error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
