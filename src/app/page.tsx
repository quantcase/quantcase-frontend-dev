"use client";

import Link from "next/link";

/* ─── Design tokens matching landing-page-reference.html ─── */
const C = {
  bg: "#0A0E1A",
  bg2: "#0E1422",
  bgElev: "#131A2C",
  line: "rgba(255,255,255,0.07)",
  line2: "rgba(255,255,255,0.12)",
  ink: "#E9ECF3",
  ink2: "#B7BECF",
  ink3: "#7C8499",
  ink4: "#565D72",
  gold: "oklch(0.84 0.12 85)",
  gold2: "oklch(0.72 0.13 75)",
  indigo: "oklch(0.68 0.18 270)",
  indigo2: "oklch(0.58 0.20 270)",
  mint: "oklch(0.80 0.13 165)",
  mint2: "oklch(0.65 0.13 165)",
  rose: "oklch(0.72 0.16 25)",
} as const;

/* ─── Arrow icon ─── */
function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ─── Logo mark ─── */
function LogoMark() {
  return (
    <div
      style={{
        width: 26, height: 26, borderRadius: 7,
        background: `linear-gradient(135deg, ${C.indigo} 0%, #2a2f55 100%)`,
        display: "grid", placeItems: "center",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 10, height: 10, borderRadius: 2,
          background: C.gold,
          transform: "rotate(45deg)",
        }}
      />
    </div>
  );
}

/* ─── Status bar SVG icons ─── */
function StatusIcons() {
  return (
    <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 16h2v4H2v-4zm5-3h2v7H7v-7zm5-4h2v11h-2V9zm5-5h2v16h-2V4z" />
      </svg>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4C7 4 2.7 6.5 1 10c1.7 3.5 6 6 11 6s9.3-2.5 11-6c-1.7-3.5-6-6-11-6zm0 10a4 4 0 110-8 4 4 0 010 8z" />
      </svg>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="7" width="18" height="10" rx="2" />
        <rect x="21" y="10" width="2" height="4" rx="1" />
      </svg>
    </span>
  );
}

/* ─── Phone shell ─── */
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 320, height: 660, borderRadius: 44,
        background: "#05080F",
        border: "1.5px solid #1a2235",
        padding: 10,
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 -2px 0 rgba(255,255,255,0.04) inset",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
          width: 96, height: 28, background: "#000", borderRadius: 999, zIndex: 5,
        }}
      />
      <div
        style={{
          width: "100%", height: "100%", borderRadius: 34,
          background: C.bg,
          overflow: "hidden", position: "relative",
          color: C.ink, fontSize: 12.5,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px 0 28px", fontSize: 13, fontWeight: 600, color: "#fff",
          }}
        >
          <span>9:41</span>
          <StatusIcons />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Phone screen 1: Deal Pipeline ─── */
