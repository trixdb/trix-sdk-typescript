/**
 * Type definitions for the GitHub integration resource (ADR-152).
 * Phases 1–5: connections, activity, churn, quality, code improvements, repo stats.
 */

// ── Connections ────────────────────────────────────────────────────────────

export interface GitHubConnection {
  id: string;
  project_id: string;
  repo_full_name: string;
  webhook_active: boolean;
  sync_commits: boolean;
  sync_pull_requests: boolean;
  sync_issues: boolean;
  last_webhook_at?: string;
}

export interface GitHubConnectionsResponse {
  connections: GitHubConnection[];
  count: number;
}

export interface LinkRepoParams {
  connection_id: string;
  repo_id: string;
  repo_full_name: string;
}

export interface LinkRepoResponse {
  connection: GitHubConnection;
  webhook_url: string;
  webhook_secret: string;
}

export interface UpdateConnectionParams {
  pr_review_bot_enabled?: boolean;
  sync_commits?: boolean;
  sync_pull_requests?: boolean;
  sync_issues?: boolean;
}

// ── Activity ───────────────────────────────────────────────────────────────

export interface ActivityMemory {
  id: string;
  content: string;
  type: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityResponse {
  memories: ActivityMemory[];
  total: number;
  count: number;
}

export interface ActivityParams {
  type?: 'commit' | 'pull_request' | 'issue' | 'pr_brief' | 'all';
  limit?: number;
  offset?: number;
}

// ── Churn & Complexity ─────────────────────────────────────────────────────

export interface ChurnFile {
  file_path: string;
  repo_full_name: string;
  touch_count: number;
  last_touched_at: string;
}

export interface ChurnFilesResponse {
  files: ChurnFile[];
  count: number;
}

export interface FunctionComplexityMetric {
  name: string;
  start_line: number;
  end_line: number;
  loc: number;
  cyclomatic: number;
  cognitive: number;
  /** Number of files in the scan set that call this function (load-bearing indicator) */
  caller_count?: number;
  /** Number of structurally identical functions detected across the codebase */
  clone_count?: number;
  clone_hash?: string;
  clone_partners?: string[];
}

export interface FileComplexityMetric {
  file_path: string;
  repo_full_name: string;
  language?: string;
  cyclomatic_complexity?: number;
  cognitive_complexity?: number;
  loc?: number;
  hotspot_score?: number;
  complexity_level?: 'ok' | 'warning' | 'critical';
  computed_at?: string;
  /** Per-function breakdown with CC, CogC, LOC, callerCount, cloneCount */
  functions?: FunctionComplexityMetric[];
  /** Exported symbols never imported in the scanned file set (dead code candidates) */
  unused_exports?: string[];
  /** Test coverage pairing result by filename convention */
  test_coverage?: { status: 'covered' | 'uncovered' | 'unknown'; test_file: string | null };
}

export interface FileComplexityResponse {
  files: FileComplexityMetric[];
  count: number;
}

export interface QualitySummaryResponse {
  summary: {
    total_files_tracked: number;
    hotspot_count: number;
    hotspot_ratio: number;
  };
  top_hotspots: ChurnFile[];
}

// ── Symbols ────────────────────────────────────────────────────────────────

export interface CodeSymbol {
  file_path: string;
  repo_full_name: string;
  symbol_name: string;
  symbol_kind: string;
  line_start?: number;
  language?: string;
  churn_score: number;
}

export interface SymbolsResponse {
  symbols: CodeSymbol[];
  count: number;
}

// ── Analytics (Phase 3–4) ──────────────────────────────────────────────────

export interface VelocityResponse {
  merged_last_7_days: number;
  merged_last_30_days: number;
  avg_cycle_time_hours: number | null;
  avg_cycle_time_days: number | null;
}

export interface FlaggedPR {
  id: string;
  summary: string;
  flags: string[];
  created_at: string;
}

export interface FlaggedPRsResponse {
  prs: FlaggedPR[];
}

export interface PRBrief {
  id: string;
  prNumber: number | null;
  prUrl: string | null;
  repo: string | null;
  title: string;
  briefContent: string;
  riskFlags: string[];
  qualityScore: number | null;
  /** AI assistant that authored this PR, or null for human-authored PRs. */
  agent: 'claude' | 'copilot' | 'cursor' | 'gemini' | null;
  isOpen: boolean;
  hasTests: boolean;
  touchesHotspots: boolean;
  touchesLoadBearing: boolean;
  touchesClones: boolean;
  scopeCreep: boolean;
  semanticDrift: boolean;
  createdAt: string;
}

export interface PRBriefsResponse {
  briefs: PRBrief[];
  total: number;
  state: 'open' | 'closed' | 'all';
}

export interface CycleTimeResponse {
  avg_cycle_days_last_30: number | null;
  avg_cycle_days_30_60: number | null;
  avg_open_age_days: number | null;
  open_issue_count: number;
  closed_last_30: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface AgentAttributionResponse {
  total_commits: number;
  total_prs: number;
  agent_breakdown: Record<string, number>;
  agent_total: number;
  human_total: number;
  agent_ratio: number;
  /** Average PR quality score (0-100) per AI tool, keyed by agent name */
  agent_quality_scores: Record<string, number | null>;
  /** Average PR quality score (0-100) for human-authored PRs */
  human_avg_quality: number | null;
}

export interface LinkedGoal {
  id: string;
  title: string;
  progress: number;
  status: string;
  progress_type: string;
  last_github_progress: number | null;
  last_github_updated_at: string | null;
}

export interface GoalProgressResponse {
  goals: LinkedGoal[];
}

export interface GoalProgressEvent {
  id: string;
  goal_id: string;
  goal_title: string;
  goal_status: string;
  previous_progress: number;
  new_progress: number;
  note: string | null;
  created_at: string;
}

export interface GoalProgressHistoryResponse {
  history: GoalProgressEvent[];
}

export interface ReleaseReadinessBlocker {
  issueNumber: string;
  title: string;
  url: string;
  author: string;
  labels: string[];
  ageDays: number;
}

export interface ReleaseReadinessUnreviewedPR {
  prNumber: string;
  title: string;
  url: string;
  author: string;
  ageDays: number;
  requestedReviewers: string[];
}

export interface ReleaseReadinessStalePR {
  prNumber: string;
  title: string;
  url: string;
  author: string;
  ageDays: number;
}

export interface ReleaseReadinessHotspot {
  filePath: string;
  repo: string;
  hotspotScore: number;
}

export interface ReleaseReadinessResponse {
  readinessScore: number;
  openIssues: { count: number; blockerCount: number; blockers: ReleaseReadinessBlocker[] };
  openPRs: {
    count: number;
    unreviewedCount: number;
    staleCount: number;
    unreviewed: ReleaseReadinessUnreviewedPR[];
    stalePRs: ReleaseReadinessStalePR[];
  };
  recentMerges: { count: number };
  topHotspots: ReleaseReadinessHotspot[];
}

export interface ScanRepoResponse {
  scanned: boolean;
  commits: number;
  prs: number;
  issues: number;
  files: number;
  hotspots: number;
  pr_briefs: number;
  errors?: string[];
}

export interface GenerateNarrativeResponse {
  narrative: string;
  stored: boolean;
  window_days: number;
}

export interface StoredNarrative {
  id: string;
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface LatestNarrativeResponse {
  narrative: StoredNarrative | null;
}

// ── Phase 5: Code Quality Scanner ─────────────────────────────────────────

export type ImprovementCategory = 'dependency' | 'security' | 'performance' | 'refactor' | 'maintenance';
export type ImprovementPriority = 'critical' | 'high' | 'medium' | 'low';
export type ImprovementStatus = 'open' | 'dismissed' | 'in_progress' | 'resolved';

export interface CodeImprovementFilters {
  category?: ImprovementCategory;
  priority?: ImprovementPriority;
  status?: ImprovementStatus;
  /** Filter by file path substring, e.g. "src/auth" returns all findings in that directory. */
  file_path?: string;
}

export interface CodeImprovement {
  id: string;
  category: ImprovementCategory;
  priority: ImprovementPriority;
  title: string;
  description: string;
  file_path: string | null;
  evidence: Record<string, unknown>;
  status: ImprovementStatus;
  generated_by: 'rule' | 'llm';
  generated_at: string;
}

export interface CodeImprovementsResponse { suggestions: CodeImprovement[]; }
export interface ImprovementGenerateResponse { generated: number; repo: string; }
export interface ImprovementSummaryRow {
  category: ImprovementCategory;
  priority: ImprovementPriority;
  cnt: string;
}
export interface ImprovementsHistoryItem {
  id: string;
  snapshotted_at: string;
  suggestion_count: number;
  critical_count: number;
  warning_count: number;
  total_files: number;
  hotspot_count: number;
}

export interface RepoLanguage { name: string; bytes: number; pct: number; }
export interface RepoContributor { login: string; avatarUrl: string; profileUrl: string; contributions: number; }

export interface RepoStatsResponse {
  stats: {
    repo: {
      fullName: string;
      description: string | null;
      stars: number;
      forks: number;
      openIssues: number;
      primaryLanguage: string | null;
      license: string | null;
      topics: string[];
      defaultBranch: string;
      isPrivate: boolean;
      sizeKb: number;
    } | null;
    languages: RepoLanguage[];
    contributors: RepoContributor[];
    readme: string | null;
    openPRCount: number | null;
    localMetrics: {
      analyzedFiles: number;
      totalLoc: number;
      hotspotCount: number;
      criticalFiles: number;
      warningFiles: number;
    };
  };
}


export interface ReviewerStat {
  reviewer: string;
  total: number;
  approvals: number;
  changesRequested: number;
}

export interface ReviewStats {
  totalReviews: number;
  totalApprovals: number;
  totalChangesRequested: number;
  approvalRate: number | null;
  topReviewers: ReviewerStat[];
}

export interface WeeklyActivityDay {
  day: string; // ISO date YYYY-MM-DD
  commits: number;
  prs: number;
  issues: number;
  total: number;
}

export interface DebtCategory { category: string; count: number; minutes: number; }
export interface TechnicalDebt { totalMinutes: number; totalHours: number; byCategory: DebtCategory[]; }
export interface QualityCheck { id: string; label: string; passed: boolean; value: number | null; threshold: number; unit?: string; }
export interface QualityGate { passed: boolean; checks: QualityCheck[]; score: number; }

export interface PRQualityWeek {
  /** ISO date (YYYY-MM-DD) for the Monday of this week. */
  week_start: string;
  /** Average PR quality score (0-100) for all reviewed PRs that week. */
  avg_quality: number;
  /** Number of PRs with a quality score that week. */
  pr_count: number;
}
export type CqlFromMode =
  | 'files'
  | 'functions'
  | 'suggestions'
  | 'ast_pattern'
  | 'hotspots'
  | 'patterns'
  | 'dead_code'
  | 'clones'
  | 'metrics'
  | 'coverage'
  | 'tech_debt'
  | 'symbols'
  | 'summary'
  | 'history'
  | 'file_report'
  | 'worst_functions'
  | 'trend'
  | 'import_cycles'
  | 'security_hotspots'
  | 'action_plan'
  | 'custom_rules'
  | 'contributors'
  | 'test_quality'
  | 'dependencies'
  | 'refactor_candidates';

export interface CqlQuery {
  from?: CqlFromMode;
  where?: Record<string, Record<string, string | number | (string | number)[]>>;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  limit?: number;
  language?: string;
  pattern?: string;
  patterns?: string[];
  risk?: 'high' | 'medium' | 'all';
  /** Sub-mode for contributors: "summary" | "files" | "silos"; for custom_rules: "rules" | "findings" */
  mode?: string;
  /** Lookback days for contributors and history modes */
  days?: number;
  /** Minimum cyclomatic complexity for test_quality mode */
  min_complexity?: number;
  /** Ecosystem filter for dependencies mode: "npm" | "pip" | "go" | "cargo" | "rubygems" | "maven" */
  ecosystem?: string;
}
export interface CqlResult { results: Record<string, unknown>[]; count: number; query: CqlQuery; }
export interface AgentPRResult { prNumber: number; prUrl: string; branchName: string; sha: string; }
export interface SecurityFinding { category: string; priority: string; title: string; description: string; file_path: string | null; evidence: Record<string, unknown>; generated_by: string; }
export interface DepVuln { category: string; priority: 'critical' | 'high' | 'medium' | 'low'; title: string; description: string; file_path: string | null; evidence: { vuln_id: string; package: string; ecosystem: string; cvss: number | null; fix_version: string | null; url: string | null; }; }
export interface PRFileMetric { path: string; cc: number | null; cogc: number | null; mi: number | null; loc: number | null; testCoverage: { status: string } | null; unusedExports: string[]; }
export interface PRReviewResult { review: { body: string; event: string; url: string | null }; qualityScore: number; signals: unknown[]; smells: unknown[]; securityFindings: SecurityFinding[]; depVulns: DepVuln[]; fileMetrics: PRFileMetric[]; inlineComments: number; filesAnalyzed: number; unsupportedFiles: number; posted: boolean; }
export interface ScanCodeSummary { secrets: number; security: number; critical: number; high: number; safe: boolean; }
export interface ScanCodeResult { file_path: string; findings: SecurityFinding[]; summary: ScanCodeSummary; }

// ── Code health analytics (Session 15–16) ────────────────────────────────────

export interface CodeSummaryDebt { totalMinutes: number; totalHours: number; topCategories: Array<{ category: string; count: number; minutes: number }>; }
export interface CodeSummaryHotspot { file_path: string; repo_full_name: string; language: string | null; hotspot_score: number | null; cyclomatic_complexity: number | null; cognitive_complexity: number | null; complexity_level: string | null; loc: number | null; }
export interface CodeSummaryResult { qualityGate: QualityGate; debt: CodeSummaryDebt; hotspots: CodeSummaryHotspot[]; openCounts: { critical: number; high: number; total: number }; topSmells: Array<{ kind: string; count: number }>; languages: Array<{ language: string; files: number; loc: number }>; lastScannedAt: string | null; }

export interface CloneInstance { filePath: string; repoFullName: string; fnName: string; startLine: number | null; loc: number | null; language: string | null; }
export interface CloneGroup { cloneHash: string; instanceCount: number; maxLoc: number | null; instances: CloneInstance[]; }
export interface CloneGroupsResult { groups: CloneGroup[]; totalGroups: number; }

export interface DeadExportFile { filePath: string; repoFullName: string; language: string | null; deadCount: number; symbols: string[]; }
export interface DeadExportsResult { files: DeadExportFile[]; totalFiles: number; totalDeadSymbols: number; }

export interface TestCoverageFile { filePath: string; repoFullName: string; language: string | null; hotspotScore: number | null; cyclomaticComplexity: number | null; testFile: string | null; }
export interface TestCoverageResult { uncovered: TestCoverageFile[]; covered: TestCoverageFile[]; totalFiles: number; uncoveredCount: number; coveredCount: number; coverageRatio: number; }

export interface LoadBearingFunction { filePath: string; repoFullName: string; language: string | null; fnName: string; callerCount: number; cyclomatic: number | null; loc: number | null; startLine: number | null; cloneCount: number; }
export interface LoadBearingResult { functions: LoadBearingFunction[]; count: number; minCallers: number; }

export interface BugDensityFile { filePath: string; repoFullName: string; language: string | null; loc: number; hotspotScore: number | null; issueCount: number; criticalCount: number; highCount: number; densityPerKloc: number; }
export interface BugDensityResult { files: BugDensityFile[]; count: number; }

// ── Issue Cycle Time (Phase 4: Estimation Accuracy) ──────────────────────────

export interface CycleTimeByLabel {
  label: string;
  issueCount: number;
  avgDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
}

export interface IssueCycleTimeResult {
  byLabel: CycleTimeByLabel[];
  lookbackDays: number;
}

// ── Issue Throughput (Phase 4: Delivery Throughput Tracker) ──────────────────

export interface IssueThroughputWeek {
  weekStart: string;
  closedCount: number;
  openedCount: number;
}

export interface IssueThroughputResult {
  weeks: IssueThroughputWeek[];
  avgClosedPerWeek: number;
  trend: 'improving' | 'stable' | 'declining';
  lookbackWeeks: number;
}

// ── Issue Resolver Leaderboard (Phase 4) ─────────────────────────────────────

export interface IssueResolver {
  login: string;
  closedCount: number;
  pct: number;
}

export interface IssueResolversResult {
  resolvers: IssueResolver[];
  totalClosed: number;
  lookbackDays: number;
}

// ── Cycle Time Trend (Phase 4: Estimation Accuracy Tracker) ──────────────────

export interface CycleTimeTrendWeek {
  weekStart: string;
  avgDays: number | null;
  issueCount: number;
}

export interface CycleTimeTrendResult {
  weeks: CycleTimeTrendWeek[];
  trend: 'improving' | 'stable' | 'declining';
  overallAvgDays: number | null;
  lookbackWeeks: number;
}

export interface MergeTimeBucket {
  label: string;
  key: string;
  count: number;
}

export interface MergeTimeAuthor {
  author: string;
  prCount: number;
  avgHours: number | null;
}

export interface PrMergeTimeResult {
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p95: number | null;
  avgHours: number | null;
  totalMerged: number;
  lookbackDays: number;
  distribution: MergeTimeBucket[];
  authorStats: MergeTimeAuthor[];
}

export interface ContributorMomentum {
  author: string;
  recentCommits: number;
  previousCommits: number;
  pctChange: number | null;
  trend: 'accelerating' | 'stable' | 'fading';
}

export interface ContributorMomentumResult {
  contributors: ContributorMomentum[];
  periodDays: number;
}

export interface AgentBreakdown {
  agent: string;
  tag: string;
  label: string;
  count: number;
  pct: number;
}

export interface AgentWeeklyTrend {
  week: string;
  total: number;
  agentCount: number;
  agentPct: number;
}

export interface AgentAuditResult {
  totalPrs: number;
  agentPrs: number;
  agentPct: number;
  lookbackDays: number;
  byAgent: AgentBreakdown[];
  weeklyTrend: AgentWeeklyTrend[];
}

export interface ScopeCreepSummary {
  totalPrs: number;
  scopeCreepCount: number;
  largeCount: number;
  flaggedCount: number;
  flaggedPct: number;
}

export interface ScopeCreepPR {
  title: string;
  author: string;
  url: string;
  repo: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  severity: 'scope_creep' | 'large';
  createdAt: string;
}

export interface ScopeCreepAuthor {
  author: string;
  totalPrs: number;
  scopeCreepCount: number;
  largeCount: number;
  avgFiles: number;
}

export interface ScopeCreepWeek {
  week: string;
  scopeCreepCount: number;
  largeCount: number;
}

export interface ScopeCreepResult {
  summary: ScopeCreepSummary;
  lookbackDays: number;
  topPrs: ScopeCreepPR[];
  byAuthor: ScopeCreepAuthor[];
  weeklyTrend: ScopeCreepWeek[];
}

export interface AssigneeStatItem {
  assignee: string;
  closedCount: number;
  avgDays: number | null;
  prevAvgDays: number | null;
  trend: 'faster' | 'stable' | 'slower';
  pctChange: number | null;
}

export interface AssigneeCycleTimeResult {
  assignees: AssigneeStatItem[];
  teamAvgDays: number | null;
  lookbackDays: number;
}

// ── Health Snapshot (one-call agent summary) ──────────────────────────────────

export interface HealthSnapshotRisk { type: string; label: string; }

export interface HealthSnapshotResponse {
  qualityGate: {
    passed: boolean | null;
    avgMaintainabilityIndex: number | null;
    totalFiles: number;
    criticalFiles: number;
  };
  suggestions: { critical: number; high: number; total: number };
  velocity: { mergedLast7Days: number; mergedLast30Days: number };
  openPRs: { total: number; risky: number; avgQualityScore: number | null };
  topRisks: HealthSnapshotRisk[];
  prQualityTrend: { direction: 'improving' | 'stable' | 'declining' | null; currentAvg: number | null; weekDelta: number | null };
  reviewTurnaround: { avgHours: number | null; unreviewedCount: number };
  urgentItems: { critical: number; urgentTotal: number };
  issueBacklog?: { totalOpen: number; unassignedCount: number };
  reviewCoverage?: { totalMerged: number; coveragePct: number | null; lookbackDays: number };
  issueFlow?: { openedLast7d: number; closedLast7d: number; netFlow7d: number };
  issueThroughput?: { avgPerWeek: number; trend: 'improving' | 'stable' | 'declining' } | null;
  slowestCycleLabel?: { label: string; avgDays: number } | null;
}

// ── Active Branches ───────────────────────────────────────────────────────────

export interface BranchInfo {
  name: string;
  repoFullName: string | null;
  lastCommitAt: string | null;
  commitCount: number;
  openPrNumber: number | null;
  openPrUrl: string | null;
  isDefault: boolean;
  isStale: boolean;
}

export interface ActiveBranchesResult { branches: BranchInfo[]; count: number; }

export interface ContributorQualityStat {
  author: string;
  prCount: number;
  avgQuality: number | null;
  withTestsCount: number;
  testCoveragePct: number;
  avgMergeDays: number | null;
  lastActiveAt: string | null;
  reviewsGiven: number;
  approvals: number;
}

export interface ContributorQualityResult { contributors: ContributorQualityStat[]; count: number; }

export interface OpenPRAging {
  prNumber: number | null;
  title: string | null;
  author: string | null;
  url: string | null;
  repo: string | null;
  headBranch: string | null;
  requestedReviewers: string[];
  openedAt: string | null;
  lastUpdatedAt: string | null;
  ageDays: number;
  isStale: boolean;
  hasReview: boolean;
}

export interface PrAgingResult { prs: OpenPRAging[]; count: number; staleDays: number; }

export interface PRSizeBucket {
  size: string;
  key: string;
  count: number;
  pct: number;
  avg_quality: number | null;
  test_coverage_pct: number;
}

export interface PrSizeDistributionResult {
  distribution: PRSizeBucket[];
  total: number;
}

export interface ReviewAuthorStat {
  author: string;
  reviewedCount: number;
  avgHours: number | null;
  within24hCount: number;
  within24hPct: number;
}

export interface ReviewTurnaroundResult {
  avgHours: number | null;
  reviewedWithin24hPct: number;
  totalReviewed: number;
  unreviewedCount: number;
  authorStats: ReviewAuthorStat[];
}

export type WorkItemPriority = 'critical' | 'high' | 'medium' | 'low';
export type WorkItemType =
  | 'code-suggestion'
  | 'unreviewed-pr'
  | 'risky-pr'
  | 'stale-branch'
  | 'uncovered-hotspot';

export interface WorkQueueItem {
  type: WorkItemType;
  priority: WorkItemPriority;
  title: string;
  detail: string;
  url: string | null;
}

export interface WorkQueueResult {
  items: WorkQueueItem[];
  count: number;
}

export interface ReviewerPendingPR {
  prNumber: number | null;
  title: string | null;
  url: string | null;
}

export interface ReviewerWorkloadStat {
  reviewer: string;
  pendingCount: number;
  avgPendingAgeHours: number | null;
  pendingPrs: ReviewerPendingPR[];
  totalReviews: number;
  approvals: number;
  avgResponseHours: number | null;
}

export interface ReviewerWorkloadResult {
  reviewers: ReviewerWorkloadStat[];
  count: number;
}

export interface ApprovedPR {
  prNumber: number | null;
  title: string | null;
  author: string | null;
  url: string | null;
  repo: string | null;
  ageDays: number;
  approvalCount: number;
  approvers: string[];
  hasChangesRequested: boolean;
}

export interface ApprovedPRsResult {
  prs: ApprovedPR[];
  count: number;
}

export interface IssueLabelCount {
  label: string;
  count: number;
}

export interface BacklogIssue {
  issueNumber: number | null;
  title: string;
  author: string | null;
  url: string | null;
  assignees: string[];
  labels: string[];
  milestone: string | null;
  ageDays: number;
}

export interface IssueBacklogResult {
  totalOpen: number;
  unassignedCount: number;
  unlabeledCount: number;
  oldestAgeDays: number;
  avgAgeDays: number;
  labelDistribution: IssueLabelCount[];
  oldestIssues: BacklogIssue[];
}

export interface AuthorReviewCoverage {
  author: string;
  mergedCount: number;
  reviewedCount: number;
  unreviewedCount: number;
  coveragePct: number;
}

export interface ReviewCoverageResult {
  totalMerged: number;
  reviewedCount: number;
  unreviewedCount: number;
  coveragePct: number | null;
  lookbackDays: number;
  byAuthor: AuthorReviewCoverage[];
}

// ── Label Velocity ────────────────────────────────────────────────────────

export interface LabelVelocity {
  label: string;
  openedCount: number;
  closedCount: number;
  totalCount: number;
  netFlow: number;
}

export interface LabelVelocityResult {
  labels: LabelVelocity[];
  lookbackDays: number;
}

// ── Commit Leaders ────────────────────────────────────────────────────────

export interface CommitLeader {
  author: string;
  commitCount: number;
  activeDays: number;
  repos: number;
}

export interface CommitLeadersResult {
  leaders: CommitLeader[];
  totalCommits: number;
  lookbackDays: number;
}

// ── Issue Assignee Workload ────────────────────────────────────────────────

export interface AssigneeStat {
  assignee: string;
  openCount: number;
  oldestDays: number;
  avgDays: number;
}

export interface IssueAssigneesResult {
  assignees: AssigneeStat[];
  totalAssignees: number;
}

// ── Milestone Progress ─────────────────────────────────────────────────────

export interface MilestoneStat {
  name: string;
  openCount: number;
  closedCount: number;
  totalCount: number;
  progressPct: number;
  predictedDate?: string | null;
}

export interface MilestonesResult {
  milestones: MilestoneStat[];
  totalMilestones: number;
  weeklyCloseRate?: number;
}


// ── Week-over-Week Velocity ───────────────────────────────────────────────────

export interface WeekStat {
  label: string;
  thisWeek: number;
  lastWeek: number;
  delta: number;
  trend: 'up' | 'down' | 'flat';
}

export interface WeekOverWeekResult {
  prs: WeekStat;
  issues: WeekStat;
  commits: WeekStat;
}


// ── Issue Triage ──────────────────────────────────────────────────────────────

export interface TriageIssue {
  issueNumber: string;
  title: string;
  url: string | null;
  repo: string | null;
  author: string | null;
  ageHours: number;
  missing: ('labels' | 'assignee' | 'milestone')[];
}

export interface IssueTriageResult {
  issues: TriageIssue[];
  count: number;
  lookbackDays: number;
}


// ── Issue Flow ────────────────────────────────────────────────────────────────

export interface IssueFlowDay {
  day: string;
  opened: number;
  closed: number;
  net: number;
}

export interface IssueFlowResult {
  data: IssueFlowDay[];
  totalOpened: number;
  totalClosed: number;
  netFlow: number;
  lookbackDays: number;
}

// ── Test Gap Analysis (ADR-152 Phase 4) ──────────────────────────────────────

export interface TestGapPR {
  prNumber: string;
  title: string;
  url: string;
  author: string;
  repo: string;
  agent: string | null;
  createdAt: string;
}

export interface TestGapAuthor {
  author: string;
  totalPRs: number;
  noTestsCount: number;
  hasTestsCount: number;
  noTestsPct: number;
}

export interface TestGapWeek {
  week: string;
  total: number;
  noTestsCount: number;
  noTestsPct: number;
}

export interface TestGapResult {
  summary: {
    totalBriefs: number;
    noTestsCount: number;
    hasTestsCount: number;
    noTestsPct: number;
  };
  topGaps: TestGapPR[];
  byAuthor: TestGapAuthor[];
  weeklyTrend: TestGapWeek[];
  lookbackDays: number;
}

// ── DORA Metrics (ADR-152 Phase 4 extension) ──────────────────────────────────

export type DORArating = 'elite' | 'high' | 'medium' | 'low';

export interface DORADeployFreqWeek { week: string; merges: number; }
export interface DORALeadTimeWeek { week: string; avgHours: number | null; }
export interface DORAcfrWeek { week: string; total: number; failures: number; pct: number; }

export interface DORAResult {
  deploymentFrequency: { perDay: number; perWeek: number; totalMerges: number; rating: DORArating };
  leadTime: { medianHours: number | null; avgHours: number | null; sampleSize: number; rating: DORArating | null };
  changeFailureRate: { pct: number; failureMerges: number; totalMerges: number; rating: DORArating };
  mttr: { medianHours: number | null; sampleSize: number; rating: DORArating | null };
  weeklyTrend: {
    deployFreq: DORADeployFreqWeek[];
    leadTime: DORALeadTimeWeek[];
    changeFailureRate: DORAcfrWeek[];
  };
  lookbackDays: number;
}

// ── AI vs Human Code Quality (ADR-152 Phase 4 Extension) ──────────────────────

export interface AIvsHumanByAgent {
  agent: string;
  avgScore: number;
  prCount: number;
  topScore: number;
}

export interface AIvsHumanWeek {
  week: string;
  aiAvg: number | null;
  humanAvg: number | null;
  aiCount: number;
  humanCount: number;
}

export interface AIvsHumanTopPR {
  prNumber: string;
  title: string;
  url: string;
  author: string;
  agent: string;
  qualityScore: number;
  createdAt: string;
}

export interface AIvsHumanResult {
  summary: {
    aiAvgScore: number | null;
    humanAvgScore: number | null;
    scoreDelta: number | null;
    aiPrCount: number;
    humanPrCount: number;
  };
  byAgent: AIvsHumanByAgent[];
  weeklyTrend: AIvsHumanWeek[];
  topAIPRs: AIvsHumanTopPR[];
  lookbackDays: number;
}

// ── PR–Task Alignment ─────────────────────────────────────────────────────────

export type AlignmentSignal = 'aligned' | 'partial' | 'drifted';

export interface AlignmentEntry {
  prNumber: string;
  prTitle: string;
  prUrl: string;
  author: string;
  issueNumber: string;
  issueTitle: string;
  similarity: number;
  signal: AlignmentSignal;
}

export interface PRTaskAlignmentSummary {
  analyzed: number;
  alignedCount: number;
  partialCount: number;
  driftedCount: number;
  uncheckedCount: number;
}

export interface PRTaskAlignmentResult {
  summary: PRTaskAlignmentSummary;
  drifted: AlignmentEntry[];
  partial: AlignmentEntry[];
  lookbackDays: number;
}

// ── Bus Factor / Knowledge Concentration Risk (ADR-152) ───────────────────────

export interface BusFactorAtRiskFile {
  filePath: string;
  repo: string;
  owner: string;
  ownerPct: number;
  totalCommits: number;
  uniqueAuthors: number;
  hotspotScore: number;
  loc: number;
}

export interface BusFactorContributor {
  contributor: string;
  dominatedRepos: string[];
  avgDominancePct: number;
  totalCommits: number;
}

export interface BusFactorSummary {
  totalRepos: number;
  atRiskRepos: number;
  singleAuthorRepos: number;
  avgAuthorsPerRepo: number;
  threshold: number;
}

export interface BusFactorResult {
  summary: BusFactorSummary;
  atRisk: BusFactorAtRiskFile[];
  byContributor: BusFactorContributor[];
  lookbackDays: number;
}

// ── Review Collaboration Network (ADR-152) ────────────────────────────────────

export interface ReviewEdge {
  reviewer: string;
  author: string;
  reviewCount: number;
}

export interface ReviewContributor {
  name: string;
  reviewsGiven: number;
  reviewsReceived: number;
  uniqueAuthors: number;
  uniqueReviewers: number;
}

export interface ReviewNetworkResult {
  edges: ReviewEdge[];
  contributors: ReviewContributor[];
  lookbackDays: number;
}

export interface ReviewDepthSummary {
  totalReviews: number;
  totalReviewers: number;
  avgScrutinyRate: number;
  rubberstampCount: number;
  rigorousCount: number;
}

export interface ReviewerDepthStat {
  reviewer: string;
  totalReviews: number;
  approvals: number;
  changesRequested: number;
  commentsOnly: number;
  scrutinyRate: number;
  uniquePrs: number;
}

export interface ReviewDepthResult {
  summary: ReviewDepthSummary;
  reviewers: ReviewerDepthStat[];
  lookbackDays: number;
}

export interface PRCodeReviewSmell {
  kind?: string;
  severity?: string;
  filePath?: string;
  line?: number;
  message?: string;
  file?: string;
}

export interface PRCodeReviewSecurityFinding {
  title?: string;
  description?: string;
  file_path?: string;
  line?: number;
  file?: string;
}

export interface PRCodeReviewFindings {
  smells: PRCodeReviewSmell[];
  security: PRCodeReviewSecurityFinding[];
  secrets: unknown[];
}

export interface PRCodeReviewComplexityDelta {
  file: string;
  function: string;
  ccDelta: number;
  locDelta: number;
}

export interface PRCodeReviewResult {
  pr: {
    number: number;
    title: string;
    url: string;
    author?: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  };
  qualityScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  findings: PRCodeReviewFindings;
  structuralDiff: unknown[];
  complexityDeltas: PRCodeReviewComplexityDelta[];
  analyzedFiles: number;
  skippedFiles: number;
  formatted?: {
    body: string;
    event: 'APPROVE' | 'COMMENT' | 'REQUEST_CHANGES';
  };
}

export interface SubmitPRReviewResult {
  reviewId?: number;
  reviewUrl?: string;
  event: 'APPROVE' | 'COMMENT' | 'REQUEST_CHANGES';
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  qualityScore: number;
  analyzedFiles: number;
  inlineComments: number;
  dryRun?: boolean;
}

export interface QualityGateCondition {
  label: string;
  actual: unknown;
  limit: unknown;
  passed: boolean;
  mode: string;
}

export interface QualityGateResult {
  passed: boolean;
  status: 'PASSED' | 'FAILED';
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  qualityScore: number;
  conditions: QualityGateCondition[];
  blockers: QualityGateCondition[];
  prNumber?: number;
  repo?: string;
  analyzedFiles?: number;
}

// ── Batch Scan Code ────────────────────────────────────────────────────────

export interface BatchScanFileInput {
  file_path: string;
  content: string;
}

export interface BatchScanFileSummary {
  secrets: number;
  security: number;
  critical: number;
  high: number;
  filesScanned: number;
  safe: boolean;
  grade: 'A' | 'B' | 'C' | 'F';
}

export interface BatchScanFileResult {
  file_path: string;
  findings: SecurityFinding[];
  secrets: number;
  security: number;
  critical: number;
  high: number;
}

export interface BatchScanCodeResult {
  files: BatchScanFileResult[];
  summary: BatchScanFileSummary;
}

// ── Analyze Code Complexity ────────────────────────────────────────────────

export interface CodeComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  loc: number;
  supported: boolean;
}

export interface CodeSmellItem {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  line?: number;
  function?: string;
}

export interface CodeComplexitySummary {
  functionCount: number;
  smellCount: number;
  critical: number;
  high: number;
  avgCyclomatic: string | null;
}

export interface DesignFinding {
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file_path: string;
  evidence: Record<string, unknown>;
  generated_by: string;
}

export interface AnalyzeCodeComplexityResult {
  file_path: string;
  language: string;
  metrics: CodeComplexityMetrics;
  functions: FunctionComplexityMetric[];
  smells: CodeSmellItem[];
  design: DesignFinding[];
  summary: CodeComplexitySummary & { designIssues: number };
}

export interface PreFlightBlocker {
  type: string;
  file: string;
  message: string;
  count: number;
  findings?: Array<{ title: string; line?: number }>;
}

export interface PreFlightWarning {
  type: string;
  file: string;
  message: string;
  count: number;
  issues?: string[];
}

export interface PreFlightPRResult {
  verdict: 'PASS' | 'WARN' | 'BLOCK';
  safe: boolean;
  blockers: PreFlightBlocker[];
  warnings: PreFlightWarning[];
  summary: { filesChecked: number; secrets: number; security: number; smells: number; design: number };
  files: Array<{ file_path: string; language: string; secrets: number; security: number; smells: number; design: number; cyclomatic: number }>;
}

export type ActionItemType = 'security' | 'performance' | 'refactor' | 'test_coverage' | 'dependency' | 'maintenance';
export type ActionItemPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ActionItem {
  type: ActionItemType;
  priority: ActionItemPriority;
  title: string;
  detail: string;
  file_path: string | null;
  line: number | null;
  score: number;
  metadata: Record<string, unknown>;
}

export interface ActionPlanResult {
  results: ActionItem[];
  count: number;
  breakdown: {
    security: number;
    performance: number;
    refactor: number;
    test_coverage: number;
    dependency: number;
    maintenance: number;
  };
}

export interface TechDebtFindings {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TechDebtCategory {
  category: string;
  count: number;
  fileCount: number;
  findings: TechDebtFindings;
  totalMinutes: number;
  debtLabel: string;
}

export interface TechDebtResult {
  results: TechDebtCategory[];
  count: number;
  totalDebtMinutes: number;
  totalDebtLabel: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ── Custom Rules ───────────────────────────────────────────────────────────

export type CustomRuleLanguage = 'javascript' | 'typescript' | 'python' | 'go' | 'rust' | 'java' | 'csharp' | 'ruby' | 'kotlin' | 'swift';
export type CustomRuleSeverity = 'critical' | 'high' | 'medium' | 'low';
export type CustomRuleCategory = 'security' | 'performance' | 'refactor' | 'maintenance' | 'dependency';

export interface CustomRule {
  id: string;
  project_id: string;
  name: string;
  description: string;
  language: CustomRuleLanguage;
  tree_sitter_query: string;
  severity: CustomRuleSeverity;
  category: CustomRuleCategory;
  message_template: string;
  enabled: boolean;
  run_count: number;
  last_match_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomRulesResponse {
  results: CustomRule[];
  count: number;
}

export interface CreateCustomRuleParams {
  name: string;
  language: CustomRuleLanguage;
  tree_sitter_query: string;
  severity: CustomRuleSeverity;
  category: CustomRuleCategory;
  description?: string;
  message_template?: string;
  enabled?: boolean;
}

export interface UpdateCustomRuleParams {
  name?: string;
  language?: CustomRuleLanguage;
  tree_sitter_query?: string;
  severity?: CustomRuleSeverity;
  category?: CustomRuleCategory;
  description?: string;
  message_template?: string;
  enabled?: boolean;
}

export interface CustomRuleMatch {
  text: string;
  line: number;
  captureName: string;
}

export interface CustomRuleTestHit {
  file_path: string;
  matches: CustomRuleMatch[];
}

export interface CustomRuleTestResult {
  rule: { id: string; name: string; severity: string };
  filesScanned: number;
  matchingFiles: number;
  totalMatches: number;
  hits: CustomRuleTestHit[];
}

// ── detect_conventions ────────────────────────────────────────────────────────

export interface ConventionsResult {
  languages: Array<{ language: string; file_count: number }>;
  naming: Record<string, Array<{ name: string; count: number; pct: number }>>;
  functionSize: {
    medianLoc: number;
    p90Loc: number;
    avgLoc: number;
    totalFunctions: number;
  } | null;
  testPatterns: {
    placement: 'collocated' | 'separate_directory';
    directories: string[];
    suffixPatterns: string[];
    testFileCount: number;
  } | null;
  complexityProfile: {
    medianCc: number;
    p90Cc: number;
    avgCc: number;
  } | null;
  insights: string[];
  dataPoints: number;
}

// ── generate_tests ────────────────────────────────────────────────────────────

export interface GenerateTestsParams {
  repo_full_name: string;
  file_path: string;
  ref?: string;
  test_placement?: 'collocated' | 'separate_directory';
  framework?: string;
}

export interface GenerateTestsResult {
  test_file_path: string;
  test_code: string;
  language: string;
  framework: string;
  function_count: number;
  functions: string[];
}

// ── post_review_findings ──────────────────────────────────────────────────────

export interface ReviewFinding {
  file_path?: string;
  line?: number;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  title?: string;
  description?: string;
  fix_code?: string | null;
}

export interface PostReviewFindingsParams {
  pr_number: number;
  repo_full_name: string;
  findings?: ReviewFinding[];
  grade?: string;
  quality_score?: number;
  gate_verdict?: 'PASS' | 'WARN' | 'BLOCK';
  overall_comment?: string;
  dry_run?: boolean;
}

export interface PostReviewFindingsResult {
  review_url?: string;
  review_id?: number;
  event: 'REQUEST_CHANGES' | 'APPROVE' | 'COMMENT';
  inline_comments: number;
  unmapped_findings: number;
  dryRun?: boolean;
  wouldPost?: { body: string; event: string; inlineComments: number };
}

// ── create_fix_pr ─────────────────────────────────────────────────────────────

export interface FixSpec {
  file_path: string;
  start_line: number;
  end_line: number;
  replacement: string;
  description?: string;
}

export interface CreateFixPRParams {
  repo_full_name: string;
  base_branch?: string;
  branch?: string;
  pr_title?: string;
  fixes: FixSpec[];
}

export interface CreateFixPRResult {
  pr_url: string;
  pr_number: number;
  branch: string;
  files_patched: number;
  fixes_applied: number;
}

// ── review_dependency_changes ─────────────────────────────────────────────────

export interface DependencyVulnerability {
  package: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  manifest: string;
  cve_id: string | null;
  cvss: number | null;
  fix_available: boolean;
  fix_version: string | null;
  ecosystem: string | null;
}

export interface ReviewDepsResult {
  manifests_changed: Array<{
    manifest: string;
    ecosystem: string;
    added: string[];
    bumped: string[];
  }>;
  vulnerabilities: DependencyVulnerability[];
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

// ── analyze_change_impact ─────────────────────────────────────────────────────

export interface SemanticDiffResult {
  supported: boolean;
  added_functions: string[];
  removed_functions: string[];
  modified_functions: Array<{
    name: string;
    cc_delta: number;
    head_cc: number;
    loc_delta: number;
  }>;
}

export interface ChangeImpactFile {
  file_path: string;
  status: string;
  additions: number;
  deletions: number;
  risk: 'critical' | 'high' | 'medium' | 'low';
  caller_count: number;
  hotspot_score: number | null;
  complexity_level: string | null;
  cyclomatic_complexity: number | null;
  semantic_diff: SemanticDiffResult | null;
  review_focus: string[];
}

export interface ChangeImpactResult {
  overall_risk: 'critical' | 'high' | 'medium' | 'low';
  files_analyzed: number;
  high_risk_files: number;
  files: ChangeImpactFile[];
  review_priority: string[];
  summary: string;
}

// ── explain_code ──────────────────────────────────────────────────────────────

export interface ExplainCodeParams {
  repo_full_name: string;
  file_path: string;
  function_name: string;
  ref?: string;
}

export interface CodeExplanation {
  purpose: string;
  inputs: string[];
  outputs: string;
  key_logic: string[];
  edge_cases: string[];
  potential_issues: string[];
  complexity_notes: string;
}

export interface ExplainCodeResult {
  file_path: string;
  function_name: string;
  language: string;
  ref: string;
  cyclomatic_complexity: number | null;
  explanation: CodeExplanation;
  code_snippet: string;
}

// ── suggest_refactoring ───────────────────────────────────────────────────────

export type RefactoringGoal =
  | 'reduce_complexity'
  | 'extract_helpers'
  | 'improve_readability'
  | 'fix_smell'
  | 'improve_performance';

export interface SuggestRefactoringParams {
  repo_full_name: string;
  file_path: string;
  function_name: string;
  ref?: string;
  goals?: RefactoringGoal[];
  context?: string;
}

export interface RefactoringSuggestion {
  refactored_code: string;
  helpers_needed: string[];
  changes_summary: string;
  estimated_cc_reduction: number | null;
  rationale: string;
  risks: string[];
}

export interface SuggestRefactoringResult {
  file_path: string;
  function_name: string;
  language: string;
  ref: string;
  original_metrics: { cyclomatic: number | null; cognitive: number | null; loc: number | null };
  original_start_line: number;
  goals_applied: RefactoringGoal[];
  suggestion: RefactoringSuggestion;
  fix_pr_hint: {
    file_path: string;
    start_line: number;
    end_line: number;
    replacement: string;
    description: string;
  };
}

// ── build_ast_query ───────────────────────────────────────────────────────────

export type AstQueryLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'ruby'
  | 'kotlin';

export interface BuildAstQueryParams {
  description: string;
  language?: AstQueryLanguage;
  example_code?: string;
  file_path_filter?: string;
}

export interface BuildAstQueryResult {
  description: string;
  language: AstQueryLanguage;
  pattern: string;
  capture_name: string;
  explanation: string;
  caveats: string[];
  example_matches: string[];
  cql_payload: {
    from: 'ast_pattern';
    pattern: string;
    language: AstQueryLanguage;
    where?: Record<string, unknown>;
  };
  usage_hint: string;
}
