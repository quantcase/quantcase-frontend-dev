"use client";

import { formatINR } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ChartMetricKey } from "./valuation-chart-sidebar";
import type { FundamentalsTrendPoint } from "@/types/screener";

// ─── Inline sparkline ─────────────────────────────────────────────────────────

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return null;
  const w = 100;
  const h = 18;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const barW = Math.floor(w / values.length) - 1;
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {values.map((v, i) => {
        const barH = Math.max(2, ((v - min) / range) * (h - 2));
        return (
          <rect
            key={i}
            x={i * (barW + 1)}
            y={h - barH}
            width={barW}
            height={barH}
            rx={1}
            fill={i === values.length - 1 ? "#64748B" : "#CBD5E1"}
          />
        );
      })}
    </svg>
  );
}

// ─── KpiCard ─────────────────────────────────────────────────────────────────

interface YoyResult {
  text: string;
  cls: "pos" | "neg" | "na";
}

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  yoy: YoyResult;
  muted?: boolean;
  sparkValues: number[];
  metricKey: ChartMetricKey | null;
  selected: boolean;
  onSelect: (key: ChartMetricKey | null) => void;
  formatValue?: (v: number) => string;
}

function KpiCard({ label, value, unit, yoy, muted, sparkValues, metricKey, selected, onSelect }: KpiCardProps) {
  const yoyBg =
    yoy.cls === "pos" ? "var(--qc-up-soft)"
    : yoy.cls === "neg" ? "var(--qc-down-soft)"
    : "var(--qc-chip, #F2F1EC)";
  const yoyColor =
    yoy.cls === "pos" ? "var(--qc-up)"
    : yoy.cls === "neg" ? "var(--qc-down)"
    : "var(--qc-ink-2)";

  const Icon =
    yoy.cls === "pos" ? TrendingUp
    : yoy.cls === "neg" ? TrendingDown
    : Minus;

  const isClickable = metricKey != null && !muted;

  return (
    <div
      onClick={isClickable ? () => onSelect(selected ? null : metricKey) : undefined}
      style={{
        background: selected
          ? "linear-gradient(180deg, #fdfbf3 0%, #faefc4 100%)"
          : muted
          ? "var(--qc-section, #F2F1EC)"
          : "var(--qc-card)",
        padding: "10px 14px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 88,
        cursor: isClickable ? "pointer" : "default",
        transition: "background 0.12s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11.5, color: "var(--qc-ink)", letterSpacing: ".01em" }}>
          {label}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5, padding: "2px 6px", borderRadius: 4,
            letterSpacing: ".02em", fontWeight: 500, lineHeight: 1.3,
            background: yoyBg,
            color: yoyColor,
            display: "inline-flex", alignItems: "center", gap: 3,
          }}
        >
          <Icon size={10} strokeWidth={2.5} />
          {yoy.text}
        </span>
      </div>
      {muted ? (
        <div style={{ fontSize: 18, fontWeight: 400, color: "var(--qc-ink-2)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1, marginTop: "auto" }}>
          —
        </div>
      ) : (
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1, marginTop: "auto" }}>
          {value}
          {unit && <span style={{ fontSize: 12, fontWeight: 400, color: "var(--qc-ink-2)", marginLeft: 3, letterSpacing: 0 }}>{unit}</span>}
        </div>
      )}
      {/* Sparkline */}
      {!muted && sparkValues.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <Sparkline values={sparkValues} />
        </div>
      )}
    </div>
  );
}

// ─── KpiGrid ─────────────────────────────────────────────────────────────────

function yoyText(growth: number | null | undefined, invert = false): YoyResult {
  if (growth == null) return { text: "—", cls: "na" };
  const sign = growth >= 0 ? "+" : "";
  const pctStr = `${sign}${(growth * 100).toFixed(1)}% YoY`;
  const isPositive = invert ? growth < 0 : growth >= 0;
  return { text: pctStr, cls: isPositive ? "pos" : "neg" };
}

interface QuarterlyTrendPoint {
  period: string;
  revenue: number | null;
  ebitda: number | null;
  ebitdaLabel: string | null;
  netIncome: number | null;
  eps: number | null;
  cfo: number | null;
  cfoProxy: number | null;
  cfoLabel: string | null;
  totalDebt: number | null;
  totalEquity: number | null;
  interestCoverage: number | null;
}

