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
  Cell,
} from "recharts";
import { CheckCircle2, AlertTriangle, Info, Percent, TrendingUp, DollarSign } from "lucide-react";
import type {
  FreeCashFlowSection,
  FcfConversionDataPoint,
} from "@/types/opportunity";
import { InsightText } from "@/components/opportunity/bold-text";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { InsightsCard } from "@/components/opportunity/insights-card";
import { MetricTile } from "@/components/molecules/metric-tile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmtCr(s?: string | null): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[₹,\s]/g, "").replace("Cr", ""));
  return isNaN(n) ? 0 : n;
}

function conversionColor(pct: number | null, threshold: number): string {
  if (pct == null) return "#a1a1aa";
  if (pct < 0) return "#ef4444";
  if (pct >= threshold) return "#22c55e";
  return "#f59e0b";
}

// Colored dot per conversion threshold
const ConversionDot = (props: { cx?: number; cy?: number; payload?: FcfConversionDataPoint & { threshold: number } }) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload || payload.pct == null) return null;
  return <circle cx={cx} cy={cy} r={5} fill={conversionColor(payload.pct, payload.threshold)} stroke="white" strokeWidth={2} />;
};

// ─── Panel 2 (col2): Hybrid FCF / PAT + Conversion % Chart ───────────────────

