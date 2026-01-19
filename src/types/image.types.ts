/**
 * Image type definitions for the Trix SDK.
 * Supports visual memory and multi-modal search.
 */

import type { Memory, OriginType, SourceType, ProtectionLevel } from './memory.types.js';

// ============================================================================
// Image Memory Parameters
// ============================================================================

/**
 * Parameters for creating an image memory.
 */
export interface CreateImageMemoryParams {
  /** Image file as Buffer, Blob, or base64 string */
  image: Buffer | Blob | string;
  /** Optional text content/caption for the image */
  content?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Space ID to create memory in */
  spaceId?: string;
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

// ============================================================================
// Visual Search Types
// ============================================================================

/**
 * Parameters for visual similarity search.
 */
export interface VisualSearchParams {
  /** Image file as Buffer, Blob, or base64 string */
  image: Buffer | Blob | string;
  /** Maximum number of results */
  limit?: number;
  /** Minimum similarity threshold (0-1) */
  threshold?: number;
  /** Space ID to search within */
  spaceId?: string;
  /** Tags to filter by */
  tags?: string[];
}

/**
 * Result of visual search.
 */
export interface VisualSearchResult {
  results: Array<{
    memory: Memory;
    similarity: number;
  }>;
}

/**
 * Parameters for text-to-image search (multi-modal).
 */
export interface TextToImageSearchParams {
  /** Text query for finding images */
  query: string;
  /** Maximum number of results */
  limit?: number;
  /** Minimum similarity threshold (0-1) */
  threshold?: number;
  /** Space ID to search within */
  spaceId?: string;
  /** Tags to filter by */
  tags?: string[];
}

/**
 * Parameters for finding similar images.
 */
export interface FindSimilarImagesParams {
  /** Type of similarity search */
  type?: 'image' | 'content' | 'both';
  /** Maximum number of results */
  limit?: number;
  /** Minimum similarity threshold (0-1) */
  threshold?: number;
  /** Space ID to search within */
  spaceId?: string;
}

/**
 * Result of similar images search.
 */
export interface SimilarImagesResult {
  results: Array<{
    memory: Memory;
    similarity: number;
    matchType?: 'image' | 'content' | 'both';
  }>;
}

// ============================================================================
// Duplicate Detection
// ============================================================================

/**
 * Parameters for duplicate check.
 */
export interface CheckDuplicatesParams {
  /** Image file as Buffer, Blob, or base64 string */
  image: Buffer | Blob | string;
  /** Similarity threshold for considering duplicates (0-1, default: 0.95) */
  threshold?: number;
  /** Space ID to check within */
  spaceId?: string;
}

/**
 * Result of duplicate check.
 */
export interface DuplicateCheckResult {
  /** Whether duplicates were found */
  hasDuplicates: boolean;
  /** List of potential duplicate memories */
  duplicates: Array<{
    memory: Memory;
    similarity: number;
  }>;
}

// ============================================================================
// Image Clustering
// ============================================================================

/**
 * Parameters for clustering images.
 */
export interface ClusterImagesParams {
  /** Space ID to cluster images in */
  spaceId?: string;
  /** Number of clusters to create */
  numClusters?: number;
  /** Clustering algorithm to use */
  algorithm?: 'kmeans' | 'dbscan' | 'hierarchical';
  /** Minimum cluster size (for DBSCAN) */
  minClusterSize?: number;
}

/**
 * Result of image clustering.
 */
export interface ClusterImagesResult {
  /** Job ID for tracking clustering progress */
  jobId: string;
  /** Status of the clustering job */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Estimated number of images to cluster */
  estimatedImages?: number;
}

// ============================================================================
// Auto-Tagging
// ============================================================================

/**
 * Parameters for auto-tagging images.
 */
export interface AutoTagParams {
  /** Whether to save tags to the memory */
  save?: boolean;
  /** Minimum confidence for tags (0-1) */
  minConfidence?: number;
  /** Maximum number of tags to generate */
  maxTags?: number;
}

/**
 * Result of auto-tagging.
 */
export interface AutoTagResult {
  /** Memory/Image ID */
  imageId: string;
  /** Generated tags with confidence scores */
  tags: Array<{
    tag: string;
    confidence: number;
    category?: string;
  }>;
  /** Whether tags were saved to the memory */
  saved: boolean;
}

/**
 * Parameters for batch auto-tagging.
 */
export interface BatchAutoTagParams {
  /** Image/Memory IDs to auto-tag */
  imageIds: string[];
  /** Whether to save tags to the memories */
  save?: boolean;
  /** Minimum confidence for tags (0-1) */
  minConfidence?: number;
  /** Maximum number of tags per image */
  maxTags?: number;
}

/**
 * Result of batch auto-tagging.
 */
export interface BatchAutoTagResult {
  /** Results for each image */
  results: AutoTagResult[];
  /** Number of successfully processed images */
  success: number;
  /** Number of failed images */
  failed: number;
  /** Errors for failed images */
  errors?: Array<{
    imageId: string;
    message: string;
  }>;
}

// ============================================================================
// Query Suggestions
// ============================================================================

/**
 * Parameters for query suggestions.
 */
export interface SuggestQueriesParams {
  /** Space ID to get suggestions for */
  spaceId?: string;
  /** Maximum number of suggestions */
  limit?: number;
  /** Type of suggestions */
  type?: 'visual' | 'text' | 'both';
}

/**
 * Result of query suggestions.
 */
export interface QuerySuggestionsResult {
  /** Suggested queries */
  suggestions: Array<{
    query: string;
    type: 'visual' | 'text';
    estimatedResults?: number;
  }>;
}
