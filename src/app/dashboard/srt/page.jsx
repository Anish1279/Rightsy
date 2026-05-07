import AssessmentHub from "@/features/assessment/components/AssessmentHub";

export const metadata = {
  title: "Situation Reaction Test - Rightsy",
  description: "Practice safe, empathetic civic reactions through Rightsy SRT missions.",
};

export default function SrtPage() {
  return <AssessmentHub initialMode="srt" />;
}
