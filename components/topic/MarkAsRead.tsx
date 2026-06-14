"use client";
import { useProgress } from "@/lib/use-progress";

export default function MarkAsRead({ slug }: { slug: string }) {
  const { isRead, toggle } = useProgress();
  const done = isRead(slug);
  return (
    <button className={`topic-mark-btn${done ? " done" : ""}`} onClick={() => toggle(slug)}>
      {done ? "✓ Marked as read" : "Mark as read"}
    </button>
  );
}
