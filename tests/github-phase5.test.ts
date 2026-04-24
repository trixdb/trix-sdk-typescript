/**
 * Tests for GitHubResource Phase 5 — Code Quality Scanner + Repo Stats (ADR-152)
 */

import { GitHubResource } from '../src/resources/github';

const mockClient = {
  request: jest.fn(),
};

const PROJECT_ID = '6a9bfe12-0001-4001-b000-000000000001';
const SUGGESTION_ID = '7b8cfe34-0002-4002-b001-000000000002';

const SUGGESTION = {
  id: SUGGESTION_ID,
  category: 'security',
  priority: 'critical',
  title: 'SQL injection risk',
  description: 'Use parameterised queries.',
  file_path: 'src/db/user_repo.ts',
  evidence: {},
  status: 'open',
  generated_by: 'rule',
  generated_at: '2026-04-20T12:00:00Z',
};

const SUMMARY_ROW = { category: 'security', priority: 'critical', cnt: '3' };

const HISTORY_ITEM = {
  id: 'snap-001',
  snapshotted_at: '2026-04-18T00:00:00Z',
  suggestion_count: 12,
  critical_count: 3,
  warning_count: 5,
  total_files: 200,
  hotspot_count: 8,
};

const REPO_STATS_DATA = {
  repo: {
    full_name: 'acme/api',
    description: 'Core API',
    stars: 42,
    forks: 7,
    open_issues: 3,
    primary_language: 'TypeScript',
    license: 'MIT',
    is_private: false,
    size_kb: 12000,
  },
  languages: [{ name: 'TypeScript', bytes: 400000, pct: 88.5 }],
  contributors: [{ login: 'alice', avatar_url: 'https://example.com/a.png', profile_url: 'https://github.com/alice', contributions: 120 }],
  readme: '# Acme API',
  open_pr_count: 2,
  local_metrics: { analyzed_files: 180, total_loc: 22000, hotspot_count: 8, critical_files: 3, warning_files: 5 },
};

let github: GitHubResource;

beforeEach(() => {
  mockClient.request.mockReset();
  github = new GitHubResource(mockClient as any);
});

describe('generateCodeImprovements', () => {
  it('should POST to the generate endpoint', async () => {
    mockClient.request.mockResolvedValue({ generated: 7, repo: 'acme/api' });
    const result = await github.generateCodeImprovements(PROJECT_ID);
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'POST',
      path: `/projects/${PROJECT_ID}/github/improvements/generate`,
      body: {},
    });
    expect(result.generated).toBe(7);
    expect(result.repo).toBe('acme/api');
  });
});

describe('getCodeImprovements', () => {
  it('should GET with no query when no filters', async () => {
    mockClient.request.mockResolvedValue({ suggestions: [] });
    await github.getCodeImprovements(PROJECT_ID);
    const call = mockClient.request.mock.calls[0][0];
    expect(call.method).toBe('GET');
    expect(call.path).toBe(`/projects/${PROJECT_ID}/github/improvements`);
    // No filters → query is undefined
    expect(call.query).toBeUndefined();
  });

  it('should pass category and priority filters as query', async () => {
    mockClient.request.mockResolvedValue({ suggestions: [SUGGESTION] });
    const result = await github.getCodeImprovements(PROJECT_ID, {
      category: 'security',
      priority: 'critical',
      status: 'open',
    });
    // BaseResource.request translates params → query before calling client.request
    const query = mockClient.request.mock.calls[0][0].query;
    expect(query?.category).toBe('security');
    expect(query?.priority).toBe('critical');
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].id).toBe(SUGGESTION_ID);
  });
});

describe('updateCodeImprovementStatus', () => {
  it('should PATCH the correct endpoint and return { suggestion }', async () => {
    const updated = { ...SUGGESTION, status: 'resolved' };
    mockClient.request.mockResolvedValue({ suggestion: updated });
    const result = await github.updateCodeImprovementStatus(PROJECT_ID, SUGGESTION_ID, 'resolved');
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'PATCH',
      path: `/projects/${PROJECT_ID}/github/improvements/${SUGGESTION_ID}`,
      body: { status: 'resolved' },
    });
    expect(result.suggestion.status).toBe('resolved');
  });
});

describe('getImprovementsSummary', () => {
  it('should return the summary array', async () => {
    mockClient.request.mockResolvedValue({ summary: [SUMMARY_ROW] });
    const result = await github.getImprovementsSummary(PROJECT_ID);
    expect(result.summary).toHaveLength(1);
    expect(result.summary[0].category).toBe('security');
    expect(result.summary[0].cnt).toBe('3');
  });

  it('should handle empty summary', async () => {
    mockClient.request.mockResolvedValue({ summary: [] });
    const result = await github.getImprovementsSummary(PROJECT_ID);
    expect(result.summary).toHaveLength(0);
  });
});

describe('getImprovementsHistory', () => {
  it('should return the history array', async () => {
    mockClient.request.mockResolvedValue({ history: [HISTORY_ITEM] });
    const result = await github.getImprovementsHistory(PROJECT_ID);
    expect(result.history).toHaveLength(1);
    const item = result.history[0];
    expect(item.suggestion_count).toBe(12);
    expect(item.critical_count).toBe(3);
    expect(item.hotspot_count).toBe(8);
  });

  it('should handle empty history', async () => {
    mockClient.request.mockResolvedValue({ history: [] });
    const result = await github.getImprovementsHistory(PROJECT_ID);
    expect(result.history).toHaveLength(0);
  });
});

describe('getRepoStats', () => {
  it('should GET the stats endpoint', async () => {
    mockClient.request.mockResolvedValue({ stats: REPO_STATS_DATA });
    await github.getRepoStats(PROJECT_ID);
    expect(mockClient.request).toHaveBeenCalledWith({
      method: 'GET',
      path: `/projects/${PROJECT_ID}/github/improvements/stats`,
    });
  });

  it('should return repo metadata', async () => {
    mockClient.request.mockResolvedValue({ stats: REPO_STATS_DATA });
    const result = await github.getRepoStats(PROJECT_ID);
    expect(result.stats.repo?.full_name).toBe('acme/api');
    expect(result.stats.repo?.stars).toBe(42);
  });

  it('should return language breakdown', async () => {
    mockClient.request.mockResolvedValue({ stats: REPO_STATS_DATA });
    const result = await github.getRepoStats(PROJECT_ID);
    expect(result.stats.languages).toHaveLength(1);
    expect(result.stats.languages[0].name).toBe('TypeScript');
    expect(result.stats.languages[0].pct).toBeCloseTo(88.5);
  });

  it('should return local metrics', async () => {
    mockClient.request.mockResolvedValue({ stats: REPO_STATS_DATA });
    const result = await github.getRepoStats(PROJECT_ID);
    expect(result.stats.local_metrics.analyzed_files).toBe(180);
    expect(result.stats.local_metrics.total_loc).toBe(22000);
  });
});
