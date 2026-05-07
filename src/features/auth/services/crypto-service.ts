import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getAuthEnv } from "@/lib/config/auth-env";

const TOKEN_BYTES = 64;

export function createOpaqueToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHmac("sha256", getAuthEnv().refreshTokenSecret).update(token).digest("hex");
}

export function hashOneTimeToken(token: string): string {
  return createHmac("sha256", getAuthEnv().refreshTokenSecret).update(`one-time:${token}`).digest("hex");
}

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
