"use client";

import { SectionShell, SectionLabel, NarrativeSidebar, MonoEyebrow } from "./primitives";

// ─── Types ─────────────────────────────────────────────────────────────────

type Sent = "bear" | "neu" | "bull";

interface SignalRow {
  sent: Sent;
  label: string;
  value: string;
}

interface FrameworkTile {
  name: string;
  shortName: string;
  tf: string;
  verdict: Sent;
  signals: SignalRow[];
  signalCount: number;
  footNote: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TILES: FrameworkTile[] = [
  {
    name: "Price structure", shortName: "Price structure", tf: "Weekly · Daily", verdict: "bear", signalCount: 6, footNote: "Base forming",
    signals: [
      { sent: "bear", label: "Trend direction",   value: "Downtrend" },
      { sent: "bear", label: "Price vs SMA 200",  value: "Below" },
      { sent: "bear", label: "Key level breach",  value: "Yes" },
      { sent: "bear", label: "Volume trend",      value: "Declining" },
    ],
  },
  {
    name: "Technical momentum", shortName: "Technical mom.", tf: "Daily", verdict: "bear", signalCount: 4, footNote: "Momentum weak",
    signals: [
      { sent: "bear", label: "RSI (14)",   value: "38 · Weak" },
      { sent: "bear", label: "MACD",       value: "Negative" },
      { sent: "neu",  label: "Stochastic", value: "42 · Neutral" },
      { sent: "bear", label: "ADX",        value: "28 · Trending" },
    ],
  },
  {
    name: "Market breadth", shortName: "Market breadth", tf: "Weekly", verdict: "bear", signalCount: 5, footNote: "Narrow leadership",
    signals: [
      { sent: "bear", label: "Advance / Decline", value: "Declining" },
      { sent: "bear", label: "% above SMA 200",   value: "38%" },
      { sent: "bear", label: "New 52W highs",      value: "Low" },
      { sent: "bear", label: "Sector rotation",    value: "Defensive" },
    ],
  },
  {
    name: "Capital flows", shortName: "Capital flows", tf: "Weekly", verdict: "neu", signalCount: 2, footNote: "Domestic absorbing",
    signals: [
      { sent: "bear", label: "FII flows (4W)", value: "−₹2,400 Cr" },
      { sent: "bull", label: "DII flows (4W)", value: "+₹5,100 Cr" },
    ],
  },
  {
    name: "Macro & policy", shortName: "Macro & policy", tf: "Monthly", verdict: "neu", signalCount: 4, footNote: "Supportive backdrop",
    signals: [
      { sent: "neu",  label: "RBI stance",      value: "Neutral" },
      { sent: "bull", label: "GDP growth",       value: "6.8% · Strong" },
      { sent: "neu",  label: "Inflation (CPI)",  value: "4.6%" },
      { sent: "bull", label: "Capex cycle",      value: "Expanding" },
    ],
  },
  {
    name: "Valuation & earnings", shortName: "Valuation", tf: "Monthly", verdict: "bear", signalCount: 3, footNote: "Premium unjustified",
    signals: [
      { sent: "bear", label: "Nifty P/E",         value: "21x · Premium" },
      { sent: "bear", label: "Earnings revision",  value: "Downgrade" },
      { sent: "neu",  label: "Earnings growth",    value: "12% · Moderate" },
    ],
  },
];

// ─── Derived tallies ──────────────────────────────────────────────────────────

const TALLY = TILES.reduce(
  (acc, t) => {
    t.signals.forEach((s) => {
      if (s.sent === "bear") acc.bear++;
      else if (s.sent === "bull") acc.bull++;
      else acc.neu++;
    });
    return acc;
  },
  { bear: 0, neu: 0, bull: 0 }
);
const TALLY_TOTAL = TALLY.bear + TALLY.neu + TALLY.bull;

const FW = TILES.reduce(
  (acc, t) => {
    if (t.verdict === "bear") acc.bear++;
    else if (t.verdict === "bull") acc.bull++;
    else acc.neu++;
    return acc;
  },
  { bear: 0, neu: 0, bull: 0 }
);

const SENTIMENT_SCORE = Math.round((FW.bull / TILES.length) * 100);
const needleAngle = -90 + (SENTIMENT_SCORE / 100) * 180;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentColor(s: Sent) {
  if (s === "bear") return "var(--qc-down, #B23A2F)";
  if (s === "bull") return "var(--qc-up, #1F7A4A)";
  return "var(--qc-warn, #B4731A)";
}

function fwSubLabel(sent: Sent): string {
  const names = TILES.filter(t => t.verdict === sent).map(t => t.name.split(" ")[0]);
  if (sent === "bull" && names.length === 0) return "No framework bullish";
  return names.join(" · ") || "—";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MvTile({ tile }: { tile: FrameworkTile }) {
  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--qc-ink)", marginBottom: 2 }}>{tile.name}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".08em", color: "var(--qc-ink-2)", textTransform: "uppercase" }}>{tile.tf}</div>
        </div>
        <span
          style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase",
            color: sentColor(tile.verdict),
            background: tile.verdict === "bear" ? "var(--qc-down-soft, #FDECEA)" : tile.verdict === "bull" ? "var(--qc-up-soft, #EAF4EE)" : "var(--qc-warn-soft, #FEF3E2)",
            padding: "3px 8px", borderRadius: 999,
          }}
        >
          {tile.verdict === "bear" ? "Bearish" : tile.verdict === "bull" ? "Bullish" : "Neutral"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        {tile.signals.map((sig) => (
          <div key={sig.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: sentColor(sig.sent), flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11.5, color: "var(--qc-ink)" }}>{sig.label}</span>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: sentColor(sig.sent) }}>{sig.value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--qc-hair-2)", paddingTop: 8 }}>
        <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>{tile.signalCount} signals</span>
        <b style={{ fontSize: 11, fontWeight: 500, color: "var(--qc-ink)" }}>{tile.footNote}</b>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function MarketViewCard() {

  const narrativeTags = [
    { label: "Trend down",       color: sentColor("bear") },
    { label: "Weak breadth",     color: sentColor("bear") },
    { label: "Rich valuations",  color: sentColor("neu") },
    { label: "Macro supportive", color: sentColor("bull") },
  ];

  return (
    <SectionShell>
      <SectionLabel>Market View</SectionLabel>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: 14 }}>

        {/* Left: sentiment hero */}
        <section
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 18,
            padding: "16px 20px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <MonoEyebrow>6-framework consensus · Today</MonoEyebrow>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 999,
                background: "var(--qc-down-soft, #FDECEA)",
                border: "1px solid #F0C0BB",
                color: "var(--qc-down, #B23A2F)",
                fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--qc-down, #B23A2F)", display: "inline-block" }} />
              Cautious · Bearish bias
            </span>
          </div>

          {/* Gauge + context */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }} aria-label="Market sentiment gauge">
              <svg viewBox="0 0 160 100" width="150" height="94">
                <defs>
                  <linearGradient id="mvGaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="var(--qc-down, #B23A2F)" />
                    <stop offset="50%"  stopColor="var(--qc-warn, #B4731A)" />
                    <stop offset="100%" stopColor="var(--qc-up, #1F7A4A)" />
                  </linearGradient>
                </defs>
                <path d="M 15 85 A 65 65 0 0 1 145 85" stroke="var(--qc-hair-2, #EFEDE7)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M 15 85 A 65 65 0 0 1 145 85" stroke="url(#mvGaugeGrad)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="204" strokeDashoffset="0" opacity=".28" />
                <g transform={`rotate(${needleAngle} 80 85)`}>
                  <line x1="80" y1="85" x2="80" y2="28" stroke="var(--qc-ink, #0E0E0C)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="80" cy="85" r="5" fill="var(--qc-ink, #0E0E0C)" />
                </g>
              </svg>
              <div style={{ textAlign: "center", marginTop: -8 }}>
                <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--qc-ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {SENTIMENT_SCORE}<span style={{ fontSize: 12, color: "var(--qc-ink-2)", fontWeight: 400 }}>/100</span>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--qc-ink-2)", marginTop: 4 }}>
                  Sentiment
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--qc-ink)", lineHeight: 1.3 }}>
                {FW.bear >= 4
                  ? `${FW.bear} of six frameworks read bearish.`
                  : FW.bull >= 4
                  ? `${FW.bull} of six frameworks read bullish.`
                  : "Market signals are mixed across frameworks."}
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--qc-ink)", lineHeight: 1.55 }}>
                {FW.bear >= 3
                  ? "Price structure, momentum, breadth and valuation are all flashing caution. Only macro and policy offer a partial offset. Capital flows are mixed, with FII selling and DII buying."
                  : "Signals are mixed — check individual framework tiles below for detail."}
              </p>
            </div>
          </div>

          {/* Split: bull / neutral / bear */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              borderTop: "1px solid var(--qc-hair-2)", paddingTop: 14, gap: 8,
            }}
          >
            {(["bull", "neu", "bear"] as Sent[]).map((sent) => (
              <div key={sent}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: sentColor(sent), flexShrink: 0 }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--qc-ink-2)" }}>
                    {sent === "bull" ? "Bullish" : sent === "bear" ? "Bearish" : "Neutral"}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--qc-ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {FW[sent]}<span style={{ fontSize: 13, color: "var(--qc-ink-2)", fontWeight: 400 }}>/6</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--qc-ink-2)", marginTop: 3 }}>{fwSubLabel(sent)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: narrative sidebar */}
        <NarrativeSidebar
          eyebrow="What the market says"
          headline="A classic late-cycle mix: rich valuations, weak breadth, decent macro."
          body="With price below SMA 200, shrinking leadership, and earnings getting downgraded, the market is digesting gains. Strong macro prevents a deeper drawdown but doesn't justify fresh aggression."
          tags={narrativeTags}
        />
      </div>

      {/* Framework grid */}
      <MonoEyebrow style={{ margin: "4px 0 10px" }}>Framework readings</MonoEyebrow>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {TILES.map((tile) => <MvTile key={tile.name} tile={tile} />)}
      </div>

      {/* Signal tally */}
      <div
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 14,
          padding: "14px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}>
            Signal tally · across 6 frameworks
          </h4>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "var(--qc-ink-2)", letterSpacing: ".08em" }}>
            {TALLY_TOTAL} readings · weight-neutral
          </span>
        </div>

        <div
          style={{ display: "flex", height: 36, borderRadius: 8, overflow: "hidden", gap: 2, marginBottom: 12 }}
          role="img"
          aria-label={`${TALLY.bear} bearish, ${TALLY.neu} neutral, ${TALLY.bull} bullish signals`}
        >
          {TALLY.bear > 0 && (
            <div style={{ flex: TALLY.bear, background: "var(--qc-down, #B23A2F)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", color: "#fff", fontSize: 11, fontWeight: 500, minWidth: 0 }}>
              <span>Bearish</span><b>{TALLY.bear}</b>
            </div>
          )}
          {TALLY.neu > 0 && (
            <div style={{ flex: TALLY.neu, background: "var(--qc-warn, #B4731A)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", color: "#fff", fontSize: 11, fontWeight: 500, minWidth: 0 }}>
              <span>Neutral</span><b>{TALLY.neu}</b>
            </div>
          )}
          {TALLY.bull > 0 && (
            <div style={{ flex: TALLY.bull, background: "var(--qc-up, #1F7A4A)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", color: "#fff", fontSize: 11, fontWeight: 500, minWidth: 0 }}>
              <span>Bullish</span><b>{TALLY.bull}</b>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {TILES.map((tile) => {
            const bear = tile.signals.filter(s => s.sent === "bear").length;
            const neu  = tile.signals.filter(s => s.sent === "neu").length;
            const bull = tile.signals.filter(s => s.sent === "bull").length;
            return (
              <div
                key={tile.name}
                style={{
                  borderLeft: `3px solid ${sentColor(tile.verdict)}`,
                  paddingLeft: 8,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--qc-ink)", marginBottom: 2 }}>{tile.shortName}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--qc-ink)" }}>
                  {bear}<span style={{ color: "var(--qc-ink-2)" }}>·{neu}·{bull}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
