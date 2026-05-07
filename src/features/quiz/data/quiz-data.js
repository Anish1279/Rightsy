import { quizModules } from "@/features/assessment/data/assessment-content";

export const quizData = quizModules.map((module) => ({
  id: module.numericLevel,
  title: module.title,
  questions: module.questions.map((question) => {
    const correctAnswerId = question.correctOptionIds[0];

    return {
      question: question.prompt,
      options: question.options.map((option) => option.label),
      correctAnswer: Math.max(0, question.options.findIndex((option) => option.id === correctAnswerId)),
    };
  }),
}));
