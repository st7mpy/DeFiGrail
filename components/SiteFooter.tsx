export default function SiteFooter() {
  return (
    <footer className="dg-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">
            <span className="footer-dot" />
            <span className="footer-brand">DeFiGrail</span>
          </div>
          <div className="footer-copy">
            Educational content only — nothing on DeFiGrail is financial advice. Built as a
            static-first reference with a community pipeline.
          </div>
        </div>
        <div className="footer-side">
          <div className="footer-tag">CONCEPT → MECHANICS → FORMULAS → EDGE CASES</div>
          <a className="footer-made" href="https://s7ddharth-portfolio.vercel.app" target="_blank" rel="noopener noreferrer">
            Made by Siddharth →
          </a>
        </div>
      </div>
    </footer>
  );
}