function DealPipelineScreen() {
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

  const deals = [
    { name: "Fleetbridge", color: "oklch(0.72 0.16 270)", target: "3.2x", targetColor: "oklch(0.78 0.13 270)", fill: 78, grad: "oklch(0.55 0.18 270), oklch(0.72 0.16 270)", size: "₹2,800 Cr" },
    { name: "Northwind Bio", color: C.mint, target: "4.8x", targetColor: C.mint, fill: 55, grad: `oklch(0.55 0.13 165), ${C.mint}`, size: "₹1,500 Cr" },
    { name: "Aerolane", color: C.gold, target: "2.7x", targetColor: C.gold, fill: 90, grad: `${C.gold2}, ${C.gold}`, size: "₹900 Cr" },
  ];

  return (
    <div style={{ padding: "0 18px 18px" }}>
      {/* Tags */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <span style={{ ...mono, fontSize: 9.5, letterSpacing: "0.06em", padding: "4px 7px", borderRadius: 5, background: "rgba(220,180,90,0.14)", color: C.gold, textTransform: "uppercase" }}>Pre-IPO · PE</span>
        <span style={{ ...mono, fontSize: 9.5, letterSpacing: "0.06em", padding: "4px 7px", borderRadius: 5, background: "rgba(255,255,255,0.06)", color: C.ink2, textTransform: "uppercase" }}>Live Deals</span>
      </div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 0 6px" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>Deal Pipeline</div>
          <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 2 }}>Curated private market opportunities</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Avg MOIC</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.gold, letterSpacing: "-0.02em" }}>3.9<span style={{ fontSize: 14 }}>x</span></div>
        </div>
      </div>
      {/* Deal rows */}
      {deals.map((d) => (
        <div key={d.name} style={{ padding: "14px 0", borderTop: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, flexShrink: 0, display: "inline-block" }} />
              {d.name}
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: d.targetColor }}>{d.target}</span>
              <span style={{ fontSize: 10, color: C.ink3, marginLeft: 4 }}>target</span>
            </div>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", borderRadius: 999, width: `${d.fill}%`, background: `linear-gradient(90deg, ${d.grad})` }} />
          </div>
          <div style={{ fontSize: 10, color: C.ink3, marginTop: 6, textAlign: "right" }}>{d.fill}% filled · {d.size}</div>
        </div>
      ))}
      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 0", marginTop: 8, fontSize: 10.5, color: C.ink3, borderTop: `1px solid ${C.line}` }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.mint, display: "inline-block" }} />
        Minimum ticket · ₹10L · Verified distributor
      </div>
    </div>
  );
}

