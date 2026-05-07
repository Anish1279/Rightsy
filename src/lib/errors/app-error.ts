export type AppErrorCode =
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR"
  | "INVALID_CREDENTIALS"
  | "NOT_FOUND"
  | "RATE_LIMITED"
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