type SparkKey = keyof Omit<QuarterlyTrendPoint, "period">;

function sparkFor(trend: QuarterlyTrendPoint[], key: SparkKey): number[] {
  return trend
    .map((d) => key === "cfo" ? (d.cfo ?? d.cfoProxy) : d[key])
    .filter((v): v is number => v != null);
}

interface KpiGridProps {
  // Valuation metrics (top row)
  pegRatio?: number | null;
  evToEbitda?: number | null;
  pbRatio?: number | null;
  dividendYield?: number | null;
  dividendYieldTrend?: { period: string; dividendYield: number | null }[] | null;
  // Financial metrics
  revenue: number | null;
  revenueGrowth: number | null | undefined;
  ebitda: number | null;
  ebitdaGrowth: number | null | undefined;
  ebitdaLabel?: string;
  netProfit: number | null;
  netProfitGrowth: number | null | undefined;
  operatingCashflow: number | null;
  cfoGrowth: number | null | undefined;
  freeCashflow: number | null;
  fcfGrowth: number | null | undefined;
  reserves: number | null;
  reservesGrowth: number | null | undefined;
  totalDebt: number | null;
  debtGrowth: number | null | undefined;
  interestCoverage: number | null;
  interestCoverageGrowth: number | null;
  showInterestCoverage?: boolean;
  trend: QuarterlyTrendPoint[];
  fundamentalsTrend?: FundamentalsTrendPoint[] | null;
  selectedMetric: ChartMetricKey | null;
  onSelectMetric: (key: ChartMetricKey | null) => void;
  embedded?: boolean;
}

type DivYieldTrendPoint = { period: string; dividendYield: number | null };

function divYieldSparkValues(divTrend: DivYieldTrendPoint[] | null | undefined): number[] {
  return (divTrend ?? []).map((d) => d.dividendYield).filter((v): v is number => v != null);
}

function ftSparkFor(ft: FundamentalsTrendPoint[] | null | undefined, key: keyof Omit<FundamentalsTrendPoint, "period">): number[] {
  return (ft ?? []).map((d) => d[key]).filter((v): v is number => v != null);
}

