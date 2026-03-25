/**
 * Tests for Crews resource - bot group management
 */

import { Crews } from '../src/resources/crews';

const mockClient = {
  request: jest.fn(),
};

const CREW = {
  id: 'crew_123',
  name: 'Research Team',
  members: [
    { bot_id: 'bot_1', role: 'researcher' },
    { bot_id: 'bot_2', role: 'writer' },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Crews', () => {
  let crews: Crews;

  beforeEach(() => {
    jest.clearAllMocks();
    crews = new Crews(mockClient as any);
  });

  describe('list', () => {
    it('should list all crews', async () => {
      mockClient.request.mockResolvedValue({ crews: [CREW] });

      const result = await crews.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/crews',
        query: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Research Team');
    });
  });

  describe('get', () => {
    it('should get a crew by ID', async () => {
      mockClient.request.mockResolvedValue(CREW);

      const result = await crews.get('crew_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/crews/crew_123',
      });
      expect(result.id).toBe('crew_123');
      expect(result.members).toHaveLength(2);
    });

    it('should throw for invalid ID', async () => {
      await expect(crews.get('')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a crew', async () => {
      mockClient.request.mockResolvedValue(CREW);

      const result = await crews.create({
        name: 'Research Team',
        members: [
          { bot_id: 'bot_1', role: 'researcher' },
          { bot_id: 'bot_2', role: 'writer' },
        ],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/crews',
        body: {
          name: 'Research Team',
          members: [
            { bot_id: 'bot_1', role: 'researcher' },
            { bot_id: 'bot_2', role: 'writer' },
          ],
        },
      });
      expect(result.name).toBe('Research Team');
    });
  });

  describe('update', () => {
    it('should update a crew', async () => {
      mockClient.request.mockResolvedValue({ ...CREW, name: 'Updated Team' });

      const result = await crews.update('crew_123', { name: 'Updated Team' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/crews/crew_123',
        body: { name: 'Updated Team' },
      });
      expect(result.name).toBe('Updated Team');
    });
  });

  describe('delete', () => {
    it('should delete a crew', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await crews.delete('crew_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/crews/crew_123',
      });
    });
  });
});
