import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { getSessionUser } from "@/features/auth/services/auth-service";
import { createEmptyAssessmentProgress } from "@/features/assessment/services/assessment-engine";
import prisma from "@/lib/prisma";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export const runtime = "nodejs";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function GET() {
  return routeHandler(async () => {
    const cookieStore = await cookies();
    const user = await getSessionUser(cookieStore.get(AUTH_COOKIE_NAME)?.value);

    const [summary, moduleProgress, achievements, recentAttempts] = await Promise.all([
      prisma.userAssessmentSummary.findUnique({
        where: { userId: user.id },
      }),
      prisma.assessmentProgress.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.achievement.findMany({
        where: { userId: user.id },
        orderBy: { unlockedAt: "desc" },
      }),
      prisma.assessmentAttempt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const empty = createEmptyAssessmentProgress();
    const modules = Object.fromEntries(
      moduleProgress.map((item) => [
        `${item.kind}:${item.moduleId}`,
        {
          kind: item.kind,
          moduleId: item.moduleId,
          attempts: item.attempts,
          bestAccuracy: item.bestAccuracy,
          bestScore: item.bestScore,
          mastery: item.mastery,
          xp: item.xp,
          level: item.level,
          streakCount: item.streakCount,
          lastCompletedAt: item.lastCompletedAt?.toISOString() || null,
          weakTopics: parseJson(item.weakTopicsJson, []),
        },
      ])
    );

    return jsonOk({
      progress: {
        ...empty,
        totalXp: summary?.totalXp || 0,
        level: summary?.level || 1,
        currentStreak: summary?.currentStreak || 0,
        longestStreak: summary?.longestStreak || 0,
        lastActivityAt: summary?.lastActivityAt?.toISOString() || null,
        modules,
        achievements: achievements.map((achievement) => ({
          key: achievement.achievementKey,
          title: achievement.title,
          description: achievement.description,
          unlockedAt: achievement.unlockedAt.toISOString(),
          metadata: parseJson(achievement.metadataJson, {}),
        })),
        recentAttempts: recentAttempts.map((attempt) => ({
          kind: attempt.kind,
          moduleId: attempt.moduleId,
          score: attempt.score,
          maxScore: attempt.maxScore,
          accuracy: attempt.accuracy,
          xpEarned: attempt.xpEarned,
          completedAt: attempt.completedAt.toISOString(),
          integrityFlags: parseJson(attempt.integrityFlagsJson, []),
        })),
      },
    });
  });
}
