/**
 * Tests for Feedback resource - User feedback on memories
 */

import { Feedback } from '../src/resources/feedback';

const mockClient = {
  request: jest.fn(),
};

describe('Feedback', () => {
  let feedback: Feedback;

  beforeEach(() => {
    jest.clearAllMocks();
    feedback = new Feedback(mockClient as any);
  });

  describe('submit', () => {
    it('should submit positive feedback', async () => {
      mockClient.request.mockResolvedValue({
        id: 'fb_123',
        memoryId: 'mem_123',
        type: 'positive',
        comment: 'Very helpful!',
      });

      const result = await feedback.submit({
        memoryId: 'mem_123',
        type: 'positive',
        comment: 'Very helpful!',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/feedback',
        body: {
          memoryId: 'mem_123',
          type: 'positive',
          comment: 'Very helpful!',
        },
      });
      expect(result.id).toBe('fb_123');
      expect(result.type).toBe('positive');
    });

    it('should submit feedback with metadata', async () => {
      mockClient.request.mockResolvedValue({
        id: 'fb_124',
        memoryId: 'mem_123',
        type: 'negative',
      });

      await feedback.submit({
        memoryId: 'mem_123',
        type: 'negative',
        metadata: { source: 'user_rating' },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/feedback',
        body: {
          memoryId: 'mem_123',
          type: 'negative',
          metadata: { source: 'user_rating' },
        },
      });
    });

    it('should throw for empty memory ID', async () => {
      await expect(
        feedback.submit({ memoryId: '', type: 'positive' })
      ).rejects.toThrow();
    });
  });

  describe('quick', () => {
    it('should submit thumbs up', async () => {
      mockClient.request.mockResolvedValue({
        id: 'fb_125',
        memoryId: 'mem_123',
        type: 'thumbs_up',
        recorded: true,
      });

      const result = await feedback.quick({
        memoryId: 'mem_123',
        type: 'thumbs_up',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/feedback/quick',
        body: {
          memoryId: 'mem_123',
          type: 'thumbs_up',
        },
      });
      expect(result.recorded).toBe(true);
    });

    it('should submit thumbs down', async () => {
      mockClient.request.mockResolvedValue({
        id: 'fb_126',
        memoryId: 'mem_456',
        type: 'thumbs_down',
        recorded: true,
      });

      const result = await feedback.quick({
        memoryId: 'mem_456',
        type: 'thumbs_down',
      });

      expect(result.type).toBe('thumbs_down');
    });

    it('should throw for empty memory ID', async () => {
      await expect(
        feedback.quick({ memoryId: '', type: 'thumbs_up' })
      ).rejects.toThrow();
    });
  });

  describe('batch', () => {
    it('should submit batch feedback', async () => {
      mockClient.request.mockResolvedValue({
        success: 3,
        failed: 0,
        total: 3,
      });

      const result = await feedback.batch({
        feedback: [
          { memoryId: 'mem_1', type: 'positive', comment: 'Great!' },
          { memoryId: 'mem_2', type: 'neutral' },
          { memoryId: 'mem_3', type: 'negative', comment: 'Not relevant' },
        ],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/feedback/batch',
        body: {
          feedback: [
            { memoryId: 'mem_1', type: 'positive', comment: 'Great!' },
            { memoryId: 'mem_2', type: 'neutral' },
            { memoryId: 'mem_3', type: 'negative', comment: 'Not relevant' },
          ],
        },
      });
      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
    });

    it('should handle partial failures in batch', async () => {
      mockClient.request.mockResolvedValue({
        success: 2,
        failed: 1,
        total: 3,
      });

      const result = await feedback.batch({
        feedback: [
          { memoryId: 'mem_1', type: 'positive' },
          { memoryId: 'mem_2', type: 'positive' },
          { memoryId: 'mem_3', type: 'positive' },
        ],
      });

      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
    });
  });
});
