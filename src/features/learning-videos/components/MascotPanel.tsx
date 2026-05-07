"use client";

import { Sparkles } from "lucide-react";
import { LEARNING_VIDEO_COPY } from "../constants";
import type { LearningTriggerReason } from "../types";

interface MascotPanelProps {
  reason: LearningTriggerReason;
  unlocked: boolean;
  progress: number;
}

const TITLE_BY_REASON: Record<LearningTriggerReason, string> = {
  hint: LEARNING_VIDEO_COPY.hintTitle,
  lose: LEARNING_VIDEO_COPY.loseTitle,
  "failure-threshold": LEARNING_VIDEO_COPY.failureTitle,
  stuck: LEARNING_VIDEO_COPY.stuckTitle,
  manual: LEARNING_VIDEO_COPY.manualTitle,
};

const SUBTITLE_BY_REASON: Record<LearningTriggerReason, string> = {
  hint: LEARNING_VIDEO_COPY.hintSubtitle,
  lose: LEARNING_VIDEO_COPY.loseSubtitle,
  "failure-threshold": LEARNING_VIDEO_COPY.failureSubtitle,
  stuck: LEARNING_VIDEO_COPY.stuckSubtitle,
  manual: LEARNING_VIDEO_COPY.manualSubtitle,
};

export function MascotPanel({ reason, unlocked, progress }: MascotPanelProps) {
  const title = unlocked ? "You did it!" : TITLE_BY_REASON[reason];
  const subtitle = unlocked
    ? LEARNING_VIDEO_COPY.unlocked
    : progress >= 0.75
      ? LEARNING_VIDEO_COPY.almostDone
      : SUBTITLE_BY_REASON[reason];

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-pink-400 to-violet-500 text-white shadow-lg">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-black text-white">{title}</p>
        <p className="truncate text-sm font-medium text-white/85">{subtitle}</p>
      </div>
    </div>
  );
}