export function KpiGrid({
  pegRatio, evToEbitda, pbRatio, dividendYield, dividendYieldTrend,
  revenue, revenueGrowth,
  ebitda, ebitdaGrowth, ebitdaLabel = "EBITDA",
  netProfit, netProfitGrowth,
  operatingCashflow, cfoGrowth,
  freeCashflow, fcfGrowth,
  reserves, reservesGrowth,
  totalDebt, debtGrowth,
  interestCoverage, interestCoverageGrowth,
  showInterestCoverage = true,
  trend,
  fundamentalsTrend,
  selectedMetric,
  onSelectMetric,
  embedded = false,
}: KpiGridProps) {
  const resolvedCfo = operatingCashflow ?? (trend.find((d) => d.cfoProxy != null)?.cfoProxy ?? null);

  const showValuationRow = pegRatio !== undefined || evToEbitda !== undefined || pbRatio !== undefined || dividendYield !== undefined;

  // Helper: prefer quarterly trend spark, fall back to fundamentalsTrend
  function sparkWithFallback(sparkKey: SparkKey, ftKey: keyof Omit<FundamentalsTrendPoint, "period">): number[] {
    const fromQ = sparkFor(trend, sparkKey);
    return fromQ.length > 0 ? fromQ : ftSparkFor(fundamentalsTrend, ftKey);
  }

  const cards: {
    label: string;
    value: string;
    yoy: YoyResult;
    muted: boolean;
    metricKey: ChartMetricKey | null;
    sparkKey: SparkKey | null;
    customSparkValues?: number[];
  }[] = [
    ...(showValuationRow ? [
      {
        label: "PEG (Growth-adj.)", value: pegRatio != null ? `${pegRatio.toFixed(1)}x` : "—",
        yoy: { text: "—", cls: "na" as const }, muted: pegRatio == null,
        metricKey: "pegRatio" as ChartMetricKey, sparkKey: "eps" as SparkKey,
        customSparkValues: sparkWithFallback("eps", "eps"),
      },
      {
        label: "EV/EBITDA (Enterprise)", value: evToEbitda != null ? `${evToEbitda.toFixed(1)}x` : "—",
        yoy: { text: "—", cls: "na" as const }, muted: evToEbitda == null,
        metricKey: "evToEbitda" as ChartMetricKey, sparkKey: "ebitda" as SparkKey,
      },
      {
        label: "P/B (Book value)", value: pbRatio != null ? `${pbRatio.toFixed(1)}x` : "—",
        yoy: { text: "—", cls: "na" as const }, muted: pbRatio == null,
        metricKey: "pbRatio" as ChartMetricKey, sparkKey: "totalEquity" as SparkKey,
        customSparkValues: sparkWithFallback("totalEquity", "pb"),
      },
      {
        label: "Dividend Yield (Trailing 12M)",
        value: dividendYield != null && dividendYield > 0 ? `${dividendYield.toFixed(2)}%` : "—",
        yoy: { text: "—", cls: "na" as const },
        muted: dividendYield == null || dividendYield <= 0,
        metricKey: "dividendYield" as ChartMetricKey,
        sparkKey: null,
        customSparkValues: divYieldSparkValues(dividendYieldTrend),
      },
    ] : []),
    {
      label: "Revenue", value: formatINR(revenue), yoy: yoyText(revenueGrowth),
      muted: false, metricKey: "revenue", sparkKey: "revenue",
      customSparkValues: sparkWithFallback("revenue", "revenue"),
    },
    {
      label: ebitdaLabel, value: ebitda != null ? formatINR(ebitda) : "—", yoy: yoyText(ebitdaGrowth),
      muted: ebitda == null, metricKey: "ebitda", sparkKey: "ebitda",
    },
    {
      label: "Net Profit", value: netProfit != null ? formatINR(netProfit) : "—", yoy: yoyText(netProfitGrowth),
      muted: netProfit == null, metricKey: "netIncome", sparkKey: "netIncome",
      customSparkValues: sparkWithFallback("netIncome", "netProfit"),
    },
    {
      label: "CFO", value: resolvedCfo != null ? formatINR(resolvedCfo) : "—", yoy: yoyText(cfoGrowth),
      muted: resolvedCfo == null, metricKey: "cfo", sparkKey: "cfo",
    },
    {
      label: "FCF", value: freeCashflow != null ? formatINR(freeCashflow) : "—", yoy: yoyText(fcfGrowth),
      muted: freeCashflow == null, metricKey: null, sparkKey: null,
    },
    {
      label: "Reserves", value: reserves != null ? formatINR(reserves) : "—", yoy: yoyText(reservesGrowth),
      muted: reserves == null, metricKey: "totalEquity", sparkKey: "totalEquity",
    },
    {
      label: "Debt", value: totalDebt != null ? formatINR(totalDebt) : "—", yoy: yoyText(debtGrowth, true),
      muted: totalDebt == null, metricKey: "totalDebt", sparkKey: "totalDebt",
    },
    ...(showInterestCoverage ? [{
      label: "Interest Coverage",
      value: interestCoverage != null ? `${interestCoverage.toFixed(1)}x` : "—",
      yoy: yoyText(interestCoverageGrowth),
      muted: interestCoverage == null,
      metricKey: "interestCoverage" as ChartMetricKey,
      sparkKey: "interestCoverage" as SparkKey,
    }] : []),
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 1,
        background: "var(--qc-hair)",
        ...(embedded ? {} : {
          border: "1px solid var(--qc-hair)",
          borderRadius: 14,
          marginBottom: 14,
        }),
        overflow: "hidden",
      }}
    >
      {cards.map(({ label, value, yoy, muted, metricKey, sparkKey, customSparkValues }) => (
        <KpiCard
          key={label}
          label={label}
          value={value}
          yoy={yoy}
          muted={muted}
          sparkValues={customSparkValues ?? (sparkKey != null ? sparkFor(trend, sparkKey) : [])}
          metricKey={metricKey}
          selected={metricKey != null && selectedMetric === metricKey}
          onSelect={onSelectMetric}
        />
      ))}
    </div>
  );
}
