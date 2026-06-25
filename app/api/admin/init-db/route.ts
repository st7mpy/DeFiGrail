import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { slugify } from "@/lib/slug";

// One-time, idempotent: creates the submissions table and seeds demo rows if
// empty. Behind admin Basic auth (middleware). Safe to call repeatedly.
const SEED = [
  { title: "LVR is the number IL was hiding from you", author: "0xMercator", contact: "mercator@example.com", link: "", cat: "esoteric", status: "approved",
    body: "Impermanent loss measures the wrong baseline. Loss-versus-rebalancing prices what arbitrageurs actually take from LPs each block — and it is consistently larger than the IL figure most dashboards quote.\n\n## Why IL undercounts\n\nIL compares an LP to simply holding the two tokens. But the relevant counterfactual is a continuously rebalanced portfolio at the true price. The gap between that portfolio and what the AMM delivers is LVR, and it is what sophisticated market makers actually optimize against.\n\nFor a constant-product pool, LVR scales with the variance of the price process. Fees are the LP's only offset; whether LPing is profitable is the question of whether collected fees out-earn LVR over the holding period." },
  { title: "What an oracle-free lending market would actually need", author: "liang.eth", contact: "liang@example.com", link: "", cat: "v2", status: "approved",
    body: "Every lending hack of the last cycle traces back to a price feed. A thought experiment: could you build a margin system that never trusts an external oracle?\n\n## The core problem\n\nLiquidations need a price. If that price comes from an oracle, the oracle is the attack surface. Manipulate it for one block and you can borrow against worthless collateral or liquidate healthy positions.\n\n## Oracle-free designs\n\nOne path is to let the market self-price via auctions: instead of reading a price, the protocol auctions collateral and lets bidders reveal the price through their bids. Another is fully isolated, fixed-term markets where the only price that matters is at settlement." },
  { title: "The economics of getting sandwiched (and how to stop)", author: "mempool_maxi", contact: "maxi@example.com", link: "", cat: "esoteric", status: "approved",
    body: "A from-scratch walk through a sandwich bundle, the searcher's P&L, and exactly which slippage setting makes you a target.\n\n## Anatomy\n\nA searcher front-runs your swap to push the price to your slippage limit, lets your trade fill at the worst tolerated price, then back-runs to unwind. Their profit is, to first order, your slippage tolerance minus gas and fees.\n\n## Defenses\n\nLower your slippage tolerance to the minimum that still fills. Route through a private relay so your transaction never hits the public mempool. For large orders, split across blocks or use an intent-based venue where solvers compete on net price." },
  { title: "Why ve(3,3) keeps getting forked", author: "curve_curious", contact: "curve@example.com", link: "", cat: "v1", status: "pending",
    body: "veTokenomics locks governance power; the (3,3) layer adds a bribe market on top. Together they create a flywheel where emissions follow bribes follow fees. The fork-ability comes from how cleanly the three pieces separate — lock, vote, bribe — each of which can be reimplemented independently. This note traces the design from Curve through Solidly and explains why the same three primitives keep reappearing under new names." },
  { title: "A gentle intro to intent-based trading", author: "intentful", contact: "intent@example.com", link: "", cat: "infra", status: "pending",
    body: "Intents flip the model: you sign what you want, solvers compete to deliver it. This note maps intents back to the classic request-for-quote desk and shows where the analogy breaks — chiefly that solvers are permissionless and the settlement is on-chain and atomic. We walk through a simple intent lifecycle, the role of the solver auction, and the trust assumptions a user actually takes on." },
];

export async function POST() {
  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ ok: false, message: "DATABASE_URL not set" }, { status: 503 });
  const sql = neon(url);

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      author_name text NOT NULL,
      author_contact text NOT NULL,
      author_link text,
      category text NOT NULL,
      body_md text NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      slug text UNIQUE,
      ip_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      reviewed_at timestamptz
    )`;

  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM submissions`) as { count: number }[];
  let seeded = 0;
  if (count === 0) {
    for (const s of SEED) {
      const slug = s.status === "approved" ? slugify(s.title) : null;
      const reviewedAt = s.status === "approved" ? new Date() : null;
      await sql`
        INSERT INTO submissions (title, author_name, author_contact, author_link, category, body_md, status, slug, ip_hash, reviewed_at)
        VALUES (${s.title}, ${s.author}, ${s.contact}, ${s.link || null}, ${s.cat}, ${s.body}, ${s.status}, ${slug}, ${"seed"}, ${reviewedAt})`;
      seeded++;
    }
  }
  return NextResponse.json({ ok: true, existing: count, seeded });
}
