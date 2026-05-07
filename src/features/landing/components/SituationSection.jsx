"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Video, CheckCircle2 } from "lucide-react";

const SCENARIO = {
  title: "School Lunch Situation",
  question: "You see someone taking another child's lunch at school. What should you do?",
  options: [
    { id: "a", text: "Tell a teacher or school staff member about what you saw", correct: true },
    { id: "b", text: "Ignore it because it's not your problem", correct: false },
    { id: "c", text: "Confront the person taking the lunch yourself", correct: false },
    { id: "d", text: "Offer to share your lunch with the child who lost theirs", correct: false },
  ],
};

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

function SituationSection() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [sRef, inView] = useInView(0.1);

  const handleSelect = useCallback((id) => {
    if (revealed) return;
    setSelectedOption(id);
  }, [revealed]);

  const handleReveal = useCallback(() => {
    if (!selectedOption) return;
    setRevealed(true);
  }, [selectedOption]);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#0a0618]" />
      <div className="absolute top-0 left-0 w-[60%] h-[40%] bg-[radial-gradient(ellipse_at_0%_0%,_rgba(249,112,102,0.1)_0%,_transparent_60%)]" />

      <div ref={sRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left — Big label */}
          <div className={`lg:col-span-4 lg:sticky lg:top-24 transition-all duration-800 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-2 text-coral-400 text-xs font-bold tracking-[0.15em] uppercase mb-4">
              <span className="w-8 h-px bg-coral-400" />
              Interactive
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              What would{" "}
              <span className="bg-gradient-to-r from-violet-400 to-coral-400 bg-clip-text text-transparent">
                you
              </span>{" "}
              do?
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Real-life scenarios that test your understanding of rights. Pick the best response and see how you think.
            </p>
            <div className="hidden lg:flex items-center gap-3 text-sm">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className={`w-8 h-1 rounded-full ${n === 1 ? 'bg-violet-500' : 'bg-white/[0.08]'}`} />
                ))}
              </div>
              <span className="text-white/30 text-xs font-semibold">1 / 5 scenarios</span>
            </div>
          </div>

          {/* Right — Scenario card */}
          <div className={`lg:col-span-8 transition-all duration-800 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
              {/* Scenario header */}
              <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 px-6 md:px-8 py-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1IiBkPSJNMCAwbDMyIDMydS0zMiAweiIvPjwvc3ZnPg==')] opacity-20" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                    Scenario
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-sm">
                    {SCENARIO.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-base font-medium text-white/90 mb-6">
                  {SCENARIO.question}
                </p>

                <div className="space-y-3">
                  {SCENARIO.options.map(({ id, text, correct }) => {
                    const isSelected = selectedOption === id;
                    const showCorrect = revealed && correct;
                    const showWrong = revealed && isSelected && !correct;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelect(id)}
                        disabled={revealed}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                          showCorrect
                            ? "border-teal-400 bg-teal-500/10 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                            : showWrong
                            ? "border-red-400 bg-red-500/10"
                            : isSelected
                            ? "border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.01]"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.05]"
                        } ${revealed ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                            showCorrect
                              ? "bg-teal-500 text-white"
                              : showWrong
                              ? "bg-red-500 text-white"
                              : isSelected
                              ? "bg-violet-600 text-white"
                              : "bg-white/[0.06] text-white/40"
                          }`}>
                            {showCorrect ? <CheckCircle2 className="w-4 h-4" /> : id.toUpperCase()}
                          </div>
                          <span className={`text-sm font-medium transition-colors ${
                            isSelected || showCorrect ? "text-white" : "text-white/60 group-hover:text-white/80"
                          }`}>{text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Action bar */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    className="text-xs border-white/[0.1] text-white/70 bg-transparent hover:bg-white/[0.06] hover:text-white rounded-full px-5 transition-all"
                  >
                    <Video className="w-3.5 h-3.5 mr-1.5" />
                    Watch Explainer
                  </Button>
                  <Button
                    onClick={handleReveal}
                    disabled={!selectedOption || revealed}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full px-6 py-5 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-violet-600/20"
                  >
                    {revealed ? "Answer Revealed ✓" : "Check Answer"}
                    {!revealed && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(SituationSection);
