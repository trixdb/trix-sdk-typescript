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

export interface ReleaseReadinessSignals {
  open_prs: number;
  blocking_tasks: number;
  goal_completion_pct: number;
  scope_creep_prs: number;
}

export interface ReleaseReadinessDetails {
  open_prs: Array<{ title?: string; url?: string; author?: string; number?: number }>;
  blocking_tasks: Array<{ title: string; priority: number }>;
  scope_creep_prs: Array<{ title?: string; url?: string; changedFiles?: number }>;
}

export interface ReleaseReadinessResponse {
  score: number;
  ready: boolean;
  signals: ReleaseReadinessSignals;
  details: ReleaseReadinessDetails;
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
export interface CqlQuery { from?: 'files' | 'functions' | 'suggestions'; where?: Record<string, Record<string, string | number>>; orderBy?: string; orderDir?: 'asc' | 'desc'; limit?: number; }
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
}
