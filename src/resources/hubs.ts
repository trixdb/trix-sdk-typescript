/**
 * Hubs resource
 */

import type { Trix } from '../client.js';
import type {
  HubMember,
  AddHubMemberParams,
  UpdateHubMemberParams,
  ConversationMember,
  AddConversationMemberParams,
  UpdateConversationMemberParams,
  HubCustomRole,
  CreateRoleInput,
  UpdateRoleInput,
  ConvRoleOverride,
} from '../types.js';
import { BaseResource } from './base.js';
import { validateId } from '../utils/security.js';

export class Hubs extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  async listMembers(hubId: string): Promise<HubMember[]> {
    validateId(hubId, 'hub');
    const result = await this.request<{ data: HubMember[] }>({
      method: 'GET',
      path: `/hubs/${hubId}/members`,
    });
    return result.data;
  }

  async addMember(hubId: string, params: AddHubMemberParams): Promise<HubMember> {
    validateId(hubId, 'hub');
    return this.request<HubMember>({
      method: 'POST',
      path: `/hubs/${hubId}/members`,
      body: params,
    });
  }

  async updateMember(
    hubId: string,
    userId: string,
    params: UpdateHubMemberParams,
  ): Promise<HubMember> {
    validateId(hubId, 'hub');
    validateId(userId, 'user');
    return this.request<HubMember>({
      method: 'PATCH',
      path: `/hubs/${hubId}/members/${userId}`,
      body: params,
    });
  }

  async removeMember(hubId: string, userId: string): Promise<void> {
    validateId(hubId, 'hub');
    validateId(userId, 'user');
    return this.request<void>({
      method: 'DELETE',
      path: `/hubs/${hubId}/members/${userId}`,
    });
  }

  async listConversationMembers(conversationId: string): Promise<ConversationMember[]> {
    validateId(conversationId, 'conversation');
    const result = await this.request<{ data: ConversationMember[] }>({
      method: 'GET',
      path: `/conversations/${conversationId}/members`,
    });
    return result.data;
  }

  async addConversationMember(
    conversationId: string,
    params: AddConversationMemberParams,
  ): Promise<ConversationMember> {
    validateId(conversationId, 'conversation');
    return this.request<ConversationMember>({
      method: 'POST',
      path: `/conversations/${conversationId}/members`,
      body: params,
    });
  }

  async updateConversationMember(
    conversationId: string,
    userId: string,
    params: UpdateConversationMemberParams,
  ): Promise<ConversationMember> {
    validateId(conversationId, 'conversation');
    validateId(userId, 'user');
    return this.request<ConversationMember>({
      method: 'PATCH',
      path: `/conversations/${conversationId}/members/${userId}`,
      body: params,
    });
  }

  async removeConversationMember(conversationId: string, userId: string): Promise<void> {
    validateId(conversationId, 'conversation');
    validateId(userId, 'user');
    return this.request<void>({
      method: 'DELETE',
      path: `/conversations/${conversationId}/members/${userId}`,
    });
  }

  // ==================== Hub Role Management ====================

  async listRoles(hubId: string): Promise<HubCustomRole[]> {
    validateId(hubId, 'hub');
    const result = await this.request<{ data: HubCustomRole[] }>({
      method: 'GET',
      path: `/hubs/${hubId}/roles`,
    });
    return result.data;
  }

  async createRole(hubId: string, data: CreateRoleInput): Promise<HubCustomRole> {
    validateId(hubId, 'hub');
    return this.request<HubCustomRole>({
      method: 'POST',
      path: `/hubs/${hubId}/roles`,
      body: data,
    });
  }

  async updateRole(hubId: string, roleId: string, data: UpdateRoleInput): Promise<HubCustomRole> {
    validateId(hubId, 'hub');
    validateId(roleId, 'role');
    return this.request<HubCustomRole>({
      method: 'PATCH',
      path: `/hubs/${hubId}/roles/${roleId}`,
      body: data,
    });
  }

  async deleteRole(hubId: string, roleId: string): Promise<void> {
    validateId(hubId, 'hub');
    validateId(roleId, 'role');
    return this.request<void>({
      method: 'DELETE',
      path: `/hubs/${hubId}/roles/${roleId}`,
    });
  }

  async reorderRoles(hubId: string, roleIds: string[]): Promise<void> {
    validateId(hubId, 'hub');
    return this.request<void>({
      method: 'PUT',
      path: `/hubs/${hubId}/roles/reorder`,
      body: { role_ids: roleIds },
    });
  }

  async assignRole(hubId: string, roleId: string, userId: string): Promise<void> {
    validateId(hubId, 'hub');
    validateId(roleId, 'role');
    return this.request<void>({
      method: 'POST',
      path: `/hubs/${hubId}/roles/${roleId}/assign`,
      body: { user_id: userId },
    });
  }

  async removeRole(hubId: string, roleId: string, userId: string): Promise<void> {
    validateId(hubId, 'hub');
    validateId(roleId, 'role');
    return this.request<void>({
      method: 'DELETE',
      path: `/hubs/${hubId}/roles/${roleId}/members/${userId}`,
    });
  }

  // ==================== Conversation Role Overrides ====================

  async listRoleOverrides(conversationId: string): Promise<ConvRoleOverride[]> {
    validateId(conversationId, 'conversation');
    const result = await this.request<{ data: ConvRoleOverride[] }>({
      method: 'GET',
      path: `/conversations/${conversationId}/role-overrides`,
    });
    return result.data;
  }

  async upsertRoleOverride(
    conversationId: string,
    roleId: string,
    permissions: Record<string, string>,
  ): Promise<ConvRoleOverride> {
    validateId(conversationId, 'conversation');
    validateId(roleId, 'role');
    return this.request<ConvRoleOverride>({
      method: 'PUT',
      path: `/conversations/${conversationId}/role-overrides/${roleId}`,
      body: { permissions },
    });
  }

  async deleteRoleOverride(conversationId: string, roleId: string): Promise<void> {
    validateId(conversationId, 'conversation');
    validateId(roleId, 'role');
    return this.request<void>({
      method: 'DELETE',
      path: `/conversations/${conversationId}/role-overrides/${roleId}`,
    });
  }
}
