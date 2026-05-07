import { extractYouTubeId } from "./lib/youtube-id";

const RAW_VIDEO_URLS = [
  "https://youtu.be/mLxnxy_MjnY",
  "https://youtu.be/zNTUMNKSNwk",
  "https://youtu.be/_cp1aiGFVHc",
  "https://youtu.be/9HkIP4YkXu4",
  "https://youtu.be/uSdfczS5yPA",
  "https://youtu.be/3IOHu07sqMo",
  "https://youtu.be/3SzazN2OrsQ",
  "https://youtu.be/iMwvdz2Yvl0",
  "https://youtu.be/F-OURmsmEKo",
  "https://youtu.be/HCYLdtug8sk",
  "https://youtu.be/NmddGIZ3P94",
] as const;

export const LEARNING_VIDEO_IDS: readonly string[] = RAW_VIDEO_URLS.map((url) => {
  const id = extractYouTubeId(url);
  if (!id) {
    throw new Error(`learning-videos: cannot extract id from "${url}"`);
  }
  return id;
});

export const LEARNING_VIDEO_CONFIG = {
  minWatchSeconds: 120,
  triggerDelayMs: 350,
  cooldownMs: 90_000,
  failureThreshold: 3,
  stuckIdleMs: 45_000,
  routeLockKey: "rightsy:learning-video:lock:v1",
  storageNonceKey: "rightsy:learning-video:nonce:v1",
} as const;

export const LEARNING_VIDEO_COPY = {
  hintTitle: "Knowledge Power-Up",
  hintSubtitle: "Watch 2 minutes to unlock your hint",
  loseTitle: "Learning Boost Activated",
  loseSubtitle: "Watch 2 minutes before the next round",
  failureTitle: "Take a Tiny Brain Break",
  failureSubtitle: "Watch 2 minutes and level up",
  stuckTitle: "Stuck? Let's Recharge",
  stuckSubtitle: "A 2-minute clip to spark new ideas",
  manualTitle: "Time to Learn Something New",
  manualSubtitle: "Watch 2 minutes — then you can skip",
  watchingHint: "Keep watching — minimum 2 minutes",
  almostDone: "Almost there — great focus!",
  unlocked: "Unlocked! You can skip now",
  loadFailed: "We couldn't reach the video right now",
  retry: "Try again",
} as const;

export type LearningVideoCopyKey = keyof typeof LEARNING_VIDEO_COPY;
