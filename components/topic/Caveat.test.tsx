import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Caveat, { type CaveatKind } from "./Caveat";

describe("Caveat", () => {
  it("renders the label for each kind", () => {
    const cases: [CaveatKind, RegExp][] = [
      ["misuse", /commonly misread/i],
      ["breaks", /where this breaks/i],
      ["real", /when it cost real money/i],
      ["stale", /parameters drift/i],
      ["check", /verify it yourself/i],
    ];
    for (const [kind, label] of cases) {
      const { unmount } = render(<Caveat kind={kind}>body copy</Caveat>);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders its children", () => {
    render(<Caveat kind="misuse">the pool is always the last to know</Caveat>);
    expect(screen.getByText(/last to know/i)).toBeInTheDocument();
  });

  it("shows an as-of date when given one", () => {
    render(<Caveat kind="stale" asOf="2026-09-06">params drift</Caveat>);
    expect(screen.getByText(/2026-09-06/)).toBeInTheDocument();
  });

  it("renders a source link only when src is supplied", () => {
    const { unmount } = render(<Caveat kind="stale">no link</Caveat>);
    expect(screen.queryByRole("link")).toBeNull();
    unmount();
    render(<Caveat kind="stale" src="https://aave.com/docs">with link</Caveat>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://aave.com/docs");
  });

  it("tags the kind on the element for styling", () => {
    const { container } = render(<Caveat kind="breaks">x</Caveat>);
    expect(container.querySelector('[data-kind="breaks"]')).toBeTruthy();
  });
});
