"use client";

import { useCallback, useState } from "react";
import MemoryGame from "@/features/game-zone/components/MemoryGame";
import { useLearningVideo } from "@/features/learning-videos";

const GAME_ID = "memory-test";

export default function MemoryTestPage() {
  const [restartSignal, setRestartSignal] = useState(0);

  const handleResumeAfterFailures = useCallback(() => {
    setRestartSignal((value) => value + 1);
  }, []);

  const learning = useLearningVideo({
    gameId: GAME_ID,
    failureThreshold: 4,
    onUnlockByReason: {
      "failure-threshold": handleResumeAfterFailures,
      stuck: handleResumeAfterFailures,
    },
  });

  const handleMove = useCallback(() => {
    learning.noteActivity();
  }, [learning]);

  const handleMismatch = useCallback(() => {
    learning.registerFailure();
  }, [learning]);

  const handleWin = useCallback(() => {
    learning.resetFailures();
  }, [learning]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-purple-100">
      <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4 text-center">
        Animal Friends Memory Game 🎮
      </h1>

      <p className="text-purple-600 mb-8 text-center max-w-md">
        Match all the animal friends to win! 🐶 🐱 🐭 🐼
      </p>

      <MemoryGame
        restartSignal={restartSignal}
        onMove={handleMove}
        onMismatch={handleMismatch}
        onWin={handleWin}
      />

      <footer className="mt-8 text-center text-purple-600">
        <p className="text-lg">👾 Have fun and train your memory! 👾</p>
      </footer>
    </main>
  );
}
