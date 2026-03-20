/**
 * Tests for Tasks resource - Task management
 */

import { Tasks } from '../src/resources/tasks';

const mockClient = {
  request: jest.fn(),
};

const TASK = {
  id: 'task_123',
  title: 'Review quarterly report',
  spaceId: 'space_abc',
  status: 'pending',
  priority: 3,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Tasks', () => {
  let tasks: Tasks;

  beforeEach(() => {
    jest.clearAllMocks();
    tasks = new Tasks(mockClient as any);
  });

  describe('create', () => {
    it('should create a task', async () => {
      mockClient.request.mockResolvedValue(TASK);

      const result = await tasks.create({
        title: 'Review quarterly report',
        spaceId: 'space_abc',
        priority: 3,
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/tasks',
        body: {
          title: 'Review quarterly report',
          space_id: 'space_abc',
          priority: 3,
        },
      });
      expect(result.id).toBe('task_123');
    });
  });

  describe('list', () => {
    it('should list tasks', async () => {
      mockClient.request.mockResolvedValue({
        tasks: [TASK],
        total: 1,
      });

      const result = await tasks.list({ spaceId: 'space_abc' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tasks',
        query: { space_id: 'space_abc' },
      });
      expect(result.tasks).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockClient.request.mockResolvedValue({ tasks: [], total: 0 });

      await tasks.list({ status: 'pending' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tasks',
        query: { status: 'pending' },
      });
    });
  });

  describe('get', () => {
    it('should get a task by ID', async () => {
      mockClient.request.mockResolvedValue(TASK);

      const result = await tasks.get('task_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tasks/task_123',
        query: undefined,
      });
      expect(result.id).toBe('task_123');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      mockClient.request.mockResolvedValue({ ...TASK, status: 'in_progress' });

      const result = await tasks.update('task_123', { status: 'in_progress' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/tasks/task_123',
        body: { status: 'in_progress' },
      });
      expect(result.status).toBe('in_progress');
    });
  });

  describe('complete', () => {
    it('should complete a task', async () => {
      mockClient.request.mockResolvedValue({
        ...TASK,
        status: 'done',
        completedAt: '2024-01-02T00:00:00Z',
      });

      const result = await tasks.complete('task_123');

      expect(result.status).toBe('done');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await tasks.delete('task_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/tasks/task_123',
      });
    });
  });

  describe('createSubtask', () => {
    it('should create a subtask', async () => {
      mockClient.request.mockResolvedValue({
        ...TASK,
        id: 'task_456',
        title: 'Review section 1',
        parentTaskId: 'task_123',
      });

      const result = await tasks.createSubtask('task_123', {
        title: 'Review section 1',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/tasks/task_123/subtasks',
        body: { title: 'Review section 1' },
      });
      expect(result.title).toBe('Review section 1');
    });
  });

  describe('getSubtasks', () => {
    it('should get subtasks of a parent', async () => {
      mockClient.request.mockResolvedValue({
        subtasks: [{ ...TASK, id: 'task_456', parentTaskId: 'task_123' }],
      });

      const result = await tasks.getSubtasks('task_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tasks/task_123/subtasks',
      });
      expect(result.subtasks).toHaveLength(1);
    });
  });

  describe('handoff', () => {
    it('should hand off a task to another agent', async () => {
      mockClient.request.mockResolvedValue({
        handoffId: 'handoff_789',
        task: TASK,
        newAssigneeId: 'agent_456',
      });

      const result = await tasks.handoff('task_123', {
        targetAgentId: 'agent_456',
        handoffNotes: 'Completed research phase',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/tasks/task_123/handoff',
        body: {
          target_agent_id: 'agent_456',
          handoff_notes: 'Completed research phase',
        },
      });
      expect(result.newAssigneeId).toBe('agent_456');
    });
  });

  describe('suggested', () => {
    it('should get AI-suggested tasks', async () => {
      mockClient.request.mockResolvedValue({
        suggestions: [{ task: TASK, score: 0.9, reason: 'High priority' }],
      });

      const result = await tasks.suggested({ context: 'quarterly review' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/tasks/suggested',
        query: { context: 'quarterly review' },
      });
    });
  });
});
