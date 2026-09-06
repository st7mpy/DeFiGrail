export default function Layman({ children }: { children: React.ReactNode }) {
  return (
    <details className="layman">
      <summary className="layman-summary">In plain English</summary>
      <div className="layman-body">{children}</div>
    </details>
  );
}
