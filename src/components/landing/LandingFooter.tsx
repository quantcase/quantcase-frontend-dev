const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

export default function LandingFooter() {
  return (
    <footer className="relative" style={{ borderTop: "1px solid rgba(14,26,43,0.08)", background: "#EFE8D8" }}>
      <div className="mx-auto max-w-[1280px] px-8 py-12 md:py-16 md:px-12">

        {/* Brand row — full width on mobile */}
        <div className="mb-10 md:mb-0 md:grid md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <div className="text-2xl" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>Quantcase</div>
            <p className="mt-3 max-w-sm text-sm" style={{ ...sans, color: "#3A4B61" }}>
              The algorithm behind every great investor. Indian equities, scored on Management, Opportunity, Deal.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.55)" }}>
              <span className="rounded-full px-3 py-1.5" style={{ border: "1px solid rgba(14,26,43,0.08)" }}>AI calibrated</span>
            </div>
          </div>
        </div>

        {/* Link columns — 2-col grid on mobile, inline on desktop */}
        <div className="mt-10 grid grid-cols-2 gap-8 md:mt-0 md:hidden">
          <div>
            <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Product</div>
            <ul className="mt-4 space-y-3 text-sm" style={{ padding: 0 }}>
              {[["Framework", "#framework"], ["Engine", "#engine"], ["Example", "#example"], ["Portfolio", "#portfolio"]].map(([label, href]) => (
                <li key={label} style={{ listStyleType: "none", marginLeft: 0 }}>
                  <a href={href} className="lp-footer-link">{label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Company</div>
            <ul className="mt-4 space-y-3 text-sm" style={{ padding: 0 }}>
              {["About", "Research", "Careers", "Contact"].map((l) => (
                <li key={l} style={{ listStyleType: "none", marginLeft: 0 }}>
                  <a href="#" className="lp-footer-link">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Desktop-only link columns */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 md:-mt-[5.5rem]">
          <div className="md:col-span-5" /> {/* spacer */}
          <div className="md:col-span-3">
            <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Product</div>
            <ul className="mt-5 space-y-3 text-sm" style={{ padding: 0 }}>
              {[["Framework", "#framework"], ["Engine", "#engine"], ["Example", "#example"], ["Portfolio", "#portfolio"]].map(([label, href]) => (
                <li key={label} style={{ listStyleType: "none", marginLeft: 0 }}>
                  <a href={href} className="lp-footer-link">{label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Company</div>
            <ul className="mt-5 space-y-3 text-sm" style={{ padding: 0 }}>
              {["About", "Research", "Careers", "Contact"].map((l) => (
                <li key={l} style={{ listStyleType: "none", marginLeft: 0 }}>
                  <a href="#" className="lp-footer-link">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hairline mt-12 md:mt-16" />
        <div
          className="mt-6 flex flex-col items-start justify-between gap-3 text-[10px] uppercase md:flex-row md:items-center"
          style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.50)" }}
        >
          <span>© 2026 Quantcase · All rights reserved</span>
          <span className="leading-relaxed" style={{ letterSpacing: "0.12em" }}>Not investment advice.</span>
        </div>
      </div>
    </footer>
  );
}
