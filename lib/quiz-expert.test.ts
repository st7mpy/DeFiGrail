import { describe, expect, it } from "vitest";
import { EXPERT_QUIZ, QUIZ } from "./quiz";
import { loadTopics } from "./mdx";

describe("expert quiz data", () => {
  const slugs = new Set(loadTopics().map((t) => t.meta.slug));

  it("has 15 questions", () => expect(EXPERT_QUIZ).toHaveLength(15));

  it("has five questions at each tier", () => {
    for (const tier of [1, 2, 3]) {
      expect(EXPERT_QUIZ.filter((q) => q.tier === tier)).toHaveLength(5);
    }
  });

  it("every question has 4 options and a valid answer index", () => {
    for (const q of EXPERT_QUIZ) {
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
    }
  });

  it("every question links to a real topic", () => {
    for (const q of EXPERT_QUIZ) expect(slugs.has(q.topic), q.id).toBe(true);
  });

  it("ids are unique and do not collide with the core bank", () => {
    const ids = EXPERT_QUIZ.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const core = new Set(QUIZ.map((q) => q.id));
    for (const id of ids) expect(core.has(id)).toBe(false);
  });

  it("explanations show their working, not just a verdict", () => {
    for (const q of EXPERT_QUIZ) expect(q.explanation.length).toBeGreaterThan(120);
  });

  it("options are distinct within a question", () => {
    for (const q of EXPERT_QUIZ) expect(new Set(q.options).size).toBe(4);
  });

  it("does not concentrate answers on one option", () => {
    for (const [label, bank] of [["expert", EXPERT_QUIZ], ["core", QUIZ]] as const) {
      const counts = [0, 1, 2, 3].map((i) => bank.filter((q) => q.answer === i).length);
      const max = Math.max(...counts);
      expect(max / bank.length, `${label} bank: ${counts.join("/")}`).toBeLessThanOrEqual(0.4);
    }
  });
});
