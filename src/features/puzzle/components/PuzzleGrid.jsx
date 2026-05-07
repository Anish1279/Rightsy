"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createShuffledTiles,
  getTilePosition,
  GRID_SIZE,
  isPuzzleSolved,
  PUZZLE_IMAGE_ASPECT_RATIO,
  PUZZLE_IMAGE_RATIO_VALUE,
  swapTiles,
} from "@/features/puzzle/services/puzzle-game";

function PuzzleTileArt({ imageSrc, correctIndex }) {
  const { row, col } = getTilePosition(correctIndex);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute h-[300%] w-[300%] bg-no-repeat"
        style={{
          left: `-${col * 100}%`,
          top: `-${row * 100}%`,
          backgroundImage: `url("${imageSrc}")`,
          backgroundSize: "100% 100%",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
    </div>
  );
}

export default function PuzzleGrid({ imageSrc, gameId, isLocked = false, onMove, onSolved }) {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [hasSolved, setHasSolved] = useState(false);
  const [boardMaxWidth, setBoardMaxWidth] = useState(820);
  const dragStateRef = useRef(null);

  const updateDragState = useCallback((nextDragState) => {
    const resolvedState =
      typeof nextDragState === "function" ? nextDragState(dragStateRef.current) : nextDragState;

    dragStateRef.current = resolvedState;
    setDragState(resolvedState);
  }, []);

  useEffect(() => {
    setTiles(createShuffledTiles());
    setMoves(0);
    setSelectedIndex(null);
    setHasSolved(false);
    updateDragState(null);
  }, [gameId, imageSrc, updateDragState]);

  useEffect(() => {
    const updateBoardSize = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const reservedHeight = viewportWidth >= 1280 ? 190 : 250;
      const heightBasedWidth = Math.max(320, (viewportHeight - reservedHeight) * PUZZLE_IMAGE_RATIO_VALUE);
      const widthBasedLimit = Math.max(320, viewportWidth - (viewportWidth >= 1280 ? 520 : 40));

      setBoardMaxWidth(Math.min(900, heightBasedWidth, widthBasedLimit));
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);

    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  useEffect(() => {
    if (tiles.length === 0 || hasSolved || !isPuzzleSolved(tiles)) return;

    setHasSolved(true);
    setSelectedIndex(null);
    onSolved?.(moves);
  }, [hasSolved, moves, onSolved, tiles]);

  const performSwap = useCallback(
    (fromIndex, toIndex) => {
      if (isLocked || hasSolved || fromIndex === toIndex || !tiles[fromIndex] || !tiles[toIndex]) {
        return;
      }

      setTiles((currentTiles) => swapTiles(currentTiles, fromIndex, toIndex));
      setMoves((currentMoves) => currentMoves + 1);
      setSelectedIndex(null);
      onMove?.();
    },
    [hasSolved, isLocked, onMove, tiles],
  );

  const handleTileTap = useCallback(
    (position) => {
      if (isLocked || hasSolved) return;

      if (selectedIndex === null) {
        setSelectedIndex(position);
        return;
      }

      if (selectedIndex === position) {
        setSelectedIndex(null);
        return;
      }

      performSwap(selectedIndex, position);
    },
    [hasSolved, isLocked, performSwap, selectedIndex],
  );

  const handlePointerDown = useCallback(
    (event, position, tile) => {
      if (isLocked || hasSolved || event.button > 0) return;

      const tileRect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.setPointerCapture?.(event.pointerId);

      updateDragState({
        fromIndex: position,
        height: tileRect.height,
        isDragging: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        tile,
        width: tileRect.width,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [hasSolved, isLocked, updateDragState],
  );

  const handlePointerMove = useCallback(
    (event) => {
      const currentDragState = dragStateRef.current;
      if (!currentDragState || currentDragState.pointerId !== event.pointerId) return;

      const distance = Math.hypot(
        event.clientX - currentDragState.startX,
        event.clientY - currentDragState.startY,
      );

      if (distance > 6) {
        event.preventDefault();
      }

      updateDragState((previousDragState) => {
        if (!previousDragState) return null;

        return {
          ...previousDragState,
          isDragging: previousDragState.isDragging || distance > 8,
          x: event.clientX,
          y: event.clientY,
        };
      });
    },
    [updateDragState],
  );

  const handlePointerUp = useCallback(
    (event) => {
      const currentDragState = dragStateRef.current;
      if (!currentDragState || currentDragState.pointerId !== event.pointerId) return;

      event.currentTarget.releasePointerCapture?.(event.pointerId);

      if (currentDragState.isDragging) {
        const targetElement = document.elementFromPoint(event.clientX, event.clientY);
        const targetTile = targetElement?.closest?.("[data-puzzle-position]");
        const targetIndex = Number(targetTile?.getAttribute("data-puzzle-position"));

        if (Number.isInteger(targetIndex) && targetIndex !== currentDragState.fromIndex) {
          performSwap(currentDragState.fromIndex, targetIndex);
        } else {
          setSelectedIndex(null);
        }
      } else {
        handleTileTap(currentDragState.fromIndex);
      }

      updateDragState(null);
    },
    [handleTileTap, performSwap, updateDragState],
  );

  const handlePointerCancel = useCallback(
    (event) => {
      const currentDragState = dragStateRef.current;
      if (currentDragState?.pointerId === event.pointerId) {
        updateDragState(null);
      }
    },
    [updateDragState],
  );

  const handleKeyDown = useCallback(
    (event, position) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      handleTileTap(position);
    },
    [handleTileTap],
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center">
      <div
        className="mx-auto mb-3 flex w-full items-center justify-between gap-3"
        style={{ maxWidth: boardMaxWidth }}
      >
        <div className="rounded-full bg-white px-4 py-2 text-base font-extrabold text-violet-700 shadow-sm ring-2 ring-violet-100 sm:px-5 sm:py-2.5 sm:text-lg">
          Moves {moves}
        </div>
        <div className="rounded-full bg-amber-100 px-4 py-2 text-base font-extrabold text-amber-700 shadow-sm ring-2 ring-amber-200 sm:px-5 sm:py-2.5 sm:text-lg">
          {hasSolved ? "Finished" : selectedIndex === null ? "Ready" : "Picked"}
        </div>
      </div>

      <div
        className={`relative mx-auto w-full rounded-[1.75rem] bg-[linear-gradient(135deg,#ddd6fe_0%,#fef3c7_48%,#ccfbf1_100%)] p-2 shadow-[0_24px_60px_rgba(124,58,237,0.22)] transition-all sm:rounded-[2.25rem] sm:p-3 ${
          hasSolved ? "ring-8 ring-teal-200" : "ring-2 ring-white/90"
        }`}
        style={{ aspectRatio: PUZZLE_IMAGE_ASPECT_RATIO, maxWidth: boardMaxWidth }}
      >
        <div
          className="grid h-full w-full gap-2 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((tile, position) => {
            const isSelected = selectedIndex === position;
            const isDragging =
              dragState?.tile.correctIndex === tile.correctIndex && dragState?.isDragging;
            const isCorrect = tile.correctIndex === tile.currentIndex;

            return (
              <motion.button
                aria-label={`Puzzle piece ${tile.correctIndex + 1}`}
                aria-pressed={isSelected}
                className={`relative h-full min-h-0 w-full touch-none overflow-hidden rounded-[1.35rem] border-[5px] bg-white shadow-[0_10px_22px_rgba(30,27,75,0.13)] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 sm:rounded-[1.65rem] ${
                  isSelected
                    ? "border-amber-300 ring-4 ring-amber-200"
                    : "border-white/90 hover:border-violet-200"
                } ${isDragging ? "opacity-40" : ""} ${
                  hasSolved ? "cursor-default opacity-0 scale-95" : "cursor-grab active:cursor-grabbing"
                }`}
                data-puzzle-position={position}
                disabled={isLocked || hasSolved}
                key={tile.id}
                layout
                onKeyDown={(event) => handleKeyDown(event, position)}
                onPointerCancel={handlePointerCancel}
                onPointerDown={(event) => handlePointerDown(event, position, tile)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                transition={{ type: "spring", stiffness: 460, damping: 34 }}
                type="button"
                whileHover={hasSolved ? undefined : { scale: 1.025 }}
                whileTap={hasSolved ? undefined : { scale: 0.98 }}
              >
                <PuzzleTileArt correctIndex={tile.correctIndex} imageSrc={imageSrc} />
                {isCorrect && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-teal-600 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {hasSolved && (
            <motion.div
              animate={{
                clipPath: "circle(78% at 50% 50%)",
                opacity: 1,
                scale: 1,
              }}
              className="absolute inset-2.5 z-20 overflow-hidden rounded-[1.8rem] border-[6px] border-white bg-cover bg-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),0_20px_48px_rgba(20,184,166,0.24)] sm:inset-3 sm:rounded-[2rem]"
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{
                clipPath: "circle(0% at 50% 50%)",
                opacity: 0,
                scale: 0.9,
              }}
              style={{
                backgroundImage: `url("${imageSrc}")`,
                backgroundSize: "100% 100%",
              }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ x: ["-130%", "130%"] }}
                className="absolute inset-y-0 w-1/2 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.72),transparent)]"
                transition={{ delay: 0.15, duration: 1.1, ease: "easeOut" }}
              />
              <div className="absolute inset-x-4 bottom-4 flex justify-center">
                <motion.div
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className="rounded-full bg-white/95 px-5 py-2 text-lg font-black text-teal-700 shadow-lg ring-2 ring-teal-100"
                  initial={{ y: 16, opacity: 0, scale: 0.92 }}
                  transition={{ delay: 0.35, duration: 0.35 }}
                >
                  Solved picture!
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dragState?.isDragging && (
          <motion.div
            animate={{ opacity: 0.96, rotate: 2, scale: 1.08 }}
            className="pointer-events-none fixed z-[100] overflow-hidden rounded-2xl border-4 border-amber-300 bg-white shadow-[0_18px_40px_rgba(30,27,75,0.22)]"
            exit={{ opacity: 0, scale: 0.92 }}
            initial={{ opacity: 0, scale: 0.92 }}
            style={{
              height: dragState.height,
              left: dragState.x - dragState.width / 2,
              top: dragState.y - dragState.height / 2,
              width: dragState.width,
            }}
          >
            <PuzzleTileArt correctIndex={dragState.tile.correctIndex} imageSrc={imageSrc} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
