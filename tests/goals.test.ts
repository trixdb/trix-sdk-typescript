/**
 * Tests for Goals resource - Goal tracking and progress management
 */

import { Goals } from '../src/resources/goals';
import { buildParams } from '../src/resources/base';

const mockClient = {
  request: jest.fn(),
};

const GOAL = {
  id: 'goal_123',
  accountId: 'acc_1',
  title: 'Ship MVP',
  goalType: 'outcome',
  status: 'active',
  progress: 0,
  version: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Goals', () => {
  let goals: Goals;

  beforeEach(() => {
    jest.clearAllMocks();
    goals = new Goals(mockClient as any);
  });

  describe('create', () => {
    it('should create a goal', async () => {
      mockClient.request.mockResolvedValue(GOAL);

      const result = await goals.create({
        title: 'Ship MVP',
        goalType: 'outcome',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/goals',
        body: { title: 'Ship MVP', goalType: 'outcome' },
      });
      expect(result.id).toBe('goal_123');
      expect(result.title).toBe('Ship MVP');
    });
  });

  describe('list', () => {
    it('should list goals', async () => {
      mockClient.request.mockResolvedValue({
        goals: [GOAL],
        total: 1,
      });

      const result = await goals.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/goals',
        query: {},
      });
      expect(result.goals).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockClient.request.mockResolvedValue({ goals: [], total: 0 });

      await goals.list({ status: 'active' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/goals',
        query: { status: 'active' },
      });
    });
  });

  describe('get', () => {
    it('should get a goal by ID', async () => {
      mockClient.request.mockResolvedValue(GOAL);

      const result = await goals.get('goal_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/goals/goal_123',
      });
      expect(result.id).toBe('goal_123');
    });
  });

  describe('update', () => {
    it('should update a goal', async () => {
      mockClient.request.mockResolvedValue({ ...GOAL, title: 'Ship MVP v2' });

      const result = await goals.update('goal_123', { title: 'Ship MVP v2' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/goals/goal_123',
        body: { title: 'Ship MVP v2' },
      });
      expect(result.title).toBe('Ship MVP v2');
    });
  });

  describe('delete', () => {
    it('should delete a goal', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await goals.delete('goal_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/goals/goal_123',
      });
    });
  });

  describe('updateProgress', () => {
    it('should update goal progress', async () => {
      mockClient.request.mockResolvedValue({ ...GOAL, progress: 50 });

      const result = await goals.updateProgress('goal_123', { progress: 50 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/goals/goal_123/progress',
        body: { progress: 50 },
      });
      expect(result.progress).toBe(50);
    });
  });

  describe('transitionStatus', () => {
    it('should transition goal status', async () => {
      mockClient.request.mockResolvedValue({ ...GOAL, status: 'completed' });

      const result = await goals.transitionStatus('goal_123', {
        status: 'completed',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/goals/goal_123/status',
        body: { status: 'completed' },
      });
      expect(result.status).toBe('completed');
    });
  });

  describe('getProgressHistory', () => {
    it('should get progress history', async () => {
      mockClient.request.mockResolvedValue({
        entries: [{ progress: 50, createdAt: '2024-01-02T00:00:00Z' }],
        total: 1,
      });

      const result = await goals.getProgressHistory('goal_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/goals/goal_123/progress-history',
        query: undefined,
      });
      expect(result.total).toBe(1);
    });
  });

  describe('getPace', () => {
    it('should get pace analysis', async () => {
      mockClient.request.mockResolvedValue({
        goalId: 'goal_123',
        status: 'on_track',
        progress: 50,
      });

      const result = await goals.getPace('goal_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/goals/goal_123/pace',
      });
      expect(result.status).toBe('on_track');
    });
  });

  describe('addKeyResult', () => {
    it('should add a key result', async () => {
      mockClient.request.mockResolvedValue({
        ...GOAL,
        id: 'goal_456',
        title: 'Reach 1000 users',
        parentGoalId: 'goal_123',
      });

      const result = await goals.addKeyResult('goal_123', {
        title: 'Reach 1000 users',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/goals/goal_123/key-results',
        body: { title: 'Reach 1000 users' },
      });
      expect(result.title).toBe('Reach 1000 users');
    });
  });
});
