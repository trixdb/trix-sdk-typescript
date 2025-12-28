/**
 * Tests for base resource utilities.
 */

import {
  BaseResource,
  validateIds,
  buildParams,
  validateBulkArray,
  findDuplicateIds,
  DEFAULT_BULK_LIMIT,
} from '../src/resources/base';

// Mock client for testing
const mockClient = {
  request: jest.fn(),
  requestMultipart: jest.fn(),
  requestRaw: jest.fn(),
  requestStream: jest.fn(),
};

describe('validateIds', () => {
  it('should not throw for valid IDs', () => {
    expect(() => validateIds(['mem_123', 'mem_456'], 'memory')).not.toThrow();
  });

  it('should throw for empty ID', () => {
    expect(() => validateIds(['mem_123', ''], 'memory')).toThrow();
  });

  it('should not throw for empty array', () => {
    expect(() => validateIds([], 'memory')).not.toThrow();
  });

  it('should not throw for undefined', () => {
    expect(() => validateIds(undefined, 'memory')).not.toThrow();
  });
});

describe('buildParams', () => {
  it('should remove undefined values', () => {
    const result = buildParams({
      limit: 10,
      offset: undefined,
      query: 'test',
    });
    expect(result).toEqual({ limit: 10, query: 'test' });
    expect(result).not.toHaveProperty('offset');
  });

  it('should keep null values', () => {
    const result = buildParams({
      limit: 10,
      value: null,
    });
    expect(result).toEqual({ limit: 10, value: null });
  });

  it('should keep false values', () => {
    const result = buildParams({
      enabled: false,
      limit: 10,
    });
    expect(result).toEqual({ enabled: false, limit: 10 });
  });

  it('should keep zero values', () => {
    const result = buildParams({
      offset: 0,
      limit: 10,
    });
    expect(result).toEqual({ offset: 0, limit: 10 });
  });

  it('should return empty object for all undefined', () => {
    const result = buildParams({
      a: undefined,
      b: undefined,
    });
    expect(result).toEqual({});
  });
});

describe('validateBulkArray', () => {
  it('should not throw for valid array', () => {
    expect(() => validateBulkArray([1, 2, 3], 'test')).not.toThrow();
  });

  it('should throw for empty array', () => {
    expect(() => validateBulkArray([], 'bulkCreate')).toThrow(
      'bulkCreate: array cannot be empty'
    );
  });

  it('should throw for array exceeding max', () => {
    const items = Array(1001).fill({ id: 'test' });
    expect(() => validateBulkArray(items, 'bulkUpdate')).toThrow(
      'bulkUpdate: array exceeds maximum of 1000 items (got 1001)'
    );
  });

  it('should accept custom max limit', () => {
    const items = Array(50).fill({ id: 'test' });
    expect(() => validateBulkArray(items, 'smallBatch', 100)).not.toThrow();
    expect(() => validateBulkArray(items, 'tinyBatch', 10)).toThrow(
      'tinyBatch: array exceeds maximum of 10 items (got 50)'
    );
  });

  it('should have correct default limit', () => {
    expect(DEFAULT_BULK_LIMIT).toBe(1000);
  });
});

describe('findDuplicateIds', () => {
  it('should return empty array for no duplicates', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(findDuplicateIds(items)).toEqual([]);
  });

  it('should find duplicate IDs', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'a' }, { id: 'c' }, { id: 'b' }];
    expect(findDuplicateIds(items)).toEqual(['a', 'b']);
  });

  it('should work with custom id field', () => {
    const items = [{ memoryId: 'a' }, { memoryId: 'b' }, { memoryId: 'a' }];
    expect(findDuplicateIds(items, 'memoryId')).toEqual(['a']);
  });

  it('should ignore items without id field', () => {
    const items = [{ id: 'a' }, { name: 'test' }, { id: 'a' }];
    expect(findDuplicateIds(items)).toEqual(['a']);
  });

  it('should return empty array for empty input', () => {
    expect(findDuplicateIds([])).toEqual([]);
  });
});

describe('BaseResource', () => {
  let resource: BaseResource;

  beforeEach(() => {
    jest.clearAllMocks();
    resource = new BaseResource(mockClient as any);
  });

  it('should store client reference', () => {
    expect((resource as any).client).toBe(mockClient);
  });

  it('should delegate request to client', async () => {
    mockClient.request.mockResolvedValue({ id: 'test' });

    const result = await resource.request({
      method: 'GET',
      path: '/test',
    });

    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/test',
    });
    expect(result).toEqual({ id: 'test' });
  });

  it('should pass params to client request', async () => {
    mockClient.request.mockResolvedValue({ data: [] });

    await resource.request({
      method: 'GET',
      path: '/test',
      params: { limit: 10 },
    });

    // params is translated to query for client compatibility
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/test',
      query: { limit: 10 },
    });
  });

  it('should pass body to client request', async () => {
    mockClient.request.mockResolvedValue({ id: 'new' });

    await resource.request({
      method: 'POST',
      path: '/test',
      body: { name: 'test' },
    });

    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/test',
      body: { name: 'test' },
    });
  });

  it('should pass timeout to client request', async () => {
    mockClient.request.mockResolvedValue({});

    await resource.request({
      method: 'GET',
      path: '/test',
      timeout: 30000,
    });

    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/test',
      timeout: 30000,
    });
  });
});
