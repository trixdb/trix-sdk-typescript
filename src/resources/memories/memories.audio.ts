/**
 * Memory audio/video operations.
 *
 * Provides audio and video upload, streaming, and transcription operations.
 */

import type { Trix } from '../../client.js';
import type {
  Memory,
  CreateMemoryParams,
  Transcript,
  TranscribeParams,
  Job,
} from '../../types.js';
import { BaseResource } from '../base.js';
import { validateId } from '../../utils/security.js';

/**
 * Memory audio operations mixin.
 */
export class MemoriesAudio extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /**
   * Create a memory with an audio/video file upload.
   *
   * Supports audio formats: mp3, mp4, m4a, wav, webm, ogg, flac, aac
   * Supports video formats: mp4, webm, mov, avi, mkv, flv, mpeg
   */
  async createWithAudio(params: CreateMemoryParams): Promise<Memory> {
    if (!params.audioFile) {
      throw new Error('audioFile is required for createWithAudio');
    }

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

  /**
   * Stream audio/video content for a memory.
   *
   * @param id - Memory ID
   * @returns Readable stream of audio/video data
   */
  async streamAudio(id: string): Promise<ReadableStream> {
    validateId(id, 'memory');
    return this.client.requestStream({
      method: 'GET',
      path: `/memories/${id}/audio`,
    });
  }

  /**
   * Get transcript for an audio or video memory.
   *
   * @param id - Memory ID
   * @returns Transcript object
   */
  async getTranscript(id: string): Promise<Transcript> {
    validateId(id, 'memory');
    return this.request<Transcript>({
      method: 'GET',
      path: `/memories/${id}/transcript`,
    });
  }

  /**
   * Request transcription for an audio or video memory with advanced options.
   *
   * @param id - Memory ID
   * @param params - Transcription parameters
   * @returns Job object for tracking transcription progress
   */
  async transcribe(id: string, params?: TranscribeParams): Promise<Job> {
    validateId(id, 'memory');
    return this.request<Job>({
      method: 'POST',
      path: `/memories/${id}/transcribe`,
      body: params,
    });
  }
}
