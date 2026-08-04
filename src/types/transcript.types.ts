/**
 * Transcript and audio type definitions for the Trix SDK.
 */

// ============================================================================
// Content Safety
// ============================================================================

/**
 * Timestamp range for content safety labels.
 */
export interface TimestampRange {
  start: number;
  end: number;
}

/**
 * Content safety detection result.
 */
export interface ContentSafetyLabel {
  label: string;
  confidence: number;
  severity: string;
  timestamp?: TimestampRange;
}

// ============================================================================
// Word-Level Timestamps
// ============================================================================

/**
 * Word-level timestamp with optional speaker label.
 */
export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  speaker?: string;
}

// ============================================================================
// Transcript Segments
// ============================================================================

/**
 * Transcript segment with speaker information and word-level details.
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

// ============================================================================
// Transcript Entities and Chapters
// ============================================================================

/**
 * Detected entity in transcript.
 */
export interface TranscriptEntity {
  id?: string;
  entityType: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

/**
 * Auto-generated chapter.
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

// ============================================================================
// Full Transcript
// ============================================================================

/**
 * Full transcript with metadata, segments, entities, and chapters.
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
  providerMetadata?: Record<string, unknown>;
  segments?: TranscriptSegment[];
  entities?: TranscriptEntity[];
  chapters?: TranscriptChapter[];
  words?: WordTimestamp[];
}

// ============================================================================
// Transcription Parameters
// ============================================================================

/**
 * Parameters for transcription.
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
