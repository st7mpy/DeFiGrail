export default function SiteFooter() {
  return (
    <footer className="dg-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-copy">
            Educational content only — nothing on DeFiGrail is financial advice. Built as a
            static-first reference with a community pipeline.
          </div>
        </div>
        <div className="footer-side">
          <ol className="footer-flow" aria-label="How every topic is structured">
            {["Concept", "Mechanics", "Formulas", "Edge cases"].map((step, i) => (
              <li key={step} className="footer-flow-step" style={{ animationDelay: `${i * 0.55}s` }}>
                {step}
              </li>
            ))}
          </ol>
          <div className="footer-contact">
            <span className="footer-contact-label">Get in touch</span>
            {/* Percent-encoded @ (RFC 6068): browsers decode it, so this is a
                working mailto with no JS, while the literal address never
                appears in the served HTML for naive [\w.]+@[\w.]+ scrapers. */}
            <a className="footer-made" href="mailto:siddharth77work%40gmail.com">
              Email Siddharth →
            </a>
            <a className="footer-made" href="https://s7ddharth-portfolio.vercel.app" target="_blank" rel="noopener noreferrer">
              Portfolio →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
