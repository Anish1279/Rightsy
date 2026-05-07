export type AppErrorCode =
  | "ACCOUNT_LOCKED"
  | "CONFLICT"
  | "CSRF_CHECK_FAILED"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"
  | "INVALID_CREDENTIALS"
  | "INVALID_TOKEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SESSION_REPLAY_DETECTED"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly statusCode: number;

  constructor(message: string, code: AppErrorCode, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
