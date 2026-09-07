"use client";
import { useEffect, useRef } from "react";

// The page is statically prerendered, so any string assembled in the
// component body (even from parts) still gets baked into the served HTML —
// join-at-render-time only hides the address from the source .tsx, not from
// curl/view-source. Setting href in an effect keeps it out of the HTML
// response entirely; real browsers still get a working mailto: link once JS
// runs (a fraction of a second after paint).
export default function FooterEmailLink() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.href = `mailto:${["siddharth77work", "gmail.com"].join("@")}`;
  }, []);

  return (
    <a className="footer-made" ref={ref}>
      Email Siddharth →
    </a>
  );
}
