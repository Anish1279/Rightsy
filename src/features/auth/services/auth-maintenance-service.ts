import prisma from "@/lib/prisma";

export async function cleanupExpiredAuthArtifacts(now = new Date()): Promise<void> {
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: now } }, { consumedAt: { not: null } }],
      },
    }),
    prisma.verificationToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: now } }, { consumedAt: { not: null } }],
      },
    }),
    prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: now },
        revokedAt: { not: null },
      },
    }),
    prisma.session.updateMany({
      where: {
        expiresAt: { lt: now },
        status: "ACTIVE",
      },
      data: {
        status: "EXPIRED",
        revokedAt: now,
        revocationReason: "expired",
      },
    }),
  ]);
}
