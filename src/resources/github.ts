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
  CycleTimeResponse,
  AgentAttributionResponse,
  GoalProgressResponse,
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
  CycleTimeResponse,
  AgentAttributionResponse,
  LinkedGoal,
  GoalProgressResponse,
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
} from './github-types.js';

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

  /** Get release readiness score and signals. */
  async getReleaseReadiness(projectId: string): Promise<ReleaseReadinessResponse> {
    validateId(projectId, 'project');
    return this.request<ReleaseReadinessResponse>({
      method: 'GET',
      path: `/projects/${projectId}/github/release-readiness`,
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
}
