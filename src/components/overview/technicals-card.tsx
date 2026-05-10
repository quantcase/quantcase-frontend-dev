"use client";

import type { TechnicalsResponse } from "@/types/technicals";
import { SectionShell, SectionLabel, MonoEyebrow } from "./primitives";

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

interface StateCardProps {
  label: string;
  verdict: string;
  verdictSentiment: "up" | "down" | "neutral";
  rows: { label: string; value: string; valueSentiment?: "up" | "down" | "neutral" }[];
  description: string;
}

function StateCard({ label, verdict, verdictSentiment, rows, description }: StateCardProps) {
  return (
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
      {/* Label + verdict pill */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: ".12em",
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
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
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>{row.label}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: row.valueSentiment
                  ? sentColor(row.valueSentiment)
                  : "var(--qc-ink)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Separator + description */}
      <div
        style={{
          borderTop: "1px solid var(--qc-hair-2)",
          paddingTop: 8,
          fontSize: 11,
          color: "var(--qc-ink-2)",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

// ─── Price Levels Bar ─────────────────────────────────────────────────────────

interface PriceLevelMarker {
  label: string;          // e.g. "CMP", "SMA 200"
  subLabel?: string;      // e.g. date or description
  value: number;
  style: "cmp" | "sma" | "support" | "resistance" | "range-high" | "range-low" | "atl" | "ath";
}

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

  const markerDotStyle = (style: PriceLevelMarker["style"]): { bg: string; border: string; size: number } => {
    switch (style) {
      case "cmp": return { bg: "var(--qc-ink)", border: "var(--qc-ink)", size: 14 };
      case "support": return { bg: "var(--qc-card)", border: "var(--qc-up)", size: 12 };
      case "resistance": return { bg: "var(--qc-card)", border: "var(--qc-down)", size: 12 };
      case "range-high": return { bg: "var(--qc-card)", border: "var(--qc-warn)", size: 12 };
      case "range-low": return { bg: "var(--qc-card)", border: "var(--qc-ink-2)", size: 12 };
      case "atl": return { bg: "var(--qc-card)", border: "var(--qc-ink-2)", size: 10 };
      case "ath": return { bg: "var(--qc-card)", border: "var(--qc-down)", size: 12 };
      default: return { bg: "var(--qc-card)", border: "var(--qc-blue)", size: 10 };
    }
  };

  // Separate markers into top (CMP, SMAs) and bottom (support/resistance labels)
  const sortedMarkers = [...markers].sort((a, b) => a.value - b.value);

  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 12,
        padding: "16px 20px",
        marginTop: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <MonoEyebrow>Price Levels · All-Time to Current</MonoEyebrow>
        <span style={{ fontSize: 11, color: "var(--qc-ink-2)", fontFamily: "'IBM Plex Mono', monospace" }}>
          {atl != null && `ATL ${fp(atl)}`}
          {atl != null && ath != null && " · "}
          {ath != null && `ATH ${fp(ath)}`}
          {" · Range on scale"}
        </span>
      </div>

      {/* Top labels row (ATL, range labels, ATH) */}
      <div style={{ position: "relative", height: 28, marginBottom: 4 }}>
        {/* ATL */}
        {atl != null && (
          <div
            style={{
              position: "absolute",
              left: "0%",
              transform: "translateX(0%)",
              bottom: 0,
              fontSize: 10,
              color: "var(--qc-ink-2)",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontWeight: 500, color: "var(--qc-down, #B23A2F)" }}>ATL</div>
            <div>{fp(atl)}</div>
          </div>
        )}
        {/* ATH */}
        {ath != null && (
          <div
            style={{
              position: "absolute",
              right: "0%",
              transform: "translateX(0%)",
              bottom: 0,
              fontSize: 10,
              color: "var(--qc-ink-2)",
              whiteSpace: "nowrap",
              textAlign: "right",
            }}
          >
            <div style={{ fontWeight: 500, color: "var(--qc-down, #B23A2F)" }}>ATH</div>
            <div>{fp(ath)}</div>
          </div>
        )}
        {/* Dates */}
        {atlDate && (
          <div
            style={{
              position: "absolute",
              left: "0%",
              top: 0,
              fontSize: 9,
              color: "var(--qc-ink-2)",
            }}
          >
            {atlDate}
          </div>
        )}
        {athDate && (
          <div
            style={{
              position: "absolute",
              right: "0%",
              top: 0,
              fontSize: 9,
              color: "var(--qc-ink-2)",
              textAlign: "right",
            }}
          >
            {athDate}
          </div>
        )}
      </div>

      {/* The bar track */}
      <div
        style={{
          position: "relative",
          height: 6,
          background: "linear-gradient(90deg, #D9E8B3 0%, #F3E4C3 50%, #F0D3C9 100%)",
          borderRadius: 999,
          marginBottom: 8,
        }}
      >
        {/* Dots on the bar */}
        {sortedMarkers.map((m, i) => {
          const pct = toPct(m.value);
          const ds = markerDotStyle(m.style);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: `${pct}%`,
                transform: "translate(-50%, -50%)",
                width: ds.size,
                height: ds.size,
                borderRadius: "50%",
                background: ds.bg,
                border: `2px solid ${ds.border}`,
                boxShadow: m.style === "cmp" ? "0 0 0 3px rgba(0,0,0,0.10)" : undefined,
                zIndex: m.style === "cmp" ? 3 : 2,
              }}
            />
          );
        })}
      </div>

      {/* Bottom labels row for each marker */}
      <div style={{ position: "relative", height: 52 }}>
        {sortedMarkers.map((m, i) => {
          const pct = toPct(m.value);
          const ds = markerDotStyle(m.style);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${pct}%`,
                transform: "translateX(-50%)",
                top: 0,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: ds.border,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {m.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--qc-ink)", fontWeight: m.style === "cmp" ? 600 : 400 }}>
                {fp(m.value)}
              </div>
              {m.subLabel && (
                <div style={{ fontSize: 10, color: "var(--qc-ink-2)" }}>{m.subLabel}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          borderTop: "1px solid var(--qc-hair-2)",
          paddingTop: 8,
          marginTop: 8,
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        {[
          { dot: "var(--qc-ink)", label: "CMP" },
          { dot: "var(--qc-blue)", label: "SMA 20 / 50 / 100 / 200" },
          { dot: "var(--qc-up)", label: "Support (S1)" },
          { dot: "var(--qc-down)", label: "Resistance (R1) / ATH" },
          { dot: "var(--qc-warn)", label: "52-Week High" },
          { dot: "var(--qc-ink-2)", label: "52-Week Low / ATL" },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: dot,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, color: "var(--qc-ink-2)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  data: TechnicalsResponse;
}

export function TechnicalsCard({ data }: Props) {
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

  const summary = re?.decisionContext?.summary ?? data.insights[0] ?? "";

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

  const stateCards = [
    {
      label: "Structure",
      verdict: structureZone,
      verdictSentiment: structureSentiment,
      rows: [
        {
          label: "52W Position",
          value: `${Math.round(((cmp - low52w) / (high52w - low52w || 1)) * 100)}%`,
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
        { label: "ADX (14)", value: adxLabel },
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
        { label: "RSI (14)", value: `${rsiValue.toFixed(0)} — ${humanize(rsiZone)}` },
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
        },
        {
          label: "vs Nifty IT",
          value: re?.dominanceEngine?.leadership?.vsSector?.signal
            ? humanize(re.dominanceEngine.leadership.vsSector.signal)
            : "—",
          valueSentiment: signalSentiment(rsVsSectorSignal),
        },
        {
          label: "RS Score",
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
    { label: "CMP", value: cmp, style: "cmp" as const },
    { label: "52W LOW", value: low52w, style: "range-low" as const, subLabel: price.low52wDate ?? undefined },
    { label: "52W HIGH", value: high52w, style: "range-high" as const, subLabel: price.high52wDate ?? undefined },
    { label: "SMA 20", value: ma.sma[20], style: "sma" as const },
    { label: "SMA 50", value: ma.sma[50], style: "sma" as const },
    { label: "SMA 100", value: ma.sma[100], style: "sma" as const },
    { label: "SMA 200", value: ma.sma[200], style: "sma" as const },
    ...(r1 != null ? [{ label: "R1", value: r1, style: "resistance" as const }] : []),
    ...(s1 != null ? [{ label: "S1", value: s1, style: "support" as const }] : []),
  ].filter((m, i, arr) =>
    arr.findIndex((x) => Math.abs(x.value - m.value) < 1) === i
  );

  return (
    <SectionShell>
      <SectionLabel>Technicals</SectionLabel>

      {/* Narrative bar */}
      {summary && (
        <div
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 12.5,
            lineHeight: 1.65,
            color: "var(--qc-ink)",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--qc-ink-2)",
              marginRight: 10,
            }}
          >
            Technicals
          </span>
          {summary}
        </div>
      )}

      {/* 4-column state cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {stateCards.map((card) => (
          <StateCard key={card.label} {...card} />
        ))}
      </div>

      {/* Price Levels bar */}
      <PriceLevelsBar
        markers={markers}
        rangeMin={low52w}
        rangeMax={high52w}
        atl={atl}
        ath={ath}
        atlDate={atlDate ?? undefined}
        athDate={athDate ?? undefined}
      />
    </SectionShell>
  );
}
