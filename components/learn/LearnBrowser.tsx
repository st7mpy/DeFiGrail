"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Glyph, { ERA_LABELS } from "@/components/Glyph";
import { useProgress } from "@/lib/use-progress";
import type { TrackView } from "@/lib/topic-cards";

export default function LearnBrowser({ tracks, initialTrack }: { tracks: TrackView[]; initialTrack?: string }) {
  const router = useRouter();
  const { isRead, toggle, countRead } = useProgress();
  const [active, setActive] = useState(
    tracks.find((t) => t.id === initialTrack)?.id ?? tracks[0]?.id
  );
  const track = tracks.find((t) => t.id === active) ?? tracks[0];

  return (
    <div className="learn-layout">
      <aside>
        <div className="learn-sidebar-label">Tracks</div>
        {tracks.map((t) => (
          <button
            key={t.id}
            className={`track-nav-btn${t.id === active ? " active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            <span className="track-nav-name">{t.name}</span>
            <span className="track-nav-count">{countRead(t.topics.map((x) => x.slug))}/{t.topics.length} read</span>
          </button>
        ))}
        <div className="learn-sidebar-label" style={{ marginTop: 22 }}>Era key</div>
        <div className="era-legend">
          {(["v0", "v1", "v2", "esoteric", "infra", "ref"] as const).map((e) => (
            <span key={e} className="era-legend-item"><Glyph era={e} size={11} /> {ERA_LABELS[e]}</span>
          ))}
        </div>
      </aside>
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(26,24,19,.5)", marginBottom: 6 }}>Current track</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 500 }}>{track?.name}</div>
          <div style={{ fontSize: 13, color: "rgba(26,24,19,.6)", marginTop: 4 }}>{track?.blurb}</div>
        </div>
        <div className="topic-list">
          {track?.topics.map((t) => {
            const done = isRead(t.slug);
            return (
              <div key={t.slug} className="topic-row" onClick={() => router.push(`/learn/${t.slug}`)}>
                <span className="topic-glyph"><Glyph era={t.era} size={14} /></span>
                <div className="topic-info">
                  <div className="topic-name">{t.name}</div>
                  <div className="topic-tagline">{t.tagline}</div>
                  {t.tradfi && <div className="topic-tradfi">TradFi: {t.tradfi}</div>}
                </div>
                <button
                  className={`topic-check${done ? " done" : ""}`}
                  title="Mark as read"
                  onClick={(e) => { e.stopPropagation(); toggle(t.slug); }}
                >
                  {done ? "✓" : ""}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
