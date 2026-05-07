import { headers } from "next/headers";
import { AppError } from "@/lib/errors/app-error";
import type { RequestMetadata } from "@/features/auth/types/auth-types";

function normalizeHost(value: string | null): string | null {
  return value?.split(",")[0]?.trim().toLowerCase() || null;
}

export async function getRequestMetadata(): Promise<RequestMetadata> {
  const headerStore = await headers();

  return {
    ipAddress:
      normalizeHost(headerStore.get("x-forwarded-for")) ??
      normalizeHost(headerStore.get("x-real-ip")) ??
      undefined,
    userAgent: headerStore.get("user-agent") ?? undefined,
  };
}

export async function assertSameOriginRequest(request: Request): Promise<void> {
  const method = request.method.toUpperCase();

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    throw new AppError("Request origin could not be verified", "CSRF_CHECK_FAILED", 403);
  }

  let originHost: string;

  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    throw new AppError("Request origin could not be verified", "CSRF_CHECK_FAILED", 403);
  }

  if (originHost !== host.toLowerCase()) {
    throw new AppError("Request origin could not be verified", "CSRF_CHECK_FAILED", 403);
  }
}
