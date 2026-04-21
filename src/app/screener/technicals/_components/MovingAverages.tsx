"use client";

import { SectionPanel } from "@/components/molecules/section-panel";
import { MAPositionChart } from "./MAPositionChart";
import { TechnicalsPriceRaw, TechnicalsMovingAveragesRaw, TechnicalsVolatilityRaw } from "@/types/technicals";

interface MovingAveragesProps {
  price: TechnicalsPriceRaw;
  movingAverages: TechnicalsMovingAveragesRaw;
  volatility: TechnicalsVolatilityRaw;
}

export function MovingAverages({ price, movingAverages, volatility }: MovingAveragesProps) {
  const maValues = [
    { label: "SMA 20", value: movingAverages.sma[20] },
    { label: "SMA 50", value: movingAverages.sma[50] },
    { label: "SMA 100", value: movingAverages.sma[100] },
    { label: "SMA 200", value: movingAverages.sma[200] },
    { label: "EMA 20", value: movingAverages.ema[20] },
    { label: "EMA 50", value: movingAverages.ema[50] },
  ];

  const bbValues = [
    { label: "BB Upper", value: `₹${volatility.bollingerBands.upper.toFixed(2)}`, sub: "Upper band", squeeze: undefined as boolean | undefined },
    { label: "BB Middle", value: `₹${volatility.bollingerBands.middle.toFixed(2)}`, sub: "Middle band", squeeze: undefined as boolean | undefined },
    { label: "BB Lower", value: `₹${volatility.bollingerBands.lower.toFixed(2)}`, sub: "Lower band", squeeze: undefined as boolean | undefined },
    { label: "ATR (14)", value: `₹${volatility.atr14.toFixed(2)}`, sub: `${volatility.atrPercent.toFixed(2)}% of price`, squeeze: undefined as boolean | undefined },
    { label: "BB Width", value: volatility.bollingerBands.width.toFixed(2), sub: "Band width", squeeze: undefined as boolean | undefined },
    {
      label: "BB Squeeze",
      value: volatility.bollingerBands.squeeze ? "YES" : "NO",
      sub: volatility.bollingerBands.squeeze ? "Squeeze active" : "No squeeze",
      squeeze: volatility.bollingerBands.squeeze,
    },
  ];

  const crossoverItems = [
    {
      label: "Golden Cross",
      active: movingAverages.crossovers.goldenCross,
      activeStyle: { background: "var(--qc-up-soft)", color: "var(--qc-up)", borderColor: "var(--qc-up)" },
      inactiveStyle: { background: "var(--qc-surface-row-alt)", color: "var(--qc-text-muted)", borderColor: "var(--qc-border-inner)" },
    },
    {
      label: "Death Cross",
      active: movingAverages.crossovers.deathCross,
      activeStyle: { background: "var(--qc-down-soft)", color: "var(--qc-down)", borderColor: "var(--qc-down)" },
      inactiveStyle: { background: "var(--qc-surface-row-alt)", color: "var(--qc-text-muted)", borderColor: "var(--qc-border-inner)" },
    },
  ];

  const pricePositionItems = [
    { label: "SMA20", above: movingAverages.pricePosition.aboveSMA20 },
    { label: "SMA50", above: movingAverages.pricePosition.aboveSMA50 },
    { label: "SMA200", above: movingAverages.pricePosition.aboveSMA200 },
  ];

  return (
    <SectionPanel
      title="Moving Averages"
      subtitle="Price position relative to key SMAs and EMAs"
    >
      {/* MA values table */}
      <div
        className="rounded-[10px] border overflow-hidden mb-4"
        style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
      >
        <div
          className="grid grid-cols-6"
          style={{ borderBottom: "none" }}
        >
          {maValues.map(({ label, value }, i) => {
            const above = price.cmp > value;
            return (
              <div
                key={label}
                className="flex flex-col gap-0.5 px-4 py-3"
                style={i > 0 ? { borderLeft: "1px dashed var(--qc-border-inner)" } : undefined}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>
                  {label}
                </span>
                <span className="text-base font-semibold" style={{ color: "var(--qc-text-heading)" }}>
                  ₹{value.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold" style={{ color: above ? "var(--qc-up)" : "var(--qc-down)" }}>
                  {above ? "▲ Above" : "▼ Below"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MA Position Chart */}
      <MAPositionChart
        price={price.cmp}
        mas={[
          { label: "SMA20", value: movingAverages.sma[20] },
          { label: "SMA50", value: movingAverages.sma[50] },
          { label: "SMA100", value: movingAverages.sma[100] },
          { label: "SMA200", value: movingAverages.sma[200] },
          { label: "EMA20", value: movingAverages.ema[20] },
          { label: "EMA50", value: movingAverages.ema[50] },
        ]}
        low52w={price.low52w}
        high52w={price.high52w}
      />

      {/* Crossovers + Price Position */}
      <div
        className="rounded-[10px] border overflow-hidden mt-4 mb-4"
        style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
      >
        <div className="flex items-center">
          {crossoverItems.map(({ label, active, activeStyle, inactiveStyle }, i) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-3"
              style={i > 0 ? { borderLeft: "1px dashed var(--qc-border-inner)" } : undefined}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>
                {label}
              </span>
              <span
                className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] border"
                style={active ? activeStyle : inactiveStyle}
              >
                {active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          ))}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderLeft: "1px dashed var(--qc-border-inner)" }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>
              Last Crossover
            </span>
            <span className="text-[13px] font-medium" style={{ color: "var(--qc-text-heading)" }}>
              {movingAverages.crossovers.lastCrossoverDate}
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-3 ml-auto"
            style={{ borderLeft: "1px dashed var(--qc-border-inner)" }}
          >
            {pricePositionItems.map(({ label, above }) => (
              <span
                key={label}
                className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] border"
                style={above
                  ? { background: "var(--qc-up-soft)", color: "var(--qc-up)", borderColor: "var(--qc-up)" }
                  : { background: "var(--qc-down-soft)", color: "var(--qc-down)", borderColor: "var(--qc-down)" }
                }
              >
                {above ? "▲" : "▼"} {above ? "Above" : "Below"} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bollinger Bands & Volatility */}
      <div className="mb-1">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] mb-2 block"
          style={{ color: "var(--qc-text-heading)" }}
        >
          Bollinger Bands &amp; Volatility
        </span>
        <div
          className="rounded-[10px] border overflow-hidden"
          style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
        >
          <div className="grid grid-cols-6">
            {bbValues.map(({ label, value, sub, squeeze }, i) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 px-4 py-3"
                style={i > 0 ? { borderLeft: "1px dashed var(--qc-border-inner)" } : undefined}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>
                  {label}
                </span>
                <span
                  className="text-base font-semibold"
                  style={{
                    color: squeeze === true
                      ? "var(--qc-warn)"
                      : squeeze === false
                        ? "var(--qc-text-muted)"
                        : "var(--qc-text-heading)"
                  }}
                >
                  {value}
                </span>
                <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
