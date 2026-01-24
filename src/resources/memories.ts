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
  LinkResourceParams,
  LinkResourceResult,
  UnlinkResourceResult,
  MemoryResourcesResult,
  ProtectionLevel,
  Topic,
  GetTopicsOptions,
  TopicsResult,
  EnrichMemoryOptions,
  EnrichMemoryResult,
  QualityScoreResult,
  SearchByTopicOptions,
  CreateImageMemoryParams,
  VisualSearchParams,
  VisualSearchResult,
  TextToImageSearchParams,
  FindSimilarImagesParams,
  SimilarImagesResult,
  CheckDuplicatesParams,
  DuplicateCheckResult,
  ClusterImagesParams,
  ClusterImagesResult,
  AutoTagParams,
  AutoTagResult,
  BatchAutoTagParams,
  BatchAutoTagResult,
  SuggestQueriesParams,
  QuerySuggestionsResult,
} from '../types.js';
import { BaseResource, buildParams, validateBulkArray, validateIds } from './base.js';
import { paginateIterator } from '../utils/pagination.js';
import { validateId } from '../utils/security.js';
import {
  streamToArrayBuffer,
  normalizeImageInput,
  appendStringField,
  appendJsonField,
  appendBooleanField,
  validateFileSize,
} from './memories/memories.helpers.js';

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
   * Supports audio formats: mp3, mp4, m4a, wav, webm, ogg, flac, aac
   * Supports video formats: mp4, webm, mov, avi, mkv, flv, mpeg
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
   *
   * // Create a video memory with transcription
   * const videoMemory = await client.memories.create({
   *   content: 'Meeting recording',
   *   type: 'audio',
   *   audioFile: videoBlob, // Works with video files too
   *   tags: ['meeting']
   * });
   * ```
   */
  async create(params: CreateMemoryParams): Promise<Memory> {
    // Handle audio/video file upload with multipart/form-data
    if (params.audioFile) {
      validateFileSize(params.audioFile);

      const formData = new FormData();
      formData.append('file', params.audioFile);
      formData.append('content', params.content);
      appendStringField(formData, 'type', params.type);
      appendJsonField(formData, 'tags', params.tags);
      appendJsonField(formData, 'metadata', params.metadata);
      appendStringField(formData, 'spaceId', params.spaceId);

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
   * Stream audio/video content for a memory
   *
   * @param id - Memory ID
   * @returns Readable stream of audio/video data
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
   * Get transcript for an audio or video memory
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
   * Request transcription for an audio or video memory with advanced options
   *
   * @param id - Memory ID
   * @param params - Transcription parameters
   * @returns Job object for tracking transcription progress
   *
   * @example
   * ```typescript
   * // Basic transcription
   * const job = await client.memories.transcribe('mem_123', {
   *   language: 'en'
   * });
   *
   * // Advanced transcription with speaker diarization
   * const job = await client.memories.transcribe('mem_123', {
   *   provider: 'assemblyai',
   *   enableSpeakerDiarization: true,
   *   speakersExpected: 2,
   *   enableAutoChapters: true,
   *   enableEntityDetection: true
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

  /**
   * Link a resource to a memory
   *
   * @param id - Memory ID
   * @param params - Link parameters including resource ID and relationship type
   * @returns Link result
   *
   * @example
   * ```typescript
   * // Link with default relationship type ('related')
   * const result = await client.memories.linkResource('mem_123', {
   *   resourceId: 'res_456'
   * });
   *
   * // Link with specific relationship type
   * const result = await client.memories.linkResource('mem_123', {
   *   resourceId: 'res_456',
   *   relationshipType: 'primary'
   * });
   * ```
   */
  async linkResource(
    id: string,
    params: LinkResourceParams
  ): Promise<LinkResourceResult> {
    validateId(id, 'memory');
    validateId(params.resourceId, 'resource');

    return this.request<LinkResourceResult>({
      method: 'POST',
      path: `/memories/${id}/resources`,
      body: {
        resource_id: params.resourceId,
        relationship_type: params.relationshipType,
      },
    });
  }

  /**
   * Get resources linked to a memory
   *
   * @param id - Memory ID
   * @returns List of resources linked to this memory
   *
   * @example
   * ```typescript
   * const result = await client.memories.getResources('mem_123');
   * console.log(`Linked to ${result.data.length} resources`);
   * ```
   */
  async getResources(id: string): Promise<MemoryResourcesResult> {
    validateId(id, 'memory');

    return this.request<MemoryResourcesResult>({
      method: 'GET',
      path: `/memories/${id}/resources`,
    });
  }

  /**
   * Unlink a resource from a memory
   *
   * @param id - Memory ID
   * @param resourceId - Resource ID to unlink
   * @returns Unlink result
   *
   * @example
   * ```typescript
   * const result = await client.memories.unlinkResource('mem_123', 'res_456');
   * console.log(`Unlinked: ${result.unlinked}`);
   * ```
   */
  async unlinkResource(
    id: string,
    resourceId: string
  ): Promise<UnlinkResourceResult> {
    validateId(id, 'memory');
    validateId(resourceId, 'resource');

    return this.request<UnlinkResourceResult>({
      method: 'DELETE',
      path: `/memories/${id}/resources/${resourceId}`,
    });
  }

  // ============================================================================
  // Memory Pinning & Protection
  // ============================================================================

  /**
   * Pin a memory to protect it from automatic archival
   *
   * @param id - Memory ID
   * @returns Updated memory with isPinned set to true
   *
   * @example
   * ```typescript
   * const memory = await client.memories.pin('mem_123');
   * console.log(`Pinned: ${memory.isPinned}`); // true
   * ```
   */
  async pin(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/pin`,
    });
  }

  /**
   * Unpin a memory to allow automatic archival
   *
   * @param id - Memory ID
   * @returns Updated memory with isPinned set to false
   *
   * @example
   * ```typescript
   * const memory = await client.memories.unpin('mem_123');
   * console.log(`Pinned: ${memory.isPinned}`); // false
   * ```
   */
  async unpin(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/unpin`,
    });
  }

  /**
   * Set protection level for a memory
   *
   * Protection levels:
   * - 'none': No protection, can be deleted normally
   * - 'soft': Protected from automatic cleanup, can be manually deleted
   * - 'hard': Fully protected, requires explicit unprotection before deletion
   *
   * @param id - Memory ID
   * @param level - Protection level to set
   * @returns Updated memory with new protection level
   *
   * @example
   * ```typescript
   * // Protect a memory from automatic cleanup
   * const memory = await client.memories.setProtectionLevel('mem_123', 'soft');
   *
   * // Fully protect a critical memory
   * const protected = await client.memories.setProtectionLevel('mem_456', 'hard');
   * ```
   */
  async setProtectionLevel(id: string, level: ProtectionLevel): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/protection`,
      body: { level },
    });
  }

  // ============================================================================
  // Soft Delete & Restore
  // ============================================================================

  /**
   * Soft delete a memory (mark as deleted without permanent removal)
   *
   * Soft-deleted memories can be restored with `restore()`.
   * Use `delete()` for permanent deletion.
   *
   * @param id - Memory ID
   * @returns Memory with isDeleted set to true
   *
   * @example
   * ```typescript
   * const memory = await client.memories.softDelete('mem_123');
   * console.log(`Deleted: ${memory.isDeleted}`); // true
   * ```
   */
  async softDelete(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/soft-delete`,
    });
  }

  /**
   * Restore a soft-deleted memory
   *
   * @param id - Memory ID
   * @returns Restored memory with isDeleted set to false
   *
   * @example
   * ```typescript
   * const memory = await client.memories.restore('mem_123');
   * console.log(`Deleted: ${memory.isDeleted}`); // false
   * ```
   */
  async restore(id: string): Promise<Memory> {
    validateId(id, 'memory');
    return this.request<Memory>({
      method: 'POST',
      path: `/memories/${id}/restore`,
    });
  }

  // ============================================================================
  // Topic Extraction
  // ============================================================================

  /**
   * Get topics extracted from a memory
   *
   * @param id - Memory ID
   * @param options - Topic retrieval options
   * @returns List of topics with relevance scores
   *
   * @example
   * ```typescript
   * // Get all topics
   * const result = await client.memories.getTopics('mem_123');
   *
   * // Get topics with minimum relevance and specific categories
   * const filtered = await client.memories.getTopics('mem_123', {
   *   minRelevance: 0.5,
   *   categories: ['technology', 'business']
   * });
   *
   * // Force refresh topics
   * const refreshed = await client.memories.getTopics('mem_123', { refresh: true });
   * ```
   */
  async getTopics(id: string, options?: GetTopicsOptions): Promise<Topic[]> {
    validateId(id, 'memory');
    const response = await this.request<TopicsResult>({
      method: 'GET',
      path: `/memories/${id}/topics`,
      params: buildParams(options || {}),
    });
    return response.topics;
  }

  /**
   * Search memories by topic
   *
   * @param topic - Topic name to search for
   * @param options - Search options
   * @returns Memories matching the topic
   *
   * @example
   * ```typescript
   * // Search for memories about "machine learning"
   * const memories = await client.memories.searchByTopic('machine learning');
   *
   * // With options
   * const filtered = await client.memories.searchByTopic('machine learning', {
   *   limit: 20,
   *   minRelevance: 0.7
   * });
   * ```
   */
  async searchByTopic(topic: string, options?: SearchByTopicOptions): Promise<Memory[]> {
    const response = await this.request<PaginatedResponse<Memory>>({
      method: 'GET',
      path: '/memories/search/by-topic',
      params: buildParams({
        topic,
        ...options,
      }),
    });
    return response.data;
  }

  // ============================================================================
  // Quality & Enrichment
  // ============================================================================

  /**
   * Enrich a memory with additional metadata
   *
   * Runs enrichment operations like topic extraction, summarization,
   * entity detection, and quality scoring.
   *
   * @param id - Memory ID
   * @param options - Enrichment options
   * @returns Enrichment results
   *
   * @example
   * ```typescript
   * // Run all enrichments
   * const result = await client.memories.enrich('mem_123');
   *
   * // Run specific enrichments
   * const specific = await client.memories.enrich('mem_123', {
   *   operations: ['topics', 'summary']
   * });
   * ```
   */
  async enrich(id: string, options?: EnrichMemoryOptions): Promise<EnrichMemoryResult> {
    validateId(id, 'memory');
    return this.request<EnrichMemoryResult>({
      method: 'POST',
      path: `/memories/${id}/enrich`,
      body: options || {},
    });
  }

  /**
   * Get quality score for a memory
   *
   * Quality score (0-1) indicates the overall quality of the memory
   * based on factors like content length, structure, and relevance.
   *
   * @param id - Memory ID
   * @returns Quality score (0-1)
   *
   * @example
   * ```typescript
   * const score = await client.memories.getQualityScore('mem_123');
   * console.log(`Quality: ${(score * 100).toFixed(1)}%`);
   * ```
   */
  async getQualityScore(id: string): Promise<number> {
    validateId(id, 'memory');
    const response = await this.request<QualityScoreResult>({
      method: 'GET',
      path: `/memories/${id}/quality`,
    });
    return response.score;
  }

  // ============================================================================
  // Image Support
  // ============================================================================

  /**
   * Create an image memory by uploading an image file
   *
   * Supports image formats: jpg, jpeg, png, gif, webp, bmp, tiff
   *
   * @param params - Image memory creation parameters
   * @returns Created memory
   *
   * @example
   * ```typescript
   * // Upload image from Buffer
   * const imageBuffer = fs.readFileSync('photo.jpg');
   * const memory = await client.memories.createImage({
   *   image: imageBuffer,
   *   content: 'Beach sunset photo',
   *   tags: ['vacation', 'sunset']
   * });
   *
   * // Upload image from Blob (browser)
   * const fileInput = document.querySelector('input[type="file"]');
   * const memory = await client.memories.createImage({
   *   image: fileInput.files[0],
   *   tags: ['upload']
   * });
   *
   * // Upload image from base64 string
   * const base64Image = 'data:image/jpeg;base64,/9j/4AAQ...';
   * const memory = await client.memories.createImage({
   *   image: base64Image,
   *   content: 'Profile photo'
   * });
   * ```
   */
  async createImage(params: CreateImageMemoryParams): Promise<Memory> {
    const formData = new FormData();
    const { blob, filename } = normalizeImageInput(params.image, 'image.jpg');

    validateFileSize(blob);
    formData.append('image', blob, filename);

    appendStringField(formData, 'content', params.content);
    formData.append('type', 'image');
    appendJsonField(formData, 'tags', params.tags);
    appendJsonField(formData, 'metadata', params.metadata);
    appendStringField(formData, 'spaceId', params.spaceId);
    appendStringField(formData, 'sessionId', params.sessionId);
    appendStringField(formData, 'originType', params.originType);
    appendStringField(formData, 'sourceType', params.sourceType);
    appendStringField(formData, 'sourceId', params.sourceId);
    appendJsonField(formData, 'sourceMetadata', params.sourceMetadata);
    appendJsonField(formData, 'resourceIds', params.resourceIds);
    appendBooleanField(formData, 'isPinned', params.isPinned);
    appendStringField(formData, 'protectionLevel', params.protectionLevel);

    return this.client.requestMultipart<Memory>({
      method: 'POST',
      path: '/memories',
      formData,
    });
  }

  /**
   * Get original image data for an image memory
   *
   * @param id - Memory ID
   * @returns Image data as ArrayBuffer
   *
   * @example
   * ```typescript
   * const imageData = await client.memories.getImage('mem_123');
   * // Use in Node.js
   * fs.writeFileSync('downloaded.jpg', Buffer.from(imageData));
   *
   * // Use in browser
   * const blob = new Blob([imageData]);
   * const url = URL.createObjectURL(blob);
   * ```
   */
  async getImage(id: string): Promise<ArrayBuffer> {
    validateId(id, 'memory');
    const stream = await this.client.requestStream({
      method: 'GET',
      path: `/memories/${id}/image`,
    });
    return streamToArrayBuffer(stream);
  }

  /**
   * Get thumbnail image for an image memory
   *
   * @param id - Memory ID
   * @returns Thumbnail image data as ArrayBuffer
   *
   * @example
   * ```typescript
   * const thumbnail = await client.memories.getThumbnail('mem_123');
   * // Use for displaying previews
   * ```
   */
  async getThumbnail(id: string): Promise<ArrayBuffer> {
    validateId(id, 'memory');
    const stream = await this.client.requestStream({
      method: 'GET',
      path: `/memories/${id}/thumbnail`,
    });
    return streamToArrayBuffer(stream);
  }

  /**
   * Search for visually similar images by uploading an image
   *
   * @param params - Visual search parameters
   * @returns Visually similar memories with similarity scores
   *
   * @example
   * ```typescript
   * const results = await client.memories.searchVisual({
   *   image: imageBuffer,
   *   limit: 10,
   *   threshold: 0.7
   * });
   *
   * results.results.forEach(({ memory, similarity }) => {
   *   console.log(`Found: ${memory.id} (${(similarity * 100).toFixed(1)}% similar)`);
   * });
   * ```
   */
  async searchVisual(params: VisualSearchParams): Promise<VisualSearchResult> {
    const formData = new FormData();
    const { blob, filename } = normalizeImageInput(params.image, 'search.jpg');
    formData.append('image', blob, filename);

    // Add optional parameters
    if (params.limit !== undefined) {
      formData.append('limit', String(params.limit));
    }
    if (params.threshold !== undefined) {
      formData.append('threshold', String(params.threshold));
    }
    if (params.spaceId) {
      formData.append('spaceId', params.spaceId);
    }
    if (params.tags) {
      formData.append('tags', JSON.stringify(params.tags));
    }

    return this.client.requestMultipart<VisualSearchResult>({
      method: 'POST',
      path: '/memories/search/visual',
      formData,
    });
  }

  /**
   * Search for images using text query (multi-modal text-to-image search)
   *
   * @param params - Text-to-image search parameters
   * @returns Matching image memories with similarity scores
   *
   * @example
   * ```typescript
   * // Find images matching a text description
   * const results = await client.memories.searchByText({
   *   query: 'sunset on the beach',
   *   limit: 10
   * });
   *
   * // Search with filters
   * const filtered = await client.memories.searchByText({
   *   query: 'team meeting',
   *   spaceId: 'space_123',
   *   tags: ['work'],
   *   threshold: 0.5
   * });
   * ```
   */
  async searchByText(params: TextToImageSearchParams): Promise<VisualSearchResult> {
    return this.request<VisualSearchResult>({
      method: 'POST',
      path: '/memories/search/text',
      body: params,
    });
  }

  /**
   * Find visually similar images to an existing image memory
   *
   * @param id - Memory ID of the image to find similar images for
   * @param params - Search parameters
   * @returns Similar image memories with similarity scores
   *
   * @example
   * ```typescript
   * // Find images similar to an existing one
   * const similar = await client.memories.findSimilar('mem_123', {
   *   type: 'image',
   *   limit: 20,
   *   threshold: 0.6
   * });
   *
   * // Find by both image and content similarity
   * const combined = await client.memories.findSimilar('mem_123', {
   *   type: 'both',
   *   limit: 10
   * });
   * ```
   */
  async findSimilar(id: string, params?: FindSimilarImagesParams): Promise<SimilarImagesResult> {
    validateId(id, 'memory');
    return this.request<SimilarImagesResult>({
      method: 'GET',
      path: `/memories/${id}/similar`,
      params: buildParams(params || {}),
    });
  }

  /**
   * Check for duplicate images by uploading an image
   *
   * @param params - Duplicate check parameters with image file
   * @returns Duplicate check result with potential duplicates
   *
   * @example
   * ```typescript
   * // Check if image already exists before uploading
   * const result = await client.memories.checkDuplicates({
   *   image: imageBuffer,
   *   threshold: 0.95
   * });
   *
   * if (result.hasDuplicates) {
   *   console.log('Found duplicates:', result.duplicates.map(d => d.memory.id));
   * } else {
   *   // Safe to upload
   *   await client.memories.createImage({ image: imageBuffer });
   * }
   * ```
   */
  async checkDuplicates(params: CheckDuplicatesParams): Promise<DuplicateCheckResult> {
    const formData = new FormData();
    const { blob, filename } = normalizeImageInput(params.image, 'check.jpg');
    formData.append('image', blob, filename);

    // Add optional parameters
    if (params.threshold !== undefined) {
      formData.append('threshold', String(params.threshold));
    }
    if (params.spaceId) {
      formData.append('spaceId', params.spaceId);
    }

    return this.client.requestMultipart<DuplicateCheckResult>({
      method: 'POST',
      path: '/memories/check-duplicates',
      formData,
    });
  }

  /**
   * Check for duplicates of an existing image memory
   *
   * @param id - Memory ID of the image to check duplicates for
   * @param threshold - Similarity threshold for considering duplicates (0-1, default: 0.95)
   * @returns Duplicate check result with potential duplicates
   *
   * @example
   * ```typescript
   * // Check if an existing image has duplicates
   * const result = await client.memories.checkDuplicatesById('mem_123', 0.9);
   *
   * if (result.hasDuplicates) {
   *   console.log(`Found ${result.duplicates.length} duplicates`);
   * }
   * ```
   */
  async checkDuplicatesById(id: string, threshold?: number): Promise<DuplicateCheckResult> {
    validateId(id, 'memory');
    return this.request<DuplicateCheckResult>({
      method: 'POST',
      path: `/memories/${id}/check-duplicates`,
      body: threshold !== undefined ? { threshold } : {},
    });
  }

  /**
   * Cluster images by visual similarity
   *
   * Creates clusters of visually similar images for organization
   * and discovery purposes.
   *
   * @param params - Clustering parameters
   * @returns Clustering job result
   *
   * @example
   * ```typescript
   * // Cluster all images in a space
   * const result = await client.memories.clusterImages({
   *   spaceId: 'space_123',
   *   numClusters: 10
   * });
   *
   * // Track clustering progress
   * const job = await client.jobs.get(result.jobId);
   * console.log(`Status: ${job.status}, Progress: ${job.progress}%`);
   * ```
   */
  async clusterImages(params?: ClusterImagesParams): Promise<ClusterImagesResult> {
    return this.request<ClusterImagesResult>({
      method: 'POST',
      path: '/memories/images/cluster',
      body: params || {},
    });
  }

  /**
   * Auto-generate tags for an image using AI
   *
   * @param imageId - Memory ID of the image to auto-tag
   * @param params - Auto-tag parameters
   * @returns Auto-tag result with generated tags
   *
   * @example
   * ```typescript
   * // Generate tags without saving
   * const result = await client.memories.autoTag('mem_123');
   * console.log('Suggested tags:', result.tags.map(t => t.tag));
   *
   * // Generate and save tags
   * const saved = await client.memories.autoTag('mem_123', {
   *   save: true,
   *   minConfidence: 0.8,
   *   maxTags: 5
   * });
   * ```
   */
  async autoTag(imageId: string, params?: AutoTagParams): Promise<AutoTagResult> {
    validateId(imageId, 'memory');
    return this.request<AutoTagResult>({
      method: 'POST',
      path: `/memories/images/${imageId}/auto-tag`,
      body: params || {},
    });
  }

  /**
   * Auto-generate tags for multiple images using AI
   *
   * @param params - Batch auto-tag parameters
   * @returns Batch auto-tag results
   *
   * @example
   * ```typescript
   * // Auto-tag multiple images
   * const result = await client.memories.batchAutoTag({
   *   imageIds: ['mem_1', 'mem_2', 'mem_3'],
   *   save: true,
   *   minConfidence: 0.7
   * });
   *
   * console.log(`Tagged ${result.success} images`);
   * if (result.failed > 0) {
   *   console.log('Errors:', result.errors);
   * }
   * ```
   */
  async batchAutoTag(params: BatchAutoTagParams): Promise<BatchAutoTagResult> {
    validateBulkArray(params.imageIds, 'batchAutoTag');
    validateIds(params.imageIds, 'memory');
    return this.request<BatchAutoTagResult>({
      method: 'POST',
      path: '/memories/images/batch-auto-tag',
      body: params,
    });
  }

  /**
   * Get suggested queries based on image collection
   *
   * Returns query suggestions based on the visual content in your
   * image collection for discovery purposes.
   *
   * @param params - Query suggestion parameters
   * @returns Suggested queries for image search
   *
   * @example
   * ```typescript
   * // Get query suggestions
   * const suggestions = await client.memories.suggestQueries({
   *   limit: 10,
   *   type: 'visual'
   * });
   *
   * suggestions.suggestions.forEach(s => {
   *   console.log(`Try searching: "${s.query}" (~${s.estimatedResults} results)`);
   * });
   * ```
   */
  async suggestQueries(params?: SuggestQueriesParams): Promise<QuerySuggestionsResult> {
    return this.request<QuerySuggestionsResult>({
      method: 'GET',
      path: '/memories/images/suggest-queries',
      params: buildParams(params || {}),
    });
  }
}
