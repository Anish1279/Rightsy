import { jwtVerify, SignJWT } from "jose";
import { ADMIN_JWT_EXPIRES_IN } from "@/constants/auth";
import { AppError } from "@/lib/errors/app-error";
import type { AdminLoginInput } from "@/features/admin/schemas/admin-auth-schemas";

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET || "supersecretfallback");
}

function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_PASSWORD;
}

export async function loginAdmin(input: AdminLoginInput): Promise<string> {
  const adminPassword = getAdminPassword();

  if (!adminPassword || input.password !== adminPassword) {
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

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    return payload.role === "admin";
  } catch {
    return false;
  }
}
