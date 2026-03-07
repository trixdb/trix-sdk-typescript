/**
 * Notes resource for note and canvas management (ADR-065).
 *
 * @example
 * ```typescript
 * // Create a note
 * const note = await client.notes.create({
 *   title: 'Meeting Notes',
 *   noteType: 'document',
 * });
 *
 * // Add a block
 * await client.notes.addBlock(note.id, {
 *   blockType: 'paragraph',
 *   content: { text: 'Discussion points...' },
 * });
 *
 * // List notes
 * const notes = await client.notes.list({ noteType: 'document' });
 * ```
 *
 * @module resources/notes
 */

import type {
  Note,
  NoteBlock,
  NoteCollaborator,
  NoteListResult,
  CreateNoteParams,
  UpdateNoteParams,
  ListNotesParams,
  AddNoteBlockParams,
  UpdateNoteBlockParams,
  AddNoteCollaboratorParams,
  NoteLink,
  CreateNoteLinkParams,
  NoteMemoryLink,
  LinkNoteMemoryParams,
  NoteMemoryListResult,
  PaginationParams,
} from '../types.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

export class Notes extends BaseResource {
  async create(params: CreateNoteParams): Promise<Note> {
    return this.request<Note>({
      method: 'POST',
      path: '/notes',
      body: params,
    });
  }

  async list(params?: ListNotesParams): Promise<NoteListResult> {
    return this.request<NoteListResult>({
      method: 'GET',
      path: '/notes',
      params: buildParams(params || {}),
    });
  }

  async get(noteId: string): Promise<Note> {
    validateId(noteId, 'note');
    return this.request<Note>({
      method: 'GET',
      path: `/notes/${noteId}`,
    });
  }

  async update(noteId: string, params: UpdateNoteParams): Promise<Note> {
    validateId(noteId, 'note');
    return this.request<Note>({
      method: 'PATCH',
      path: `/notes/${noteId}`,
      body: params,
    });
  }

  async delete(noteId: string): Promise<void> {
    validateId(noteId, 'note');
    return this.request<void>({
      method: 'DELETE',
      path: `/notes/${noteId}`,
    });
  }

  async addBlock(noteId: string, params: AddNoteBlockParams): Promise<NoteBlock> {
    validateId(noteId, 'note');
    return this.request<NoteBlock>({
      method: 'POST',
      path: `/notes/${noteId}/blocks`,
      body: params,
    });
  }

  async updateBlock(
    noteId: string,
    blockId: string,
    params: UpdateNoteBlockParams
  ): Promise<NoteBlock> {
    validateId(noteId, 'note');
    validateId(blockId, 'block');
    return this.request<NoteBlock>({
      method: 'PATCH',
      path: `/notes/${noteId}/blocks/${blockId}`,
      body: params,
    });
  }

  async deleteBlock(noteId: string, blockId: string): Promise<void> {
    validateId(noteId, 'note');
    validateId(blockId, 'block');
    return this.request<void>({
      method: 'DELETE',
      path: `/notes/${noteId}/blocks/${blockId}`,
    });
  }

  async addCollaborator(
    noteId: string,
    params: AddNoteCollaboratorParams
  ): Promise<NoteCollaborator> {
    validateId(noteId, 'note');
    return this.request<NoteCollaborator>({
      method: 'POST',
      path: `/notes/${noteId}/collaborators`,
      body: params,
    });
  }

  async listCollaborators(noteId: string): Promise<NoteCollaborator[]> {
    validateId(noteId, 'note');
    return this.request<NoteCollaborator[]>({
      method: 'GET',
      path: `/notes/${noteId}/collaborators`,
    });
  }

  async removeCollaborator(
    noteId: string,
    collaboratorId: string
  ): Promise<void> {
    validateId(noteId, 'note');
    validateId(collaboratorId, 'collaborator');
    return this.request<void>({
      method: 'DELETE',
      path: `/notes/${noteId}/collaborators/${collaboratorId}`,
    });
  }

  // Links (Phase 3)

  async createLink(noteId: string, params: CreateNoteLinkParams): Promise<NoteLink> {
    validateId(noteId, 'note');
    return this.request<NoteLink>({
      method: 'POST',
      path: `/notes/${noteId}/links`,
      body: params,
    });
  }

  async getLinks(noteId: string): Promise<NoteLink[]> {
    validateId(noteId, 'note');
    return this.request<NoteLink[]>({
      method: 'GET',
      path: `/notes/${noteId}/links`,
    });
  }

  async getBacklinks(noteId: string): Promise<NoteLink[]> {
    validateId(noteId, 'note');
    return this.request<NoteLink[]>({
      method: 'GET',
      path: `/notes/${noteId}/backlinks`,
    });
  }

  async removeLink(noteId: string, linkId: string): Promise<void> {
    validateId(noteId, 'note');
    validateId(linkId, 'link');
    return this.request<void>({
      method: 'DELETE',
      path: `/notes/${noteId}/links/${linkId}`,
    });
  }

  // Memories (Phase 3)

  async linkMemory(noteId: string, params: LinkNoteMemoryParams): Promise<NoteMemoryLink> {
    validateId(noteId, 'note');
    return this.request<NoteMemoryLink>({
      method: 'POST',
      path: `/notes/${noteId}/memories`,
      body: params,
    });
  }

  async listMemories(
    noteId: string,
    params?: PaginationParams
  ): Promise<NoteMemoryListResult> {
    validateId(noteId, 'note');
    return this.request<NoteMemoryListResult>({
      method: 'GET',
      path: `/notes/${noteId}/memories`,
      params: params ? buildParams(params) : undefined,
    });
  }

  async unlinkMemory(noteId: string, memoryId: string): Promise<void> {
    validateId(noteId, 'note');
    return this.request<void>({
      method: 'DELETE',
      path: `/notes/${noteId}/memories/${memoryId}`,
    });
  }
}
