"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useScrollState } from "@/hooks/use-scroll-state";

import HeroSection from "@/features/landing/components/HeroSection";
import FloatingNav from "@/features/landing/components/FloatingNav";
import AboutSection from "@/features/landing/components/AboutSection";
import GameZoneSection from "@/features/landing/components/GameZoneSection";
import SituationSection from "@/features/landing/components/SituationSection";
import QuizSection from "@/features/landing/components/QuizSection";
import VideoSection from "@/features/landing/components/VideoSection";
import ChatbotSection from "@/features/landing/components/ChatbotSection";
import Footer from "@/features/landing/components/Footer";

/**
 * Home — Landing page composition.
 *
 * All visual sections are decomposed into separate memoized
 * components under /components/landing/. This page file is
 * intentionally thin: it owns routing callbacks and scroll
 * state, then passes them down as props.
 *
 * Architecture:
 *  - useScrollState hook → drives FloatingNav visibility
 *  - useRouter callbacks → passed to HeroSection CTAs
 *  - Each section is self-contained and independently memoized
 */
export default function Home() {
  const router = useRouter();
  const { isScrolled } = useScrollState(80);

  const handleStartLearning = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handleAdminLogin = useCallback(() => {
    router.push("/govtadmin");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0a0618] text-white overflow-x-hidden">
      <FloatingNav visible={isScrolled} />
      <HeroSection onStartLearning={handleStartLearning} onAdminLogin={handleAdminLogin} />
      <AboutSection />
      <GameZoneSection onPlayNow={handleStartLearning} />
      <SituationSection />
      <QuizSection />
      <VideoSection />
      <ChatbotSection />
      <Footer />
    </main>
  );
}
