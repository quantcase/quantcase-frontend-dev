"use client";

import { TechnicalsPriceRaw, TechnicalsMovingAveragesRaw, TechnicalsSupportResistanceRaw, TechnicalsMetaRaw } from "@/types/technicals";

interface LevelsStripProps {
  price: TechnicalsPriceRaw;
  movingAverages: TechnicalsMovingAveragesRaw;
  supportResistance: TechnicalsSupportResistanceRaw;
  meta: TechnicalsMetaRaw;
  changeDisplay: string;
  changeIsPositive: boolean;
}

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const pct = (n: number, positive?: boolean) => {
  const sign = positive === undefined ? (n >= 0 ? "+" : "") : positive ? "+" : "";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
};

export function LevelsStrip({
  price,
  movingAverages,
  supportResistance,
  meta,
  changeDisplay,
  changeIsPositive,
}: LevelsStripProps) {
  const sr = supportResistance.static;
  const sma = movingAverages.sma;
  const support = sr.support[0];
  const resistance = sr.resistance[0];
  const srRangeWidth =
    support && resistance
      ? `${(((resistance - support) / support) * 100).toFixed(2)}%`
      : meta.srRange;

  const levels: { label: string; value: string; sub?: string; subColor?: string }[] = [
    {
      label: "CMP",
      value: fmt(price.cmp),
      sub: changeDisplay,
      subColor: changeIsPositive ? "text-emerald-600" : "text-red-600",
    },
    { label: "SMA 20", value: fmt(sma[20]) },
    { label: "SMA 50", value: fmt(sma[50]) },
    { label: "SMA 100", value: fmt(sma[100]) },
    { label: "SMA 200", value: fmt(sma[200]) },
    ...(support ? [{ label: "Support", value: fmt(support) }] : []),
    ...(resistance ? [{ label: "Resistance", value: fmt(resistance) }] : []),
    { label: "S/R Width", value: srRangeWidth },
    ...(price.allTimeHigh
      ? [
          { label: "ATH", value: fmt(price.allTimeHigh) },
          {
            label: "% from ATH",
            value: pct(price.distanceFromATH ?? 0),
            subColor: "text-red-600",
          },
        ]
      : []),
    {
      label: "52W High",
      value: fmt(price.high52w),
      sub: pct(price.distanceFrom52wHigh),
      subColor: "text-red-600",
    },
    ...(price.allTimeLow
      ? [
          { label: "ATL", value: fmt(price.allTimeLow) },
          {
            label: "% from ATL",
            value: pct(price.distanceFromATL ?? 0, true),
            subColor: "text-emerald-600",
          },
        ]
      : []),
    {
      label: "52W Low",
      value: fmt(price.low52w),
      sub: `+${price.distanceFrom52wLow.toFixed(2)}%`,
      subColor: "text-emerald-600",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 min-w-max">
        {levels.map(({ label, value, sub, subColor }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-100 bg-white px-4 py-3 flex flex-col gap-1 min-w-[110px]"
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#888888]">
              {label}
            </span>
            <span className="text-[15px] font-semibold text-[#0F172B] whitespace-nowrap">
              {value}
            </span>
            {sub && (
              <span className={`text-[11px] font-semibold ${subColor ?? "text-zinc-500"}`}>
                {sub}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
