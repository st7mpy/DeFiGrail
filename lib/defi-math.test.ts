import { describe, expect, it } from "vitest";
import { impermanentLoss, kinkedRate, ptPrice, v3Amounts, priceImpact } from "./defi-math";

describe("impermanentLoss — IL = 2√P/(1+P) − 1", () => {
  it("is 0 at P=1", () => expect(impermanentLoss(1)).toBeCloseTo(0, 10));
  it("matches reference table", () => {
    expect(impermanentLoss(1.25)).toBeCloseTo(-0.0062, 3);
    expect(impermanentLoss(2)).toBeCloseTo(-0.0572, 3);
    expect(impermanentLoss(4)).toBeCloseTo(-0.2, 3);
    expect(impermanentLoss(5)).toBeCloseTo(-0.2546, 3);
  });
  it("is symmetric in log-space: IL(2) == IL(0.5)", () =>
    expect(impermanentLoss(2)).toBeCloseTo(impermanentLoss(0.5), 10));
  it("throws on P <= 0", () => expect(() => impermanentLoss(0)).toThrow(RangeError));
});

describe("kinkedRate", () => {
  it("is base at U=0", () => expect(kinkedRate(0)).toBeCloseTo(0.02));
  it("is continuous at the kink", () =>
    expect(kinkedRate(0.8 - 1e-9)).toBeCloseTo(kinkedRate(0.8 + 1e-9), 4));
  it("steepens above kink", () =>
    expect(kinkedRate(0.9) - kinkedRate(0.8)).toBeGreaterThan(kinkedRate(0.8) - kinkedRate(0.7)));
});

describe("ptPrice", () => {
  it("pulls to par at t=0", () => expect(ptPrice(0.1, 0)).toBe(1));
  it("discounts: 1y @ 10% ≈ 0.909", () => expect(ptPrice(0.1, 1)).toBeCloseTo(0.909, 3));
});

describe("v3Amounts", () => {
  it("in-range position holds both assets", () => {
    const { x, y } = v3Amounts(1, 1500, 1000, 2000);
    expect(x).toBeGreaterThan(0); expect(y).toBeGreaterThan(0);
  });
});

describe("priceImpact — f/(1−f)", () => {
  it("is ~0 for a tiny trade", () => expect(priceImpact(0.001)).toBeCloseTo(0.001, 3));
  it("is 100% impact when trade = half the reserve", () => expect(priceImpact(0.5)).toBeCloseTo(1, 10));
  it("grows super-linearly with size", () =>
    expect(priceImpact(0.2)).toBeGreaterThan(2 * priceImpact(0.1)));
  it("throws outside [0,1)", () => {
    expect(() => priceImpact(1)).toThrow(RangeError);
    expect(() => priceImpact(-0.1)).toThrow(RangeError);
  });
});
