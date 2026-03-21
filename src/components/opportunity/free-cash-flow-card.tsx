"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import type {
  FreeCashFlowSection,
  FcfConversionDataPoint,
} from "@/types/opportunity";
import { StatusBadge } from "@/components/opportunity/status-badge";
import { InsightText } from "@/components/opportunity/bold-text";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { InsightsCard } from "@/components/opportunity/insights-card";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmtCr(s?: string | null): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[₹,\s]/g, "").replace("Cr", ""));
  return isNaN(n) ? 0 : n;
}

function statusTextColor(color?: string): string {
  if (color === "green") return "text-emerald-600 dark:text-emerald-400";
  if (color === "yellow") return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500";
}

// ─── Panel 1: Conversion Consistency (unchanged) ─────────────────────────────

function ConversionConsistencyPanel({ d }: { d: NonNullable<FreeCashFlowSection["conversion_consistency"]> }) {
  const threshold = d.healthy_threshold_pct;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Conversion Consistency — FCF / PAT %
        </p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-400">Healthy threshold</span>
        <div className="flex-1 border-t border-dashed border-yellow-400" />
        <span className="text-[10px] font-bold text-yellow-500">{threshold}%</span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {d.quarterly_data.map((q: FcfConversionDataPoint) => {
          const isFloor = !!q.is_floor;
          const isNull = q.pct == null;
          const aboveThreshold = !isNull && q.pct! >= threshold;
          return (
            <div key={q.quarter} className="flex flex-col items-center gap-1 min-w-[44px]">
              <span className={`text-[11px] font-bold ${
                isNull ? "text-zinc-400" :
                isFloor ? "text-yellow-500" :
                aboveThreshold ? "text-emerald-600 dark:text-emerald-400" :
                "text-red-500"
              }`}>
                {q.pct != null ? `${q.pct}%` : "—"}
              </span>
              <div className={`h-1 w-9 rounded-full ${
                isNull ? "bg-zinc-300 dark:bg-zinc-600" :
                isFloor ? "bg-yellow-400" :
                aboveThreshold ? "bg-emerald-500" :
                "bg-red-500"
              }`} />
              <span className={`text-[10px] ${isFloor ? "text-yellow-500 font-semibold" : "text-zinc-400"}`}>
                {q.quarter}
              </span>
              {isFloor && <span className="text-[10px] text-yellow-500 font-semibold leading-none">floor</span>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-zinc-200 dark:border-zinc-700 pt-3">
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">10Q Range</p>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
            {d.range_low != null ? `${d.range_low}%` : "—"} – {d.range_high != null ? `${d.range_high}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Floor</p>
          <p className="text-sm font-bold text-yellow-500">{d.floor_pct != null ? `${d.floor_pct}%` : "—"}</p>
          <p className="text-[10px] text-yellow-500 font-semibold">{d.floor_quarter}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">All 10Q above</p>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
            {d.healthy_threshold_pct}%{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">threshold</span>
          </p>
          {d.all_above_threshold && (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-emerald-500 text-white text-[10px] font-bold mt-0.5">
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Panel 2: FCF vs PAT Bar Chart ───────────────────────────────────────────

function GrowthTrajectoryPanel({ d }: { d: NonNullable<FreeCashFlowSection["growth_trajectory"]> }) {
  // Build 2-point chart from start/end strings
  const chartData = [
    { period: `Start (${d.periods})`, fcf: parseAmtCr(d.fcf_start), pat: parseAmtCr(d.pat_start) },
    { period: "Latest", fcf: parseAmtCr(d.fcf_end), pat: parseAmtCr(d.pat_end) },
  ];

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full flex flex-col">
      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">FCF vs PAT Comparison</p>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" strokeOpacity={0.6} vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e4e4e7", backgroundColor: "white" }}
              formatter={(v: number, name: string) => [`₹${v} Cr`, name]}
            />
            <Bar dataKey="fcf" name="Free Cash Flow" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fcf < 0 ? "#ef4444" : "#22c55e"} />
              ))}
            </Bar>
            <Bar dataKey="pat" name="PAT" fill="#22c55e" opacity={0.5} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
          Free Cash Flow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
          PAT
        </span>
      </div>

      {/* Insight body */}
      {d.insight_body && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <InsightText text={d.insight_body} />
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

  const col1 = (
    <>
      {/* FCF Conversion tile — shows range_high (best conversion) */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">FCF Conversion</p>
          {d.conversion_consistency && (
            <StatusBadge label={d.conversion_consistency.status} color={d.conversion_consistency.status_color} />
          )}
        </div>
        <p className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50 tracking-tight">
          {d.conversion_consistency?.range_high != null ? `${d.conversion_consistency.range_high}%` : "—"}
        </p>
        <p className="text-xs text-zinc-400">TTM Conversion Rate</p>
      </div>

      {/* FCF Growth tile */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">FCF Growth</p>
        <p className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50 tracking-tight">
          {d.growth_trajectory?.fcf_cagr_pct != null ? `${d.growth_trajectory.fcf_cagr_pct}%` : "—"}
        </p>
        {(d.growth_trajectory?.fcf_start && d.growth_trajectory?.fcf_end) && (
          <p className="text-xs text-zinc-400">{d.growth_trajectory.fcf_start} → {d.growth_trajectory.fcf_end}</p>
        )}
        {d.growth_trajectory?.status && (
          <p className={`text-xs font-semibold ${statusTextColor(d.growth_trajectory.status_color)}`}>
            {d.growth_trajectory.status}
          </p>
        )}
      </div>

      {/* FCF Yield tile */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">FCF Yield</p>
        <p className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50 tracking-tight">
          {yieldNow?.yield_pct != null ? `${yieldNow.yield_pct}%` : "—"}
        </p>
        {yieldNow?.zone && (
          <p className={`text-xs font-semibold ${statusTextColor(d.fcf_yield?.status_color)}`}>
            {yieldNow.zone}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {d.conversion_consistency && (
        <ConversionConsistencyPanel d={d.conversion_consistency} />
      )}

      <BentoSectionGrid
        col1={col1}
        col2={d.growth_trajectory ? <GrowthTrajectoryPanel d={d.growth_trajectory} /> : undefined}
        col3={
          d.ocf_to_fcf
            ? <FcfInsightCardsPanel ocf={d.ocf_to_fcf} growth={d.growth_trajectory} />
            : undefined
        }
        takeaway={
          d.growth_trajectory?.insight_body
            ? <InsightsCard title="TAKEAWAY" text={d.growth_trajectory.insight_body} />
            : undefined
        }
      />
    </div>
  );
}
