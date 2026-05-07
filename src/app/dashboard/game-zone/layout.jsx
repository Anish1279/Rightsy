import { LearningVideoOrchestrator } from "@/features/learning-videos";

export const metadata = {
  title: "Game Zone",
  description: "Educational mini-games with built-in learning boosts.",
};

export default function GameZoneLayout({ children }) {
  return <LearningVideoOrchestrator>{children}</LearningVideoOrchestrator>;
}
