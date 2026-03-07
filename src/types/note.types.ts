/**
 * Note type definitions for the Trix SDK (ADR-065).
 *
 * Notes support block-based content, collaborators, project integration,
 * and multiple note types (document, canvas, daily, template).
 */

import type { PaginationParams } from './common.types.js';

// ============================================================================
// Enums and Constants
// ============================================================================

export type NoteType = 'document' | 'canvas' | 'daily' | 'template';
export type NoteVisibility = 'private' | 'space' | 'account';
export type NoteBlockType =
  | 'paragraph' | 'heading' | 'bullet_list' | 'numbered_list'
  | 'todo' | 'code' | 'quote' | 'callout' | 'divider'
  | 'image' | 'file' | 'embed' | 'table' | 'toggle'
  | 'math' | 'note_link' | 'memory_ref';
export type NotePermission = 'read' | 'read_write' | 'admin';
export type NoteActorType = 'user' | 'persona' | 'bot' | 'agent' | 'api_key';

// ============================================================================
// Core Types
// ============================================================================

export interface NoteBlock {
  id: string;
  noteId: string;
  blockType: NoteBlockType;
  content: Record<string, unknown> | null;
  sortOrder: string;
  parentBlockId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCollaborator {
  id: string;
  noteId: string;
  actorType: NoteActorType;
  actorId: string;
  permission: NotePermission;
  createdAt: string;
}

export interface Note {
  id: string;
  accountId: string;
  spaceId: string | null;
  createdBy: string;
  title: string | null;
  icon: string | null;
  coverImageUrl: string | null;
  noteType: NoteType;
  parentNoteId: string | null;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  properties: Record<string, unknown>;
  visibility: NoteVisibility;
  version: number;
  blocks?: NoteBlock[];
  collaborators?: NoteCollaborator[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Request Parameters
// ============================================================================

export interface CreateNoteParams {
  title?: string;
  noteType?: NoteType;
  visibility?: NoteVisibility;
  spaceId?: string;
  parentNoteId?: string;
  icon?: string;
  tags?: string[];
  blocks?: Array<{
    blockType: NoteBlockType;
    content?: Record<string, unknown>;
    sortOrder?: string;
  }>;
}

export interface UpdateNoteParams {
  version: number;
  title?: string;
  icon?: string;
  visibility?: NoteVisibility;
  isPinned?: boolean;
  isArchived?: boolean;
  tags?: string[];
}

export interface ListNotesParams extends PaginationParams {
  spaceId?: string;
  noteType?: NoteType;
  visibility?: NoteVisibility;
  parentNoteId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  tags?: string;
  q?: string;
}

export interface AddNoteBlockParams {
  blockType: NoteBlockType;
  content?: Record<string, unknown>;
  sortOrder?: string;
  afterBlockId?: string;
  parentBlockId?: string;
}

export interface UpdateNoteBlockParams {
  content?: Record<string, unknown>;
  blockType?: NoteBlockType;
  sortOrder?: string;
}

export interface AddNoteCollaboratorParams {
  actorType: NoteActorType;
  actorId: string;
  permission?: NotePermission;
}

// ============================================================================
// Response Types
// ============================================================================

export interface NoteListResult {
  notes: Note[];
  total: number;
  limit: number;
  offset: number;
}
