import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
} from "@/features/auth/schemas/auth-schemas";

type RequestOptions = RequestInit & {
  retryOnUnauthorized?: boolean;
};

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

export async function apiFetch(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  const { retryOnUnauthorized = true, ...fetchOptions } = options;
  const response = await fetch(endpoint, {
    credentials: "same-origin",
    ...fetchOptions,
  });

  if (response.status !== 401 || !retryOnUnauthorized || endpoint === "/api/auth/refresh") {
    return response;
  }

  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!refreshResponse.ok) {
    return response;
  }

  return fetch(endpoint, {
    credentials: "same-origin",
    ...fetchOptions,
  });
}

async function postJson(endpoint: string, payload: unknown, fallback: string): Promise<void> {
  const response = await apiFetch(endpoint, {
    method: "POST",
    retryOnUnauthorized: false,
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

export function signupRequest(input: SignupInput): Promise<void> {
  return postJson("/api/auth/signup", input, "Failed to sign up");
}

export function registerRequest(input: SignupInput): Promise<void> {
  return signupRequest(input);
}

export function forgotPasswordRequest(input: ForgotPasswordInput): Promise<void> {
  return postJson("/api/auth/forgot-password", input, "Failed to request password reset");
}

export function resetPasswordRequest(input: ResetPasswordInput): Promise<void> {
  return postJson("/api/auth/reset-password", input, "Failed to reset password");
}
