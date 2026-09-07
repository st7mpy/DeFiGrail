import quizData from "@/content/quiz.json";
import expertData from "@/content/quiz-expert.json";

export type QuizType = "quant" | "theory" | "analytical";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  topic: string;
  tier?: 1 | 2 | 3;
}

export const QUIZ: QuizQuestion[] = quizData as QuizQuestion[];

export const EXPERT_QUIZ: QuizQuestion[] = expertData as QuizQuestion[];

export const questionsForTopic = (slug: string): QuizQuestion[] =>
  QUIZ.filter((q) => q.topic === slug);
