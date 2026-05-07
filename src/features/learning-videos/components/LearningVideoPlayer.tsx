"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { LEARNING_VIDEO_CONFIG, LEARNING_VIDEO_COPY } from "../constants";
import { loadYouTubeApi, YT_PLAYER_STATE, type YTPlayer } from "../lib/youtube-api";
import { useLearningOrchestrator } from "../store/orchestrator-store";

interface LearningVideoPlayerProps {
  videoId: string;
  sessionId: string;
}

const POLL_INTERVAL_MS = 500;
const INTERACTION_LOCK_STATUSES = new Set([
  "playing",
  "paused",
  "unlocking",
  "unlocked",
]);

export function LearningVideoPlayer({ videoId, sessionId }: LearningVideoPlayerProps) {
  const orchestrator = useLearningOrchestrator();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchedRef = useRef(0);

  const reportLoading = orchestrator.reportLoading;
  const reportPlaying = orchestrator.reportPlaying;
  const reportPaused = orchestrator.reportPaused;
  const reportProgress = orchestrator.reportProgress;
  const reportError = orchestrator.reportError;
  const markUnlocked = orchestrator.markUnlocked;

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    reportLoading();
    watchedRef.current = 0;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !containerRef.current) return;

        const innerHost = document.createElement("div");
        containerRef.current.appendChild(innerHost);

        const player = new YT.Player(innerHost, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            playsinline: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            showinfo: 0,
          },
          events: {
            onReady: (event) => {
              try {
                event.target.unMute();
                event.target.playVideo();
              } catch {
                // mobile may reject — video starts on first gesture
              }
            },
            onStateChange: (event) => {
              if (event.data === YT_PLAYER_STATE.PLAYING) {
                reportPlaying();
              } else if (event.data === YT_PLAYER_STATE.PAUSED) {
                reportPaused();
                event.target.playVideo();
              } else if (event.data === YT_PLAYER_STATE.ENDED) {
                const duration = event.target.getDuration() || 0;
                markUnlocked(duration, duration);
              }
            },
            onError: () => {
              reportError(LEARNING_VIDEO_COPY.loadFailed);
            },
          },
        });

        playerRef.current = player;

        pollRef.current = setInterval(() => {
          const current = playerRef.current;
          if (!current) return;
          try {
            const watched = current.getCurrentTime();
            const duration = current.getDuration();
            if (Number.isFinite(watched) && watched > watchedRef.current) {
              watchedRef.current = watched;
            }
            const safeDuration = Number.isFinite(duration) ? duration : 0;
            reportProgress(watchedRef.current, safeDuration);

            if (safeDuration > 0) {
              const requiredSeconds = Math.min(
                LEARNING_VIDEO_CONFIG.minWatchSeconds,
                safeDuration,
              );
              if (watchedRef.current >= requiredSeconds) {
                markUnlocked(watchedRef.current, safeDuration);
              }
            }
          } catch {
            // ignore transient errors mid-buffer
          }
        }, POLL_INTERVAL_MS);
      })
      .catch(() => {
        if (!cancelled) {
          reportError(LEARNING_VIDEO_COPY.loadFailed);
        }
      });

    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      try {
        playerRef.current?.destroy();
      } catch {
        // already destroyed
      }
      playerRef.current = null;
      if (container) {
        container.replaceChildren();
      }
    };
  }, [
    videoId,
    sessionId,
    reportLoading,
    reportPlaying,
    reportPaused,
    reportProgress,
    reportError,
    markUnlocked,
  ]);

  const status = orchestrator.state.status;
  const showSpinner = status === "loading";
  const lockInteraction = INTERACTION_LOCK_STATUSES.has(status);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-2 ring-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
      <div ref={containerRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/55 via-black/15 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/65 via-black/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-16 w-44 bg-gradient-to-bl from-black/70 via-black/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 h-16 w-44 bg-gradient-to-tl from-black/75 via-black/30 to-transparent"
      />

      <div
        aria-hidden="true"
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        className={`absolute inset-0 transition-opacity ${
          lockInteraction ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ background: "transparent" }}
      />

      {showSpinner && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-b from-violet-900/70 via-violet-950/80 to-black/80">
          <Loader2 className="h-10 w-10 animate-spin text-white/90" />
        </div>
      )}
    </div>
  );
}
