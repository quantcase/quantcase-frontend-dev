"use client";

import type { TechnicalsResponse } from "@/types/technicals";

function fp(val: number | null | undefined): string {
  if (val == null) return "—";
  return `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function pctChange(current: number, ref: number | null | undefined): string {
  if (ref == null || ref === 0) return "—";
  const diff = ((current - ref) / ref) * 100;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
}

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

const UP_COLOR = "var(--qc-up, #1F7A4A)";
const DOWN_COLOR = "var(--qc-down, #B23A2F)";
const WARN_COLOR = "var(--qc-warn, #B4731A)";
const BLUE_COLOR = "var(--qc-blue, #3A6BEF)";
const INK = "var(--qc-text-heading, #0E0E0C)";
const INK2 = "var(--qc-text-body, #5A5A54)";
const INK3 = "var(--qc-text-muted, #9A9A92)";
const HAIR = "var(--qc-border-default, #E9E7E1)";
const HAIR2 = "var(--qc-border-inner, #EFEDE7)";
const CARD = "var(--qc-surface-white, #FFFFFF)";
const CHIP = "var(--qc-chip, #F2F1EC)";

// SVG icon paths for state cards
const ICONS = {
  trendUp: "M3 18l6-8 4 5 8-11",
  arrowUpRight: "M7 17L17 7M17 7H9M17 7v8",
  clock: "M12 7v5l3 2",
  cross: "M7 7l10 10M17 7L7 17",
};

interface Props {
  data: TechnicalsResponse;
}

export function TechnicalsCard({ data }: Props) {
  const sr = data.supportResistance;
  const ma = data.movingAverages;
  const price = data.price;
  const trend = data.trend;
  const re = data.ruleEngine;
  const momentum = data.momentum;
  const volatility = data.volatility;

  const cmp = price.cmp;
  const high52w = price.high52w;
  const low52w = price.low52w;

  // Ladder rows
  const r1 = sr.static.resistance[0] ?? null;
  const s1 = sr.static.support[0] ?? null;
  const ath = price.allTimeHigh ?? high52w;

  // 52W range position
  const rangeWidth = high52w - low52w;
  const rangePct = rangeWidth > 0 ? Math.round(((cmp - low52w) / rangeWidth) * 100) : 0;

  // Distance stats
  const distFromATH = ath ? ((cmp - ath) / ath) * 100 : null;
  const distFromS1 = s1 ? ((cmp - s1) / s1) * 100 : null;
  const rrRatio =
    r1 != null && s1 != null && r1 !== cmp && s1 !== cmp
      ? Math.abs((r1 - cmp) / (cmp - s1))
      : null;

  // Verdict label from trend
  const verdictLabel =
    re?.structureEngine.priceStructure.zone
      ? humanize(re.structureEngine.priceStructure.zone)
      : trend.phase
      ? `${humanize(trend.direction)} · ${humanize(trend.phase)}`
      : humanize(trend.direction);
  const verdictSentiment = signalSentiment(trend.direction);

  // State cards
  const structureLabel = re?.structureEngine.priceStructure.zone
    ? humanize(re.structureEngine.priceStructure.zone)
    : "—";
  const structureSub = re?.structureEngine.marketStructure.wyckoffPhase
    ? `${humanize(re.structureEngine.marketStructure.wyckoffPhase)} phase · money flow positive`
    : "Market structure analysis";
  const structureSentiment = signalSentiment(structureLabel);

  const trendLabel = humanize(trend.direction);
  const aboveSMAs = [
    ma.pricePosition.aboveSMA20 ? "SMA 20" : null,
    ma.pricePosition.aboveSMA50 ? "SMA 50" : null,
    price.cmp >= ma.sma[100] ? "SMA 100" : null,
    ma.pricePosition.aboveSMA200 ? "SMA 200" : null,
  ].filter(Boolean);
  const belowSMAs = [
    !ma.pricePosition.aboveSMA20 ? "SMA 20" : null,
    !ma.pricePosition.aboveSMA50 ? "SMA 50" : null,
    price.cmp < ma.sma[100] ? "SMA 100" : null,
    !ma.pricePosition.aboveSMA200 ? "SMA 200" : null,
  ].filter(Boolean);
  const trendSub =
    belowSMAs.length === 0
      ? `Above ${aboveSMAs.join(" · ")}`
      : aboveSMAs.length === 0
      ? `Below ${belowSMAs.join(" · ")}`
      : `Above ${aboveSMAs.join(", ")} · Below ${belowSMAs.join(", ")}`;

  const rsiValue = re?.timingEngine?.momentum?.rsi ?? momentum.rsi.value;
  const rsiZone = re?.timingEngine?.momentum?.rsiZone ?? momentum.rsi.zone ?? "—";
  const rsiSub = `${humanize(momentum.rsi.trend)} · in ${rsiZone.replace(/_/g, "–")} zone`;

  const rsVsNiftySignal = re?.dominanceEngine.leadership.vsNifty.signal ?? null;
  const rsVsSectorSignal = re?.dominanceEngine.leadership.vsSector.signal ?? null;
  const rsLabel = rsVsNiftySignal ? humanize(rsVsNiftySignal) : humanize(data.signals.overall);
  const rsSub = rsVsSectorSignal
    ? `vs Nifty · vs Sector: ${humanize(rsVsSectorSignal)}`
    : "vs Nifty & sector peers";
  const rsSentiment = signalSentiment(rsVsNiftySignal ?? data.signals.overall);

  // SMA rows (4 columns)
  const smas: { label: string; val: number; above: boolean }[] = [
    { label: "SMA 20", val: ma.sma[20], above: ma.pricePosition.aboveSMA20 },
    { label: "SMA 50", val: ma.sma[50], above: ma.pricePosition.aboveSMA50 },
    { label: "SMA 100", val: ma.sma[100], above: cmp >= ma.sma[100] },
    { label: "SMA 200", val: ma.sma[200], above: ma.pricePosition.aboveSMA200 },
  ];

  // RSI track position
  const rsiPct = Math.min(Math.max(rsiValue, 0), 100);

  // Momentum thrust score (use signals score or derive from RSI)
  const momentumScore = data.signals.components?.momentum ?? Math.round(rsiPct * 0.7);
  const momentumLabel = momentumScore > 60 ? "Positive" : momentumScore > 40 ? "Neutral" : "Negative";
  const momentumColor = momentumScore > 60 ? UP_COLOR : momentumScore > 40 ? WARN_COLOR : DOWN_COLOR;

  // Volatility regime
  const bbSqueeze = volatility.bollingerBands.squeeze;
  const volLabel = bbSqueeze ? "Contracting" : "Expanding";
  const volPct = bbSqueeze ? 28 : 65;
  const volColor = bbSqueeze ? WARN_COLOR : UP_COLOR;

  // Narrative tags
  const trendSentiment = signalSentiment(trend.direction);
  const tags: { label: string; color: string }[] = [];
  tags.push({ label: humanize(trend.direction), color: trendSentiment === "up" ? UP_COLOR : trendSentiment === "down" ? DOWN_COLOR : WARN_COLOR });
  if (aboveSMAs.length === 4) tags.push({ label: "Above all SMAs", color: UP_COLOR });
  else if (belowSMAs.length === 4) tags.push({ label: "Below all SMAs", color: DOWN_COLOR });
  if (bbSqueeze) tags.push({ label: "Vol contracting", color: WARN_COLOR });
  tags.push({ label: rsSentiment === "up" ? "Outperforming" : "Underperforming", color: rsSentiment === "up" ? UP_COLOR : DOWN_COLOR });

  // Summary narrative
  const summary = re?.decisionContext.summary ?? data.insights[0] ?? "";

  return (
    <div
      style={{
        background: "var(--qc-surface-row-alt, #EFEDE7)",
        border: "1px solid var(--qc-border-default, #E9E7E1)",
        borderRadius: 18,
        padding: 16,
      }}
    >
      {/* Section title */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: ".12em",
          color: INK2,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Technicals
      </div>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: 14 }}>

        {/* LEFT: Price ladder + range card */}
        <section
          style={{
            background: CARD,
            border: `1px solid ${HAIR}`,
            borderRadius: 18,
            padding: "18px 22px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: ".16em",
                color: INK3,
                textTransform: "uppercase",
              }}
            >
              Price structure · Daily
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 999,
                background: verdictSentiment === "up" ? "var(--qc-up-soft, #E3F1E8)" : verdictSentiment === "down" ? "var(--qc-down-soft, #F7E6E3)" : "var(--qc-warn-soft, #FAF0D8)",
                border: `1px solid ${verdictSentiment === "up" ? "#BBD9C6" : verdictSentiment === "down" ? "#F0C0BB" : "#E8D4A0"}`,
                color: verdictSentiment === "up" ? UP_COLOR : verdictSentiment === "down" ? DOWN_COLOR : WARN_COLOR,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".04em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: verdictSentiment === "up" ? UP_COLOR : verdictSentiment === "down" ? DOWN_COLOR : WARN_COLOR,
                  display: "inline-block",
                }}
              />
              {verdictLabel}
            </span>
          </div>

          {/* Body: ladder + range */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "stretch", paddingTop: 4 }}>

            {/* Ladder */}
            <div style={{ position: "relative", width: 280, padding: "6px 0" }}>
              {/* Vertical track */}
              <div
                style={{
                  position: "absolute",
                  left: 108,
                  top: 12,
                  bottom: 12,
                  width: 2,
                  background: "linear-gradient(180deg,#F0D3C9 0%, #F3E4C3 45%, #D9E8B3 100%)",
                  borderRadius: 2,
                }}
              />

              {/* Resistance 1 */}
              {r1 != null && (
                <LadderRow
                  labelK="Resistance 1"
                  chipLabel="R1"
                  chipBg="var(--qc-down-soft, #F7E6E3)"
                  chipColor={DOWN_COLOR}
                  nodeType="res"
                  value={fp(r1)}
                  pct={pctChange(r1, cmp)}
                  pctType="neutral"
                  isCurrent={false}
                />
              )}

              {/* ATH / 52W High */}
              <LadderRow
                labelK="All-time / 52W high"
                chipLabel="ATH"
                chipBg="var(--qc-warn-soft, #FAF0D8)"
                chipColor={WARN_COLOR}
                nodeType="ath"
                value={fp(ath)}
                pct={pctChange(ath, cmp)}
                pctType="neutral"
                isCurrent={false}
              />

              {/* Current price */}
              <LadderRow
                labelK="Current price"
                chipLabel="CMP"
                chipBg={INK}
                chipColor="#fff"
                nodeType="cur"
                value={fp(cmp)}
                pct="—"
                pctType="neutral"
                isCurrent
              />

              {/* Support 1 */}
              {s1 != null && (
                <LadderRow
                  labelK="Support 1"
                  chipLabel="S1"
                  chipBg="var(--qc-up-soft, #E3F1E8)"
                  chipColor={UP_COLOR}
                  nodeType="sup"
                  value={fp(s1)}
                  pct={pctChange(s1, cmp)}
                  pctType="pos"
                  isCurrent={false}
                />
              )}

              {/* 52W low */}
              <LadderRow
                labelK="52-week low"
                chipLabel="52W"
                chipBg={CHIP}
                chipColor={INK2}
                nodeType="plain"
                value={fp(low52w)}
                pct={pctChange(low52w, cmp)}
                pctType="pos"
                isCurrent={false}
              />
            </div>

            {/* Range + stats */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 0" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: INK2 }}>52-week range position</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: INK, fontWeight: 500 }}>
                    {rangePct}th percentile
                  </span>
                </div>
                {/* 52W bar */}
                <div
                  style={{
                    position: "relative",
                    height: 34,
                    background: "#EAE9E2",
                    borderRadius: 6,
                    overflow: "hidden",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0, top: 0, bottom: 0,
                      width: `${rangePct}%`,
                      background: "linear-gradient(90deg, var(--qc-up-soft, #E3F1E8), var(--qc-lime-bg, #E9F4C4))",
                      borderRadius: 6,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: -3, bottom: -3,
                      left: `calc(${rangePct}% - 1px)`,
                      width: 3,
                      background: INK,
                      borderRadius: 2,
                      boxShadow: "0 0 0 2px rgba(255,255,255,.9)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: INK3,
                    letterSpacing: ".04em",
                    marginTop: 3,
                  }}
                >
                  <span>{fp(low52w)} · Low</span>
                  <span>{fp(high52w)} · High</span>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginTop: 12 }}>
                <RangeStat
                  k="Distance from ATH"
                  v={distFromATH != null ? `${distFromATH.toFixed(1)}` : "—"}
                  u="%"
                  s={distFromATH != null && distFromATH > -5 ? "Near ATH" : "Pullback zone"}
                  sCls="neutral"
                />
                <RangeStat
                  k="Distance from S1"
                  v={distFromS1 != null ? `+${distFromS1.toFixed(1)}` : "—"}
                  u="%"
                  s={distFromS1 != null && distFromS1 > 0 ? "Above support" : "At/below support"}
                  sCls={distFromS1 != null && distFromS1 > 0 ? "pos" : "neg"}
                />
                <RangeStat
                  k="Risk : reward"
                  v={rrRatio != null ? `1 : ${rrRatio.toFixed(2)}` : "—"}
                  u=""
                  s="to R1 / S1"
                  sCls="neutral"
                />
                <RangeStat
                  k="ATR (14)"
                  v={volatility.atr14 != null ? fp(volatility.atr14) : "—"}
                  u=""
                  s={bbSqueeze ? "Volatility contracting" : "Volatility expanding"}
                  sCls="neutral"
                />
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Narrative card */}
        <aside
          style={{
            background: CARD,
            border: `1px solid ${HAIR}`,
            borderRadius: 18,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              height: "60%",
              background: "linear-gradient(180deg, transparent 0%, var(--qc-lime-bg, #E9F4C4) 100%)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: ".16em",
                color: INK3,
                textTransform: "uppercase",
              }}
            >
              What the chart says
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.3, color: INK }}>
              {trendSentiment === "up"
                ? `${verdictLabel} near key levels — watch for continuation.`
                : trendSentiment === "down"
                ? "Downtrend in play — caution until structure recovers."
                : "Consolidating — direction pending a catalyst."}
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: INK2, margin: 0 }}>
              {summary || (
                trendSentiment === "up"
                  ? `Price is ${aboveSMAs.length === 4 ? "above all moving averages" : `above ${aboveSMAs.join(", ")}`} with RSI at ${rsiValue.toFixed(0)}. Structure is intact.`
                  : `Price is ${belowSMAs.length > 0 ? `below ${belowSMAs.join(", ")}` : "near key levels"} with RSI at ${rsiValue.toFixed(0)}. Monitor for reversal signals.`
              )}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
              {tags.map(({ label, color }) => (
                <span
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: CARD,
                    border: `1px solid ${HAIR}`,
                    fontSize: 11.5,
                    color: INK2,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 4 state cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 1,
          background: HAIR,
          border: `1px solid ${HAIR}`,
          borderRadius: 14,
          overflow: "hidden",
          margin: "14px 0",
        }}
      >
        <StateCard
          label="Structure"
          value={structureLabel}
          sub={structureSub}
          sentiment={structureSentiment}
          iconPath={ICONS.trendUp}
          iconCircle={false}
        />
        <StateCard
          label="Trend"
          value={trendLabel}
          sub={trendSub}
          sentiment={signalSentiment(trend.direction)}
          iconPath={ICONS.arrowUpRight}
          iconCircle={false}
        />
        <StateCard
          label="Timing"
          value={`RSI ${rsiValue.toFixed(0)}`}
          sub={rsiSub}
          sentiment="neutral"
          iconPath={ICONS.clock}
          iconCircle
          iconColor={BLUE_COLOR}
        />
        <StateCard
          label="Relative Strength"
          value={rsLabel}
          sub={rsSub}
          sentiment={rsSentiment}
          iconPath={rsSentiment === "up" ? ICONS.arrowUpRight : ICONS.cross}
          iconCircle={false}
        />
      </div>

      {/* Moving averages strip */}
      <div
        style={{
          background: CARD,
          border: `1px solid ${HAIR}`,
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
            Moving Averages · vs CMP {fp(cmp)}
          </h4>
          <div style={{ fontSize: 11.5, color: INK3 }}>
            {aboveSMAs.length === 4
              ? "Price above all four SMAs · bullish stack"
              : belowSMAs.length === 4
              ? "Price below all four SMAs · bearish stack"
              : `Above ${aboveSMAs.join(", ")} · Below ${belowSMAs.join(", ")}`}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {smas.map((sma) => {
            const gap = sma.val > 0 ? ((cmp - sma.val) / sma.val) * 100 : 0;
            const fillPct = Math.min(Math.abs(gap) * 3, 50);
            return (
              <div key={sma.label}>
                <div style={{ fontSize: 11.5, color: INK3, letterSpacing: ".02em", marginBottom: 4 }}>
                  {sma.label}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    color: INK,
                    marginBottom: 6,
                  }}
                >
                  {fp(sma.val)}
                </div>
                {/* Gap bar */}
                <div
                  style={{
                    position: "relative",
                    height: 6,
                    background: CHIP,
                    borderRadius: 999,
                    overflow: "visible",
                    marginBottom: 6,
                  }}
                >
                  {/* Midpoint tick */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: -3,
                      bottom: -3,
                      width: 2,
                      background: INK3,
                      opacity: 0.5,
                    }}
                  />
                  {/* Fill */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      borderRadius: 999,
                      ...(sma.above
                        ? { left: "50%", width: `${fillPct}%`, background: UP_COLOR }
                        : { right: "50%", width: `${fillPct}%`, background: DOWN_COLOR }),
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: sma.above ? UP_COLOR : DOWN_COLOR,
                      fontWeight: 500,
                    }}
                  >
                    {sma.above ? "Above" : "Below"}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: INK2,
                      letterSpacing: ".02em",
                    }}
                  >
                    {gap >= 0 ? "+" : ""}{gap.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Momentum & Volatility (fx-quality style) */}
      <div
        style={{
          background: CARD,
          border: `1px solid ${HAIR}`,
          borderRadius: 14,
          padding: "16px 18px",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={{
            minWidth: 160,
            paddingRight: 16,
            borderRight: `1px solid ${HAIR2}`,
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: ".16em",
              color: INK3,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Momentum &amp; Volatility
          </div>
          <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }}>
            {momentumLabel === "Positive" && !bbSqueeze
              ? "Thrust building, range expanding"
              : momentumLabel === "Positive" && bbSqueeze
              ? "Thrust building, range tightening"
              : momentumLabel === "Negative"
              ? "Momentum fading, exercise caution"
              : "Neutral momentum, range bound"}
          </h4>
          <p style={{ margin: 0, fontSize: 11.5, color: INK2, lineHeight: 1.45 }}>
            RSI is{" "}
            {rsiPct > 50 ? "rising into bullish thrust zone" : "in neutral or oversold territory"}{" "}
            {bbSqueeze ? "while ATR contracts" : "with expanding volatility"} — monitor for breakout direction.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>

          {/* RSI dial */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: INK2, fontWeight: 500 }}>RSI (14)</span>
              <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.015em", color: INK, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {rsiValue.toFixed(0)}
              </span>
            </div>
            {/* RSI color-banded track */}
            <div
              style={{
                position: "relative",
                height: 10,
                borderRadius: 999,
                overflow: "visible",
                background: "linear-gradient(90deg, #D7EEDD 0%, #D7EEDD 30%, #EFEDE7 30%, #EFEDE7 70%, #F4D8D4 70%, #F4D8D4 100%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -5, bottom: -5,
                  left: `${rsiPct}%`,
                  width: 3,
                  background: INK,
                  borderRadius: 2,
                  boxShadow: "0 0 0 2px rgba(255,255,255,.9)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: INK3,
                letterSpacing: ".04em",
                marginTop: 6,
              }}
            >
              <span>0 · Oversold</span>
              <span>50</span>
              <span>100 · Overbought</span>
            </div>
          </div>

          {/* Momentum Thrust */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: INK2, fontWeight: 500 }}>Momentum Thrust</span>
              <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.015em", color: INK, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {momentumLabel}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: CHIP,
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 6,
                position: "relative",
              }}
            >
              <span style={{ display: "block", height: "100%", borderRadius: 999, width: `${momentumScore}%`, background: momentumColor }} />
              <span style={{ position: "absolute", top: -3, bottom: -3, left: "50%", width: 2, background: INK, opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: 11, color: INK3, display: "flex", justifyContent: "space-between" }}>
              <span>Rising from neutral</span>
              <b style={{ color: INK2, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace" }}>
                +{momentumScore}%
              </b>
            </div>
          </div>

          {/* Volatility Regime */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: INK2, fontWeight: 500 }}>Volatility Regime</span>
              <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.015em", color: INK, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {volLabel}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: CHIP,
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 6,
                position: "relative",
              }}
            >
              <span style={{ display: "block", height: "100%", borderRadius: 999, width: `${volPct}%`, background: volColor }} />
              <span style={{ position: "absolute", top: -3, bottom: -3, left: "50%", width: 2, background: INK, opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: 11, color: INK3, display: "flex", justifyContent: "space-between" }}>
              <span>ATR {bbSqueeze ? "tightening" : "expanding"}</span>
              <b style={{ color: INK2, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace" }}>
                {volPct} / 100
              </b>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface LadderRowProps {
  labelK: string;
  chipLabel: string;
  chipBg: string;
  chipColor: string;
  nodeType: "res" | "ath" | "cur" | "sup" | "plain";
  value: string;
  pct: string;
  pctType: "pos" | "neg" | "neutral";
  isCurrent: boolean;
}

function LadderRow({ labelK, chipLabel, chipBg, chipColor, nodeType, value, pct, pctType, isCurrent }: LadderRowProps) {
  const INK = "var(--qc-text-heading, #0E0E0C)";
  const INK3 = "var(--qc-text-muted, #9A9A92)";

  const nodeStyle: React.CSSProperties =
    nodeType === "cur"
      ? {
          width: 18, height: 18, borderRadius: "50%",
          background: INK, border: `2px solid ${INK}`,
          margin: "0 auto", position: "relative", zIndex: 2,
          boxShadow: "0 0 0 4px rgba(14,14,12,0.08)",
        }
      : {
          width: 14, height: 14, borderRadius: "50%",
          background: "var(--qc-surface-white, #FFFFFF)",
          border: `2px solid ${
            nodeType === "res" ? "var(--qc-down, #B23A2F)"
            : nodeType === "ath" ? "var(--qc-warn, #B4731A)"
            : nodeType === "sup" ? "var(--qc-up, #1F7A4A)"
            : "var(--qc-border-default, #E9E7E1)"
          }`,
          margin: "0 auto", position: "relative", zIndex: 2,
        };

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "100px 16px 1fr",
        alignItems: "center",
        gap: 0,
        padding: "7px 0",
        minHeight: 34,
      }}
    >
      <div style={{ textAlign: "right", paddingRight: 12 }}>
        <div
          style={{
            fontSize: 11,
            color: isCurrent ? INK : INK3,
            letterSpacing: ".02em",
            lineHeight: 1.1,
            fontWeight: isCurrent ? 500 : 400,
          }}
        >
          {labelK}
        </div>
        <span
          style={{
            display: "inline-block",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: ".08em",
            padding: "2px 5px",
            borderRadius: 4,
            marginTop: 3,
            textTransform: "uppercase",
            background: chipBg,
            color: chipColor,
          }}
        >
          {chipLabel}
        </span>
      </div>
      <div style={nodeStyle} />
      <div
        style={{
          paddingLeft: 10,
          fontSize: isCurrent ? 14 : 12,
          fontWeight: isCurrent ? 500 : 400,
          color: isCurrent ? INK : "var(--qc-text-heading, #0E0E0C)",
        }}
      >
        {value}
        {pct !== "—" && (
          <span
            style={{
              fontSize: 10.5,
              color:
                pctType === "pos" ? "var(--qc-up, #1F7A4A)"
                : pctType === "neg" ? "var(--qc-down, #B23A2F)"
                : INK3,
              marginLeft: 6,
              letterSpacing: ".02em",
            }}
          >
            {pct}
          </span>
        )}
      </div>
    </div>
  );
}

interface RangeStatProps {
  k: string;
  v: string;
  u: string;
  s: string;
  sCls: "pos" | "neg" | "neutral";
}

function RangeStat({ k, v, u, s, sCls }: RangeStatProps) {
  const INK = "var(--qc-text-heading, #0E0E0C)";
  const INK3 = "var(--qc-text-muted, #9A9A92)";
  return (
    <div
      style={{
        border: `1px solid var(--qc-border-default, #E9E7E1)`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 11, color: INK3, letterSpacing: ".02em", marginBottom: 2 }}>{k}</div>
      <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: INK, fontVariantNumeric: "tabular-nums" }}>
        {v}
        {u && <span style={{ fontSize: 11, color: INK3, marginLeft: 2, fontWeight: 400 }}>{u}</span>}
      </div>
      <div
        style={{
          fontSize: 11,
          color: sCls === "pos" ? "var(--qc-up, #1F7A4A)" : sCls === "neg" ? "var(--qc-down, #B23A2F)" : INK3,
          marginTop: 2,
        }}
      >
        {s}
      </div>
    </div>
  );
}

