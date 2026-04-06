"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { TabularCard } from "@/components/molecules/tabular-card";
import type { CapexBreakdown, CapexBreakdownPeriod, CapexTimeframe } from "@/types/management";

// ─── Neutral palette per design system ────────────────────────────────────────

const SLICE_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8"];

const TIMEFRAME_OPTIONS: { key: CapexTimeframe; label: string }[] = [
  { key: "last_quarter", label: "Last Quarter" },
  { key: "12_months",    label: "12 Months"    },
  { key: "3_years",      label: "3 Years"      },
  { key: "5_years",      label: "5 Years"      },
];

// ─── Outline toggle (reused pattern from TabularCard) ─────────────────────────

function OutlineToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
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

// ─── Main component ────────────────────────────────────────────────────────────

export function CapexBreakdownChart({ data }: { data: CapexBreakdown }) {
  // Pick the first available timeframe as default
  const defaultTimeframe =
    (TIMEFRAME_OPTIONS.find((o) => data[o.key] !== null)?.key) ?? "last_quarter";

  const [activeTimeframe, setActiveTimeframe] = useState<CapexTimeframe>(defaultTimeframe);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const period: CapexBreakdownPeriod | null = data[activeTimeframe];

  return (
    <TabularCard
      title="Capital Deployment"
      subtitle="How leadership deployed capital across strategic priorities"
      titleCase
    >
      {/* Timeframe toggle — sits between header and content */}
      <div style={{ paddingBottom: 12, paddingTop: 4 }}>
        <OutlineToggle
          options={TIMEFRAME_OPTIONS}
          value={activeTimeframe}
          onChange={(v) => { setActiveTimeframe(v); setActiveIndex(null); }}
        />
      </div>

      {!period ? (
        <p style={{ fontSize: 13, color: "#888888", padding: "12px 0" }}>
          No data available for this timeframe.
        </p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-start" style={{ paddingBottom: 4 }}>
          {/* Donut chart */}
          <div style={{ position: "relative", width: 220, height: 220, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={period.slices}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={2}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  stroke="none"
                >
                  {period.slices.map((_, i) => (
                    <Cell
                      key={i}
                      fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                      opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={() => null} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              {activeIndex !== null && period.slices[activeIndex] ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172B" }}>
                    {period.slices[activeIndex].percentage}%
                  </div>
                  <div style={{ fontSize: 11, color: "#888888" }}>
                    {period.slices[activeIndex].name}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172B" }}>
                    {period.total_deployed_label}
                  </div>
                  <div style={{ fontSize: 10, color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Total
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend + summary */}
          <div className="flex-1 flex flex-col justify-between" style={{ minHeight: 220 }}>
            {/* Slice legend */}
            <div className="flex flex-col gap-3">
              {period.slices.map((slice, i) => (
                <div
                  key={slice.name}
                  className="flex items-center justify-between"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  style={{
                    cursor: "default",
                    opacity: activeIndex === null || activeIndex === i ? 1 : 0.4,
                    transition: "opacity 0.15s",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: SLICE_COLORS[i % SLICE_COLORS.length],
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ fontSize: 14, color: "#0F172B", fontWeight: 500 }}>
                      {slice.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172B" }}>
                      {slice.percentage}%
                    </div>
                    <div style={{ fontSize: 11, color: "#888888" }}>
                      {slice.amount_label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: "1px solid #E2E2E2" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Total Deployed
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172B" }}>
                  {period.total_deployed_label}
                </div>
                {period.vs_5yr_avg_pct !== 0 && (
                  <div style={{ fontSize: 11, color: period.vs_5yr_avg_pct > 0 ? "#16a34a" : "#dc2626", marginTop: 2 }}>
                    {period.vs_5yr_avg_pct > 0 ? "+" : ""}{period.vs_5yr_avg_pct}% vs 5yr avg
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Largest Allocation
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172B" }}>
                  {period.largest_allocation}
                </div>
                <div style={{ fontSize: 11, color: "#888888", marginTop: 2 }}>
                  {period.largest_allocation_pct}% of total
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </TabularCard>
  );
}
