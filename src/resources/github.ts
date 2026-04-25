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
  BatchScanFileInput,
  BatchScanCodeResult,
  AnalyzeCodeComplexityResult,
  PreFlightPRResult,
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
  IssueAssigneesResult,
  CommitLeadersResult,
  LabelVelocityResult,
  MilestonesResult,
  HealthSnapshotResponse,
  PRQualityWeek,
  WeekOverWeekResult,
  IssueTriageResult,
  IssueFlowResult,
  IssueCycleTimeResult,
  IssueThroughputResult,
  IssueResolversResult,
  CycleTimeTrendResult,
  PrMergeTimeResult,
  ContributorMomentumResult,
  AgentAuditResult,
  ScopeCreepResult,
  AssigneeCycleTimeResult,
  PRTaskAlignmentResult,
  TestGapResult,
  DORAResult,
  AIvsHumanResult,
  BusFactorResult,
  ReviewNetworkResult,
  ReviewDepthResult,
  PRCodeReviewResult,
  SubmitPRReviewResult,
  QualityGateResult,
  ActionPlanResult,
  TechDebtResult,
  CustomRule,
  CustomRulesResponse,
  CreateCustomRuleParams,
  UpdateCustomRuleParams,
  CustomRuleTestResult,
  ConventionsResult,
  GenerateTestsParams,
  GenerateTestsResult,
  PostReviewFindingsParams,
  PostReviewFindingsResult,
  CreateFixPRParams,
  CreateFixPRResult,
  ReviewDepsResult,
  ChangeImpactResult,
  ExplainCodeParams,
  ExplainCodeResult,
  SuggestRefactoringParams,
  SuggestRefactoringResult,
  BuildAstQueryParams,
  BuildAstQueryResult,
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
  ReleaseReadinessBlocker,
  ReleaseReadinessUnreviewedPR,
  ReleaseReadinessStalePR,
  ReleaseReadinessHotspot,
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
  CqlFromMode,
  AgentPRResult,
  PRReviewResult,
  SecurityFinding,
  DepVuln,
  ScanCodeResult,
  ScanCodeSummary,
  BatchScanFileInput,
  BatchScanCodeResult,
  AnalyzeCodeComplexityResult,
  PreFlightPRResult,
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
  IssueAssigneesResult,
  AssigneeStat,
  CommitLeadersResult,
  CommitLeader,
  LabelVelocityResult,
  LabelVelocity,
  MilestonesResult,
  MilestoneStat,
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
  WeekStat,
  WeekOverWeekResult,
  TriageIssue,
  IssueTriageResult,
  IssueFlowDay,
  IssueFlowResult,
  IssueCycleTimeResult,
  IssueThroughputWeek,
  IssueThroughputResult,
  IssueResolver,
  IssueResolversResult,
  CycleTimeTrendWeek,
  CycleTimeTrendResult,
  MergeTimeBucket,
  MergeTimeAuthor,
  PrMergeTimeResult,
  ContributorMomentum,
  ContributorMomentumResult,
  AgentBreakdown,
  AgentWeeklyTrend,
  AgentAuditResult,
  ScopeCreepSummary,
  ScopeCreepPR,
  ScopeCreepAuthor,
  ScopeCreepWeek,
  ScopeCreepResult,
  AssigneeStatItem,
  AssigneeCycleTimeResult,
  AlignmentSignal,
  AlignmentEntry,
  PRTaskAlignmentSummary,
  PRTaskAlignmentResult,
  TestGapPR,
  TestGapAuthor,
  TestGapWeek,
  TestGapResult,
  DORADeployFreqWeek,
  DORALeadTimeWeek,
  DORAcfrWeek,
  DORArating,
  DORAResult,
  AIvsHumanByAgent,
  AIvsHumanWeek,
  AIvsHumanTopPR,
  AIvsHumanResult,
  BusFactorAtRiskFile,
  BusFactorContributor,
  BusFactorSummary,
  BusFactorResult,
  ReviewEdge,
  ReviewContributor,
  ReviewNetworkResult,
  ReviewDepthSummary,
  ReviewerDepthStat,
  ReviewDepthResult,
  PRCodeReviewResult,
  SubmitPRReviewResult,
  QualityGateResult,
  ActionPlanResult,
  TechDebtResult,
  CustomRule,
  CustomRulesResponse,
  CreateCustomRuleParams,
  UpdateCustomRuleParams,
  CustomRuleTestResult,
  ConventionsResult,
  GenerateTestsParams,
  GenerateTestsResult,
  ReviewFinding,
  PostReviewFindingsParams,
  PostReviewFindingsResult,
  FixSpec,
  CreateFixPRParams,
  CreateFixPRResult,
  ReviewDepsResult,
  ChangeImpactResult,
  DependencyVulnerability,
  ChangeImpactFile,
  SemanticDiffResult,
  ExplainCodeParams,
  ExplainCodeResult,
  SuggestRefactoringParams,
  SuggestRefactoringResult,
  BuildAstQueryParams,
  BuildAstQueryResult,
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

  /** Batch SAST + secret scan up to 20 files — ideal pre-flight check before creating a PR. */
  async batchScanCode(projectId: string, files: BatchScanFileInput[]): Promise<BatchScanCodeResult> {
    validateId(projectId, 'project');
    return this.request<BatchScanCodeResult>({ method: 'POST', path: `/projects/${projectId}/github/batch-scan-code`, body: { files } });
  }

  /** Pre-flight quality gate: SAST+secrets+complexity+design check before creating a PR. */
  async preFlightPR(
    projectId: string,
    changes: Array<{ filePath: string; content: string }>,
  ): Promise<PreFlightPRResult> {
    validateId(projectId, 'project');
    return this.request<PreFlightPRResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/pre-flight-pr`,
      body: { changes: changes.map((c) => ({ file_path: c.filePath, content: c.content })) },
    });
  }

  /** Compute per-function cyclomatic + cognitive complexity and code smells for arbitrary source. */
  async analyzeCodeComplexity(
    projectId: string,
    opts: { filePath: string; content: string; language?: string },
  ): Promise<AnalyzeCodeComplexityResult> {
    validateId(projectId, 'project');
    return this.request<AnalyzeCodeComplexityResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/analyze-complexity`,
      body: { file_path: opts.filePath, content: opts.content, language: opts.language },
    });
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

  /** Issue label velocity — opened vs closed per label over last N days. Worst-accumulating first. */
  async getLabelVelocity(projectId: string, days = 30): Promise<LabelVelocityResult> {
    validateId(projectId, 'project');
    return this.request<LabelVelocityResult>({ method: 'GET', path: `/projects/${projectId}/github/label-velocity?days=${days}` });
  }

  /** Commit leaders — top contributors by commit count over the last N days (7/30/90). */
  async getCommitLeaders(projectId: string, days = 30): Promise<CommitLeadersResult> {
    validateId(projectId, 'project');
    return this.request<CommitLeadersResult>({ method: 'GET', path: `/projects/${projectId}/github/commit-leaders?days=${days}` });
  }

  /** Issue assignee workload — open issue counts per contributor, sorted most overloaded first. */
  async getIssueAssignees(projectId: string): Promise<IssueAssigneesResult> {
    validateId(projectId, 'project');
    return this.request<IssueAssigneesResult>({ method: 'GET', path: `/projects/${projectId}/github/issue-assignees` });
  }

  /** Milestone progress — open/closed issue counts per GitHub milestone, ordered least-complete first. */
  async getMilestones(projectId: string): Promise<MilestonesResult> {
    validateId(projectId, 'project');
    return this.request<MilestonesResult>({ method: 'GET', path: `/projects/${projectId}/github/milestones` });
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

  /**
   * Week-over-week velocity comparison — PRs merged, issues closed, and commits
   * in the current 7-day window vs the previous 7-day window.
   * Each metric includes this-week count, last-week count, delta, and trend direction.
   */
  async getWeekOverWeek(projectId: string): Promise<WeekOverWeekResult> {
    validateId(projectId, 'project');
    return this.request<WeekOverWeekResult>({ method: 'GET', path: `/projects/${projectId}/github/week-over-week` });
  }

  /**
   * Issue triage — recently-opened issues missing labels, assignee, or milestone.
   * @param days Lookback window in days (default 7; options: 7, 14, 30)
   */
  async getIssueTriage(projectId: string, days = 7): Promise<IssueTriageResult> {
    validateId(projectId, 'project');
    return this.request<IssueTriageResult>({ method: 'GET', path: `/projects/${projectId}/github/issue-triage?days=${days}` });
  }

  /**
   * Daily issue open/close flow — backlog burn-down visibility.
   * @param days Lookback window in days (default 30; options: 7-90)
   */
  async getIssueFlow(projectId: string, days = 30): Promise<IssueFlowResult> {
    validateId(projectId, 'project');
    return this.request<IssueFlowResult>({ method: 'GET', path: `/projects/${projectId}/github/issue-flow?days=${days}` });
  }

  async getIssueCycleTime(projectId: string, days = 90): Promise<IssueCycleTimeResult> {
    validateId(projectId, 'project');
    return this.request<IssueCycleTimeResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/issue-cycle-time?days=${days}`,
    });
  }

  /**
   * Weekly closed issue throughput — delivery trend over last N weeks.
   * @param weeks Lookback window in weeks (default 8; range: 2-26)
   */
  async getIssueThroughput(projectId: string, weeks = 8): Promise<IssueThroughputResult> {
    validateId(projectId, 'project');
    return this.request<IssueThroughputResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/issue-throughput?weeks=${weeks}`,
    });
  }

  /**
   * Issue resolver leaderboard — top contributors by closed issue count.
   * @param days Lookback window in days (default 30; range: 7-90)
   */
  async getIssueResolvers(projectId: string, days = 30): Promise<IssueResolversResult> {
    validateId(projectId, 'project');
    return this.request<IssueResolversResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/issue-resolvers?days=${days}`,
    });
  }

  /**
   * Weekly average issue cycle time trend — are we getting faster or slower?
   * @param weeks Lookback window in weeks (default 8; range: 2-26)
   */
  async getCycleTimeTrend(projectId: string, weeks = 8): Promise<CycleTimeTrendResult> {
    validateId(projectId, 'project');
    return this.request<CycleTimeTrendResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/cycle-time-trend?weeks=${weeks}`,
    });
  }

  async getPrMergeTime(projectId: string, days = 90): Promise<PrMergeTimeResult> {
    validateId(projectId, 'project');
    return this.request<PrMergeTimeResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/pr-merge-time?days=${days}`,
    });
  }

  async getContributorMomentum(projectId: string, days = 28): Promise<ContributorMomentumResult> {
    validateId(projectId, 'project');
    return this.request<ContributorMomentumResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/contributor-momentum?days=${days}`,
    });
  }

  async getAgentAuditTrail(projectId: string, days = 90): Promise<AgentAuditResult> {
    validateId(projectId, 'project');
    return this.request<AgentAuditResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/agent-audit?days=${days}`,
    });
  }

  async getScopeCreep(projectId: string, days = 90): Promise<ScopeCreepResult> {
    validateId(projectId, 'project');
    return this.request<ScopeCreepResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/scope-creep?days=${days}`,
    });
  }

  async getAssigneeCycleTime(projectId: string, days = 90): Promise<AssigneeCycleTimeResult> {
    validateId(projectId, 'project');
    return this.request<AssigneeCycleTimeResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/assignee-cycle-time?days=${days}`,
    });
  }

  /** Detect semantic drift between PRs and the issues they claim to address. */
  async getPRTaskAlignment(projectId: string, days = 90): Promise<PRTaskAlignmentResult> {
    validateId(projectId, 'project');
    return this.request<PRTaskAlignmentResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/pr-task-alignment?days=${days}`,
    });
  }

  /** Test coverage gap — PRs merged without test changes, by author and week. */
  async getTestGap(projectId: string, days = 90): Promise<TestGapResult> {
    validateId(projectId, 'project');
    return this.request<TestGapResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/test-gap?days=${days}`,
    });
  }

  /** DORA engineering excellence metrics — deploy frequency, lead time, CFR, MTTR. */
  async getDORAMetrics(projectId: string, days = 90): Promise<DORAResult> {
    validateId(projectId, 'project');
    return this.request<DORAResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/dora-metrics?days=${days}`,
    });
  }

  /** Compare PR quality scores between AI-authored and human-authored PRs. */
  async getAIvsHumanQuality(projectId: string, days = 90): Promise<AIvsHumanResult> {
    validateId(projectId, 'project');
    return this.request<AIvsHumanResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/ai-vs-human-quality?days=${days}`,
    });
  }

  /** Identify knowledge concentration risk — repos and files dominated by a single contributor. */
  async getBusFactor(projectId: string, days = 90): Promise<BusFactorResult> {
    validateId(projectId, 'project');
    return this.request<BusFactorResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/bus-factor?days=${days}`,
    });
  }

  /** Map team code review collaboration — who reviews whose code, silo detection. */
  async getReviewNetwork(projectId: string, days = 90): Promise<ReviewNetworkResult> {
    validateId(projectId, 'project');
    return this.request<ReviewNetworkResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/review-network?days=${days}`,
    });
  }

  /** Reviewer thoroughness analytics — scrutiny rate, rubber-stamp vs rigorous reviewers. */
  async getReviewDepth(projectId: string, days = 90): Promise<ReviewDepthResult> {
    validateId(projectId, 'project');
    return this.request<ReviewDepthResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/review-depth?days=${days}`,
    });
  }

  /** AST-level PR code review — quality score (0-100), grade (A-F), smells, security findings. */
  async reviewPRCode(
    projectId: string,
    prNumber: number,
    options: { repoFullName?: string; format?: boolean } = {},
  ): Promise<PRCodeReviewResult> {
    validateId(projectId, 'project');
    return this.request<PRCodeReviewResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/pr-review`,
      body: { prNumber, ...options },
    });
  }

  /** Post AST-level PR review with inline comments directly to GitHub. */
  async submitPRReview(
    projectId: string,
    prNumber: number,
    options: { repoFullName?: string; dryRun?: boolean } = {},
  ): Promise<SubmitPRReviewResult> {
    validateId(projectId, 'project');
    return this.request<SubmitPRReviewResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/pr-submit-review`,
      body: { prNumber, ...options },
    });
  }

  /** Evaluate a PR against a quality gate — returns PASSED/FAILED with condition breakdown. */
  async checkPRQualityGate(
    projectId: string,
    prNumber: number,
    options: {
      repoFullName?: string;
      gate?: 'strict' | 'standard' | 'relaxed' | Record<string, unknown>;
      postStatus?: boolean;
    } = {},
  ): Promise<QualityGateResult> {
    validateId(projectId, 'project');
    return this.request<QualityGateResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/pr-quality-gate`,
      body: { prNumber, ...options },
    });
  }

  /** Ranked code improvement action plan — SAST findings, worst functions, uncovered hotspots. */
  async getActionPlan(projectId: string): Promise<ActionPlanResult> {
    validateId(projectId, 'project');
    return this.request<ActionPlanResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/action-plan`,
    });
  }

  /** SonarQube-style technical debt breakdown by category with remediation estimate and grade. */
  async getTechDebt(projectId: string): Promise<TechDebtResult> {
    validateId(projectId, 'project');
    return this.request<TechDebtResult>({
      method: 'GET',
      path: `/projects/${projectId}/github/tech-debt`,
    });
  }

  /** List all user-defined tree-sitter SAST rules for a project. */
  async listCustomRules(projectId: string): Promise<CustomRulesResponse> {
    validateId(projectId, 'project');
    return this.request<CustomRulesResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/custom-rules`,
    });
  }

  /** Create a user-defined tree-sitter SAST rule. */
  async createCustomRule(projectId: string, params: CreateCustomRuleParams): Promise<CustomRule> {
    validateId(projectId, 'project');
    return this.request<CustomRule>({
      method: 'POST',
      path: `/projects/${projectId}/github/custom-rules`,
      body: params,
    });
  }

  /** Update fields on an existing custom rule. */
  async updateCustomRule(projectId: string, ruleId: string, params: UpdateCustomRuleParams): Promise<CustomRule> {
    validateId(projectId, 'project');
    validateId(ruleId, 'rule');
    return this.request<CustomRule>({
      method: 'PATCH',
      path: `/projects/${projectId}/github/custom-rules/${ruleId}`,
      body: params,
    });
  }

  /** Delete a custom rule permanently. */
  async deleteCustomRule(projectId: string, ruleId: string): Promise<void> {
    validateId(projectId, 'project');
    validateId(ruleId, 'rule');
    return this.request<void>({
      method: 'DELETE',
      path: `/projects/${projectId}/github/custom-rules/${ruleId}`,
    });
  }

  /** Run a custom rule against the top hotspot files and return matches. */
  async testCustomRule(projectId: string, ruleId: string): Promise<CustomRuleTestResult> {
    validateId(projectId, 'project');
    validateId(ruleId, 'rule');
    return this.request<CustomRuleTestResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/custom-rules/${ruleId}/test`,
    });
  }

  /** Detect project coding conventions from indexed symbol and metrics data. */
  async detectConventions(projectId: string): Promise<ConventionsResult> {
    validateId(projectId, 'project');
    return this.request<ConventionsResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/conventions`,
      body: {},
    });
  }

  /** Generate LLM-powered tests for a file using tree-sitter function extraction. */
  async generateTests(projectId: string, params: GenerateTestsParams): Promise<GenerateTestsResult> {
    validateId(projectId, 'project');
    return this.request<GenerateTestsResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/generate-tests`,
      body: params,
    });
  }

  /** Post LLM findings from agentReviewPR as a real GitHub PR review with inline comments. */
  async postReviewFindings(projectId: string, params: PostReviewFindingsParams): Promise<PostReviewFindingsResult> {
    validateId(projectId, 'project');
    return this.request<PostReviewFindingsResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/post-findings`,
      body: params,
    });
  }

  /** Create a PR that auto-applies line-range fixes to repository files. */
  async createFixPR(projectId: string, params: CreateFixPRParams): Promise<CreateFixPRResult> {
    validateId(projectId, 'project');
    return this.request<CreateFixPRResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/fix-pr`,
      body: params,
    });
  }

  /** Audit PR dependency changes for CVEs via npm advisory and OSV APIs. */
  async reviewDependencyChanges(
    projectId: string,
    prNumber: number,
    repoFullName: string,
  ): Promise<ReviewDepsResult> {
    validateId(projectId, 'project');
    return this.request<ReviewDepsResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/review-deps`,
      body: { pr_number: prNumber, repo_full_name: repoFullName },
    });
  }

  /** Analyze blast radius of PR changes via semantic diff, hotspot scores, and caller counts. */
  async analyzeChangeImpact(
    projectId: string,
    prNumber: number,
    repoFullName: string,
    options: { max_files?: number } = {},
  ): Promise<ChangeImpactResult> {
    validateId(projectId, 'project');
    return this.request<ChangeImpactResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/change-impact`,
      body: { pr_number: prNumber, repo_full_name: repoFullName, ...options },
    });
  }

  /** Explain a specific function using tree-sitter extraction and LLM analysis. */
  async explainCode(projectId: string, params: ExplainCodeParams): Promise<ExplainCodeResult> {
    validateId(projectId, 'project');
    return this.request<ExplainCodeResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/explain-code`,
      body: params,
    });
  }

  /** Suggest goal-directed LLM refactoring for a function. */
  async suggestRefactoring(
    projectId: string,
    params: SuggestRefactoringParams,
  ): Promise<SuggestRefactoringResult> {
    validateId(projectId, 'project');
    return this.request<SuggestRefactoringResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/suggest-refactoring`,
      body: params,
    });
  }

  /** Convert a natural language code pattern description into a tree-sitter S-expression query. */
  async buildAstQuery(
    projectId: string,
    params: BuildAstQueryParams,
  ): Promise<BuildAstQueryResult> {
    validateId(projectId, 'project');
    return this.request<BuildAstQueryResult>({
      method: 'POST',
      path: `/projects/${projectId}/github/build-ast-query`,
      body: params,
    });
  }
}
