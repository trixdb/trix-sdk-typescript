/**
 * Tests for GitHubResource — ADR-152 GitHub project integration
 */

import { GitHubResource } from '../src/resources/github';

const mockClient = {
  request: jest.fn(),
};

const PROJECT_ID = 'proj_abc123';
const CONN_ID = 'conn_xyz789';

const CONNECTION = {
  id: CONN_ID,
  project_id: PROJECT_ID,
  repo_full_name: 'acme/api',
  webhook_active: true,
  sync_commits: true,
  sync_pull_requests: true,
  sync_issues: true,
  last_webhook_at: '2026-04-20T10:00:00Z',
};

const VELOCITY = {
  merged_last_7_days: 5,
  merged_last_30_days: 18,
  avg_cycle_time_hours: 36.5,
  avg_cycle_time_days: 1.5,
};

const CYCLE_TIME = {
  avg_cycle_days_last_30: 4.2,
  avg_cycle_days_30_60: 5.1,
  avg_open_age_days: 8.3,
  open_issue_count: 12,
  closed_last_30: 9,
  trend: 'improving',
};

const ATTRIBUTION = {
  total_commits: 120,
  total_prs: 28,
  agent_breakdown: { claude: 15, copilot: 8 },
  agent_total: 23,
  human_total: 97,
  agent_ratio: 0.19,
};

const NARRATIVE = {
  narrative: 'This week the team shipped 5 PRs…',
  stored: true,
  window_days: 7,
};

