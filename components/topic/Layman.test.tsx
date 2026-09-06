import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Layman from "./Layman";

describe("Layman", () => {
  it("renders a disclosure summary", () => {
    render(<Layman>plain words here</Layman>);
    expect(screen.getByText(/in plain english/i)).toBeInTheDocument();
  });

  it("keeps its content in the DOM while collapsed", () => {
    render(<Layman>plain words here</Layman>);
    expect(screen.getByText(/plain words here/)).toBeInTheDocument();
  });

  it("renders collapsed by default", () => {
    const { container } = render(<Layman>plain words here</Layman>);
    expect(container.querySelector("details")?.open).toBe(false);
  });
});
