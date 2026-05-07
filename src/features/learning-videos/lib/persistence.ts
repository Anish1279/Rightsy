import { LEARNING_VIDEO_CONFIG } from "../constants";
import type { LearningVideoSession } from "../types";

const STORAGE_VERSION = 1;

interface PersistedLockShape {
  version: number;
  signature: string;
  payload: {
    session: LearningVideoSession;
    cooldownUntil: number;
    savedAt: number;
  };
}

function getNonce(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let nonce = window.localStorage.getItem(LEARNING_VIDEO_CONFIG.storageNonceKey);
    if (!nonce) {
      nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(LEARNING_VIDEO_CONFIG.storageNonceKey, nonce);
    }
    return nonce;
  } catch {
    return "ephemeral";
  }
}

function sign(payload: PersistedLockShape["payload"]): string {
  const nonce = getNonce();
  const serialized = `${nonce}::${JSON.stringify(payload)}`;
  let hash = 5381;
  for (let i = 0; i < serialized.length; i++) {
    hash = ((hash << 5) + hash + serialized.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

export function persistLock(session: LearningVideoSession, cooldownUntil: number): void {
  if (typeof window === "undefined") return;
  try {
    const payload = { session, cooldownUntil, savedAt: Date.now() };
    const data: PersistedLockShape = {
      version: STORAGE_VERSION,
      signature: sign(payload),
      payload,
    };
    window.localStorage.setItem(LEARNING_VIDEO_CONFIG.routeLockKey, JSON.stringify(data));
  } catch {
    // ignore quota or privacy-mode failures
  }
}

export function restoreLock(): {
  session: LearningVideoSession;
  cooldownUntil: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEARNING_VIDEO_CONFIG.routeLockKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedLockShape;
    if (parsed.version !== STORAGE_VERSION || !parsed.signature || !parsed.payload) {
      clearLock();
      return null;
    }

    const expectedSignature = sign(parsed.payload);
    if (expectedSignature !== parsed.signature) {
      clearLock();
      return null;
    }

    const { session, cooldownUntil, savedAt } = parsed.payload;
    if (!session || session.unlocked) {
      clearLock();
      return null;
    }

    const ageMs = Date.now() - savedAt;
    const maxResumableMs = 1000 * 60 * 60 * 4;
    if (ageMs < 0 || ageMs > maxResumableMs) {
      clearLock();
      return null;
    }

    return { session, cooldownUntil };
  } catch {
    clearLock();
    return null;
  }
}

export function clearLock(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEARNING_VIDEO_CONFIG.routeLockKey);
  } catch {
    // ignore
  }
}
