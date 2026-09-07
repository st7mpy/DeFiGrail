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

const SITE = "https://defigrail.xyz";

/**
 * Share-intent URL for a finished run. Opens a prefilled compose window; it
 * posts nothing on its own — the reader still confirms inside X.
 * URLSearchParams does the escaping, so a label containing & or ? cannot
 * truncate the tweet text.
 */
export function tweetIntent(score: number, total: number, label: string): string {
  const params = new URLSearchParams({
    text: `I scored ${score}/${total} on the ${label} DeFi quiz at DeFiGrail.`,
    url: `${SITE}/quiz`,
  });
  return `https://twitter.com/intent/tweet?${params}`;
}
