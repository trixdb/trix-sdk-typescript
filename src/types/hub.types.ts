/**
 * Hub and conversation member types
 */

export type HubRole = 'owner' | 'admin' | 'member' | 'guest';
export type ConversationRole = 'owner' | 'admin' | 'member';

export interface HubMember {
  id: string;
  hub_id: string;
  user_id: string;
  role: HubRole;
  permissions: Record<string, boolean>;
  name?: string;
  email?: string;
  avatar?: string;
  status?: string;
  joined_at: string;
  updated_at: string;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ConversationRole;
  permissions?: Record<string, boolean>;
  is_agent: boolean;
  autonomy?: string;
  trigger_mode?: string;
  name?: string;
  email?: string;
  avatar?: string;
  status?: string;
  joined_at: string;
  updated_at: string;
}

export interface AddHubMemberParams {
  user_id: string;
  role?: HubRole;
  permissions?: Record<string, boolean>;
}

export interface UpdateHubMemberParams {
  role?: HubRole;
  permissions?: Record<string, boolean>;
}

export interface AddConversationMemberParams {
  user_id: string;
  role?: ConversationRole;
  permissions?: Record<string, boolean>;
  is_agent?: boolean;
  autonomy?: string;
  trigger_mode?: string;
}

export interface UpdateConversationMemberParams {
  role?: ConversationRole;
  permissions?: Record<string, boolean>;
  autonomy?: string;
  trigger_mode?: string;
}

export interface HubCustomRole {
  id: string;
  hub_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  position: number;
  permissions: Record<string, string>;
  is_default: boolean;
}

export interface CreateRoleInput {
  name: string;
  color?: string;
  icon?: string;
  position?: number;
  permissions?: Record<string, string>;
}

export interface UpdateRoleInput {
  name?: string;
  color?: string;
  icon?: string;
  position?: number;
  permissions?: Record<string, string>;
}

export interface ConvRoleOverride {
  id: string;
  conversation_id: string;
  role_id: string;
  permissions: Record<string, string>;
}
