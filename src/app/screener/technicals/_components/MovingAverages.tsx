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
    { label: "BB Upper", value: `₹${volatility.bollingerBands.upper.toFixed(2)}`, sub: "Upper band", squeeze: undefined },
    { label: "BB Middle", value: `₹${volatility.bollingerBands.middle.toFixed(2)}`, sub: "Middle band", squeeze: undefined },
    { label: "BB Lower", value: `₹${volatility.bollingerBands.lower.toFixed(2)}`, sub: "Lower band", squeeze: undefined },
    { label: "ATR (14)", value: `₹${volatility.atr14.toFixed(2)}`, sub: `${volatility.atrPercent.toFixed(2)}% of price`, squeeze: undefined },
    { label: "BB Width", value: volatility.bollingerBands.width.toFixed(2), sub: "Band width", squeeze: undefined },
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
      activeClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
      inactiveClass: "bg-zinc-100 text-zinc-500 border-zinc-200",
    },
    {
      label: "Death Cross",
      active: movingAverages.crossovers.deathCross,
      activeClass: "bg-red-50 text-red-600 border-red-200",
      inactiveClass: "bg-zinc-100 text-zinc-500 border-zinc-200",
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
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden mb-4">
        <div className="grid grid-cols-6 divide-x divide-dashed divide-zinc-200">
          {maValues.map(({ label, value }) => {
            const above = price.cmp > value;
            return (
              <div key={label} className="flex flex-col gap-0.5 px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                  {label}
                </span>
                <span className="text-base font-semibold text-[#0F172B]">
                  ₹{value.toFixed(2)}
                </span>
                <span className={`text-[10px] font-semibold ${above ? "text-emerald-600" : "text-red-600"}`}>
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
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden mt-4 mb-4">
        <div className="flex items-center divide-x divide-dashed divide-zinc-200">
          {crossoverItems.map(({ label, active, activeClass, inactiveClass }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-3">
              <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                {label}
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${active ? activeClass : inactiveClass}`}
              >
                {active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
              Last Crossover
            </span>
            <span className="text-[13px] font-medium text-[#0F172B]">
              {movingAverages.crossovers.lastCrossoverDate}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 ml-auto">
            {pricePositionItems.map(({ label, above }) => (
              <span
                key={label}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  above
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {above ? "▲" : "▼"} {above ? "Above" : "Below"} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bollinger Bands & Volatility */}
      <div className="mb-1">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#0F172B] mb-2 block">
          Bollinger Bands &amp; Volatility
        </span>
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <div className="grid grid-cols-6 divide-x divide-dashed divide-zinc-200">
            {bbValues.map(({ label, value, sub, squeeze }) => (
              <div key={label} className="flex flex-col gap-0.5 px-4 py-3">
                <span className="text-[10px] uppercase tracking-wider font-medium text-[#888888]">
                  {label}
                </span>
                <span
                  className={`text-base font-semibold ${
                    squeeze === true
                      ? "text-amber-600"
                      : squeeze === false
                        ? "text-zinc-500"
                        : "text-[#0F172B]"
                  }`}
                >
                  {value}
                </span>
                <span className="text-[10px] text-[#888888]">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
