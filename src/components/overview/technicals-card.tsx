"use client";

import type { TechnicalsResponse } from "@/types/technicals";
import { SectionShell, SectionLabel, MonoEyebrow } from "./primitives";
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function humanize(val: string | null | undefined): string {
  if (!val) return "—";
  return val.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function signalSentiment(signal: string | null | undefined): "up" | "down" | "neutral" {
  if (!signal) return "neutral";
  const s = signal.toUpperCase();
  if (
    s.includes("UPTREND") || s.includes("STRONG") || s.includes("OUTPERFORM") ||
    s.includes("OVERSOLD") || s.includes("BULLISH") || s.includes("ABOVE") ||
    s.includes("BUY") || s.includes("MARK-UP") || s.includes("ACCUMULATION")
  ) return "up";
  if (
    s.includes("DOWNTREND") || s.includes("WEAK") || s.includes("UNDERPERFORM") ||
    s.includes("OVERBOUGHT") || s.includes("BEARISH") || s.includes("BELOW") ||
    s.includes("SELL") || s.includes("MARK-DOWN") || s.includes("DISTRIBUTION")
  ) return "down";
  return "neutral";
}

function sentColor(s: "up" | "down" | "neutral"): string {
  if (s === "up") return "var(--qc-up, #1F7A4A)";
  if (s === "down") return "var(--qc-down, #B23A2F)";
  return "var(--qc-ink)";
}

function sentBg(s: "up" | "down" | "neutral"): string {
  if (s === "up") return "var(--qc-up-soft, #EAF4EE)";
  if (s === "down") return "var(--qc-down-soft, #FDECEA)";
  return "var(--qc-warn-soft, #FEF3E2)";
}

function fp(val: number | null | undefined): string {
  if (val == null) return "—";
  return `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// ─── Compact State Card ───────────────────────────────────────────────────────

interface StateCardRow {
  label: string;
  value: string;
  valueSentiment?: "up" | "down" | "neutral";
  barPct?: number; // 0–100, renders a position-indicator bar when present
}

interface StateCardProps {
  label: string;
  verdict: string;
  verdictSentiment: "up" | "down" | "neutral";
  rows: StateCardRow[];
  description: string;
}

function StateCard({ label, verdict, verdictSentiment, rows, description }: StateCardProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Label + verdict pill — both nowrap to prevent wrapping */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--qc-font-mono)",
              fontSize: "var(--qc-fz-10)",
              letterSpacing: "var(--qc-track-eyebrow-l)",
              color: "var(--qc-ink)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "var(--qc-font-sans)",
              fontSize: "var(--qc-fz-10)",
              fontWeight: "var(--qc-w-semi)",
              padding: "3px 8px",
              borderRadius: 4,
              background: sentBg(verdictSentiment),
              color: sentColor(verdictSentiment),
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {verdict}
          </span>
        </div>

        {/* Data rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4, minWidth: 0, marginBottom: row.barPct != null ? 5 : 0 }}>
                <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-2)", flexShrink: 0 }}>{row.label}</span>
                <span
                  style={{
                    fontFamily: "var(--qc-font-mono)",
                    fontSize: "var(--qc-fz-12)",
                    fontWeight: "var(--qc-w-medium)",
                    color: row.valueSentiment ? sentColor(row.valueSentiment) : "var(--qc-ink)",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "right",
                  }}
                >
                  {row.value}
                </span>
              </div>
              {row.barPct != null && (
                <div style={{ position: "relative", height: 4, background: "var(--qc-chip, #F2F1EC)", borderRadius: 999 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${row.barPct}%`,
                      background: row.valueSentiment ? sentColor(row.valueSentiment) : sentColor(verdictSentiment),
                      borderRadius: 999,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `clamp(4px, ${row.barPct}%, calc(100% - 4px))`,
                      transform: "translate(-50%, -50%)",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--qc-card)",
                      border: `2px solid ${row.valueSentiment ? sentColor(row.valueSentiment) : sentColor(verdictSentiment)}`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Separator + description clamped to 2 lines with tooltip */}
        <div style={{ borderTop: "1px solid var(--qc-hair-2)", paddingTop: 8 }}>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--qc-font-sans)",
                  fontSize: "var(--qc-fz-11)",
                  color: "var(--qc-ink-2)",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  cursor: "default",
                }}
              >
                {description}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom" style={{ maxWidth: 220 }}>
              {description}
            </TooltipContent>
          </TooltipRoot>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Price Levels Bar ─────────────────────────────────────────────────────────

