"use client";

import { MetricBar, SidebarPanelLayout } from "@/components/overview/primitives";

interface MomentumVolatilityPanelProps {
  rsiValue: number;
  momentumScore: number;
  momentumLabel: string;
  momentumColor: string;
  volLabel: string;
  volPct: number;
  volColor: string;
  bbSqueeze: boolean;
}

export function MomentumVolatilityPanel({
  rsiValue, momentumScore, momentumLabel, momentumColor,
  volLabel, volPct, volColor, bbSqueeze,
}: MomentumVolatilityPanelProps) {
  const rsiPct = Math.min(Math.max(rsiValue, 0), 100);

  const heading =
    momentumLabel === "Positive" && !bbSqueeze
      ? "Thrust building, range expanding"
      : momentumLabel === "Positive" && bbSqueeze
      ? "Thrust building, range tightening"
      : momentumLabel === "Negative"
      ? "Momentum fading, exercise caution"
      : "Neutral momentum, range bound";

  const description = `RSI is ${
    rsiPct > 50 ? "rising into bullish thrust zone" : "in neutral or oversold territory"
  } ${bbSqueeze ? "while ATR contracts" : "with expanding volatility"} — monitor for breakout direction.`;

  return (
    <SidebarPanelLayout eyebrow="Momentum & Volatility" heading={heading} description={description}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>

        {/* RSI dial */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--qc-ink)", fontWeight: 500 }}>RSI (14)</span>
            <span
              style={{
                fontSize: 17, fontWeight: 500, letterSpacing: "-0.015em",
                color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1,
              }}
            >
              {rsiValue.toFixed(0)}
            </span>
          </div>
          {/* Color-banded RSI track */}
          <div
            style={{
              position: "relative", height: 10, borderRadius: 999, overflow: "visible",
              background:
                "linear-gradient(90deg, #D7EEDD 0%, #D7EEDD 30%, #EFEDE7 30%, #EFEDE7 70%, #F4D8D4 70%, #F4D8D4 100%)",
            }}
          >
            <div
              style={{
                position: "absolute", top: -5, bottom: -5,
                left: `${rsiPct}%`,
                width: 3, background: "var(--qc-ink)", borderRadius: 2,
                boxShadow: "0 0 0 2px rgba(255,255,255,.9)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex", justifyContent: "space-between",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10, color: "var(--qc-ink-2)", letterSpacing: ".04em", marginTop: 6,
            }}
          >
            <span>0 · Oversold</span>
            <span>50</span>
            <span>100 · Overbought</span>
          </div>
        </div>

        {/* Momentum Thrust */}
        <MetricBar
          label="Momentum Thrust"
          value={momentumLabel}
          fillPct={momentumScore}
          fillColor={momentumColor}
          subLeft="Rising from neutral"
          subRight={`+${momentumScore}%`}
        />

        {/* Volatility Regime */}
        <MetricBar
          label="Volatility Regime"
          value={volLabel}
          fillPct={volPct}
          fillColor={volColor}
          subLeft={`ATR ${bbSqueeze ? "tightening" : "expanding"}`}
          subRight={`${volPct} / 100`}
        />

      </div>
    </SidebarPanelLayout>
  );
}