describe('GitHubResource', () => {
  let github: GitHubResource;

  beforeEach(() => {
    jest.clearAllMocks();
    github = new GitHubResource(mockClient as any);
  });

  // ── Connections ────────────────────────────────────────────────────────────

  describe('listConnections', () => {
    it('should list connected repos', async () => {
      mockClient.request.mockResolvedValue({ connections: [CONNECTION], count: 1 });

      const result = await github.listConnections(PROJECT_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: `/projects/${PROJECT_ID}/github`,
      });
      expect(result.connections).toHaveLength(1);
      expect(result.connections[0].repo_full_name).toBe('acme/api');
    });

    it('should reject empty project ID', async () => {
      await expect(github.listConnections('')).rejects.toThrow();
    });
  });

  describe('linkRepo', () => {
    it('should link a repository and return webhook details', async () => {
      mockClient.request.mockResolvedValue({
        connection: CONNECTION,
        webhook_url: 'https://api.trixdb.com/webhooks/github/abc',
        webhook_secret: 's3cr3t',
      });

      const result = await github.linkRepo(PROJECT_ID, {
        connection_id: 'oauth_1',
        repo_id: 'r_123',
        repo_full_name: 'acme/api',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: `/projects/${PROJECT_ID}/github`,
        body: {
          connection_id: 'oauth_1',
          repo_id: 'r_123',
          repo_full_name: 'acme/api',
        },
      });
      expect(result.webhook_url).toContain('webhooks/github');
      expect(result.webhook_secret).toBe('s3cr3t');
    });
  });

  describe('updateConnection', () => {
    it('should send PATCH with updated fields', async () => {
      mockClient.request.mockResolvedValue({ ...CONNECTION, sync_commits: false });

      const result = await github.updateConnection(PROJECT_ID, CONN_ID, { sync_commits: false });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'PATCH',
        path: `/projects/${PROJECT_ID}/github/${CONN_ID}`,
        body: { sync_commits: false },
      });
      expect(result.sync_commits).toBe(false);
    });
  });

  // ── Activity ───────────────────────────────────────────────────────────────

  describe('getActivity', () => {
    it('should fetch activity with no filters', async () => {
      mockClient.request.mockResolvedValue({ memories: [], total: 0, count: 0 });

      await github.getActivity(PROJECT_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: `/projects/${PROJECT_ID}/github/activity`,
        params: undefined,
      });
    });

    it('should pass type and limit params', async () => {
      mockClient.request.mockResolvedValue({ memories: [], total: 0, count: 0 });

      await github.getActivity(PROJECT_ID, { type: 'pull_request', limit: 5 });

      const call = mockClient.request.mock.calls[0][0];
      expect(call.params.get('type')).toBe('pull_request');
      expect(call.params.get('limit')).toBe('5');
    });
  });

  // ── Quality ────────────────────────────────────────────────────────────────

  describe('getFileComplexity', () => {
    it('should return file complexity metrics', async () => {
      mockClient.request.mockResolvedValue({
        files: [{
          file_path: 'src/auth/service.ts',
          repo_full_name: 'acme/api',
          language: 'typescript',
          cyclomatic_complexity: 18,
          cognitive_complexity: 12,
          loc: 320,
          hotspot_score: 0.87,
          complexity_level: 'warning',
          computed_at: '2026-04-20T10:00:00Z',
        }],
        count: 1,
      });

      const result = await github.getFileComplexity(PROJECT_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: `/projects/${PROJECT_ID}/github/complexity`,
        params: undefined,
      });
      expect(result.files).toHaveLength(1);
      expect(result.files[0].complexity_level).toBe('warning');
      expect(result.files[0].hotspot_score).toBeCloseTo(0.87);
    });

    it('should pass file and repo filters', async () => {
      mockClient.request.mockResolvedValue({ files: [], count: 0 });

      await github.getFileComplexity(PROJECT_ID, { file: 'src/auth.ts', repo: 'acme/api' });

      const call = mockClient.request.mock.calls[0][0];
      expect(call.params.get('file')).toBe('src/auth.ts');
      expect(call.params.get('repo')).toBe('acme/api');
    });

    it('should return empty list when no files analyzed yet', async () => {
      mockClient.request.mockResolvedValue({ files: [], count: 0 });
      const result = await github.getFileComplexity(PROJECT_ID);
      expect(result.files).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe('getChurnFiles', () => {
    it('should return churn files', async () => {
      mockClient.request.mockResolvedValue({
        files: [{ file_path: 'src/app.ts', repo_full_name: 'acme/api', touch_count: 42, last_touched_at: '2026-04-20T00:00:00Z' }],
        count: 1,
      });

      const result = await github.getChurnFiles(PROJECT_ID, { limit: 10 });

      expect(result.files).toHaveLength(1);
      expect(result.files[0].file_path).toBe('src/app.ts');
    });
  });

  describe('getQualitySummary', () => {
    it('should return quality summary', async () => {
      mockClient.request.mockResolvedValue({
        summary: { total_files_tracked: 200, hotspot_count: 8, hotspot_ratio: 0.04 },
        top_hotspots: [],
      });

      const result = await github.getQualitySummary(PROJECT_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: `/projects/${PROJECT_ID}/github/quality`,
      });
      expect(result.summary.hotspot_count).toBe(8);
    });
  });

  // ── Analytics ──────────────────────────────────────────────────────────────

  describe('getVelocity', () => {
    it('should return PR velocity metrics', async () => {
      mockClient.request.mockResolvedValue(VELOCITY);

      const result = await github.getVelocity(PROJECT_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: `/projects/${PROJECT_ID}/github/velocity`,
      });
      expect(result.merged_last_7_days).toBe(5);
      expect(result.avg_cycle_time_days).toBe(1.5);
    });

    it('should handle null cycle time when no data', async () => {
      mockClient.request.mockResolvedValue({
        ...VELOCITY,
        avg_cycle_time_hours: null,
        avg_cycle_time_days: null,
      });

      const result = await github.getVelocity(PROJECT_ID);
      expect(result.avg_cycle_time_days).toBeNull();
    });
  });

  describe('getFlaggedPRs', () => {
    it('should return flagged PRs', async () => {
      mockClient.request.mockResolvedValue({
        prs: [{
          id: 'mem_1',
          summary: 'feat: add auth module',
          flags: ['pr:scope-creep', 'pr:no-tests'],
          created_at: '2026-04-19T08:00:00Z',
        }],
      });

      const result = await github.getFlaggedPRs(PROJECT_ID);

      expect(result.prs).toHaveLength(1);
      expect(result.prs[0].flags).toContain('pr:scope-creep');
    });

    it('should return empty prs array when none flagged', async () => {
      mockClient.request.mockResolvedValue({ prs: [] });
      const result = await github.getFlaggedPRs(PROJECT_ID);
      expect(result.prs).toHaveLength(0);
    });
  });

  describe('getCycleTime', () => {
    it('should return cycle time with trend', async () => {
      mockClient.request.mockResolvedValue(CYCLE_TIME);

      const result = await github.getCycleTime(PROJECT_ID);

      expect(result.trend).toBe('improving');
      expect(result.avg_cycle_days_last_30).toBe(4.2);
      expect(result.open_issue_count).toBe(12);
    });
  });

  describe('getAgentAttribution', () => {
    it('should return attribution breakdown', async () => {
      mockClient.request.mockResolvedValue(ATTRIBUTION);

      const result = await github.getAgentAttribution(PROJECT_ID);

      expect(result.agent_breakdown).toEqual({ claude: 15, copilot: 8 });
      expect(result.agent_ratio).toBeCloseTo(0.19);
    });
  });

  describe('getGoalProgress', () => {
    it('should return goals with GitHub-driven progress (0.0–1.0 scale)', async () => {
      // goal progress is stored as 0.0–1.0 (not 0–100)
      mockClient.request.mockResolvedValue({
        goals: [{
          id: 'goal_1',
          title: 'Reduce p95 latency',
          progress: 0.72,
          status: 'active',
          progress_type: 'github',
          last_github_progress: 0.68,
          last_github_updated_at: '2026-04-21T10:00:00Z',
        }],
      });

      const result = await github.getGoalProgress(PROJECT_ID);

      expect(result.goals).toHaveLength(1);
      expect(result.goals[0].progress).toBeCloseTo(0.72);
    });
  });

  describe('getReleaseReadiness', () => {
    it('should return readiness score and signals', async () => {
      mockClient.request.mockResolvedValue({
        score: 85,
        ready: true,
        signals: { open_prs: 1, blocking_tasks: 0, goal_completion_pct: 88, scope_creep_prs: 0 },
        details: { open_prs: [], blocking_tasks: [], scope_creep_prs: [] },
      });

      const result = await github.getReleaseReadiness(PROJECT_ID);

      expect(result.score).toBe(85);
      expect(result.ready).toBe(true);
      expect(result.signals.open_prs).toBe(1);
    });
  });

  // ── Symbols ────────────────────────────────────────────────────────────────

  describe('searchSymbols', () => {
    it('should search symbols with query', async () => {
      mockClient.request.mockResolvedValue({ symbols: [], count: 0 });

      await github.searchSymbols(PROJECT_ID, { q: 'AuthService' });

      const call = mockClient.request.mock.calls[0][0];
      expect(call.method).toBe('GET');
      expect(call.path).toBe(`/projects/${PROJECT_ID}/github/symbols`);
      expect(call.params.get('q')).toBe('AuthService');
    });
  });

  describe('getFileSymbols', () => {
    it('should look up symbols by file path', async () => {
      mockClient.request.mockResolvedValue({ symbols: [], count: 0 });

      await github.getFileSymbols(PROJECT_ID, { file_path: 'src/auth/service.ts' });

      const call = mockClient.request.mock.calls[0][0];
      expect(call.params.get('file')).toBe('src/auth/service.ts');
    });
  });

  // ── Scan & Delete ─────────────────────────────────────────────────────────

  describe('scanRepo', () => {
    it('should POST to the scan endpoint', async () => {
      mockClient.request.mockResolvedValue({
        scanned: true, commits: 12, prs: 4, issues: 7, files: 28, hotspots: 3, pr_briefs: 2,
      });

      const result = await github.scanRepo(PROJECT_ID, CONN_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: `/projects/${PROJECT_ID}/github/${CONN_ID}/scan`,
        body: {},
      });
      expect(result.scanned).toBe(true);
      expect(result.commits).toBe(12);
    });
  });

  describe('deleteConnection', () => {
    it('should send DELETE to the connection endpoint', async () => {
      mockClient.request.mockResolvedValue(undefined);

      await github.deleteConnection(PROJECT_ID, CONN_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: `/projects/${PROJECT_ID}/github/${CONN_ID}`,
      });
    });
  });

  // ── Narrative ──────────────────────────────────────────────────────────────

  describe('generateNarrative', () => {
    it('should POST to generate a narrative', async () => {
      mockClient.request.mockResolvedValue(NARRATIVE);

      const result = await github.generateNarrative(PROJECT_ID, { window_days: 7 });

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: `/projects/${PROJECT_ID}/github/narrative`,
        body: { window_days: 7 },
      });
      expect(result.narrative).toContain('shipped');
      expect(result.stored).toBe(true);
    });

    it('should send empty body when no options provided', async () => {
      mockClient.request.mockResolvedValue(NARRATIVE);

      await github.generateNarrative(PROJECT_ID);

      const call = mockClient.request.mock.calls[0][0];
      expect(call.body).toEqual({});
    });
  });

  describe('getLatestNarrative', () => {
    it('should GET the stored narrative', async () => {
      mockClient.request.mockResolvedValue({
        narrative: { id: 'mem_n1', content: 'Week 16 summary…', created_at: '2026-04-21T00:00:00Z' },
      });

      const result = await github.getLatestNarrative(PROJECT_ID);

      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: `/projects/${PROJECT_ID}/github/narrative`,
      });
      expect(result.narrative?.content).toContain('Week 16');
    });

    it('should handle null narrative when none generated yet', async () => {
      mockClient.request.mockResolvedValue({ narrative: null });
      const result = await github.getLatestNarrative(PROJECT_ID);
      expect(result.narrative).toBeNull();
    });
  });
});
