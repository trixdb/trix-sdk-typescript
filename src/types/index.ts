/**
 * Type definitions for the Trix SDK.
 *
 * This module re-exports all types from domain-specific modules,
 * maintaining backward compatibility with the original types.ts file.
 *
 * Types are organized into logical modules:
 * - common.types.ts: Configuration, pagination, bulk operations
 * - memory.types.ts: Memory entities and parameters
 * - transcript.types.ts: Transcript and audio types
 * - relationship.types.ts: Relationship types
 * - cluster.types.ts: Cluster types
 * - space.types.ts: Space types
 * - graph.types.ts: Graph traversal types
 * - search.types.ts: Search configuration and options
 * - webhook.types.ts: Webhook types
 * - session.types.ts: Session types (legacy and CLI)
 * - fact.types.ts: Fact (knowledge graph triple) types
 * - entity.types.ts: Named entity types
 * - enrichment.types.ts: Enrichment and topic types
 * - resource.types.ts: Resource (project/topic grouping) types
 * - feedback.types.ts: Feedback types
 * - highlight.types.ts: Highlight types
 * - image.types.ts: Image and visual search types
 */

// Common types
export type {
  TrixConfig,
  PaginatedResponse,
  PaginationParams,
  SortParams,
  BulkResult,
  BaseEntity,
  BaseEntityWithMetadata,
  TestResult,
  JobStatus,
  Job,
} from './common.types.js';

// Memory types
export type {
  MemoryType,
  OriginType,
  SourceType,
  ResourceRelationshipType,
  ProtectionLevel,
  MemoryOriginContext,
  MemoryProtectionFields,
  Memory,
  CreateMemoryParams,
  UpdateMemoryParams,
  ListMemoriesParams,
  MemoryConfig,
  MemoryStatsParams,
  MemoryStats,
} from './memory.types.js';

// Transcript types
export type {
  TimestampRange,
  ContentSafetyLabel,
  WordTimestamp,
  TranscriptSegment,
  TranscriptEntity,
  TranscriptChapter,
  Transcript,
  TranscribeParams,
} from './transcript.types.js';

// Relationship types
export type {
  Relationship,
  CreateRelationshipParams,
  UpdateRelationshipParams,
  ReinforceParams,
  WeakenParams,
  RelationshipType,
  RelatedMemoriesResult,
  ReinforceGroupParams,
  ReinforceGroupResult,
} from './relationship.types.js';

// Cluster types
export type {
  ClusterScale,
  Cluster,
  CreateClusterParams,
  UpdateClusterParams,
  ListClustersParams,
  GetClusterOptions,
  ClusterExpandParams,
  ClusterExpandResult,
  ClusterStats,
  ClusterQuality,
  ClusterTopics,
  IncrementalClusterParams,
  IncrementalClusterResult,
  ClusterConfig,
  UpdateClusterConfigParams,
  ClusterStatus,
} from './cluster.types.js';

// Space types
export type {
  Space,
  CreateSpaceParams,
  UpdateSpaceParams,
} from './space.types.js';

// Graph types
export type {
  TraverseParams,
  GraphResult,
  ContextParams,
  ContextResult,
  PathParams,
  PathResult,
  SimilarParams,
  SimilarResult,
  EmbedResult,
  EmbedAllResult,
  GraphNeighbors,
  GraphStats,
  HybridScoringWeights,
  GraphExpansionScoring,
  GraphExpansionStats,
  GraphExpansionResult,
  GraphExpandParams,
} from './graph.types.js';

// Search types
export type {
  SearchConfig,
  SearchOptions,
  SearchByTopicOptions,
} from './search.types.js';

// Webhook types
export type {
  Webhook,
  CreateWebhookParams,
  UpdateWebhookParams,
  ListWebhooksParams,
  Delivery,
  DeliveriesParams,
  WebhookEvent,
  WebhookEventType,
  WebhookStats,
  ListWebhookEventsParams,
} from './webhook.types.js';

