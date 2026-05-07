import { AppError } from "@/lib/errors/app-error";

type RateLimitPolicy = {
  windowMs: number;
  max: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export const rateLimitPolicies = {
  login: { windowMs: 15 * 60 * 1000, max: 8 },
  signup: { windowMs: 60 * 60 * 1000, max: 10 },
  passwordReset: { windowMs: 60 * 60 * 1000, max: 4 },
  refresh: { windowMs: 60 * 1000, max: 30 },
} satisfies Record<string, RateLimitPolicy>;

function pruneExpired(now: number): void {
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function assertRateLimit(scope: keyof typeof rateLimitPolicies, identifier: string): void {
  const policy = rateLimitPolicies[scope];
  const now = Date.now();
  const key = `${scope}:${identifier}`;

  if (buckets.size > 10_000) {
    pruneExpired(now);
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + policy.windowMs,
    });
    return;
  }

  existing.count += 1;

  if (existing.count > policy.max) {
    throw new AppError("Too many attempts. Please wait before trying again.", "RATE_LIMITED", 429);
  }
}
