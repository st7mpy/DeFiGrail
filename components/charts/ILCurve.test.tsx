import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ILCurve from "./ILCurve";

describe("ILCurve", () => {
  it("renders an svg path for the curve", () => {
    const { container } = render(<ILCurve />);
    expect(container.querySelector("svg path")).toBeTruthy();
  });
  it("computes IL for a 1.5x move (entry 2000 -> current 3000) as -2.02%", () => {
    render(<ILCurve />);
    const entry = screen.getByLabelText(/entry/i) as HTMLInputElement;
    const current = screen.getByLabelText(/current/i) as HTMLInputElement;
    fireEvent.change(entry, { target: { value: "2000" } });
    fireEvent.change(current, { target: { value: "3000" } });
    expect(screen.getByText(/-2\.02%/)).toBeInTheDocument();
  });
});
