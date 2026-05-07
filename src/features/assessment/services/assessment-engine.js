import {
  achievementDefinitions,
  getQuizModuleById,
  getSrtMissionById,
} from "@/features/assessment/data/assessment-content";

export const ASSESSMENT_STORAGE_KEY = "rightsy.assessment.v1";
export const PASSING_ACCURACY = 70;

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

export function normalizeSelectedOptionIds(value) {
  return asArray(value)
    .map((item) => String(item))
    .filter(Boolean)
    .sort();
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getLevelFromXp(totalXp) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(totalXp, 0) / 120)) + 1);
}

function getLocalStreak(lastActivityAt, nowIso, currentStreak = 0) {
  if (!lastActivityAt) return 1;

  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date(nowIso);
  const last = new Date(lastActivityAt);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const previous = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());

  if (today === previous) return Math.max(1, currentStreak);
  if (today - previous === dayMs) return currentStreak + 1;
  return 1;
}

function getFeedbackByAccuracy(accuracy, kind) {
  if (kind === "SRT") {
    if (accuracy >= 90) return "Excellent judgment. You protected safety, dignity, and fairness.";
    if (accuracy >= 75) return "Strong choices. A few reactions can become even safer with practice.";
    if (accuracy >= 55) return "Good reflection. Review the consequences and try one calmer safety step.";
    return "This is a practice space. Read the safer reactions and try again with support-first thinking.";
  }

  if (accuracy >= 90) return "Excellent. You are connecting rights to real situations clearly.";
  if (accuracy >= 75) return "Strong work. Review the explanations to make the learning stick.";
  if (accuracy >= 55) return "Good effort. A retry after reviewing weak topics will help.";
  return "Keep going. Rights knowledge grows through calm practice, not pressure.";
}

