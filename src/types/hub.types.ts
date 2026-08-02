/**
 * Hub and conversation member types
 */

export type HubRole = 'owner' | 'admin' | 'member' | 'guest';
export type ConversationRole = 'owner' | 'admin' | 'member';

export interface HubMember {
  id: string;
  hubId: string;
  userId: string;
  role: HubRole;
  permissions: Record<string, boolean>;
  name?: string;
  email?: string;
  avatar?: string;
  status?: string;
  joinedAt: string;
  updatedAt: string;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  role: ConversationRole;
  permissions?: Record<string, boolean>;
  isAgent: boolean;
  autonomy?: string;
  triggerMode?: string;
  name?: string;
  email?: string;
  avatar?: string;
  status?: string;
  joinedAt: string;
  updatedAt: string;
}

export interface AddHubMemberParams {
  userId: string;
  role?: HubRole;
  permissions?: Record<string, boolean>;
}

export interface UpdateHubMemberParams {
  role?: HubRole;
  permissions?: Record<string, boolean>;
}

export interface AddConversationMemberParams {
  userId: string;
  role?: ConversationRole;
  permissions?: Record<string, boolean>;
  isAgent?: boolean;
  autonomy?: string;
  triggerMode?: string;
}

export interface UpdateConversationMemberParams {
  role?: ConversationRole;
  permissions?: Record<string, boolean>;
  autonomy?: string;
  triggerMode?: string;
}

export interface HubCustomRole {
  id: string;
  hubId: string;
  name: string;
  color: string | null;
  icon: string | null;
  position: number;
  permissions: Record<string, string>;
  isDefault: boolean;
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
  conversationId: string;
  roleId: string;
  permissions: Record<string, string>;
}
