"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Home,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getNextQuizModule } from "@/features/assessment/data/assessment-content";
import { scoreQuestion, scoreQuizAttempt } from "@/features/assessment/services/assessment-engine";
import { submitAssessmentAttempt } from "@/features/assessment/services/assessment-api-client";
import { recordLocalAssessmentResult } from "@/features/assessment/services/progress-storage";

const optionMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function formatTopic(topic) {
  return String(topic || "practice").replaceAll("-", " ");
}

function getAccentClasses(accent) {
  const map = {
    violet: {
      hero: "from-violet-600 via-indigo-600 to-violet-800",
      soft: "bg-violet-50 text-violet-700 border-violet-200",
      button: "bg-violet-600 hover:bg-violet-700 text-white",
      ring: "border-violet-500 bg-violet-50",
    },
    teal: {
      hero: "from-teal-600 via-cyan-600 to-indigo-700",
      soft: "bg-teal-50 text-teal-700 border-teal-200",
      button: "bg-teal-600 hover:bg-teal-700 text-white",
      ring: "border-teal-500 bg-teal-50",
    },
    coral: {
      hero: "from-rose-500 via-orange-500 to-violet-700",
      soft: "bg-rose-50 text-rose-700 border-rose-200",
      button: "bg-rose-600 hover:bg-rose-700 text-white",
      ring: "border-rose-500 bg-rose-50",
    },
    green: {
      hero: "from-emerald-600 via-teal-600 to-sky-700",
      soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white",
      ring: "border-emerald-500 bg-emerald-50",
    },
    amber: {
      hero: "from-amber-500 via-orange-500 to-violet-700",
      soft: "bg-amber-50 text-amber-800 border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
      ring: "border-amber-500 bg-amber-50",
    },
  };

  return map[accent] || map.violet;
}

