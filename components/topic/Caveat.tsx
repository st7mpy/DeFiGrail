const KINDS = {
  misuse: "Commonly misread",
  breaks: "Where this breaks",
  real: "When it cost real money",
  stale: "Parameters drift",
  check: "Verify it yourself",
} as const;

export type CaveatKind = keyof typeof KINDS;

export default function Caveat({
  kind,
  asOf,
  src,
  children,
}: {
  kind: CaveatKind;
  asOf?: string;
  src?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="caveat" data-kind={kind}>
      <div className="caveat-label">
        <span>{KINDS[kind]}</span>
        {asOf && <span className="caveat-asof">as of {asOf}</span>}
      </div>
      <div className="caveat-body">{children}</div>
      {src && (
        <a className="caveat-src" href={src} target="_blank" rel="noreferrer">
          Live source ↗
        </a>
      )}
    </aside>
  );
}
