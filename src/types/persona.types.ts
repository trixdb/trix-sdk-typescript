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
  space_id: string;
  role: PersonaSpaceRole;
  can_create_memories: boolean;
  can_delete_memories: boolean;
  granted_at: string;
}

/**
 * Persona object.
 */
export interface Persona extends BaseEntityWithMetadata {
  name: string;
  slug: string;
  avatar_url?: string;
  purpose?: string;
  system_prompt?: string;
  goals: PersonaGoal[];
  settings: Record<string, unknown>;
  is_default: boolean;
  can_create_spaces: boolean;
  spaces?: PersonaSpace[];
  space_count?: number;
}

/**
 * Parameters for creating a persona.
 */
export interface CreatePersonaParams {
  name: string;
  slug?: string;
  avatar_url?: string;
  purpose?: string;
  system_prompt?: string;
  goals?: PersonaGoal[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  is_default?: boolean;
  can_create_spaces?: boolean;
}

/**
 * Parameters for updating a persona.
 */
export interface UpdatePersonaParams {
  name?: string;
  slug?: string;
  avatar_url?: string | null;
  purpose?: string | null;
  system_prompt?: string | null;
  goals?: PersonaGoal[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  is_default?: boolean;
  can_create_spaces?: boolean;
}

/**
 * Parameters for adding a space to a persona.
 */
export interface AddPersonaSpaceParams {
  space_id: string;
  role?: PersonaSpaceRole;
  can_create_memories?: boolean;
  can_delete_memories?: boolean;
}
