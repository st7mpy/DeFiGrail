import type { Metadata } from "next";
import QuizClient from "@/components/quiz/QuizClient";
import { QUIZ } from "@/lib/quiz";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">Quiz</div>
        <div className="page-head-sub">
          Twenty questions across DeFi — quant, theory, and analytical. Instant feedback and an
          explanation for every answer.
        </div>
      </div>
      <QuizClient questions={QUIZ} />
    </div>
  );
}
