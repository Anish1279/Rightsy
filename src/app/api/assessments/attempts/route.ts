import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/constants/auth";
import { getSessionUser } from "@/features/auth/services/auth-service";
import { assertSameOriginRequest } from "@/features/auth/services/request-security-service";
import { getAchievementUnlocks, getLevelFromXp, scoreAssessmentAttempt } from "@/features/assessment/services/assessment-engine";
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import { jsonOk, routeHandler } from "@/lib/api/api-response";

export const runtime = "nodejs";

const attemptSchema = z.object({
  kind: z.enum(["QUIZ", "SRT"]),
  moduleId: z.string().min(1).max(80),
  answers: z.array(z.object({}).passthrough()).min(1).max(100),
  durationMs: z.number().int().min(0).max(60 * 60 * 1000).default(0),
  startedAt: z.string().datetime().optional(),
  clientNonce: z.string().max(160).optional(),
});

type BreakdownItem = {
  questionId?: unknown;
  scenarioId?: unknown;
  quality?: unknown;
  isCorrect?: unknown;
  partialCredit?: unknown;
  score?: unknown;
  durationMs?: unknown;
} & Record<string, unknown>;

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function hashPayload(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getNextStreak(lastActivityAt: Date | null | undefined, now: Date, currentStreak: number): number {
  if (!lastActivityAt) return 1;

  const today = startOfUtcDay(now).getTime();
  const last = startOfUtcDay(lastActivityAt).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (last === today) return Math.max(1, currentStreak);
  if (today - last === dayMs) return currentStreak + 1;
  return 1;
}

function withIntegrityAdjustedXp<T extends { xpEarned: number; integrityFlags: string[] }>(result: T): T {
  const severeFlags = new Set([
    "UNKNOWN_OPTION",
    "UNKNOWN_QUESTION",
    "UNKNOWN_DECISION",
    "DUPLICATE_QUESTION",
    "SCENARIO_PATH_MISMATCH",
    "EXTRA_RESPONSE",
  ]);
  const hasSevereFlag = result.integrityFlags.some((flag) => severeFlags.has(flag));

  if (!hasSevereFlag) return result;

  return {
    ...result,
    xpEarned: Math.max(2, Math.round(result.xpEarned * 0.25)),
    integrityFlags: [...new Set([...result.integrityFlags, "XP_LIMITED_BY_INTEGRITY"])],
  };
}

export async function POST(request: Request) {
  return routeHandler(async () => {
    await assertSameOriginRequest(request);
    const cookieStore = await cookies();
    const user = await getSessionUser(cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value);
    const input = attemptSchema.parse(await request.json());
    const scored = scoreAssessmentAttempt(input.kind, input.moduleId, input.answers, {
      durationMs: input.durationMs,
      startedAt: input.startedAt,
    });

    if (!scored) {
      throw new AppError("Assessment not found", "NOT_FOUND", 404);
    }

    const result = withIntegrityAdjustedXp(scored);
    const now = new Date();
    const answerHash = hashPayload({
      kind: input.kind,
      moduleId: input.moduleId,
      answers: input.answers,
    });

    const lastAttempt = await prisma.assessmentAttempt.findFirst({
      where: {
        userId: user.id,
        kind: input.kind,
        moduleId: input.moduleId,
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, answersJson: true },
    });

    if (lastAttempt) {
      const secondsSinceLastAttempt = (now.getTime() - lastAttempt.createdAt.getTime()) / 1000;
      const lastAnswerHash = hashPayload({
        kind: input.kind,
        moduleId: input.moduleId,
        answers: parseJson(lastAttempt.answersJson, []),
      });

      if (secondsSinceLastAttempt < 8 && lastAnswerHash === answerHash) {
        throw new AppError("Please wait a moment before submitting the same assessment again.", "RATE_LIMITED", 429);
      }
    }

    const existingAttemptCount = await prisma.assessmentAttempt.count({
      where: { userId: user.id },
    });

    const persisted = await prisma.$transaction(async (tx) => {
      const existingSummary = await tx.userAssessmentSummary.findUnique({
        where: { userId: user.id },
      });
      const currentStreak = getNextStreak(existingSummary?.lastActivityAt, now, existingSummary?.currentStreak || 0);
      const totalXp = (existingSummary?.totalXp || 0) + result.xpEarned;
      const summaryLevel = getLevelFromXp(totalXp);

      const summary = await tx.userAssessmentSummary.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalXp,
          level: summaryLevel,
          currentStreak,
          longestStreak: currentStreak,
          lastActivityAt: now,
        },
        update: {
          totalXp,
          level: summaryLevel,
          currentStreak,
          longestStreak: Math.max(existingSummary?.longestStreak || 0, currentStreak),
          lastActivityAt: now,
        },
      });

      const existingProgress = await tx.assessmentProgress.findUnique({
        where: {
          userId_kind_moduleId: {
            userId: user.id,
            kind: input.kind,
            moduleId: input.moduleId,
          },
        },
      });
      const moduleStreak = getNextStreak(existingProgress?.lastCompletedAt, now, existingProgress?.streakCount || 0);
      const moduleXp = (existingProgress?.xp || 0) + result.xpEarned;
      const moduleProgress = await tx.assessmentProgress.upsert({
        where: {
          userId_kind_moduleId: {
            userId: user.id,
            kind: input.kind,
            moduleId: input.moduleId,
          },
        },
        create: {
          userId: user.id,
          kind: input.kind,
          moduleId: input.moduleId,
          bestScore: result.score,
          bestAccuracy: result.accuracy,
          attempts: 1,
          mastery: Math.max(0, Math.min(1, 0.35 + result.masteryDelta)),
          xp: result.xpEarned,
          level: getLevelFromXp(result.xpEarned),
          streakCount: 1,
          lastCompletedAt: now,
          weakTopicsJson: JSON.stringify(result.weakTopics),
        },
        update: {
          bestScore: Math.max(existingProgress?.bestScore || 0, result.score),
          bestAccuracy: Math.max(existingProgress?.bestAccuracy || 0, result.accuracy),
          attempts: { increment: 1 },
          mastery: Math.max(0, Math.min(1, (existingProgress?.mastery || 0) + result.masteryDelta)),
          xp: moduleXp,
          level: getLevelFromXp(moduleXp),
          streakCount: moduleStreak,
          lastCompletedAt: now,
          weakTopicsJson: JSON.stringify(result.weakTopics),
        },
      });

      const attempt = await tx.assessmentAttempt.create({
        data: {
          userId: user.id,
          kind: input.kind,
          moduleId: input.moduleId,
          score: result.score,
          maxScore: result.maxScore,
          xpEarned: result.xpEarned,
          accuracy: result.accuracy,
          masteryDelta: result.masteryDelta,
          durationMs: input.durationMs,
          startedAt: input.startedAt ? new Date(input.startedAt) : null,
          completedAt: now,
          answersJson: JSON.stringify(input.answers),
          breakdownJson: JSON.stringify(result.breakdown),
          integrityFlagsJson: JSON.stringify(result.integrityFlags),
        },
      });

      const breakdownItems = result.breakdown as BreakdownItem[];

      await tx.learningEvent.createMany({
        data: breakdownItems.map((item) => ({
          userId: user.id,
          eventType: input.kind === "QUIZ" ? "QUESTION_ANSWERED" : "SRT_DECISION",
          kind: input.kind,
          moduleId: input.moduleId,
          questionId:
            typeof item.questionId === "string"
              ? item.questionId
              : typeof item.scenarioId === "string"
                ? item.scenarioId
                : null,
          quality:
            typeof item.quality === "string"
              ? item.quality
              : item.isCorrect
                ? "correct"
                : item.partialCredit
                  ? "partial"
                  : "incorrect",
          score: typeof item.score === "number" ? item.score : null,
          durationMs: typeof item.durationMs === "number" ? item.durationMs : null,
          metadataJson: JSON.stringify(item),
        })),
      });

      const existingAchievements = await tx.achievement.findMany({
        where: { userId: user.id },
        select: { achievementKey: true },
      });
      const unlocks = getAchievementUnlocks({
        result,
        summary,
        existingAchievementKeys: existingAchievements.map((achievement) => achievement.achievementKey),
        isFirstAttempt: existingAttemptCount === 0,
      });

      for (const achievement of unlocks) {
        await tx.achievement.upsert({
          where: {
            userId_achievementKey: {
              userId: user.id,
              achievementKey: achievement.key,
            },
          },
          create: {
            userId: user.id,
            achievementKey: achievement.key,
            title: achievement.title,
            description: achievement.description,
            metadataJson: JSON.stringify({ icon: achievement.icon, source: input.kind, moduleId: input.moduleId }),
          },
          update: {},
        });
      }

      return {
        attempt,
        moduleProgress,
        summary,
        achievements: unlocks,
      };
    });

    return jsonOk({
      result,
      attemptId: persisted.attempt.id,
      progress: {
        module: persisted.moduleProgress,
        summary: persisted.summary,
      },
      achievements: persisted.achievements,
    });
  });
}
