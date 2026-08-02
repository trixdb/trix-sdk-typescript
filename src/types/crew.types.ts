/**
 * Crew type definitions for the Trix SDK.
 */

export type CrewStatus = 'active' | 'paused' | 'archived';

export interface CrewMember {
  botId: string;
  role?: string;
  addedAt: string;
}

export interface Crew {
  id: string;
  accountId: string;
  name: string;
  slug: string;
  description?: string;
  status: CrewStatus;
  members: CrewMember[];
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCrewParams {
  name: string;
  slug?: string;
  description?: string;
  status?: CrewStatus;
  members?: { botId: string; role?: string }[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateCrewParams {
  name?: string;
  slug?: string;
  description?: string | null;
  status?: CrewStatus;
  members?: { botId: string; role?: string }[];
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ListCrewsParams {
  status?: CrewStatus;
  limit?: number;
  offset?: number;
}
