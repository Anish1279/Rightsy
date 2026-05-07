"use client";

import {
  ASSESSMENT_STORAGE_KEY,
  buildProgressFromResult,
  createEmptyAssessmentProgress,
} from "@/features/assessment/services/assessment-engine";

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

export function loadLocalAssessmentProgress() {
  if (typeof window === "undefined") return createEmptyAssessmentProgress();
  const progress = safeParse(window.localStorage.getItem(ASSESSMENT_STORAGE_KEY), null);
  return progress || createEmptyAssessmentProgress();
}

export function saveLocalAssessmentProgress(progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(progress));
}

export function mergeServerProgress(serverProgress, localProgress = loadLocalAssessmentProgress()) {
  if (!serverProgress) return localProgress;

  return {
    ...localProgress,
    ...serverProgress,
    totalXp: Math.max(Number(localProgress.totalXp) || 0, Number(serverProgress.totalXp) || 0),
    level: Math.max(Number(localProgress.level) || 1, Number(serverProgress.level) || 1),
    currentStreak: Math.max(Number(localProgress.currentStreak) || 0, Number(serverProgress.currentStreak) || 0),
    longestStreak: Math.max(Number(localProgress.longestStreak) || 0, Number(serverProgress.longestStreak) || 0),
    modules: {
      ...(localProgress.modules || {}),
      ...(serverProgress.modules || {}),
    },
    achievements: serverProgress.achievements || localProgress.achievements || [],
    recentAttempts: serverProgress.recentAttempts || localProgress.recentAttempts || [],
  };
}

export function recordLocalAssessmentResult(result) {
  const current = loadLocalAssessmentProgress();
  const next = buildProgressFromResult(current, result);
  saveLocalAssessmentProgress(next);
  return next;
}

export function getLegacyCompletedLevels(progress = loadLocalAssessmentProgress()) {
  const completedLevels = {};

  for (const item of Object.values(progress.modules || {})) {
    if (item.kind !== "QUIZ") continue;
    const numericLevel = Number(item.numericLevel);
    if (numericLevel) completedLevels[numericLevel] = item.bestScore;
  }

  return completedLevels;
}
