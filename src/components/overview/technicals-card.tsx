"use client";

import type { TechnicalsResponse } from "@/types/technicals";
import { SectionShell, SectionLabel, NarrativeSidebar } from "./primitives";
import { PriceLadderSection } from "./technicals/price-ladder-section";
import { StateCardsRow, type StateCardsRowItem } from "./technicals/state-cards-row";
import { MovingAveragesStrip } from "./technicals/moving-averages-strip";
import { MomentumVolatilityPanel } from "./technicals/momentum-volatility-panel";

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

interface Props {
  data: TechnicalsResponse;
}

export function TechnicalsCard({ data }: Props) {
  const { supportResistance: sr, movingAverages: ma, price, trend, ruleEngine: re, momentum, volatility } = data;

  const cmp = price.cmp;
  const high52w = price.high52w;
  const low52w = price.low52w;
  const ath = price.allTimeHigh ?? high52w;

  const r1 = sr.static.resistance[0] ?? null;
  const s1 = sr.static.support[0] ?? null;

  const rangeWidth = high52w - low52w;
  const rangePct = rangeWidth > 0 ? Math.round(((cmp - low52w) / rangeWidth) * 100) : 0;
  const distFromATH = ath ? ((cmp - ath) / ath) * 100 : null;
  const distFromS1 = s1 ? ((cmp - s1) / s1) * 100 : null;
  const rrRatio =
    r1 != null && s1 != null && r1 !== cmp && s1 !== cmp
      ? Math.abs((r1 - cmp) / (cmp - s1))
      : null;

  const verdictLabel =
    re?.structureEngine.priceStructure.zone
      ? humanize(re.structureEngine.priceStructure.zone)
      : trend.phase
      ? `${humanize(trend.direction)} · ${humanize(trend.phase)}`
      : humanize(trend.direction);
  const verdictSentiment = signalSentiment(trend.direction);

  const aboveSMAs = [
    ma.pricePosition.aboveSMA20 ? "SMA 20" : null,
    ma.pricePosition.aboveSMA50 ? "SMA 50" : null,
    cmp >= ma.sma[100] ? "SMA 100" : null,
    ma.pricePosition.aboveSMA200 ? "SMA 200" : null,
  ].filter(Boolean);
  const belowSMAs = [
    !ma.pricePosition.aboveSMA20 ? "SMA 20" : null,
    !ma.pricePosition.aboveSMA50 ? "SMA 50" : null,
    cmp < ma.sma[100] ? "SMA 100" : null,
    !ma.pricePosition.aboveSMA200 ? "SMA 200" : null,
  ].filter(Boolean);

  const smas = [
    { label: "SMA 20", val: ma.sma[20], above: ma.pricePosition.aboveSMA20 },
    { label: "SMA 50", val: ma.sma[50], above: ma.pricePosition.aboveSMA50 },
    { label: "SMA 100", val: ma.sma[100], above: cmp >= ma.sma[100] },
    { label: "SMA 200", val: ma.sma[200], above: ma.pricePosition.aboveSMA200 },
  ];

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

  const bbSqueeze = volatility.bollingerBands.squeeze;
  const momentumScore = data.signals.components?.momentum ?? Math.round(rsiValue * 0.7);
  const momentumLabel = momentumScore > 60 ? "Positive" : momentumScore > 40 ? "Neutral" : "Negative";
  const momentumColor =
    momentumScore > 60 ? "var(--qc-up)" : momentumScore > 40 ? "var(--qc-warn)" : "var(--qc-down)";
  const volLabel = bbSqueeze ? "Contracting" : "Expanding";
  const volPct = bbSqueeze ? 28 : 65;
  const volColor = bbSqueeze ? "var(--qc-warn)" : "var(--qc-up)";

  const trendSentiment = signalSentiment(trend.direction);
  const tags: { label: string; color: string }[] = [
    {
      label: humanize(trend.direction),
      color:
        trendSentiment === "up" ? "var(--qc-up)"
        : trendSentiment === "down" ? "var(--qc-down)"
        : "var(--qc-warn)",
    },
  ];
  if (aboveSMAs.length === 4) tags.push({ label: "Above all SMAs", color: "var(--qc-up)" });
  else if (belowSMAs.length === 4) tags.push({ label: "Below all SMAs", color: "var(--qc-down)" });
  if (bbSqueeze) tags.push({ label: "Vol contracting", color: "var(--qc-warn)" });
  tags.push({
    label: rsSentiment === "up" ? "Outperforming" : "Underperforming",
    color: rsSentiment === "up" ? "var(--qc-up)" : "var(--qc-down)",
  });

  const summary = re?.decisionContext.summary ?? data.insights[0] ?? "";

  const stateCards: StateCardsRowItem[] = [
    {
      label: "Structure",
      value: re?.structureEngine.priceStructure.zone
        ? humanize(re.structureEngine.priceStructure.zone)
        : "—",
      sub: re?.structureEngine.marketStructure.wyckoffPhase
        ? `${humanize(re.structureEngine.marketStructure.wyckoffPhase)} phase · money flow positive`
        : "Market structure analysis",
      sentiment: signalSentiment(re?.structureEngine.priceStructure.zone),
      iconPath: "M3 18l6-8 4 5 8-11",
    },
    {
      label: "Trend",
      value: humanize(trend.direction),
      sub:
        belowSMAs.length === 0
          ? `Above ${aboveSMAs.join(" · ")}`
          : aboveSMAs.length === 0
          ? `Below ${belowSMAs.join(" · ")}`
          : `Above ${aboveSMAs.join(", ")} · Below ${belowSMAs.join(", ")}`,
      sentiment: signalSentiment(trend.direction),
      iconPath: "M7 17L17 7M17 7H9M17 7v8",
    },
    {
      label: "Timing",
      value: `RSI ${rsiValue.toFixed(0)}`,
      sub: rsiSub,
      sentiment: "neutral",
      iconPath: "M12 7v5l3 2",
      iconCircle: true,
      iconColor: "var(--qc-blue)",
    },
    {
      label: "Relative Strength",
      value: rsLabel,
      sub: rsSub,
      sentiment: rsSentiment,
      iconPath: rsSentiment === "up" ? "M7 17L17 7M17 7H9M17 7v8" : "M7 7l10 10M17 7L7 17",
    },
  ];

  return (
    <SectionShell>
      <SectionLabel>Technicals</SectionLabel>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: 14 }}>
        <PriceLadderSection
          cmp={cmp}
          high52w={high52w}
          low52w={low52w}
          ath={ath}
          r1={r1}
          s1={s1}
          rangePct={rangePct}
          distFromATH={distFromATH}
          distFromS1={distFromS1}
          rrRatio={rrRatio}
          atr14={volatility.atr14}
          bbSqueeze={bbSqueeze}
          verdictLabel={verdictLabel}
          verdictSentiment={verdictSentiment}
        />
        <NarrativeSidebar
          eyebrow="What the chart says"
          headline={
            trendSentiment === "up"
              ? `${verdictLabel} near key levels — watch for continuation.`
              : trendSentiment === "down"
              ? "Downtrend in play — caution until structure recovers."
              : "Consolidating — direction pending a catalyst."
          }
          body={
            summary ||
            (trendSentiment === "up"
              ? `Price is ${aboveSMAs.length === 4 ? "above all moving averages" : `above ${aboveSMAs.join(", ")}`} with RSI at ${rsiValue.toFixed(0)}. Structure is intact.`
              : `Price is ${belowSMAs.length > 0 ? `below ${belowSMAs.join(", ")}` : "near key levels"} with RSI at ${rsiValue.toFixed(0)}. Monitor for reversal signals.`)
          }
          tags={tags}
        />
      </div>

      <StateCardsRow items={stateCards} />
      <MovingAveragesStrip cmp={cmp} smas={smas} aboveSMAs={aboveSMAs} belowSMAs={belowSMAs} />
      <MomentumVolatilityPanel
        rsiValue={rsiValue}
        momentumScore={momentumScore}
        momentumLabel={momentumLabel}
        momentumColor={momentumColor}
        volLabel={volLabel}
        volPct={volPct}
        volColor={volColor}
        bbSqueeze={bbSqueeze}
      />
    </SectionShell>
  );
}