/* ─── Phone screen 2: Earnings Pulse ─── */
function EarningsPulseScreen() {
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
  const calls = [
    {
      ticker: "RELI", period: "Q2 FY26",
      badge: "High Conviction", badgeBg: "rgba(140,220,180,0.14)", badgeColor: C.mint,
      meterFill: 5, meterTotal: 7, meterColor: C.mint,
      quote: '"...margin expansion is structural, not cyclical — we\'re committing to the 22% target."',
      metaKey: "CEO commitment", metaVal: "+18% vs Q1", metaValColor: C.ink,
    },
    {
      ticker: "MARV", period: "Q2 FY26",
      badge: "Hedged", badgeBg: "rgba(220,180,90,0.14)", badgeColor: C.gold,
      meterFill: 3, meterTotal: 7, meterColor: C.gold,
      quote: '"...we should see normalization in the back half — assuming demand cooperates."',
      metaKey: "Hedge phrases", metaVal: "↑ 7 detected", metaValColor: C.gold,
    },
    {
      ticker: "CYNO", period: "Q2 FY26",
      badge: "Deflective", badgeBg: "rgba(230,140,140,0.14)", badgeColor: C.rose,
      meterFill: 2, meterTotal: 7, meterColor: C.rose,
      quote: '"...we don\'t want to comment on near-term unit economics at this time."',
      metaKey: null, metaVal: null, metaValColor: null,
    },
  ];

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, color: C.ink3, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 0 12px" }}>Q2 · Earnings Pulse</div>
      {calls.map((c, i) => (
        <div key={c.ticker} style={{ background: "#0F1525", border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, marginBottom: i < calls.length - 1 ? 10 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{c.ticker} <small style={{ color: C.ink3, fontWeight: 400, marginLeft: 6 }}>{c.period}</small></div>
            <span style={{ ...mono, fontSize: 9, padding: "3px 7px", borderRadius: 4, background: c.badgeBg, color: c.badgeColor, letterSpacing: "0.06em" }}>{c.badge}</span>
          </div>
          <div style={{ fontSize: 10, color: C.ink3, marginBottom: 4 }}>Tone · Credibility · Forward signal</div>
          <div style={{ display: "flex", gap: 3, margin: "8px 0" }}>
            {Array.from({ length: c.meterTotal }).map((_, j) => (
              <span key={j} style={{ flex: 1, height: 4, borderRadius: 2, background: j < c.meterFill ? c.meterColor : "rgba(255,255,255,0.06)" }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.ink2, lineHeight: 1.45, margin: "6px 0 0", fontStyle: "italic", fontFamily: "inherit" }}>{c.quote}</p>
          {c.metaKey && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.ink3, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.line}` }}>
              <span>{c.metaKey}</span>
              <b style={{ color: c.metaValColor ?? C.ink, fontWeight: 600 }}>{c.metaVal}</b>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Phone screen 3: Live Screener ─── */
function ScreenerScreen() {
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
  const rows = [
    { name: "ALPHALOOM", sector: "Software", qcs: 92, qcColor: C.mint, delta: "+2.4%", deltaUp: true, price: "₹4,128" },
    { name: "VEDARA", sector: "Industrials", qcs: 88, qcColor: C.mint, delta: "+1.1%", deltaUp: true, price: "₹992" },
    { name: "NORTHWIND", sector: "Energy", qcs: 85, qcColor: C.mint, delta: "−0.6%", deltaUp: false, price: "₹2,344" },
    { name: "FLEETBRIDGE", sector: "Logistics", qcs: 81, qcColor: C.gold, delta: "+0.9%", deltaUp: true, price: "₹612" },
    { name: "HELIOS LABS", sector: "Healthcare", qcs: 80, qcColor: C.gold, delta: "+3.2%", deltaUp: true, price: "₹1,540" },
  ];

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, color: C.ink3, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 0 12px" }}>Live Screener</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {["QCS > 80", "P/E < 22", "RSI 40–60", "+ Add"].map((chip, i) => (
          <span key={chip} style={{ fontSize: 10, padding: "5px 9px", borderRadius: 999, background: i === 0 ? C.ink : "rgba(255,255,255,0.05)", color: i === 0 ? C.bg : C.ink2, border: `1px solid ${i === 0 ? C.ink : C.line}` }}>{chip}</span>
        ))}
      </div>
      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, padding: "0 4px 6px", borderBottom: `1px solid ${C.line}`, fontSize: 9, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span>Ticker</span><span>QCS</span><span>1D</span><span>Price</span>
      </div>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, padding: "10px 4px", borderBottom: `1px solid ${C.line}`, alignItems: "center", fontSize: 11.5 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 9, color: C.ink3, marginTop: 1 }}>{r.sector}</div>
          </div>
          <span style={{ ...mono, fontWeight: 600, color: r.qcColor }}>{r.qcs}</span>
          <span style={{ ...mono, fontSize: 10.5, color: r.deltaUp ? C.mint : C.rose }}>{r.delta}</span>
          <span style={{ ...mono, fontWeight: 600, fontSize: 11 }}>{r.price}</span>
        </div>
      ))}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 10, color: C.ink3, display: "flex", justifyContent: "space-between" }}>
        <span>Updated 0.4s ago</span>
        <span>1,247 → 26 matches</span>
      </div>
    </div>
  );
}

/* ─── Phone screen 4: Management Score ─── */
function ManagementScreen() {
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

  const leaders = [
    {
      initials: "AR", name: "A. Ramnath", role: "CEO · Vedara Industrials · 11 yrs",
      score: 87, scoreColor: C.gold,
      avatarBg: `linear-gradient(135deg, ${C.indigo}, #2a2f55)`,
      bars: [
        { lab: "Capital allocation", pct: 92, color: C.gold, grade: "A+" },
        { lab: "Execution history", pct: 84, color: C.mint, grade: "A−" },
        { lab: "Communication", pct: 78, color: C.gold, grade: "B+" },
      ],
    },
    {
      initials: "PD", name: "P. Dasgupta", role: "CFO · Vedara Industrials · 4 yrs",
      score: 73, scoreColor: C.mint,
      avatarBg: `linear-gradient(135deg, ${C.gold2}, #6b5a2a)`,
      bars: [
        { lab: "Capital allocation", pct: 70, color: C.gold, grade: "B" },
        { lab: "Execution history", pct: 80, color: C.mint, grade: "B+" },
      ],
    },
  ];

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, color: C.ink3, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 0 12px" }}>Management Score</div>
      {leaders.map((l, i) => (
        <div key={l.initials} style={{ background: "#0F1525", borderRadius: 14, padding: 16, marginBottom: i < leaders.length - 1 ? 12 : 0, border: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: l.avatarBg, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
              {l.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div>
              <div style={{ fontSize: 10, color: C.ink3 }}>{l.role}</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: l.scoreColor, marginLeft: "auto" }}>{l.score}</div>
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {l.bars.map((b) => (
              <div key={b.lab} style={{ display: "grid", gridTemplateColumns: "1fr 60px auto", gap: 8, alignItems: "center", fontSize: 10.5 }}>
                <span style={{ color: C.ink2 }}>{b.lab}</span>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", borderRadius: 2, background: b.color, width: `${b.pct}%` }} />
                </div>
                <span style={{ ...mono, fontSize: 10, color: C.ink2 }}>{b.grade}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Divider ─── */
function Divider() {
  return <div style={{ height: 1, background: C.line, maxWidth: 1200, margin: "0 auto" }} />;
}

/* ─── Pill link ─── */
function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        fontSize: 14, color: C.ink, padding: "10px 18px",
        borderRadius: 999, border: `1px solid ${C.line2}`,
        background: "rgba(255,255,255,0.02)", textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

/* ─── Feature section ─── */
function Feature({
  eyebrow, title, serif, body, linkText, linkHref, visual, reverse = false,
}: {
  eyebrow: string; title: React.ReactNode; serif: string; body: string;
  linkText: string; linkHref: string; visual: React.ReactNode; reverse?: boolean;
}) {
  const wrap: React.CSSProperties = {
    maxWidth: 1200, margin: "0 auto", padding: "0 32px",
  };
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 80,
    alignItems: "center",
    direction: reverse ? "rtl" : "ltr",
  };

  return (
    <section style={{ padding: "120px 0", position: "relative" }}>
      <div style={wrap}>
        <div style={grid}>
          <div style={{ direction: "ltr" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink3, marginBottom: 14 }}>
              {eyebrow}
            </div>
            <h2 style={{
              fontSize: "clamp(34px, 4.2vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em",
              fontWeight: 600, margin: "0 0 20px", maxWidth: "14ch",
              fontFamily: "inherit", color: C.ink,
            }}>
              {title}{" "}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: C.gold }}>{serif}</span>
            </h2>
            <p style={{ color: C.ink2, fontSize: 17, maxWidth: "44ch", marginBottom: 28, fontFamily: "inherit", lineHeight: 1.5 }}>{body}</p>
            <PillLink href={linkHref}>{linkText} <ArrowRight /></PillLink>
          </div>
          <div style={{ display: "flex", justifyContent: "center", direction: "ltr" }}>{visual}</div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ item ─── */
function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      style={{ borderBottom: `1px solid ${C.line}` }}
    >
      <summary
        style={{
          padding: "22px 4px", cursor: "pointer",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24,
          listStyle: "none", userSelect: "none",
        }}
      >
        <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: C.ink }}>{q}</span>
        <span style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
          border: `1px solid ${C.line2}`, display: "grid", placeItems: "center",
          color: C.ink2,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <div style={{ fontSize: 14, color: C.ink2, padding: "0 4px 22px", lineHeight: 1.6 }}>{a}</div>
    </details>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const wrap: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "0 32px" };
  const serif = (text: string) => (
    <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: C.gold }}>{text}</span>
  );

  return (
    <div style={{
      background: C.bg, color: C.ink,
      fontFamily: "'Inter', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased",
      lineHeight: 1.5, overflowX: "hidden",
    }}>
      {/* ══ Google Fonts ══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
        ::selection { background: oklch(0.84 0.12 85); color: #0a0e1a; }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary span:last-child { transform: rotate(45deg); border-color: oklch(0.84 0.12 85); color: oklch(0.84 0.12 85); }
        details summary span:last-child { transition: transform .2s; }
        @media (max-width: 880px) {
          .lp-feature-grid { grid-template-columns: 1fr !important; gap: 48px !important; direction: ltr !important; }
          .lp-foot-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .lp-nav-links { display: none !important; }
          .lp-feature-section { padding: 80px 0 !important; }
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(14px)",
        background: "rgba(10,14,26,0.72)",
        borderBottom: `1px solid ${C.line}`,
      }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <LogoMark />
            <span>Quantcase</span>
          </div>
          <div className="lp-nav-links" style={{ display: "flex", gap: 32, fontSize: 14, color: C.ink2 }}>
            {["Product", "Research", "Pricing", "About"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "inherit", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/signin" style={{
              fontSize: 13, padding: "9px 16px", borderRadius: 999,
              border: `1px solid ${C.line2}`, color: C.ink, background: "transparent",
              cursor: "pointer", textDecoration: "none",
            }}>Sign in</Link>
            <Link href="/signin" style={{
              fontSize: 13, padding: "9px 16px", borderRadius: 999,
              background: C.ink, color: C.bg, borderColor: C.ink, fontWeight: 600,
              cursor: "pointer", textDecoration: "none",
            }}>Request access</Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <header style={{ position: "relative", padding: "96px 0 48px", textAlign: "center", isolation: "isolate" }}>
        {/* Gradient bg */}
        <div style={{
          position: "absolute", inset: 0, zIndex: -1,
          background: "radial-gradient(60% 60% at 50% 0%, rgba(108,116,255,0.16), transparent 70%), radial-gradient(40% 40% at 80% 30%, rgba(255,205,120,0.06), transparent 70%)",
        }} />
        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, zIndex: -1,
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent 80%)",
        }} />

        <div style={wrap}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 12px", borderRadius: 999,
            border: `1px solid ${C.line2}`, background: "rgba(255,255,255,0.02)",
            fontSize: 12, color: C.ink2, letterSpacing: "0.04em",
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.mint, boxShadow: "0 0 0 3px rgba(120,220,180,0.15)", display: "inline-block" }} />
            Now onboarding institutional allocators · Q2 2026
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(40px, 6.6vw, 84px)", lineHeight: 1.02,
            letterSpacing: "-0.035em", fontWeight: 600,
            margin: "0 auto 22px", maxWidth: "14ch",
            fontFamily: "inherit", color: C.ink,
          }}>
            Enterprise-grade research<br />
            across {serif("Private Markets.")}
          </h1>

          {/* Sub */}
          <p style={{ color: C.ink2, fontSize: 18, maxWidth: "56ch", margin: "0 auto 36px", fontFamily: "inherit" }}>
            Quantcase brings the rigor of a quant desk to pre-IPO and growth-stage investing — earnings intelligence, real-time screening, and deep management diligence in one workspace.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
            <Link href="/signin" style={{
              cursor: "pointer", border: "none", fontFamily: "inherit",
              fontSize: 15, fontWeight: 500, padding: "14px 22px", borderRadius: 999,
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.ink, color: C.bg, textDecoration: "none",
            }}>Request access →</Link>
            <Link href="/screener/home" style={{
              cursor: "pointer", fontFamily: "inherit",
              fontSize: 15, fontWeight: 500, padding: "14px 22px", borderRadius: 999,
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "transparent", color: C.ink,
              border: `1px solid ${C.line2}`, textDecoration: "none",
            }}>See a live deal</Link>
          </div>

          {/* Hero phone */}
          <div style={{ margin: "64px auto 0", width: 320, position: "relative" }}>
            <Phone><DealPipelineScreen /></Phone>
          </div>
        </div>
      </header>

      <Divider />

      {/* ══ FEATURE 1: AI Earnings Analysis ══ */}
      <Feature
        eyebrow="01 · AI Earnings Analysis"
        title="Decode every earnings call."
        serif="Word by word."
        body="Our models read management tone, score guidance credibility, and surface forward signals from every call — so you catch hedges, deflections, and conviction shifts before they hit the tape."
        linkText="See sample report"
        linkHref="#"
        visual={<Phone><EarningsPulseScreen /></Phone>}
      />

      <Divider />

      {/* ══ FEATURE 2: Real-time Screening ══ */}
      <Feature
        eyebrow="02 · Real-time Screening"
        title="Filter thousands of stocks."
        serif="Instantly."
        body="Combine fundamentals, technicals, and our proprietary Quantcase scores into screens that update in real time. Save them, share them, or trigger alerts when something crosses your line."
        linkText="Browse the screener"
        linkHref="#"
        visual={<Phone><ScreenerScreen /></Phone>}
        reverse
      />

      <Divider />

      {/* ══ FEATURE 3: Management Intelligence ══ */}
      <Feature
        eyebrow="03 · Management Intelligence"
        title="Score the people running the company."
        serif="Not just the numbers."
        body="We score leadership quality across capital allocation, execution history, and communication — turning years of filings, calls, and board moves into a single, comparable view."
        linkText="See methodology"
        linkHref="#"
        visual={<Phone><ManagementScreen /></Phone>}
      />

      <Divider />

      {/* ══ STAT BLOCK ══ */}
      <section style={{ textAlign: "center", padding: "80px 0 120px" }}>
        <div style={wrap}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink3, marginBottom: 16 }}>
            By the numbers
          </div>
          <h2 style={{ fontSize: "clamp(34px, 4.2vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 600, margin: "0 auto", maxWidth: "14ch", fontFamily: "inherit", color: C.ink }}>
            Looking for a smarter way to {serif("research?")}
          </h2>
          <div style={{
            margin: "32px auto 0", width: 320, padding: "28px 24px",
            borderRadius: 20,
            background: "linear-gradient(180deg, #131A2C 0%, #0d1322 100%)",
            border: `1px solid ${C.line2}`, textAlign: "left",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.ink3, letterSpacing: "0.12em", textTransform: "uppercase" }}>Quantcase Index · 5y CAGR</div>
            <div style={{
              fontSize: 64, lineHeight: 1, fontWeight: 700, letterSpacing: "-0.04em",
              margin: "12px 0 6px",
              background: "linear-gradient(180deg, #fff 0%, #b7becf 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>32<span style={{ fontSize: 36, color: C.ink2, WebkitTextFillColor: C.ink2 }}>.4%</span></div>
            <div style={{ fontSize: 13, color: C.ink2 }}>
              Backtested across 1,200+ Indian listed equities · vs{" "}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: C.gold }}>Nifty 500</span> 14.1%.
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ TEAM ══ */}
      <section style={{ padding: "120px 0" }}>
        <div style={{ ...wrap, textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink3, marginBottom: 14 }}>
            Built by operators
          </div>
          <h2 style={{ fontSize: "clamp(34px, 4.2vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 600, margin: "0 auto", maxWidth: "14ch", fontFamily: "inherit", color: C.ink }}>
            From a team that has {serif("done it before.")}
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, alignItems: "center",
            padding: 36, borderRadius: 24,
            background: "linear-gradient(180deg, #11172A 0%, #0c1120 100%)",
            border: `1px solid ${C.line}`,
            maxWidth: 760, margin: "40px auto 0", textAlign: "left",
          }}>
            <div style={{
              width: 200, height: 200, borderRadius: 16,
              background: "repeating-linear-gradient(45deg, #1a2238 0 8px, #141a2e 8px 16px)",
              border: `1px solid ${C.line2}`,
              display: "grid", placeItems: "center",
              color: C.ink3, fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              textAlign: "center", padding: 12,
            }}>
              [ Founding team<br />placeholder ]
            </div>
            <div>
              <p style={{ margin: 0, color: C.ink2, fontSize: 15, fontFamily: "inherit", lineHeight: 1.5 }}>
                Founders from{" "}
                <span style={{ color: C.ink, fontWeight: 500 }}>Two Sigma</span>,{" "}
                <span style={{ color: C.ink, fontWeight: 500 }}>Sequoia</span>, and{" "}
                <span style={{ color: C.ink, fontWeight: 500 }}>Bridgewater</span>{" "}
                — building the research stack we wished we had on the buy side.
              </p>
              <div style={{ display: "flex", gap: 32, marginTop: 18 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: C.gold }}>$4.2B</div>
                  <div style={{ fontSize: 11, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Lifetime AUM managed</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: C.gold }}>14<span style={{ fontSize: 18, color: C.ink2 }}>yrs</span></div>
                  <div style={{ fontSize: 11, color: C.ink3, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Avg. buy-side experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ FAQ ══ */}
      <section style={{ padding: "120px 0", textAlign: "center" }}>
        <div style={wrap}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink3, marginBottom: 14 }}>
            FAQ
          </div>
          <h2 style={{ fontSize: "clamp(34px, 4.2vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 600, margin: "0 auto", maxWidth: "14ch", fontFamily: "inherit", color: C.ink }}>
            Still got questions? <br />{serif("We're here to help.")}
          </h2>
          <div style={{ maxWidth: 760, margin: "40px auto 0", textAlign: "left" }}>
            <FaqItem
              q="Who is Quantcase built for?"
              a="Family offices, RIAs, and serious individual investors who want institutional-grade research without standing up a quant desk. We're not a brokerage — we're the research layer that sits beside one."
              defaultOpen
            />
            <FaqItem
              q="How is the Quantcase Score calculated?"
              a="Each company is scored across four pillars — fundamentals, momentum, governance, and management quality — and blended into a single 0–100 score. We publish the methodology in full and re-score nightly."
            />
            <FaqItem
              q="Do you offer access to private market deals?"
              a="Yes — vetted pre-IPO and growth-stage opportunities are surfaced in the Deal Pipeline, with minimum tickets starting at ₹10L. All deals are accompanied by full Quantcase research."
            />
            <FaqItem
              q="Is my portfolio data secure?"
              a="Read-only integrations, SOC 2 Type II certified infrastructure, end-to-end encryption, and no resale of any user data — ever. Your holdings are yours alone."
            />
            <FaqItem
              q="How much does Quantcase cost?"
              a="Quantcase Pro is ₹24,000/year for individuals. Family office and RIA tiers are quoted based on seats and data needs — request access and we'll get you a number within a day."
            />
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "64px 0 56px", marginTop: 40, background: "#07090F" }}>
        <div style={wrap}>
          <div className="lp-foot-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 10 }}>
                <LogoMark />
                <span>Quantcase</span>
              </div>
              <p style={{ color: C.ink3, fontSize: 13, marginTop: 16, maxWidth: "36ch", fontFamily: "inherit", lineHeight: 1.5 }}>
                Enterprise-grade research across public and private markets — for the next generation of allocators.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Earnings Pulse", "Live Screener", "Management Score", "Deal Pipeline"] },
              { heading: "Company", links: ["About", "Research", "Careers", "Contact"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Disclosures", "Compliance"] },
            ].map((col) => (
              <div key={col.heading}>
                <h5 style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink3, margin: "0 0 16px", fontFamily: "inherit" }}>{col.heading}</h5>
                {col.links.map((l) => (
                  <a key={l} href="#" style={{ display: "block", color: C.ink2, fontSize: 14, textDecoration: "none", padding: "6px 0" }}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", color: C.ink3, fontSize: 12 }}>
            <span>We&apos;re building India&apos;s research stack. We&apos;re hiring.</span>
            <span>© 2026 Quantcase Research Pvt. Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