interface PriceLevelMarker {
  label: string;
  subLabel?: string;
  value: number;
  style: "cmp" | "sma" | "support" | "resistance" | "range-high" | "range-low" | "atl" | "ath";
  side: "top" | "bottom";
}

// Spread label X positions so no two labels on the same side overlap.
// Labels start at their true dot X, then are nudged apart if within MIN_LABEL_GAP SVG units.
const MIN_LABEL_GAP = 80; // minimum horizontal gap between label centres

function spreadLabelPositions(
  markers: (PriceLevelMarker & { dotX: number })[],
): (PriceLevelMarker & { dotX: number; labelX: number })[] {
  // Sort by dotX so we nudge left→right
  const sorted = [...markers].map((m) => ({ ...m, labelX: m.dotX }));
  sorted.sort((a, b) => a.dotX - b.dotX);

  // Forward pass: push right if too close to previous
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    if (sorted[i].labelX - prev.labelX < MIN_LABEL_GAP) {
      sorted[i].labelX = prev.labelX + MIN_LABEL_GAP;
    }
  }
  // Backward pass: pull left if we overshot the right edge (clamp is handled per-render)
  for (let i = sorted.length - 2; i >= 0; i--) {
    const next = sorted[i + 1];
    if (next.labelX - sorted[i].labelX < MIN_LABEL_GAP) {
      sorted[i].labelX = next.labelX - MIN_LABEL_GAP;
    }
  }

  return sorted;
}

function markerDotStyle(style: PriceLevelMarker["style"]): { bg: string; border: string; size: number } {
  switch (style) {
    case "cmp":        return { bg: "#0F172B",              border: "#0F172B",              size: 14 };
    case "support":    return { bg: "var(--qc-card)",       border: "var(--qc-up)",         size: 11 };
    case "resistance": return { bg: "var(--qc-card)",       border: "var(--qc-down)",       size: 11 };
    case "range-high": return { bg: "var(--qc-card)",       border: "var(--qc-warn)",       size: 11 };
    case "range-low":  return { bg: "var(--qc-card)",       border: "var(--qc-ink-2)",      size: 11 };
    case "atl":        return { bg: "var(--qc-card)",       border: "var(--qc-ink-2)",      size: 9  };
    case "ath":        return { bg: "var(--qc-card)",       border: "var(--qc-down)",       size: 11 };
    default:           return { bg: "var(--qc-card)",       border: "var(--qc-blue)",       size: 9  };
  }
}

function labelColor(style: PriceLevelMarker["style"]): string {
  switch (style) {
    case "cmp":        return "#0F172B";
    case "support":    return "var(--qc-up)";
    case "resistance":
    case "ath":        return "var(--qc-down)";
    case "range-high": return "var(--qc-warn)";
    default:           return "var(--qc-ink-2)";
  }
}

// Fixed SVG geometry — labels always sit at a fixed distance from the bar
const W = 1000;
const PAD = 60;           // horizontal inset so edge labels don't clip
const BAR_Y = 120;        // bar sits at a fixed vertical centre
const TOP_LABEL_Y = 20;   // top edge of all top-side label boxes (price + pill)
const BOT_LABEL_Y = 160;  // top edge of all bottom-side label boxes
const LABEL_H = 46;       // foreignObject height
const TOTAL_H = BOT_LABEL_Y + LABEL_H + 16;

