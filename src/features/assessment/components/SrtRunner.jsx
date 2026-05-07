"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Brain,
  CheckCircle2,
  HeartHandshake,
  Home,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getNextSrtMission } from "@/features/assessment/data/assessment-content";
import {
  getInitialSrtScenario,
  getNextSrtScenarioForDecision,
  getSrtDecision,
  scoreSrtAttempt,
} from "@/features/assessment/services/assessment-engine";
import { submitAssessmentAttempt } from "@/features/assessment/services/assessment-api-client";
import { recordLocalAssessmentResult } from "@/features/assessment/services/progress-storage";

function getAccentClasses(accent) {
  const map = {
    coral: {
      hero: "from-rose-500 via-orange-500 to-violet-700",
      button: "bg-rose-600 hover:bg-rose-700 text-white",
      selected: "border-rose-500 bg-rose-50",
      soft: "border-rose-200 bg-rose-50 text-rose-800",
    },
    teal: {
      hero: "from-teal-600 via-cyan-600 to-indigo-700",
      button: "bg-teal-600 hover:bg-teal-700 text-white",
      selected: "border-teal-500 bg-teal-50",
      soft: "border-teal-200 bg-teal-50 text-teal-800",
    },
    amber: {
      hero: "from-amber-500 via-orange-500 to-violet-700",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
      selected: "border-amber-500 bg-amber-50",
      soft: "border-amber-200 bg-amber-50 text-amber-900",
    },
  };

  return map[accent] || map.coral;
}

function qualityTone(quality) {
  if (quality === "safe") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (quality === "partial" || quality === "risky") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-rose-200 bg-rose-50 text-rose-900";
}

function DimensionBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2 bg-slate-100" />
    </div>
  );
}

