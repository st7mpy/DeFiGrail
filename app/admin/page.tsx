import type { Metadata } from "next";
import AdminQueue, { type PendingItem } from "@/components/admin/AdminQueue";
import { listPending, categoryLabel } from "@/lib/submissions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const pending = await listPending();
  const items: PendingItem[] = pending.map((s) => ({
    id: s.id,
    title: s.title,
    author: s.authorName,
    category: categoryLabel(s.category),
    date: s.createdAt.toISOString().slice(0, 10),
    body: s.bodyMd,
  }));
  return (
    <div className="community-layout">
      <div className="page-head">
        <div className="page-head-h1">Moderation queue</div>
        <div className="page-head-sub">{items.length} pending submission{items.length === 1 ? "" : "s"}</div>
      </div>
      <AdminQueue initial={items} />
    </div>
  );
}
