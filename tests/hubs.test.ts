/**
 * Tests for Hubs resource - hub and conversation member management
 */

import { Hubs } from '../src/resources/hubs';

const mockClient = {
  request: jest.fn(),
};

const MEMBER = {
  userId: 'user_456',
  hubId: 'hub_123',
  role: 'member',
  joinedAt: '2024-01-01T00:00:00Z',
};

const ROLE = {
  id: 'role_789',
  hubId: 'hub_123',
  name: 'moderator',
  permissions: { can_delete: true, can_pin: true },
};

describe('Hubs', () => {
  let hubs: Hubs;

  beforeEach(() => {
    jest.clearAllMocks();
    hubs = new Hubs(mockClient as any);
  });

  describe('listMembers', () => {
    it('should list hub members', async () => {
      mockClient.request.mockResolvedValue({ data: [MEMBER] });

      const result = await hubs.listMembers('hub_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/hubs/hub_123/members',
      });
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('member');
    });

    it('should throw for invalid hub ID', async () => {
      await expect(hubs.listMembers('')).rejects.toThrow();
    });
  });

  describe('addMember', () => {
    it('should add a member to a hub', async () => {
      mockClient.request.mockResolvedValue(MEMBER);

      const result = await hubs.addMember('hub_123', {
        user_id: 'user_456',
        role: 'member',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/hubs/hub_123/members',
        body: { user_id: 'user_456', role: 'member' },
      });
      expect(result.userId).toBe('user_456');
    });
  });

  describe('updateMember', () => {
    it('should update a hub member', async () => {
      mockClient.request.mockResolvedValue({ ...MEMBER, role: 'admin' });

      const result = await hubs.updateMember('hub_123', 'user_456', {
        role: 'admin',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/hubs/hub_123/members/user_456',
        body: { role: 'admin' },
      });
      expect(result.role).toBe('admin');
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a hub', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await hubs.removeMember('hub_123', 'user_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/hubs/hub_123/members/user_456',
      });
    });
  });

  describe('listRoles', () => {
    it('should list hub roles', async () => {
      mockClient.request.mockResolvedValue({ data: [ROLE] });

      const result = await hubs.listRoles('hub_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/hubs/hub_123/roles',
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('moderator');
    });
  });

  describe('createRole', () => {
    it('should create a hub role', async () => {
      mockClient.request.mockResolvedValue(ROLE);

      const result = await hubs.createRole('hub_123', {
        name: 'moderator',
        permissions: { can_delete: true, can_pin: true },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/hubs/hub_123/roles',
        body: { name: 'moderator', permissions: { can_delete: true, can_pin: true } },
      });
      expect(result.name).toBe('moderator');
    });
  });

  describe('deleteRole', () => {
    it('should delete a hub role', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await hubs.deleteRole('hub_123', 'role_789');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/hubs/hub_123/roles/role_789',
      });
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a user', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await hubs.assignRole('hub_123', 'role_789', 'user_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/hubs/hub_123/roles/role_789/assign',
        body: { user_id: 'user_456' },
      });
    });
  });
});
