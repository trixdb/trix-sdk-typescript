/**
 * Trix TypeScript SDK
 *
 * Official TypeScript SDK for Trix - A memory and knowledge management API
 *
 * @example
 * ```typescript
 * import { Trix } from '@trixdb/client';
 *
 * const client = new Trix({
 *   apiKey: 'your_api_key',
 *   baseUrl: 'https://api.trixdb.com'
 * });
 *
 * // Create a memory
 * const memory = await client.memories.create({
 *   content: 'Important information to remember',
 *   tags: ['important', 'note']
 * });
 *
 * // Search memories
 * const results = await client.memories.list({
 *   q: 'important',
 *   mode: 'hybrid',
 *   limit: 10
 * });
 *
 * // Create relationship
 * const rel = await client.relationships.create(memory.id, otherMemory.id, {
 *   relationshipType: 'related_to'
 * });
 * ```
 *
 * @packageDocumentation
 */

export {
  Trix,

  SDK_VERSION,
  API_VERSION,
  MIN_API_VERSION,
  MAX_API_VERSION,
  enableDebugLogging,
  disableDebugLogging,
} from './client.js';

// Export all types
export type * from './types.js';

// Export all errors
export * from './errors.js';

// Export utility functions
export { paginateAll, paginateIterator } from './utils/pagination.js';
export { retry } from './utils/retry.js';
export type { RetryOptions } from './utils/retry.js';

// Export file validation utilities
export { MAX_FILE_SIZE, validateFileSize } from './resources/memories/memories.helpers.js';

// Export security utilities
export {
  validateId,
  validateBaseUrl,
  validateWebhookUrl,
  redactSensitiveData,
  getEnvCredential,
  maskCredential,
} from './utils/security.js';

// Export logging utilities
export {
  Logger,
  LogLevel,
  LogFormat,
  setupLogging,
  getLogger,
  getRequestId,
  setRequestId,
  withRequestId,
  logRequest,
  logResponse,
  logError,
} from './utils/logging.js';
export type { LogConfig, LogEntry } from './utils/logging.js';

// Export metrics utilities
export {
  InMemoryCollector,
  NoOpCollector,
  CompositeCollector,
  CallbackCollector,
  RequestTimer,
  getMetricsCollector,
  setMetricsCollector,
  startRequestTimer,
  recordRetry,
  createRequestMetrics,
} from './utils/metrics.js';
export type { MetricsCollector, RequestMetrics } from './utils/metrics.js';

// Export telemetry utilities (OpenTelemetry integration)
export {
  configureTelemetry,
  getTelemetryConfig,
  isTelemetryEnabled,
  createRequestSpan,
  SpanStatusCode,
  SpanKind,
  traced,
  withTracing,
} from './utils/telemetry.js';
export type {
  TelemetryConfig,
  Span,
  Tracer,
  SpanOptions,
  RequestSpan,
} from './utils/telemetry.js';

// Export resources for type declarations
export type {
  Memories,
  Relationships,
  Clusters,
  Spaces,
  Graph,
  Search,
  Webhooks,
  Agent,
  Feedback,
  Highlights,
  Tasks,
  Skills,
  Goals,
  SpaceConfigResource,
  Templates,
  Crews,
  Presets,
} from './resources/index.js';

// GitHub integration (ADR-152)
export { GitHubResource } from './resources/github.js';
export type {
  GitHubConnection,
  GitHubConnectionsResponse,
  LinkRepoParams,
  LinkRepoResponse,
  ActivityMemory,
  ActivityResponse,
  ActivityParams,
  VelocityResponse,
  FlaggedPR,
  FlaggedPRsResponse,
  CycleTimeResponse,
  AgentAttributionResponse,
  LinkedGoal,
  GoalProgressResponse,
  ReleaseReadinessResponse,
  GenerateNarrativeResponse,
  StoredNarrative,
  LatestNarrativeResponse,
  ScanRepoResponse,
  UpdateConnectionParams,
  ChurnFile,
  ChurnFilesResponse,
  FileComplexityMetric,
  FileComplexityResponse,
  QualitySummaryResponse,
  CodeSymbol,
  SymbolsResponse,
  ReleaseReadinessBlocker,
  ReleaseReadinessUnreviewedPR,
  ReleaseReadinessStalePR,
  ReleaseReadinessHotspot,
  CodeImprovement,
  CodeImprovementFilters,
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
  PRTaskAlignmentResult,
  AlignmentEntry,
  AlignmentSignal,
  TestGapResult,
  TestGapPR,
  TestGapAuthor,
  TestGapWeek,
  DORAResult,
  DORArating,
  DORADeployFreqWeek,
  DORALeadTimeWeek,
  DORAcfrWeek,
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
  ReviewDepsResult,
  DependencyVulnerability,
  ChangeImpactResult,
  ChangeImpactFile,
  SemanticDiffResult,
  ExplainCodeParams,
  ExplainCodeResult,
  CodeExplanation,
  SuggestRefactoringParams,
  SuggestRefactoringResult,
  RefactoringSuggestion,
  RefactoringGoal,
  BuildAstQueryParams,
  BuildAstQueryResult,
  AstQueryLanguage,
  ArchitectureConcern,
  ArchitectureReviewResult,
} from './resources/github.js';

// Re-export testing utilities for convenience
// Users can also import directly from '@trixdb/client/testing'
export {
  MockTrix,

  MockMemoriesResource,
  MockClustersResource,
  MockEntitiesResource,
  MockFactsResource,
  createMockMemory,
  createMockCluster,
  createMockRelationship,
  createMockEntity,
  createMockFact,
  createMockPaginatedResponse,
  createMockBulkResult,
} from './testing/index.js';
