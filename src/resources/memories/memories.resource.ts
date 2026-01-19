/**
 * Memories resource - Main class composing all memory operations.
 *
 * This class provides the full memories API by combining:
 * - CRUD operations (create, read, update, delete)
 * - Bulk operations (bulkCreate, bulkUpdate, bulkDelete)
 * - Audio/video operations (streamAudio, transcribe)
 * - Image operations (createImage, searchVisual, etc.)
 * - Protection operations (pin, unpin, softDelete, restore)
 * - Topic/enrichment operations (getTopics, enrich, getQualityScore)
 */

import type { Trix } from '../../client.js';
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
  EnrichMemoryOptions,
  EnrichMemoryResult,
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
} from '../../types.js';
import { BaseResource } from '../base.js';
import { MemoriesCrud } from './memories.crud.js';
import { MemoriesBulk } from './memories.bulk.js';
import { MemoriesAudio } from './memories.audio.js';
import { MemoriesProtection } from './memories.protection.js';
import { MemoriesTopics } from './memories.topics.js';
import { MemoriesImage } from './memories.image.js';

/**
 * Memories resource for managing memory objects.
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
  private readonly crud: MemoriesCrud;
  private readonly bulk: MemoriesBulk;
  private readonly audio: MemoriesAudio;
  private readonly protection: MemoriesProtection;
  private readonly topics: MemoriesTopics;
  private readonly image: MemoriesImage;

  constructor(client: Trix) {
    super(client);
    this.crud = new MemoriesCrud(client);
    this.bulk = new MemoriesBulk(client);
    this.audio = new MemoriesAudio(client);
    this.protection = new MemoriesProtection(client);
    this.topics = new MemoriesTopics(client);
    this.image = new MemoriesImage(client);
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  async create(params: CreateMemoryParams): Promise<Memory> {
    if (params.audioFile) {
      return this.audio.createWithAudio(params);
    }
    return this.crud.create(params);
  }

  async list(params?: ListMemoriesParams): Promise<PaginatedResponse<Memory>> {
    return this.crud.list(params);
  }

  listAll(params?: ListMemoriesParams): AsyncGenerator<Memory, void, unknown> {
    return this.crud.listAll(params);
  }

  async get(id: string): Promise<Memory> {
    return this.crud.get(id);
  }

  async update(id: string, params: UpdateMemoryParams): Promise<Memory> {
    return this.crud.update(id, params);
  }

  async delete(id: string): Promise<void> {
    return this.crud.delete(id);
  }

  async getConfig(): Promise<MemoryConfig> {
    return this.crud.getConfig();
  }

  async getStats(params?: MemoryStatsParams): Promise<MemoryStats> {
    return this.crud.getStats(params);
  }

  async linkResource(id: string, params: LinkResourceParams): Promise<LinkResourceResult> {
    return this.crud.linkResource(id, params);
  }

  async getResources(id: string): Promise<MemoryResourcesResult> {
    return this.crud.getResources(id);
  }

  async unlinkResource(id: string, resourceId: string): Promise<UnlinkResourceResult> {
    return this.crud.unlinkResource(id, resourceId);
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async bulkCreate(memories: CreateMemoryParams[]): Promise<BulkResult> {
    return this.bulk.bulkCreate(memories);
  }

  async bulkUpdate(updates: UpdateMemoryParams[]): Promise<BulkResult> {
    return this.bulk.bulkUpdate(updates);
  }

  async bulkDelete(ids: string[]): Promise<BulkResult> {
    return this.bulk.bulkDelete(ids);
  }

  // ============================================================================
  // Audio/Video Operations
  // ============================================================================

  async streamAudio(id: string): Promise<ReadableStream> {
    return this.audio.streamAudio(id);
  }

  async getTranscript(id: string): Promise<Transcript> {
    return this.audio.getTranscript(id);
  }

  async transcribe(id: string, params?: TranscribeParams): Promise<Job> {
    return this.audio.transcribe(id, params);
  }

  // ============================================================================
  // Protection Operations
  // ============================================================================

  async pin(id: string): Promise<Memory> {
    return this.protection.pin(id);
  }

  async unpin(id: string): Promise<Memory> {
    return this.protection.unpin(id);
  }

  async setProtectionLevel(id: string, level: ProtectionLevel): Promise<Memory> {
    return this.protection.setProtectionLevel(id, level);
  }

  async softDelete(id: string): Promise<Memory> {
    return this.protection.softDelete(id);
  }

  async restore(id: string): Promise<Memory> {
    return this.protection.restore(id);
  }

  // ============================================================================
  // Topic & Enrichment Operations
  // ============================================================================

  async getTopics(id: string, options?: GetTopicsOptions): Promise<Topic[]> {
    return this.topics.getTopics(id, options);
  }

  async searchByTopic(topic: string, options?: SearchByTopicOptions): Promise<Memory[]> {
    return this.topics.searchByTopic(topic, options);
  }

  async enrich(id: string, options?: EnrichMemoryOptions): Promise<EnrichMemoryResult> {
    return this.topics.enrich(id, options);
  }

  async getQualityScore(id: string): Promise<number> {
    return this.topics.getQualityScore(id);
  }

  // ============================================================================
  // Image Operations
  // ============================================================================

  async createImage(params: CreateImageMemoryParams): Promise<Memory> {
    return this.image.createImage(params);
  }

  async getImage(id: string): Promise<ArrayBuffer> {
    return this.image.getImage(id);
  }

  async getThumbnail(id: string): Promise<ArrayBuffer> {
    return this.image.getThumbnail(id);
  }

  async searchVisual(params: VisualSearchParams): Promise<VisualSearchResult> {
    return this.image.searchVisual(params);
  }

  async searchByText(params: TextToImageSearchParams): Promise<VisualSearchResult> {
    return this.image.searchByText(params);
  }

  async findSimilar(id: string, params?: FindSimilarImagesParams): Promise<SimilarImagesResult> {
    return this.image.findSimilar(id, params);
  }

  async checkDuplicates(params: CheckDuplicatesParams): Promise<DuplicateCheckResult> {
    return this.image.checkDuplicates(params);
  }

  async checkDuplicatesById(id: string, threshold?: number): Promise<DuplicateCheckResult> {
    return this.image.checkDuplicatesById(id, threshold);
  }

  async clusterImages(params?: ClusterImagesParams): Promise<ClusterImagesResult> {
    return this.image.clusterImages(params);
  }

  async autoTag(imageId: string, params?: AutoTagParams): Promise<AutoTagResult> {
    return this.image.autoTag(imageId, params);
  }

  async batchAutoTag(params: BatchAutoTagParams): Promise<BatchAutoTagResult> {
    return this.image.batchAutoTag(params);
  }

  async suggestQueries(params?: SuggestQueriesParams): Promise<QuerySuggestionsResult> {
    return this.image.suggestQueries(params);
  }
}
