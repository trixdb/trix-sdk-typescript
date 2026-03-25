/**
 * Tests for Files resource - File upload, metadata, and management
 */

import { Files } from '../src/resources/files';

const mockClient = {
  request: jest.fn(),
  requestMultipart: jest.fn(),
};

const FILE = {
  id: 'file_123',
  filename: 'photo.jpg',
  contentType: 'image/jpeg',
  size: 102400,
  conversationId: 'conv_456',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Files', () => {
  let files: Files;

  beforeEach(() => {
    jest.clearAllMocks();
    files = new Files(mockClient as any);
  });

  describe('upload', () => {
    it('should upload a file via multipart form data', async () => {
      mockClient.requestMultipart.mockResolvedValue(FILE);

      const blob = new Blob(['file content'], { type: 'image/jpeg' });
      const result = await files.upload({
        file: blob,
        filename: 'photo.jpg',
        conversationId: 'conv_456',
      });

      expect(mockClient.requestMultipart).toHaveBeenCalledWith({
        method: 'POST',
        path: '/files/upload',
        formData: expect.any(FormData),
      });
      expect(result.id).toBe('file_123');
      expect(result.filename).toBe('photo.jpg');
    });

    it('should upload with content type and message ID', async () => {
      mockClient.requestMultipart.mockResolvedValue(FILE);

      const blob = new Blob(['data'], { type: 'image/png' });
      await files.upload({
        file: blob,
        filename: 'screenshot.png',
        contentType: 'image/png',
        conversationId: 'conv_456',
        messageId: 'msg_789',
      });

      expect(mockClient.requestMultipart).toHaveBeenCalledWith({
        method: 'POST',
        path: '/files/upload',
        formData: expect.any(FormData),
      });
    });
  });

  describe('get', () => {
    it('should get file metadata by ID', async () => {
      mockClient.request.mockResolvedValue(FILE);

      const result = await files.get('file_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/files/file_123',
        query: undefined,
      });
      expect(result.id).toBe('file_123');
      expect(result.filename).toBe('photo.jpg');
      expect(result.size).toBe(102400);
    });

    it('should throw for empty ID', async () => {
      await expect(files.get('')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list files in a conversation', async () => {
      mockClient.request.mockResolvedValue({
        data: [FILE],
        pagination: { total: 1, page: 1, limit: 10, hasMore: false },
      });

      const result = await files.list('conv_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/files/conversation/conv_456',
        query: {},
      });
      expect(result.data).toHaveLength(1);
    });

    it('should list with type filter', async () => {
      mockClient.request.mockResolvedValue({
        data: [FILE],
        pagination: { total: 1, page: 1, limit: 10, hasMore: false },
      });

      await files.list('conv_456', { type: 'image' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/files/conversation/conv_456',
        query: { type: 'image' },
      });
    });

    it('should throw for empty conversation ID', async () => {
      await expect(files.list('')).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a file', async () => {
      mockClient.request.mockResolvedValue({ success: true, id: 'file_123' });

      const result = await files.delete('file_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/files/file_123',
        query: undefined,
      });
      expect(result.success).toBe(true);
      expect(result.id).toBe('file_123');
    });

    it('should throw for empty ID', async () => {
      await expect(files.delete('')).rejects.toThrow();
    });
  });

  describe('getDownloadUrl', () => {
    it('should get a signed download URL', async () => {
      mockClient.request.mockResolvedValue({
        url: 'https://cdn.example.com/file_123?token=abc',
        expiresAt: '2024-01-01T01:00:00Z',
      });

      const result = await files.getDownloadUrl('file_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/files/file_123/url',
        query: undefined,
      });
      expect(result.url).toContain('cdn.example.com');
    });

    it('should throw for empty ID', async () => {
      await expect(files.getDownloadUrl('')).rejects.toThrow();
    });
  });

  describe('getQuota', () => {
    it('should get storage quota', async () => {
      mockClient.request.mockResolvedValue({
        used: 5242880,
        limit: 104857600,
        remaining: 99614720,
      });

      const result = await files.getQuota();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/files/quota',
        query: undefined,
      });
      expect(result.used).toBe(5242880);
      expect(result.limit).toBe(104857600);
    });
  });
});
