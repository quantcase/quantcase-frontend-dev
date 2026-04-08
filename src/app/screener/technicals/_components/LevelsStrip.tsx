"use client";

import {
  TechnicalsPriceRaw,
  TechnicalsMovingAveragesRaw,
  TechnicalsSupportResistanceRaw,
  TechnicalsMetaRaw,
} from "@/types/technicals";
import { TabularCard } from "@/components/molecules/tabular-card";

interface LevelsStripProps {
  price: TechnicalsPriceRaw;
  movingAverages: TechnicalsMovingAveragesRaw;
  supportResistance: TechnicalsSupportResistanceRaw;
  meta: TechnicalsMetaRaw;
  changeDisplay: string;
  changeIsPositive: boolean;
}

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const pctFmt = (n: number) => {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
};

interface MetricItem {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  highlight?: boolean;
}

function MetricCell({ label, value, sub, subColor, highlight }: MetricItem) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[#888888]">
        {label}
      </span>
      <span
        className={`text-base font-bold whitespace-nowrap ${
          highlight ? "text-[#E67E22]" : "text-[#0F172B]"
        }`}
      >
        {value}
      </span>
      {sub != null && (
        <span className={`text-[11px] font-semibold ${subColor ?? "text-zinc-500"}`}>
          {sub}
        </span>
      )}
    </div>
  );
}

function MetricGroup({
  title,
  items,
  isLast,
}: {
  title: string;
  items: MetricItem[];
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex flex-col `}
    >
      {/* Group header */}
      <div className="px-5 pt-2 pb-1.5 border-b border-[#F0F0F0]">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#888888]">
          {title}
        </span>
      </div>
      {/* Metric cells in a row */}
      <div className="flex">
        {items.map((item, i) => (
          <div key={item.label} className="flex">
            {i > 0 && <div className="w-px bg-[#F0F0F0] self-stretch" />}
            <MetricCell {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}

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

  // Build SMA items sorted by value descending, with CMP inserted in order
  const smaEntries: { label: string; value: number; isCmp?: boolean }[] = [
    { label: "CMP", value: price.cmp, isCmp: true },
    { label: "SMA 20", value: sma[20] },
    { label: "SMA 50", value: sma[50] },
    { label: "SMA 100", value: sma[100] },
    { label: "SMA 200", value: sma[200] },
  ].sort((a, b) => b.value - a.value);

  const smaItems: MetricItem[] = smaEntries.map((entry) => {
    const distPct = ((entry.value - price.cmp) / price.cmp) * 100;
    return {
      label: entry.label,
      value: fmt(entry.value),
      sub: entry.isCmp ? changeDisplay : pctFmt(-distPct),
      subColor: entry.isCmp
        ? changeIsPositive
          ? "text-emerald-600"
          : "text-red-600"
        : distPct > 0
          ? "text-red-600"
          : "text-emerald-600",
      highlight: entry.isCmp,
    };
  });

  // Support & Resistance group
  const srRangePct =
    support && resistance
      ? `${(((resistance - support) / support) * 100).toFixed(1)}%`
      : "";

  const srItems: MetricItem[] = [
    ...(support
      ? [
          {
            label: "Support",
            value: fmt(support),
            sub: pctFmt(((price.cmp - support) / support) * 100),
            subColor:
              price.cmp >= support ? "text-emerald-600" : "text-red-600",
          },
        ]
      : []),
    ...(resistance
      ? [
          {
            label: "Resistance",
            value: fmt(resistance),
            sub: pctFmt(((price.cmp - resistance) / resistance) * 100),
            subColor:
              price.cmp >= resistance ? "text-emerald-600" : "text-red-600",
          },
        ]
      : []),
    {
      label: "S/R Range",
      value:
        support && resistance
          ? fmt(resistance - support)
          : meta.srRange,
      sub: srRangePct || undefined,
    },
  ];

  // 52 Week Range group
  const range52w = price.high52w - price.low52w;
  const pctIn52w =
    range52w > 0
      ? (((price.cmp - price.low52w) / range52w) * 100).toFixed(1) + "%"
      : "—";

  const week52Items: MetricItem[] = [
    {
      label: "52W High",
      value: fmt(price.high52w),
      sub: pctFmt(price.distanceFrom52wHigh),
      subColor: "text-red-600",
    },
    {
      label: "52W Low",
      value: fmt(price.low52w),
      sub: pctFmt(price.distanceFrom52wLow),
      subColor: "text-emerald-600",
    },
    {
      label: "% Range",
      value: fmt(range52w),
      sub: pctIn52w,
    },
  ];

  // All Time Range group
  const hasATH = price.allTimeHigh != null;
  const hasATL = price.allTimeLow != null;
  const atRange =
    hasATH && hasATL ? price.allTimeHigh! - price.allTimeLow! : null;
  const pctInAT =
    hasATH && hasATL && atRange! > 0
      ? (((price.cmp - price.allTimeLow!) / atRange!) * 100).toFixed(1) + "%"
      : "—";

  const allTimeItems: MetricItem[] = [
    ...(hasATH
      ? [
          {
            label: "ATH",
            value: fmt(price.allTimeHigh!),
            sub: pctFmt(price.distanceFromATH ?? 0),
            subColor: "text-red-600",
          },
        ]
      : []),
    ...(hasATL
      ? [
          {
            label: "ATL",
            value: fmt(price.allTimeLow!),
            sub: pctFmt(price.distanceFromATL ?? 0),
            subColor: "text-emerald-600",
          },
        ]
      : []),
    ...(atRange != null
      ? [
          {
            label: "% Range",
            value: fmt(atRange),
            sub: pctInAT,
          },
        ]
      : []),
  ];

  const showAllTime = allTimeItems.length > 0;
  const groups = [
    { title: "SMA Levels", items: smaItems },
    { title: "Support & Resistance", items: srItems },
    { title: "52 Week Range", items: week52Items },
    ...(showAllTime ? [{ title: "All Time Range", items: allTimeItems }] : []),
  ];

  return (
    <TabularCard title="Price Levels" titleCase>
      <div className="overflow-x-auto">
        <div className="flex w-full justify-between">
          {groups.map((group, i) => (
            <MetricGroup
              key={group.title}
              title={group.title}
              items={group.items}
              isLast={i === groups.length - 1}
            />
          ))}
        </div>
      </div>
    </TabularCard>
  );
}
