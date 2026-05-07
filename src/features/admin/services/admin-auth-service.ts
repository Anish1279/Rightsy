import { jwtVerify, SignJWT } from "jose";
import { ADMIN_JWT_EXPIRES_IN } from "@/constants/auth";
import { AppError } from "@/lib/errors/app-error";
import { getAuthEnv, getOptionalAuthEnv } from "@/lib/config/auth-env";
import type { AdminLoginInput } from "@/features/admin/schemas/admin-auth-schemas";

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || getAuthEnv().accessTokenSecret);
}

function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

function safeStringEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

export async function loginAdmin(input: AdminLoginInput): Promise<string> {
  const adminPassword = getAdminPassword();

  if (!adminPassword || !safeStringEqual(input.password, adminPassword)) {
    throw new AppError("Invalid admin credentials", "INVALID_CREDENTIALS", 401);
  }

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_JWT_EXPIRES_IN)
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token?: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  if (!getOptionalAuthEnv() && !process.env.ADMIN_JWT_SECRET) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    return payload.role === "admin";
  } catch {
    return false;
  }
}
