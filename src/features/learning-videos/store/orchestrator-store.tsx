"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { LEARNING_VIDEO_CONFIG } from "../constants";
import { clearLock, persistLock, restoreLock } from "../lib/persistence";
import { pickRandomVideoId } from "../lib/pick-video";
import type {
  LearningCompletionCallback,
  LearningOrchestratorState,
  LearningTriggerPayload,
  LearningTriggerReason,
  LearningVideoSession,
} from "../types";

type Action =
  | { type: "HYDRATE"; session: LearningVideoSession; cooldownUntil: number }
  | { type: "QUEUE"; payload: LearningTriggerPayload; previousVideoId: string | null }
  | { type: "PLAYER_LOADING" }
  | { type: "PLAYER_PLAYING" }
  | { type: "PLAYER_PAUSED" }
  | { type: "PLAYER_PROGRESS"; watchedSeconds: number; durationSeconds: number }
  | { type: "PLAYER_ERROR"; message: string }
  | { type: "MARK_UNLOCKED"; finalWatched: number; finalDuration: number }
  | { type: "DISMISS" }
  | { type: "RESET_AFTER_COMPLETION" };

const INITIAL_STATE: LearningOrchestratorState = {
  status: "idle",
  session: null,
  cooldownUntil: 0,
  lastReason: null,
  lastError: null,
};

