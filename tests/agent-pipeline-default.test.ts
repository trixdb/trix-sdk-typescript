/**
 * Tests for ADR-109a account-default pipeline methods on Agent resource.
 */

import { Agent } from '../src/resources/agent';

const mockClient = {
  request: jest.fn(),
};

describe('Agent — account-default pipeline preset', () => {
  let agent: Agent;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new Agent(mockClient as any);
  });

  describe('getDefaultPipeline', () => {
    it('returns the name when a default is set', async () => {
      mockClient.request.mockResolvedValue({ name: 'longmem-v1' });
      const result = await agent.getDefaultPipeline();
      expect(result).toBe('longmem-v1');
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/pipeline-presets/_default',
      });
    });

    it('returns null when no default is set', async () => {
      mockClient.request.mockResolvedValue({ name: null });
      const result = await agent.getDefaultPipeline();
      expect(result).toBeNull();
    });

    it('returns null when response is falsy', async () => {
      mockClient.request.mockResolvedValue(null);
      const result = await agent.getDefaultPipeline();
      expect(result).toBeNull();
    });
  });

  describe('setDefaultPipeline', () => {
    it('POSTs to the set-default path and returns the name', async () => {
      mockClient.request.mockResolvedValue({ name: 'longmem-v1' });
      const result = await agent.setDefaultPipeline('longmem-v1');
      expect(result).toEqual({ name: 'longmem-v1' });
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/pipeline-presets/longmem-v1/set-default',
        body: {},
      });
    });

    it('URL-encodes preset names containing special characters', async () => {
      mockClient.request.mockResolvedValue({ name: 'a b' });
      await agent.setDefaultPipeline('a b');
      const call = mockClient.request.mock.calls[0][0];
      expect(call.path).toBe('/pipeline-presets/a%20b/set-default');
    });
  });

  describe('clearDefaultPipeline', () => {
    it('DELETEs the _default path', async () => {
      mockClient.request.mockResolvedValue(undefined);
      await agent.clearDefaultPipeline();
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/pipeline-presets/_default',
      });
    });
  });
});
