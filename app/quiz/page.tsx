import type { Metadata } from "next";
import QuizModeSwitch from "@/components/quiz/QuizModeSwitch";
import { QUIZ, EXPERT_QUIZ } from "@/lib/quiz";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">Quiz</div>
      </div>
      <QuizModeSwitch core={QUIZ} expert={EXPERT_QUIZ} />
    </div>
  );
}
