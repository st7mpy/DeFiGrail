"use client";
import { useState } from "react";
import type { QuizQuestion } from "@/lib/quiz";
import { useProgress } from "@/lib/use-progress";

export default function TopicCheck({ slug, questions }: { slug: string; questions: QuizQuestion[] }) {
  const { isRead, toggle } = useProgress();
  const [picked, setPicked] = useState<Record<string, number>>({});

  if (questions.length === 0) return null;

  const pick = (q: QuizQuestion, i: number) => {
    if (picked[q.id] !== undefined) return;
    const next = { ...picked, [q.id]: i };
    setPicked(next);
    const swept =
      questions.length === Object.keys(next).length &&
      questions.every((x) => next[x.id] === x.answer);
    if (swept && !isRead(slug)) toggle(slug);
  };

  return (
    <section className="topic-selfcheck">
      <div className="topic-section-label">Check yourself</div>
      {questions.map((q) => {
        const chose = picked[q.id];
        return (
          <div className="topic-selfcheck-q" key={q.id}>
            <p className="topic-selfcheck-prompt">{q.prompt}</p>
            <div className="topic-selfcheck-options">
              {q.options.map((opt, i) => {
                const state =
                  chose === undefined ? "" : i === q.answer ? " correct" : i === chose ? " wrong" : " dimmed";
                return (
                  <button
                    key={i}
                    type="button"
                    className={`quiz-option${state}`}
                    disabled={chose !== undefined}
                    onClick={() => pick(q, i)}
                  >
                    <span className="quiz-option-key">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {chose !== undefined && (
              <div className="topic-selfcheck-explain">
                <span className={`quiz-verdict ${chose === q.answer ? "ok" : "no"}`}>
                  {chose === q.answer ? "Correct" : "Not quite"}
                </span>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
