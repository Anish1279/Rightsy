export type LearningTriggerReason =
  | "hint"
  | "lose"
  | "failure-threshold"
  | "stuck"
  | "manual";

export type LearningVideoStatus =
  | "idle"
  | "queued"
  | "loading"
  | "playing"
  | "paused"
  | "error"
  | "unlocking"
  | "unlocked";

export interface LearningGameContext {
  gameId: string;
  label?: string;
}

export interface LearningTriggerPayload {
  gameId: string;
  reason: LearningTriggerReason;
  meta?: Record<string, unknown>;
}

export interface LearningVideoSession {
  id: string;
  videoId: string;
  reason: LearningTriggerReason;
  gameId: string;
  startedAt: number;
  watchedSeconds: number;
  durationSeconds: number;
  unlocked: boolean;
}

export interface LearningOrchestratorState {
  status: LearningVideoStatus;
  session: LearningVideoSession | null;
  cooldownUntil: number;
  lastReason: LearningTriggerReason | null;
  lastError: string | null;
}

export type LearningCompletionCallback = (session: LearningVideoSession) => void;
