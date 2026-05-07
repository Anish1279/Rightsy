import type { LoginInput, RegisterInput } from "@/features/auth/schemas/auth-schemas";

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (!isRecord(body)) {
    return fallback;
  }

  if (typeof body.message === "string") {
    return body.message;
  }

  if (isRecord(body.error) && typeof body.error.message === "string") {
    return body.error.message;
  }

  return fallback;
}

async function postJson(endpoint: string, payload: LoginInput | RegisterInput, fallback: string): Promise<void> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, fallback));
  }
}

export function loginRequest(input: LoginInput): Promise<void> {
  return postJson("/api/auth/login", input, "Failed to sign in");
}

export function registerRequest(input: RegisterInput): Promise<void> {
  return postJson("/api/auth/register", input, "Failed to sign up");
}
