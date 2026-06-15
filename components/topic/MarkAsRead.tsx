"use client";
import { useProgress } from "@/lib/use-progress";

export default function MarkAsRead({ slug }: { slug: string }) {
  const { isRead, toggle } = useProgress();
  const done = isRead(slug);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      className={`mark-read${done ? " done" : ""}`}
      onClick={() => toggle(slug)}
    >
      <span className="mark-read-box" aria-hidden="true">{done ? "✓" : ""}</span>
      <span className="mark-read-label">{done ? "Marked as read" : "Mark as read"}</span>
    </button>
  );
}
