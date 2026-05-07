"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useScrollState — Performant scroll state detection.
 * 
 * Returns `isScrolled` (true when scrollY > threshold).
 * Uses requestAnimationFrame for throttling instead of
 * raw scroll events to prevent layout thrashing.
 *
 * @param {number} threshold - Scroll distance in px before `isScrolled` flips. Default: 50.
 * @returns {{ isScrolled: boolean }}
 */
export function useScrollState(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false);
  const rafRef = useRef(null);
  const lastScrolled = useRef(false);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return; // Already scheduled

    rafRef.current = requestAnimationFrame(() => {
      const scrolled = window.scrollY > threshold;

      // Only update state if value actually changed
      if (scrolled !== lastScrolled.current) {
        lastScrolled.current = scrolled;
        setIsScrolled(scrolled);
      }

      rafRef.current = null;
    });
  }, [threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return { isScrolled };
}
