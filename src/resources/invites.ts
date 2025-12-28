/**
 * Invites Resource
 *
 * Manage user invitations to accounts:
 * - Create invitation (admin+ only)
 * - List pending invitations
 * - Revoke invitation
 * - Accept invitation
 */

import { BaseResource, buildParams } from './base.js';

/**
 * Valid invitation roles
 */
export type InviteRole = 'owner' | 'admin' | 'member';

/**
 * Invitation status filter
 */
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'all';

/**
 * Invitation object returned from API
 */
export interface Invite {
  id: string;
  email: string;
  role: InviteRole;
  token?: string; // Only returned on creation
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  invited_by: string;
  invited_by_email?: string;
  invited_by_name?: string;
}

/**
 * Parameters for creating an invitation
 */
export interface CreateInviteParams {
  /** Email address to invite */
  email: string;
  /** Role to assign to the invited user */
  role: InviteRole;
  /** Days until invitation expires (default: 7, max: 90) */
  expires_in_days?: number;
}

/**
 * Parameters for listing invitations
 */
export interface ListInvitesParams {
  /** Filter by status (default: pending) */
  status?: InviteStatus;
  /** Maximum number of results (default: 50, max: 100) */
  limit?: number;
  /** Number of results to skip for pagination */
  offset?: number;
}

/**
 * Parameters for accepting an invitation
 */
export interface AcceptInviteParams {
  /** Display name for new user */
  name?: string;
  /** Password for new user (required if not authenticated) */
  password?: string;
}

/**
 * Response from creating an invitation
 */
export interface CreateInviteResponse {
  message: string;
  invite: Invite;
}

/**
 * Response from listing invitations
 */
export interface ListInvitesResponse {
  invites: Invite[];
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

/**
 * Response from revoking an invitation
 */
export interface RevokeInviteResponse {
  message: string;
  id: string;
}

/**
 * Response from accepting an invitation
 */
export interface AcceptInviteResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  account: {
    id: string;
    name: string;
    role: InviteRole;
  };
  token?: string; // JWT token for new users
}

/**
 * Invites resource for managing user invitations
 *
 * @example
 * ```typescript
 * const client = new Trix({ apiKey: 'your-api-key' });
 *
 * // Create an invitation
 * const { invite } = await client.invites.create({
 *   email: 'newuser@example.com',
 *   role: 'member',
 * });
 *
 * // List pending invitations
 * const { invites } = await client.invites.list();
 *
 * // Revoke an invitation
 * await client.invites.revoke(invite.id);
 *
 * // Accept an invitation (for new users)
 * const result = await client.invites.accept(invite.token, {
 *   name: 'New User',
 *   password: 'securePassword123',
 * });
 * ```
 */
export class Invites extends BaseResource {
  /**
   * Create a new invitation
   *
   * Requires admin or owner role. Admins can invite members and admins,
   * only owners can invite new owners.
   *
   * @param params - Invitation parameters
   * @returns Created invitation with token
   *
   * @example
   * ```typescript
   * const { invite } = await client.invites.create({
   *   email: 'newuser@example.com',
   *   role: 'member',
   *   expires_in_days: 14,
   * });
   * console.log(`Invitation token: ${invite.token}`);
   * ```
   */
  async create(params: CreateInviteParams): Promise<CreateInviteResponse> {
    if (!params.email) {
      throw new Error('Email is required');
    }
    if (!params.role) {
      throw new Error('Role is required');
    }
    if (!['owner', 'admin', 'member'].includes(params.role)) {
      throw new Error('Role must be one of: owner, admin, member');
    }

    return this.request<CreateInviteResponse>({
      method: 'POST',
      path: '/accounts/invites',
      body: buildParams(params),
    });
  }

  /**
   * List invitations for the current account
   *
   * Requires admin or owner role.
   *
   * @param params - Optional filter and pagination parameters
   * @returns List of invitations
   *
   * @example
   * ```typescript
   * // List all pending invitations
   * const { invites } = await client.invites.list();
   *
   * // List accepted invitations
   * const { invites: accepted } = await client.invites.list({
   *   status: 'accepted',
   * });
   *
   * // Paginate through invitations
   * const page2 = await client.invites.list({
   *   limit: 10,
   *   offset: 10,
   * });
   * ```
   */
  async list(params?: ListInvitesParams): Promise<ListInvitesResponse> {
    return this.request<ListInvitesResponse>({
      method: 'GET',
      path: '/accounts/invites',
      params: params ? buildParams(params) : undefined,
    });
  }

  /**
   * Revoke a pending invitation
   *
   * Requires admin or owner role. Cannot revoke already accepted invitations.
   *
   * @param id - Invitation ID to revoke
   * @returns Confirmation of revocation
   *
   * @example
   * ```typescript
   * await client.invites.revoke('invite-uuid');
   * ```
   */
  async revoke(id: string): Promise<RevokeInviteResponse> {
    if (!id) {
      throw new Error('Invitation ID is required');
    }

    return this.request<RevokeInviteResponse>({
      method: 'DELETE',
      path: `/accounts/invites/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Accept an invitation
   *
   * Can be called without authentication for new users (requires password),
   * or with authentication for existing users joining a new account.
   *
   * @param token - Invitation token from email
   * @param params - User information for new users
   * @returns User and account information
   *
   * @example
   * ```typescript
   * // For new users
   * const result = await client.invites.accept('token-from-email', {
   *   name: 'New User',
   *   password: 'securePassword123',
   * });
   * console.log(`Welcome ${result.user.name} to ${result.account.name}!`);
   *
   * // For existing authenticated users
   * const result = await client.invites.accept('token-from-email');
   * console.log(`Joined ${result.account.name} as ${result.account.role}`);
   * ```
   */
  async accept(
    token: string,
    params?: AcceptInviteParams
  ): Promise<AcceptInviteResponse> {
    if (!token) {
      throw new Error('Invitation token is required');
    }

    return this.request<AcceptInviteResponse>({
      method: 'POST',
      path: `/accounts/invites/${encodeURIComponent(token)}/accept`,
      body: params ? buildParams(params) : undefined,
    });
  }

  /**
   * Resend an invitation email
   *
   * Creates a new token and sends a fresh invitation email.
   * The old token becomes invalid.
   *
   * @param id - Invitation ID to resend
   * @returns New invitation with fresh token
   *
   * @example
   * ```typescript
   * const { invite } = await client.invites.resend('invite-uuid');
   * console.log(`New token: ${invite.token}`);
   * ```
   */
  async resend(id: string): Promise<CreateInviteResponse> {
    if (!id) {
      throw new Error('Invitation ID is required');
    }

    // Get the existing invitation
    const { invites } = await this.list({ status: 'all' });
    const existing = invites.find((inv) => inv.id === id);

    if (!existing) {
      throw new Error('Invitation not found');
    }

    if (existing.accepted_at) {
      throw new Error('Cannot resend accepted invitation');
    }

    // Revoke old invitation
    await this.revoke(id);

    // Create new invitation
    return this.create({
      email: existing.email,
      role: existing.role,
    });
  }
}
