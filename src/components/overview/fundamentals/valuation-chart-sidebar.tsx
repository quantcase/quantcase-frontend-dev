"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MonoEyebrow } from "@/components/overview/primitives";

interface QuarterlyTrendPoint {
  period: string;
  revenue: number | null;
  ebitda: number | null;
  netIncome: number | null;
  eps: number | null;
  cfo: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
}

export type ChartMetricKey =
  | "revenue"
  | "ebitda"
  | "netIncome"
  | "eps"
  | "cfo"
  | "totalDebt"
  | "totalEquity";

function shortPeriod(p: string) {
  const qMatch = p.match(/(\d{4})[- _]?Q(\d)/i);
  if (qMatch) return `Q${qMatch[2]}'${qMatch[1].slice(2)}`;
  const fyMatch = p.match(/FY\s*(\d{2,4})/i);
  if (fyMatch) return `FY${fyMatch[1].slice(-2)}`;
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
        fontSize: 11,
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: ".02em",
        pointerEvents: "none",
      }}
    >
      <div style={{ opacity: 0.6, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{format(payload[0].value)}</div>
    </div>
  );
}

interface Props {
  trend: QuarterlyTrendPoint[];
  selectedMetric: ChartMetricKey | null;
  selectedLabel: string | null;
  formatValue: (v: number) => string;
}

export function ValuationChartSidebar({ trend, selectedMetric, selectedLabel, formatValue }: Props) {
  const chartData = selectedMetric
    ? trend
        .filter((d) => d[selectedMetric] != null)
        .map((d) => ({
          period: shortPeriod(d.period),
          value: d[selectedMetric] as number,
        }))
    : [];

  const hasData = chartData.length > 0;

  return (
    <aside
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 18,
        padding: "18px 20px 0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
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

      <div style={{ position: "relative", zIndex: 1 }}>
        <MonoEyebrow>
          {selectedLabel ? `Chart · ${selectedLabel}` : "Chart · Click a metric below"}
        </MonoEyebrow>
      </div>

      {/* Chart or placeholder */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 130,
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
            }}
          >
            {/* Ghost chart icon */}
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none" style={{ opacity: 0.25 }}>
              <polyline
                points="2,22 10,14 16,18 24,8 34,4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Click a metric to view chart
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData} margin={{ top: 8, right: 14, bottom: 0, left: 14 }}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--qc-ink)" stopOpacity={0.12} />
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
                content={<CustomTooltip format={formatValue} />}
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
