/**
 * Structured logging utilities for Trix SDK.
 */

import { redactSensitiveData } from './security';

/**
 * Log levels supported by the SDK
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Log output formats
 */
export enum LogFormat {
  TEXT = 'text',
  JSON = 'json',
}

/**
 * Configuration for SDK logging
 */
export interface LogConfig {
  /** Minimum log level to output */
  level: LogLevel;
  /** Output format (text or json) */
  format: LogFormat;
  /** Whether to include timestamps */
  includeTimestamp: boolean;
  /** Whether to include request IDs */
  includeRequestId: boolean;
  /** Whether to redact sensitive data */
  redactSensitive: boolean;
  /** Custom log output function */
  output?: (message: string, level: LogLevel) => void;
}

/**
 * Default logging configuration
 */
export const DEFAULT_LOG_CONFIG: LogConfig = {
  level: LogLevel.INFO,
  format: LogFormat.TEXT,
  includeTimestamp: true,
  includeRequestId: true,
  redactSensitive: true,
};

/**
 * Log entry structure for structured logging
 */
export interface LogEntry {
  level: string;
  message: string;
  timestamp?: string;
  requestId?: string;
  extra?: Record<string, unknown>;
  error?: {
    type: string;
    message: string;
    stack?: string;
  };
}

/** Global request ID storage using AsyncLocalStorage pattern */
let currentRequestId: string | undefined;

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the current request ID
 */
export function getRequestId(): string | undefined {
  return currentRequestId;
}

/**
 * Set the request ID
 */
export function setRequestId(requestId?: string): string {
  currentRequestId = requestId ?? generateRequestId();
  return currentRequestId;
}

/**
 * Clear the request ID
 */
export function clearRequestId(): void {
  currentRequestId = undefined;
}

/**
 * Run a function with a specific request ID
 */
export async function withRequestId<T>(
  fn: () => T | Promise<T>,
  requestId?: string
): Promise<T> {
  setRequestId(requestId);
  try {
    return await fn();
  } finally {
    clearRequestId();
  }
}

/**
 * Logger class with configurable levels and formats
 */
export class Logger {
  private config: LogConfig;
  private name: string;
  private context: Record<string, unknown>;

  constructor(
    name: string = 'trix',
    config: Partial<LogConfig> = {},
    context: Record<string, unknown> = {}
  ) {
    this.name = name;
    this.config = { ...DEFAULT_LOG_CONFIG, ...config };
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  withContext(context: Record<string, unknown>): Logger {
    return new Logger(this.name, this.config, { ...this.context, ...context });
  }

  /**
   * Check if a log level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Log at DEBUG level
   */
  debug(message: string, extra?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, extra);
  }

  /**
   * Log at INFO level
   */
  info(message: string, extra?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, extra);
  }

  /**
   * Log at WARN level
   */
  warn(message: string, extra?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, extra);
  }

  /**
   * Log at ERROR level
   */
  error(
    message: string,
    error?: Error,
    extra?: Record<string, unknown>
  ): void {
    const errorInfo = error
      ? {
          type: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined;
    this.log(LogLevel.ERROR, message, extra, errorInfo);
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    extra?: Record<string, unknown>,
    error?: { type: string; message: string; stack?: string }
  ): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
      level: LogLevel[level],
      message,
    };

    if (this.config.includeTimestamp) {
      entry.timestamp = new Date().toISOString();
    }

    if (this.config.includeRequestId && currentRequestId) {
      entry.requestId = currentRequestId;
    }

    const mergedExtra = { ...this.context, ...extra };
    if (Object.keys(mergedExtra).length > 0) {
      entry.extra = this.config.redactSensitive
        ? (redactSensitiveData(mergedExtra) as Record<string, unknown>)
        : mergedExtra;
    }

    if (error) {
      entry.error = error;
    }

    const formatted = this.format(entry);

    if (this.config.output) {
      this.config.output(formatted, level);
    } else {
      this.defaultOutput(formatted, level);
    }
  }

  /**
   * Format log entry based on configuration
   */
  private format(entry: LogEntry): string {
    if (this.config.format === LogFormat.JSON) {
      return JSON.stringify({
        ...entry,
        logger: this.name,
      });
    }

    // Text format
    const parts: string[] = [];

    if (entry.timestamp) {
      parts.push(`[${entry.timestamp}]`);
    }

    parts.push(`[${entry.level}]`);
    parts.push(`[${this.name}]`);

    if (entry.requestId) {
      parts.push(`[req:${entry.requestId.substring(0, 8)}]`);
    }

    parts.push(entry.message);

    if (entry.extra) {
      parts.push(JSON.stringify(entry.extra));
    }

    if (entry.error) {
      parts.push(`Error: ${entry.error.type}: ${entry.error.message}`);
    }

    return parts.join(' ');
  }

  /**
   * Default output handler
   */
  private defaultOutput(message: string, level: LogLevel): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
        console.error(message);
        break;
    }
  }
}

/** Global logger instance */
let globalLogger: Logger | null = null;

/**
 * Set up global logging with configuration
 */
export function setupLogging(config: Partial<LogConfig> = {}): Logger {
  globalLogger = new Logger('trix', config);
  return globalLogger;
}

/**
 * Get the global logger or create one with defaults
 */
export function getLogger(name?: string): Logger {
  if (!globalLogger) {
    globalLogger = new Logger('trix');
  }
  if (name && name !== 'trix') {
    return new Logger(name, globalLogger['config']);
  }
  return globalLogger;
}

/**
 * Log an HTTP request
 */
export function logRequest(
  logger: Logger,
  method: string,
  url: string,
  params?: Record<string, unknown>
): void {
  logger.debug(`Request: ${method} ${url}`, {
    method,
    url,
    params: params ?? {},
  });
}

/**
 * Log an HTTP response
 */
export function logResponse(
  logger: Logger,
  statusCode: number,
  durationMs?: number
): void {
  logger.debug(`Response: ${statusCode}`, {
    statusCode,
    ...(durationMs !== undefined && { durationMs: Math.round(durationMs * 100) / 100 }),
  });
}

/**
 * Log an error
 */
export function logError(
  logger: Logger,
  error: Error,
  context?: Record<string, unknown>
): void {
  logger.error(`Error: ${error.message}`, error, context);
}
