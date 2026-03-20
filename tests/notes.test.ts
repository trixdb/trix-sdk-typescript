/**
 * Tests for Notes resource - Note and canvas management
 */

import { Notes } from '../src/resources/notes';
import { buildParams } from '../src/resources/base';

const mockClient = {
  request: jest.fn(),
};

const NOTE = {
  id: 'note_123',
  accountId: 'acc_1',
  createdBy: 'user_1',
  title: 'Meeting Notes',
  noteType: 'document',
  visibility: 'private',
  version: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const BLOCK = {
  id: 'block_456',
  noteId: 'note_123',
  blockType: 'paragraph',
  content: { text: 'Discussion points...' },
  sortOrder: 'a0',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Notes', () => {
  let notes: Notes;

  beforeEach(() => {
    jest.clearAllMocks();
    notes = new Notes(mockClient as any);
  });

  describe('create', () => {
    it('should create a note', async () => {
      mockClient.request.mockResolvedValue(NOTE);

      const result = await notes.create({
        title: 'Meeting Notes',
        noteType: 'document',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/notes',
        body: { title: 'Meeting Notes', noteType: 'document' },
      });
      expect(result.id).toBe('note_123');
      expect(result.title).toBe('Meeting Notes');
    });
  });

  describe('list', () => {
    it('should list notes', async () => {
      mockClient.request.mockResolvedValue({
        notes: [NOTE],
        total: 1,
      });

      const result = await notes.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/notes',
        query: {},
      });
      expect(result.notes).toHaveLength(1);
    });

    it('should filter by type', async () => {
      mockClient.request.mockResolvedValue({ notes: [], total: 0 });

      await notes.list({ noteType: 'document' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/notes',
        query: { noteType: 'document' },
      });
    });
  });

  describe('get', () => {
    it('should get a note by ID', async () => {
      mockClient.request.mockResolvedValue(NOTE);

      const result = await notes.get('note_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/notes/note_123',
      });
      expect(result.id).toBe('note_123');
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      mockClient.request.mockResolvedValue({
        ...NOTE,
        title: 'Updated Notes',
        version: 2,
      });

      const result = await notes.update('note_123', {
        version: 1,
        title: 'Updated Notes',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/notes/note_123',
        body: { version: 1, title: 'Updated Notes' },
      });
      expect(result.title).toBe('Updated Notes');
    });
  });

  describe('delete', () => {
    it('should delete a note', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await notes.delete('note_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/notes/note_123',
      });
    });
  });

  describe('addBlock', () => {
    it('should add a block to a note', async () => {
      mockClient.request.mockResolvedValue(BLOCK);

      const result = await notes.addBlock('note_123', {
        blockType: 'paragraph',
        content: { text: 'Discussion points...' },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/notes/note_123/blocks',
        body: {
          blockType: 'paragraph',
          content: { text: 'Discussion points...' },
        },
      });
      expect(result.blockType).toBe('paragraph');
    });
  });

  describe('updateBlock', () => {
    it('should update a block', async () => {
      mockClient.request.mockResolvedValue({
        ...BLOCK,
        content: { text: 'Updated content' },
      });

      const result = await notes.updateBlock('note_123', 'block_456', {
        content: { text: 'Updated content' },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/notes/note_123/blocks/block_456',
        body: { content: { text: 'Updated content' } },
      });
    });
  });

  describe('deleteBlock', () => {
    it('should delete a block', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await notes.deleteBlock('note_123', 'block_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/notes/note_123/blocks/block_456',
      });
    });
  });

  describe('createLink', () => {
    it('should create a link between notes', async () => {
      mockClient.request.mockResolvedValue({
        id: 'link_789',
        sourceNoteId: 'note_123',
        targetNoteId: 'note_456',
        linkType: 'reference',
      });

      const result = await notes.createLink('note_123', {
        targetNoteId: 'note_456',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/notes/note_123/links',
        body: { targetNoteId: 'note_456' },
      });
    });
  });

  describe('getDailyNote', () => {
    it('should get a daily note', async () => {
      mockClient.request.mockResolvedValue(NOTE);

      const result = await notes.getDailyNote('2024-01-15');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/notes/daily/2024-01-15',
      });
      expect(result.id).toBe('note_123');
    });
  });

  describe('summarize', () => {
    it('should AI-summarize a note', async () => {
      mockClient.request.mockResolvedValue({
        noteId: 'note_123',
        summary: 'Key discussion points...',
      });

      const result = await notes.summarize('note_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/notes/note_123/ai/summarize',
      });
    });
  });
});
