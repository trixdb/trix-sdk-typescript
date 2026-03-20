/**
 * Tests for Workflows resource - Automated process management
 */

import { Workflows } from '../src/resources/workflows';
import { buildParams } from '../src/resources/base';

const mockClient = {
  request: jest.fn(),
};

const WORKFLOW = {
  id: 'wf_123',
  accountId: 'acc_1',
  name: 'Daily Summary',
  status: 'active',
  version: 1,
  steps: [{ type: 'summarize', config: {} }],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const RUN = {
  id: 'run_789',
  workflowId: 'wf_123',
  status: 'running',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('Workflows', () => {
  let workflows: Workflows;

  beforeEach(() => {
    jest.clearAllMocks();
    workflows = new Workflows(mockClient as any);
  });

  describe('create', () => {
    it('should create a workflow', async () => {
      mockClient.request.mockResolvedValue(WORKFLOW);

      const result = await workflows.create({
        name: 'Daily Summary',
        steps: [{ type: 'summarize', config: {} }],
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/workflows',
        body: {
          name: 'Daily Summary',
          steps: [{ type: 'summarize', config: {} }],
        },
      });
      expect(result.id).toBe('wf_123');
      expect(result.name).toBe('Daily Summary');
    });
  });

  describe('list', () => {
    it('should list workflows', async () => {
      mockClient.request.mockResolvedValue({
        workflows: [WORKFLOW],
        total: 1,
      });

      const result = await workflows.list();

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/workflows',
        query: {},
      });
      expect(result.workflows).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockClient.request.mockResolvedValue({ workflows: [], total: 0 });

      await workflows.list({ status: 'active' });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/workflows',
        query: { status: 'active' },
      });
    });
  });

  describe('get', () => {
    it('should get a workflow by ID', async () => {
      mockClient.request.mockResolvedValue(WORKFLOW);

      const result = await workflows.get('wf_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/workflows/wf_123',
      });
      expect(result.id).toBe('wf_123');
    });
  });

  describe('update', () => {
    it('should update a workflow', async () => {
      mockClient.request.mockResolvedValue({
        ...WORKFLOW,
        name: 'Weekly Summary',
        version: 2,
      });

      const result = await workflows.update('wf_123', {
        version: 1,
        name: 'Weekly Summary',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/workflows/wf_123',
        body: { version: 1, name: 'Weekly Summary' },
      });
      expect(result.name).toBe('Weekly Summary');
    });
  });

  describe('delete', () => {
    it('should delete a workflow', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await workflows.delete('wf_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/workflows/wf_123',
      });
    });
  });

  describe('trigger', () => {
    it('should trigger a workflow run', async () => {
      mockClient.request.mockResolvedValue(RUN);

      const result = await workflows.trigger('wf_123', {
        input: { query: 'recent' },
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/workflows/wf_123/trigger',
        body: { input: { query: 'recent' } },
      });
      expect(result.id).toBe('run_789');
      expect(result.status).toBe('running');
    });

    it('should trigger without params', async () => {
      mockClient.request.mockResolvedValue(RUN);

      await workflows.trigger('wf_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/workflows/wf_123/trigger',
        body: undefined,
      });
    });
  });

  describe('listRuns', () => {
    it('should list workflow runs', async () => {
      mockClient.request.mockResolvedValue({
        runs: [{ ...RUN, status: 'completed' }],
        total: 1,
      });

      const result = await workflows.listRuns('wf_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/workflows/wf_123/runs',
        query: undefined,
      });
      expect(result.runs).toHaveLength(1);
    });
  });

  describe('listTriggers', () => {
    it('should list workflow triggers', async () => {
      mockClient.request.mockResolvedValue([
        {
          id: 'trigger_456',
          workflowId: 'wf_123',
          type: 'cron',
          cronExpression: '0 9 * * *',
          enabled: true,
        },
      ]);

      const result = await workflows.listTriggers('wf_123');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/workflows/wf_123/triggers',
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('createTrigger', () => {
    it('should create a workflow trigger', async () => {
      mockClient.request.mockResolvedValue({
        id: 'trigger_456',
        workflowId: 'wf_123',
        type: 'cron',
        cronExpression: '0 9 * * *',
        enabled: true,
      });

      const result = await workflows.createTrigger('wf_123', {
        type: 'cron',
        cronExpression: '0 9 * * *',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/workflows/wf_123/triggers',
        body: { type: 'cron', cronExpression: '0 9 * * *' },
      });
    });
  });

  describe('deleteTrigger', () => {
    it('should delete a workflow trigger', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await workflows.deleteTrigger('wf_123', 'trigger_456');

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/workflows/wf_123/triggers/trigger_456',
      });
    });
  });
});
