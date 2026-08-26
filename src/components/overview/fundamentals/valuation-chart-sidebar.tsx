"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonoEyebrow } from "@/components/overview/primitives";
import { formatINR } from "@/lib/utils";
import type { FundamentalsTrendPoint } from "@/types/screener";

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
  pegRatio?: number | null;
  evToEbitda?: number | null;
  pbRatio?: number | null;
}

export type ChartMetricKey =
  | "revenue"
  | "ebitda"
  | "netIncome"
  | "eps"
  | "cfo"
  | "totalDebt"
  | "totalEquity"
  | "interestCoverage"
  | "dividendYield"
  | "pegRatio"
  | "evToEbitda"
  | "pbRatio"
  | "pe";

function shortPeriod(p: string) {
  const qMatch = p.match(/(\d{4})[- _]?Q(\d)/i);
  if (qMatch) return `Q${qMatch[2]}'${qMatch[1].slice(2)}`;
  const fyMatch = p.match(/FY\s*(\d{2,4})/i);
  if (fyMatch) return `FY${fyMatch[1].slice(-2)}`;
  // "Mon YYYY" → "Mon'YY"
  const monYearMatch = p.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (monYearMatch) return `${monYearMatch[1]}'${monYearMatch[2].slice(2)}`;
  return p.length > 6 ? p.slice(-5) : p;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  format: (v: number) => string;
}

function CustomTooltip({ active, payload, label, format }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--qc-ink)",
        color: "#fff",
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: "var(--qc-fz-11)",
        fontFamily: "var(--qc-font-mono)",
        letterSpacing: ".02em",
        pointerEvents: "none",
      }}
    >
      <div style={{ opacity: 0.6, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: "var(--qc-w-semi)" }}>{format(payload[0].value)}</div>
    </div>
  );
}

interface Props {
  trend: QuarterlyTrendPoint[];
  dividendYieldTrend?: { period: string; dividendYield: number | null }[] | null;
  fundamentalsTrend?: FundamentalsTrendPoint[] | null;
  selectedMetric: ChartMetricKey | null;
  selectedLabel: string | null;
  formatValue: (v: number) => string;
}

const VALUATION_RATIO_TO_TREND_KEY: Partial<Record<ChartMetricKey, keyof Omit<QuarterlyTrendPoint, "period" | "ebitdaLabel" | "cfoLabel">>> = {
  // Empty now since we are graphing them directly, but keeping it in case of fallbacks
};

// When a ratio metric charts an underlying INR series, use INR formatting for the chart
const RATIO_USES_INR_SERIES = new Set<ChartMetricKey>(["evToEbitda"]);

// Keys that can be sourced from fundamentalsTrend when quarterlyTrend has no data
const FUNDAMENTALS_TREND_KEY: Partial<Record<ChartMetricKey, keyof Omit<FundamentalsTrendPoint, "period">>> = {
  eps: "eps",
  pe: "pe",
  pbRatio: "pb",
  revenue: "revenue",
  netIncome: "netProfit",
  pegRatio: "eps",
};

