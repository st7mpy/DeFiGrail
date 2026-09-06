import type { Metadata } from "next";
import Link from "next/link";
import { tradfiIndex } from "@/lib/tradfi";

export const metadata: Metadata = {
  title: "TradFi → DeFi",
  description:
    "The reverse index: start from the TradFi instrument you already know and find the DeFi primitive that maps to it.",
};

export default function TradfiPage() {
  const index = tradfiIndex();
  return (
    <div style={{ padding: "40px 0 60px" }}>
      <div className="page-head">
        <div className="page-head-h1">TradFi → DeFi</div>
        <div className="page-head-sub">
          You already know the instrument. Start there. Every entry is a TradFi
          anchor and the DeFi primitives that rhyme with it.
        </div>
      </div>
      <div className="tradfi-index">
        {index.map((entry) => (
          <section className="tradfi-entry" key={entry.anchor}>
            <h2 className="tradfi-anchor">{entry.anchor}</h2>
            <div className="tradfi-topics">
              {entry.topics.map((t) => (
                <Link className="tradfi-topic" href={`/learn/${t.slug}`} key={t.slug}>
                  <span className="tradfi-topic-name">{t.name} ↗</span>
                  <span className="tradfi-topic-sum">{t.summary}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
