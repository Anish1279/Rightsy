"use client";

import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Lightbulb, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PuzzleGrid from "@/features/puzzle/components/PuzzleGrid";
import { pickRandomPuzzleImage, PUZZLE_IMAGE_ASPECT_RATIO } from "@/features/puzzle/services/puzzle-game";
import { useLearningVideo } from "@/features/learning-videos";

const GAME_ID = "puzzle";

export default function PuzzleGamePage() {
  const [puzzleImage, setPuzzleImage] = useState(null);
  const [gameId, setGameId] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [finishedMoves, setFinishedMoves] = useState(null);
  const previousImageSrcRef = useRef(null);

  const startNewGame = useCallback(() => {
    const nextImage = pickRandomPuzzleImage(previousImageSrcRef.current);

    previousImageSrcRef.current = nextImage?.src || null;
    setPuzzleImage(nextImage);
    setIsSolved(false);
    setFinishedMoves(null);
    setGameId((currentGameId) => currentGameId + 1);
  }, []);

  const learning = useLearningVideo({
    gameId: GAME_ID,
    stuckIdleMs: 60_000,
    onUnlockByReason: {
      stuck: startNewGame,
    },
  });

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleSolved = useCallback(
    async (moves) => {
      setIsSolved(true);
      setFinishedMoves(moves);
      learning.resetFailures();

      const confetti = (await import("canvas-confetti")).default;
      const colors = ["#7C3AED", "#14B8A6", "#F59E0B", "#F97066"];

      confetti({
        colors,
        origin: { y: 0.72 },
        particleCount: 90,
        spread: 70,
      });

      window.setTimeout(() => {
        confetti({
          colors,
          origin: { x: 0.25, y: 0.78 },
          particleCount: 45,
          scalar: 0.85,
          spread: 55,
        });
        confetti({
          colors,
          origin: { x: 0.75, y: 0.78 },
          particleCount: 45,
          scalar: 0.85,
          spread: 55,
        });
      }, 180);
    },
    [learning],
  );

  const handleMove = useCallback(() => {
    learning.noteActivity();
  }, [learning]);

  const handleHintBoost = useCallback(() => {
    learning.triggerOnHint();
  }, [learning]);

  return (
    <main className="relative h-[calc(100dvh-4rem)] overflow-hidden bg-[linear-gradient(135deg,#fff7ed_0%,#f5f3ff_42%,#ecfeff_100%)] px-4 py-3 sm:py-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(90deg,rgba(124,58,237,0.08),rgba(245,158,11,0.1),rgba(20,184,166,0.1))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(90deg,rgba(249,112,102,0.08),rgba(124,58,237,0.08),rgba(20,184,166,0.1))]"
      />

      <div className="relative mx-auto flex h-full max-w-[1480px] flex-col">
        <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-violet-700 shadow-sm ring-2 ring-violet-100 transition-colors hover:bg-violet-50"
            href="/dashboard/game-zone"
          >
            <ArrowLeft className="h-4 w-4" />
            Games
          </Link>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={learning.isVideoActive || isSolved}
              onClick={handleHintBoost}
              type="button"
            >
              <Lightbulb className="h-4 w-4" />
              Knowledge Boost
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5 hover:bg-violet-700"
              onClick={startNewGame}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Play Again
            </button>
          </div>
        </div>

        <section className="mb-3 shrink-0 overflow-hidden rounded-[1.25rem] border-2 border-white/90 bg-white/82 px-4 py-2.5 shadow-[0_14px_38px_rgba(124,58,237,0.09)] backdrop-blur sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700 ring-2 ring-amber-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Game 4
                </div>
                <h1 className="text-2xl font-black leading-none text-[var(--rightsy-text-primary)] sm:text-4xl">
                  🧩 Puzzle Game
                </h1>
              </div>
              <p className="mt-1 max-w-2xl truncate text-sm font-bold text-[var(--rightsy-text-secondary)] sm:text-base">
                Put the pieces together to complete the picture!
              </p>
            </div>

            <div className="hidden shrink-0 grid-cols-2 gap-2 md:grid">
              <div className="rounded-2xl bg-violet-50 px-4 py-2 text-center ring-2 ring-violet-100">
                <p className="text-xl font-black leading-none text-violet-700">3x3</p>
                <p className="mt-1 text-xs font-extrabold text-violet-500">Puzzle</p>
              </div>
              <div className="rounded-2xl bg-teal-50 px-4 py-2 text-center ring-2 ring-teal-100">
                <p className="text-xl font-black leading-none text-teal-700">5</p>
                <p className="mt-1 text-xs font-extrabold text-teal-500">Pictures</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid min-h-0 flex-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="relative min-h-0 overflow-hidden rounded-[2rem] border-2 border-white/90 bg-white/80 p-3 shadow-[0_26px_70px_rgba(124,58,237,0.16)] backdrop-blur sm:p-4">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-3 bg-[linear-gradient(90deg,#7c3aed,#f59e0b,#14b8a6,#f97066)]"
            />
            <div className="flex h-full min-h-0 items-center justify-center pt-3">
              {puzzleImage ? (
                <PuzzleGrid
                  gameId={gameId}
                  imageSrc={puzzleImage.src}
                  isLocked={isSolved || learning.isVideoActive}
                  onMove={handleMove}
                  onSolved={handleSolved}
                />
              ) : (
                <div
                  className="flex w-full max-w-[820px] items-center justify-center rounded-[2rem] bg-violet-100 text-xl font-extrabold text-violet-700"
                  style={{ aspectRatio: PUZZLE_IMAGE_ASPECT_RATIO }}
                >
                  Loading puzzle...
                </div>
              )}
            </div>
          </section>

          <aside className="hidden min-h-0 grid-rows-[auto_1fr] gap-4 xl:grid">
            <section className="rounded-[1.75rem] border-2 border-violet-100 bg-white/90 p-4 shadow-[0_18px_45px_rgba(124,58,237,0.1)] backdrop-blur">
              <div className="flex items-center gap-2 text-xl font-black text-violet-700">
                <ImageIcon className="h-6 w-6" />
                Picture Guide
              </div>
              <div
                aria-label={puzzleImage?.name || "Puzzle picture guide"}
                className="mt-3 overflow-hidden rounded-[1.5rem] border-[5px] border-white bg-violet-100 bg-center shadow-[inset_0_0_0_1px_rgba(124,58,237,0.1),0_16px_30px_rgba(30,27,75,0.12)]"
                role="img"
                style={{
                  aspectRatio: PUZZLE_IMAGE_ASPECT_RATIO,
                  backgroundImage: puzzleImage ? `url("${puzzleImage.src}")` : undefined,
                  backgroundSize: "100% 100%",
                }}
              />
            </section>

            <section
              className={`flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border-2 p-5 text-center shadow-[0_18px_45px_rgba(30,27,75,0.1)] transition-all ${
                isSolved
                  ? "border-teal-200 bg-[linear-gradient(135deg,#ecfdf5,#f0fdfa)] text-teal-800"
                  : "border-pink-100 bg-[linear-gradient(135deg,#fff1f2,#fff7ed)] text-pink-700"
              }`}
            >
              {isSolved ? (
                <>
                  <Trophy className="mx-auto mb-2 h-10 w-10 text-amber-500" />
                  <p className="text-3xl font-black">🎉 You solved it!</p>
                  <p className="mt-2 text-lg font-extrabold">
                    {finishedMoves ? `${finishedMoves} happy moves` : "Great job!"}
                  </p>
                  <button
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-6 py-3 text-base font-black text-white shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    onClick={startNewGame}
                    type="button"
                  >
                    <RefreshCw className="h-5 w-5" />
                    New Picture
                  </button>
                </>
              ) : (
                <>
                  <p className="text-3xl font-black">Find the picture!</p>
                  <p className="mt-2 text-lg font-extrabold">9 big pieces, one bright scene.</p>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