function computeComboBonus(breakdown) {
  let current = 0;
  let best = 0;

  for (const item of breakdown) {
    if (item.isCorrect || item.quality === "safe") {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return {
    bestCombo: best,
    comboBonus: best >= 5 ? 20 : best >= 3 ? 10 : 0,
  };
}

function detectTimingFlags({ answers, durationMs, itemCount }) {
  const flags = [];
  const safeDuration = Number(durationMs) || 0;
  const minimumReadableMs = Math.max(1, itemCount) * 1200;

  if (safeDuration > 0 && safeDuration < minimumReadableMs) {
    flags.push("FAST_COMPLETION");
  }

  if (
    answers.some((answer) => {
      const answerDuration = Number(answer.durationMs) || 0;
      return answerDuration > 0 && answerDuration < 300;
    })
  ) {
    flags.push("RAPID_ANSWER");
  }

  return flags;
}

export function scoreQuestion(question, rawAnswer = {}) {
  const selectedOptionIds = normalizeSelectedOptionIds(rawAnswer.selectedOptionIds);
  const correctOptionIds = normalizeSelectedOptionIds(question.correctOptionIds);
  const points = Number(question.points) || 10;
  const knownOptionIds = new Set((question.options || []).map((option) => option.id));
  const unknownSelections = selectedOptionIds.filter((id) => !knownOptionIds.has(id));

  if (question.type === "multi-select") {
    const correctSet = new Set(correctOptionIds);
    const correctSelected = selectedOptionIds.filter((id) => correctSet.has(id)).length;
    const wrongSelected = selectedOptionIds.filter((id) => !correctSet.has(id)).length;
    const incorrectCount = Math.max(1, (question.options || []).length - correctOptionIds.length);
    const partialRatio = clamp(correctSelected / correctOptionIds.length - wrongSelected / incorrectCount, 0, 1);
    const earned = Math.round(points * partialRatio);
    const isCorrect = arraysEqual(selectedOptionIds, correctOptionIds);

    return {
      questionId: question.id,
      topic: question.topic,
      type: question.type,
      selectedOptionIds,
      correctOptionIds,
      score: earned,
      maxScore: points,
      isCorrect,
      partialCredit: !isCorrect && earned > 0,
      confidence: Number(rawAnswer.confidence) || null,
      durationMs: Number(rawAnswer.durationMs) || 0,
      explanation: question.explanation,
      reinforcement: question.reinforcement,
      unknownSelections,
    };
  }

  const isCorrect = arraysEqual(selectedOptionIds, correctOptionIds);

  return {
    questionId: question.id,
    topic: question.topic,
    type: question.type,
    selectedOptionIds,
    correctOptionIds,
    score: isCorrect ? points : 0,
    maxScore: points,
    isCorrect,
    partialCredit: false,
    confidence: Number(rawAnswer.confidence) || null,
    durationMs: Number(rawAnswer.durationMs) || 0,
    explanation: question.explanation,
    reinforcement: question.reinforcement,
    unknownSelections,
  };
}

export function scoreQuizAttempt(quizModule, answers = [], context = {}) {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const knownQuestionIds = new Set(quizModule.questions.map((question) => question.id));
  const submittedQuestionIds = answers.map((answer) => answer.questionId).filter(Boolean);
  const duplicateQuestionIds = submittedQuestionIds.filter((id, index) => submittedQuestionIds.indexOf(id) !== index);
  const unknownQuestionIds = submittedQuestionIds.filter((id) => !knownQuestionIds.has(id));
  const breakdown = quizModule.questions.map((question) => scoreQuestion(question, answerMap.get(question.id)));
  const score = breakdown.reduce((sum, item) => sum + item.score, 0);
  const maxScore = breakdown.reduce((sum, item) => sum + item.maxScore, 0);
  const correctCount = breakdown.filter((item) => item.isCorrect).length;
  const accuracy = maxScore > 0 ? round((score / maxScore) * 100, 1) : 0;
  const { bestCombo, comboBonus } = computeComboBonus(breakdown);
  const weakTopics = breakdown
    .filter((item) => item.score / item.maxScore < 0.7)
    .map((item) => item.topic)
    .filter(Boolean);
  const uniqueWeakTopics = [...new Set(weakTopics)];
  const integrityFlags = [
    ...detectTimingFlags({ answers, durationMs: context.durationMs, itemCount: quizModule.questions.length }),
    ...breakdown.flatMap((item) => (item.unknownSelections.length ? ["UNKNOWN_OPTION"] : [])),
    ...(unknownQuestionIds.length ? ["UNKNOWN_QUESTION"] : []),
    ...(duplicateQuestionIds.length ? ["DUPLICATE_QUESTION"] : []),
    ...(answers.length > quizModule.questions.length ? ["EXTRA_RESPONSE"] : []),
  ];
  const completionBonus = answers.length >= quizModule.questions.length ? 10 : 0;
  const difficultyBonus = quizModule.difficulty === "capstone" ? 12 : quizModule.difficulty === "applied" ? 8 : 4;
  const xpEarned = Math.max(5, Math.round(score + completionBonus + comboBonus + difficultyBonus));

  return {
    kind: "QUIZ",
    moduleId: quizModule.id,
    title: quizModule.title,
    score,
    maxScore,
    accuracy,
    correctCount,
    totalCount: quizModule.questions.length,
    bestCombo,
    comboBonus,
    xpEarned,
    masteryDelta: round((accuracy - 50) / 250, 3),
    weakTopics: uniqueWeakTopics,
    breakdown,
    feedback: getFeedbackByAccuracy(accuracy, "QUIZ"),
    integrityFlags: [...new Set(integrityFlags)],
  };
}

function getScenarioById(mission, scenarioId) {
  return mission.scenarios.find((scenario) => scenario.id === scenarioId) || null;
}

function getNextScenario(mission, currentScenario, decision) {
  if (decision?.nextScenarioId) return getScenarioById(mission, decision.nextScenarioId);

  const sorted = [...mission.scenarios].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((scenario) => scenario.id === currentScenario.id);
  return index >= 0 ? sorted[index + 1] || null : null;
}

export function getInitialSrtScenario(mission) {
  return [...mission.scenarios].sort((a, b) => a.order - b.order)[0] || null;
}

export function getSrtDecision(scenario, decisionId) {
  return scenario.decisions.find((decision) => decision.id === decisionId) || null;
}

export function getNextSrtScenarioForDecision(mission, scenarioId, decisionId) {
  const scenario = getScenarioById(mission, scenarioId);
  if (!scenario) return null;
  const decision = getSrtDecision(scenario, decisionId);
  return getNextScenario(mission, scenario, decision);
}

export function scoreSrtAttempt(mission, responses = [], context = {}) {
  const breakdown = [];
  const integrityFlags = [];
  let expectedScenario = getInitialSrtScenario(mission);

  for (const response of responses) {
    if (!expectedScenario) {
      integrityFlags.push("EXTRA_RESPONSE");
      break;
    }

    if (response.scenarioId !== expectedScenario.id) {
      integrityFlags.push("SCENARIO_PATH_MISMATCH");
      expectedScenario = getScenarioById(mission, response.scenarioId) || expectedScenario;
    }

    const scenario = expectedScenario;
    const decision = getSrtDecision(scenario, response.decisionId);

    if (!decision) {
      integrityFlags.push("UNKNOWN_DECISION");
      breakdown.push({
        scenarioId: scenario.id,
        category: scenario.category,
        quality: "invalid",
        score: 0,
        maxScore: 10,
        decisionId: response.decisionId,
        confidence: Number(response.confidence) || null,
        durationMs: Number(response.durationMs) || 0,
        consequence: "This response could not be verified.",
        explanation: "The assessment could not match this option to the scenario.",
        reinforcement: scenario.educationalReinforcement,
        dimensions: { safety: 0, empathy: 0, responsibility: 0, legality: 0 },
      });
      expectedScenario = getNextScenario(mission, scenario, null);
      continue;
    }

    breakdown.push({
      scenarioId: scenario.id,
      category: scenario.category,
      quality: decision.quality,
      score: decision.score,
      maxScore: 10,
      decisionId: decision.id,
      confidence: Number(response.confidence) || null,
      durationMs: Number(response.durationMs) || 0,
      consequence: decision.consequence,
      explanation: decision.explanation,
      reinforcement: decision.reinforcement,
      dimensions: decision.dimensions,
    });

    expectedScenario = getNextScenario(mission, scenario, decision);
  }

  if (expectedScenario) {
    integrityFlags.push("INCOMPLETE_SCENARIO_PATH");
  }

  const score = breakdown.reduce((sum, item) => sum + item.score, 0);
  const maxScore = Math.max(1, breakdown.length * 10);
  const accuracy = round((score / maxScore) * 100, 1);
  const { bestCombo, comboBonus } = computeComboBonus(breakdown);
  const dimensions = ["safety", "empathy", "responsibility", "legality"].reduce((acc, key) => {
    const total = breakdown.reduce((sum, item) => sum + (Number(item.dimensions?.[key]) || 0), 0);
    acc[key] = breakdown.length ? round((total / (breakdown.length * 10)) * 100, 1) : 0;
    return acc;
  }, {});
  const weakTopics = breakdown
    .filter((item) => item.score / item.maxScore < 0.7)
    .map((item) => item.category)
    .filter(Boolean);
  const completionBonus = !expectedScenario ? 12 : 0;
  const safetyBonus = dimensions.safety >= 85 ? 12 : 0;
  const xpEarned = Math.max(5, Math.round(score + completionBonus + comboBonus + safetyBonus));

  return {
    kind: "SRT",
    moduleId: mission.id,
    title: mission.title,
    score,
    maxScore,
    accuracy,
    correctCount: breakdown.filter((item) => item.quality === "safe").length,
    totalCount: breakdown.length,
    bestCombo,
    comboBonus,
    xpEarned,
    masteryDelta: round((accuracy - 50) / 230, 3),
    weakTopics: [...new Set(weakTopics)],
    dimensions,
    breakdown,
    feedback: getFeedbackByAccuracy(accuracy, "SRT"),
    integrityFlags: [
      ...new Set([
        ...integrityFlags,
        ...detectTimingFlags({ answers: responses, durationMs: context.durationMs, itemCount: breakdown.length || 1 }),
      ]),
    ],
  };
}

export function scoreAssessmentAttempt(kind, moduleId, answers, context = {}) {
  if (kind === "QUIZ") {
    const quizModule = getQuizModuleById(moduleId);
    if (!quizModule) return null;
    return scoreQuizAttempt(quizModule, answers, context);
  }

  if (kind === "SRT") {
    const mission = getSrtMissionById(moduleId);
    if (!mission) return null;
    return scoreSrtAttempt(mission, answers, context);
  }

  return null;
}

export function buildProgressFromResult(existingProgress = {}, result) {
  const moduleKey = `${result.kind}:${result.moduleId}`;
  const moduleProgress = existingProgress.modules?.[moduleKey] || {};
  const previousTotalXp = Number(existingProgress.totalXp) || 0;
  const totalXp = previousTotalXp + result.xpEarned;
  const nowIso = new Date().toISOString();
  const currentStreak = getLocalStreak(existingProgress.lastActivityAt, nowIso, Number(existingProgress.currentStreak) || 0);
  const attempts = (Number(moduleProgress.attempts) || 0) + 1;
  const bestAccuracy = Math.max(Number(moduleProgress.bestAccuracy) || 0, result.accuracy);
  const bestScore = Math.max(Number(moduleProgress.bestScore) || 0, result.score);
  const mastery = clamp(round((Number(moduleProgress.mastery) || 0) + result.masteryDelta, 3), 0, 1);

  return {
    ...existingProgress,
    totalXp,
    level: getLevelFromXp(totalXp),
    currentStreak,
    longestStreak: Math.max(Number(existingProgress.longestStreak) || 0, currentStreak),
    lastActivityAt: nowIso,
    updatedAt: nowIso,
    modules: {
      ...(existingProgress.modules || {}),
      [moduleKey]: {
        kind: result.kind,
        moduleId: result.moduleId,
        attempts,
        bestAccuracy,
        bestScore,
        maxScore: result.maxScore,
        mastery,
        xp: (Number(moduleProgress.xp) || 0) + result.xpEarned,
        lastCompletedAt: nowIso,
        weakTopics: result.weakTopics,
      },
    },
    recentAttempts: [
      {
        kind: result.kind,
        moduleId: result.moduleId,
        title: result.title,
        score: result.score,
        maxScore: result.maxScore,
        accuracy: result.accuracy,
        xpEarned: result.xpEarned,
        completedAt: nowIso,
      },
      ...(existingProgress.recentAttempts || []),
    ].slice(0, 8),
  };
}

export function getAchievementUnlocks({ result, summary, existingAchievementKeys, isFirstAttempt = false }) {
  const existing = new Set(existingAchievementKeys || []);
  const unlocks = [];
  const add = (key) => {
    if (existing.has(key) || unlocks.some((achievement) => achievement.key === key)) return;
    const definition = achievementDefinitions.find((achievement) => achievement.key === key);
    if (definition) unlocks.push(definition);
  };

  if (isFirstAttempt) add("first-assessment");
  if (result.kind === "QUIZ" && result.accuracy >= 99.9) add("perfect-quiz");
  if (result.kind === "SRT" && (result.dimensions?.safety || 0) >= 85) add("safe-helper");
  if ((summary?.currentStreak || 0) >= 3) add("rights-streak-3");
  if ((summary?.level || 1) >= 5) add("level-5");

  return unlocks;
}

export function getAssessmentCatalogProgress(progress = {}) {
  const modules = progress.modules || {};

  return {
    totalXp: Number(progress.totalXp) || 0,
    level: Number(progress.level) || 1,
    currentStreak: Number(progress.currentStreak) || 0,
    longestStreak: Number(progress.longestStreak) || 0,
    modules,
  };
}

export function isQuizUnlocked(quizModule, progress = {}) {
  if (quizModule.numericLevel <= 1) return true;
  const requiredLevel = quizModule.numericLevel - 1;
  return Object.values(progress.modules || {}).some((item) => {
    const assessment = item.kind === "QUIZ" ? getQuizModuleById(item.moduleId) : null;
    return assessment?.numericLevel === requiredLevel && item.bestAccuracy >= PASSING_ACCURACY;
  });
}

export function summarizeWeakTopics(progress = {}) {
  const counts = new Map();

  for (const moduleProgress of Object.values(progress.modules || {})) {
    for (const topic of moduleProgress.weakTopics || []) {
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));
}

export function createEmptyAssessmentProgress() {
  return {
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    modules: {},
    recentAttempts: [],
    achievements: [],
  };
}
