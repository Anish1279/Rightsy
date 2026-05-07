"use client";

import { memo } from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpRight } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Game Zone", href: "/dashboard/game-zone" },
    { label: "Quizzes", href: "/dashboard/quiz" },
    { label: "About", href: "/dashboard/about" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
  Connect: [
    { label: "Twitter", href: "#", external: true },
    { label: "Instagram", href: "#", external: true },
    { label: "Facebook", href: "#", external: true },
  ],
};

/** Infinite scrolling marquee */
function Marquee() {
  const items = [
    "Know Your Rights ⚖️",
    "Learn Through Play 🎮",
    "Fun Quizzes 🧠",
    "Interactive Games 🎯",
    "Safe for Kids 🛡️",
    "Earn Rewards 🏆",
  ];

  return (
    <div className="relative overflow-hidden py-6 border-y border-white/[0.06]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-white/30 text-sm font-bold uppercase tracking-[0.2em] mx-8 flex-shrink-0">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#0a0618]" />
      <div className="absolute top-0 left-0 w-[60%] h-[50%] bg-[radial-gradient(ellipse_at_0%_0%,_rgba(124,58,237,0.08)_0%,_transparent_60%)]" />

      {/* Marquee banner */}
      <div className="relative z-10">
        <Marquee />
      </div>

      {/* Main footer content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <h3 className="text-2xl font-extrabold text-white tracking-tight mb-3">
              Rightsy
            </h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-6">
              An interactive platform that makes learning about rights and laws 
              fun, safe, and engaging for children ages 8–14.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] text-white/60 hover:text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="md:col-span-2">
              <h4 className="text-white/60 text-xs font-bold uppercase tracking-[0.15em] mb-5">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map(({ label, href, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-1 group"
                    >
                      {label}
                      {external && <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-xs">
            &copy; {new Date().getFullYear()} Rightsy. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Made with ❤️ for curious minds
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