interface StateCardProps {
  label: string;
  value: string;
  sub: string;
  sentiment: "up" | "down" | "neutral";
  iconPath: string;
  iconCircle?: boolean;
  iconColor?: string;
}

function StateCard({ label, value, sub, sentiment, iconPath, iconCircle = false, iconColor }: StateCardProps) {
  const INK = "var(--qc-text-heading, #0E0E0C)";
  const INK2 = "var(--qc-text-body, #5A5A54)";
  const INK3 = "var(--qc-text-muted, #9A9A92)";
  const icnBg =
    iconColor ??
    (sentiment === "up" ? "var(--qc-up, #1F7A4A)"
     : sentiment === "down" ? "var(--qc-down, #B23A2F)"
     : "var(--qc-text-muted, #9A9A92)");
  const valueColor = sentiment === "up" ? "var(--qc-up, #1F7A4A)" : sentiment === "down" ? "var(--qc-down, #B23A2F)" : INK;

  return (
    <div
      style={{
        background: "var(--qc-surface-white, #FFFFFF)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 96,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: INK2, letterSpacing: ".01em" }}>{label}</span>
        <div
          style={{
            width: 22, height: 22, borderRadius: 6,
            display: "grid", placeItems: "center",
            color: "#fff",
            flex: "0 0 auto",
            background: icnBg,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {iconCircle && <circle cx="12" cy="12" r="9" />}
            <path d={iconPath} />
          </svg>
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em", color: valueColor, lineHeight: 1.2, marginTop: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: INK3, marginTop: "auto", lineHeight: 1.35 }}>{sub}</div>
    </div>
  );
}
