import prisma from "@/lib/prisma";
import {
  EMAIL_VERIFICATION_TOKEN_MAX_AGE_HOURS,
  PASSWORD_RESET_TOKEN_MAX_AGE_MINUTES,
} from "@/constants/auth";
import { AppError } from "@/lib/errors/app-error";
import {
  createUser,
  findAuthUserByEmail,
  recordFailedLogin,
  resetFailedLoginState,
} from "@/features/user/services/user-service";
import { hashPassword, verifyPassword } from "@/features/auth/services/password-service";
import { signAccessToken, verifyAccessToken } from "@/features/auth/services/token-service";
import {
  issueSessionForUser,
  assertSessionIsActive,
  rotateRefreshSession,
  revokeSession,
} from "@/features/auth/services/session-service";
import { createOpaqueToken, hashOneTimeToken } from "@/features/auth/services/crypto-service";
import type { AuthResultDto, RequestMetadata, SessionUserDto } from "@/features/auth/types/auth-types";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
} from "@/features/auth/schemas/auth-schemas";

function toSessionUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
}): SessionUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

async function createAuthResult(user: SessionUserDto, metadata: RequestMetadata): Promise<AuthResultDto> {
  const session = await issueSessionForUser(user, metadata);
  const accessToken = await signAccessToken(user, session.sessionId);

  return {
    accessToken,
    refreshToken: session.refreshToken,
    sessionId: session.sessionId,
    user,
  };
}

async function recordAuthEvent(
  event: string,
  metadata: RequestMetadata,
  userId?: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  await prisma.authAuditLog.create({
    data: {
      userId,
      event,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      metadataJson: JSON.stringify(details),
    },
  });
}

export async function signupUser(input: SignupInput, metadata: RequestMetadata = {}): Promise<AuthResultDto> {
  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
  });
  const sessionUser = toSessionUser(user);
  const authResult = await createAuthResult(sessionUser, metadata);

  await recordAuthEvent("auth.signup", metadata, user.id);
  await createEmailVerificationToken(user.id, user.email);

  return authResult;
}

export async function registerUser(input: SignupInput, metadata: RequestMetadata = {}): Promise<AuthResultDto> {
  return signupUser(input, metadata);
}

export async function loginUser(input: LoginInput, metadata: RequestMetadata = {}): Promise<AuthResultDto> {
  const user = await findAuthUserByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
  }

  const now = new Date();

  if (user.lockedUntil && user.lockedUntil > now) {
    await recordAuthEvent("auth.login.locked", metadata, user.id);
    throw new AppError("Account temporarily locked", "ACCOUNT_LOCKED", 423);
  }

  const passwordValid = await verifyPassword(input.password, user.passwordHash);

  if (!passwordValid) {
    await recordFailedLogin(user.id);
    await recordAuthEvent("auth.login.failed", metadata, user.id);
    throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
  }

  await resetFailedLoginState(user.id);
  await recordAuthEvent("auth.login.succeeded", metadata, user.id);

  return createAuthResult(toSessionUser(user), metadata);
}

export async function refreshAuthSession(
  refreshToken: string | undefined,
  metadata: RequestMetadata = {}
): Promise<AuthResultDto> {
  const rotatedSession = await rotateRefreshSession(refreshToken, metadata);
  const accessToken = await signAccessToken(rotatedSession.user, rotatedSession.sessionId);

  await recordAuthEvent("auth.refresh.rotated", metadata, rotatedSession.user.id, {
    sessionId: rotatedSession.sessionId,
  });

  return {
    accessToken,
    refreshToken: rotatedSession.refreshToken,
    sessionId: rotatedSession.sessionId,
    user: rotatedSession.user,
  };
}

export async function getSessionUser(token?: string): Promise<SessionUserDto> {
  const payload = await verifyAccessToken(token);

  if (!payload) {
    throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
  }

  return assertSessionIsActive(payload.sessionId);
}

export async function logoutSession(accessToken?: string): Promise<void> {
  const payload = await verifyAccessToken(accessToken);

  if (payload) {
    await revokeSession(payload.sessionId, "logout");
  }
}

export async function createEmailVerificationToken(userId: string, email: string): Promise<string> {
  const token = createOpaqueToken();

  await prisma.verificationToken.create({
    data: {
      userId,
      email,
      tokenHash: hashOneTimeToken(token),
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_MAX_AGE_HOURS * 60 * 60 * 1000),
    },
  });

  return token;
}

export async function verifyEmailToken(token: string, metadata: RequestMetadata = {}): Promise<void> {
  const tokenHash = hashOneTimeToken(token);
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      consumedAt: true,
    },
  });

  if (
    !verificationToken ||
    !verificationToken.userId ||
    verificationToken.consumedAt ||
    verificationToken.expiresAt <= new Date()
  ) {
    throw new AppError("Verification token is invalid or expired", "INVALID_TOKEN", 400);
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { consumedAt: now },
    }),
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: now },
    }),
  ]);

  await recordAuthEvent("auth.email.verified", metadata, verificationToken.userId);
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
  metadata: RequestMetadata = {}
): Promise<void> {
  const user = await findAuthUserByEmail(input.email);

  if (!user) {
    return;
  }

  const token = createOpaqueToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashOneTimeToken(token),
      requestedIp: metadata.ipAddress,
      userAgent: metadata.userAgent,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_MAX_AGE_MINUTES * 60 * 1000),
    },
  });

  await recordAuthEvent("auth.password_reset.requested", metadata, user.id);
}

export async function resetPassword(input: ResetPasswordInput, metadata: RequestMetadata = {}): Promise<void> {
  const tokenHash = hashOneTimeToken(input.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      consumedAt: true,
    },
  });

  if (!resetToken || resetToken.consumedAt || resetToken.expiresAt <= new Date()) {
    throw new AppError("Reset token is invalid or expired", "INVALID_TOKEN", 400);
  }

  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { consumedAt: now },
    }),
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        passwordChangedAt: now,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    }),
    prisma.refreshToken.updateMany({
      where: {
        userId: resetToken.userId,
        revokedAt: null,
      },
      data: { revokedAt: now },
    }),
    prisma.session.updateMany({
      where: {
        userId: resetToken.userId,
        status: "ACTIVE",
      },
      data: {
        status: "REVOKED",
        revokedAt: now,
        revocationReason: "password_reset",
      },
    }),
  ]);

  await recordAuthEvent("auth.password_reset.completed", metadata, resetToken.userId);
}
