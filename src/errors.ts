/**
 * Custom error classes for the Trix SDK
 */

/**
 * Base error class for all Trix errors
 */
export class TrixError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrixError';
    Object.setPrototypeOf(this, TrixError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends TrixError {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends TrixError {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when permission is denied (403)
 */
export class PermissionError extends TrixError {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'PermissionError';
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Error thrown when a conflict occurs (HTTP 409)
 */
export class ConflictError extends TrixError {
  constructor(message: string, public readonly response?: unknown) {
    super(message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends TrixError {
  public errors?: Array<{ field: string; message: string }>;

  constructor(message = 'Validation failed', errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends TrixError {
  public retryAfter?: number;

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error thrown when a network request fails
 */
export class NetworkError extends TrixError {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when the API returns an unexpected error
 */
export class APIError extends TrixError {
  public statusCode?: number;
  public response?: unknown;

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Error thrown when a request timeout occurs
 */
export class TimeoutError extends TrixError {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Error thrown when server returns 5xx error
 */
export class ServerError extends TrixError {
  public statusCode: number;
  public response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Error thrown when SDK and API versions are incompatible
 */
export class APIVersionMismatchError extends TrixError {
  public sdkVersion: string;
  public apiVersion: string;
  public minSupported: string;
  public maxSupported: string;

  constructor(
    message: string,
    sdkVersion: string,
    apiVersion: string,
    minSupported: string,
    maxSupported: string
  ) {
    super(message);
    this.name = 'APIVersionMismatchError';
    this.sdkVersion = sdkVersion;
    this.apiVersion = apiVersion;
    this.minSupported = minSupported;
    this.maxSupported = maxSupported;
    Object.setPrototypeOf(this, APIVersionMismatchError.prototype);
  }
}

/**
 * Error thrown when file size exceeds the maximum allowed limit
 */
export class FileSizeError extends TrixError {
  public fileSize: number;
  public maxSize: number;

  constructor(fileSize: number, maxSize: number) {
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    super(`File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
    this.name = 'FileSizeError';
    this.fileSize = fileSize;
    this.maxSize = maxSize;
    Object.setPrototypeOf(this, FileSizeError.prototype);
  }
}

/**
 * Error thrown when an inbound webhook signature fails verification
 * (invalid signature, wrong secret, expired timestamp, or malformed header).
 */
export class WebhookVerificationError extends TrixError {
  constructor(message = 'Webhook signature verification failed') {
    super(message);
    this.name = 'WebhookVerificationError';
    Object.setPrototypeOf(this, WebhookVerificationError.prototype);
  }
}
