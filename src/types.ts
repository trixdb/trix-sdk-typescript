/**
 * Core type definitions for the Trix SDK
 */

import type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './client.js';

/**
 * Configuration options for the Trix client
 */
export interface TrixConfig {
  /**
   * API key or JWT token for authentication
   */
  apiKey: string;

  /**
   * Base URL for the Trix API
   * @default 'https://api.trixdb.com'
   */
  baseUrl?: string;

  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Timeout for requests in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Custom fetch implementation (useful for testing or specific environments)
   */
  fetch?: typeof fetch;

  /**
   * Allow insecure connections (HTTP, localhost).
   * Only use for local development - never in production.
   * @default false
   */
  allowInsecure?: boolean;

  /**
   * Request interceptors to run before each request.
   * Interceptors run in order and can modify the request.
   */
  requestInterceptors?: RequestInterceptor[];

  /**
   * Response interceptors to run after each successful response.
   * Interceptors run in order and can modify or observe the response.
   */
  responseInterceptors?: ResponseInterceptor[];

  /**
   * Error interceptors to run when an error occurs.
   * Interceptors run in order and can transform or log errors.
   */
  errorInterceptors?: ErrorInterceptor[];
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Memory types supported by Trix
 */
export type MemoryType = 'text' | 'markdown' | 'url' | 'audio';

/**
 * Origin types for memory context classification
 * These represent the life domain context of a memory
 */
export type OriginType = 'work' | 'private' | 'shared' | 'learning';

/**
 * Source types for memory provenance tracking
 * These represent how/where the memory was captured
 */
export type SourceType =
  | 'email'
  | 'meeting'
  | 'chat'
  | 'document'
  | 'webpage'
  | 'audio'
  | 'video'
  | 'screenshot'
  | 'manual'
  | 'agent'
  | 'api'
  | 'import';

/**
 * Relationship types for memory-resource associations
 */
export type ResourceRelationshipType = 'primary' | 'related' | 'mentioned' | 'derived';

/**
 * Protection level for memories
 * - 'none': No protection, can be deleted normally
 * - 'soft': Protected from automatic cleanup, can be manually deleted
 * - 'hard': Fully protected, requires explicit unprotection before deletion
 */
export type ProtectionLevel = 'none' | 'soft' | 'hard';

/**
 * Memory object
 */
export interface Memory {
  id: string;
  spaceId: string;
  type: MemoryType;
  content: string;
  embedding?: number[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  transcriptStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  /** Origin/Context: Session ID this memory belongs to */
  sessionId?: string;
  /** Origin/Context: Life domain context */
  originType?: OriginType;
  /** Origin/Context: Ingestion method */
  sourceType?: SourceType;
  /** Origin/Context: External ID in source system */
  sourceId?: string;
  /** Origin/Context: Rich context from source */
  sourceMetadata?: Record<string, unknown>;
  /** Whether this memory is pinned (protected from auto-archival) */
  isPinned?: boolean;
  /** Protection level for this memory */
  protectionLevel?: ProtectionLevel;
  /** Whether this memory has been soft deleted */
  isDeleted?: boolean;
  /** Timestamp when memory was soft deleted */
  deletedAt?: string;
  /** Quality score for this memory (0-1) */
  qualityScore?: number;
}

/**
 * Parameters for creating a memory
 */
export interface CreateMemoryParams {
  content: string;
  type?: MemoryType;
  tags?: string[];
  metadata?: Record<string, unknown>;
  spaceId?: string;
  embedding?: number[];
  audioFile?: Blob | Buffer;
  /** Origin/Context: Session ID to link this memory to */
  sessionId?: string;
  /** Origin/Context: Life domain context */
  originType?: OriginType;
  /** Origin/Context: Ingestion method */
  sourceType?: SourceType;
  /** Origin/Context: External ID in source system */
  sourceId?: string;
  /** Origin/Context: Rich context from source */
  sourceMetadata?: Record<string, unknown>;
  /** Origin/Context: Resource IDs to link this memory to */
  resourceIds?: string[];
  /** Pin this memory on creation (protects from auto-archival) */
  isPinned?: boolean;
  /** Protection level for this memory */
  protectionLevel?: ProtectionLevel;
}

/**
 * Parameters for updating a memory
 */
export interface UpdateMemoryParams {
  id?: string;
  content?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  embedding?: number[];
  /** Origin/Context: Life domain context */
  originType?: OriginType;
  /** Origin/Context: Ingestion method */
  sourceType?: SourceType;
  /** Origin/Context: External ID in source system */
  sourceId?: string;
  /** Origin/Context: Rich context from source */
  sourceMetadata?: Record<string, unknown>;
  /** Pin/unpin this memory */
  isPinned?: boolean;
  /** Protection level for this memory */
  protectionLevel?: ProtectionLevel;
}

/**
 * Parameters for listing memories
 */
export interface ListMemoriesParams {
  q?: string;
  mode?: 'semantic' | 'keyword' | 'hybrid';
  limit?: number;
  page?: number;
  offset?: number;
  tags?: string[];
  type?: MemoryType;
  spaceId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  /** Origin/Context: Filter by session ID */
  sessionId?: string;
  /** Origin/Context: Filter by life domain context */
  originType?: OriginType;
  /** Origin/Context: Filter by ingestion method */
  sourceType?: SourceType;
  /** Origin/Context: Filter by source ID */
  sourceId?: string;
  /** Origin/Context: Filter by resource ID */
  resourceId?: string;
  /** Origin/Context: Filter by multiple resource IDs (comma-separated) */
  resourceIds?: string;
  /** Filter by pinned status */
  pinned?: boolean;
  /** Filter by protection status (any non-'none' protection level) */
  protected?: boolean;
  /** Filter by minimum quality score (0-1) */
  minQuality?: number;
  /** Include soft-deleted memories in results */
  includeDeleted?: boolean;
}

/**
 * Bulk operation result
 */
export interface BulkResult {
  success: number;
  failed: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
}

/**
 * Memory configuration
 */
export interface MemoryConfig {
  maxContentLength: number;
  supportedTypes: MemoryType[];
  maxTagsPerMemory: number;
  maxAudioDuration: number;
}

/**
 * Timestamp range for content safety labels
 */
export interface TimestampRange {
  start: number;
  end: number;
}

/**
 * Content safety detection result
 */
export interface ContentSafetyLabel {
  label: string;
  confidence: number;
  severity: string;
  timestamp?: TimestampRange;
}

/**
 * Word-level timestamp with optional speaker label
 */
export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  speaker?: string;
}

/**
 * Transcript segment with speaker information and word-level details
 */
export interface TranscriptSegment {
  id?: string;
  startTime: number;
  endTime: number;
  text: string;
  segmentIndex: number;
  confidence?: number;
  speaker?: string;
  words?: WordTimestamp[];
  wordConfidenceAvg?: number;
}

/**
 * Detected entity in transcript
 */
export interface TranscriptEntity {
  id?: string;
  entityType: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  metadata?: Record<string, any>;
}

/**
 * Auto-generated chapter
 */
export interface TranscriptChapter {
  id?: string;
  chapterIndex: number;
  headline: string;
  summary: string;
  gist: string;
  startTime: number;
  endTime: number;
}

/**
 * Full transcript with metadata, segments, entities, and chapters
 */
export interface Transcript {
  memoryId: string;
  audioFileId?: string;
  text: string;
  duration?: number;
  language?: string;
  languageConfidence?: number;
  provider?: string;
  summary?: string;
  contentSafetyLabels?: ContentSafetyLabel[];
  providerMetadata?: Record<string, any>;
  segments?: TranscriptSegment[];
  entities?: TranscriptEntity[];
  chapters?: TranscriptChapter[];
  words?: WordTimestamp[];
}

/**
 * Parameters for transcription
 */
export interface TranscribeParams {
  /** Language code for transcription (e.g., 'en', 'es') */
  language?: string;
  /** Context to improve transcription accuracy */
  prompt?: string;
  /** Transcription provider ('assemblyai' or 'openai') */
  provider?: 'assemblyai' | 'openai';
  /** Enable speaker identification and labeling (diarization) */
  enableSpeakerDiarization?: boolean;
  /** Enable entity detection in transcript */
  enableEntityDetection?: boolean;
  /** Enable content safety labeling */
  enableContentSafety?: boolean;
  /** Enable automatic chapter generation */
  enableAutoChapters?: boolean;
  /** Enable automatic summarization */
  enableAutoSummarization?: boolean;
  /** Expected number of speakers (hint for diarization) */
  speakersExpected?: number;
}

/**
 * Relationship object
 */
export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a relationship
 */
export interface CreateRelationshipParams {
  relationshipType: string;
  strength?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a relationship
 */
export interface UpdateRelationshipParams {
  relationshipType?: string;
  strength?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for reinforcing a relationship
 */
export interface ReinforceParams {
  amount?: number;
}

/**
 * Cluster scale for multi-scale clustering
 * - 'fine': Fine-grained clusters with fewer, highly similar memories
 * - 'medium': Medium-sized clusters with balanced similarity
 * - 'coarse': Coarse-grained clusters with more memories, broader topics
 */
export type ClusterScale = 'fine' | 'medium' | 'coarse';

/**
 * Cluster object
 */
export interface Cluster {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  memoryIds: string[];
  centroid?: number[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  /** Scale of this cluster (fine, medium, coarse) */
  scale?: ClusterScale;
  /** Memory objects when includeMemories is true */
  memories?: Memory[];
}

/**
 * Parameters for creating a cluster
 */
export interface CreateClusterParams {
  name: string;
  description?: string;
  memoryIds?: string[];
  spaceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a cluster
 */
export interface UpdateClusterParams {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing clusters
 */
export interface ListClustersParams {
  limit?: number;
  page?: number;
  offset?: number;
  spaceId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  /** Filter by cluster scale */
  scale?: ClusterScale;
}

/**
 * Options for getting a cluster
 */
export interface GetClusterOptions {
  /** Include full memory objects in the response */
  includeMemories?: boolean;
}

/**
 * Parameters for expanding a cluster
 */
export interface ClusterExpandParams {
  limit?: number;
  threshold?: number;
}

/**
 * Cluster expansion result
 */
export interface ClusterExpandResult {
  clusterId: string;
  newMemories: Array<{
    memoryId: string;
    confidence: number;
  }>;
}

/**
 * Space object
 */
export interface Space {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a space
 */
export interface CreateSpaceParams {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a space
 */
export interface UpdateSpaceParams {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for graph traversal
 */
export interface TraverseParams {
  startNodeId: string;
  maxDepth?: number;
  relationshipTypes?: string[];
  direction?: 'outgoing' | 'incoming' | 'both';
  limit?: number;
}

/**
 * Graph result
 */
export interface GraphResult {
  nodes: Array<{
    id: string;
    type: string;
    data: Memory | Cluster;
    depth: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    relationship: Relationship;
  }>;
}

/**
 * Parameters for getting context
 */
export interface ContextParams {
  memoryId: string;
  depth?: number;
  relationshipTypes?: string[];
  includeMetadata?: boolean;
}

/**
 * Context result
 */
export interface ContextResult {
  central: Memory;
  related: Memory[];
  relationships: Relationship[];
  clusters?: Cluster[];
}

/**
 * Parameters for shortest path
 */
export interface PathParams {
  relationshipTypes?: string[];
  maxDepth?: number;
}

/**
 * Path result
 */
export interface PathResult {
  path: Array<{
    node: Memory;
    relationship?: Relationship;
  }>;
  distance: number;
  found: boolean;
}

/**
 * Parameters for similar search
 */
export interface SimilarParams {
  limit?: number;
  threshold?: number;
  includeEmbedding?: boolean;
  spaceId?: string;
}

/**
 * Similar result
 */
export interface SimilarResult {
  results: Array<{
    memory: Memory;
    similarity: number;
  }>;
}

/**
 * Embed result
 */
export interface EmbedResult {
  embeddings: Array<{
    memoryId: string;
    embedding: number[];
  }>;
}

/**
 * Embed all result
 */
export interface EmbedAllResult {
  total: number;
  processed: number;
  jobId?: string;
}

/**
 * Search configuration
 */
export interface SearchConfig {
  embeddingModel: string;
  embeddingDimensions: number;
  maxBatchSize: number;
}

/**
 * Webhook object
 */
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a webhook
 */
export interface CreateWebhookParams {
  url: string;
  events: string[];
  secret?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a webhook
 */
export interface UpdateWebhookParams {
  url?: string;
  events?: string[];
  secret?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing webhooks
 */
export interface ListWebhooksParams {
  limit?: number;
  page?: number;
  active?: boolean;
}

/**
 * Test result
 */
export interface TestResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
}

/**
 * Webhook delivery
 */
export interface Delivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  attempts: number;
  nextRetry?: string;
  createdAt: string;
}

/**
 * Parameters for listing deliveries
 */
export interface DeliveriesParams {
  limit?: number;
  page?: number;
  status?: 'pending' | 'success' | 'failed';
}

/**
 * Parameters for consolidation
 */
export interface ConsolidateParams {
  spaceId?: string;
  threshold?: number;
  maxClusters?: number;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Consolidate result
 */
export interface ConsolidateResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

/**
 * Session object
 */
export interface Session {
  id: string;
  spaceId?: string;
  name?: string;
  metadata?: Record<string, unknown>;
  startedAt: string;
  endedAt?: string;
  memoryCount: number;
}

/**
 * Parameters for creating a session
 */
export interface CreateSessionParams {
  name?: string;
  spaceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Session memory
 */
export interface SessionMemory {
  id: string;
  sessionId: string;
  memoryId: string;
  sequenceNumber: number;
  createdAt: string;
}

/**
 * Parameters for adding memory to session
 */
export interface AddMemoryParams {
  memoryId?: string;
  content?: string;
  type?: MemoryType;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for getting session
 */
export interface GetSessionParams {
  includeMemories?: boolean;
  limit?: number;
}

/**
 * Session history
 */
export interface SessionHistory {
  session: Session;
  memories?: Memory[];
}

/**
 * Parameters for listing sessions
 */
export interface ListSessionsParams {
  limit?: number;
  page?: number;
  spaceId?: string;
  active?: boolean;
}

/**
 * Parameters for getting agent context
 */
export interface GetContextParams {
  sessionId?: string;
  query?: string;
  limit?: number;
  includeRelated?: boolean;
}

/**
 * Parameters for ending session
 */
export interface EndSessionParams {
  consolidate?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Ended session
 */
export interface EndedSession {
  session: Session;
  consolidationJobId?: string;
}

/**
 * Parameters for submitting feedback
 */
export interface SubmitFeedbackParams {
  memoryId: string;
  type: 'positive' | 'negative' | 'neutral';
  comment?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Feedback result
 */
export interface FeedbackResult {
  id: string;
  memoryId: string;
  type: string;
  createdAt: string;
}

/**
 * Parameters for quick feedback
 */
export interface QuickFeedbackParams {
  memoryId: string;
  type: 'thumbs_up' | 'thumbs_down';
}

/**
 * Quick feedback result
 */
export interface QuickFeedbackResult {
  success: boolean;
  memoryId: string;
}

/**
 * Parameters for batch feedback
 */
export interface BatchFeedbackParams {
  feedback: Array<{
    memoryId: string;
    type: 'positive' | 'negative' | 'neutral';
    comment?: string;
  }>;
}

/**
 * Batch feedback result
 */
export interface BatchFeedbackResult {
  success: number;
  failed: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
}

/**
 * Highlight object
 */
export interface Highlight {
  id: string;
  memoryId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color?: string;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a highlight
 */
export interface CreateHighlightParams {
  text: string;
  startOffset: number;
  endOffset: number;
  color?: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a highlight
 */
export interface UpdateHighlightParams {
  color?: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing highlights
 */
export interface ListHighlightsParams {
  limit?: number;
  page?: number;
}

/**
 * Parameters for extracting highlights
 */
export interface ExtractParams {
  method?: 'ai' | 'keyword' | 'tfidf';
  limit?: number;
  minLength?: number;
}

/**
 * Extract result
 */
export interface ExtractResult {
  highlights: Array<{
    text: string;
    startOffset: number;
    endOffset: number;
    score: number;
  }>;
}

/**
 * Job object
 */
export interface Job {
  id: string;
  queue: string;
  name: string;
  data: Record<string, unknown>;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  returnValue?: unknown;
  failedReason?: string;
  attempts: number;
  createdAt: string;
  processedAt?: string;
  finishedAt?: string;
}

/**
 * Job statistics
 */
export interface JobStats {
  queues: Array<{
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }>;
}

/**
 * Parameters for listing jobs
 */
export interface ListJobsParams {
  queue?: string;
  status?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  limit?: number;
  page?: number;
}

/**
 * Parameters for cleaning jobs
 */
export interface CleanParams {
  grace?: number;
  limit?: number;
  status?: 'completed' | 'failed';
}

/**
 * Clean result
 */
export interface CleanResult {
  removed: number;
}

// ============================================================================
// Fact Types - Knowledge Graph Triples
// ============================================================================

/**
 * Type of subject/object in a fact
 */
export type FactNodeType = 'entity' | 'text' | 'memory';

/**
 * Source of a fact (how it was created)
 */
export interface FactSource {
  memoryId?: string;
  sessionId?: string;
  method?: 'manual' | 'extracted' | 'inferred';
}

/**
 * Fact object - represents a knowledge graph triple (Subject-Predicate-Object)
 */
export interface Fact {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  subjectType?: FactNodeType;
  objectType?: FactNodeType;
  confidence: number;
  source?: FactSource;
  validFrom?: string;
  validTo?: string;
  metadata?: Record<string, unknown>;
  spaceId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a fact
 */
export interface CreateFactParams {
  subject: string;
  predicate: string;
  object: string;
  subjectType?: FactNodeType;
  objectType?: FactNodeType;
  confidence?: number;
  source?: FactSource;
  validFrom?: string;
  validTo?: string;
  metadata?: Record<string, unknown>;
  spaceId?: string;
}

/**
 * Parameters for updating a fact
 */
export interface UpdateFactParams {
  subject?: string;
  predicate?: string;
  object?: string;
  subjectType?: FactNodeType;
  objectType?: FactNodeType;
  confidence?: number;
  validFrom?: string;
  validTo?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing facts
 */
export interface ListFactsParams {
  subject?: string;
  predicate?: string;
  object?: string;
  minConfidence?: number;
  spaceId?: string;
  limit?: number;
  page?: number;
  offset?: number;
}

/**
 * Parameters for querying facts
 */
export interface QueryFactsParams {
  limit?: number;
  minConfidence?: number;
  spaceId?: string;
}

/**
 * Fact with relevance score
 */
export interface ScoredFact extends Fact {
  score: number;
}

/**
 * Result of fact extraction
 */
export interface FactExtractionResult {
  memoryId: string;
  facts: Array<{
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
  }>;
  saved?: boolean;
}

/**
 * Result of fact verification
 */
export interface FactVerificationResult {
  factId: string;
  verified: boolean;
  confidence: number;
  supportingMemories: string[];
  contradictingMemories?: string[];
}

// ============================================================================
// Entity Types - Named Entity Management
// ============================================================================

/**
 * Entity object - represents a named entity
 */
export interface Entity {
  id: string;
  name: string;
  type: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
  memoryIds?: string[];
  metadata?: Record<string, unknown>;
  spaceId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating an entity
 */
export interface CreateEntityParams {
  name: string;
  type: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
  memoryIds?: string[];
  metadata?: Record<string, unknown>;
  spaceId?: string;
}

/**
 * Parameters for updating an entity
 */
export interface UpdateEntityParams {
  name?: string;
  type?: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing entities
 */
export interface ListEntitiesParams {
  type?: string;
  spaceId?: string;
  limit?: number;
  page?: number;
  offset?: number;
}

/**
 * Parameters for searching entities
 */
export interface SearchEntitiesParams {
  type?: string;
  spaceId?: string;
  limit?: number;
}

/**
 * Parameters for resolving text to entity
 */
export interface ResolveEntityParams {
  context?: string;
  spaceId?: string;
}

/**
 * Entity with relevance score
 */
export interface ScoredEntity extends Entity {
  score: number;
}

/**
 * Result of entity resolution
 */
export interface EntityResolutionResult {
  text: string;
  entity?: Entity;
  confidence: number;
  alternatives?: Array<{
    entity: Entity;
    confidence: number;
  }>;
}

/**
 * Result of entity merge
 */
export interface EntityMergeResult {
  mergedEntity: Entity;
  deletedId: string;
}

/**
 * Result of entity-memory link
 */
export interface EntityMemoryLinkResult {
  entityId: string;
  memoryId: string;
  linked: boolean;
}

/**
 * Result of entity extraction
 */
export interface EntityExtractionResult {
  memoryId: string;
  entities: Array<{
    name: string;
    type: string;
    confidence: number;
    span?: {
      start: number;
      end: number;
    };
  }>;
  saved?: boolean;
  linked?: boolean;
}

/**
 * Entity type with count
 */
export interface EntityTypeInfo {
  name: string;
  count: number;
}

/**
 * Result of getting entity types
 */
export interface EntityTypesResult {
  types: EntityTypeInfo[];
}

/**
 * Result of getting entity facts
 */
export interface EntityFactsResult {
  entityId: string;
  facts: Fact[];
}

// ============================================================================
// Enrichment Types - Memory Enrichments
// ============================================================================

/**
 * Enrichment status
 */
export type EnrichmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Enrichment type
 */
export type EnrichmentType = 'entities' | 'summary' | 'sentiment' | 'topics' | 'keywords' | 'custom';

/**
 * Enrichment object
 */
export interface Enrichment {
  type: EnrichmentType | string;
  status: EnrichmentStatus;
  data?: Record<string, unknown>;
  error?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing enrichments
 */
export interface ListEnrichmentsParams {
  status?: EnrichmentStatus;
}

/**
 * Parameters for triggering enrichments
 */
export interface TriggerEnrichmentParams {
  types?: string[];
  priority?: 'low' | 'normal' | 'high';
  force?: boolean;
}

/**
 * Enrichment result
 */
export interface EnrichmentResult {
  memoryId: string;
  triggered: string[];
  jobIds?: string[];
  status: 'queued' | 'processing';
}

// ============================================================================
// Topic Types - Topic Extraction
// ============================================================================

/**
 * Topic extracted from a memory
 */
export interface Topic {
  /** Topic name/label */
  name: string;
  /** Relevance score (0-1) indicating how relevant the topic is to the memory */
  relevance: number;
  /** Category or domain of the topic */
  category: string;
}

/**
 * Options for getting topics from a memory
 */
export interface GetTopicsOptions {
  /** Force refresh topics (re-extract even if cached) */
  refresh?: boolean;
  /** Minimum relevance score filter (0-1) */
  minRelevance?: number;
  /** Filter by topic categories */
  categories?: string[];
}

/**
 * Result of topic extraction
 */
export interface TopicsResult {
  memoryId: string;
  topics: Topic[];
  extractedAt: string;
}

// ============================================================================
// Quality & Enrichment Types
// ============================================================================

/**
 * Enrichment operation types for enrich endpoint
 */
export type EnrichmentOperation = 'topics' | 'summary' | 'entities' | 'quality';

/**
 * Options for enriching a memory
 */
export interface EnrichMemoryOptions {
  /** Specific operations to run (defaults to all) */
  operations?: EnrichmentOperation[];
}

/**
 * Result of memory enrichment
 */
export interface EnrichMemoryResult {
  memoryId: string;
  operations: EnrichmentOperation[];
  results: Record<string, unknown>;
}

/**
 * Quality score result
 */
export interface QualityScoreResult {
  memoryId: string;
  score: number;
  factors?: Record<string, number>;
}

// ============================================================================
// Search Types - Extended
// ============================================================================

/**
 * Extended search options with cluster scale support
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity threshold */
  threshold?: number;
  /** Cluster scale to search within */
  clusterScale?: ClusterScale;
  /** Space ID to search within */
  spaceId?: string;
}

/**
 * Options for searching by topic
 */
export interface SearchByTopicOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum relevance score */
  minRelevance?: number;
  /** Space ID to search within */
  spaceId?: string;
}

// ============================================================================
// Memory Stats Types
// ============================================================================

/**
 * Parameters for getting memory stats
 */
export interface MemoryStatsParams {
  spaceId?: string;
  createdAfter?: string;
  createdBefore?: string;
  includeTypeDistribution?: boolean;
  includeTagDistribution?: boolean;
  includeTimeline?: boolean;
  timelineGranularity?: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  total: number;
  byType?: Record<string, number>;
  byTag?: Record<string, number>;
  timeline?: Array<{
    period: string;
    count: number;
  }>;
  avgContentLength?: number;
  totalSize?: number;
}

// ============================================================================
// Cluster Extended Types
// ============================================================================

/**
 * Cluster statistics
 */
export interface ClusterStats {
  total: number;
  avgSize: number;
  avgQuality: number;
  bySpace?: Record<string, number>;
}

/**
 * Cluster quality metrics
 */
export interface ClusterQuality {
  clusterId: string;
  coherence: number;
  separation: number;
  silhouetteScore: number;
  outlierCount: number;
}

/**
 * Cluster topics
 */
export interface ClusterTopics {
  clusterId: string;
  topics: Array<{
    label: string;
    score: number;
    keywords: string[];
  }>;
}

/**
 * Parameters for incremental clustering
 */
export interface IncrementalClusterParams {
  spaceId?: string;
  threshold?: number;
  maxNewClusters?: number;
}

/**
 * Incremental clustering result
 */
export interface IncrementalClusterResult {
  jobId: string;
  status: 'queued' | 'processing';
  estimatedMemories: number;
}

// ============================================================================
// Relationship Extended Types
// ============================================================================

/**
 * Relationship type info
 */
export interface RelationshipType {
  name: string;
  count: number;
  description?: string;
}

/**
 * Parameters for weakening a relationship
 */
export interface WeakenParams {
  amount?: number;
}

/**
 * Related memories result
 */
export interface RelatedMemoriesResult {
  memoryId: string;
  related: Array<{
    memory: Memory;
    relationship: Relationship;
    score: number;
  }>;
}

/**
 * Parameters for reinforcing a group of relationships
 */
export interface ReinforceGroupParams {
  relationshipIds: string[];
  amount?: number;
}

/**
 * Reinforce group result
 */
export interface ReinforceGroupResult {
  reinforced: number;
  failed: number;
}

// ============================================================================
// Graph Extended Types
// ============================================================================

/**
 * Graph neighbors
 */
export interface GraphNeighbors {
  nodeId: string;
  neighbors: Array<{
    id: string;
    type: string;
    relationship: Relationship;
  }>;
}

/**
 * Graph statistics
 */
export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  avgDegree: number;
  density: number;
  components: number;
}

/**
 * Weights used in hybrid scoring
 */
export interface HybridScoringWeights {
  semantic: number;
  graph: number;
  coActivation: number;
  recency: number;
  salience: number;
}

/**
 * Scoring metadata for graph expansion
 */
export interface GraphExpansionScoring {
  applied: boolean;
  weights?: HybridScoringWeights;
}

/**
 * Statistics from graph expansion
 */
export interface GraphExpansionStats {
  seedCount: number;
  expandedCount: number;
  finalCount: number;
  relationshipsFound?: number;
  hopsUsed?: number;
}

/**
 * Result of graph expansion from seed memories
 */
export interface GraphExpansionResult {
  seedMemories: string[];
  expandedMemories: Memory[];
  relationships: Relationship[];
  stats: GraphExpansionStats;
  scoring?: GraphExpansionScoring;
}

/**
 * Parameters for graph expansion
 */
export interface GraphExpandParams {
  seedMemoryIds: string[];
  maxHops?: number;
  minWeight?: number;
  relationshipTypes?: string[];
  direction?: 'incoming' | 'outgoing' | 'both';
  includeContent?: boolean;
  applyHybridScoring?: boolean;
}

// ============================================================================
// Agent Core Memory Types
// ============================================================================

/**
 * Core memory block
 */
export interface CoreMemoryBlock {
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
  updatedAt: string;
}

/**
 * Core memory
 */
export interface CoreMemory {
  blocks: CoreMemoryBlock[];
  updatedAt: string;
}

/**
 * Formatted core memory context
 */
export interface CoreMemoryContext {
  formatted: string;
  blocks: CoreMemoryBlock[];
}

// ============================================================================
// Webhook Extended Types
// ============================================================================

/**
 * Webhook event
 */
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

/**
 * Webhook event type info
 */
export interface WebhookEventType {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

/**
 * Webhook statistics
 */
export interface WebhookStats {
  totalDeliveries: number;
  successRate: number;
  avgLatency: number;
  byEvent: Record<string, {
    count: number;
    successRate: number;
  }>;
}

/**
 * Parameters for listing webhook events
 */
export interface ListWebhookEventsParams {
  limit?: number;
  page?: number;
  type?: string;
}

// ============================================================================
// Highlight Extended Types
// ============================================================================

/**
 * Parameters for searching highlights
 */
export interface SearchHighlightsParams {
  limit?: number;
  threshold?: number;
  spaceId?: string;
}

/**
 * Highlight search result
 */
export interface HighlightSearchResult {
  highlights: Array<{
    highlight: Highlight;
    score: number;
  }>;
}

/**
 * Highlight type info
 */
export interface HighlightType {
  name: string;
  count: number;
  color?: string;
}

/**
 * Parameters for linking highlight to memory
 */
export interface LinkHighlightParams {
  memoryId: string;
}

/**
 * Highlight link result
 */
export interface HighlightLinkResult {
  highlightId: string;
  memoryId: string;
  linked: boolean;
}

// ============================================================================
// Resource Types - Project/Topic Management for Memory Context
// ============================================================================

/**
 * Resource object - represents a project, topic, or other grouping for memories
 */
export interface Resource {
  id: string;
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a resource
 */
export interface CreateResourceParams {
  name: string;
  type?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a resource
 */
export interface UpdateResourceParams {
  name?: string;
  type?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing resources
 */
export interface ListResourcesParams {
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: 'created_at' | 'updated_at' | 'name' | 'type';
  order?: 'asc' | 'desc';
}

/**
 * Resource list response
 */
export interface ResourceListResult {
  data: Resource[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Memory-resource link
 */
export interface MemoryResource {
  memoryId: string;
  resourceId: string;
  relationshipType: ResourceRelationshipType;
  createdAt: string;
  resource?: Resource;
}

/**
 * Memory resources list response
 */
export interface MemoryResourcesResult {
  memoryId: string;
  data: Array<Resource & { relationshipType: ResourceRelationshipType; linkedAt: string }>;
}

/**
 * Resource memories list response
 */
export interface ResourceMemoriesResult {
  resourceId: string;
  data: Array<{
    id: string;
    content: string;
    relationshipType: ResourceRelationshipType;
    linkedAt: string;
    [key: string]: unknown;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Parameters for linking a resource to a memory
 */
export interface LinkResourceParams {
  resourceId: string;
  relationshipType?: ResourceRelationshipType;
}

/**
 * Result of linking a resource to a memory
 */
export interface LinkResourceResult {
  memoryId: string;
  resourceId: string;
  relationshipType: ResourceRelationshipType;
  linked: boolean;
}

/**
 * Result of unlinking a resource from a memory
 */
export interface UnlinkResourceResult {
  memoryId: string;
  resourceId: string;
  unlinked: boolean;
}

// ============================================================================
// Session Types - CLI Session Management
// ============================================================================

/**
 * Session type
 */
export type SessionType = 'conversation' | 'project' | 'task' | 'temporary';

/**
 * Session status
 */
export type SessionStatus = 'active' | 'paused' | 'completed' | 'archived';

/**
 * Session retention policy
 */
export type SessionRetentionPolicy = 'permanent' | 'auto_delete' | 'on_completion' | 'temporary';

/**
 * CLI Session object - represents a session for managing conversation/project/task contexts
 */
export interface CLISession {
  id: string;
  accountId: string;
  userId: string;
  createdBy: string;
  name: string;
  description?: string;
  type: SessionType;
  status: SessionStatus;
  spaceId?: string;
  originType?: string;
  tags?: string[];
  retentionPolicy: SessionRetentionPolicy;
  retentionDays?: number;
  summary?: string;
  isPrivate: boolean;
  messageCount: number;
  memoryCount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  pausedAt?: string;
  completedAt?: string;
  archivedAt?: string;
}

/**
 * Parameters for creating a CLI session
 */
export interface CreateCLISessionParams {
  name: string;
  description?: string;
  type?: SessionType;
  spaceId?: string;
  originType?: string;
  tags?: string[];
  retentionPolicy?: SessionRetentionPolicy;
  retentionDays?: number;
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating a CLI session
 */
export interface UpdateCLISessionParams {
  name?: string;
  description?: string;
  tags?: string[];
  retentionPolicy?: SessionRetentionPolicy;
  retentionDays?: number;
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for completing a CLI session
 */
export interface CompleteCLISessionParams {
  summary?: string;
}

/**
 * Parameters for listing CLI sessions
 */
export interface ListCLISessionsParams {
  status?: SessionStatus;
  type?: SessionType;
  spaceId?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  page?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActiveAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * CLI Sessions paginated response
 */
export interface CLISessionsResponse extends PaginatedResponse<CLISession> {}

/**
 * CLI Session statistics
 */
export interface CLISessionStats {
  total: number;
  byStatus: Record<SessionStatus, number>;
  byType: Record<SessionType, number>;
  avgMemoriesPerSession: number;
  avgDurationMinutes: number;
  activeSessionsCount: number;
  totalMemories: number;
}
