import { Suspense } from "react";

/**
 * QuizLayout — Nested layout for /dashboard/quiz/*.
 *
 * Previously contained an illegal <html><body> wrapper
 * which caused hydration errors. Now correctly uses a
 * minimal nested layout that only wraps children with
 * a Suspense boundary.
 */
export const metadata = {
  title: "Quiz Challenge — Rightsy",
  description:
    "Learn about Indian laws and rights through fun interactive quizzes for children ages 6–14.",
};

export default function QuizLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
            <span className="text-[var(--rightsy-text-secondary)] font-medium">Loading quiz...</span>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
