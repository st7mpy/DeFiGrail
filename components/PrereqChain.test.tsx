import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import PrereqChain from "./PrereqChain";

it("renders linked chain with arrows and terminal label", () => {
  render(<PrereqChain items={[{ slug: "mm-primer", title: "TradFi Market Making" }]} />);
  expect(screen.getByText("PREREQ CHAIN")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "TradFi Market Making" })).toHaveAttribute("href", "/learn/mm-primer");
  expect(screen.getByText("THIS MODULE")).toBeInTheDocument();
});

it("renders nothing when no prereqs", () => {
  const { container } = render(<PrereqChain items={[]} />);
  expect(container).toBeEmptyDOMElement();
});
