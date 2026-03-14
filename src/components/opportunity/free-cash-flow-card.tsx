"use client";

import type {
  FreeCashFlowSection,
  FcfConversionDataPoint,
  FcfYieldDataPoint,
} from "@/types/opportunity";
import { SegmentedBar } from "@/components/opportunity/segmented-bar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RenderWithBold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  green:  { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700", dot: "bg-emerald-500" },
  yellow: { badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",     dot: "bg-yellow-500" },
  red:    { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700",                        dot: "bg-red-500" },
};

function StatusBadge({ status, color }: { status: string; color?: string }) {
  const c = STATUS_COLORS[color ?? "green"] ?? STATUS_COLORS.green;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${c.badge}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

// Bar for the OCF→FCF panel — delegates to segmented bar
function HorizBar({ pct, color }: { pct: number; color: string }) {
  return <SegmentedBar pct={pct} color={color} />;
}

// ─── Panel 1: Conversion Consistency ─────────────────────────────────────────

function ConversionConsistencyPanel({ d }: { d: NonNullable<FreeCashFlowSection["conversion_consistency"]> }) {
  const threshold = d.healthy_threshold_pct;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Conversion Consistency — FCF / PAT %
        </p>
        <StatusBadge status={d.status} color={d.status_color} />
      </div>

      {/* Threshold line label */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-400">Healthy threshold</span>
        <div className="flex-1 border-t border-dashed border-yellow-400" />
        <span className="text-[10px] font-bold text-yellow-500">{threshold}%</span>
      </div>

      {/* Quarters */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {d.quarterly_data.map((q: FcfConversionDataPoint) => {
          const isFloor = !!q.is_floor;
          const isNull = q.pct == null;
          const aboveThreshold = !isNull && q.pct! >= threshold;
          return (
            <div key={q.quarter} className="flex flex-col items-center gap-1 min-w-[44px]">
              <span
                className={`text-[11px] font-bold ${
                  isNull ? "text-zinc-400" :
                  isFloor ? "text-yellow-500" :
                  aboveThreshold ? "text-emerald-600 dark:text-emerald-400" :
                  "text-red-500"
                }`}
              >
                {q.pct != null ? `${q.pct}%` : "—"}
              </span>
              <div
                className={`h-1 w-9 rounded-full ${
                  isNull ? "bg-zinc-300 dark:bg-zinc-600" :
                  isFloor ? "bg-yellow-400" :
                  aboveThreshold ? "bg-emerald-500" :
                  "bg-red-500"
                }`}
              />
              <span className={`text-[9px] ${isFloor ? "text-yellow-500 font-semibold" : "text-zinc-400"}`}>
                {q.quarter}
              </span>
              {isFloor && <span className="text-[9px] text-yellow-500 font-semibold leading-none">floor</span>}
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-auto">
        <div>
          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">10Q Range</p>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
            {d.range_low != null ? `${d.range_low}%` : "—"} –<br />{d.range_high != null ? `${d.range_high}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Floor</p>
          <p className="text-sm font-bold text-yellow-500">{d.floor_pct != null ? `${d.floor_pct}%` : "—"}</p>
          <p className="text-[10px] text-yellow-500 font-semibold">{d.floor_quarter}</p>
        </div>
        <div>
          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">All 10Q above</p>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
            {d.healthy_threshold_pct}%{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">threshold</span>
          </p>
          {d.all_above_threshold && (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-emerald-500 text-white text-[9px] font-bold mt-0.5">
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Panel 2: FCF vs PAT Growth Trajectory ───────────────────────────────────

const INSIGHT_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800/60", text: "text-emerald-700 dark:text-emerald-300" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-950/50",   border: "border-yellow-200 dark:border-yellow-800/60",   text: "text-yellow-700 dark:text-yellow-300" },
  red:    { bg: "bg-red-50 dark:bg-red-950/50",         border: "border-red-200 dark:border-red-800/60",         text: "text-red-700 dark:text-red-300" },
};

function GrowthTrajectoryPanel({ d }: { d: NonNullable<FreeCashFlowSection["growth_trajectory"]> }) {
  const ic = INSIGHT_COLOR_MAP[d.status_color ?? "green"] ?? INSIGHT_COLOR_MAP.green;
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          FCF vs PAT Growth Trajectory
        </p>
        <StatusBadge status={d.status} color={d.status_color} />
      </div>

      {/* CAGR comparison */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
        {/* FCF side */}
        <div className="rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 text-center space-y-0.5">
          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">FCF CAGR ({d.periods})</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{d.fcf_cagr_pct != null ? `+${d.fcf_cagr_pct}%` : "—"}</p>
          <p className="text-[10px] text-zinc-500">
            {d.fcf_start} → {d.fcf_end}
          </p>
        </div>

        <span className="text-xs font-bold text-zinc-400 text-center">VS</span>

        {/* PAT side */}
        <div className="rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 text-center space-y-0.5">
          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">PAT CAGR ({d.periods})</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{d.pat_cagr_pct != null ? `+${d.pat_cagr_pct}%` : "—"}</p>
          <p className="text-[10px] text-zinc-500">
            {d.pat_start} → {d.pat_end}
          </p>
        </div>
      </div>

      {/* Insight box */}
      <div className={`rounded-md ${ic.bg} border ${ic.border} p-3`}>
        <p className={`text-[11px] font-semibold ${ic.text}`}>▲ {d.insight_headline}</p>
      </div>

      {/* Body */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-auto">
        <RenderWithBold text={d.insight_body} />
      </p>
    </div>
  );
}

// ─── Panel 3: OCF → FCF Drag ─────────────────────────────────────────────────

function OcfToFcfPanel({ d }: { d: NonNullable<FreeCashFlowSection["ocf_to_fcf"]> }) {
  // Normalize bars to the same scale so none overshoots 100%
  const maxPct = Math.max(d.ocf_bar_pct ?? 0, d.capex_bar_pct ?? 0, d.fcf_bar_pct ?? 0);
  const norm = (pct: number) => maxPct > 100 ? Math.round((pct / maxPct) * 100) : (pct ?? 0);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          OCF → FCF Drag (Capex)
        </p>
        <StatusBadge status={d.status} color={d.status_color} />
      </div>

      {/* Bars */}
      <div className="space-y-4 flex-1">
        {/* OCF */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">OCF (TTM)</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{d.ocf_ttm}</span>
          </div>
          <HorizBar pct={norm(d.ocf_bar_pct)} color="bg-blue-500" />
        </div>

        {/* Capex */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">Less: Capex</span>
            <span className="text-sm font-bold text-red-500">{d.capex}</span>
          </div>
          <HorizBar pct={norm(d.capex_bar_pct)} color="bg-red-400" />
        </div>

        {/* FCF */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">FCF (TTM)</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{d.fcf_ttm}</span>
          </div>
          <SegmentedBar pct={norm(d.fcf_bar_pct)} color="bg-emerald-500" />
        </div>
      </div>

      {/* Summary footer */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex items-end justify-between gap-2 flex-wrap">
        <p className="text-[10px] text-zinc-400 leading-tight">
          Capex / Revenue&nbsp;&nbsp;Capex drag on OCF&nbsp;&nbsp;Scope to improve
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{d.capex_revenue_pct}%</span>
          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{d.capex_ocf_pct}% only</span>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{d.drag_description}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Panel 4: FCF Yield — Then vs Now ────────────────────────────────────────

function FcfYieldPanel({ d }: { d: NonNullable<FreeCashFlowSection["fcf_yield"]> }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          FCF Yield — Then vs Now
        </p>
        <StatusBadge status={d.status} color={d.status_color} />
      </div>

      {/* Yield cards */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${d.yield_history.length}, 1fr)` }}>
        {d.yield_history.map((y: FcfYieldDataPoint, i: number) => {
          const isCurrent = !!y.is_current;
          const isLast = i === d.yield_history.length - 1;
          return (
            <div key={y.label} className="flex items-center gap-1">
              <div
                className={`flex-1 rounded-md p-3 text-center space-y-0.5 ${
                  isCurrent
                    ? "border border-yellow-300 dark:border-yellow-600/60 bg-yellow-50 dark:bg-yellow-950/40"
                    : "bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {isCurrent ? (
                  <p className="text-[9px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">Today</p>
                ) : (
                  <p className="text-[9px] text-zinc-400">{y.label}</p>
                )}
                <p
                  className={`text-3xl font-bold tracking-tight ${
                    isCurrent ? "text-yellow-600 dark:text-yellow-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {y.yield_pct != null ? `${y.yield_pct}%` : "—"}
                </p>
                <p className={`text-[9px] ${isCurrent ? "text-yellow-500" : "text-zinc-400"}`}>
                  {y.zone}
                </p>
              </div>
              {!isLast && (
                <span className="text-zinc-400 text-sm font-bold shrink-0">→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Compression explanation */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-auto space-y-1">
        <p className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">Why compressed?</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{d.compression_explanation}</p>
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {d.conversion_consistency && (
          <ConversionConsistencyPanel d={d.conversion_consistency} />
        )}
        {d.growth_trajectory && (
          <GrowthTrajectoryPanel d={d.growth_trajectory} />
        )}
        {d.ocf_to_fcf && (
          <OcfToFcfPanel d={d.ocf_to_fcf} />
        )}
        {d.fcf_yield && (
          <FcfYieldPanel d={d.fcf_yield} />
        )}
      </div>
    </div>
  );
}
