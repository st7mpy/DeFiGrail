import { describe, it, expect } from "vitest";
import { QUIZ, type QuizType } from "./quiz";
import { loadTopics } from "./mdx";

describe("quiz data", () => {
  const slugs = new Set(loadTopics().map((t) => t.meta.slug));

  it("has exactly 20 questions", () => {
    expect(QUIZ).toHaveLength(20);
  });

  it("every question has 4 options and a valid answer index", () => {
    for (const q of QUIZ) {
      expect(q.options).toHaveLength(4);
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
    }
  });

  it("every question links to a real topic", () => {
    for (const q of QUIZ) {
      expect(slugs.has(q.topic)).toBe(true);
    }
  });

  it("all three question types are represented", () => {
    const types = new Set<QuizType>(QUIZ.map((q) => q.type));
    expect(types.has("quant")).toBe(true);
    expect(types.has("theory")).toBe(true);
    expect(types.has("analytical")).toBe(true);
  });

  it("question ids are unique", () => {
    const ids = new Set(QUIZ.map((q) => q.id));
    expect(ids.size).toBe(QUIZ.length);
  });
});
