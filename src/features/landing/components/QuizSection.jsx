"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Award, Zap, Star } from "lucide-react";

const QUIZ_OPTIONS = [
  { letter: "A", text: "10 years old" },
  { letter: "B", text: "13 years old" },
  { letter: "C", text: "16 years old" },
  { letter: "D", text: "18 years old" },
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

function QuizSection() {
  const [selected, setSelected] = useState(null);
  const [qRef, inView] = useInView(0.1);

  return (
    <section id="quiz" className="relative py-24 md:py-32 overflow-hidden">
      {/* Dark themed section */}
      <div className="absolute inset-0 bg-[#0f0a1f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,_rgba(124,58,237,0.12)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(245,158,11,0.08)_0%,_transparent_50%)]" />

      <div ref={qRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left — Quiz card (larger) */}
          <div className={`lg:col-span-7 order-2 lg:order-1 transition-all duration-800 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-3xl overflow-hidden">
              {/* Question header */}
              <div className="p-6 md:p-8 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">
                    Question 3 / 10
                  </span>
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 text-xs font-bold">120 pts</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/[0.06] rounded-full mb-6">
                  <div className="w-[30%] h-full bg-gradient-to-r from-violet-500 to-teal-400 rounded-full transition-all duration-500" />
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-white leading-snug">
                  What is the minimum age for a child to have a social media account?
                </h3>
              </div>

              {/* Options */}
              <div className="p-6 md:p-8 space-y-3">
                {QUIZ_OPTIONS.map(({ letter, text }) => (
                  <button
                    key={letter}
                    onClick={() => setSelected(letter)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                      selected === letter
                        ? "border-violet-400 bg-violet-500/10"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                        selected === letter
                          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                          : "bg-white/[0.06] text-white/40 group-hover:text-white/60"
                      }`}>
                        {letter}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        selected === letter ? "text-white" : "text-white/50 group-hover:text-white/70"
                      }`}>
                        {text}
                      </span>
                    </div>
                  </button>
                ))}

                <button
                  disabled={!selected}
                  className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-violet-600/20 text-sm"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>

          {/* Right — Heading + stats */}
          <div className={`lg:col-span-5 order-1 lg:order-2 transition-all duration-800 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold tracking-[0.15em] uppercase mb-4">
              <span className="w-8 h-px bg-amber-500" />
              Quiz Challenge
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Test your{" "}
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                knowledge
              </span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-sm">
              Answer questions about rights and laws. Earn points, climb the leaderboard, and prove you know your rights!
            </p>

            {/* Stats */}
            <div className="space-y-4">
              {[
                { icon: Zap, label: "10 Questions", value: "per quiz", color: "text-violet-400" },
                { icon: Award, label: "+10 Points", value: "per correct answer", color: "text-amber-400" },
                { icon: Star, label: "5 Levels", value: "to complete", color: "text-teal-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{label}</div>
                    <div className="text-white/30 text-xs">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(QuizSection);
