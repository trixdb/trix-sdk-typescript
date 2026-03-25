/**
 * Type definitions for the Trix SDK.
 * Re-exports all types from domain-specific modules.
 */

export type {
  TrixConfig, PaginatedResponse, PaginationParams, SortParams,
  BulkResult, BaseEntity, BaseEntityWithMetadata, TestResult, JobStatus, Job,
} from './common.types.js';

export type {
  MemoryType, OriginType, SourceType, ResourceRelationshipType, ProtectionLevel,
  MemoryOriginContext, MemoryProtectionFields, Memory, CreateMemoryParams,
  UpdateMemoryParams, ListMemoriesParams, MemoryConfig, MemoryStatsParams, MemoryStats,
} from './memory.types.js';

export type {
  TimestampRange, ContentSafetyLabel, WordTimestamp, TranscriptSegment,
  TranscriptEntity, TranscriptChapter, Transcript, TranscribeParams,
} from './transcript.types.js';

export type {
  Relationship, CreateRelationshipParams, UpdateRelationshipParams,
  ReinforceParams, WeakenParams, RelationshipType, RelatedMemoriesResult,
  ReinforceGroupParams, ReinforceGroupResult,
} from './relationship.types.js';

export type {
  ClusterScale, Cluster, CreateClusterParams, UpdateClusterParams,
  ListClustersParams, GetClusterOptions, ClusterExpandParams, ClusterExpandResult,
  ClusterStats, ClusterQuality, ClusterTopics, IncrementalClusterParams,
  IncrementalClusterResult, ClusterConfig, UpdateClusterConfigParams, ClusterStatus,
} from './cluster.types.js';

export type {
  Space, CreateSpaceParams, UpdateSpaceParams,
} from './space.types.js';

export type {
  TraverseParams, GraphResult, ContextParams, ContextResult, PathParams,
  PathResult, SimilarParams, SimilarResult, EmbedResult, EmbedAllResult,
  GraphNeighbors, GraphStats, HybridScoringWeights, GraphExpansionScoring,
  GraphExpansionStats, GraphExpansionResult, GraphExpandParams,
} from './graph.types.js';

export type {
  SearchConfig, SearchOptions, SearchByTopicOptions,
} from './search.types.js';

export type {
  Webhook, CreateWebhookParams, UpdateWebhookParams, ListWebhooksParams,
  Delivery, DeliveriesParams, WebhookEvent, WebhookEventType,
  WebhookStats, ListWebhookEventsParams,
} from './webhook.types.js';

export type {
  Session, CreateSessionParams, SessionMemory, AddMemoryParams,
  GetSessionParams, SessionHistory, ListSessionsParams, GetContextParams,
  EndSessionParams, EndedSession, AddSessionMessageParams, SessionMessage,
  SessionType, SessionStatus, SessionRetentionPolicy, CLISession,
  CreateCLISessionParams, UpdateCLISessionParams, CompleteCLISessionParams,
  ListCLISessionsParams, CLISessionsResponse, CLISessionStats,
} from './session.types.js';

export type {
  FactNodeType, FactSource, Fact, CreateFactParams, UpdateFactParams,
  ListFactsParams, QueryFactsParams, ScoredFact, FactExtractionResult,
  FactVerificationResult,
} from './fact.types.js';

export type {
  Entity, CreateEntityParams, UpdateEntityParams, ListEntitiesParams,
  SearchEntitiesParams, ResolveEntityParams, ScoredEntity,
  EntityResolutionResult, EntityMergeResult, EntityMemoryLinkResult,
  EntityExtractionResult, EntityTypeInfo, EntityTypesResult, EntityFactsResult,
} from './entity.types.js';

export type {
  EnrichmentStatus, EnrichmentType, EnrichmentOperation, Enrichment,
  ListEnrichmentsParams, TriggerEnrichmentParams, EnrichMemoryOptions,
  EnrichmentResult, EnrichMemoryResult, QualityScoreResult, Topic,
  GetTopicsOptions, TopicsResult,
} from './enrichment.types.js';

export type {
  Resource, CreateResourceParams, UpdateResourceParams, ListResourcesParams,
  ResourceListResult, MemoryResource, MemoryResourcesResult,
  ResourceMemoriesResult, LinkResourceParams, LinkResourceResult,
  UnlinkResourceResult,
} from './resource.types.js';

export type {
  SubmitFeedbackParams, FeedbackResult, QuickFeedbackParams,
  QuickFeedbackResult, BatchFeedbackParams, BatchFeedbackResult,
} from './feedback.types.js';

export type {
  Highlight, CreateHighlightParams, UpdateHighlightParams,
  ListHighlightsParams, ExtractParams, ExtractResult, SearchHighlightsParams,
  HighlightSearchResult, HighlightType, LinkHighlightParams, HighlightLinkResult,
} from './highlight.types.js';

export type {
  CreateImageMemoryParams, VisualSearchParams, VisualSearchResult,
  TextToImageSearchParams, FindSimilarImagesParams, SimilarImagesResult,
  CheckDuplicatesParams, DuplicateCheckResult, ClusterImagesParams,
  ClusterImagesResult, AutoTagParams, AutoTagResult, BatchAutoTagParams,
  BatchAutoTagResult, SuggestQueriesParams, QuerySuggestionsResult,
} from './image.types.js';

