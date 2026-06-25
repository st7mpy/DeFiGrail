"use client";
import Link from "next/link";
import { useProgress } from "@/lib/use-progress";
import type { TrackView } from "@/lib/topic-cards";

export default function TrackSection({ tracks, totalTopics }: { tracks: TrackView[]; totalTopics: number }) {
  const { isRead, countRead } = useProgress();
  const allSlugs = tracks.flatMap((t) => t.topics.map((tp) => tp.slug));
  const totalRead = countRead(allSlugs);

  return (
    <section style={{ padding: "8px 0 0" }}>
      <div className="section-header">
        <h2 className="section-h2">Learning tracks</h2>
        <span className="section-meta">{totalRead} / {totalTopics} READ</span>
      </div>
      <div className="track-grid">
        {tracks.map((t) => {
          const total = t.topics.length;
          const read = countRead(t.topics.map((tp) => tp.slug));
          const pct = total ? Math.round((read / total) * 100) : 0;
          return (
            <Link key={t.id} href={`/learn?track=${t.id}`} className="track-card">
              <div className="track-card-top">
                <span className="track-name">{t.name}</span>
              </div>
              <p className="track-blurb">{t.blurb}</p>
              <div>
                <div className="track-progress-bar"><div className="track-progress-fill" style={{ width: `${pct}%` }} /></div>
                <div className="track-progress-meta"><span>{read} / {total} READ</span><span>{pct}%</span></div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
