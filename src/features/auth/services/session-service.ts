import prisma from "@/lib/prisma";
import {
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/constants/auth";
import { AppError } from "@/lib/errors/app-error";
import { createOpaqueToken, hashRefreshToken, safeEqual } from "@/features/auth/services/crypto-service";
import type { RequestMetadata, SessionUserDto } from "@/features/auth/types/auth-types";

type SessionIssueResult = {
  sessionId: string;
  refreshToken: string;
  user: SessionUserDto;
};

function getRefreshExpiry(now = new Date()): Date {
  return new Date(now.getTime() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);
}

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

export async function issueSessionForUser(
  user: SessionUserDto,
  metadata: RequestMetadata = {}
): Promise<SessionIssueResult> {
  const now = new Date();
  const refreshToken = createOpaqueToken();
  const tokenFamilyId = globalThis.crypto.randomUUID();
  const expiresAt = getRefreshExpiry(now);

  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.session.create({
      data: {
        userId: user.id,
        refreshTokenFamily: tokenFamilyId,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt,
      },
      select: { id: true },
    });

    await tx.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(refreshToken),
        tokenFamilyId,
        userId: user.id,
        sessionId: createdSession.id,
        expiresAt,
        createdByIp: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
    });

    return createdSession;
  });

  return {
    sessionId: session.id,
    refreshToken,
    user,
  };
}

export async function rotateRefreshSession(
  refreshToken: string | undefined,
  metadata: RequestMetadata = {}
): Promise<SessionIssueResult> {
  if (!refreshToken) {
    throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const now = new Date();
  const nextRefreshToken = createOpaqueToken();
  const nextTokenHash = hashRefreshToken(nextRefreshToken);
  const nextExpiresAt = getRefreshExpiry(now);

  return prisma.$transaction(async (tx) => {
    const currentToken = await tx.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        session: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            lockedUntil: true,
          },
        },
      },
    });

    if (!currentToken || !safeEqual(currentToken.tokenHash, tokenHash)) {
      throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (currentToken.rotatedAt || currentToken.revokedAt || currentToken.reuseDetectedAt) {
      await tx.refreshToken.updateMany({
        where: { tokenFamilyId: currentToken.tokenFamilyId },
        data: {
          revokedAt: now,
          reuseDetectedAt: now,
        },
      });
      await tx.session.update({
        where: { id: currentToken.sessionId },
        data: {
          status: "COMPROMISED",
          revokedAt: now,
          revocationReason: "refresh_token_reuse",
        },
      });

      throw new AppError("Session replay detected", "SESSION_REPLAY_DETECTED", 401);
    }

    if (
      currentToken.expiresAt <= now ||
      currentToken.session.expiresAt <= now ||
      currentToken.session.status !== "ACTIVE"
    ) {
      await tx.session.update({
        where: { id: currentToken.sessionId },
        data: {
          status: "EXPIRED",
          revokedAt: currentToken.session.revokedAt ?? now,
          revocationReason: currentToken.session.revocationReason ?? "expired",
        },
      });

      throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (currentToken.user.lockedUntil && currentToken.user.lockedUntil > now) {
      throw new AppError("Account temporarily locked", "ACCOUNT_LOCKED", 423);
    }

    const nextToken = await tx.refreshToken.create({
      data: {
        tokenHash: nextTokenHash,
        tokenFamilyId: currentToken.tokenFamilyId,
        userId: currentToken.userId,
        sessionId: currentToken.sessionId,
        expiresAt: nextExpiresAt,
        createdByIp: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
      select: { id: true },
    });

    await tx.refreshToken.update({
      where: { id: currentToken.id },
      data: {
        rotatedAt: now,
        revokedAt: now,
        replacedByTokenId: nextToken.id,
      },
    });

    await tx.session.update({
      where: { id: currentToken.sessionId },
      data: {
        lastSeenAt: now,
        expiresAt: nextExpiresAt,
        userAgent: metadata.userAgent ?? currentToken.session.userAgent,
        ipAddress: metadata.ipAddress ?? currentToken.session.ipAddress,
      },
    });

    return {
      sessionId: currentToken.sessionId,
      refreshToken: nextRefreshToken,
      user: toSessionUser(currentToken.user),
    };
  });
}

export async function revokeSession(sessionId: string, reason = "logout"): Promise<void> {
  const now = new Date();

  await prisma.$transaction([
    prisma.refreshToken.updateMany({
      where: { sessionId, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.session.updateMany({
      where: { id: sessionId },
      data: {
        status: "REVOKED",
        revokedAt: now,
        revocationReason: reason,
      },
    }),
  ]);
}

export async function revokeRefreshTokenSession(refreshToken?: string, reason = "logout"): Promise<void> {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const token = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    select: { sessionId: true },
  });

  if (token) {
    await revokeSession(token.sessionId, reason);
  }
}

export async function assertSessionIsActive(sessionId: string): Promise<SessionUserDto> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      status: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          lockedUntil: true,
        },
      },
    },
  });

  const now = new Date();

  if (!session || session.status !== "ACTIVE" || session.expiresAt <= now) {
    throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
  }

  if (session.user.lockedUntil && session.user.lockedUntil > now) {
    throw new AppError("Account temporarily locked", "ACCOUNT_LOCKED", 423);
  }

  return toSessionUser(session.user);
}
