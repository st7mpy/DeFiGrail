"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

function getModKey(): string {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? navigator.userAgent;
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? "⌘" : "Ctrl ";
}

const TABS = [
  { href: "/learn", label: "Learn", key: "learn" },
  { href: "/graph", label: "Graph", key: "graph" },
  { href: "/playground", label: "Playground", key: "playground" },
  { href: "/quiz", label: "Quiz", key: "quiz" },
  { href: "/glossary", label: "Glossary", key: "glossary" },
  { href: "/news", label: "News", key: "news" },
  { href: "/community", label: "Writeups", key: "community" },
];

export default function SiteNav() {
  const pathname = usePathname() || "/";
  // Platform is external, immutable state — useSyncExternalStore reads it with
  // an explicit server snapshot instead of setState-in-effect, so there is no
  // cascading render and no hydration mismatch. The key handler already accepts
  // both metaKey and ctrlKey; only the label ever needed to change.
  const modKey = useSyncExternalStore(subscribeNever, getModKey, () => "⌘");
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
