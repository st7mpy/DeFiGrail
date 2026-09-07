import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import QuizModeSwitch from "./QuizModeSwitch";
import type { QuizQuestion } from "@/lib/quiz";

const q = (id: string, prompt: string): QuizQuestion => ({
  id, prompt, type: "quant", topic: "uniswap-v2",
  options: ["a", "b", "c", "d"], answer: 0, explanation: "because",
});
const core = [q("c1", "CORE PROMPT")];
const expert = [q("x1", "EXPERT PROMPT")];

describe("QuizModeSwitch", () => {
  it("shows the core bank first", () => {
    render(<QuizModeSwitch core={core} expert={expert} />);
    expect(screen.getByText("CORE PROMPT")).toBeInTheDocument();
  });

  it("switches to the expert bank on click", () => {
    render(<QuizModeSwitch core={core} expert={expert} />);
    fireEvent.click(screen.getByRole("tab", { name: /expert/i }));
    expect(screen.getByText("EXPERT PROMPT")).toBeInTheDocument();
  });

  it("marks the active mode for assistive tech", () => {
    render(<QuizModeSwitch core={core} expert={expert} />);
    expect(screen.getByRole("tab", { name: /core/i })).toHaveAttribute("aria-selected", "true");
  });
});
