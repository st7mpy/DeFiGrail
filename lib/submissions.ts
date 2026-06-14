import "server-only";
import { and, count, desc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions, type Submission } from "@/lib/db/schema";
import { slugify } from "@/lib/slug";

export type FeaturedItem = {
  slug: string;
  title: string;
  author: string;
  authorLink: string | null;
  category: string;
  date: string;
  blurb: string;
  read: string;
  body: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  v0: "Foundations", v1: "Composability", v2: "Modern Frontier",
  esoteric: "Esoteric", infra: "Infrastructure", general: "General",
};

export function categoryLabel(c: string): string {
  return CATEGORY_LABEL[c] ?? c;
}

function readTime(body: string): string {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)) + " min";
}

function blurbOf(body: string): string {
  const text = body.replace(/[#>*`_\[\]()-]/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 160 ? text.slice(0, 157).trimEnd() + "…" : text;
}

export function toFeatured(s: Submission): FeaturedItem {
  return {
    slug: s.slug ?? s.id,
    title: s.title,
    author: s.authorName,
    authorLink: s.authorLink ?? null,
    category: categoryLabel(s.category),
    date: (s.reviewedAt ?? s.createdAt).toISOString().slice(0, 10),
    blurb: blurbOf(s.bodyMd),
    read: readTime(s.bodyMd),
    body: s.bodyMd,
  };
}

export async function listApproved(limit?: number): Promise<FeaturedItem[]> {
  if (!db) return [];
  try {
    const q = db.select().from(submissions).where(eq(submissions.status, "approved")).orderBy(desc(submissions.reviewedAt));
    const rows = limit ? await q.limit(limit) : await q;
    return rows.map(toFeatured);
  } catch {
    return [];
  }
}

export async function getApprovedBySlug(slug: string): Promise<FeaturedItem | null> {
  if (!db) return null;
  try {
    const rows = await db.select().from(submissions).where(and(eq(submissions.slug, slug), eq(submissions.status, "approved"))).limit(1);
    return rows[0] ? toFeatured(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function listPending(): Promise<Submission[]> {
  if (!db) return [];
  try {
    return await db.select().from(submissions).where(eq(submissions.status, "pending")).orderBy(desc(submissions.createdAt));
  } catch {
    return [];
  }
}

export async function recentCountForIp(ipHash: string, sinceMs = 3600_000): Promise<number> {
  if (!db) return 0;
  const since = new Date(Date.now() - sinceMs);
  const [{ value }] = await db
    .select({ value: count() })
    .from(submissions)
    .where(and(eq(submissions.ipHash, ipHash), gt(submissions.createdAt, since)));
  return value;
}

export async function insertSubmission(input: {
  title: string; authorName: string; authorContact: string; authorLink?: string | null;
  category: string; bodyMd: string; ipHash: string;
}): Promise<void> {
  if (!db) throw new Error("db unavailable");
  await db.insert(submissions).values({ ...input, authorLink: input.authorLink || null });
}

export async function reviewSubmission(id: string, action: "approve" | "reject"): Promise<{ ok: boolean; slug?: string; status: number }> {
  if (!db) return { ok: false, status: 503 };
  const rows = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  const row = rows[0];
  if (!row) return { ok: false, status: 404 };
  if (row.status !== "pending") return { ok: false, status: 409 };

  if (action === "reject") {
    await db.update(submissions).set({ status: "rejected", reviewedAt: new Date() }).where(eq(submissions.id, id));
    return { ok: true, status: 200 };
  }

  // approve — generate a unique slug, retry with suffixes on collision
  const base = slugify(row.title) || "untitled";
  for (let attempt = 0; attempt < 25; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const clash = await db.select({ id: submissions.id }).from(submissions).where(eq(submissions.slug, slug)).limit(1);
    if (clash.length === 0) {
      await db.update(submissions).set({ status: "approved", slug, reviewedAt: new Date() }).where(eq(submissions.id, id));
      return { ok: true, slug, status: 200 };
    }
  }
  return { ok: false, status: 409 };
}
