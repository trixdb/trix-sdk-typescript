/**
 * Helper utilities for memories resource.
 *
 * Provides image conversion and form data building utilities.
 */

import { FileSizeError, ValidationError } from '../../errors.js';

/**
 * Maximum file size for uploads (100MB).
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Allowed MIME types for images.
 */
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
]);

/**
 * Validate that a string is valid base64 encoding.
 *
 * @param str - String to validate
 * @returns true if valid base64
 */
function isValidBase64(str: string): boolean {
  // Base64 must only contain valid characters and have valid padding
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(str)) {
    return false;
  }
  // Length must be multiple of 4 (after padding)
  return str.length % 4 === 0;
}

/**
 * Extract MIME type from data URI prefix.
 *
 * @param dataUri - Data URI string (e.g., "data:image/png;base64,...")
 * @returns MIME type or null if not found
 */
function extractMimeType(dataUri: string): string | null {
  const match = dataUri.match(/^data:([^;,]+)/);
  return match ? match[1] : null;
}

/**
 * Validate MIME type for images.
 *
 * @param mimeType - MIME type to validate
 * @throws ValidationError if MIME type is not allowed
 */
function validateImageMimeType(mimeType: string): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new ValidationError(
      `Invalid image MIME type: ${mimeType}. Allowed types: ${Array.from(ALLOWED_IMAGE_MIME_TYPES).join(', ')}`
    );
  }
}

/**
 * Validate that a file does not exceed the maximum allowed size.
 *
 * @param file - File, Blob, or Buffer to validate
 * @param maxSize - Maximum allowed size in bytes (default: MAX_FILE_SIZE)
 * @throws FileSizeError if file exceeds the maximum size
 */
export function validateFileSize(
  file: Blob | Buffer,
  maxSize = MAX_FILE_SIZE
): void {
  const size = file instanceof Blob ? file.size : file.length;
  if (size > maxSize) {
    throw new FileSizeError(size, maxSize);
  }
}

/**
 * Convert base64 image string to Blob.
 *
 * @param base64Image - Base64 encoded image (with or without data URI prefix)
 * @param defaultMimeType - Default MIME type if not specified in data URI (default: image/jpeg)
 * @returns Blob containing the image data
 * @throws ValidationError if base64 encoding is invalid or MIME type is not allowed
 */
export function base64ToBlob(base64Image: string, defaultMimeType = 'image/jpeg'): Blob {
  let base64Data: string;
  let mimeType: string;

  // Check if it's a data URI and extract MIME type
  if (base64Image.includes(',')) {
    const extractedMime = extractMimeType(base64Image);
    mimeType = extractedMime ?? defaultMimeType;
    base64Data = base64Image.split(',')[1];
  } else {
    mimeType = defaultMimeType;
    base64Data = base64Image;
  }

  // Validate MIME type
  validateImageMimeType(mimeType);

  // Validate base64 encoding
  if (!isValidBase64(base64Data)) {
    throw new ValidationError(
      'Invalid base64 encoding: string contains invalid characters or has incorrect padding'
    );
  }

  // Attempt to decode base64
  let binaryString: string;
  try {
    binaryString = atob(base64Data);
  } catch {
    throw new ValidationError(
      'Failed to decode base64 image: the provided string is not valid base64 encoded data'
    );
  }

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Convert various image input types to a Blob for FormData.
 *
 * @param image - Image input (string, Blob, or Buffer)
 * @param filename - Default filename to use
 * @returns Object with blob and filename
 */
export function normalizeImageInput(
  image: string | Blob | Buffer,
  filename = 'image.jpg'
): { blob: Blob; filename: string } {
  if (typeof image === 'string') {
    return { blob: base64ToBlob(image), filename };
  }
  if (image instanceof Blob) {
    return { blob: image, filename };
  }
  // Buffer (Node.js)
  return { blob: new Blob([image]), filename };
}

/**
 * Add optional string field to FormData.
 */
export function appendStringField(
  formData: FormData,
  key: string,
  value: string | undefined
): void {
  if (value !== undefined) {
    formData.append(key, value);
  }
}

/**
 * Add optional JSON field to FormData.
 */
export function appendJsonField(
  formData: FormData,
  key: string,
  value: unknown
): void {
  if (value !== undefined) {
    formData.append(key, JSON.stringify(value));
  }
}

/**
 * Add optional boolean field to FormData.
 */
export function appendBooleanField(
  formData: FormData,
  key: string,
  value: boolean | undefined
): void {
  if (value !== undefined) {
    formData.append(key, String(value));
  }
}

/**
 * Add optional number field to FormData.
 */
export function appendNumberField(
  formData: FormData,
  key: string,
  value: number | undefined
): void {
  if (value !== undefined) {
    formData.append(key, String(value));
  }
}

/**
 * Maximum stream size to prevent resource exhaustion (500MB).
 */
export const MAX_STREAM_SIZE = 500 * 1024 * 1024;

/**
 * Convert ReadableStream to ArrayBuffer.
 *
 * @param stream - ReadableStream to convert
 * @returns ArrayBuffer containing all stream data
 * @throws Error if stream exceeds MAX_STREAM_SIZE
 */
export async function streamToArrayBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  try {
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    let readResult = await reader.read();
    while (!readResult.done) {
      totalLength += readResult.value.length;
      if (totalLength > MAX_STREAM_SIZE) {
        reader.releaseLock();
        throw new Error(`Stream exceeds maximum size of ${MAX_STREAM_SIZE} bytes`);
      }
      chunks.push(readResult.value);
      readResult = await reader.read();
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result.buffer;
  } finally {
    reader.releaseLock();
  }
}
