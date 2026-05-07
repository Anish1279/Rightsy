"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { LEARNING_VIDEO_CONFIG } from "../constants";
import {
  useLearningOrchestrator,
  type LearningOrchestratorApi,
} from "../store/orchestrator-store";
import type {
  LearningCompletionCallback,
  LearningTriggerReason,
  LearningVideoSession,
} from "../types";

export interface UseLearningVideoOptions {
  gameId: string;
  failureThreshold?: number;
  stuckIdleMs?: number;
  onUnlock?: (session: LearningVideoSession) => void;
  onUnlockByReason?: Partial<Record<LearningTriggerReason, LearningCompletionCallback>>;
}

export interface UseLearningVideoApi {
  triggerOnLose: (meta?: Record<string, unknown>) => boolean;
  triggerOnHint: (meta?: Record<string, unknown>) => boolean;
  triggerOnStuck: (meta?: Record<string, unknown>) => boolean;
  triggerManual: (meta?: Record<string, unknown>) => boolean;
  registerFailure: () => boolean;
  resetFailures: () => void;
  noteActivity: () => void;
  isVideoActive: boolean;
  isLockedForGame: boolean;
}

export function useLearningVideo(options: UseLearningVideoOptions): UseLearningVideoApi {
  const {
    gameId,
    failureThreshold = LEARNING_VIDEO_CONFIG.failureThreshold,
    stuckIdleMs = LEARNING_VIDEO_CONFIG.stuckIdleMs,
    onUnlock,
    onUnlockByReason,
  } = options;

  const orchestrator: LearningOrchestratorApi = useLearningOrchestrator();
  const failureCountRef = useRef(0);
  const lastActivityRef = useRef<number>(Date.now());
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireUnlockHandlers = useCallback(
    (session: LearningVideoSession) => {
      if (session.gameId !== gameId) return;
      onUnlock?.(session);
      onUnlockByReason?.[session.reason]?.(session);
    },
    [gameId, onUnlock, onUnlockByReason],
  );

  useEffect(() => {
    return orchestrator.registerCompletionListener(fireUnlockHandlers);
  }, [fireUnlockHandlers, orchestrator]);

  const trigger = useCallback(
    (reason: LearningTriggerReason, meta?: Record<string, unknown>) => {
      return orchestrator.trigger({ gameId, reason, meta });
    },
    [gameId, orchestrator],
  );

  const triggerOnLose = useCallback(
    (meta?: Record<string, unknown>) => {
      failureCountRef.current = 0;
      return trigger("lose", meta);
    },
    [trigger],
  );

  const triggerOnHint = useCallback(
    (meta?: Record<string, unknown>) => trigger("hint", meta),
    [trigger],
  );

  const triggerOnStuck = useCallback(
    (meta?: Record<string, unknown>) => trigger("stuck", meta),
    [trigger],
  );

  const triggerManual = useCallback(
    (meta?: Record<string, unknown>) => trigger("manual", meta),
    [trigger],
  );

  const registerFailure = useCallback(() => {
    failureCountRef.current += 1;
    if (failureCountRef.current >= failureThreshold) {
      const fired = trigger("failure-threshold", { failures: failureCountRef.current });
      if (fired) {
        failureCountRef.current = 0;
      }
      return fired;
    }
    return false;
  }, [failureThreshold, trigger]);

  const resetFailures = useCallback(() => {
    failureCountRef.current = 0;
  }, []);

  const clearStuckTimer = useCallback(() => {
    if (stuckTimerRef.current) {
      clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = null;
    }
  }, []);

  const scheduleStuckTimer = useCallback(() => {
    clearStuckTimer();
    if (stuckIdleMs <= 0) return;
    stuckTimerRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= stuckIdleMs) {
        trigger("stuck", { idleMs: elapsed });
      }
    }, stuckIdleMs);
  }, [clearStuckTimer, stuckIdleMs, trigger]);

  const noteActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    scheduleStuckTimer();
  }, [scheduleStuckTimer]);

  useEffect(() => {
    scheduleStuckTimer();
    return clearStuckTimer;
  }, [clearStuckTimer, scheduleStuckTimer]);

  const isVideoActive = orchestrator.state.session !== null;
  const isLockedForGame =
    isVideoActive && orchestrator.state.session?.gameId === gameId;

  return useMemo(
    () => ({
      triggerOnLose,
      triggerOnHint,
      triggerOnStuck,
      triggerManual,
      registerFailure,
      resetFailures,
      noteActivity,
      isVideoActive,
      isLockedForGame,
    }),
    [
      triggerOnLose,
      triggerOnHint,
      triggerOnStuck,
      triggerManual,
      registerFailure,
      resetFailures,
      noteActivity,
      isVideoActive,
      isLockedForGame,
    ],
  );
}
