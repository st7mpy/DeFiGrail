import quizData from "@/content/quiz.json";

export type QuizType = "quant" | "theory" | "analytical";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  topic: string;
}

export const QUIZ: QuizQuestion[] = quizData as QuizQuestion[];
