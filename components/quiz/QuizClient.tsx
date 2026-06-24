"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/quiz";

const BEST_KEY = "dg:quiz-best";
const TYPE_LABEL: Record<string, string> = {
  quant: "Quant", theory: "Theory", analytical: "Analytical",
};

export default function QuizClient({ questions }: { questions: QuizQuestion[] }) {
  const total = questions.length;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [byType, setByType] = useState<Record<string, { right: number; total: number }>>({});
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw) setBest(parseInt(raw, 10));
  }, []);

  const q = questions[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const right = i === q.answer;
    if (right) setScore((s) => s + 1);
    setByType((m) => {
      const cur = m[q.type] ?? { right: 0, total: 0 };
      return { ...m, [q.type]: { right: cur.right + (right ? 1 : 0), total: cur.total + 1 } };
    });
  };

  const next = () => {
    if (idx + 1 >= total) {
      const finalScore = score;
      setBest((b) => {
        const nb = b === null ? finalScore : Math.max(b, finalScore);
        try { localStorage.setItem(BEST_KEY, String(nb)); } catch { /* ignore */ }
        return nb;
      });
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setIdx(0); setPicked(null); setScore(0); setByType({}); setDone(false);
  };

  if (done) {
    const verdict = score === total ? "Perfect run." : score >= total * 0.7 ? "Strong showing." : "Worth another pass.";
    return (
      <div className="quiz-results">
        <div className="quiz-score-big">{score}<span> / {total}</span></div>
        <div className="quiz-score-label">{verdict}</div>
        {best !== null && <div className="quiz-best">Best so far: {best} / {total}</div>}
        <div className="quiz-breakdown">
          {Object.entries(byType).map(([t, v]) => (
            <div className="quiz-breakdown-row" key={t}>
              <span>{TYPE_LABEL[t] ?? t}</span><span>{v.right} / {v.total}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={restart}>Retake the quiz →</button>
      </div>
    );
  }

  return (
    <div className="quiz-card">
      <div className="quiz-progress">
        <span className="quiz-qnum">Question {idx + 1} / {total}</span>
        <span className="quiz-type-tag">{TYPE_LABEL[q.type] ?? q.type}</span>
        <span className="quiz-running">Score {score}</span>
      </div>
      <div className="quiz-bar"><div className="quiz-bar-fill" style={{ width: `${(idx / total) * 100}%` }} /></div>
      <h2 className="quiz-prompt">{q.prompt}</h2>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          const state = picked === null ? ""
            : i === q.answer ? " correct"
            : i === picked ? " wrong"
            : " dimmed";
          return (
            <button
              key={i}
              className={`quiz-option${state}`}
              onClick={() => pick(i)}
              disabled={picked !== null}
            >
              <span className="quiz-option-key">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="quiz-explain">
          <div className={`quiz-verdict ${picked === q.answer ? "ok" : "no"}`}>
            {picked === q.answer ? "Correct" : "Not quite"}
          </div>
          <p>{q.explanation}</p>
          <div className="quiz-explain-foot">
            <Link className="quiz-learn" href={`/learn/${q.topic}`}>Learn this →</Link>
            <button className="btn-primary" onClick={next}>
              {idx + 1 >= total ? "See results →" : "Next →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
