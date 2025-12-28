/**
 * Custom error classes for the TrixDB SDK
 */

/**
 * Base error class for all TrixDB errors
 */
export class TrixDBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrixDBError';
    Object.setPrototypeOf(this, TrixDBError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends TrixDBError {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends TrixDBError {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when permission is denied (403)
 */
export class PermissionError extends TrixDBError {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'PermissionError';
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends TrixDBError {
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
export class RateLimitError extends TrixDBError {
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
export class NetworkError extends TrixDBError {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when the API returns an unexpected error
 */
export class APIError extends TrixDBError {
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
export class TimeoutError extends TrixDBError {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Error thrown when server returns 5xx error
 */
export class ServerError extends TrixDBError {
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
export class APIVersionMismatchError extends TrixDBError {
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
