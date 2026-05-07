"use client";

import { memo } from "react";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#games", label: "Games" },
  { href: "#quiz", label: "Quiz" },
  { href: "#videos", label: "Videos" },
  { href: "#chatbot", label: "Chat" },
];

/**
 * FloatingNav — Minimal floating pill nav.
 *
 * Dark glassmorphic to work against both dark hero
 * and cream content sections.
 */
function FloatingNav({ visible }) {
  return (
    <nav
      role="navigation"
      aria-label="Section navigation"
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-full shadow-[0_8px_32px_rgba(124,58,237,0.15)] px-2 py-1.5 flex items-center gap-1">
        {NAV_LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-white/70 hover:text-white hover:bg-white/[0.1] font-semibold text-sm px-4 py-2 rounded-full transition-all"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default memo(FloatingNav);
