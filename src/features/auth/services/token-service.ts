import { jwtVerify, SignJWT } from "jose";
import { JWT_EXPIRES_IN } from "@/constants/auth";
import type { AuthTokenPayload, SessionUserDto } from "@/features/auth/types/auth-types";

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET || "supersecretfallback");
}

export async function signAuthToken(user: SessionUserDto): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (typeof payload.id !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