export type {
  PersonaSpaceRole, PersonaGoal, PersonaSpace, Persona,
  CreatePersonaParams, UpdatePersonaParams, AddPersonaSpaceParams,
} from './persona.types.js';

export type {
  TaskStatus, TaskPriority, AssigneeType, TaskLinkType, TaskLinkEntityType,
  TaskLabel, TaskLink, TaskRecurrence, TaskReminder, Task, CreateTaskParams,
  CreateSubtaskParams, UpdateTaskParams, ListTasksParams, GetTaskOptions,
  TaskListResult, SuggestedTasksParams, TaskSuggestion, SuggestedTasksResult,
  BulkCreateTaskItem, BulkUpdateTaskItem, BulkTaskFailure,
  BulkCreateTasksResult, BulkUpdateTasksResult, BulkDeleteTasksResult,
  TaskHandoffParams, TaskHandoffResult,
} from './task.types.js';

export type {
  HabitType, HabitFrequency, HabitStatus, CompletionSource, StreakInfo,
  HabitCompletion, Habit, CreateHabitParams, UpdateHabitParams,
  ListHabitsParams, CheckInParams, HabitHistoryParams, HabitListResult,
  CheckInResult, HabitHistoryResult, DueHabitsResult, WeeklyTrendEntry,
  BestDay, HabitAnalytics,
} from './habit.types.js';

export type {
  BotStatus, MemoryStrategy, TriggerType, BotRunStatus, BotSpacePermission,
  BotTool, BotSpace, BotTrigger, Bot, BotAction, BotRun, CreateBotParams,
  UpdateBotParams, ListBotsParams, AddBotSpaceParams, CreateTriggerParams,
  UpdateTriggerParams, RunBotParams, ListRunsParams, BuildContextParams,
  BotContext, BotRunBatchRequest, BotRunBatchResult,
} from './bot.types.js';

export type {
  BotRunStepType, BotRunStep, RunAndWaitOptions,
} from './bot-stream.types.js';

export type {
  SpaceConfigCategory, SpaceConfig, SpaceConfigPatch,
  SpaceConfigValidation, SpaceConfigAuditEvent, SpaceConfigAuditResponse,
} from './space-config.types.js';

export type {
  GoalType, GoalStatus, GoalVisibility, GoalProgressType, GoalContributor,
  Goal, CreateGoalParams, UpdateGoalParams, ListGoalsParams,
  GoalProgressUpdateParams, GoalStatusTransitionParams,
  GoalContributorCreateParams, GoalContributorUpdateParams,
  ProgressHistoryParams, GoalListResult, ProgressHistoryEntry,
  ProgressHistoryResult, CreateKeyResultParams, PaceAnalysis,
  GoalMemoryLinkType, GoalMemoryLink, GoalMemoryListResponse,
} from './goal.types.js';

export type {
  SkillVisibility, SkillStatus, SkillScript, SkillResource, Skill,
  BotSkillAttachment, CreateSkillParams, UpdateSkillParams, ListSkillsParams,
  MarketplaceSearchParams, AttachSkillParams, UpdateBotSkillParams,
} from './skill.types.js';

export type {
  NoteType, NoteVisibility, NoteBlockType, NotePermission, NoteActorType,
  NoteBlock, NoteCollaborator, Note, CreateNoteParams, UpdateNoteParams,
  ListNotesParams, AddNoteBlockParams, UpdateNoteBlockParams,
  AddNoteCollaboratorParams, NoteListResult, NoteLinkType, NoteMemoryLinkType,
  NoteLink, CreateNoteLinkParams, NoteMemoryLink, LinkNoteMemoryParams,
  NoteMemoryListResult, CreateFromTemplateParams, NoteSummaryResult,
  NoteExtractTasksResult, NoteSuggestLinksResult,
} from './note.types.js';

export type {
  TemplateVisibility, TemplateCategory, TemplateReview, Template,
  CreateTemplateParams, UpdateTemplateParams, ListTemplatesParams,
  BrowseTemplatesParams, InstallTemplateParams, CreateTemplateReviewParams,
} from './template.types.js';

export type {
  CrewStatus, CrewMember, Crew, CreateCrewParams, UpdateCrewParams,
  ListCrewsParams,
} from './crew.types.js';

export type {
  HubRole, ConversationRole, HubMember, ConversationMember,
  AddHubMemberParams, UpdateHubMemberParams, AddConversationMemberParams,
  UpdateConversationMemberParams, HubCustomRole, CreateRoleInput,
  UpdateRoleInput, ConvRoleOverride,
} from './hub.types.js';

export type {
  WorkflowStatus, WorkflowRunStatus, WorkflowTriggerType, Workflow,
  WorkflowRun, WorkflowTrigger, CreateWorkflowParams, UpdateWorkflowParams,
  ListWorkflowsParams, WorkflowListResult, WorkflowRunListResult,
  TriggerWorkflowParams,
  CreateTriggerParams as CreateWorkflowTriggerParams,
  UpdateTriggerParams as UpdateWorkflowTriggerParams,
} from './workflow.types.js';

export type {
  PresetMemoryStrategy, PresetAutonomyLevel, PresetBudgetPeriod,
  AgentPreset, CreatePresetParams, UpdatePresetParams, ListPresetsParams,
} from './preset.types.js';

export type {
  ChatFile, FileDownloadInfo, FileQuota, FileListResult,
  UploadFileParams, UploadFileBase64Params, ListFilesParams,
} from './file.types.js';
