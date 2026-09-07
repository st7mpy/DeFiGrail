"use client";
import { useState } from "react";
import QuizClient from "./QuizClient";
import type { QuizQuestion } from "@/lib/quiz";

const MODES = [
  { id: "core" as const, label: "Core", blurb: "Questions across DeFi — quant, theory, and analytical.", bestKey: "dg:quiz-best" },
  { id: "expert" as const, label: "Expert", blurb: "Fifteen scenario problems, tiered. Named parameters, real arithmetic, no recall questions.", bestKey: "dg:quiz-best-expert" },
];

export default function QuizModeSwitch({ core, expert }: { core: QuizQuestion[]; expert: QuizQuestion[] }) {
  const [mode, setMode] = useState<"core" | "expert">("core");
  const questions = mode === "core" ? core : expert;
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <>
      <div className="quiz-modes" role="tablist" aria-label="Quiz difficulty">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`quiz-mode${mode === m.id ? " active" : ""}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
            <span className="quiz-mode-count">{m.id === "core" ? core.length : expert.length}</span>
          </button>
        ))}
      </div>
      <p className="quiz-mode-blurb">{active.blurb}</p>
      <QuizClient key={mode} questions={questions} bestKey={active.bestKey} shareLabel={active.label} />
    </>
  );
}
