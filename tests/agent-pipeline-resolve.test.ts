/**
 * Tests for ADR-109a resolve_pipeline on TypeScript SDK (tick 79).
 */

import { Agent } from '../src/resources/agent';

const mockClient = {
  request: jest.fn(),
} as any;

describe('Agent.resolvePipeline()', () => {
  let agent: Agent;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new Agent(mockClient);
  });

  it('omits query params when both args are undefined', async () => {
    mockClient.request.mockResolvedValue({
      name: null,
      source: null,
      preset: null,
    });

    const result = await agent.resolvePipeline();

    expect(result).toEqual({ name: null, source: null, preset: null });
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/pipeline-presets/_resolve',
    });
  });

  it('sends the pipeline query param when caller preset provided', async () => {
    mockClient.request.mockResolvedValue({
      name: 'longmem-v1',
      source: 'caller',
      preset: { name: 'longmem-v1' },
    });

    await agent.resolvePipeline({ pipeline: 'longmem-v1' });

    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/pipeline-presets/_resolve?pipeline=longmem-v1',
    });
  });

  it('sends both space_id and pipeline params when both provided', async () => {
    mockClient.request.mockResolvedValue({
      name: 'space-pref',
      source: 'space',
      preset: { name: 'space-pref' },
    });

    await agent.resolvePipeline({ spaceId: 'space-123', pipeline: 'caller' });

    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/pipeline-presets/_resolve?space_id=space-123&pipeline=caller',
    });
  });

  it('url-encodes space_id that needs escaping', async () => {
    mockClient.request.mockResolvedValue({
      name: null,
      source: null,
      preset: null,
    });

    await agent.resolvePipeline({ spaceId: 'my space' });

    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/pipeline-presets/_resolve?space_id=my%20space',
    });
  });
});
