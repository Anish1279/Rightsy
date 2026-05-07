"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Gamepad2, Grid3X3, BrainCircuit, Puzzle, ArrowUpRight } from "lucide-react";

const GAMES = [
  {
    title: "Word Scramble",
    description: "Unscramble words to discover your rights",
    icon: Gamepad2,
    gradient: "from-violet-600 to-indigo-600",
    bgAccent: "bg-violet-500/10",
    size: "large", // Bento: spans 2 cols
  },
  {
    title: "Sudoku",
    description: "Number puzzles that unlock legal facts",
    icon: Grid3X3,
    gradient: "from-teal-500 to-emerald-600",
    bgAccent: "bg-teal-500/10",
    size: "small",
  },
  {
    title: "Memory Test",
    description: "Match cards & learn key rights",
    icon: BrainCircuit,
    gradient: "from-amber-500 to-orange-600",
    bgAccent: "bg-amber-500/10",
    size: "small",
  },
  {
    title: "Puzzle",
    description: "Piece together knowledge about children's rights",
    icon: Puzzle,
    gradient: "from-pink-500 to-rose-600",
    bgAccent: "bg-pink-500/10",
    size: "large", // Bento: spans 2 cols
  },
];

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function GameZoneSection({ onPlayNow }) {
  const [ref, inView] = useInView(0.05);

  return (
    <section id="games" className="relative py-24 md:py-32 overflow-hidden">
      {/* Dark section for contrast */}
      <div className="absolute inset-0 bg-[#0f0a1f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(124,58,237,0.15)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_90%,_rgba(20,184,166,0.08)_0%,_transparent_50%)]" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header — left-aligned editorial */}
        <div className={`mb-14 transition-all duration-800 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold tracking-[0.15em] uppercase mb-4">
            <span className="w-8 h-px bg-violet-500" />
            Game Zone
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Learn through{" "}
            <span className="bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
              play
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-md">
            Four ways to explore your rights. Each game teaches you something new.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map((game, i) => {
            const Icon = game.icon;
            const isLarge = game.size === "large";

            return (
              <div
                key={game.title}
                onClick={onPlayNow}
                className={`
                  group relative rounded-3xl overflow-hidden cursor-pointer
                  ${isLarge ? "lg:col-span-2" : "lg:col-span-2"}
                  transition-all duration-700
                  ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                `}
                style={{ transitionDelay: `${200 + i * 120}ms` }}
              >
                {/* Card background */}
                <div className="absolute inset-0 bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm rounded-3xl" />
                <div className={`absolute inset-0 ${game.bgAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                
                {/* Content */}
                <div className={`relative p-6 md:p-8 ${isLarge ? "md:py-10" : ""}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.12] transition-colors">
                      <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transform" />
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 tracking-tight">
                    {game.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-6">
                    {game.description}
                  </p>

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/25 font-medium uppercase tracking-wider">
                      Play now
                    </span>
                    <div className="flex gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${game.gradient}`} />
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${game.gradient} opacity-60`} />
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${game.gradient} opacity-30`} />
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${game.gradient} rounded-3xl opacity-0 group-hover:opacity-[0.08] blur-xl transition-opacity duration-500`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(GameZoneSection);
