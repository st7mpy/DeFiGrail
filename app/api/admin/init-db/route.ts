import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// One-time, idempotent: creates the submissions table and brings older
// deployments up to the current column set. Behind admin Basic auth
// (middleware). Safe to call repeatedly.
//
// The demo SEED rows that used to live here were removed: they were the source
// of the placeholder writeups on /community, and re-running this route put them
// straight back. Existing seeded rows are left in the table but no longer
// surface anywhere, because listApproved() now requires an external_url.
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
      external_url text,
      status text NOT NULL DEFAULT 'pending',
      slug text UNIQUE,
      ip_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      reviewed_at timestamptz
    )`;

  // Additive and idempotent — safe on a table created before link posts existed.
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS external_url text`;

  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM submissions`) as { count: number }[];
  return NextResponse.json({ ok: true, existing: count });
}
