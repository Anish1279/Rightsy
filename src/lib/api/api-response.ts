import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAppError } from "@/lib/errors/app-error";

type ApiErrorBody = {
  message: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, init);
}

export function jsonError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Validation error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation error",
          details: error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  if (isAppError(error)) {
    return NextResponse.json(
      {
        message: error.message,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      message: "Internal server error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
    },
    { status: 500 }
  );
}

export async function routeHandler(
  handler: () => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error("[API_ERROR]", error);
    return jsonError(error);
  }
}
