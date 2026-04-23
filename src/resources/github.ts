/**
 * GitHub project integration resource (ADR-152).
 *
 * Provides access to GitHub repository connections, activity memories,
 * file churn analysis, code quality summaries, and symbol search.
 */

import type { Trix } from '../client.js';
import { BaseResource, buildParams } from './base.js';
import { validateId } from '../utils/security.js';

// ── Types ──────────────────────────────────────────────────────────────────

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
  type?: 'commit' | 'pull_request' | 'issue' | 'all';
  limit?: number;
  offset?: number;
}

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

export interface QualitySummaryResponse {
  summary: {
    total_files_tracked: number;
    hotspot_count: number;
    hotspot_ratio: number;
  };
  top_hotspots: ChurnFile[];
}

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
}