// Session types
export type {
  Session,
  CreateSessionParams,
  SessionMemory,
  AddMemoryParams,
  GetSessionParams,
  SessionHistory,
  ListSessionsParams,
  GetContextParams,
  EndSessionParams,
  EndedSession,
  AddSessionMessageParams,
  SessionMessage,
  SessionType,
  SessionStatus,
  SessionRetentionPolicy,
  CLISession,
  CreateCLISessionParams,
  UpdateCLISessionParams,
  CompleteCLISessionParams,
  ListCLISessionsParams,
  CLISessionsResponse,
  CLISessionStats,
} from './session.types.js';

// Fact types
export type {
  FactNodeType,
  FactSource,
  Fact,
  CreateFactParams,
  UpdateFactParams,
  ListFactsParams,
  QueryFactsParams,
  ScoredFact,
  FactExtractionResult,
  FactVerificationResult,
} from './fact.types.js';

// Entity types
export type {
  Entity,
  CreateEntityParams,
  UpdateEntityParams,
  ListEntitiesParams,
  SearchEntitiesParams,
  ResolveEntityParams,
  ScoredEntity,
  EntityResolutionResult,
  EntityMergeResult,
  EntityMemoryLinkResult,
  EntityExtractionResult,
  EntityTypeInfo,
  EntityTypesResult,
  EntityFactsResult,
} from './entity.types.js';

// Enrichment types
export type {
  EnrichmentStatus,
  EnrichmentType,
  EnrichmentOperation,
  Enrichment,
  ListEnrichmentsParams,
  TriggerEnrichmentParams,
  EnrichMemoryOptions,
  EnrichmentResult,
  EnrichMemoryResult,
  QualityScoreResult,
  Topic,
  GetTopicsOptions,
  TopicsResult,
} from './enrichment.types.js';

// Resource types
export type {
  Resource,
  CreateResourceParams,
  UpdateResourceParams,
  ListResourcesParams,
  ResourceListResult,
  MemoryResource,
  MemoryResourcesResult,
  ResourceMemoriesResult,
  LinkResourceParams,
  LinkResourceResult,
  UnlinkResourceResult,
} from './resource.types.js';

// Feedback types
export type {
  SubmitFeedbackParams,
  FeedbackResult,
  QuickFeedbackParams,
  QuickFeedbackResult,
  BatchFeedbackParams,
  BatchFeedbackResult,
} from './feedback.types.js';

// Highlight types
export type {
  Highlight,
  CreateHighlightParams,
  UpdateHighlightParams,
  ListHighlightsParams,
  ExtractParams,
  ExtractResult,
  SearchHighlightsParams,
  HighlightSearchResult,
  HighlightType,
  LinkHighlightParams,
  HighlightLinkResult,
} from './highlight.types.js';

// Image types
export type {
  CreateImageMemoryParams,
  VisualSearchParams,
  VisualSearchResult,
  TextToImageSearchParams,
  FindSimilarImagesParams,
  SimilarImagesResult,
  CheckDuplicatesParams,
  DuplicateCheckResult,
  ClusterImagesParams,
  ClusterImagesResult,
  AutoTagParams,
  AutoTagResult,
  BatchAutoTagParams,
  BatchAutoTagResult,
  SuggestQueriesParams,
  QuerySuggestionsResult,
} from './image.types.js';

// Persona types
export type {
  PersonaSpaceRole,
  PersonaGoal,
  PersonaSpace,
  Persona,
  CreatePersonaParams,
  UpdatePersonaParams,
  AddPersonaSpaceParams,
} from './persona.types.js';

// Task types
export type {
  TaskStatus,
  TaskPriority,
  AssigneeType,
  TaskLinkType,
  TaskLinkEntityType,
  TaskLabel,
  TaskLink,
  TaskRecurrence,
  TaskReminder,
  Task,
  CreateTaskParams,
  CreateSubtaskParams,
  UpdateTaskParams,
  ListTasksParams,
  GetTaskOptions,
  TaskListResult,
  SuggestedTasksParams,
  TaskSuggestion,
  SuggestedTasksResult,
  BulkCreateTaskItem,
  BulkUpdateTaskItem,
  BulkTaskFailure,
  BulkCreateTasksResult,
  BulkUpdateTasksResult,
  BulkDeleteTasksResult,
  TaskHandoffParams,
  TaskHandoffResult,
} from './task.types.js';

