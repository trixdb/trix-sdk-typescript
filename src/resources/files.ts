/**
 * Files resource for chat file management (ADR-068 Phase 4).
 *
 * @example
 * ```typescript
 * // Upload a file
 * const file = await client.files.upload({
 *   file: myBlob,
 *   filename: 'photo.jpg',
 *   conversationId: 'conv-uuid',
 * });
 *
 * // Get download URL
 * const download = await client.files.getDownloadUrl(file.id);
 * console.log(download.url);
 *
 * // List files in conversation
 * const list = await client.files.list('conv-uuid', { type: 'image' });
 * ```
 *
 * @module resources/files
 */

import type {
  ChatFile,
  FileDownloadInfo,
  FileQuota,
  FileListResult,
  UploadFileParams,
  UploadFileBase64Params,
  ListFilesParams,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Files extends BaseResource {
  /**
   * Upload a file via multipart form data.
   */
  async upload(params: UploadFileParams): Promise<ChatFile> {
    const formData = new FormData();
    const blob = params.file instanceof Blob
      ? params.file
      : new Blob([params.file]);
    formData.append('file', blob, params.filename);
    if (params.contentType) formData.append('content_type', params.contentType);
    if (params.conversationId) formData.append('conversation_id', params.conversationId);
    if (params.messageId) formData.append('message_id', params.messageId);

    return this.client.requestMultipart<ChatFile>({
      method: 'POST',
      path: '/files/upload',
      formData,
    });
  }

  /**
   * Upload a file via base64-encoded JSON body.
   * Useful when you don't have a Blob/Buffer (e.g., MCP tools, scripts).
   */
  async uploadBase64(params: UploadFileBase64Params): Promise<ChatFile> {
    return this.request<ChatFile>({
      method: 'POST',
      path: '/files/upload-base64',
      body: {
        filename: params.filename,
        content_base64: params.contentBase64,
        content_type: params.contentType,
        conversation_id: params.conversationId,
        message_id: params.messageId,
      },
    });
  }

  /**
   * Get file metadata by ID.
   */
  async get(fileId: string): Promise<ChatFile> {
    validateId(fileId, 'file');
    return this.request<ChatFile>({
      method: 'GET',
      path: `/files/${fileId}`,
    });
  }

  /**
   * Get a signed download URL for a file (1hr TTL).
   */
  async getDownloadUrl(fileId: string): Promise<FileDownloadInfo> {
    validateId(fileId, 'file');
    return this.request<FileDownloadInfo>({
      method: 'GET',
      path: `/files/${fileId}/url`,
    });
  }

  /**
   * Soft-delete a file. Releases storage quota.
   */
  async delete(fileId: string): Promise<{ success: boolean; id: string }> {
    validateId(fileId, 'file');
    return this.request<{ success: boolean; id: string }>({
      method: 'DELETE',
      path: `/files/${fileId}`,
    });
  }

  /**
   * List files in a conversation with optional type filter and pagination.
   */
  async list(conversationId: string, params?: ListFilesParams): Promise<FileListResult> {
    validateId(conversationId, 'conversation');
    return this.request<FileListResult>({
      method: 'GET',
      path: `/files/conversation/${conversationId}`,
      params: buildParams(params || {}),
    });
  }

  /**
   * Get current storage quota usage for the account.
   */
  async getQuota(): Promise<FileQuota> {
    return this.request<FileQuota>({
      method: 'GET',
      path: '/files/quota',
    });
  }
}
