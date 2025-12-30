/**
 * Invites Resource Tests
 */

import { Invites } from '../src/resources/invites.js';

// Mock client
function createMockClient() {
  return {
    request: jest.fn(),
  };
}

describe('Invites', () => {
  let invites: Invites;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    // @ts-expect-error - Mock client doesn't have all properties
    invites = new Invites(mockClient);
  });

  describe('create', () => {
    it('should create an invitation', async () => {
      const expectedResponse = {
        message: 'Invitation created successfully',
        invite: {
          id: 'invite-123',
          email: 'test@example.com',
          role: 'member',
          token: 'secure-token-123',
          expires_at: '2025-01-05T00:00:00Z',
          created_at: '2024-12-28T00:00:00Z',
          invited_by: 'user-123',
        },
      };

      mockClient.request.mockResolvedValue(expectedResponse);

      const result = await invites.create({
        email: 'test@example.com',
        role: 'member',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/accounts/invites',
        body: {
          email: 'test@example.com',
          role: 'member',
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should create an invitation with custom expiration', async () => {
      mockClient.request.mockResolvedValue({ invite: {} });

      await invites.create({
        email: 'test@example.com',
        role: 'admin',
        expires_in_days: 14,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/accounts/invites',
        body: {
          email: 'test@example.com',
          role: 'admin',
          expires_in_days: 14,
        },
      });
    });

    it('should throw error if email is missing', async () => {
      await expect(
        // @ts-expect-error - Testing invalid input
        invites.create({ role: 'member' })
      ).rejects.toThrow('Email is required');
    });

    it('should throw error if role is missing', async () => {
      await expect(
        // @ts-expect-error - Testing invalid input
        invites.create({ email: 'test@example.com' })
      ).rejects.toThrow('Role is required');
    });

    it('should throw error for invalid role', async () => {
      await expect(
        invites.create({
          email: 'test@example.com',
          // @ts-expect-error - Testing invalid input
          role: 'superuser',
        })
      ).rejects.toThrow('Role must be one of: owner, admin, member');
    });
  });

  describe('list', () => {
    it('should list invitations', async () => {
      const expectedResponse = {
        invites: [
          { id: 'invite-1', email: 'user1@example.com', role: 'member' },
          { id: 'invite-2', email: 'user2@example.com', role: 'admin' },
        ],
        pagination: {
          limit: 50,
          offset: 0,
          has_more: false,
        },
      };

      mockClient.request.mockResolvedValue(expectedResponse);

      const result = await invites.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/accounts/invites',
        params: undefined,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should list with filters', async () => {
      mockClient.request.mockResolvedValue({ invites: [] });

      await invites.list({
        status: 'accepted',
        limit: 10,
        offset: 20,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/accounts/invites',
        query: {
          status: 'accepted',
          limit: 10,
          offset: 20,
        },
      });
    });
  });

  describe('revoke', () => {
    it('should revoke an invitation', async () => {
      const expectedResponse = {
        message: 'Invitation revoked successfully',
        id: 'invite-123',
      };

      mockClient.request.mockResolvedValue(expectedResponse);

      const result = await invites.revoke('invite-123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/accounts/invites/invite-123',
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error if ID is missing', async () => {
      await expect(
        // @ts-expect-error - Testing invalid input
        invites.revoke()
      ).rejects.toThrow('Invitation ID is required');
    });

    it('should throw error for empty ID', async () => {
      await expect(invites.revoke('')).rejects.toThrow('Invitation ID is required');
    });
  });

  describe('accept', () => {
    it('should accept invitation for new user', async () => {
      const expectedResponse = {
        message: 'Invitation accepted successfully',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'New User',
        },
        account: {
          id: 'account-123',
          name: 'Test Account',
          role: 'member',
        },
        token: 'jwt-token-here',
      };

      mockClient.request.mockResolvedValue(expectedResponse);

      const result = await invites.accept('token-123', {
        name: 'New User',
        password: 'securePassword123',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/accounts/invites/token-123/accept',
        body: {
          name: 'New User',
          password: 'securePassword123',
        },
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should accept invitation for existing user (no params)', async () => {
      mockClient.request.mockResolvedValue({ user: {}, account: {} });

      await invites.accept('token-123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/accounts/invites/token-123/accept',
        body: undefined,
      });
    });

    it('should throw error if token is missing', async () => {
      await expect(
        // @ts-expect-error - Testing invalid input
        invites.accept()
      ).rejects.toThrow('Invitation token is required');
    });

    it('should throw error for empty token', async () => {
      await expect(invites.accept('')).rejects.toThrow('Invitation token is required');
    });

    it('should encode special characters in token', async () => {
      mockClient.request.mockResolvedValue({ user: {}, account: {} });

      await invites.accept('token/with/slashes');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/accounts/invites/token%2Fwith%2Fslashes/accept',
        body: undefined,
      });
    });
  });

  describe('resend', () => {
    it('should resend an invitation', async () => {
      // Mock list to return the invitation
      const listResponse = {
        invites: [
          {
            id: 'invite-123',
            email: 'test@example.com',
            role: 'member' as const,
            accepted_at: null,
          },
        ],
        pagination: { limit: 50, offset: 0, has_more: false },
      };

      const createResponse = {
        message: 'Invitation created successfully',
        invite: {
          id: 'new-invite-456',
          email: 'test@example.com',
          role: 'member' as const,
          token: 'new-token',
          expires_at: '2025-01-05T00:00:00Z',
          created_at: '2024-12-28T00:00:00Z',
          invited_by: 'user-123',
          accepted_at: null,
        },
      };

      mockClient.request
        .mockResolvedValueOnce(listResponse) // list call
        .mockResolvedValueOnce({ message: 'Revoked' }) // revoke call
        .mockResolvedValueOnce(createResponse); // create call

      const result = await invites.resend('invite-123');

      expect(result.invite.token).toBe('new-token');
    });

    it('should throw error if invitation not found', async () => {
      mockClient.request.mockResolvedValue({
        invites: [],
        pagination: { limit: 50, offset: 0, has_more: false },
      });

      await expect(invites.resend('nonexistent')).rejects.toThrow('Invitation not found');
    });

    it('should throw error for already accepted invitation', async () => {
      mockClient.request.mockResolvedValue({
        invites: [
          {
            id: 'invite-123',
            email: 'test@example.com',
            role: 'member',
            accepted_at: '2024-12-27T00:00:00Z',
          },
        ],
        pagination: { limit: 50, offset: 0, has_more: false },
      });

      await expect(invites.resend('invite-123')).rejects.toThrow(
        'Cannot resend accepted invitation'
      );
    });

    it('should throw error if ID is missing', async () => {
      await expect(invites.resend('')).rejects.toThrow('Invitation ID is required');
    });
  });
});
