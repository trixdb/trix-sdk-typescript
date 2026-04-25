/**
 * GitHub project integration resource (ADR-152).
 *
 * Provides access to GitHub repository connections, activity memories,
 * file churn analysis, code quality summaries, symbol search, code
 * improvement scanning, and live repository stats.
 */

import type { Trix } from '../client.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';
import type {
  GitHubConnection,
  GitHubConnectionsResponse,
  LinkRepoParams,
  LinkRepoResponse,
  UpdateConnectionParams,
  ActivityParams,
  ActivityResponse,
  ChurnFilesResponse,
  FileComplexityResponse,
  QualitySummaryResponse,
  SymbolsResponse,
  VelocityResponse,
  FlaggedPRsResponse,
  PRBriefsResponse,
  CycleTimeResponse,
  AgentAttributionResponse,
  GoalProgressResponse,
  GoalProgressHistoryResponse,
  ReleaseReadinessResponse,
  ScanRepoResponse,
  GenerateNarrativeResponse,
  LatestNarrativeResponse,
  CodeImprovementFilters,
  CodeImprovement,
  CodeImprovementsResponse,
  ImprovementGenerateResponse,
  ImprovementSummaryRow,
  ImprovementsHistoryItem,
  ImprovementStatus,
  RepoStatsResponse,
  ReviewStats,
  WeeklyActivityDay,
  TechnicalDebt,
  QualityGate,
  CqlQuery,
  CqlResult,
  AgentPRResult,
  PRReviewResult,
  ScanCodeResult,
  CodeSummaryResult,
  CloneGroupsResult,
  DeadExportsResult,
  TestCoverageResult,
  LoadBearingResult,
  BugDensityResult,
  ActiveBranchesResult,
  ContributorQualityResult,
  PrAgingResult,
  PrSizeDistributionResult,
  ReviewTurnaroundResult,
  WorkQueueResult,
  ReviewerWorkloadResult,
  ApprovedPRsResult,
  IssueBacklogResult,
  ReviewCoverageResult,
  HealthSnapshotResponse,
  PRQualityWeek,
} from './github-types.js';

export type {
  GitHubConnection,
  GitHubConnectionsResponse,
  LinkRepoParams,
  LinkRepoResponse,
  UpdateConnectionParams,
  ActivityMemory,
  ActivityParams,
  ActivityResponse,
  ChurnFile,
  ChurnFilesResponse,
  FileComplexityMetric,
  FileComplexityResponse,
  QualitySummaryResponse,
  CodeSymbol,
  SymbolsResponse,
  VelocityResponse,
  FlaggedPR,
  FlaggedPRsResponse,
  PRBrief,
  PRBriefsResponse,
  CycleTimeResponse,
  AgentAttributionResponse,
  LinkedGoal,
  GoalProgressResponse,
  GoalProgressHistoryResponse,
  GoalProgressEvent,
  ReleaseReadinessSignals,
  ReleaseReadinessDetails,
  ReleaseReadinessResponse,
  ScanRepoResponse,
  GenerateNarrativeResponse,
  StoredNarrative,
  LatestNarrativeResponse,
  CodeImprovementFilters,
  CodeImprovement,
  CodeImprovementsResponse,
  ImprovementGenerateResponse,
  ImprovementSummaryRow,
  ImprovementsHistoryItem,
  ImprovementStatus,
  ImprovementCategory,
  ImprovementPriority,
  RepoLanguage,
  RepoContributor,
  RepoStatsResponse,
  ReviewStats,
  ReviewerStat,
  WeeklyActivityDay,
  TechnicalDebt,
  DebtCategory,
  QualityGate,
  QualityCheck,
  CqlQuery,
  CqlResult,
  AgentPRResult,
  PRReviewResult,
  SecurityFinding,
  DepVuln,
  ScanCodeResult,
  ScanCodeSummary,
  CodeSummaryResult,
  CloneGroupsResult,
  DeadExportsResult,
  TestCoverageResult,
  LoadBearingResult,
  BugDensityResult,
  ActiveBranchesResult,
  ContributorQualityResult,
  ContributorQualityStat,
  PrAgingResult,
  PrSizeDistributionResult,
  ReviewTurnaroundResult,
  WorkQueueResult,
  ReviewerWorkloadResult,
  ApprovedPRsResult,
  ApprovedPR,
  IssueBacklogResult,
  IssueLabelCount,
  BacklogIssue,
  ReviewCoverageResult,
  AuthorReviewCoverage,
  OpenPRAging,
  BranchInfo,
  CloneGroup,
  CloneInstance,
  DeadExportFile,
  TestCoverageFile,
  LoadBearingFunction,
  BugDensityFile,
  HealthSnapshotResponse,
  HealthSnapshotRisk,
  PRQualityWeek,
} from './github-types.js'; // eslint-disable-line @typescript-eslint/no-unused-vars

