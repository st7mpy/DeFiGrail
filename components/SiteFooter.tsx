import FooterEmailLink from "./FooterEmailLink";

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
          <div className="footer-contact">
            <span className="footer-contact-label">Get in touch</span>
            <FooterEmailLink />
            <a className="footer-made" href="https://s7ddharth-portfolio.vercel.app" target="_blank" rel="noopener noreferrer">
              Portfolio →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
