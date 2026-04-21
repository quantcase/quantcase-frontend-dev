"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

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
    <div className="mv-tile">
      <div className="mv-tile-head">
        <div>
          <div className="mv-tile-name">{tile.name}</div>
          <div className="mv-tile-tf">{tile.tf}</div>
        </div>
        <span className={`mv-tile-verdict ${tile.verdict}`}>{tile.verdict === "bear" ? "Bearish" : tile.verdict === "bull" ? "Bullish" : "Neutral"}</span>
      </div>
      <div className="mv-tile-readings">
        {tile.signals.map((sig) => (
          <div key={sig.label} className="mv-tile-reading">
            <span className={`rd ${sig.sent}`} />
            <span className="lbl">{sig.label}</span>
            <span className={`rv ${sig.sent}`}>{sig.value}</span>
          </div>
        ))}
      </div>
      <div className="mv-tile-foot">
        <span>{tile.signalCount} signals</span>
        <b>{tile.footNote}</b>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function MarketViewCard() {
  const bearPct  = Math.round((TALLY.bear / TALLY_TOTAL) * 100);
  const neuPct   = Math.round((TALLY.neu  / TALLY_TOTAL) * 100);
  const bullPct  = 100 - bearPct - neuPct;

  return (
    <div className="mv-section">
      <div className="mv-section-title">Market View</div>

      {/* Hero row */}
      <div className="mv-hero-row">

        {/* Left: sentiment hero */}
        <section className="mv-hero">
          <div className="mv-hero-top">
            <div className="mv-hero-eyebrow">6-framework consensus · Today</div>
            <span className="mv-hero-verdict">
              <span className="dot" />
              Cautious · Bearish bias
            </span>
          </div>

          {/* Gauge + context */}
          <div className="mv-hero-body">
            <div className="mv-gauge" aria-label="Market sentiment gauge">
              <svg viewBox="0 0 160 100" width="170" height="100">
                <defs>
                  <linearGradient id="mvGaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="var(--qc-down, #B23A2F)" />
                    <stop offset="50%"  stopColor="var(--qc-warn, #B4731A)" />
                    <stop offset="100%" stopColor="var(--qc-up, #1F7A4A)" />
                  </linearGradient>
                </defs>
                <path d="M 15 85 A 65 65 0 0 1 145 85" stroke="var(--qc-border-inner, #EFEDE7)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M 15 85 A 65 65 0 0 1 145 85" stroke="url(#mvGaugeGrad)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="204" strokeDashoffset="0" opacity=".28" />
                <g transform={`rotate(${needleAngle} 80 85)`}>
                  <line x1="80" y1="85" x2="80" y2="28" stroke="var(--qc-text-heading, #0E0E0C)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="80" cy="85" r="5" fill="var(--qc-text-heading, #0E0E0C)" />
                </g>
              </svg>
              <div className="mv-gauge-label">
                <div className="v">{SENTIMENT_SCORE}<span>/100</span></div>
                <div className="k">Sentiment</div>
              </div>
            </div>

            <div className="mv-hero-ctx">
              <h3>
                {FW.bear >= 4
                  ? `${FW.bear} of six frameworks read bearish.`
                  : FW.bull >= 4
                  ? `${FW.bull} of six frameworks read bullish.`
                  : "Market signals are mixed across frameworks."}
              </h3>
              <p>
                {FW.bear >= 3
                  ? "Price structure, momentum, breadth and valuation are all flashing caution. Only macro and policy offer a partial offset. Capital flows are mixed, with FII selling and DII buying. Position defensively until breadth recovers."
                  : "Signals are mixed — check individual framework tiles below for detail."}
              </p>
            </div>
          </div>

          {/* Split: bull / neutral / bear */}
          <div className="mv-split">
            {(["bull", "neu", "bear"] as Sent[]).map((sent) => (
              <div key={sent} className="mv-split-cell">
                <div className="mv-split-head">
                  <span className="mv-split-dot" style={{ background: sentColor(sent) }} />
                  <span className="mv-split-k">{sent === "bull" ? "Bullish" : sent === "bear" ? "Bearish" : "Neutral"}</span>
                </div>
                <div className="mv-split-v">{FW[sent]}<span>/6</span></div>
                <div className="mv-split-sub">{fwSubLabel(sent)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: narrative aside */}
        <aside className="fx-narr">
          <div className="fx-narr-lime" />
          <div className="fx-narr-inner">
            <div className="fx-narr-eyebrow">What the market says</div>
            <div className="fx-narr-title">A classic late-cycle mix: rich valuations, weak breadth, decent macro.</div>
            <p className="fx-narr-body">
              With price below SMA 200, shrinking leadership, and earnings getting downgraded, the market is digesting gains. Strong macro prevents a deeper drawdown but doesn't justify fresh aggression.
            </p>
            <div className="fx-narr-tags">
              {[
                { sent: "bear" as Sent, text: "Trend down" },
                { sent: "bear" as Sent, text: "Weak breadth" },
                { sent: "neu"  as Sent, text: "Rich valuations" },
                { sent: "bull" as Sent, text: "Macro supportive" },
              ].map(({ sent, text }) => (
                <span key={text} className="fx-tag">
                  <span className="d" style={{ background: sentColor(sent) }} />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Framework grid */}
      <div className="mv-fw-eyebrow">Framework readings</div>
      <div className="mv-grid">
        {TILES.map((tile) => <MvTile key={tile.name} tile={tile} />)}
      </div>

      {/* Signal tally */}
      <div className="mv-tally">
        <div className="mv-tally-head">
          <h4>Signal tally · across 6 frameworks</h4>
          <span className="mv-tally-head-sub">{TALLY_TOTAL} readings · weight-neutral</span>
        </div>

        <div className="mv-tally-bar" role="img" aria-label={`${TALLY.bear} bearish, ${TALLY.neu} neutral, ${TALLY.bull} bullish signals`}>
          {TALLY.bear > 0 && (
            <div className="mv-tally-seg" style={{ width: `${bearPct}%`, background: "var(--qc-down, #B23A2F)" }}>
              <span>Bearish</span><b>{TALLY.bear}</b>
            </div>
          )}
          {TALLY.neu > 0 && (
            <div className="mv-tally-seg" style={{ width: `${neuPct}%`, background: "var(--qc-warn, #B4731A)" }}>
              <span>Neutral</span><b>{TALLY.neu}</b>
            </div>
          )}
          {TALLY.bull > 0 && (
            <div className="mv-tally-seg" style={{ width: `${bullPct}%`, background: "var(--qc-up, #1F7A4A)" }}>
              <span>Bullish</span><b>{TALLY.bull}</b>
            </div>
          )}
        </div>

        <div className="mv-tally-legend">
          {TILES.map((tile) => {
            const bear = tile.signals.filter(s => s.sent === "bear").length;
            const neu  = tile.signals.filter(s => s.sent === "neu").length;
            const bull = tile.signals.filter(s => s.sent === "bull").length;
            const borderColor = sentColor(tile.verdict);
            return (
              <div key={tile.name} className="mv-tally-leg" style={{ borderColor }}>
                <div className="k">{tile.shortName}</div>
                <div className="v">{bear}<span>·{neu}·{bull}</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
