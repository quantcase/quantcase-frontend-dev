"use client";

import type { CapitalStructureSection } from "@/types/opportunity";
import { SegmentedBar } from "@/components/opportunity/segmented-bar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  green: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
  yellow: {
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",
    dot: "bg-yellow-500",
  },
  red: {
    badge:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700",
    dot: "bg-red-500",
  },
};

function StatusBadge({ label, color }: { label: string; color?: string }) {
  const c = STATUS_COLORS[color ?? "green"] ?? STATUS_COLORS.green;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${c.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}

// Renders bold segments from **text** markdown
function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-zinc-800 dark:text-zinc-100">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

const DEBT_BAR_COLORS: Record<string, string> = {
  red: "bg-red-400",
  amber: "bg-amber-400",
  green: "bg-emerald-400",
};

// ─── Panel: Balance Sheet ──────────────────────────────────────────────────────

function BalanceSheetPanel({ d }: { d: NonNullable<CapitalStructureSection["balance_sheet"]> }) {
  const maxVal = Math.max(...d.timeline.map((t) => parseFloat(t.value.replace("K", ""))));

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Balance Sheet Position
        </p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      {/* Cash & Debt bars */}
      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-zinc-600 dark:text-zinc-300">Cash &amp; Investments</span>
            <span
              className="font-bold text-zinc-800 dark:text-zinc-100 truncate max-w-[140px] text-right"
              title={d.cash_investments}
            >
              {d.cash_investments}
            </span>
          </div>
          <SegmentedBar pct={d.cash_bar_pct} color="bg-emerald-400" />
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-zinc-600 dark:text-zinc-300">Gross Debt</span>
            <span className="font-bold text-red-500">{d.gross_debt}</span>
          </div>
          <SegmentedBar pct={d.debt_bar_pct} color="bg-red-400" />
        </div>
      </div>

      {/* Net Cash headline */}
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-200">Net Cash</span>
        <span className="text-[20px] font-bold text-zinc-900 dark:text-zinc-50">{d.net_cash}</span>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
          Net Cash — FY20 to FY24
        </p>
        <div className="flex items-end gap-1">
          {d.timeline.map((t) => {
            const val = parseFloat(t.value.replace("K", ""));
            const h = Math.round((val / maxVal) * 48);
            return (
              <div key={t.label} className="flex-1 flex flex-col items-center gap-1">
                <span
                  className={`text-[9px] font-semibold ${
                    t.is_current
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400"
                  }`}
                  title={t.value}
                >
                  {t.value.split(" ")[0]}
                </span>
                <div
                  className={`w-full rounded-t-sm ${
                    t.is_current ? "bg-emerald-400" : "bg-emerald-200 dark:bg-emerald-800/50"
                  }`}
                  style={{ height: `${h}px` }}
                />
                <span
                  className={`text-[9px] ${
                    t.is_current
                      ? "font-bold text-zinc-700 dark:text-zinc-200"
                      : "text-zinc-400"
                  }`}
                >
                  {t.label}
                  {t.is_current && " ↑"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
        <BoldText text={d.insight} />
      </p>
    </div>
  );
}

// ─── Panel: Debt Trajectory ────────────────────────────────────────────────────

function DebtTrajectoryPanel({
  d,
}: {
  d: NonNullable<CapitalStructureSection["debt_trajectory"]>;
}) {
  const maxVal = Math.max(...d.bars.map((b) => b.value));

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Debt Trajectory
        </p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      {/* Sub-label */}
      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
        Gross Debt — FY20 to FY24 (₹CR)
      </p>

      {/* Bar chart */}
      <div className="flex items-end gap-2">
        {d.bars.map((b) => {
          const h = Math.round((b.value / maxVal) * 64);
          const barColor = DEBT_BAR_COLORS[b.color ?? "green"] ?? "bg-zinc-300";
          return (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-bold ${
                  b.is_current ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-500"
                }`}
              >
                {b.value.toLocaleString()}
              </span>
              <div
                className={`w-full rounded-t-sm ${barColor}`}
                style={{ height: `${h}px` }}
              />
              <span
                className={`text-[9px] ${
                  b.is_current
                    ? "font-bold text-zinc-700 dark:text-zinc-200"
                    : "text-zinc-400"
                }`}
              >
                {b.label}
                {b.is_current && " ↓"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <div className="text-center">
          <p className="text-[9px] text-zinc-400 mb-0.5">Peak Debt</p>
          <p className="text-[14px] font-bold text-red-500">{d.peak_debt}</p>
          {d.peak_label && (
            <p className="text-[9px] text-zinc-400">{d.peak_label}</p>
          )}
        </div>
        <div className="text-center">
          <p className="text-[9px] text-zinc-400 mb-0.5">Current</p>
          <p className="text-[14px] font-bold text-zinc-800 dark:text-zinc-100">
            {d.current_debt}
          </p>
          {d.current_label && (
            <p className="text-[9px] text-zinc-400">{d.current_label}</p>
          )}
        </div>
        <div className="text-center">
          <p className="text-[9px] text-zinc-400 mb-0.5">Reduction</p>
          <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
            {d.reduction_pct}
          </p>
          {d.reduction_label && (
            <p className="text-[9px] text-zinc-400">{d.reduction_label}</p>
          )}
        </div>
      </div>

      {/* Insight */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
        <BoldText text={d.insight} />
      </p>
    </div>
  );
}

// ─── Panel: Equity Allocation ──────────────────────────────────────────────────

function EquityAllocationPanel({
  d,
}: {
  d: NonNullable<CapitalStructureSection["equity_allocation"]>;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Equity &amp; Profit Allocation
        </p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      {/* Sub-label */}
      <p className="text-[10px] text-zinc-400 italic">
        Of every ₹100 earned, how much stays in the business vs goes out to shareholders?
      </p>

      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
        PAT Allocation per year — Retained vs Paid Out
      </p>

      {/* Stacked bars */}
      <div className="space-y-1.5">
        {d.rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span
              className={`w-8 text-[10px] shrink-0 ${
                row.is_current
                  ? "font-bold text-zinc-700 dark:text-zinc-200"
                  : "text-zinc-400"
              }`}
            >
              {row.label}
            </span>
            <div className="flex-1 flex h-4 rounded-sm overflow-hidden">
              <div
                className="bg-emerald-400 h-full"
                style={{ width: `${row.kept_pct ?? 0}%` }}
              />
              <div
                className="bg-zinc-200 dark:bg-zinc-600 h-full flex-1"
              />
            </div>
            <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">
              {row.kept_pct != null ? `${row.kept_pct}%` : "—"} kept · {row.paid_pct != null ? `${row.paid_pct}%` : "—"} paid
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm bg-emerald-400 inline-block" />
          Retained in business
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-600 inline-block" />
          Paid as dividends / buybacks
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <div>
          <p className="text-[9px] text-zinc-400 mb-0.5">{d.total_equity_sublabel ?? "Total Equity"}</p>
          <p className="text-[15px] font-bold text-zinc-800 dark:text-zinc-100">{d.total_equity}</p>
        </div>
        <div>
          <p className="text-[9px] text-zinc-400 mb-0.5">ROE (FY24)</p>
          <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">{d.roe}</p>
          {d.roe_sublabel && (
            <p className="text-[9px] text-zinc-400">{d.roe_sublabel}</p>
          )}
        </div>
        <div>
          <p className="text-[9px] text-zinc-400 mb-0.5">Payout Trend</p>
          <p
            className={`text-[15px] font-bold ${
              d.payout_trend_direction === "up"
                ? "text-amber-500"
                : d.payout_trend_direction === "down"
                ? "text-red-500"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {d.payout_trend}{" "}
            {d.payout_trend_direction === "up"
              ? "▲"
              : d.payout_trend_direction === "down"
              ? "▼"
              : ""}
          </p>
          {d.payout_sublabel && (
            <p className="text-[9px] text-zinc-400">{d.payout_sublabel}</p>
          )}
        </div>
      </div>

      {/* Insight */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <BoldText text={d.insight} />
      </p>
    </div>
  );
}

// ─── Panel: Capex Intensity ────────────────────────────────────────────────────

const CAPEX_BAR_COLORS: Record<string, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400",
};

function CapexIntensityPanel({
  d,
}: {
  d: NonNullable<CapitalStructureSection["capex_intensity"]>;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Capex Intensity
        </p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {d.metrics.map((m) => {
          const barColor = CAPEX_BAR_COLORS[m.status ?? "green"] ?? "bg-emerald-400";
          return (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-300">{m.label}</span>
                <div className="flex items-center gap-2">
                  {m.max_label && (
                    <span className="text-zinc-400 text-[10px]">{m.max_label}</span>
                  )}
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">
                    {m.value}
                    {m.status === "green" ? " ▼" : m.status === "yellow" ? " ●" : " ▲"}
                  </span>
                </div>
              </div>
              <SegmentedBar pct={m.bar_pct} color={barColor} />
              {m.note && (
                <p className="text-[10px] text-zinc-400">{m.note}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Note box */}
      {d.note && (
        <div className="rounded border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 px-3 py-2.5">
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
            {d.note}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CapitalStructureCardProps {
  data?: CapitalStructureSection;
}

export function CapitalStructureCard({ data }: CapitalStructureCardProps) {
  const d = data ?? {};

  return (
    <div className="space-y-4">
      {/* Row 1: Balance Sheet + Debt Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {d.balance_sheet && <BalanceSheetPanel d={d.balance_sheet} />}
        {d.debt_trajectory && <DebtTrajectoryPanel d={d.debt_trajectory} />}
      </div>

      {/* Row 2: Equity Allocation + Capex Intensity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {d.equity_allocation && <EquityAllocationPanel d={d.equity_allocation} />}
        {d.capex_intensity && <CapexIntensityPanel d={d.capex_intensity} />}
      </div>
    </div>
  );
}
