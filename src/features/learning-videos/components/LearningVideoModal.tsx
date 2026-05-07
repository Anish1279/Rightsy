"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { LEARNING_VIDEO_CONFIG, LEARNING_VIDEO_COPY } from "../constants";
import { useLearningOrchestrator } from "../store/orchestrator-store";
import { LearningVideoPlayer } from "./LearningVideoPlayer";
import { MascotPanel } from "./MascotPanel";
import { ProgressRing } from "./ProgressRing";

const BLOCKED_KEYS = new Set([
  "Escape",
  "F11",
  "Backspace",
  "Tab",
  "Enter",
  " ",
]);

function useBodyLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [active]);
}

function useNavigationGuard(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const blockKey = (event: KeyboardEvent) => {
      if (BLOCKED_KEYS.has(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const blockContext = (event: MouseEvent) => {
      event.preventDefault();
    };

    const pushHistoryGuard = () => {
      window.history.pushState({ rightsyLearningLock: true }, "");
    };

    const onPopState = () => {
      pushHistoryGuard();
    };

    pushHistoryGuard();
    window.addEventListener("keydown", blockKey, true);
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("contextmenu", blockContext);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("keydown", blockKey, true);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("contextmenu", blockContext);
      window.removeEventListener("popstate", onPopState);
    };
  }, [active]);
}

function formatRemaining(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function LearningVideoModal() {
  const { state, dismissUnlocked } = useLearningOrchestrator();
  const session = state.session;
  const active = session !== null;

  useBodyLock(active);
  useNavigationGuard(active && !session?.unlocked);

  const requiredSeconds = useMemo(() => {
    const min = LEARNING_VIDEO_CONFIG.minWatchSeconds;
    if (!session || session.durationSeconds <= 0) return min;
    return Math.min(min, session.durationSeconds);
  }, [session]);

  const progress = useMemo(() => {
    if (!session || requiredSeconds <= 0) return 0;
    return Math.min(1, session.watchedSeconds / requiredSeconds);
  }, [session, requiredSeconds]);

  const remainingSeconds = useMemo(() => {
    if (!session) return requiredSeconds;
    return Math.max(0, requiredSeconds - session.watchedSeconds);
  }, [requiredSeconds, session]);

  return (
    <AnimatePresence>
      {active && session && (
        <motion.div
          key={session.id}
          aria-modal="true"
          role="dialog"
          aria-label="Learning video"
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.55),_rgba(15,23,42,0.97))] p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <motion.div
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <MascotPanel
                reason={session.reason}
                unlocked={session.unlocked}
                progress={progress}
              />
              <ProgressRing percent={session.unlocked ? 1 : progress} />
            </div>

            <LearningVideoPlayer videoId={session.videoId} sessionId={session.id} />

            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>
                  {session.unlocked
                    ? LEARNING_VIDEO_COPY.unlocked
                    : `Skippable in ${formatRemaining(remainingSeconds)}`}
                </span>
              </div>

              <button
                type="button"
                onClick={dismissUnlocked}
                disabled={!session.unlocked}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-extrabold shadow-lg transition-all ${
                  session.unlocked
                    ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-emerald-950 shadow-emerald-500/40 hover:-translate-y-0.5"
                    : "cursor-not-allowed bg-white/10 text-white/55"
                }`}
                aria-disabled={!session.unlocked}
              >
                {session.unlocked ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Skip & Continue
                  </>
                ) : (
                  <>Watching…</>
                )}
              </button>
            </div>

            {state.status === "error" && (
              <p className="mt-3 text-center text-sm font-semibold text-rose-200">
                {state.lastError ?? LEARNING_VIDEO_COPY.loadFailed}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
