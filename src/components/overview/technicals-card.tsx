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
        }}
      >
        {/* Label + verdict pill — both nowrap to prevent wrapping */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: ".12em",
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
              fontSize: 10,
              fontWeight: 600,
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: row.barPct != null ? 5 : 0 }}>
                <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>{row.label}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: row.valueSentiment ? sentColor(row.valueSentiment) : "var(--qc-ink)",
                    fontVariantNumeric: "tabular-nums",
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
                  fontSize: 11,
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

const CLUSTER_PCT = 3.5; // markers within this % are "close"

function assignLabelRows(markers: PriceLevelMarker[], toPct: (v: number) => number): (PriceLevelMarker & { row: number })[] {
  const sorted = [...markers].sort((a, b) => toPct(a.value) - toPct(b.value));
  const result: (PriceLevelMarker & { row: number })[] = [];
  // greedily assign rows so no two same-row labels are within CLUSTER_PCT
  for (const m of sorted) {
    const pct = toPct(m.value);
    let row = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const conflict = result.find(
        (r) => r.side === m.side && r.row === row && Math.abs(toPct(r.value) - pct) < CLUSTER_PCT
      );
      if (!conflict) break;
      row++;
    }
    result.push({ ...m, row });
  }
  return result;
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

// Label box: value line ~14px + pill ~16px + optional subLabel ~12px = ~42px total
// STEM_GAP: gap between dot edge and start of stem line
// ROW_STEP: distance from bar centre to label box edge (top of bottom label / bottom of top label)
const LABEL_H = 46;    // foreignObject height (value + pill + optional subLabel)
const STEM_GAP = 6;    // px gap between dot edge and stem start
const ROW_STEP = LABEL_H + 14; // stem length ~14px between label bottom and bar
const BAR_EDGE_MARGIN = 28;    // extra space at top for ATL/ATH date text

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

  const toPct = (v: number) => Math.max(0, Math.min(100, ((v - low) / span) * 100));

  const withRows = assignLabelRows(markers, toPct);
  const topMarkers = withRows.filter((m) => m.side === "top");
  const bottomMarkers = withRows.filter((m) => m.side === "bottom");
  const maxTopRow = topMarkers.length > 0 ? topMarkers.reduce((mx, m) => Math.max(mx, m.row), 0) : -1;
  const maxBottomRow = bottomMarkers.length > 0 ? bottomMarkers.reduce((mx, m) => Math.max(mx, m.row), 0) : -1;

  // barY: enough room above for all top label rows + ATL/ATH date text
  const barY = BAR_EDGE_MARGIN + (maxTopRow + 1) * ROW_STEP;
  // totalHeight: bar + all bottom label rows + bottom padding
  const totalHeight = barY + (maxBottomRow + 1) * ROW_STEP + LABEL_H + 16;

  // For top labels: label box bottom edge is at barY - stemLength, top edge is LABEL_H above that
  // For bottom labels: label box top edge is at barY + stemLength
  const STEM_LEN = 14; // px from dot edge to label box edge

  // Returns the Y of the TOP edge of the label foreignObject
  const labelBoxTop = (side: "top" | "bottom", row: number, dotRadius: number): number => {
    if (side === "top") {
      // label box bottom = barY - dotRadius - STEM_GAP - STEM_LEN - row*(LABEL_H + STEM_LEN)
      const boxBottom = barY - dotRadius - STEM_GAP - STEM_LEN - row * ROW_STEP;
      return boxBottom - LABEL_H;
    } else {
      // label box top = barY + dotRadius + STEM_GAP + STEM_LEN + row*(LABEL_H + STEM_LEN)
      return barY + dotRadius + STEM_GAP + STEM_LEN + row * ROW_STEP;
    }
  };

  const stemStart = (side: "top" | "bottom", dotRadius: number): number =>
    side === "top" ? barY - dotRadius - STEM_GAP : barY + dotRadius + STEM_GAP;

  const stemEnd = (side: "top" | "bottom", row: number, dotRadius: number): number => {
    if (side === "top") {
      return labelBoxTop(side, row, dotRadius) + LABEL_H + 2; // just below label box bottom
    } else {
      return labelBoxTop(side, row, dotRadius) - 2; // just above label box top
    }
  };

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
        <span style={{ fontSize: 10, color: "var(--qc-ink-2)", fontFamily: "'IBM Plex Mono', monospace" }}>
          {atl != null && `ATL ${fp(atl)}${atlDate ? ` (${atlDate})` : ""}`}
          {atl != null && ath != null && " · "}
          {ath != null && `ATH ${fp(ath)}${athDate ? ` (${athDate})` : ""}`}
          {" · Dots placed proportionally on price scale"}
        </span>
      </div>

      {/* SVG chart — PAD keeps dots/labels inset so edges never clip */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {(() => {
          const PAD = 40; // horizontal padding in SVG units on each side
          const W = 1000;
          const barW = W - PAD * 2;
          // map price % → SVG x within padded bar
          const toX = (v: number) => PAD + toPct(v) * barW / 100;

          return (
            <svg
              width="100%"
              viewBox={`0 0 ${W} ${totalHeight}`}
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
              <rect x={PAD} y={barY - 3} width={barW} height="6" rx="3" fill="url(#plBarGrad)" />

              {/* Markers: dot + connector line + label */}
              {withRows.map((m, i) => {
                const x = toX(m.value);
                const ds = markerDotStyle(m.style);
                const r = ds.size / 2;
                const color = labelColor(m.style);
                const isCmp = m.style === "cmp";
                const boxTop = labelBoxTop(m.side, m.row, r);

                return (
                  <g key={i}>
                    {/* Dashed stem */}
                    <line
                      x1={x} y1={stemStart(m.side, r)}
                      x2={x} y2={stemEnd(m.side, m.row, r)}
                      stroke={color} strokeWidth="1.2"
                      strokeDasharray="3 3" opacity="0.6"
                    />

                    {/* Dot */}
                    <circle cx={x} cy={barY} r={r} fill={ds.bg} stroke={ds.border} strokeWidth={isCmp ? 2.5 : 1.8} />
                    {isCmp && (
                      <circle cx={x} cy={barY} r={r + 3} fill="none" stroke="#0F172B" strokeWidth="1" opacity="0.18" />
                    )}

                    {/* Label: value + pill tag */}
                    <foreignObject x={x - 38} y={boxTop} width="76" height={LABEL_H} style={{ overflow: "visible" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span style={{
                          fontSize: 11, fontWeight: isCmp ? 700 : 500,
                          fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                          background: isCmp ? "#0F172B" : "transparent",
                          color: isCmp ? "#fff" : "var(--qc-ink)",
                          padding: isCmp ? "1px 6px" : "0",
                          borderRadius: isCmp ? 4 : 0,
                        }}>
                          {fp(m.value)}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 600, color,
                          background: "var(--qc-surface, #F5F5F5)",
                          border: `1px solid ${color}`,
                          borderRadius: 3, padding: "1px 5px",
                          whiteSpace: "nowrap",
                          fontFamily: "'IBM Plex Mono', monospace",
                          letterSpacing: "0.05em",
                        }}>
                          {m.label}
                        </span>
                        {m.subLabel && (
                          <span style={{ fontSize: 8.5, color: "var(--qc-ink-2)", whiteSpace: "nowrap" }}>
                            {m.subLabel}
                          </span>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* ATL edge label (left, below bar) */}
              {atl != null && (
                <g>
                  {atlDate && <text x={PAD} y={barY - 8} fontSize="8" fill="var(--qc-ink-2)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">{atlDate}</text>}
                  <text x={PAD} y={barY + 16} fontSize="9" fontWeight="600" fill="var(--qc-down, #B23A2F)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">ATL</text>
                </g>
              )}
              {/* ATH edge label (right, below bar) */}
              {ath != null && (
                <g>
                  {athDate && <text x={PAD + barW} y={barY - 8} fontSize="8" fill="var(--qc-ink-2)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">{athDate}</text>}
                  <text x={PAD + barW} y={barY + 16} fontSize="9" fontWeight="600" fill="var(--qc-down, #B23A2F)" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle">ATH</text>
                </g>
              )}
            </svg>
          );
        })()}
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
            <span style={{ fontSize: 10, color: "var(--qc-ink-2)" }}>{label}</span>
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
          <strong key={i} style={{ color: "var(--qc-ink)", fontWeight: 600 }}>{p.slice(2, -2)}</strong>
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
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--qc-ink)",
                marginBottom: 8,
              }}
            >
              Technicals
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--qc-ink)", lineHeight: 1.6 }}>
              {overviewSummary ? <InlineMd text={summary} /> : summary}
            </p>
          </div>
        ) : (
          <SectionLabel>Technicals</SectionLabel>
        )}

        {/* 4-column state cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
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
