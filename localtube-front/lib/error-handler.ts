/**
 * Error handling utilities for API requests
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('fetch failed')
    );
  }

  return false;
}

export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 401;
  }

  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 400;
  }

  return false;
}

export function getUserFriendlyMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (isAuthenticationError(error)) {
    return 'Your session has expired. Please log in again.';
  }

  if (isValidationError(error)) {
    if (error instanceof ApiError && error.data) {
      return `Invalid input: ${JSON.stringify(error.data)}`;
    }
    return 'Please check your input and try again.';
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  return getErrorMessage(error);
}
