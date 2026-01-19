/**
 * Helper utilities for memories resource.
 *
 * Provides image conversion and form data building utilities.
 */

/**
 * Convert base64 image string to Blob.
 *
 * @param base64Image - Base64 encoded image (with or without data URI prefix)
 * @param mimeType - MIME type (default: image/jpeg)
 * @returns Blob containing the image data
 */
export function base64ToBlob(base64Image: string, mimeType = 'image/jpeg'): Blob {
  const base64Data = base64Image.includes(',')
    ? base64Image.split(',')[1]
    : base64Image;
  const binaryString = atob(base64Data);
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
 * Convert ReadableStream to ArrayBuffer.
 *
 * @param stream - ReadableStream to convert
 * @returns ArrayBuffer containing all stream data
 */
export async function streamToArrayBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  let readResult = await reader.read();
  while (!readResult.done) {
    chunks.push(readResult.value);
    readResult = await reader.read();
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result.buffer;
}
