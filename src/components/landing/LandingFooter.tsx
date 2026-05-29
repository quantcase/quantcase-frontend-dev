const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

export default function LandingFooter() {
  return (
    <footer className="relative" style={{ borderTop: "1px solid rgba(14,26,43,0.08)", background: "#EFE8D8" }}>
      <div className="mx-auto max-w-[1280px] px-8 py-16 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-2xl" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>Quantcase</div>
            <p className="max-w-sm text-sm" style={{ ...sans, color: "#3A4B61", margin: "1rem 0 0" }}>
              The algorithm behind every great investor. Indian &amp; US equities, scored on Management, Opportunity, Deal.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.55)" }}>
              {["SOC 2", "Read-only access", "AI calibrated"].map((badge) => (
                <span key={badge} className="rounded-full px-3 py-1.5" style={{ border: "1px solid rgba(14,26,43,0.08)" }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Product</div>
            <ul className="mt-5 space-y-3 text-sm" style={{ padding: 0 }}>
              {[["Framework", "#framework"], ["Engine", "#engine"], ["Example", "#example"], ["Portfolio", "#portfolio"]].map(([label, href]) => (
                <li key={label} style={{ listStyleType: "none", marginLeft: 0 }}>
                  <a href={href} className="lp-footer-link">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Company</div>
            <ul className="mt-5 space-y-3 text-sm" style={{ padding: 0 }}>
              {["About", "Research", "Careers", "Contact"].map((l) => (
                <li key={l} style={{ listStyleType: "none", marginLeft: 0 }}>
                  <a href="#" className="lp-footer-link">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Legal</div>
            <ul className="mt-5 space-y-3 text-sm" style={{ padding: 0 }}>
              {["Privacy", "Terms", "Disclosures", "Trust Center"].map((l) => (
                <li key={l} style={{ listStyleType: "none", marginLeft: 0 }}>
                  <a href="#" className="lp-footer-link">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hairline mt-16" />
        <div
          className="mt-8 flex flex-col items-start justify-between gap-4 text-[10px] uppercase md:flex-row md:items-center"
          style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}
        >
          <span>© 2026 Quantcase Systems · All rights reserved</span>
          <span>Not investment advice. Quantcase does not substitute your own analysis.</span>
        </div>
      </div>
    </footer>
  );
}