// Habit types
export type {
  HabitType,
  HabitFrequency,
  HabitStatus,
  CompletionSource,
  StreakInfo,
  HabitCompletion,
  Habit,
  CreateHabitParams,
  UpdateHabitParams,
  ListHabitsParams,
  CheckInParams,
  HabitHistoryParams,
  HabitListResult,
  CheckInResult,
  HabitHistoryResult,
  DueHabitsResult,
  WeeklyTrendEntry,
  BestDay,
  HabitAnalytics,
} from './habit.types.js';

// Bot types
export type {
  BotStatus,
  MemoryStrategy,
  TriggerType,
  BotRunStatus,
  BotSpacePermission,
  BotTool,
  BotSpace,
  BotTrigger,
  Bot,
  BotAction,
  BotRun,
  CreateBotParams,
  UpdateBotParams,
  ListBotsParams,
  AddBotSpaceParams,
  CreateTriggerParams,
  UpdateTriggerParams,
  RunBotParams,
  ListRunsParams,
} from './bot.types.js';

// Space config types
export type {
  SpaceConfigCategory,
  SpaceConfig,
  SpaceConfigPatch,
  SpaceConfigValidation,
  SpaceConfigAuditEvent,
  SpaceConfigAuditResponse,
} from './space-config.types.js';

// Goal types
export type {
  GoalType,
  GoalStatus,
  GoalVisibility,
  GoalProgressType,
  GoalContributor,
  Goal,
  CreateGoalParams,
  UpdateGoalParams,
  ListGoalsParams,
  GoalProgressUpdateParams,
  GoalStatusTransitionParams,
  GoalContributorCreateParams,
  GoalContributorUpdateParams,
  ProgressHistoryParams,
  GoalListResult,
  ProgressHistoryEntry,
  ProgressHistoryResult,
  CreateKeyResultParams,
  PaceAnalysis,
  GoalMemoryLinkType,
  GoalMemoryLink,
  GoalMemoryListResponse,
} from './goal.types.js';

// Skill types
export type {
  SkillVisibility,
  SkillStatus,
  SkillScript,
  SkillResource,
  Skill,
  BotSkillAttachment,
  CreateSkillParams,
  UpdateSkillParams,
  ListSkillsParams,
  MarketplaceSearchParams,
  AttachSkillParams,
  UpdateBotSkillParams,
} from './skill.types.js';

// Note types
export type {
  NoteType,
  NoteVisibility,
  NoteBlockType,
  NotePermission,
  NoteActorType,
  NoteBlock,
  NoteCollaborator,
  Note,
  CreateNoteParams,
  UpdateNoteParams,
  ListNotesParams,
  AddNoteBlockParams,
  UpdateNoteBlockParams,
  AddNoteCollaboratorParams,
  NoteListResult,
  NoteLinkType,
  NoteMemoryLinkType,
  NoteLink,
  CreateNoteLinkParams,
  NoteMemoryLink,
  LinkNoteMemoryParams,
  NoteMemoryListResult,
} from './note.types.js';

// Workflow types
export type {
  WorkflowStatus,
  WorkflowRunStatus,
  WorkflowTriggerType,
  Workflow,
  WorkflowRun,
  WorkflowTrigger,
  CreateWorkflowParams,
  UpdateWorkflowParams,
  ListWorkflowsParams,
  WorkflowListResult,
  WorkflowRunListResult,
  TriggerWorkflowParams,
  CreateTriggerParams as CreateWorkflowTriggerParams,
  UpdateTriggerParams as UpdateWorkflowTriggerParams,
} from './workflow.types.js';
