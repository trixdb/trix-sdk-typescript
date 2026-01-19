/**
 * Memory image operations.
 *
 * Provides image upload, search, and analysis operations.
 */

import type { Trix } from '../../client.js';
import type {
  Memory,
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
import { BaseResource, buildParams, validateBulkArray, validateIds } from '../base.js';
import { validateId } from '../../utils/security.js';
import {
  normalizeImageInput,
  appendStringField,
  appendJsonField,
  appendBooleanField,
  appendNumberField,
  streamToArrayBuffer,
} from './memories.helpers.js';

/**
 * Memory image operations mixin.
 */
export class MemoriesImage extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create an image memory by uploading an image file.
   *
   * Supports image formats: jpg, jpeg, png, gif, webp, bmp, tiff
   */
  async createImage(params: CreateImageMemoryParams): Promise<Memory> {
    const formData = new FormData();
    const { blob, filename } = normalizeImageInput(params.image, 'image.jpg');
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
   * Get original image data for an image memory.
   *
   * @param id - Memory ID
   * @returns Image data as ArrayBuffer
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
   * Get thumbnail image for an image memory.
   *
   * @param id - Memory ID
   * @returns Thumbnail image data as ArrayBuffer
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
   * Search for visually similar images by uploading an image.
   */
  async searchVisual(params: VisualSearchParams): Promise<VisualSearchResult> {
    const formData = new FormData();
    const { blob, filename } = normalizeImageInput(params.image, 'search.jpg');
    formData.append('image', blob, filename);

    appendNumberField(formData, 'limit', params.limit);
    appendNumberField(formData, 'threshold', params.threshold);
    appendStringField(formData, 'spaceId', params.spaceId);
    appendJsonField(formData, 'tags', params.tags);

    return this.client.requestMultipart<VisualSearchResult>({
      method: 'POST',
      path: '/memories/search/visual',
      formData,
    });
  }

  /**
   * Search for images using text query (multi-modal text-to-image search).
   */
  async searchByText(params: TextToImageSearchParams): Promise<VisualSearchResult> {
    return this.request<VisualSearchResult>({
      method: 'POST',
      path: '/memories/search/text',
      body: params,
    });
  }

  /**
   * Find visually similar images to an existing image memory.
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
   * Check for duplicate images by uploading an image.
   */
  async checkDuplicates(params: CheckDuplicatesParams): Promise<DuplicateCheckResult> {
    const formData = new FormData();
    const { blob, filename } = normalizeImageInput(params.image, 'check.jpg');
    formData.append('image', blob, filename);

    appendNumberField(formData, 'threshold', params.threshold);
    appendStringField(formData, 'spaceId', params.spaceId);

    return this.client.requestMultipart<DuplicateCheckResult>({
      method: 'POST',
      path: '/memories/check-duplicates',
      formData,
    });
  }

  /**
   * Check for duplicates of an existing image memory.
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
   * Cluster images by visual similarity.
   */
  async clusterImages(params?: ClusterImagesParams): Promise<ClusterImagesResult> {
    return this.request<ClusterImagesResult>({
      method: 'POST',
      path: '/memories/images/cluster',
      body: params || {},
    });
  }

  /**
   * Auto-generate tags for an image using AI.
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
   * Auto-generate tags for multiple images using AI.
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
   * Get suggested queries based on image collection.
   */
  async suggestQueries(params?: SuggestQueriesParams): Promise<QuerySuggestionsResult> {
    return this.request<QuerySuggestionsResult>({
      method: 'GET',
      path: '/memories/images/suggest-queries',
      params: buildParams(params || {}),
    });
  }
}
