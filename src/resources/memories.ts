/**
 * Memories resource
 */

import type { Trix } from '../client.js';
import type {
  Memory,
  CreateMemoryParams,
  UpdateMemoryParams,
  ListMemoriesParams,
  PaginatedResponse,
  BulkResult,
  MemoryConfig,
  Transcript,
  TranscribeParams,
  Job,
  MemoryStatsParams,
  MemoryStats,
} from '../types.js';
import { BaseResource, buildParams, validateBulkArray, validateIds } from './base.js';
import { paginateIterator } from '../utils/pagination.js';
import { validateId } from '../utils/security.js';

/**
 * Memories resource for managing memory objects
 *
 * @example
 * ```typescript
 * const memory = await client.memories.create({
 *   content: 'Important note',
 *   tags: ['work']
 * });
 *
 * const memories = await client.memories.list({ limit: 10 });
 * ```
 */
export class Memories extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a new memory
   *
   * @param params - Memory creation parameters
   * @returns Created memory
   *
   * @example
   * ```typescript
   * // Create a text memory
   * const memory = await client.memories.create({
   *   content: 'Remember to buy milk',
   *   type: 'text',
   *   tags: ['shopping', 'personal']
   * });
   *
   * // Create an audio memory with file upload
   * const audioMemory = await client.memories.create({
   *   content: 'Audio recording',
   *   type: 'audio',
   *   audioFile: audioBlob,
   *   tags: ['voice-note']
   * });
   * ```
   */
  async create(params: CreateMemoryParams): Promise<Memory> {
    // Handle audio file upload with multipart/form-data
    if (params.audioFile) {
      const formData = new FormData();
      formData.append('file', params.audioFile);
      formData.append('content', params.content);
      if (params.type) {
        formData.append('type', params.type);
      }
      if (params.tags) {
        formData.append('tags', JSON.stringify(params.tags));
      }
      if (params.metadata) {
        formData.append('metadata', JSON.stringify(params.metadata));
      }
      if (params.spaceId) {
        formData.append('spaceId', params.spaceId);
      }

      return this.client.requestMultipart<Memory>({
        method: 'POST',
        path: '/memories',
        formData,
      });
    }

    // Standard JSON request for non-file uploads
    return this.request<Memory>({
      method: 'POST',
      path: '/memories',
      body: params,
    });
  }

  /**
   * List memories with optional filtering and search
   *
   * @param params - List parameters
   * @returns Paginated list of memories
   *
   * @example
   * ```typescript
   * const results = await client.memories.list({
   *   q: 'important',
   *   mode: 'hybrid',
   *   limit: 20,
   *   tags: ['work']
   * });
   * ```
   */
  async list(params?: ListMemoriesParams): Promise<PaginatedResponse<Memory>> {
    return this.request<PaginatedResponse<Memory>>({
      method: 'GET',
      path: '/memories',
      params: buildParams(params || {}),
    });
  }

  /**
   * Get all memories using async iteration
   *
   * @param params - List parameters
   * @returns Async iterator of memories
   *
   * @example
   * ```typescript
   * for await (const memory of client.memories.listAll({ limit: 100 })) {
   *   console.log(memory.content);
   * }
   * ```
   */
  listAll(params?: ListMemoriesParams): AsyncGenerator<Memory, void, unknown> {
    return paginateIterator(
      (p) => this.list(p),
      params ?? {}
    );
  }

  /**
   * Get a specific memory by ID
   *
   * @param id - Memory ID
   * @returns Memory object
   *
   * @example
   * ```typescript
   * const memory = await client.memories.get('mem_123');
   * ```
   */
  async get(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'GET',
      path: `/memories/${id}`,
    });
  }

  /**
   * Update a memory
   *
   * @param id - Memory ID
   * @param params - Update parameters
   * @returns Updated memory
   *
   * @example
   * ```typescript
   * const updated = await client.memories.update('mem_123', {
   *   content: 'Updated content',
   *   tags: ['updated']
   * });
   * ```
   */
  async update(id: string, params: UpdateMemoryParams): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'PATCH',
      path: `/memories/${id}`,
      body: params,
    });
  }

  /**
   * Delete a memory
   *
   * @param id - Memory ID
   *
   * @throws ValidationError if ID format is invalid
   * @throws NotFoundError if memory doesn't exist
   *
   * @example
   * ```typescript
   * await client.memories.delete('mem_123');
   * ```
   */
  async delete(id: string): Promise<void> {
    validateId(id, 'memory');
    return this.request<void>({
      method: 'DELETE',
      path: `/memories/${id}`,
    });
  }

  /**
   * Bulk create memories
   *
   * @param memories - Array of memory creation parameters
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   *
   * @example
   * ```typescript
   * const result = await client.memories.bulkCreate([
   *   { content: 'Memory 1', tags: ['bulk'] },
   *   { content: 'Memory 2', tags: ['bulk'] }
   * ]);
   * console.log(`Created ${result.success} memories`);
   * ```
   */
  async bulkCreate(memories: CreateMemoryParams[]): Promise<BulkResult> {
    validateBulkArray(memories, 'bulkCreate');
    return this.request<BulkResult>({
      method: 'POST',
      path: '/memories/bulk',
      body: { memories },
    });
  }

  /**
   * Bulk update memories
   *
   * @param updates - Array of memory updates (must include id in each object)
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   *
   * @example
   * ```typescript
   * const result = await client.memories.bulkUpdate([
   *   { id: 'mem_1', tags: ['updated'] },
   *   { id: 'mem_2', tags: ['updated'] }
   * ]);
   * ```
   */
  async bulkUpdate(updates: UpdateMemoryParams[]): Promise<BulkResult> {
    validateBulkArray(updates, 'bulkUpdate');
    // Validate all IDs before making the request
    updates.forEach((update, index) => {
      if (!update.id) {
        throw new Error(`Update at index ${index} is missing an id`);
      }
      validateId(update.id, `memory[${index}]`);
    });
    return this.request<BulkResult>({
      method: 'PATCH',
      path: '/memories/bulk',
      body: { updates },
    });
  }

  /**
   * Bulk delete memories
   *
   * @param ids - Array of memory IDs to delete
   * @returns Bulk operation result
   *
   * @throws Error if array is empty or exceeds limit (1000)
   *
   * @example
   * ```typescript
   * const result = await client.memories.bulkDelete(['mem_1', 'mem_2']);
   * console.log(`Deleted ${result.success} memories`);
   * ```
   */
  async bulkDelete(ids: string[]): Promise<BulkResult> {
    validateBulkArray(ids, 'bulkDelete');
    validateIds(ids, 'memory');
    return this.request<BulkResult>({
      method: 'DELETE',
      path: '/memories/bulk',
      body: { ids },
    });
  }

  /**
   * Get memory configuration
   *
   * @returns Memory configuration
   *
   * @example
   * ```typescript
   * const config = await client.memories.getConfig();
   * console.log(`Max content length: ${config.maxContentLength}`);
   * ```
   */
  async getConfig(): Promise<MemoryConfig> {
    return this.request<MemoryConfig>({
      method: 'GET',
      path: '/memories/config',
    });
  }

  /**
   * Stream audio content for an audio memory
   *
   * @param id - Memory ID
   * @returns Readable stream of audio data
   *
   * @example
   * ```typescript
   * const stream = await client.memories.streamAudio('mem_123');
   * // Use stream for playback or download
   * ```
   */
  async streamAudio(id: string): Promise<ReadableStream> {
    validateId(id, 'memory');
    return this.client.requestStream({
      method: 'GET',
      path: `/memories/${id}/audio`,
    });
  }

  /**
   * Get transcript for an audio memory
   *
   * @param id - Memory ID
   * @returns Transcript object
   *
   * @example
   * ```typescript
   * const transcript = await client.memories.getTranscript('mem_123');
   * console.log(transcript.text);
   * ```
   */
  async getTranscript(id: string): Promise<Transcript> {
    validateId(id, 'memory');
    return this.request<Transcript>({
      method: 'GET',
      path: `/memories/${id}/transcript`,
    });
  }

  /**
   * Request transcription for an audio memory
   *
   * @param id - Memory ID
   * @param params - Transcription parameters
   * @returns Job object for tracking transcription progress
   *
   * @example
   * ```typescript
   * const job = await client.memories.transcribe('mem_123', {
   *   language: 'en',
   *   priority: 'high'
   * });
   * ```
   */
  async transcribe(id: string, params?: TranscribeParams): Promise<Job> {
    validateId(id, 'memory');
    return this.request<Job>({
      method: 'POST',
      path: `/memories/${id}/transcribe`,
      body: params,
    });
  }

  /**
   * Get memory statistics
   *
   * @param params - Stats parameters
   * @returns Memory statistics
   *
   * @example
   * ```typescript
   * const stats = await client.memories.getStats({
   *   spaceId: 'space_123',
   *   includeTypeDistribution: true,
   *   includeTimeline: true,
   *   timelineGranularity: 'day'
   * });
   * console.log(`Total memories: ${stats.total}`);
   * ```
   */
  async getStats(params?: MemoryStatsParams): Promise<MemoryStats> {
    return this.request<MemoryStats>({
      method: 'GET',
      path: '/memories/stats',
      params: buildParams(params || {}),
    });
  }
}