function FcfChartPanel({
  growth,
  conversion,
}: {
  growth: NonNullable<FreeCashFlowSection["growth_trajectory"]>;
  conversion?: NonNullable<FreeCashFlowSection["conversion_consistency"]>;
}) {
  const threshold = conversion?.healthy_threshold_pct ?? 80;

  // Merge quarterly conversion data with FCF/PAT bar data.
  // Bars use only the two anchor points (Start, Latest); line uses all quarters.
  const quarterlyData: (FcfConversionDataPoint & { threshold: number; fcf?: number; pat?: number })[] =
    (conversion?.quarterly_data ?? []).map((q, i, arr) => {
      const isStart = i === 0;
      const isEnd = i === arr.length - 1;
      return {
        ...q,
        threshold,
        fcf: isStart ? parseAmtCr(growth.fcf_start) : isEnd ? parseAmtCr(growth.fcf_end) : undefined,
        pat: isStart ? parseAmtCr(growth.pat_start) : isEnd ? parseAmtCr(growth.pat_end) : undefined,
      };
    });

  // Fallback: if no quarterly data, build 2-point chart
  const chartData = quarterlyData.length > 0
    ? quarterlyData
    : [
        { quarter: `Start (${growth.periods})`, pct: null, threshold, fcf: parseAmtCr(growth.fcf_start), pat: parseAmtCr(growth.pat_start) },
        { quarter: "Latest", pct: null, threshold, fcf: parseAmtCr(growth.fcf_end), pat: parseAmtCr(growth.pat_end) },
      ];

  const rangeData = conversion;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">FCF vs PAT Comparison</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Bars = absolute values · Line = FCF/PAT conversion %</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">FCF / PAT %</p>
          <p className="text-[10px] text-zinc-400">&gt;{threshold}% = healthy · &lt;{threshold}% = compressed</p>
        </div>
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 180 }}>
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
              tickFormatter={(v) => `₹${v}`}
              domain={["auto", "auto"]}
            />
            <YAxis
              yAxisId="right" orientation="right"
              tick={{ fontSize: 9, fill: "#f59e0b" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e4e4e7", backgroundColor: "white" }}
              itemStyle={{ padding: '0px 10px' }}
              formatter={(value: number, name: string) =>
                name === "FCF/PAT %"
                  ? [`${value}%`, name]
                  : [`₹${value} Cr`, name]
              }
            />
            <ReferenceLine yAxisId="right" y={threshold} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
            <Bar yAxisId="left" dataKey="fcf" name="Free Cash Flow" barSize={11} radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={(entry.fcf ?? 0) < 0 ? "#ef4444" : "#22c55e"} opacity={0.85} />
              ))}
            </Bar>
            <Bar yAxisId="left" dataKey="pat" name="PAT" fill="#22c55e" opacity={0.35} barSize={11} radius={[2, 2, 0, 0]} />
            <Line
              yAxisId="right"
              dataKey="pct"
              name="FCF/PAT %"
              stroke="#f59e0b"
              strokeWidth={3}
              connectNulls={false}
              dot={<ConversionDot />}
              activeDot={{ r: 6, fill: "#f59e0b" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-600 dark:text-zinc-400 mt-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 opacity-85 inline-block" />
          Free Cash Flow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 opacity-35 inline-block" />
          PAT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-yellow-500 inline-block" />
          FCF/PAT Conversion %
        </span>
      </div>

      {/* Stats row */}
      {rangeData && (
        <div className="grid grid-cols-3 gap-2 border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">10Q Range</p>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {rangeData.range_low != null ? `${rangeData.range_low}%` : "—"} – {rangeData.range_high != null ? `${rangeData.range_high}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Floor</p>
            <p className="text-sm font-bold text-yellow-500">{rangeData.floor_pct != null ? `${rangeData.floor_pct}%` : "—"}</p>
            <p className="text-[10px] text-yellow-500 font-semibold">{rangeData.floor_quarter}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">All 10Q above</p>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {rangeData.healthy_threshold_pct}%{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">threshold</span>
            </p>
            {rangeData.all_above_threshold && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-emerald-500 text-white text-[10px] font-bold mt-0.5">
                ✓
              </span>
            )}
          </div>
        </div>
      )}

      {/* Insight body */}
      {growth.insight_body && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-3">
          <InsightText text={growth.insight_body} />
        </p>
      )}
    </div>
  );
}

// ─── Panel 3: FCF Insight Cards ───────────────────────────────────────────────

function FcfInsightCardsPanel({
  ocf,
  growth,
}: {
  ocf: NonNullable<FreeCashFlowSection["ocf_to_fcf"]>;
  growth?: FreeCashFlowSection["growth_trajectory"];
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full flex flex-col">
      {/* Card 1 — OCF (green) */}
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 p-3 space-y-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Operating Cash Flow</p>
        </div>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed pl-6">
          OCF robust at {ocf.ocf_ttm} (TTM), demonstrating healthy earnings quality despite FCF compression
        </p>
      </div>

      {/* Card 2 — Capex Drag (red) */}
      <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/40 p-3 space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Capex Drag</p>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed pl-6">
          Capex of {ocf.capex.replace("-", "")} absorbed {ocf.capex_ocf_pct}% of OCF, reducing FCF to {ocf.fcf_ttm}
        </p>
      </div>

      {/* Card 3 — Capex Intensity (blue) */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40 p-3 space-y-1">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500 shrink-0" />
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Capex Intensity</p>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed pl-6">
          Capex at {ocf.capex_revenue_pct}% of revenue — {ocf.capex_ocf_pct > 50 ? "3x above" : "at"} normal 5-6% maintenance level
        </p>
      </div>

      {/* Key stats row */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1 mt-auto">
        {growth?.pat_cagr_pct != null && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">PAT Growth:</span> +{growth.pat_cagr_pct}% YoY
          </p>
        )}
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold">FCF/Revenue:</span> {ocf.capex_revenue_pct > 0 ? (100 - ocf.capex_revenue_pct).toFixed(1) : "—"}%
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold">Capex/OCF:</span> {ocf.capex_ocf_pct}%
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FreeCashFlowCardProps {
  data?: FreeCashFlowSection;
}

export function FreeCashFlowCard({ data }: FreeCashFlowCardProps) {
  const d = data ?? {};
  const yieldNow = d.fcf_yield?.yield_history?.find((y) => y.is_current);

  const fcfGrowthSublabel = (d.growth_trajectory?.fcf_start && d.growth_trajectory?.fcf_end)
    ? `${d.growth_trajectory.fcf_start} → ${d.growth_trajectory.fcf_end}`
    : undefined;

  const col1 = (
    <>
      <MetricTile
        label="FCF Conversion"
        value={d.conversion_consistency?.range_high != null ? `${d.conversion_consistency.range_high}%` : "—"}
        sublabel="TTM Conversion Rate"
        icon={Percent}
      />
      <MetricTile
        label="FCF Growth"
        value={d.growth_trajectory?.fcf_cagr_pct != null ? `${d.growth_trajectory.fcf_cagr_pct}%` : "—"}
        sublabel={fcfGrowthSublabel}
        change={d.growth_trajectory?.status}
        icon={TrendingUp}
      />
      <MetricTile
        label="FCF Yield"
        value={yieldNow?.yield_pct != null ? `${yieldNow.yield_pct}%` : "—"}
        sublabel={yieldNow?.zone}
        icon={DollarSign}
      />
    </>
  );

  return (
    <div className="space-y-4">
      <BentoSectionGrid
        col1={col1}
        col2={
          d.growth_trajectory
            ? <FcfChartPanel growth={d.growth_trajectory} conversion={d.conversion_consistency} />
            : undefined
        }
        col3={
          d.ocf_to_fcf
            ? <FcfInsightCardsPanel ocf={d.ocf_to_fcf} growth={d.growth_trajectory} />
            : undefined
        }
        takeaway={
          d.growth_trajectory?.insight_body
            ? <InsightsCard title="FREE CASH FLOW" text={d.growth_trajectory.insight_body} />
            : undefined
        }
      />
    </div>
  );
}
