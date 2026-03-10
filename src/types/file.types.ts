/**
 * File type definitions (ADR-068 Phase 4).
 *
 * Types for file upload, download, and management operations.
 */

/** Chat file record */
export interface ChatFile {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  status: string;
  messageType?: string;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  hasThumbnail?: boolean;
  checksumSha256?: string;
  metadata?: Record<string, unknown>;
  downloadUrl?: string;
  thumbnailUrl?: string | null;
  createdAt: string;
}

/** File download info with signed URL */
export interface FileDownloadInfo {
  url: string;
  thumbnailUrl?: string | null;
  expiresIn: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

/** Storage quota for an account */
export interface FileQuota {
  totalBytes: number;
  fileCount: number;
  maxBytes: number;
  maxFileSize: number;
  usagePercent: number;
}

/** File list response with pagination */
export interface FileListResult {
  files: ChatFile[];
  hasMore: boolean;
  cursor: string | null;
}

/** Parameters for uploading a file via multipart */
export interface UploadFileParams {
  file: Blob | Buffer;
  filename: string;
  contentType?: string;
  conversationId?: string;
  messageId?: string;
}

/** Parameters for uploading a file via base64 */
export interface UploadFileBase64Params {
  filename: string;
  contentBase64: string;
  contentType: string;
  conversationId?: string;
  messageId?: string;
}

/** Parameters for listing files */
export interface ListFilesParams {
  type?: 'image' | 'file' | 'voice' | 'video';
  limit?: number;
  cursor?: string;
}
