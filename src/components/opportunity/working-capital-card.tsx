"use client";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import type { WorkingCapitalSection } from "@/types/opportunity";
import { InsightText } from "@/components/opportunity/bold-text";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { InsightsCard } from "@/components/opportunity/insights-card";
import { MetricTile } from "@/components/molecules/metric-tile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  green:  { badge: "text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700", dot: "bg-emerald-500" },
  yellow: { badge: "text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",     dot: "bg-yellow-500" },
  red:    { badge: "text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700",                 dot: "bg-red-500" },
};

function SignalBadge({ label, color }: { label: string; color?: string }) {
  const c = STATUS_COLORS[color ?? "green"] ?? STATUS_COLORS.green;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold ${c.badge}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}

// Custom tooltip for the chart
function WcTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 shadow-sm text-xs">
      <p className="text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="font-semibold text-zinc-800 dark:text-zinc-100">{payload[0].value}%</p>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function WcTrendChartPanel({ d }: { d: NonNullable<WorkingCapitalSection["trend_chart"]> }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full">
      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{d.title}</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={d.data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="wcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.6} vertical={false} />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 9, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<WcTooltip />} />
            <Area
              type="monotone"
              dataKey="wc_pct"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#wcGradient)"
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {d.verdict_badge && (
        <div>
          <SignalBadge label={d.verdict_badge} color={d.verdict_color} />
        </div>
      )}
    </div>
  );
}

function WcSignalsPanel({ signals, insight }: { signals?: WorkingCapitalSection["signals"]; insight?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full">
      {signals && signals.length > 0 && (
        <div className="flex flex-col gap-2">
          {signals.map((s, i) => (
            <SignalBadge key={i} label={s.label} color={s.color} />
          ))}
        </div>
      )}
      {insight && (
        <div className="rounded border border-blue-200 dark:border-blue-800/40 px-3 py-2.5">
          <p className="text-xs font-light text-zinc-500 dark:text-zinc-400 leading-relaxed"><InsightText text={insight} /></p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface WorkingCapitalCardProps {
  data?: WorkingCapitalSection;
}

export function WorkingCapitalCard({ data }: WorkingCapitalCardProps) {
  const d = data ?? { quarters: [], rows: [] };
  const latestIdx = d.quarters.length > 0 ? d.quarters.length - 1 : 0;

  const col1 = (
    <>
      {d.rows.map((row) => (
        <MetricTile
          key={row.key}
          label={row.label}
          value={String(row.values[latestIdx] ?? "—")}
          sublabel={d.quarters[latestIdx] ?? "Latest"}
        />
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      {/* Full-width multi-quarter metrics table */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60">
                  METRIC
                </th>
                {d.quarters.map((q) => (
                  <th
                    key={q}
                    className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60"
                  >
                    {q}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.rows.map((row) => {
                const isCcc = row.key === "ccc";
                return (
                  <tr
                    key={row.key}
                    className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${
                      isCcc ? "bg-zinc-50/50 dark:bg-zinc-800/30" : ""
                    }`}
                  >
                    <td
                      className={`px-4 py-3.5 text-xs font-semibold ${
                        isCcc ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {row.label}
                    </td>
                    {row.values.map((val, j) => (
                      <td
                        key={j}
                        className={`px-4 py-3.5 text-right text-xs font-semibold ${
                          isCcc
                            ? "text-zinc-900 dark:text-zinc-50"
                            : "text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {val ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BentoSectionGrid
        col1={col1}
        col2={d.trend_chart ? <WcTrendChartPanel d={d.trend_chart} /> : undefined}
        col3={
          (d.signals?.length || d.insight)
            ? <WcSignalsPanel signals={d.signals} insight={d.insight} />
            : undefined
        }
        takeaway={
          d.insight
            ? <InsightsCard title="WORKING CAPITAL TAKEAWAY" text={d.insight} />
            : undefined
        }
      />
    </div>
  );
}
