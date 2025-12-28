/**
 * Mock Trix client for testing
 *
 * Provides a fully-typed mock client that can be used in unit tests
 * without making real API calls.
 *
 * @example
 * ```typescript
 * import { MockTrix, createMockMemory } from '@trix/client/testing';
 *
 * const mockClient = new MockTrix();
 *
 * // Configure mock responses
 * mockClient.memories.mockCreate(createMockMemory({ content: 'Test' }));
 *
 * // Use in tests
 * const memory = await mockClient.memories.create({ content: 'Test' });
 * expect(memory.content).toBe('Test');
 *
 * // Verify calls
 * expect(mockClient.memories.createCalls).toHaveLength(1);
 * ```
 */

import type {
  Memory,
  Cluster,
  Relationship,
  Highlight,
  Space,
  Webhook,
  Session,
  Job,
  Entity,
  Fact,
  Enrichment,
  PaginatedResponse,
  BulkResult,
} from '../types.js';

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Create a mock Memory object
 */
export function createMockMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: `mem_${randomId()}`,
    spaceId: `space_${randomId()}`,
    content: 'Mock memory content',
    type: 'text',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock Cluster object
 */
export function createMockCluster(overrides: Partial<Cluster> = {}): Cluster {
  return {
    id: `clus_${randomId()}`,
    spaceId: `space_${randomId()}`,
    name: 'Mock Cluster',
    description: 'A mock cluster for testing',
    memoryIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock Relationship object
 */
export function createMockRelationship(
  overrides: Partial<Relationship> = {}
): Relationship {
  return {
    id: `rel_${randomId()}`,
    sourceId: `mem_${randomId()}`,
    targetId: `mem_${randomId()}`,
    relationshipType: 'related_to',
    strength: 0.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock Entity object
 */
export function createMockEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    id: `ent_${randomId()}`,
    name: 'Mock Entity',
    type: 'person',
    aliases: [],
    properties: {},
    memoryIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock Fact object
 */
export function createMockFact(overrides: Partial<Fact> = {}): Fact {
  return {
    id: `fact_${randomId()}`,
    subject: 'Subject',
    predicate: 'is',
    object: 'Object',
    confidence: 1.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock paginated response
 */
export function createMockPaginatedResponse<T>(
  data: T[],
  overrides: Partial<Omit<PaginatedResponse<T>, 'data'>> = {}
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      total: data.length,
      page: 1,
      limit: 100,
      hasMore: false,
      ...overrides.pagination,
    },
    ...overrides,
  };
}

/**
 * Create a mock bulk result
 */
export function createMockBulkResult(
  overrides: Partial<BulkResult> = {}
): BulkResult {
  return {
    success: 1,
    failed: 0,
    errors: [],
    ...overrides,
  };
}

// ============================================================================
// Mock Resource Classes
// ============================================================================

type MockResponse<T> = T | Error | (() => T | Promise<T>);

/**
 * Base mock resource with call tracking
 */
class MockResource<TCreate, TUpdate, TItem> {
  private _createResponse: MockResponse<TItem> | null = null;
  private _listResponse: MockResponse<PaginatedResponse<TItem>> | null = null;
  private _getResponse: MockResponse<TItem> | null = null;
  private _updateResponse: MockResponse<TItem> | null = null;
  private _deleteResponse: MockResponse<void> | null = null;

  readonly createCalls: TCreate[] = [];
  readonly listCalls: Record<string, unknown>[] = [];
  readonly getCalls: string[] = [];
  readonly updateCalls: Array<{ id: string; params: TUpdate }> = [];
  readonly deleteCalls: string[] = [];

  mockCreate(response: MockResponse<TItem>): void {
    this._createResponse = response;
  }

  mockList(response: MockResponse<PaginatedResponse<TItem>>): void {
    this._listResponse = response;
  }

  mockGet(response: MockResponse<TItem>): void {
    this._getResponse = response;
  }

  mockUpdate(response: MockResponse<TItem>): void {
    this._updateResponse = response;
  }

  mockDelete(response: MockResponse<void>): void {
    this._deleteResponse = response;
  }

  async create(params: TCreate): Promise<TItem> {
    this.createCalls.push(params);
    return this.resolveResponse(this._createResponse);
  }

  async list(params?: Record<string, unknown>): Promise<PaginatedResponse<TItem>> {
    this.listCalls.push(params || {});
    return this.resolveResponse(this._listResponse);
  }

  async get(id: string): Promise<TItem> {
    this.getCalls.push(id);
    return this.resolveResponse(this._getResponse);
  }

  async update(id: string, params: TUpdate): Promise<TItem> {
    this.updateCalls.push({ id, params });
    return this.resolveResponse(this._updateResponse);
  }

  async delete(id: string): Promise<void> {
    this.deleteCalls.push(id);
    return this.resolveResponse(this._deleteResponse);
  }

  reset(): void {
    this.createCalls.length = 0;
    this.listCalls.length = 0;
    this.getCalls.length = 0;
    this.updateCalls.length = 0;
    this.deleteCalls.length = 0;
  }

  private async resolveResponse<R>(response: MockResponse<R> | null): Promise<R> {
    if (response === null) {
      throw new Error('No mock response configured');
    }
    if (response instanceof Error) {
      throw response;
    }
    if (typeof response === 'function') {
      return (response as () => R | Promise<R>)();
    }
    return response;
  }
}

/**
 * Mock Memories resource
 */
export class MockMemoriesResource extends MockResource<
  { content: string; [key: string]: unknown },
  Record<string, unknown>,
  Memory
> {
  private _bulkCreateResponse: MockResponse<BulkResult> | null = null;
  readonly bulkCreateCalls: Array<{ content: string }[]> = [];

  mockBulkCreate(response: MockResponse<BulkResult>): void {
    this._bulkCreateResponse = response;
  }

  async bulkCreate(memories: { content: string }[]): Promise<BulkResult> {
    this.bulkCreateCalls.push(memories);
    if (this._bulkCreateResponse === null) {
      return createMockBulkResult({ success: memories.length });
    }
    if (this._bulkCreateResponse instanceof Error) {
      throw this._bulkCreateResponse;
    }
    if (typeof this._bulkCreateResponse === 'function') {
      return this._bulkCreateResponse();
    }
    return this._bulkCreateResponse;
  }
}

/**
 * Mock Clusters resource
 */
export class MockClustersResource extends MockResource<
  { name: string; [key: string]: unknown },
  Record<string, unknown>,
  Cluster
> {}

/**
 * Mock Entities resource
 */
export class MockEntitiesResource extends MockResource<
  { name: string; type: string; [key: string]: unknown },
  Record<string, unknown>,
  Entity
> {
  private _searchResponse: MockResponse<PaginatedResponse<Entity>> | null = null;
  readonly searchCalls: Array<{ query: string; params?: Record<string, unknown> }> = [];

  mockSearch(response: MockResponse<PaginatedResponse<Entity>>): void {
    this._searchResponse = response;
  }

  async search(query: string, params?: Record<string, unknown>): Promise<PaginatedResponse<Entity>> {
    this.searchCalls.push({ query, params });
    if (this._searchResponse === null) {
      return createMockPaginatedResponse([]);
    }
    if (this._searchResponse instanceof Error) {
      throw this._searchResponse;
    }
    if (typeof this._searchResponse === 'function') {
      return this._searchResponse();
    }
    return this._searchResponse;
  }
}

/**
 * Mock Facts resource
 */
export class MockFactsResource extends MockResource<
  { subject: string; predicate: string; object: string; [key: string]: unknown },
  Record<string, unknown>,
  Fact
> {}

// ============================================================================
// Main Mock Client
// ============================================================================

/**
 * Mock Trix client for testing
 *
 * @example
 * ```typescript
 * import { MockTrix, createMockMemory } from '@trix/client/testing';
 *
 * describe('MyService', () => {
 *   let mockClient: MockTrix;
 *
 *   beforeEach(() => {
 *     mockClient = new MockTrix();
 *   });
 *
 *   it('should create a memory', async () => {
 *     const mockMem = createMockMemory({ content: 'Test' });
 *     mockClient.memories.mockCreate(mockMem);
 *
 *     const result = await myService.createMemory(mockClient, 'Test');
 *
 *     expect(result.id).toBe(mockMem.id);
 *     expect(mockClient.memories.createCalls).toHaveLength(1);
 *     expect(mockClient.memories.createCalls[0].content).toBe('Test');
 *   });
 * });
 * ```
 */
export class MockTrix {
  readonly memories = new MockMemoriesResource();
  readonly clusters = new MockClustersResource();
  readonly entities = new MockEntitiesResource();
  readonly facts = new MockFactsResource();

  // Simplified versions of other resources
  readonly relationships = createSimpleMockResource<Relationship>();
  readonly highlights = createSimpleMockResource<Highlight>();
  readonly spaces = createSimpleMockResource<Space>();
  readonly webhooks = createSimpleMockResource<Webhook>();
  readonly graph = {
    traverseCalls: [] as unknown[],
    mockTraverse: null as MockResponse<unknown> | null,
    async traverse(params: unknown) {
      this.traverseCalls.push(params);
      return this.mockTraverse || { nodes: [], edges: [] };
    },
  };
  readonly agent = {
    createSessionCalls: [] as unknown[],
    mockCreateSession: null as MockResponse<Session> | null,
    async createSession(params: unknown) {
      this.createSessionCalls.push(params);
      return this.mockCreateSession || { id: `sess_${randomId()}` };
    },
  };
  readonly search = {
    similarCalls: [] as unknown[],
    mockSimilar: null as MockResponse<PaginatedResponse<Memory>> | null,
    async similar(memoryId: string, params?: unknown) {
      this.similarCalls.push({ memoryId, params });
      return this.mockSimilar || createMockPaginatedResponse([]);
    },
  };
  readonly jobs = {
    getCalls: [] as string[],
    mockGet: null as MockResponse<Job> | null,
    async get(id: string) {
      this.getCalls.push(id);
      return this.mockGet || { id, status: 'completed' };
    },
  };
  readonly enrichments = {
    listCalls: [] as string[],
    mockList: null as MockResponse<Enrichment[]> | null,
    async list(memoryId: string) {
      this.listCalls.push(memoryId);
      return this.mockList || [];
    },
  };
  readonly feedback = {
    submitCalls: [] as unknown[],
    async submit(params: unknown) {
      this.submitCalls.push(params);
    },
  };

  /**
   * Reset all mock resources and call history
   */
  reset(): void {
    this.memories.reset();
    this.clusters.reset();
    this.entities.reset();
    this.facts.reset();
    this.graph.traverseCalls.length = 0;
    this.agent.createSessionCalls.length = 0;
    this.search.similarCalls.length = 0;
    this.jobs.getCalls.length = 0;
    this.enrichments.listCalls.length = 0;
    this.feedback.submitCalls.length = 0;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function createSimpleMockResource<T>() {
  return {
    createCalls: [] as unknown[],
    listCalls: [] as unknown[],
    getCalls: [] as string[],
    updateCalls: [] as unknown[],
    deleteCalls: [] as string[],
    mockCreate: null as MockResponse<T> | null,
    mockList: null as MockResponse<PaginatedResponse<T>> | null,
    mockGet: null as MockResponse<T> | null,
    async create(params: unknown): Promise<T> {
      this.createCalls.push(params);
      if (this.mockCreate instanceof Error) throw this.mockCreate;
      return (this.mockCreate || {}) as T;
    },
    async list(params?: unknown): Promise<PaginatedResponse<T>> {
      this.listCalls.push(params);
      if (this.mockList instanceof Error) throw this.mockList;
      return (this.mockList || createMockPaginatedResponse([])) as PaginatedResponse<T>;
    },
    async get(id: string): Promise<T> {
      this.getCalls.push(id);
      if (this.mockGet instanceof Error) throw this.mockGet;
      return (this.mockGet || {}) as T;
    },
    async update(id: string, params: unknown): Promise<T> {
      this.updateCalls.push({ id, params });
      return {} as T;
    },
    async delete(id: string): Promise<void> {
      this.deleteCalls.push(id);
    },
  };
}

/**
