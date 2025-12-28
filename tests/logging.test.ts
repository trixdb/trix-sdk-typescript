/**
 * Tests for Trix structured logging utilities.
 */

import {
  Logger,
  LogLevel,
  LogFormat,
  LogConfig,
  LogEntry,
  setupLogging,
  getLogger,
  generateRequestId,
  getRequestId,
  setRequestId,
  clearRequestId,
  withRequestId,
  logRequest,
  logResponse,
  logError,
} from '../src/utils/logging';

describe('LogLevel', () => {
  it('should have correct level values', () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.NONE).toBe(4);
  });
});

describe('LogFormat', () => {
  it('should have correct format values', () => {
    expect(LogFormat.TEXT).toBe('text');
    expect(LogFormat.JSON).toBe('json');
  });
});

describe('Request ID', () => {
  beforeEach(() => {
    clearRequestId();
  });

  it('should generate unique request IDs', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  it('should set and get request ID', () => {
    expect(getRequestId()).toBeUndefined();

    const id = setRequestId('test-123');
    expect(id).toBe('test-123');
    expect(getRequestId()).toBe('test-123');

    clearRequestId();
    expect(getRequestId()).toBeUndefined();
  });

  it('should generate ID if none provided', () => {
    const id = setRequestId();
    expect(id).toBeDefined();
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('withRequestId', () => {
  beforeEach(() => {
    clearRequestId();
  });

  it('should set request ID during function execution', async () => {
    let capturedId: string | undefined;

    await withRequestId(async () => {
      capturedId = getRequestId();
    });

    expect(capturedId).toBeDefined();
    expect(getRequestId()).toBeUndefined();
  });

  it('should use custom ID if provided', async () => {
    let capturedId: string | undefined;

    await withRequestId(async () => {
      capturedId = getRequestId();
    }, 'custom-id');

    expect(capturedId).toBe('custom-id');
    expect(getRequestId()).toBeUndefined();
  });

  it('should clear ID even if function throws', async () => {
    try {
      await withRequestId(async () => {
        throw new Error('Test error');
      });
    } catch {
      // Expected
    }

    expect(getRequestId()).toBeUndefined();
  });
});

describe('Logger', () => {
  describe('creation', () => {
    it('should create logger with default config', () => {
      const logger = new Logger();
      expect(logger).toBeDefined();
    });

    it('should create logger with custom name', () => {
      const logger = new Logger('custom');
      expect(logger).toBeDefined();
    });

    it('should create logger with custom config', () => {
      const logger = new Logger('test', {
        level: LogLevel.DEBUG,
        format: LogFormat.JSON,
      });
      expect(logger).toBeDefined();
    });
  });

  describe('level checking', () => {
    it('should correctly check if level is enabled', () => {
      const logger = new Logger('test', { level: LogLevel.WARN });
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(false);
      expect(logger.isLevelEnabled(LogLevel.INFO)).toBe(false);
      expect(logger.isLevelEnabled(LogLevel.WARN)).toBe(true);
      expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(true);
    });
  });

  describe('withContext', () => {
    it('should create child logger with additional context', () => {
      const logger = new Logger('test', {}, { key1: 'value1' });
      const child = logger.withContext({ key2: 'value2' });

      expect(child).not.toBe(logger);
    });
  });

  describe('logging methods', () => {
    let consoleDebugSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleDebugSpy.mockRestore();
      consoleInfoSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should call debug when level is DEBUG', () => {
      const logger = new Logger('test', { level: LogLevel.DEBUG });
      logger.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should not call debug when level is INFO', () => {
      const logger = new Logger('test', { level: LogLevel.INFO });
      logger.debug('Debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should call info', () => {
      const logger = new Logger('test', { level: LogLevel.INFO });
      logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should call warn', () => {
      const logger = new Logger('test', { level: LogLevel.WARN });
      logger.warn('Warn message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should call error with exception', () => {
      const logger = new Logger('test', { level: LogLevel.ERROR });
      logger.error('Error message', new Error('Test error'));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('formatting', () => {
    let consoleInfoSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
      consoleInfoSpy.mockRestore();
    });

    it('should format as text', () => {
      const logger = new Logger('test', {
        level: LogLevel.INFO,
        format: LogFormat.TEXT,
        includeTimestamp: false,
      });
      logger.info('Test message');

      const output = consoleInfoSpy.mock.calls[0][0];
      expect(output).toContain('[INFO]');
      expect(output).toContain('[test]');
      expect(output).toContain('Test message');
    });

    it('should format as JSON', () => {
      const logger = new Logger('test', {
        level: LogLevel.INFO,
        format: LogFormat.JSON,
        includeTimestamp: false,
      });
      logger.info('Test message');

      const output = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.logger).toBe('test');
    });

    it('should include request ID when set', () => {
      setRequestId('req-123');
      const logger = new Logger('test', {
        level: LogLevel.INFO,
        format: LogFormat.TEXT,
        includeRequestId: true,
        includeTimestamp: false,
      });
      logger.info('Test message');
      clearRequestId();

      const output = consoleInfoSpy.mock.calls[0][0];
      expect(output).toContain('[req:req-123]');
    });

    it('should include extra data', () => {
      const logger = new Logger('test', {
        level: LogLevel.INFO,
        format: LogFormat.JSON,
        includeTimestamp: false,
      });
      logger.info('Test message', { key: 'value' });

      const output = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.extra).toEqual({ key: 'value' });
    });
  });

  describe('custom output', () => {
    it('should use custom output function', () => {
      const outputFn = jest.fn();
      const logger = new Logger('test', {
        level: LogLevel.INFO,
        output: outputFn,
      });

      logger.info('Test message');

      expect(outputFn).toHaveBeenCalledWith(
        expect.any(String),
        LogLevel.INFO
      );
    });
  });
});

describe('setupLogging', () => {
  it('should return a logger', () => {
    const logger = setupLogging();
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should accept custom config', () => {
    const logger = setupLogging({ level: LogLevel.DEBUG });
    expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(true);
  });
});

describe('getLogger', () => {
  it('should return the global logger', () => {
    const logger1 = getLogger();
    const logger2 = getLogger();
    expect(logger1).toBe(logger2);
  });

  it('should return named logger', () => {
    const logger = getLogger('custom');
    expect(logger).toBeInstanceOf(Logger);
  });
});

describe('Log helpers', () => {
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
  });

  describe('logRequest', () => {
    it('should log request details', () => {
      const logger = new Logger('test', { level: LogLevel.DEBUG });
      logRequest(logger, 'GET', '/memories', { limit: 10 });
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('logResponse', () => {
    it('should log response status', () => {
      const logger = new Logger('test', { level: LogLevel.DEBUG });
      logResponse(logger, 200, 50.5);
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log error details', () => {
      const logger = new Logger('test', { level: LogLevel.ERROR });
      logError(logger, new Error('Test error'), { path: '/memories' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
