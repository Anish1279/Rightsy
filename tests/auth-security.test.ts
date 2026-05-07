import { describe, expect, it, beforeEach } from "vitest";
import { AppError } from "@/lib/errors/app-error";
import { loginSchema, signupSchema } from "@/features/auth/schemas/auth-schemas";
import { assertRateLimit, rateLimitPolicies } from "@/features/auth/services/rate-limit-service";
import { hashRefreshToken } from "@/features/auth/services/crypto-service";
import { signAccessToken, verifyAccessToken } from "@/features/auth/services/token-service";

beforeEach(() => {
  process.env.JWT_ACCESS_SECRET = "access-secret-for-tests-minimum-32-characters";
  process.env.JWT_REFRESH_SECRET = "refresh-secret-for-tests-minimum-32-characters";
  process.env.AUTH_ISSUER = "rightsy-test";
  process.env.AUTH_AUDIENCE = "rightsy-web-test";
});

describe("auth validation", () => {
  it("rejects weak signup passwords", () => {
    const result = signupSchema.safeParse({
      name: "Rightsy User",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes login email addresses", () => {
    const result = loginSchema.parse({
      email: "  USER@Example.COM ",
      password: "anything",
    });

    expect(result.email).toBe("user@example.com");
  });
});

describe("access tokens", () => {
  it("signs and verifies short-lived access tokens with session context", async () => {
    const token = await signAccessToken(
      {
        id: "user_123",
        email: "user@example.com",
        name: "Rightsy User",
        role: "USER",
      },
      "session_123"
    );

    const payload = await verifyAccessToken(token);

    expect(payload).toMatchObject({
      id: "user_123",
      email: "user@example.com",
      name: "Rightsy User",
      role: "USER",
      sessionId: "session_123",
    });
    expect(payload?.jti).toEqual(expect.any(String));
    expect(payload?.exp).toEqual(expect.any(Number));
  });

  it("rejects tampered tokens", async () => {
    const token = await signAccessToken(
      {
        id: "user_123",
        email: "user@example.com",
        name: null,
        role: "USER",
      },
      "session_123"
    );
    const tampered = `${token.slice(0, -2)}xx`;

    await expect(verifyAccessToken(tampered)).resolves.toBeNull();
  });
});

describe("refresh token storage", () => {
  it("hashes refresh tokens with a server-side secret", () => {
    const rawToken = "opaque-refresh-token";
    const hash = hashRefreshToken(rawToken);

    expect(hash).not.toBe(rawToken);
    expect(hash).toHaveLength(64);
    expect(hashRefreshToken(rawToken)).toBe(hash);
  });
});

describe("rate limiting", () => {
  it("blocks requests after the policy limit", () => {
    const key = `test-${crypto.randomUUID()}`;

    for (let attempt = 0; attempt < rateLimitPolicies.login.max; attempt += 1) {
      assertRateLimit("login", key);
    }

    expect(() => assertRateLimit("login", key)).toThrow(AppError);
  });
});