export function ValuationChartSidebar({ trend, dividendYieldTrend, fundamentalsTrend, selectedMetric, selectedLabel, formatValue }: Props) {
  // Ratio metrics (evToEbitda) chart the underlying INR series — override formatter
  // Note: ROCE and ROA are percentages, we want them to use formatValue which is handled in parent
  const chartFormat = selectedMetric && RATIO_USES_INR_SERIES.has(selectedMetric)
    ? formatINR
    : formatValue;

  const chartData = selectedMetric
    ? selectedMetric === "dividendYield"
      ? (dividendYieldTrend ?? [])
          .map((d) => ({ period: shortPeriod(d.period), value: d.dividendYield }))
          .filter((d): d is { period: string; value: number } => d.value != null)
      : (() => {
          const trendKey = selectedMetric === "cfo"
            ? null
            : VALUATION_RATIO_TO_TREND_KEY[selectedMetric] ?? (selectedMetric as keyof Omit<QuarterlyTrendPoint, "period" | "ebitdaLabel" | "cfoLabel">);

          const fromQuarterly = trend
            .map((d) => {
              const value = selectedMetric === "cfo"
                ? (d.cfo ?? d.cfoProxy)
                : (d[selectedMetric as keyof QuarterlyTrendPoint] ?? (trendKey ? d[trendKey] : null));
              return { period: shortPeriod(d.period), value: typeof value === "number" ? value : null };
            })
            .filter((d): d is { period: string; value: number } => d.value != null);

          if (fromQuarterly.length > 0) return fromQuarterly;

          const ftKey = FUNDAMENTALS_TREND_KEY[selectedMetric];
          if (!ftKey || !fundamentalsTrend?.length) return [];
          return fundamentalsTrend
            .map((d) => ({ period: shortPeriod(d.period), value: d[ftKey] }))
            .filter((d): d is { period: string; value: number } => d.value != null);
        })()
    : [];

  const hasData = chartData.length > 0;

  // Derived stats for the header strip
  const latestValue = hasData ? chartData[chartData.length - 1].value : null;
  const prevValue = hasData && chartData.length > 1 ? chartData[chartData.length - 2].value : null;
  const delta = latestValue != null && prevValue != null ? ((latestValue - prevValue) / Math.abs(prevValue)) * 100 : null;
  const deltaPos = delta != null ? delta >= 0 : null;

  const allValues = chartData.map((d) => d.value);
  const minVal = allValues.length ? Math.min(...allValues) : null;
  const maxVal = allValues.length ? Math.max(...allValues) : null;
  const minPeriod = minVal != null ? chartData.find((d) => d.value === minVal)?.period : null;
  const maxPeriod = maxVal != null ? chartData.find((d) => d.value === maxVal)?.period : null;
  const firstPeriod = chartData[0]?.period ?? null;
  const lastPeriod = chartData[chartData.length - 1]?.period ?? null;

  return (
    <aside
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: "18px 20px 0",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Lime gradient bg */}
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "55%",
          background: "linear-gradient(180deg, transparent 0%, var(--qc-lime) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Header: label + period range */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <MonoEyebrow>
          {selectedLabel ? selectedLabel : "Select a metric"}
        </MonoEyebrow>
        {hasData && firstPeriod && lastPeriod && (
          <span style={{ fontSize: "var(--qc-fz-9)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-2)", letterSpacing: ".06em" }}>
            {firstPeriod} – {lastPeriod}
          </span>
        )}
      </div>

      {/* Stat strip: latest value + QoQ delta */}
      {hasData && latestValue != null ? (
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: "var(--qc-fz-26)", fontWeight: "var(--qc-w-medium)", letterSpacing: "-0.02em", color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {chartFormat(latestValue)}
          </span>
          {delta != null && (
            <span
              style={{
                fontSize: "var(--qc-fz-10)",
                fontFamily: "var(--qc-font-mono)",
                fontWeight: "var(--qc-w-medium)",
                padding: "2px 7px",
                borderRadius: 5,
                letterSpacing: ".02em",
                background: deltaPos ? "var(--qc-up-soft)" : "var(--qc-down-soft)",
                color: deltaPos ? "var(--qc-up)" : "var(--qc-down)",
              }}
            >
              {deltaPos ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% QoQ
            </span>
          )}
        </div>
      ) : !selectedMetric ? (
        <div style={{ position: "relative", zIndex: 1, marginBottom: 14 }}>
          <span style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)", letterSpacing: "var(--qc-track-pill)" }}>
            Click any metric to chart it
          </span>
        </div>
      ) : null}

      {/* Min / max callout row */}
      {hasData && minVal != null && maxVal != null && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {[
            { label: "HIGH", value: maxVal, period: maxPeriod, color: "var(--qc-up)", bg: "var(--qc-up-soft)" },
            { label: "LOW",  value: minVal, period: minPeriod, color: "var(--qc-down)", bg: "var(--qc-down-soft)" },
          ].map(({ label, value, period, color, bg }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: bg,
                border: `1px solid ${color}30`,
                borderRadius: 8,
                padding: "6px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span style={{ fontSize: "var(--qc-fz-9)", fontFamily: "var(--qc-font-mono)", letterSpacing: ".1em", color, textTransform: "uppercase" as const }}>
                {label}{period ? ` · ${period}` : ""}
              </span>
              <span style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>
                {chartFormat(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chart or placeholder */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: hasData ? 160 : 120,
          marginLeft: -20,
          marginRight: -20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!selectedMetric || !hasData ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              color: "var(--qc-ink-2)",
              paddingBottom: 20,
            }}
          >
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none" style={{ opacity: 0.2 }}>
              <polyline
                points="2,22 10,14 16,18 24,8 34,4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-mono)", letterSpacing: ".06em", textTransform: "uppercase" as const, opacity: 0.5 }}>
              No data
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 14, bottom: 0, left: 14 }}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--qc-ink)" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="var(--qc-ink)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="period"
                tick={{
                  fontSize: 9,
                  fill: "var(--qc-ink-2)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: ".04em",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                content={<CustomTooltip format={chartFormat} />}
                cursor={{ stroke: "var(--qc-ink)", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--qc-ink)"
                strokeWidth={1.5}
                fill="url(#chartFill)"
                dot={false}
                activeDot={{ r: 3, fill: "var(--qc-ink)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </aside>
  );
}
