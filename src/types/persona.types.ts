/**
 * Persona type definitions for the Trix SDK.
 */

import type { BaseEntityWithMetadata } from './common.types.js';

/**
 * Persona space role.
 */
export type PersonaSpaceRole = 'viewer' | 'member' | 'admin';

/**
 * A persona goal.
 */
export interface PersonaGoal {
  text: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
}

/**
 * Persona space membership.
 */
export interface PersonaSpace {
  spaceId: string;
  role: PersonaSpaceRole;
  canCreateMemories: boolean;
  canDeleteMemories: boolean;
  grantedAt: string;
}

/**
 * Persona object.
 */
export interface Persona extends BaseEntityWithMetadata {
  name: string;
  slug: string;
  avatarUrl?: string;
  purpose?: string;
  systemPrompt?: string;
  goals: PersonaGoal[];
  settings: Record<string, unknown>;
  isDefault: boolean;
  canCreateSpaces: boolean;
  spaces?: PersonaSpace[];
  spaceCount?: number;
}

/**
 * Parameters for creating a persona.
 */
export interface CreatePersonaParams {
  name: string;
  slug?: string;
  avatarUrl?: string;
  purpose?: string;
  systemPrompt?: string;
  goals?: PersonaGoal[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isDefault?: boolean;
  canCreateSpaces?: boolean;
}

/**
 * Parameters for updating a persona.
 */
export interface UpdatePersonaParams {
  name?: string;
  slug?: string;
  avatarUrl?: string | null;
  purpose?: string | null;
  systemPrompt?: string | null;
  goals?: PersonaGoal[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isDefault?: boolean;
  canCreateSpaces?: boolean;
}

/**
 * Parameters for adding a space to a persona.
 */
export interface AddPersonaSpaceParams {
  spaceId: string;
  role?: PersonaSpaceRole;
  canCreateMemories?: boolean;
  canDeleteMemories?: boolean;
}
