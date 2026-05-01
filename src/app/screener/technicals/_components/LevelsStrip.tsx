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

type SubColorToken = "up" | "down" | "muted";

interface MetricItem {
  label: string;
  value: string;
  sub?: string;
  subColor?: SubColorToken;
  highlight?: boolean;
  tooltip?: string;
}

const SUB_COLOR: Record<SubColorToken, string> = {
  up: "var(--qc-up)",
  down: "var(--qc-down)",
  muted: "var(--qc-text-muted)",
};

function MetricCell({ label, value, sub, subColor, highlight, tooltip }: MetricItem) {
  return (
    <div className="relative flex flex-col gap-0.5 px-5 py-2 group">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>
        {label}
      </span>
      <span
        className="text-base whitespace-nowrap"
        style={{ color: "var(--qc-text-heading)", fontWeight: highlight ? 700 : 600 }}
      >
        {value}
      </span>
      {sub != null && (
        <span className="text-[11px] font-semibold" style={{ color: subColor ? SUB_COLOR[subColor] : "var(--qc-text-muted)" }}>
          {sub}
        </span>
      )}
      {tooltip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-[6px] px-2 py-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ background: "var(--qc-text-heading)", color: "var(--qc-surface-white)" }}>
          {tooltip}
        </div>
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
      <div className="px-5 pt-2 pb-1.5" style={{ borderBottom: "1px solid var(--qc-border-inner)" }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>
          {title}
        </span>
      </div>
      {/* Metric cells in a row */}
      <div className="flex">
        {items.map((item, i) => (
          <div key={item.label} className="flex">
            {i > 0 && <div className="w-px self-stretch" style={{ background: "var(--qc-border-inner)" }} />}
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
          ? "up"
          : "down"
        : distPct > 0
          ? "down"
          : "up",
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
            subColor: (price.cmp >= support ? "up" : "down") as SubColorToken,
          },
        ]
      : []),
    ...(resistance
      ? [
          {
            label: "Resistance",
            value: fmt(resistance),
            sub: pctFmt(((price.cmp - resistance) / resistance) * 100),
            subColor: (price.cmp >= resistance ? "up" : "down") as SubColorToken,
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

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined;

  const week52Items: MetricItem[] = [
    {
      label: "52W High",
      value: fmt(price.high52w),
      sub: pctFmt(price.distanceFrom52wHigh),
      subColor: "down" as SubColorToken,
      tooltip: fmtDate(price.high52wDate),
    },
    {
      label: "52W Low",
      value: fmt(price.low52w),
      sub: pctFmt(price.distanceFrom52wLow),
      subColor: "up" as SubColorToken,
      tooltip: fmtDate(price.low52wDate),
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
            subColor: "down" as SubColorToken,
            tooltip: fmtDate(price.allTimeHighDate),
          },
        ]
      : []),
    ...(hasATL
      ? [
          {
            label: "ATL",
            value: fmt(price.allTimeLow!),
            sub: pctFmt(price.distanceFromATL ?? 0),
            subColor: "up" as SubColorToken,
            tooltip: fmtDate(price.allTimeLowDate),
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
