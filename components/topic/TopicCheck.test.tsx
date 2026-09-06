import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import TopicCheck from "./TopicCheck";
import type { QuizQuestion } from "@/lib/quiz";

const qs: QuizQuestion[] = [
  {
    id: "t1", type: "theory", topic: "demo",
    prompt: "Who moves the price?",
    options: ["An oracle", "Arbitrageurs"],
    answer: 1,
    explanation: "The pool quotes passively.",
  },
];

describe("TopicCheck", () => {
  beforeEach(() => localStorage.clear());

  it("renders nothing when the topic has no questions", () => {
    const { container } = render(<TopicCheck slug="demo" questions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("reveals the explanation after an answer", () => {
    render(<TopicCheck slug="demo" questions={qs} />);
    fireEvent.click(screen.getByText("Arbitrageurs"));
    expect(screen.getByText(/quotes passively/i)).toBeInTheDocument();
  });

  it("marks the topic read once every question is correct", () => {
    render(<TopicCheck slug="demo" questions={qs} />);
    fireEvent.click(screen.getByText("Arbitrageurs"));
    expect(JSON.parse(localStorage.getItem("defigrail_progress") || "{}").demo).toBe(true);
  });

  it("does not mark the topic read on a wrong answer", () => {
    render(<TopicCheck slug="demo" questions={qs} />);
    fireEvent.click(screen.getByText("An oracle"));
    expect(JSON.parse(localStorage.getItem("defigrail_progress") || "{}").demo).toBeUndefined();
  });
});
