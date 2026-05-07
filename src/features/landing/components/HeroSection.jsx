"use client";

import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowDown } from "lucide-react";
import OctahedronVideo from "@/components/ui/OctahedronVideo";

/**
 * HeroSection — Immersive, editorial hero.
 *
 * NOTE: OctahedronVideo is FROZEN — do not modify.
 */
function HeroSection({ onStartLearning, onAdminLogin }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger staggered entrance animations after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[#1a0533]" />
        <div className="absolute top-0 left-0 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_20%_20%,_#7C3AED_0%,_transparent_60%)] opacity-60" />
        <div className="absolute bottom-0 right-0 w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_80%_80%,_#6D28D9_0%,_transparent_60%)] opacity-50" />
        <div className="absolute top-[30%] right-[20%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_60%_40%,_#F97066_0%,_transparent_50%)] opacity-20" />
        
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated lines / grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Floating orbs */}
        <div className="absolute top-[8%] left-[8%] w-2 h-2 rounded-full bg-violet-400/40 animate-float-slow" />
        <div className="absolute top-[15%] right-[12%] w-3 h-3 rounded-full bg-coral-300/30 animate-float-medium" />
        <div className="absolute bottom-[25%] left-[15%] w-2.5 h-2.5 rounded-full bg-teal-400/30 animate-float-fast" />
        <div className="absolute bottom-[20%] right-[25%] w-1.5 h-1.5 rounded-full bg-amber-300/40 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[40%] w-2 h-2 rounded-full bg-white/20 animate-float-medium" style={{ animationDelay: '1s' }} />
        
        {/* Subtle horizontal lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-0">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-4 min-h-screen md:min-h-0 md:h-screen">
          
          {/* Left — Editorial typography */}
          <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-center">
            {/* Eyebrow */}
            <div
              className={`transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] backdrop-blur-md text-white/80 text-xs font-semibold tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Interactive Learning Platform
              </span>
            </div>

            {/* Main heading — staggered lines */}
            <h1 className="mb-6">
              <span
                className={`block text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-extrabold text-white leading-[1.05] tracking-tight transition-all duration-700 delay-150 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                Know Your
              </span>
              <span
                className={`block text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-extrabold leading-[1.05] tracking-tight transition-all duration-700 delay-300 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                  Rights
                </span>
                <span className="text-white/40 mx-3">&</span>
                <span className="bg-gradient-to-r from-teal-300 via-teal-200 to-teal-400 bg-clip-text text-transparent">
                  Laws
                </span>
              </span>
            </h1>

            {/* Subtext */}
            <p
              className={`text-base md:text-lg text-white/55 mb-8 max-w-md leading-relaxed transition-all duration-700 delay-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Explore rights and laws through exciting games, quizzes, and
              interactive challenges — built for kids aged 8–14.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-3 justify-center md:justify-start transition-all duration-700 delay-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Button
                size="lg"
                onClick={onStartLearning}
                className="group bg-white text-violet-900 hover:bg-violet-50 font-bold text-sm px-7 py-6 rounded-full shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] transition-all"
              >
                Start Learning
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={onAdminLogin}
                className="text-white/60 hover:text-white hover:bg-white/[0.08] font-medium text-sm px-7 py-6 rounded-full transition-all"
              >
                Admin Login
              </Button>
            </div>

            {/* Trust line */}
            <div
              className={`mt-10 flex items-center gap-6 justify-center md:justify-start transition-all duration-700 delay-[900ms] ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex -space-x-2">
                {["🧒", "👧", "👦", "🧒"].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-violet-800/60 border-2 border-[#1a0533] flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-white/40 text-xs font-medium">
                Trusted by <span className="text-white/70">10,000+</span> young learners
              </span>
            </div>
          </div>

          {/* Right — Octahedron (FROZEN — do not modify) */}
          <div
            className={`w-full md:w-1/2 flex justify-center items-center z-50 transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="w-full h-full min-h-[500px] md:min-h-[600px]">
              <OctahedronVideo />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-700 delay-[1100ms] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors group"
        >
          <span className="text-xs tracking-[0.2em] uppercase font-medium">Scroll</span>
          <ArrowDown className="w-4 h-4 animate-bounce-gentle" />
        </a>
      </div>
    </section>
  );
}

export default memo(HeroSection);