// ── Resource ───────────────────────────────────────────────────────────────

export class GitHubResource extends BaseResource {
  constructor(client: Trix) {
    super(client);
  }

  /** List GitHub repos linked to a project. */
  async listConnections(projectId: string): Promise<GitHubConnectionsResponse> {
    validateId(projectId, 'project');
    return this.request<GitHubConnectionsResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github`,
    });
  }

  /** Link a GitHub repo to a project. */
  async linkRepo(projectId: string, params: LinkRepoParams): Promise<LinkRepoResponse> {
    validateId(projectId, 'project');
    return this.request<LinkRepoResponse>({
      method: 'POST',
      path: `/projects/${projectId}/github`,
      body: params,
    });
  }

  /** Get GitHub activity memories for a project. */
  async getActivity(projectId: string, options?: ActivityParams): Promise<ActivityResponse> {
    validateId(projectId, 'project');
    return this.request<ActivityResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/activity`,
      params: options ? buildParams(options) : undefined,
    });
  }

  /** Get the most frequently changed files for a project. */
  async getChurnFiles(
    projectId: string,
    options?: { limit?: number; repo?: string }
  ): Promise<ChurnFilesResponse> {
    validateId(projectId, 'project');
    return this.request<ChurnFilesResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/churn`,
      params: options ? buildParams(options) : undefined,
    });
  }

  /** Get cyclomatic and cognitive complexity metrics for tracked files. */
  async getFileComplexity(
    projectId: string,
    options?: { file?: string; repo?: string }
  ): Promise<FileComplexityResponse> {
    validateId(projectId, 'project');
    return this.request<FileComplexityResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/complexity`,
      params: options ? buildParams(options) : undefined,
    });
  }

  /** Get code quality summary including hotspot analysis. */
  async getQualitySummary(projectId: string): Promise<QualitySummaryResponse> {
    validateId(projectId, 'project');
    return this.request<QualitySummaryResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/quality`,
    });
  }

  /** Search indexed code symbols by query string. */
  async searchSymbols(
    projectId: string,
    options: { q: string; repo?: string; limit?: number }
  ): Promise<SymbolsResponse> {
    validateId(projectId, 'project');
    return this.request<SymbolsResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/symbols`,
      params: buildParams(options),
    });
  }

  /** List all symbols in a specific file. */
  async getFileSymbols(
    projectId: string,
    options: { file_path: string; repo?: string }
  ): Promise<SymbolsResponse> {
    validateId(projectId, 'project');
    return this.request<SymbolsResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/symbols`,
      params: buildParams({ file: options.file_path, repo: options.repo }),
    });
  }

  /** Get PR merge velocity and average cycle time. */
  async getVelocity(projectId: string): Promise<VelocityResponse> {
    validateId(projectId, 'project');
    return this.request<VelocityResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/velocity`,
    });
  }

  /** Get risk-flagged pull requests. */
  async getFlaggedPRs(projectId: string): Promise<FlaggedPRsResponse> {
    validateId(projectId, 'project');
    return this.request<FlaggedPRsResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/flagged-prs`,
    });
  }

  /** Get PR pre-review briefs with structured risk data and optional quality score. */
  async getPrBriefs(
    projectId: string,
    opts: {
      state?: 'open' | 'closed' | 'all';
      prNumber?: number;
      limit?: number;
      minQualityScore?: number;
      maxQualityScore?: number;
      agent?: 'claude' | 'copilot' | 'cursor' | 'gemini';
    } = {},
  ): Promise<PRBriefsResponse> {
    validateId(projectId, 'project');
    const params = new URLSearchParams();
    if (opts.state) params.set('state', opts.state);
    if (opts.prNumber != null) params.set('pr_number', String(opts.prNumber));
    if (opts.limit != null) params.set('limit', String(opts.limit));
    if (opts.minQualityScore != null) params.set('min_quality_score', String(opts.minQualityScore));
    if (opts.maxQualityScore != null) params.set('max_quality_score', String(opts.maxQualityScore));
    if (opts.agent) params.set('agent', opts.agent);
    const qs = params.toString();
    return this.request<PRBriefsResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/pr-briefs${qs ? `?${qs}` : ''}`,
    });
  }

  /** Get issue cycle time trends. */
  async getCycleTime(projectId: string): Promise<CycleTimeResponse> {
    validateId(projectId, 'project');
    return this.request<CycleTimeResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/cycle-time`,
    });
  }

  /** Get AI vs human commit/PR attribution breakdown. */
  async getAgentAttribution(projectId: string): Promise<AgentAttributionResponse> {
    validateId(projectId, 'project');
    return this.request<AgentAttributionResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/agent-attribution`,
    });
  }

  /** Get goal progress driven by GitHub issue activity. */
  async getGoalProgress(projectId: string): Promise<GoalProgressResponse> {
    validateId(projectId, 'project');
    return this.request<GoalProgressResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/goal-progress`,
    });
  }

  /** Get chronological feed of GitHub-driven goal progress events. */
  async getGoalProgressHistory(projectId: string, limit = 20): Promise<GoalProgressHistoryResponse> {
    validateId(projectId, 'project');
    return this.request<GoalProgressHistoryResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/goal-progress-history?limit=${limit}`,
    });
  }

  /** Get release readiness score and signals. */
  async getReleaseReadiness(projectId: string): Promise<ReleaseReadinessResponse> {
    validateId(projectId, 'project');
    return this.request<ReleaseReadinessResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/release-readiness`,
    });
  }

  /**
   * Get a one-call project health snapshot for agents.
   *
   * Aggregates code quality gate, PR velocity, open PR risk signals, and
   * top issues into a single response. Use as the first call when assigned to
   * a project to understand current state before deciding what to work on.
   */
  async getHealthSnapshot(projectId: string): Promise<HealthSnapshotResponse> {
    validateId(projectId, 'project');
    return this.request<HealthSnapshotResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/health-snapshot`,
    });
  }

  /** Update a GitHub connection's settings (e.g. PR review bot). */
  async updateConnection(
    projectId: string,
    connectionId: string,
    params: UpdateConnectionParams
  ): Promise<GitHubConnection> {
    validateId(projectId, 'project');
    validateId(connectionId, 'connection');
    return this.request<GitHubConnection>({
      method: 'PATCH',
      path: `/projects/${projectId}/github/${connectionId}`,
      body: params,
    });
  }

  /** Generate a narrative summary of recent GitHub activity. */
  async generateNarrative(
    projectId: string,
    options?: { window_days?: number }
  ): Promise<GenerateNarrativeResponse> {
    validateId(projectId, 'project');
    return this.request<GenerateNarrativeResponse>({
      method: 'POST',
      path: `/projects/${projectId}/github/narrative`,
      body: options ?? {},
    });
  }

  /** Get the latest generated narrative for a project. */
  async getLatestNarrative(projectId: string): Promise<LatestNarrativeResponse> {
    validateId(projectId, 'project');
    return this.request<LatestNarrativeResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/narrative`,
    });
  }

  /** Trigger a full backfill scan of a linked GitHub repository. */
  async scanRepo(projectId: string, connectionId: string): Promise<ScanRepoResponse> {
    validateId(projectId, 'project');
    validateId(connectionId, 'connection');
    return this.request<ScanRepoResponse>({
      method: 'POST',
      path: `/projects/${projectId}/github/${connectionId}/scan`,
      body: {},
    });
  }

  /** Remove a GitHub repository link from a project. */
  async deleteConnection(projectId: string, connectionId: string): Promise<void> {
    validateId(projectId, 'project');
    validateId(connectionId, 'connection');
    await this.request<void>({
      method: 'DELETE',
      path: `/projects/${projectId}/github/${connectionId}`,
    });
  }

  // ── Phase 5: Code Quality Scanner + Repo Stats ────────────────────────────

  /** Trigger a code quality scan (Dependabot + code scanning + secret scanning + LLM). */
  async generateCodeImprovements(projectId: string): Promise<ImprovementGenerateResponse> {
    validateId(projectId, 'project');
    return this.request<ImprovementGenerateResponse>({
      method: 'POST',
      path: `/projects/${projectId}/github/improvements/generate`,
      body: {},
    });
  }

  /** List code improvement suggestions with optional filters. */
  async getCodeImprovements(
    projectId: string,
    filters?: CodeImprovementFilters
  ): Promise<CodeImprovementsResponse> {
    validateId(projectId, 'project');
    return this.request<CodeImprovementsResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/improvements`,
      params: filters ? buildParams(filters) : undefined,
    });
  }

  /** Update the status of a code improvement suggestion. */
  async updateCodeImprovementStatus(
    projectId: string,
    suggestionId: string,
    status: ImprovementStatus
  ): Promise<{ suggestion: CodeImprovement }> {
    validateId(projectId, 'project');
    validateId(suggestionId, 'suggestion');
    return this.request<{ suggestion: CodeImprovement }>({
      method: 'PATCH',
      path: `/projects/${projectId}/github/improvements/${suggestionId}`,
      body: { status },
    });
  }

  /** Get priority/category summary counts for open suggestions. */
  async getImprovementsSummary(projectId: string): Promise<{ summary: ImprovementSummaryRow[] }> {
    validateId(projectId, 'project');
    return this.request<{ summary: ImprovementSummaryRow[] }>({
      method: 'GET',
      path: `/projects/${projectId}/github/improvements/summary`,
    });
  }

  /** Get historical code quality metric snapshots. */
  async getImprovementsHistory(projectId: string): Promise<{ history: ImprovementsHistoryItem[] }> {
    validateId(projectId, 'project');
    return this.request<{ history: ImprovementsHistoryItem[] }>({
      method: 'GET',
      path: `/projects/${projectId}/github/improvements/history`,
    });
  }

  /** Fetch live repo stats: stars, languages, contributors, LOC, README preview. */
  async getRepoStats(projectId: string): Promise<RepoStatsResponse> {
    validateId(projectId, 'project');
    return this.request<RepoStatsResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/improvements/stats`,
    });
  }

  /** Push a code quality finding to GitHub Issues and mark it in_progress. */
  async createIssueFromSuggestion(
    projectId: string,
    suggestionId: string
  ): Promise<{ issue: { number: number; url: string; title: string } }> {
    validateId(projectId, 'project');
    validateId(suggestionId, 'suggestion');
    return this.request<{ issue: { number: number; url: string; title: string } }>({
      method: 'POST',
      path: `/projects/${projectId}/github/improvements/${suggestionId}/create-issue`,
    });
  }

  /** Get PR review analytics: approval rate and top reviewers for the last 30 days. */
  async getReviewStats(projectId: string): Promise<ReviewStats> {
    validateId(projectId, 'project');
    return this.request<ReviewStats>({
      method: 'GET',
      path: `/projects/${projectId}/github/review-stats`,
    });
  }

  /** Get daily commit/PR/issue counts for the last 52 weeks (activity heatmap data). */
  async getWeeklyActivity(projectId: string): Promise<WeeklyActivityDay[]> {
    validateId(projectId, 'project');
    return this.request<WeeklyActivityDay[]>({
      method: 'GET',
      path: `/projects/${projectId}/github/activity/weekly`,
    });
  }

  /** Get technical debt aggregated by category (minutes + hours). */
  async getCodeDebt(projectId: string): Promise<TechnicalDebt> {
    validateId(projectId, 'project');
    return this.request<TechnicalDebt>({ method: 'GET', path: `/projects/${projectId}/github/improvements/debt` });
  }

  /** Evaluate quality gate thresholds — returns pass/fail with per-check detail. */
  async getQualityGate(projectId: string): Promise<QualityGate> {
    validateId(projectId, 'project');
    return this.request<QualityGate>({ method: 'GET', path: `/projects/${projectId}/github/improvements/quality-gate` });
  }

  /** Execute a CQL query over code metrics (files or functions). */
  async queryCode(projectId: string, query: CqlQuery): Promise<CqlResult> {
    validateId(projectId, 'project');
    return this.request<CqlResult>({ method: 'POST', path: `/projects/${projectId}/github/query`, body: query });
  }

  /** Run an agent PR review, posting a structured comment to GitHub. */
  async reviewPR(projectId: string, connectionId: string, prNumber: number, opts: { event?: 'COMMENT' | 'APPROVE' | 'REQUEST_CHANGES'; dryRun?: boolean } = {}): Promise<PRReviewResult> {
    validateId(projectId, 'project');
    return this.request<PRReviewResult>({ method: 'POST', path: `/projects/${projectId}/github/review-pr`, body: { connection_id: connectionId, pr_number: prNumber, event: opts.event ?? 'COMMENT', dry_run: opts.dryRun ?? false } });
  }

  /** Scan arbitrary file content with all SAST + secret scanners (no GitHub auth needed). */
  async scanCode(projectId: string, filePath: string, content: string): Promise<ScanCodeResult> {
    validateId(projectId, 'project');
    return this.request<ScanCodeResult>({ method: 'POST', path: `/projects/${projectId}/github/scan-code`, body: { file_path: filePath, content } });
  }

  /** Create a GitHub PR with agent-authored file changes (up to 50 files). */
  async createPR(projectId: string, opts: { connectionId: string; branchName: string; baseBranch?: string; commitMessage: string; prTitle: string; prBody?: string; changes: Array<{ filePath: string; content: string }> }): Promise<AgentPRResult> {
    validateId(projectId, 'project');
    return this.request<AgentPRResult>({ method: 'POST', path: `/projects/${projectId}/github/create-pr`, body: { connection_id: opts.connectionId, branch_name: opts.branchName, base_branch: opts.baseBranch, commit_message: opts.commitMessage, pr_title: opts.prTitle, pr_body: opts.prBody, changes: opts.changes.map((c) => ({ file_path: c.filePath, content: c.content })) } });
  }

  /** Combined code health snapshot — quality gate, debt, hotspots, smells, languages in one call. */
  async getCodeSummary(projectId: string): Promise<CodeSummaryResult> {
    validateId(projectId, 'project');
    return this.request<CodeSummaryResult>({ method: 'GET', path: `/projects/${projectId}/github/code-summary` });
  }

  /** Structural code clone groups — sets of functions with identical normalised structure. */
  async getCloneGroups(projectId: string): Promise<CloneGroupsResult> {
    validateId(projectId, 'project');
    return this.request<CloneGroupsResult>({ method: 'GET', path: `/projects/${projectId}/github/clone-groups` });
  }

  /** Unused exported symbols in JS/TS files (dead code that can be safely removed). */
  async getDeadExports(projectId: string): Promise<DeadExportsResult> {
    validateId(projectId, 'project');
    return this.request<DeadExportsResult>({ method: 'GET', path: `/projects/${projectId}/github/dead-exports` });
  }

  /** Test file coverage by naming convention — identifies source files without paired tests. */
  async getTestCoverage(projectId: string): Promise<TestCoverageResult> {
    validateId(projectId, 'project');
    return this.request<TestCoverageResult>({ method: 'GET', path: `/projects/${projectId}/github/test-coverage` });
  }

  /** Load-bearing functions — high callerCount functions that are risky to change. */
  async getLoadBearingFunctions(projectId: string, minCallers?: number): Promise<LoadBearingResult> {
    validateId(projectId, 'project');
    const qs = minCallers !== undefined ? `?min_callers=${minCallers}` : '';
    return this.request<LoadBearingResult>({ method: 'GET', path: `/projects/${projectId}/github/load-bearing${qs}` });
  }

  /** Per-file issue density — open suggestions per 1,000 LOC, ranked by density. */
  async getBugDensity(projectId: string): Promise<BugDensityResult> {
    validateId(projectId, 'project');
    return this.request<BugDensityResult>({ method: 'GET', path: `/projects/${projectId}/github/bug-density` });
  }

  /** Active branches derived from commit memories with staleness detection (>14 days without commits). */
  async getActiveBranches(projectId: string): Promise<ActiveBranchesResult> {
    validateId(projectId, 'project');
    return this.request<ActiveBranchesResult>({ method: 'GET', path: `/projects/${projectId}/github/branches` });
  }

  /** Per-contributor PR quality stats — avg score, test coverage %, PR count, last-active date. */
  async getContributorQuality(projectId: string): Promise<ContributorQualityResult> {
    validateId(projectId, 'project');
    return this.request<ContributorQualityResult>({ method: 'GET', path: `/projects/${projectId}/github/contributor-quality` });
  }

  /** Open PRs sorted oldest-first with ageDays + isStale flag (>7 days without update). */
  async getPrAging(projectId: string): Promise<PrAgingResult> {
    validateId(projectId, 'project');
    return this.request<PrAgingResult>({ method: 'GET', path: `/projects/${projectId}/github/pr-aging` });
  }

  /** PR size distribution (Small/Medium/Large/Extra-large) with per-bucket quality + test coverage. */
  async getPrSizeDistribution(projectId: string): Promise<PrSizeDistributionResult> {
    validateId(projectId, 'project');
    return this.request<PrSizeDistributionResult>({ method: 'GET', path: `/projects/${projectId}/github/pr-size-distribution` });
  }

  /** Review turnaround — avg hours from PR open to first review + per-author breakdown. */
  async getReviewTurnaround(projectId: string): Promise<ReviewTurnaroundResult> {
    validateId(projectId, 'project');
    return this.request<ReviewTurnaroundResult>({ method: 'GET', path: `/projects/${projectId}/github/review-turnaround` });
  }

  /** Prioritized work queue — synthesizes all GitHub signals into action items. */
  async getWorkQueue(projectId: string): Promise<WorkQueueResult> {
    validateId(projectId, 'project');
    return this.request<WorkQueueResult>({ method: 'GET', path: `/projects/${projectId}/github/work-queue` });
  }

  /** Reviewer workload — pending review queue and historical speed per reviewer. */
  async getReviewerWorkload(projectId: string): Promise<ReviewerWorkloadResult> {
    validateId(projectId, 'project');
    return this.request<ReviewerWorkloadResult>({ method: 'GET', path: `/projects/${projectId}/github/reviewer-workload` });
  }

  /** Approved-but-not-merged PRs — open PRs with ≥1 approval, ready to ship. */
  async getApprovedPRs(projectId: string): Promise<ApprovedPRsResult> {
    validateId(projectId, 'project');
    return this.request<ApprovedPRsResult>({ method: 'GET', path: `/projects/${projectId}/github/approved-prs` });
  }

  /** Issue backlog health — unassigned/unlabeled counts, label distribution, oldest issues. */
  async getIssueBacklog(projectId: string): Promise<IssueBacklogResult> {
    validateId(projectId, 'project');
    return this.request<IssueBacklogResult>({ method: 'GET', path: `/projects/${projectId}/github/issue-backlog` });
  }

  /** PR review coverage — % of merged PRs (last 90d) that received at least one review, by author. */
  async getReviewCoverage(projectId: string): Promise<ReviewCoverageResult> {
    validateId(projectId, 'project');
    return this.request<ReviewCoverageResult>({ method: 'GET', path: `/projects/${projectId}/github/review-coverage` });
  }

  /**
   * Weekly PR quality score trend — 12-week rolling average from PR brief memories.
   * Returns one data point per week that had at least one reviewed PR.
   * Use this to track whether AI-assisted or human PRs are improving over time.
   */
  async getPrQualityTrend(projectId: string): Promise<PRQualityWeek[]> {
    validateId(projectId, 'project');
    return this.request<PRQualityWeek[]>({ method: 'GET', path: `/projects/${projectId}/github/pr-quality-trend` });
  }
}
