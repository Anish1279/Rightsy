"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Flame,
  Gauge,
  HeartHandshake,
  Lock,
  Play,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { quizModules, srtMissions } from "@/features/assessment/data/assessment-content";
import {
  createEmptyAssessmentProgress,
  isQuizUnlocked,
  summarizeWeakTopics,
} from "@/features/assessment/services/assessment-engine";
import { fetchAssessmentProgress } from "@/features/assessment/services/assessment-api-client";
import {
  loadLocalAssessmentProgress,
  mergeServerProgress,
  saveLocalAssessmentProgress,
} from "@/features/assessment/services/progress-storage";

function moduleKey(kind, moduleId) {
  return `${kind}:${moduleId}`;
}

function averageMastery(progress) {
  const modules = Object.values(progress.modules || {});
  if (!modules.length) return 0;
  return Math.round((modules.reduce((sum, item) => sum + (Number(item.mastery) || 0), 0) / modules.length) * 100);
}

function accentClasses(accent) {
  const map = {
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    coral: "border-rose-200 bg-rose-50 text-rose-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return map[accent] || map.violet;
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/12 p-4 text-white shadow-sm">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className={`h-4 w-4 ${tone || ""}`} />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function QuizModuleCard({ module, progress, unlocked }) {
  const itemProgress = progress.modules?.[moduleKey("QUIZ", module.id)];
  const bestAccuracy = Math.round(itemProgress?.bestAccuracy || 0);
  const mastery = Math.round((itemProgress?.mastery || 0) * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)]"
    >
      <div className="relative h-40">
        <Image
          src={module.image}
          alt={module.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${accentClasses(module.accent)}`}>
            Level {module.numericLevel}
          </span>
          {unlocked ? <BadgeCheck className="h-5 w-5 text-white" /> : <Lock className="h-5 w-5 text-white/80" />}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-extrabold text-slate-950">{module.title}</h3>
        <p className="mt-1 min-h-10 text-sm leading-relaxed text-slate-600">{module.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Best</p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">{bestAccuracy}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Mastery</p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">{mastery}%</p>
          </div>
        </div>

        <Progress value={bestAccuracy} className="mt-4 h-2 bg-slate-100" />

        <Button
          asChild={unlocked}
          disabled={!unlocked}
          className={`mt-5 min-h-11 w-full rounded-xl ${
            unlocked ? "bg-violet-600 text-white hover:bg-violet-700" : "bg-slate-200 text-slate-500"
          }`}
        >
          {unlocked ? (
            <Link href={`/dashboard/quiz/${module.numericLevel}`}>
              <Play className="h-4 w-4" />
              {itemProgress ? "Practice again" : "Start quiz"}
            </Link>
          ) : (
            <span>
              <Lock className="h-4 w-4" />
              Locked
            </span>
          )}
        </Button>
      </div>
    </motion.article>
  );
}

function SrtMissionCard({ mission, progress }) {
  const itemProgress = progress.modules?.[moduleKey("SRT", mission.id)];
  const bestAccuracy = Math.round(itemProgress?.bestAccuracy || 0);
  const mastery = Math.round((itemProgress?.mastery || 0) * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)]"
    >
      <div className="relative h-40">
        <Image
          src={mission.image}
          alt={mission.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${accentClasses(mission.accent)}`}>
            {mission.category.replaceAll("-", " ")}
          </span>
          <HeartHandshake className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-extrabold text-slate-950">{mission.title}</h3>
        <p className="mt-1 min-h-10 text-sm leading-relaxed text-slate-600">{mission.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Judgment</p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">{bestAccuracy}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Mastery</p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">{mastery}%</p>
          </div>
        </div>

        <Progress value={bestAccuracy} className="mt-4 h-2 bg-slate-100" />

        <Button asChild className="mt-5 min-h-11 w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700">
          <Link href={`/dashboard/srt/${mission.id}`}>
            <Play className="h-4 w-4" />
            {itemProgress ? "Practice again" : "Start SRT"}
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}

function InsightsPanel({ progress, isLoading }) {
  const weakTopics = summarizeWeakTopics(progress);
  const attempts = progress.recentAttempts || [];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-extrabold text-slate-950">Mastery Signals</h3>
        </div>
        <div className="mt-5 space-y-4">
          <DimensionRow label="Overall mastery" value={averageMastery(progress)} />
          <DimensionRow label="Quiz coverage" value={(Object.values(progress.modules || {}).filter((item) => item.kind === "QUIZ").length / quizModules.length) * 100} />
          <DimensionRow label="SRT coverage" value={(Object.values(progress.modules || {}).filter((item) => item.kind === "SRT").length / srtMissions.length) * 100} />
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-extrabold text-amber-900">Next best focus</p>
          <p className="mt-1 text-sm text-amber-800">
            {weakTopics[0]
              ? `${weakTopics[0].topic.replaceAll("-", " ")} needs one more calm review.`
              : isLoading
                ? "Loading your learning profile."
                : "Start any assessment to build a personalized focus list."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-extrabold text-slate-950">Recent Growth</h3>
        </div>

        {attempts.length ? (
          <div className="mt-5 space-y-3">
            {attempts.map((attempt, index) => (
              <div key={`${attempt.kind}-${attempt.moduleId}-${attempt.completedAt}-${index}`} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">{attempt.kind === "QUIZ" ? "Quiz" : "SRT"} practice</p>
                    <p className="text-xs font-bold text-slate-500">{attempt.moduleId.replaceAll("-", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-950">{Math.round(attempt.accuracy)}%</p>
                    <p className="text-xs font-bold text-teal-700">+{attempt.xpEarned} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <Activity className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-bold text-slate-600">Your first attempt will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DimensionRow({ label, value }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm font-bold text-slate-600">
        <span>{label}</span>
        <span>{normalized}%</span>
      </div>
      <Progress value={normalized} className="h-2 bg-slate-100" />
    </div>
  );
}

export default function AssessmentHub({ initialMode = "quiz" }) {
  const [progress, setProgress] = useState(() => createEmptyAssessmentProgress());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const localProgress = loadLocalAssessmentProgress();
    setProgress(localProgress);

    let active = true;

    fetchAssessmentProgress()
      .then(({ progress: serverProgress }) => {
        if (!active) return;
        const merged = mergeServerProgress(serverProgress, localProgress);
        setProgress(merged);
        saveLocalAssessmentProgress(merged);
      })
      .catch(() => {
        if (active) setProgress(localProgress);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const weakTopics = useMemo(() => summarizeWeakTopics(progress), [progress]);
  const mastery = averageMastery(progress);

  return (
    <main className="min-h-screen bg-cream">
      <section className="bg-gradient-to-br from-slate-950 via-violet-950 to-teal-900 px-4 py-8 text-white sm:px-6 md:py-10">
        <div className="section-container">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-extrabold text-teal-100">
                <Sparkles className="h-4 w-4" />
                Rightsy Assessment Lab
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
                Practice knowledge, judgment, and safe civic action.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/72">
                Quizzes build rights knowledge. SRT missions build calm reactions for real-life choices.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Zap} label="XP" value={progress.totalXp || 0} tone="text-amber-300" />
              <StatCard icon={Trophy} label="Level" value={progress.level || 1} tone="text-violet-200" />
              <StatCard icon={Flame} label="Streak" value={progress.currentStreak || 0} tone="text-orange-300" />
              <StatCard icon={Gauge} label="Mastery" value={`${mastery}%`} tone="text-teal-200" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-6 md:py-8">
        <Tabs defaultValue={initialMode} className="gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TabsList className="h-auto rounded-2xl bg-white p-1 shadow-sm">
              <TabsTrigger value="quiz" className="min-h-10 rounded-xl px-4">
                <BookOpenCheck className="h-4 w-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="srt" className="min-h-10 rounded-xl px-4">
                <HeartHandshake className="h-4 w-4" />
                SRT
              </TabsTrigger>
              <TabsTrigger value="insights" className="min-h-10 rounded-xl px-4">
                <BarChart3 className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap gap-2">
              {weakTopics.slice(0, 3).map((topic) => (
                <span key={topic.topic} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  {topic.topic.replaceAll("-", " ")}
                </span>
              ))}
              {!weakTopics.length && (
                <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                  Ready to begin
                </span>
              )}
            </div>
          </div>

          <TabsContent value="quiz">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {quizModules.map((module) => (
                <QuizModuleCard
                  key={module.id}
                  module={module}
                  progress={progress}
                  unlocked={isQuizUnlocked(module, progress)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="srt">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {srtMissions.map((mission) => (
                <SrtMissionCard key={mission.id} mission={mission} progress={progress} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel progress={progress} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
