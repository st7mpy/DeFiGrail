import type { Metadata } from "next";
import Link from "next/link";
import ILCurve from "@/components/charts/ILCurve";
import PriceImpact from "@/components/charts/PriceImpact";
import KinkedRate from "@/components/charts/KinkedRate";
import RangeLiquidity from "@/components/charts/RangeLiquidity";
import PTDecay from "@/components/charts/PTDecay";

export const metadata: Metadata = { title: "Playground" };

const TOOLS = [
  { title: "Impermanent Loss", blurb: "Drag the price ratio and watch an LP's divergence loss against simply holding.", topic: "impermanent-loss", Chart: ILCurve },
  { title: "Price Impact", blurb: "See how trade size relative to pool depth drives slippage on a constant-product curve.", topic: "liquidity-and-pricing", Chart: PriceImpact },
  { title: "Interest Rate Curve", blurb: "Move utilization across the kink and watch a lending pool's borrow rate respond.", topic: "interest-rate-models", Chart: KinkedRate },
  { title: "Concentrated Liquidity", blurb: "Set a v3 price range and see how capital splits between the two assets.", topic: "uniswap-v3", Chart: RangeLiquidity },
  { title: "PT Pull-to-Par", blurb: "Watch a Pendle principal token's price converge to par as maturity approaches.", topic: "pendle", Chart: PTDecay },
];

export default function PlaygroundPage() {
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">Playground</div>
        <div className="page-head-sub">Play with the math. Every formula on DeFiGrail, made interactive in one place.</div>
      </div>
      <div className="pg-grid">
        {TOOLS.map(({ title, blurb, topic, Chart }) => (
          <section className="pg-tool" key={topic}>
            <div className="pg-tool-head">
              <div>
                <h2 className="pg-tool-title">{title}</h2>
                <p className="pg-tool-blurb">{blurb}</p>
              </div>
              <Link className="pg-tool-link" href={`/learn/${topic}`}>Open the full topic →</Link>
            </div>
            <Chart />
          </section>
        ))}
      </div>
    </div>
  );
}
