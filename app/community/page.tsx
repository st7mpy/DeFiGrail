import type { Metadata } from "next";
import CommunityForm from "@/components/community/CommunityForm";
import { SUBMISSIONS } from "@/lib/site-data";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="community-layout">
      <div className="page-head">
        <div className="page-head-h1">Community</div>
        <div className="page-head-sub">Member-submitted guides and essays</div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(26,24,19,.5)", marginBottom: 14 }}>
        Submissions
      </div>
      {SUBMISSIONS.map((s) => (
        <div className="submission-card" key={s.id}>
          <div className="submission-header">
            <div>
              <span className={`status-badge ${s.status}`}>{s.status}</span>
              <span style={{ fontSize: 11, color: "rgba(26,24,19,.45)", marginLeft: 10 }}>{s.category} · {s.date}</span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(26,24,19,.5)" }}>by {s.author}</span>
          </div>
          <div className="submission-title">{s.title}</div>
          <div className="submission-body">{s.body}</div>
        </div>
      ))}

      <CommunityForm />
    </div>
  );
}
