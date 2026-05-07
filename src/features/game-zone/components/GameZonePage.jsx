"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { memo } from "react";
import { motion } from "motion/react";
import { ChevronRight, Gamepad2, Grid3X3, BrainCircuit, Puzzle } from "lucide-react";

const GAMES = [
  {
    id: 1,
    name: "Word Scramble",
    image: "/word_scramble.png",
    description: "Unscramble the letters to find the hidden word!",
    route: "/dashboard/game-zone/word-scramble",
    icon: Gamepad2,
    gradient: "from-violet-500 to-violet-600",
  },
  {
    id: 2,
    name: "Sudoku",
    image: "/sudoku.png",
    description: "Fill the grid with numbers from 1 to 9!",
    route: "/dashboard/game-zone/sudoko",
    icon: Grid3X3,
    gradient: "from-teal-500 to-teal-600",
  },
  {
    id: 3,
    name: "Memory Test",
    image: "/memory.avif",
    description: "Remember the patterns and match the cards!",
    route: "/dashboard/game-zone/memory-test",
    icon: BrainCircuit,
    gradient: "from-amber-500 to-amber-600",
  },
  {
    id: 4,
    name: "Puzzle",
    image: "/puzzle.jpg",
    description: "Put the pieces together to complete the picture!",
    route: "/dashboard/game-zone/puzzle",
    icon: Puzzle,
    gradient: "from-pink-500 to-pink-600",
  },
];

/**
 * GameZonePage — Game selection hub.
 *
 * Uses motion/react (v12) for entrance animations.
 * Each game card has a distinct gradient accent for visual variety.
 */
function GameZonePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-brand-gradient py-10 px-4 sm:px-6">
        <div className="section-container text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            🎮 Fun Games for Kids
          </h1>
          <p className="text-white/80 text-base">
            The more you play, the more you learn!
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="section-container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                className="bg-white rounded-2xl overflow-hidden border-2 border-violet-100 hover:border-violet-300 card-hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: game.id * 0.08 }}
              >
                {/* Game Image */}
                <div className="relative h-44 bg-violet-50 overflow-hidden">
                  <Image
                    src={game.image}
                    alt={`${game.name} game`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className={`absolute top-2.5 right-2.5 bg-gradient-to-r ${game.gradient} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
                    Game {game.id}
                  </div>
                </div>

                {/* Game Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-violet-600" />
                    <h2 className="text-lg font-bold text-[var(--rightsy-text-primary)]">
                      {game.name}
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--rightsy-text-secondary)] mb-4 leading-relaxed">
                    {game.description}
                  </p>

                  <button
                    onClick={() => router.push(game.route)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    Play Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom decoration */}
        <div className="mt-10 text-center">
          <p className="text-[var(--rightsy-text-secondary)] font-medium text-sm">
            🎯 Learning is fun with our interactive games!
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(GameZonePage);