function PriceLevelsBar({
  markers,
  rangeMin,
  rangeMax,
  atl,
  ath,
  atlDate,
  athDate,
}: {
  markers: PriceLevelMarker[];
  rangeMin: number;
  rangeMax: number;
  atl?: number;
  ath?: number;
  atlDate?: string;
  athDate?: string;
}) {
  const low = atl ?? rangeMin;
  const high = ath ?? rangeMax;
  const span = high - low;
  if (span <= 0) return null;

  const barW = W - PAD * 2;
  const toPct = (v: number) => Math.max(0, Math.min(100, ((v - low) / span) * 100));
  const toX = (v: number) => PAD + (toPct(v) * barW) / 100;

  // Attach dotX to each marker, then spread label positions per side
  const withDotX = markers.map((m) => ({ ...m, dotX: toX(m.value) }));
  const topSpread = spreadLabelPositions(withDotX.filter((m) => m.side === "top"));
  const botSpread = spreadLabelPositions(withDotX.filter((m) => m.side === "bottom"));

  // Clamp label centres so they stay within the SVG width
  const clampLX = (lx: number) => Math.max(PAD, Math.min(W - PAD, lx));

  const allSpread = [...topSpread, ...botSpread];

  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 12,
        padding: "16px 20px 12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <MonoEyebrow>Price Levels · All-Time Scale</MonoEyebrow>
        <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)" }}>
          {atl != null && `ATL ${fp(atl)}${atlDate ? ` (${atlDate})` : ""}`}
          {atl != null && ath != null && " · "}
          {ath != null && `ATH ${fp(ath)}${athDate ? ` (${athDate})` : ""}`}
          {" · Dots placed proportionally on price scale"}
        </span>
      </div>

      {/* SVG chart */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${TOTAL_H}`}
          style={{ display: "block", margin: "0 auto" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="plBarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#D9E8B3" />
              <stop offset="50%"  stopColor="#F3E4C3" />
              <stop offset="100%" stopColor="#F0D3C9" />
            </linearGradient>
          </defs>

          {/* Bar track */}
          <rect x={PAD} y={BAR_Y - 3} width={barW} height="6" rx="3" fill="url(#plBarGrad)" />

          {/* ATL / ATH edge labels */}
          {atl != null && (
            <g>
              <text x={PAD} y={BAR_Y + 16} fontSize="9" fontWeight="600" fill="var(--qc-down, #B23A2F)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">ATL</text>
              {atlDate && <text x={PAD} y={BAR_Y + 27} fontSize="8" fill="var(--qc-ink-2)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">{atlDate}</text>}
            </g>
          )}
          {ath != null && (
            <g>
              <text x={PAD + barW} y={BAR_Y + 16} fontSize="9" fontWeight="600" fill="var(--qc-down, #B23A2F)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">ATH</text>
              {athDate && <text x={PAD + barW} y={BAR_Y + 27} fontSize="8" fill="var(--qc-ink-2)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">{athDate}</text>}
            </g>
          )}

          {/* Markers: dot on bar + slanted dashed connector + label at fixed row */}
          {allSpread.map((m, i) => {
            const dotX = m.dotX;
            const labelX = clampLX(m.labelX);
            const ds = markerDotStyle(m.style);
            const r = ds.size / 2;
            const color = labelColor(m.style);
            const isCmp = m.style === "cmp";

            // Connector: from dot edge → label anchor
            const isTop = m.side === "top";
            const dotY = BAR_Y + (isTop ? -r : r);
            const labelAnchorY = isTop ? TOP_LABEL_Y + LABEL_H : BOT_LABEL_Y;

            return (
              <g key={i}>
                {/* Slanted dashed connector from dot to label */}
                <line
                  x1={dotX} y1={dotY}
                  x2={labelX} y2={labelAnchorY}
                  stroke={color} strokeWidth="1.2"
                  strokeDasharray="3 3" opacity="0.5"
                />

                {/* Dot on bar */}
                <circle cx={dotX} cy={BAR_Y} r={r} fill={ds.bg} stroke={ds.border} strokeWidth={isCmp ? 2.5 : 1.8} />
                {isCmp && (
                  <circle cx={dotX} cy={BAR_Y} r={r + 3} fill="none" stroke="#0F172B" strokeWidth="1" opacity="0.18" />
                )}

                {/* Label box at fixed row, centred on labelX */}
                <foreignObject
                  x={labelX - 38}
                  y={isTop ? TOP_LABEL_Y : BOT_LABEL_Y}
                  width="76"
                  height={LABEL_H}
                  style={{ overflow: "visible" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{
                      fontFamily: "var(--qc-font-mono)",
                      fontSize: "var(--qc-fz-11)",
                      fontWeight: isCmp ? "var(--qc-w-bold)" : "var(--qc-w-medium)",
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                      background: isCmp ? "#0F172B" : "transparent",
                      color: isCmp ? "#fff" : "var(--qc-ink)",
                      padding: isCmp ? "1px 6px" : "0",
                      borderRadius: isCmp ? 4 : 0,
                    }}>
                      {fp(m.value)}
                    </span>
                    <span style={{
                      fontFamily: "var(--qc-font-mono)",
                      fontSize: "var(--qc-fz-9)",
                      fontWeight: "var(--qc-w-semi)",
                      color,
                      background: "var(--qc-surface, #F5F5F5)",
                      border: `1px solid ${color}`,
                      borderRadius: 3,
                      padding: "1px 5px",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.05em",
                    }}>
                      {m.label}
                    </span>
                    {m.subLabel && (
                      <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", whiteSpace: "nowrap" }}>
                        {m.subLabel}
                      </span>
                    )}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          borderTop: "1px solid var(--qc-hair-2)",
          paddingTop: 8,
          marginTop: 4,
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        {[
          { dot: "#0F172B",           label: "CMP" },
          { dot: "var(--qc-blue)",    label: "SMA 20 / 50 / 100 / 200" },
          { dot: "var(--qc-up)",      label: "Support" },
          { dot: "var(--qc-down)",    label: "Resistance / ATH" },
          { dot: "var(--qc-warn)",    label: "52-Week High" },
          { dot: "var(--qc-ink-2)",   label: "52-Week Low / ATL" },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Render **bold** inline markdown
function InlineMd({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} style={{ color: "var(--qc-ink)", fontWeight: "var(--qc-w-semi)" }}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  data: TechnicalsResponse;
  overviewSummary?: string | null;
}

function buildTechnicalsCard({ data, overviewSummary }: Props) {
  const { supportResistance: sr, movingAverages: ma, price, trend, ruleEngine: re, momentum } = data;

  const cmp = price.cmp;
  const high52w = price.high52w;
  const low52w = price.low52w;
  const ath = price.allTimeHigh ?? high52w;
  const atl = price.allTimeLow ?? low52w;
  const athDate = price.allTimeHighDate ?? null;
  const atlDate = price.allTimeLowDate ?? null;

  const r1 = sr.static.resistance[0] ?? null;
  const s1 = sr.static.support[0] ?? null;

  const adx = trend.adx14;
  const adxLabel = adx >= 25 ? `${adx.toFixed(1)} — Strong` : `${adx.toFixed(1)} — Weak`;
  const trendQuality = re?.trendEngine?.trendQuality ?? null;
  const diLabel = trendQuality?.condition
    ? humanize(trendQuality.condition)
    : adx >= 25 ? "Bears dominant" : null;
  const mfiValue = momentum.macd?.histogram ?? null;
  const mfiLabel = mfiValue != null
    ? (mfiValue > 0 ? "Positive flow" : "Negative flow")
    : null;

  const rsiValue = re?.timingEngine?.momentum?.rsi ?? momentum.rsi.value;
  const rsiZone = re?.timingEngine?.momentum?.rsiZone ?? momentum.rsi.zone ?? "Neutral";
  const macdCross = momentum.macd?.crossover ?? null;
  const stochastic = momentum.stochastic ?? null;
  const stochLabel = stochastic ? `${stochastic.k.toFixed(0)} — ${humanize(stochastic.signal)}` : "—";

  const rsVsNiftySignal = re?.dominanceEngine?.leadership?.vsNifty?.signal ?? null;
  const rsVsSectorSignal = re?.dominanceEngine?.leadership?.vsSector?.signal ?? null;

  const structureZone = re?.structureEngine?.priceStructure?.zone
    ? humanize(re.structureEngine.priceStructure.zone)
    : "—";
  const structureSentiment = signalSentiment(re?.structureEngine?.priceStructure?.zone);
  const wyckoff = re?.structureEngine?.marketStructure?.wyckoffPhase ?? null;

  const aboveSMA50 = ma.pricePosition.aboveSMA50;
  const aboveSMA200 = ma.pricePosition.aboveSMA200;

  const trendSentiment = signalSentiment(trend.direction);
  const rsSentiment = signalSentiment(rsVsNiftySignal ?? data.signals.overall);

  const summary = overviewSummary ?? re?.decisionContext?.summary ?? data.insights[0] ?? "";

  const structureDesc =
    `Price sits ${aboveSMA200 ? "above" : "below"} SMA 200${wyckoff ? ` in ${humanize(wyckoff)} phase` : ""}. ` +
    (aboveSMA50 ? "SMA 50 holding as support." : "No SMA 50 support yet.");

  const trendDesc =
    `ADX ${adx >= 25 ? "above 25 confirms active trend" : "below 25 — weak trend"}. ` +
    (mfiLabel ? `Money flow: ${mfiLabel.toLowerCase()}.` : "");

  const timingDesc =
    `RSI at ${rsiValue.toFixed(0)} is ${rsiValue > 70 ? "overbought" : rsiValue < 30 ? "oversold" : "neither overbought nor oversold"}. ` +
    (macdCross ? `MACD ${humanize(macdCross).toLowerCase()} signals near-term ${macdCross.toLowerCase().includes("bull") ? "strength" : "weakness"}.` : "");

  const rsDesc =
    `Lagging ${rsSentiment === "up" ? "ahead of" : "both"} broader index${rsVsSectorSignal ? ` and ${humanize(rsVsSectorSignal).toLowerCase()} vs sector` : ""} over 6 months.`;

  const pos52w = Math.round(((cmp - low52w) / (high52w - low52w || 1)) * 100);
  // ADX bar: 0–50 scale, cap at 100
  const adxBarPct = Math.min(100, (adx / 50) * 100);
  // RSI bar: 0–100 directly
  const rsiBarPct = Math.min(100, Math.max(0, rsiValue));
  // RS bar: signals → approximate pct (outperform ~75, underperform ~25, neutral ~50)
  const rsBarPct = rsSentiment === "up" ? 75 : rsSentiment === "down" ? 20 : 50;

  const stateCards = [
    {
      label: "Structure",
      verdict: structureZone,
      verdictSentiment: structureSentiment,
      rows: [
        {
          label: "52W Position",
          value: `Mid (${pos52w}%)`,
          valueSentiment: pos52w > 66 ? "up" as const : pos52w < 33 ? "down" as const : "neutral" as const,
          barPct: pos52w,
        },
        {
          label: "vs SMA 50",
          value: `${(((cmp - ma.sma[50]) / ma.sma[50]) * 100).toFixed(1)}%`,
          valueSentiment: aboveSMA50 ? "up" as const : "down" as const,
        },
        {
          label: "vs SMA 200",
          value: `${(((cmp - ma.sma[200]) / ma.sma[200]) * 100).toFixed(1)}%`,
          valueSentiment: aboveSMA200 ? "up" as const : "down" as const,
        },
      ],
      description: structureDesc,
    },
    {
      label: "Trend",
      verdict: humanize(trend.direction),
      verdictSentiment: trendSentiment,
      rows: [
        {
          label: "ADX (14)",
          value: adxLabel,
          valueSentiment: trendSentiment,
          barPct: adxBarPct,
        },
        {
          label: "+DI / −DI",
          value: diLabel ?? "—",
          valueSentiment: diLabel?.includes("Bulls") ? "up" as const : "down" as const,
        },
        {
          label: "MFI (14)",
          value: mfiLabel ?? "—",
          valueSentiment: mfiLabel?.includes("Positive") ? "up" as const : "down" as const,
        },
      ],
      description: trendDesc,
    },
    {
      label: "Timing",
      verdict: rsiZone.replace(/_/g, " "),
      verdictSentiment: "neutral" as const,
      rows: [
        {
          label: "RSI (14)",
          value: `${rsiValue.toFixed(0)} — ${humanize(rsiZone)}`,
          valueSentiment: "neutral" as const,
          barPct: rsiBarPct,
        },
        {
          label: "MACD",
          value: macdCross ? humanize(macdCross) : "—",
          valueSentiment: macdCross?.toLowerCase().includes("bull") ? "up" as const : "down" as const,
        },
        { label: "Stochastic", value: stochLabel },
      ],
      description: timingDesc,
    },
    {
      label: "Rel. Strength",
      verdict: humanize(rsVsNiftySignal ?? data.signals.overall),
      verdictSentiment: rsSentiment,
      rows: [
        {
          label: "vs Nifty 50",
          value: re?.dominanceEngine?.leadership?.vsNifty?.signal
            ? humanize(re.dominanceEngine.leadership.vsNifty.signal)
            : "—",
          valueSentiment: rsSentiment,
          barPct: rsBarPct,
        },
        {
          label: "vs Nifty IT",
          value: re?.dominanceEngine?.leadership?.vsSector?.signal
            ? humanize(re.dominanceEngine.leadership.vsSector.signal)
            : "—",
          valueSentiment: signalSentiment(rsVsSectorSignal),
        },
        {
          label: "RS Rank",
          value: data.signals.components?.trend != null
            ? `${data.signals.components.trend} / 100`
            : data.signals.score != null ? `${data.signals.score} / 100` : "—",
        },
      ],
      description: rsDesc,
    },
  ];

  // Build price level markers
  const markers: PriceLevelMarker[] = [
    { label: "CMP",      value: cmp,        style: "cmp" as const,        side: "top" as const },
    { label: "52W Low",  value: low52w,     style: "range-low" as const,  side: "top" as const,    subLabel: price.low52wDate ?? undefined },
    { label: "52W High", value: high52w,    style: "range-high" as const, side: "top" as const,    subLabel: price.high52wDate ?? undefined },
    { label: "SMA 20",   value: ma.sma[20], style: "sma" as const,        side: "bottom" as const },
    { label: "SMA 50",   value: ma.sma[50], style: "sma" as const,        side: "top" as const },
    { label: "SMA 100",  value: ma.sma[100],style: "sma" as const,        side: "bottom" as const },
    { label: "SMA 200",  value: ma.sma[200],style: "sma" as const,        side: "bottom" as const },
    ...(r1 != null ? [{ label: "R1", value: r1, style: "resistance" as const, side: "bottom" as const }] : []),
    ...(s1 != null ? [{ label: "S1", value: s1, style: "support" as const,    side: "bottom" as const }] : []),
  ].filter((m, i, arr) =>
    arr.findIndex((x) => Math.abs(x.value - m.value) < 1) === i
  );

  return {
    card: (
      <SectionShell>
        {summary ? (
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-11)",
                letterSpacing: "var(--qc-track-eyebrow-l)",
                textTransform: "uppercase",
                color: "var(--qc-ink)",
                marginBottom: 8,
              }}
            >
              Technicals
            </div>
            <p style={{ margin: 0, fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-ink)", lineHeight: 1.6 }}>
              {overviewSummary ? <InlineMd text={summary} /> : summary}
            </p>
          </div>
        ) : (
          <SectionLabel>Technicals</SectionLabel>
        )}

        {/* 4-column state cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 10, minWidth: 0 }}>
          {stateCards.map((card) => (
            <StateCard key={card.label} {...card} />
          ))}
        </div>
      </SectionShell>
    ),
    priceLevels: (
      <PriceLevelsBar
        markers={markers}
        rangeMin={low52w}
        rangeMax={high52w}
        atl={atl}
        ath={ath}
        atlDate={atlDate ?? undefined}
        athDate={athDate ?? undefined}
      />
    ),
  };
}

export function TechnicalsCard({ data, overviewSummary }: Props) {
  return buildTechnicalsCard({ data, overviewSummary }).card;
}

export function PriceLevelsSection({ data, overviewSummary }: Props) {
  return buildTechnicalsCard({ data, overviewSummary }).priceLevels;
}
