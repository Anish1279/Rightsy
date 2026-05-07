import { jwtVerify, SignJWT } from "jose";
import { ACCESS_TOKEN_EXPIRES_IN } from "@/constants/auth";
import { getAuthEnv, getOptionalAuthEnv } from "@/lib/config/auth-env";
import type { AccessTokenPayload, SessionUserDto } from "@/features/auth/types/auth-types";

function encodeSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function createJti(): string {
  return globalThis.crypto.randomUUID();
}

export async function signAccessToken(user: SessionUserDto, sessionId: string): Promise<string> {
  const env = getAuthEnv();

  return new SignJWT({
    typ: "access",
    email: user.email,
    name: user.name,
    role: user.role,
    sid: sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(env.issuer)
    .setAudience(env.audience)
    .setSubject(user.id)
    .setJti(createJti())
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(encodeSecret(env.accessTokenSecret));
}

export async function verifyAccessToken(token?: string): Promise<AccessTokenPayload | null> {
  if (!token) {
    return null;
  }

  const env = getOptionalAuthEnv();

  if (!env) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, encodeSecret(env.accessTokenSecret), {
      issuer: env.issuer,
      audience: env.audience,
    });

    if (
      payload.typ !== "access" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.sid !== "string" ||
      typeof payload.jti !== "string" ||
      (payload.role !== "USER" && payload.role !== "ADMIN")
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      role: payload.role,
      sessionId: payload.sid,
      jti: payload.jti,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export const signAuthToken = signAccessToken;
export const verifyAuthToken = verifyAccessToken;
