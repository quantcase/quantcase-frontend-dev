"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
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

// ─── Subcomponents ─────────────────────────────────────────────────────────────

type WcChartDataPoint = {
  quarter: string;
  wc_pct?: number;
  dso?: number | null;
  dio?: number | null;
  dpo?: number | null;
};

function WcTrendChartPanel({
  d,
  quarters,
  rows,
}: {
  d: NonNullable<WorkingCapitalSection["trend_chart"]>;
  quarters: string[];
  rows: WorkingCapitalSection["rows"];
}) {
  // Build merged dataset: one entry per quarter from rows, annotated with wc_pct from trend_chart
  const wcByQuarter = new Map(d.data.map((pt) => [pt.quarter, pt.wc_pct]));
  const dsoRow = rows.find((r) => r.key === "dso");
  const dioRow = rows.find((r) => r.key === "dio");
  const dpoRow = rows.find((r) => r.key === "dpo");

  // Use trend_chart quarters as base (it may have more granular data),
  // but also include row quarters if trend_chart data is sparse.
  const allQuarters = d.data.length > 0
    ? d.data.map((pt) => pt.quarter)
    : quarters;

  const chartData: WcChartDataPoint[] = allQuarters.map((q) => {
    const rowIdx = quarters.indexOf(q);
    return {
      quarter: q,
      wc_pct: wcByQuarter.get(q),
      dso: rowIdx >= 0 ? (dsoRow?.values[rowIdx] ?? undefined) : undefined,
      dio: rowIdx >= 0 ? (dioRow?.values[rowIdx] ?? undefined) : undefined,
      dpo: rowIdx >= 0 ? (dpoRow?.values[rowIdx] ?? undefined) : undefined,
    };
  });

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col flex-1">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{d.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Bars = DSO / DIO / DPO (days) · Line = WC as % of Revenue</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">WC % = Working Capital / Revenue</p>
          <p className="text-[10px] text-zinc-400">Lower % = more asset-efficient</p>
        </div>
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 36, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" strokeOpacity={0.6} />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 9, fill: "#a1a1aa" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              yAxisId="left" orientation="left"
              tick={{ fontSize: 9, fill: "#a1a1aa" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}d`}
              domain={["auto", "auto"]}
            />
            <YAxis
              yAxisId="right" orientation="right"
              tick={{ fontSize: 9, fill: "#3b82f6" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e4e4e7", backgroundColor: "white" }}
              formatter={(value: number, name: string) =>
                name === "WC % of Revenue"
                  ? [`${value}%`, name]
                  : [`${value} days`, name]
              }
            />
            <ReferenceLine yAxisId="left" y={0} stroke="#71717a" strokeWidth={1} />
            <Bar yAxisId="left" dataKey="dso" name="DSO" fill="#6366f1" opacity={0.7} barSize={9} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="dio" name="DIO" fill="#f59e0b" opacity={0.7} barSize={9} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="dpo" name="DPO" fill="#22c55e" opacity={0.5} barSize={9} radius={[2, 2, 0, 0]} />
            <Line
              yAxisId="right"
              dataKey="wc_pct"
              name="WC % of Revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#3b82f6", stroke: "white", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#3b82f6" }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-600 dark:text-zinc-400 mt-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500 opacity-70 inline-block" />
          DSO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-yellow-500 opacity-70 inline-block" />
          DIO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-500 opacity-50 inline-block" />
          DPO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-blue-500 inline-block" />
          WC % of Revenue
        </span>
      </div>

      {d.verdict_badge && (
        <div className="mt-3">
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
      <BentoSectionGrid
        col1={col1}
        col2={d.trend_chart ? <WcTrendChartPanel d={d.trend_chart} quarters={d.quarters} rows={d.rows} /> : undefined}
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