function createSessionId(): string {
  return `lv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function reducer(state: LearningOrchestratorState, action: Action): LearningOrchestratorState {
  switch (action.type) {
    case "HYDRATE":
      return {
        status: "queued",
        session: action.session,
        cooldownUntil: action.cooldownUntil,
        lastReason: action.session.reason,
        lastError: null,
      };

    case "QUEUE": {
      const videoId = pickRandomVideoId(action.previousVideoId);
      const session: LearningVideoSession = {
        id: createSessionId(),
        videoId,
        reason: action.payload.reason,
        gameId: action.payload.gameId,
        startedAt: Date.now(),
        watchedSeconds: 0,
        durationSeconds: 0,
        unlocked: false,
      };
      return {
        ...state,
        status: "queued",
        session,
        lastReason: action.payload.reason,
        lastError: null,
      };
    }

    case "PLAYER_LOADING":
      if (!state.session) return state;
      return { ...state, status: "loading", lastError: null };

    case "PLAYER_PLAYING":
      if (!state.session) return state;
      return { ...state, status: "playing", lastError: null };

    case "PLAYER_PAUSED":
      if (!state.session) return state;
      return { ...state, status: "paused" };

    case "PLAYER_PROGRESS": {
      if (!state.session) return state;
      const watched = Math.max(state.session.watchedSeconds, action.watchedSeconds);
      return {
        ...state,
        session: {
          ...state.session,
          watchedSeconds: watched,
          durationSeconds: action.durationSeconds,
        },
      };
    }

    case "PLAYER_ERROR":
      return { ...state, status: "error", lastError: action.message };

    case "MARK_UNLOCKED": {
      if (!state.session) return state;
      const watched = Math.max(state.session.watchedSeconds, action.finalWatched);
      const duration = Math.max(state.session.durationSeconds, action.finalDuration);
      return {
        ...state,
        status: "unlocked",
        session: {
          ...state.session,
          watchedSeconds: watched,
          durationSeconds: duration,
          unlocked: true,
        },
      };
    }

    case "DISMISS":
      return {
        ...INITIAL_STATE,
        cooldownUntil: state.cooldownUntil,
        lastReason: state.lastReason,
      };

    case "RESET_AFTER_COMPLETION":
      return {
        ...INITIAL_STATE,
        cooldownUntil: Date.now() + LEARNING_VIDEO_CONFIG.cooldownMs,
        lastReason: state.lastReason,
      };

    default:
      return state;
  }
}

export interface LearningOrchestratorApi {
  state: LearningOrchestratorState;
  trigger: (payload: LearningTriggerPayload) => boolean;
  reportLoading: () => void;
  reportPlaying: () => void;
  reportPaused: () => void;
  reportProgress: (watchedSeconds: number, durationSeconds: number) => void;
  reportError: (message: string) => void;
  markUnlocked: (finalWatched: number, finalDuration: number) => void;
  dismissUnlocked: () => void;
  registerCompletionListener: (callback: LearningCompletionCallback) => () => void;
}

const OrchestratorContext = createContext<LearningOrchestratorApi | null>(null);

export interface LearningVideoProviderProps {
  children: ReactNode;
  ignoreCooldownReasons?: ReadonlyArray<LearningTriggerReason>;
}

const ALWAYS_TRIGGER_REASONS: ReadonlyArray<LearningTriggerReason> = ["hint"];

export function LearningVideoProvider({
  children,
  ignoreCooldownReasons = ALWAYS_TRIGGER_REASONS,
}: LearningVideoProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const lastVideoIdRef = useRef<string | null>(null);
  const completionListenersRef = useRef<Set<LearningCompletionCallback>>(new Set());

  useEffect(() => {
    const restored = restoreLock();
    if (restored) {
      lastVideoIdRef.current = restored.session.videoId;
      dispatch({
        type: "HYDRATE",
        session: restored.session,
        cooldownUntil: restored.cooldownUntil,
      });
    }
  }, []);

  useEffect(() => {
    if (state.session && !state.session.unlocked) {
      persistLock(state.session, state.cooldownUntil);
    } else if (!state.session) {
      clearLock();
    }
  }, [state.session, state.cooldownUntil]);

  const ignoreCooldownSet = useMemo(
    () => new Set(ignoreCooldownReasons),
    [ignoreCooldownReasons],
  );

  const trigger = useCallback(
    (payload: LearningTriggerPayload) => {
      if (state.session && !state.session.unlocked) {
        return false;
      }

      const now = Date.now();
      if (!ignoreCooldownSet.has(payload.reason) && now < state.cooldownUntil) {
        return false;
      }

      dispatch({
        type: "QUEUE",
        payload,
        previousVideoId: lastVideoIdRef.current,
      });
      return true;
    },
    [ignoreCooldownSet, state.cooldownUntil, state.session],
  );

  const reportLoading = useCallback(() => dispatch({ type: "PLAYER_LOADING" }), []);
  const reportPlaying = useCallback(() => dispatch({ type: "PLAYER_PLAYING" }), []);
  const reportPaused = useCallback(() => dispatch({ type: "PLAYER_PAUSED" }), []);
  const reportProgress = useCallback(
    (watchedSeconds: number, durationSeconds: number) => {
      dispatch({ type: "PLAYER_PROGRESS", watchedSeconds, durationSeconds });
    },
    [],
  );
  const reportError = useCallback(
    (message: string) => dispatch({ type: "PLAYER_ERROR", message }),
    [],
  );

  const markUnlocked = useCallback(
    (finalWatched: number, finalDuration: number) => {
      dispatch({ type: "MARK_UNLOCKED", finalWatched, finalDuration });
    },
    [],
  );

  const dismissUnlocked = useCallback(() => {
    if (state.session?.unlocked) {
      const sessionSnapshot = state.session;
      lastVideoIdRef.current = sessionSnapshot.videoId;
      completionListenersRef.current.forEach((listener) => {
        try {
          listener(sessionSnapshot);
        } catch {
          // listener errors must not block other listeners
        }
      });
      dispatch({ type: "RESET_AFTER_COMPLETION" });
    } else {
      dispatch({ type: "DISMISS" });
    }
  }, [state.session]);

  const registerCompletionListener = useCallback(
    (callback: LearningCompletionCallback) => {
      completionListenersRef.current.add(callback);
      return () => {
        completionListenersRef.current.delete(callback);
      };
    },
    [],
  );

  const value = useMemo<LearningOrchestratorApi>(
    () => ({
      state,
      trigger,
      reportLoading,
      reportPlaying,
      reportPaused,
      reportProgress,
      reportError,
      markUnlocked,
      dismissUnlocked,
      registerCompletionListener,
    }),
    [
      state,
      trigger,
      reportLoading,
      reportPlaying,
      reportPaused,
      reportProgress,
      reportError,
      markUnlocked,
      dismissUnlocked,
      registerCompletionListener,
    ],
  );

  return <OrchestratorContext.Provider value={value}>{children}</OrchestratorContext.Provider>;
}

export function useLearningOrchestrator(): LearningOrchestratorApi {
  const context = useContext(OrchestratorContext);
  if (!context) {
    throw new Error("useLearningOrchestrator must be used inside <LearningVideoProvider>");
  }
  return context;
}
