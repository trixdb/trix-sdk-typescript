/**
 * Feedback type definitions for the Trix SDK.
 */

// ============================================================================
// Feedback Types
// ============================================================================

/**
 * Parameters for submitting feedback.
 */
export interface SubmitFeedbackParams {
  memoryId: string;
  type: 'positive' | 'negative' | 'neutral';
  comment?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Feedback result.
 */
export interface FeedbackResult {
  id: string;
  memoryId: string;
  type: string;
  createdAt: string;
}

/**
 * Parameters for quick feedback.
 */
export interface QuickFeedbackParams {
  memoryId: string;
  type: 'thumbs_up' | 'thumbs_down';
}

/**
 * Quick feedback result.
 */
export interface QuickFeedbackResult {
  success: boolean;
  memoryId: string;
}

/**
 * Parameters for batch feedback.
 */
export interface BatchFeedbackParams {
  feedback: Array<{
    memoryId: string;
    type: 'positive' | 'negative' | 'neutral';
    comment?: string;
  }>;
}

/**
 * Batch feedback result.
 */
export interface BatchFeedbackResult {
  success: number;
  failed: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
}