function ResultPanel({ module, result, achievements, serverSynced, onRetry, onHome, onNext }) {
  useEffect(() => {
    if (result?.accuracy >= 75) {
      confetti({
        particleCount: 90,
        spread: 64,
        origin: { y: 0.8 },
        colors: ["#7C3AED", "#14B8A6", "#F59E0B", "#F97066"],
      });
    }
  }, [result]);

  return (
    <section className="section-container py-6 md:py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-violet-100 bg-white shadow-[var(--shadow-card)] overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-slate-950 p-6 text-white md:p-8">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-200">
              <Trophy className="h-4 w-4" />
              Quiz Complete
            </div>
            <h1 className="mt-4 text-3xl font-extrabold">{module.title}</h1>
            <p className="mt-2 text-white/75">{result.feedback}</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">Score</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {result.score}/{result.maxScore}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">Accuracy</p>
                <p className="mt-1 text-2xl font-extrabold">{Math.round(result.accuracy)}%</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">XP</p>
                <p className="mt-1 text-2xl font-extrabold">+{result.xpEarned}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">Combo</p>
                <p className="mt-1 text-2xl font-extrabold">{result.bestCombo}x</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-white/65">
              <ShieldCheck className="h-4 w-4" />
              {serverSynced ? "Server verified and saved" : "Saved locally; server sync was unavailable"}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-lg font-extrabold text-[var(--rightsy-text-primary)]">Learning Review</h2>
            <div className="mt-4 space-y-3">
              {result.breakdown.map((item, index) => (
                <div key={item.questionId} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    {item.isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    ) : item.partialCredit ? (
                      <HelpCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-rose-500" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">Question {index + 1}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.explanation}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {formatTopic(item.topic)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {achievements?.length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
                  <Sparkles className="h-4 w-4" />
                  New achievement
                </p>
                <p className="mt-1 text-sm text-amber-800">{achievements[0].title}: {achievements[0].description}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-xl" onClick={onRetry}>
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={onHome}>
                <Home className="h-4 w-4" />
                Hub
              </Button>
              {onNext && (
                <Button className="rounded-xl bg-violet-600 text-white hover:bg-violet-700" onClick={onNext}>
                  Next level
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function QuizRunner({ module }) {
  const router = useRouter();
  const accent = getAccentClasses(module.accent);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [confidence, setConfidence] = useState(3);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [serverSynced, setServerSynced] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [timeLeft, setTimeLeft] = useState(module.questionTimeLimitSeconds);
  const startedAtRef = useRef(new Date().toISOString());
  const assessmentStartRef = useRef(typeof performance !== "undefined" ? performance.now() : Date.now());
  const questionStartRef = useRef(typeof performance !== "undefined" ? performance.now() : Date.now());
  const timeoutSubmittedRef = useRef(false);

  const currentQuestion = module.questions[questionIndex];
  const totalQuestions = module.questions.length;
  const progress = ((questionIndex + (feedback ? 1 : 0)) / totalQuestions) * 100;
  const isMultiSelect = currentQuestion.type === "multi-select";
  const nextModule = getNextQuizModule(module.id);

  const resetQuestionState = useCallback(
    (nextIndex) => {
      const question = module.questions[nextIndex];
      setQuestionIndex(nextIndex);
      setSelectedOptionIds([]);
      setConfidence(3);
      setFeedback(null);
      setTimeLeft(question.timeLimitSeconds || module.questionTimeLimitSeconds);
      questionStartRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
      timeoutSubmittedRef.current = false;
    },
    [module]
  );

  const submitAnswer = useCallback(
    async ({ timedOut = false } = {}) => {
      if (feedback || result || isSubmittingAttempt) return;
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const answer = {
        questionId: currentQuestion.id,
        selectedOptionIds,
        confidence,
        durationMs: Math.max(0, Math.round(now - questionStartRef.current)),
        timedOut,
      };
      const scoredQuestion = scoreQuestion(currentQuestion, answer);
      const nextAnswers = {
        ...answersByQuestion,
        [currentQuestion.id]: answer,
      };

      setAnswersByQuestion(nextAnswers);
      setFeedback(scoredQuestion);

      if (questionIndex === totalQuestions - 1) {
        setIsSubmittingAttempt(true);
        const answers = module.questions.map((question) => nextAnswers[question.id] || {
          questionId: question.id,
          selectedOptionIds: [],
          confidence: null,
          durationMs: 0,
          timedOut: true,
        });
        const durationMs = Math.round(now - assessmentStartRef.current);
        const localResult = scoreQuizAttempt(module, answers, {
          durationMs,
          startedAt: startedAtRef.current,
        });

        try {
          const response = await submitAssessmentAttempt({
            kind: "QUIZ",
            moduleId: module.id,
            answers,
            durationMs,
            startedAt: startedAtRef.current,
            clientNonce: globalThis.crypto?.randomUUID?.() || String(Date.now()),
          });

          recordLocalAssessmentResult(response.result);
          setResult(response.result);
          setAchievements(response.achievements || []);
          setServerSynced(true);
        } catch {
          recordLocalAssessmentResult(localResult);
          setResult(localResult);
          setServerSynced(false);
        } finally {
          setIsSubmittingAttempt(false);
        }
      }
    },
    [
      answersByQuestion,
      confidence,
      currentQuestion,
      feedback,
      isSubmittingAttempt,
      module,
      questionIndex,
      result,
      selectedOptionIds,
      totalQuestions,
    ]
  );

  useEffect(() => {
    if (feedback || result) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          if (!timeoutSubmittedRef.current) {
            timeoutSubmittedRef.current = true;
            submitAnswer({ timedOut: true });
          }
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [feedback, result, questionIndex, submitAnswer]);

  const selectedSet = useMemo(() => new Set(selectedOptionIds), [selectedOptionIds]);

  const toggleOption = (optionId) => {
    if (feedback) return;

    setSelectedOptionIds((current) => {
      if (!isMultiSelect) return [optionId];
      return current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    });
  };

  const continueAfterFeedback = () => {
    if (questionIndex < totalQuestions - 1) {
      resetQuestionState(questionIndex + 1);
    }
  };

  const retry = () => {
    startedAtRef.current = new Date().toISOString();
    assessmentStartRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    setAnswersByQuestion({});
    setResult(null);
    setAchievements([]);
    setServerSynced(false);
    resetQuestionState(0);
  };

  if (result) {
    return (
      <ResultPanel
        module={module}
        result={result}
        achievements={achievements}
        serverSynced={serverSynced}
        onRetry={retry}
        onHome={() => router.push("/dashboard/quiz")}
        onNext={nextModule ? () => router.push(`/dashboard/quiz/${nextModule.numericLevel}`) : null}
      />
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <section className={`bg-gradient-to-br ${accent.hero} px-4 py-5 text-white sm:px-6`}>
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20"
              onClick={() => router.push("/dashboard/quiz")}
            >
              <ArrowLeft className="h-4 w-4" />
              Hub
            </Button>
            <div className="flex items-center gap-3 rounded-full bg-white/12 px-4 py-2 text-sm font-bold">
              <Clock3 className="h-4 w-4 text-amber-200" />
              {timeLeft}s
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/65">Level {module.numericLevel}</p>
              <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{module.title}</h1>
              <p className="mt-2 max-w-2xl text-white/75">{module.subtitle}</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 md:min-w-56">
              <div className="flex items-center justify-between text-sm font-bold text-white/80">
                <span>Question {questionIndex + 1}</span>
                <span>{totalQuestions}</span>
              </div>
              <Progress value={progress} className="mt-3 h-2 bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-5 md:py-8">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_280px]">
          <motion.article
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-violet-100 bg-white p-5 shadow-[var(--shadow-card)] md:p-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${accent.soft}`}>
                {currentQuestion.type === "multi-select" ? "Multi-select" : currentQuestion.type === "true-false" ? "True / False" : currentQuestion.type === "image" ? "Image question" : "MCQ"}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                {formatTopic(currentQuestion.topic)}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">
              {currentQuestion.prompt}
            </h2>

            {currentQuestion.image && (
              <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200">
                <Image
                  src={currentQuestion.image}
                  alt={currentQuestion.imageAlt || currentQuestion.prompt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 720px"
                  priority={questionIndex === 0}
                />
              </div>
            )}

            <AnimatePresence mode="popLayout">
              <div className="mt-6 grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const selected = selectedSet.has(option.id);
                  const isCorrectAnswer = feedback?.correctOptionIds?.includes(option.id);
                  const showCorrect = feedback && isCorrectAnswer;
                  const showSelectedWrong = feedback && selected && !isCorrectAnswer;

                  return (
                    <motion.button
                      key={option.id}
                      {...optionMotion}
                      transition={{ delay: index * 0.025 }}
                      type="button"
                      disabled={Boolean(feedback)}
                      aria-pressed={selected}
                      onClick={() => toggleOption(option.id)}
                      className={`min-h-14 rounded-2xl border-2 p-4 text-left text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        selected ? accent.ring : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/60"
                      } ${showCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : ""} ${
                        showSelectedWrong ? "border-rose-300 bg-rose-50 text-rose-900" : ""
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option.label}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </AnimatePresence>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-slate-700">Confidence</p>
                <div className="flex gap-2" role="group" aria-label="Answer confidence">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={Boolean(feedback)}
                      onClick={() => setConfidence(value)}
                      className={`h-9 w-9 rounded-full text-sm font-extrabold transition ${
                        confidence === value ? "bg-slate-950 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-5 rounded-2xl border p-5 ${
                  feedback.isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : feedback.partialCredit
                      ? "border-amber-200 bg-amber-50"
                      : "border-rose-200 bg-rose-50"
                }`}
              >
                <p className="flex items-center gap-2 text-base font-extrabold text-slate-950">
                  {feedback.isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <HelpCircle className="h-5 w-5 text-amber-600" />}
                  {feedback.isCorrect ? "Strong answer" : feedback.partialCredit ? "Partly there" : "Review this idea"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{feedback.explanation}</p>
                <p className="mt-3 text-sm font-bold text-slate-900">{feedback.reinforcement}</p>
              </motion.div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {!feedback ? (
                <Button
                  className={`min-h-11 rounded-xl px-5 ${accent.button}`}
                  onClick={() => submitAnswer()}
                  disabled={selectedOptionIds.length === 0}
                >
                  Check answer
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              ) : questionIndex < totalQuestions - 1 ? (
                <Button className={`min-h-11 rounded-xl px-5 ${accent.button}`} onClick={continueAfterFeedback}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button className="min-h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800" disabled>
                  {isSubmittingAttempt ? "Saving..." : "Preparing results..."}
                </Button>
              )}
            </div>
          </motion.article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-extrabold text-slate-900">Progress Map</p>
              <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-1">
                {module.questions.map((question, index) => {
                  const answered = Boolean(answersByQuestion[question.id]);
                  const active = index === questionIndex;
                  return (
                    <div
                      key={question.id}
                      className={`flex h-10 items-center justify-center rounded-xl border text-sm font-extrabold ${
                        active
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : answered
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-extrabold text-slate-900">Rights Reminder</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-teal-600" /> Rights protect dignity, safety, and fairness.</li>
                <li className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 text-amber-600" /> Calm thinking often leads to better civic choices.</li>
                <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-violet-600" /> Mistakes are useful when you review the reason.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
