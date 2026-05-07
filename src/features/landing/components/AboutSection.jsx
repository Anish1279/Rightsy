"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Shield, Brain, Award } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, label: "Interactive Learning", description: "Games that make complex ideas feel simple" },
  { icon: Shield, label: "Rights Education", description: "Understand your rights through real scenarios" },
  { icon: Brain, label: "Critical Thinking", description: "Build problem-solving skills naturally" },
  { icon: Award, label: "Earn Rewards", description: "Points, badges, and achievements as you learn" },
];

/** useInView — triggers when element enters viewport */
function useInView(threshold = 0.15) {
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

function AboutSection() {
  const [ref, inView] = useInView(0.1);

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background — dark base with subtle gradient mesh */}
      <div className="absolute inset-0 bg-[#0a0618]" />
      <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-[radial-gradient(ellipse_at_100%_0%,_rgba(124,58,237,0.15)_0%,_transparent_60%)]" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_0%_100%,_rgba(20,184,166,0.1)_0%,_transparent_60%)]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Asymmetric editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left — Image with floating overlay card */}
          <div className={`lg:col-span-5 transition-all duration-1000 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="relative">
              {/* Decorative frame */}
              <div className="absolute -inset-3 bg-gradient-to-br from-violet-600/30 to-teal-400/20 rounded-3xl blur-md" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/image2.jpg"
                  alt="Children learning about their rights together"
                  width={720}
                  height={720}
                  className="h-[400px] w-full object-cover md:h-[480px]"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0618]/80 via-transparent to-transparent" />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -right-4 md:-right-8 bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/[0.08] max-w-[200px]">
                <div className="text-3xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">10K+</div>
                <div className="text-xs text-white/50 mt-1 font-medium">Young minds learning their rights every day</div>
              </div>
            </div>
          </div>
          
          {/* Right — Content */}
          <div className={`lg:col-span-7 lg:pl-8 transition-all duration-1000 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <span className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold tracking-[0.15em] uppercase mb-5">
              <span className="w-8 h-px bg-violet-400" />
              About Rightsy
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-white mb-6 leading-[1.15]">
              We turn complex laws into{" "}
              <span className="relative inline-block">
                playful experiences
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8C40 2 80 2 100 6C120 10 160 4 198 8" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
                  <defs><linearGradient id="grad" x1="0" y1="0" x2="200" y2="0"><stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#14B8A6" /></linearGradient></defs>
                </svg>
              </span>
            </h2>

            <p className="text-base text-white/60 mb-8 leading-relaxed max-w-lg">
              Rightsy transforms how children understand the legal world. Through carefully 
              designed games, quizzes, and real-life scenarios, we make rights education 
              feel like an adventure — not a lecture.
            </p>

            {/* Feature grid — 2x2 bento-style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map(({ icon: Icon, label, description }, i) => (
                <div
                  key={label}
                  className={`group p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.06] hover:shadow-2xl hover:border-white/[0.15] transition-all duration-300 cursor-default ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: `${400 + i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                    <Icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{label}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(AboutSection);
