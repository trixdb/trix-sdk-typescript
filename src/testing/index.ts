/**
 * Testing utilities for Trix SDK
 *
 * This module provides mock clients and factory functions for testing
 * code that uses the Trix SDK without making real API calls.
 *
 * @example
 * ```typescript
 * import { MockTrix, createMockMemory } from '@trixdb/client/testing';
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
 *   });
 * });
 * ```
 *
 * @packageDocumentation
 */

export {
  // Main mock client
  MockTrix,
  // Mock resource classes (for advanced use cases)
  MockMemoriesResource,
  MockClustersResource,
  MockEntitiesResource,
  MockFactsResource,

  // Factory functions
  createMockMemory,
  createMockCluster,
  createMockRelationship,
  createMockEntity,
  createMockFact,
  createMockPaginatedResponse,
  createMockBulkResult,
} from './mock-client.js';