function SrtResultPanel({ mission, result, achievements, serverSynced, onRetry, onHome, onNext }) {
  useEffect(() => {
    if ((result.dimensions?.safety || 0) >= 85) {
      confetti({
        particleCount: 80,
        spread: 58,
        origin: { y: 0.78 },
        colors: ["#14B8A6", "#7C3AED", "#F59E0B", "#F97066"],
      });
    }
  }, [result]);

  return (
    <section className="section-container py-6 md:py-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-teal-100 bg-white shadow-[var(--shadow-card)] overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-slate-950 p-6 text-white md:p-8">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-200">
              <HeartHandshake className="h-4 w-4" />
              SRT Complete
            </div>
            <h1 className="mt-4 text-3xl font-extrabold">{mission.title}</h1>
            <p className="mt-2 text-white/75">{result.feedback}</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">Judgment</p>
                <p className="mt-1 text-2xl font-extrabold">{Math.round(result.accuracy)}%</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">XP</p>
                <p className="mt-1 text-2xl font-extrabold">+{result.xpEarned}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">Safe choices</p>
                <p className="mt-1 text-2xl font-extrabold">{result.correctCount}/{result.totalCount}</p>
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
            <h2 className="text-lg font-extrabold text-slate-950">Reaction Quality</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DimensionBar label="Safety" value={result.dimensions?.safety || 0} />
              <DimensionBar label="Empathy" value={result.dimensions?.empathy || 0} />
              <DimensionBar label="Responsibility" value={result.dimensions?.responsibility || 0} />
              <DimensionBar label="Rights awareness" value={result.dimensions?.legality || 0} />
            </div>

            <div className="mt-6 space-y-3">
              {result.breakdown.map((item, index) => (
                <div key={item.scenarioId} className={`rounded-xl border p-4 ${qualityTone(item.quality)}`}>
                  <p className="text-sm font-extrabold">Situation {index + 1}: {item.quality}</p>
                  <p className="mt-1 text-sm leading-relaxed">{item.explanation}</p>
                  <p className="mt-2 text-sm font-bold">{item.reinforcement}</p>
                </div>
              ))}
            </div>

            {achievements?.length > 0 && (
              <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-teal-900">
                  <Sparkles className="h-4 w-4" />
                  New achievement
                </p>
                <p className="mt-1 text-sm text-teal-800">{achievements[0].title}: {achievements[0].description}</p>
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
                <Button className="rounded-xl bg-teal-600 text-white hover:bg-teal-700" onClick={onNext}>
                  Next mission
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

export default function SrtRunner({ mission }) {
  const router = useRouter();
  const accent = getAccentClasses(mission.accent);
  const [currentScenario, setCurrentScenario] = useState(() => getInitialSrtScenario(mission));
  const [selectedDecisionId, setSelectedDecisionId] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [serverSynced, setServerSynced] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());
  const assessmentStartRef = useRef(typeof performance !== "undefined" ? performance.now() : Date.now());
  const scenarioStartRef = useRef(typeof performance !== "undefined" ? performance.now() : Date.now());
  const nextMission = getNextSrtMission(mission.id);
  const progress = currentScenario ? (responses.length / mission.scenarios.length) * 100 : 100;

  const resetScenarioState = useCallback((scenario) => {
    setCurrentScenario(scenario);
    setSelectedDecisionId("");
    setConfidence(3);
    setFeedback(null);
    scenarioStartRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
  }, []);

  const finishMission = useCallback(
    async (finalResponses) => {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const durationMs = Math.round(now - assessmentStartRef.current);
      const localResult = scoreSrtAttempt(mission, finalResponses, {
        durationMs,
        startedAt: startedAtRef.current,
      });

      setIsSubmittingAttempt(true);

      try {
        const response = await submitAssessmentAttempt({
          kind: "SRT",
          moduleId: mission.id,
          answers: finalResponses,
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
    },
    [mission]
  );

  const chooseReaction = () => {
    if (!selectedDecisionId || feedback || !currentScenario) return;

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const decision = getSrtDecision(currentScenario, selectedDecisionId);
    const response = {
      scenarioId: currentScenario.id,
      decisionId: selectedDecisionId,
      confidence,
      durationMs: Math.max(0, Math.round(now - scenarioStartRef.current)),
    };
    const nextResponses = [...responses, response];

    setResponses(nextResponses);
    setFeedback(decision);

    const nextScenario = getNextSrtScenarioForDecision(mission, currentScenario.id, selectedDecisionId);
    if (!nextScenario) {
      finishMission(nextResponses);
    }
  };

  const continueAfterFeedback = () => {
    if (!currentScenario || !selectedDecisionId) return;
    const nextScenario = getNextSrtScenarioForDecision(mission, currentScenario.id, selectedDecisionId);

    if (nextScenario) {
      resetScenarioState(nextScenario);
    }
  };

  const retry = () => {
    startedAtRef.current = new Date().toISOString();
    assessmentStartRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    setResponses([]);
    setResult(null);
    setAchievements([]);
    setServerSynced(false);
    resetScenarioState(getInitialSrtScenario(mission));
  };

  if (result) {
    return (
      <SrtResultPanel
        mission={mission}
        result={result}
        achievements={achievements}
        serverSynced={serverSynced}
        onRetry={retry}
        onHome={() => router.push("/dashboard/srt")}
        onNext={nextMission ? () => router.push(`/dashboard/srt/${nextMission.id}`) : null}
      />
    );
  }

  if (!currentScenario) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="section-container py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-bold text-slate-800">This mission is not available yet.</p>
            <Button className="mt-4 rounded-xl" onClick={() => router.push("/dashboard/srt")}>Back to SRT</Button>
          </div>
        </div>
      </main>
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
              onClick={() => router.push("/dashboard/srt")}
            >
              <ArrowLeft className="h-4 w-4" />
              Hub
            </Button>
            <div className="flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold">
              <Brain className="h-4 w-4 text-amber-200" />
              {currentScenario.stageLabel}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/65">Situation Reaction Test</p>
              <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{mission.title}</h1>
              <p className="mt-2 max-w-2xl text-white/75">{mission.subtitle}</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 md:min-w-60">
              <div className="flex items-center justify-between text-sm font-bold text-white/80">
                <span>Decision {responses.length + 1}</span>
                <span>{mission.scenarios.length}</span>
              </div>
              <Progress value={progress} className="mt-3 h-2 bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-5 md:py-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.article
            key={currentScenario.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-teal-100 bg-white p-5 shadow-[var(--shadow-card)] md:p-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${accent.soft}`}>
                {currentScenario.category.replaceAll("-", " ")}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                {currentScenario.severity} severity
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_220px] md:items-start">
              <div>
                <p className="text-sm font-extrabold text-slate-500">
                  {currentScenario.character.name} feels {currentScenario.mood}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">
                  {currentScenario.scenario}
                </h2>
                <p className="mt-4 text-lg font-bold text-slate-800">{currentScenario.prompt}</p>
              </div>

              {currentScenario.image && (
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200">
                  <Image
                    src={currentScenario.image}
                    alt={currentScenario.imageAlt || currentScenario.prompt}
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                </div>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              <div className="mt-6 grid gap-3">
                {currentScenario.decisions.map((decision, index) => {
                  const selected = selectedDecisionId === decision.id;

                  return (
                    <motion.button
                      key={decision.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.025 }}
                      type="button"
                      disabled={Boolean(feedback)}
                      aria-pressed={selected}
                      onClick={() => setSelectedDecisionId(decision.id)}
                      className={`min-h-16 rounded-2xl border-2 p-4 text-left text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                        selected ? accent.selected : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/60"
                      } ${feedback && selected ? qualityTone(decision.quality) : ""}`}
                    >
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{decision.label}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </AnimatePresence>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-slate-700">Confidence</p>
                <input
                  aria-label="Confidence"
                  type="range"
                  min="1"
                  max="5"
                  value={confidence}
                  disabled={Boolean(feedback)}
                  onChange={(event) => setConfidence(Number(event.target.value))}
                  className="w-44 accent-teal-600"
                />
                <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-slate-700">{confidence}/5</span>
              </div>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-5 rounded-2xl border p-5 ${qualityTone(feedback.quality)}`}
              >
                <p className="flex items-center gap-2 text-base font-extrabold">
                  <BadgeCheck className="h-5 w-5" />
                  Consequence
                </p>
                <p className="mt-2 text-sm leading-relaxed">{feedback.consequence}</p>
                <p className="mt-3 text-sm font-bold">{feedback.explanation}</p>
                <p className="mt-2 text-sm">{feedback.reinforcement}</p>
              </motion.div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {!feedback ? (
                <Button
                  className={`min-h-11 rounded-xl px-5 ${accent.button}`}
                  onClick={chooseReaction}
                  disabled={!selectedDecisionId}
                >
                  Choose reaction
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              ) : getNextSrtScenarioForDecision(mission, currentScenario.id, selectedDecisionId) ? (
                <Button className={`min-h-11 rounded-xl px-5 ${accent.button}`} onClick={continueAfterFeedback}>
                  What happens next
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
              <p className="text-sm font-extrabold text-slate-900">Character Lens</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="flex gap-2"><HeartHandshake className="mt-0.5 h-4 w-4 text-rose-600" /> How does the person feel?</p>
                <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-teal-600" /> Which choice keeps people safest?</p>
                <p className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-amber-600" /> Which adult or system can help?</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-extrabold text-slate-900">Values</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentScenario.emotionalTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {tag.replaceAll("-", " ")}
                  </span>
                ))}
                {currentScenario.legalAwarenessTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {tag.replaceAll("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
