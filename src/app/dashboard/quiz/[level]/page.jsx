import QuizLevelPage from "@/features/quiz/components/QuizLevelPage";

export default async function QuizLevelRoute({ params }) {
  const resolvedParams = await params;
  return <QuizLevelPage level={resolvedParams.level} />;
}
