"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { TabularCard } from "@/components/molecules/tabular-card";
import type { RoceTrend, RoceTrendMetric, RoceTrendView } from "@/types/management";

// ─── Types ─────────────────────────────────────────────────────────────────────

type RoceViewKey = "quarterly" | "yearly";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sentimentColor(sentiment: RoceTrendMetric["sentiment"]): string {
  switch (sentiment) {
    case "positive": return "#16a34a";
    case "negative": return "#dc2626";
    default:         return "#0F172B";
  }
}

function sentimentSubColor(sentiment: RoceTrendMetric["sentiment"]): string {
  switch (sentiment) {
    case "positive": return "#16a34a";
    case "negative": return "#dc2626";
    default:         return "#888888";
  }
}

// ─── Outline toggle ────────────────────────────────────────────────────────────

function OutlineToggle({
  options,
  value,
  onChange,
}: {
  options: { key: RoceViewKey; label: string }[];
  value: RoceViewKey;
  onChange: (v: RoceViewKey) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${value === opt.key ? "#0F172B" : "#E2E2E2"}`,
            background: value === opt.key ? "#0F172B" : "transparent",
            color: value === opt.key ? "#ffffff" : "#888888",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const VIEW_OPTIONS: { key: RoceViewKey; label: string }[] = [
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly",    label: "Yearly"    },
];

// ─── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: RoceTrendMetric }) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid #F0F0F0",
        background: "#FAFAFA",
        padding: "10px 14px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "#888888",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {metric.label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: sentimentColor(metric.sentiment),
          lineHeight: 1.2,
        }}
      >
        {metric.value}
      </div>
      {metric.sub_label && (
        <div
          style={{
            fontSize: 11,
            color: sentimentSubColor(metric.sentiment),
            marginTop: 3,
          }}
        >
          {metric.sub_label}
        </div>
      )}
    </div>
  );
}

// ─── Chart view ────────────────────────────────────────────────────────────────

function RoceChartView({ view }: { view: RoceTrendView }) {
  const chartData = view.data_points.map((pt) => ({ x: pt.period, roce: pt.roce }));

  return (
    <div className="flex flex-col gap-4">
      {/* Metric cards — above the chart */}
      {view.metrics.length > 0 && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${Math.min(view.metrics.length, 4)}, 1fr)`,
            gap: 8,
          }}
        >
          {view.metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>
      )}

      {/* Line chart */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 11, fill: "#888888" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#888888" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              border: "1px solid #E2E2E2",
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ fontWeight: 600, color: "#0F172B", marginBottom: 4 }}
            formatter={(v: number) => [`${v}%`, "ROCE"]}
          />

          {/* WACC threshold reference line */}
          {view.wacc_threshold !== null && (
            <ReferenceLine
              y={view.wacc_threshold}
              stroke="#dc2626"
              strokeWidth={1.5}
              label={{
                value: `WACC threshold (${view.wacc_threshold}%)`,
                position: "insideTopRight",
                style: { fontSize: 10, fill: "#dc2626" },
              }}
            />
          )}

          {/* Period average reference line */}
          {view.period_avg_roce !== null && (
            <ReferenceLine
              y={view.period_avg_roce}
              stroke="#71717a"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: `Period average`,
                position: "insideBottomRight",
                style: { fontSize: 10, fill: "#71717a" },
              }}
            />
          )}

          <Line
            dataKey="roce"
            name="ROCE"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#2563eb" }}
            type="monotone"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Chart legend */}
      <div className="flex items-center gap-5" style={{ paddingTop: 4 }}>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#888888" }}>ROCE</span>
        </div>
        {view.wacc_threshold !== null && (
          <div className="flex items-center gap-1.5">
            <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#dc2626" strokeWidth="2" /></svg>
            <span style={{ fontSize: 12, color: "#888888" }}>WACC threshold ({view.wacc_threshold}%)</span>
          </div>
        )}
        {view.period_avg_roce !== null && (
          <div className="flex items-center gap-1.5">
            <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#71717a" strokeWidth="2" strokeDasharray="4 2" /></svg>
            <span style={{ fontSize: 12, color: "#888888" }}>Period average</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function RoceTrendChart({ data }: { data: RoceTrend }) {
  const defaultView: RoceViewKey =
    data.quarterly !== null ? "quarterly" : "yearly";

  const [activeView, setActiveView] = useState<RoceViewKey>(defaultView);

  const view = data[activeView];

  const headerAction = view?.date_range ? (
    <span style={{ fontSize: 12, color: "#888888" }}>{view.date_range}</span>
  ) : undefined;

  return (
    <TabularCard
      title="Return on Capital Employed"
      subtitle={`ROCE = EBIT ÷ Capital Employed  ·  Measures how efficiently management generates profit from capital`}
      titleCase
      headerAction={headerAction}
    >
      <div className="flex flex-col gap-4 p-2">
        {/* View toggle */}
        <OutlineToggle
          options={VIEW_OPTIONS}
          value={activeView}
          onChange={setActiveView}
        />

        {!view ? (
          <p style={{ fontSize: 13, color: "#888888" }}>No data available for this view.</p>
        ) : (
          <RoceChartView view={view} />
        )}
      </div>
    </TabularCard>
  );
}
