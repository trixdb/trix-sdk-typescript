/**
 * Crew type definitions for the Trix SDK.
 */

export type CrewStatus = 'active' | 'paused' | 'archived';

export interface CrewMember {
  bot_id: string;
  role?: string;
  added_at: string;
}

export interface Crew {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  description?: string;
  status: CrewStatus;
  members: CrewMember[];
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateCrewParams {
  name: string;
  slug?: string;
  description?: string;
  status?: CrewStatus;
  members?: { bot_id: string; role?: string }[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateCrewParams {
  name?: string;
  slug?: string;
  description?: string | null;
  status?: CrewStatus;
  members?: { bot_id: string; role?: string }[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ListCrewsParams {
  status?: CrewStatus;
  limit?: number;
  offset?: number;
}
