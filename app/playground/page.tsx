import type { Metadata } from "next";
import Link from "next/link";
import ILCurve from "@/components/charts/ILCurve";
import PriceImpact from "@/components/charts/PriceImpact";
import KinkedRate from "@/components/charts/KinkedRate";
import RangeLiquidity from "@/components/charts/RangeLiquidity";
import PTDecay from "@/components/charts/PTDecay";

export const metadata: Metadata = { title: "Playground" };

const TOOLS = [
  {
    title: "Impermanent Loss",
    blurb: "Drag the price ratio and watch an LP's divergence loss against simply holding.",
    topic: "impermanent-loss",
    Chart: ILCurve,
    layman: "If you deposit two assets into a pool and their prices drift apart, you can end up with less value than if you'd just held them in your wallet. The dip in the curve is that gap. It's called “impermanent” because it shrinks back toward zero if prices return to where you started — and the trading fees you earn can offset whatever's left.",
  },
  {
    title: "Price Impact",
    blurb: "See how trade size relative to pool depth drives slippage on a constant-product curve.",
    topic: "liquidity-and-pricing",
    Chart: PriceImpact,
    layman: "Every trade nudges the price against you, and bigger trades in a shallow pool nudge it more. This curve shows how much worse your price gets as your order grows relative to the pool's size. It's why a large swap in a small pool can cost far more than the headline price suggests — that gap is slippage.",
  },
  {
    title: "Interest Rate Curve",
    blurb: "Move utilization across the kink and watch a lending pool's borrow rate respond.",
    topic: "interest-rate-models",
    Chart: KinkedRate,
    layman: "Lending rates aren't fixed — they rise as more of the pool gets borrowed. Below the “kink,” rates climb gently to keep borrowing attractive; past it, they spike sharply to lure new deposits in and stop the pool from being drained dry. Drag utilization across the kink to see the jump.",
  },
  {
    title: "Concentrated Liquidity",
    blurb: "Set a v3 price range and see how capital splits between the two assets.",
    topic: "uniswap-v3",
    Chart: RangeLiquidity,
    layman: "Instead of spreading your money across every possible price, you can park it in a narrow band where trading actually happens — earning far more fees per dollar. The trade-off: if the price leaves your band, your position stops earning and ends up entirely in one asset. The bars show how your capital splits as the price moves.",
  },
  {
    title: "PT Pull-to-Par",
    blurb: "Watch a Pendle principal token's price converge to par as maturity approaches.",
    topic: "pendle",
    Chart: PTDecay,
    layman: "A principal token is like a bond bought at a discount: it's worth less than $1 today but redeems for exactly $1 at maturity. The line shows its price climbing toward par as time passes — that steady “pull” is the fixed yield you lock in the moment you buy.",
  },
];

export default function PlaygroundPage() {
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">Playground</div>
        <div className="page-head-sub">Play with the math. Every formula on DeFiGrail, made interactive in one place.</div>
      </div>
      <div className="pg-grid">
        {TOOLS.map(({ title, blurb, topic, Chart, layman }) => (
          <section className="pg-tool" key={topic}>
            <div className="pg-tool-head">
              <div>
                <h2 className="pg-tool-title">{title}</h2>
                <p className="pg-tool-blurb">{blurb}</p>
              </div>
              <Link className="pg-tool-link" href={`/learn/${topic}`}>Open the full topic →</Link>
            </div>
            <div className="pg-tool-body">
              <div className="pg-chart"><Chart /></div>
              <aside className="pg-context">
                <div className="pg-context-label">What it means</div>
                <p>{layman}</p>
              </aside>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
