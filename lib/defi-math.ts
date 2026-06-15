export function impermanentLoss(P: number): number {
  if (P <= 0) throw new RangeError("price ratio must be > 0");
  return (2 * Math.sqrt(P)) / (1 + P) - 1;
}

export function kinkedRate(u: number, base = 0.02, kink = 0.8, m1 = 0.1, m2 = 0.75): number {
  if (u < 0 || u > 1) throw new RangeError("utilization in [0,1]");
  return u <= kink ? base + u * m1 : base + kink * m1 + (u - kink) * m2;
}

export const ptPrice = (r: number, t: number) => 1 / Math.pow(1 + r, t);

export function v3Amounts(L: number, P: number, Pa: number, Pb: number) {
  const sp = Math.sqrt(P), sa = Math.sqrt(Pa), sb = Math.sqrt(Pb);
  if (P <= Pa) return { x: L * (sb - sa) / (sa * sb), y: 0 };
  if (P >= Pb) return { x: 0, y: L * (sb - sa) };
  return { x: L * (sb - sp) / (sp * sb), y: L * (sp - sa) };
}

// Constant-product price impact: buying dx of token X from reserves (x, y).
// Returns the fraction the execution price sits above spot — the cost of
// trading into finite liquidity. dx as a share of reserve x drives it.
export function priceImpact(dxFraction: number): number {
  if (dxFraction < 0 || dxFraction >= 1) throw new RangeError("dxFraction in [0,1)");
  // spot = y/x; exec price for removing dx = y / (x - dx); with dx = f·x:
  // exec/spot = 1/(1 - f)  → impact = f/(1 - f)
  return dxFraction / (1 - dxFraction);
}
