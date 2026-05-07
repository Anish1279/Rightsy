"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizRunner from "@/features/assessment/components/QuizRunner";
import { getQuizModuleByLevel } from "@/features/assessment/data/assessment-content";
import { isQuizUnlocked } from "@/features/assessment/services/assessment-engine";
import { loadLocalAssessmentProgress } from "@/features/assessment/services/progress-storage";

export default function QuizLevelPage({ level }) {
  const router = useRouter();
  const quizModule = getQuizModuleByLevel(level);

  useEffect(() => {
    if (!quizModule) {
      router.replace("/dashboard/quiz");
      return;
    }

    const progress = loadLocalAssessmentProgress();
    if (!isQuizUnlocked(quizModule, progress)) {
      router.replace("/dashboard/quiz");
    }
  }, [quizModule, router]);

  if (!quizModule) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="section-container py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-bold text-slate-800">Loading quiz...</p>
          </div>
        </div>
      </main>
    );
  }

  return <QuizRunner module={quizModule} />;
}
