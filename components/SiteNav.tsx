"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/learn", label: "Learn", key: "learn" },
  { href: "/tradfi", label: "TradFi", key: "tradfi" },
  { href: "/graph", label: "Graph", key: "graph" },
  { href: "/playground", label: "Playground", key: "playground" },
  { href: "/quiz", label: "Quiz", key: "quiz" },
  { href: "/glossary", label: "Glossary", key: "glossary" },
  { href: "/news", label: "News", key: "news" },
  { href: "/community", label: "Writeups", key: "community" },
];

export default function SiteNav() {
  const pathname = usePathname() || "/";
  // Starts at the Mac glyph so the server and first client render agree — then
  // corrects on mount for anyone who isn't. The key handler already accepts
  // both metaKey and ctrlKey, so only the label ever needed to change.
  const [modKey, setModKey] = useState("⌘");
  useEffect(() => {
    const ua = navigator.userAgent;
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? ua;
    if (!/Mac|iPhone|iPad|iPod/i.test(platform)) setModKey("Ctrl ");
  }, []);
  const seg = pathname.split("/")[1] || "home";

  return (
    <nav className="dg-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-dot" />
          <span className="nav-logo-text">DeFiGrail</span>
        </Link>
        <div className="nav-links">
          {TABS.map((t) => (
            <Link key={t.key} href={t.href} className={`nav-link${seg === t.key ? " active" : ""}`}>
              {t.label}
            </Link>
          ))}
        </div>
        <div className="nav-spacer" />
        <button
          className="nav-search"
          onClick={() => window.dispatchEvent(new CustomEvent("dg:open-search"))}
        >
          <span>Search</span>
          <kbd>{modKey}K</kbd>
        </button>
      </div>
    </nav>
  );
}
