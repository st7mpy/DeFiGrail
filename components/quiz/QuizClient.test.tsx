import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import QuizClient from "./QuizClient";
import type { QuizQuestion } from "@/lib/quiz";

const q: QuizQuestion = {
  id: "s1", type: "quant", topic: "uniswap-v2",
  prompt: "PROMPT", options: ["right", "wrong", "c", "d"], answer: 0, explanation: "because",
};

/** Answer the single question correctly and advance to the results screen. */
function finishRun() {
  fireEvent.click(screen.getByText("right"));
  fireEvent.click(screen.getByRole("button", { name: /see results/i }));
}

describe("QuizClient results — share", () => {
  beforeEach(() => localStorage.clear());

  it("offers a share link once the run is finished", () => {
    render(<QuizClient questions={[q]} shareLabel="Expert" />);
    expect(screen.queryByRole("link", { name: /share on x/i })).toBeNull();
    finishRun();
    expect(screen.getByRole("link", { name: /share on x/i })).toBeInTheDocument();
  });

  it("puts the real score and mode label in the intent URL", () => {
    render(<QuizClient questions={[q]} shareLabel="Expert" />);
    finishRun();
    const href = screen.getByRole("link", { name: /share on x/i }).getAttribute("href")!;
    const u = new URL(href);
    expect(u.searchParams.get("text")).toContain("1/1");
    expect(u.searchParams.get("text")).toContain("Expert");
    expect(u.searchParams.get("url")).toBe("https://defigrail.xyz/quiz");
  });

  it("opens in a new tab without leaking the opener", () => {
    render(<QuizClient questions={[q]} shareLabel="Core" />);
    finishRun();
    const a = screen.getByRole("link", { name: /share on x/i });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  });
});
