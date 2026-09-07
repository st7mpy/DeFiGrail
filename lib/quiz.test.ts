import { describe, it, expect } from "vitest";
import { QUIZ, questionsForTopic, tweetIntent, type QuizType } from "./quiz";
import { loadTopics } from "./mdx";

describe("quiz data", () => {
  const slugs = new Set(loadTopics().map((t) => t.meta.slug));

  it("has at least the original 20 questions", () => {
    expect(QUIZ.length).toBeGreaterThanOrEqual(20);
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

describe("questionsForTopic", () => {
  it("returns only questions for that topic", () => {
    const qs = questionsForTopic("uniswap-v2");
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) expect(q.topic).toBe("uniswap-v2");
  });
  it("returns an empty array for a topic with no questions", () => {
    expect(questionsForTopic("no-such-topic")).toEqual([]);
  });
});

describe("tweetIntent", () => {
  it("carries the score, label and quiz URL", () => {
    const u = new URL(tweetIntent(12, 15, "Expert"));
    expect(u.searchParams.get("text")).toContain("12/15");
    expect(u.searchParams.get("text")).toContain("Expert");
    expect(u.searchParams.get("url")).toBe("https://defigrail.xyz/quiz");
  });

  it("escapes characters that would otherwise truncate the query string", () => {
    const u = new URL(tweetIntent(1, 2, "A&B?C=D"));
    // survives the round-trip intact rather than being cut at the & or ?
    expect(u.searchParams.get("text")).toContain("A&B?C=D");
    expect(u.searchParams.get("url")).toBe("https://defigrail.xyz/quiz");
  });
});
