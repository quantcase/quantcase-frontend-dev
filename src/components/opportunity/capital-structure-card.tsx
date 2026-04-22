"use client";

import { Wallet, TrendingDown, PieChart, BarChart2, Percent } from "lucide-react";
import type { CapitalStructureSection } from "@/types/opportunity";
import { SegmentedBar } from "@/components/opportunity/segmented-bar";
import { StatusBadge } from "@/components/opportunity/status-badge";
import { InsightText } from "@/components/opportunity/bold-text";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { InsightsCard } from "@/components/opportunity/insights-card";
import { MetricTile } from "@/components/molecules/metric-tile";

// Bar color mapping using semantic CSS vars via Tailwind — Recharts not used here so we can map to CSS-compatible classes
function debtBarColor(color?: string): string {
  if (color === "red") return "bg-[--qc-down]";
  if (color === "amber") return "bg-[--qc-warn]";
  return "bg-[--qc-up]";
}

function capexBarColor(color?: string): string {
  if (color === "red") return "bg-[--qc-down]";
  if (color === "yellow") return "bg-[--qc-warn]";
  return "bg-[--qc-up]";
}

// ─── Panel: Balance Sheet ──────────────────────────────────────────────────────

function BalanceSheetPanel({ d }: { d: NonNullable<CapitalStructureSection["balance_sheet"]> }) {
  const maxVal = Math.max(...d.timeline.map((t) => parseFloat(t.value.replace("K", ""))));

  return (
    <div className="rounded-lg p-4 space-y-4 h-full" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>
          Balance Sheet Position
        </p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: "var(--qc-text-body)" }}>Cash &amp; Investments</span>
            <span className="font-bold truncate max-w-[140px] text-right" style={{ color: "var(--qc-text-heading)" }} title={d.cash_investments}>
              {d.cash_investments}
            </span>
          </div>
          <SegmentedBar pct={d.cash_bar_pct} color="bg-emerald-400" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: "var(--qc-text-body)" }}>Gross Debt</span>
            <span className="font-bold" style={{ color: "var(--qc-down)" }}>{d.gross_debt}</span>
          </div>
          <SegmentedBar pct={d.debt_bar_pct} color="bg-red-400" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--qc-border-inner)" }}>
        <span className="text-xs font-bold" style={{ color: "var(--qc-text-body)" }}>Net Cash</span>
        <span className="text-[20px] font-bold" style={{ color: "var(--qc-text-heading)" }}>{d.net_cash}</span>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--qc-text-muted)" }}>
          Net Cash — FY20 to FY24
        </p>
        <div className="flex gap-1 mb-1">
          {d.timeline.map((t) => (
            <div key={t.label} className="flex-1 text-center">
              <span className="text-[10px] font-semibold" style={{ color: t.is_current ? "var(--qc-up)" : "var(--qc-text-muted)" }} title={t.value}>
                {t.value.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-1 h-12">
          {d.timeline.map((t) => {
            const val = parseFloat(t.value.replace("K", ""));
            const h = maxVal > 0 ? Math.round((val / maxVal) * 48) : 2;
            return (
              <div
                key={t.label}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${Math.max(h, 2)}px`,
                  background: t.is_current ? "var(--qc-up)" : "var(--qc-up-soft)",
                }}
              />
            );
          })}
        </div>
        <div className="flex gap-1 mt-1">
          {d.timeline.map((t) => (
            <div key={t.label} className="flex-1 text-center">
              <span className="text-[10px]" style={{ color: t.is_current ? "var(--qc-text-heading)" : "var(--qc-text-muted)", fontWeight: t.is_current ? 700 : 400 }}>
                {t.label}{t.is_current && " ↑"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {d.insight && (
        <div className="rounded px-3 py-2.5" style={{ border: "1px solid var(--qc-blue)", background: "var(--qc-blue-soft)" }}>
          <p className="text-xs font-light leading-relaxed" style={{ color: "var(--qc-text-muted)" }}><InsightText text={d.insight} /></p>
        </div>
      )}
    </div>
  );
}

// ─── Panel: Debt Trajectory ────────────────────────────────────────────────────

function DebtTrajectoryPanel({ d }: { d: NonNullable<CapitalStructureSection["debt_trajectory"]> }) {
  const maxVal = Math.max(...d.bars.map((b) => b.value));

  return (
    <div className="rounded-lg p-4 flex flex-col flex-1" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>Debt Trajectory</p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--qc-text-muted)" }}>
        Gross Debt — FY20 to FY24 (₹CR)
      </p>

      <div className="flex gap-2 mb-1">
        {d.bars.map((b) => (
          <div key={b.label} className="flex-1 text-center">
            <span className="text-[10px] font-bold" style={{ color: b.is_current ? "var(--qc-text-heading)" : "var(--qc-text-muted)" }}>
              {b.value != null ? b.value.toLocaleString() : "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex items-end gap-2" style={{ minHeight: 120 }}>
        {d.bars.map((b) => {
          const pct = maxVal > 0 ? (b.value / maxVal) * 100 : 0;
          const bg = b.color === "red" ? "var(--qc-down)" : b.color === "amber" ? "var(--qc-warn)" : "var(--qc-up)";
          return (
            <div key={b.label} className="flex-1 rounded-t-sm" style={{ height: `${pct}%`, background: bg }} />
          );
        })}
      </div>

      <div className="flex gap-2 mt-1">
        {d.bars.map((b) => (
          <div key={b.label} className="flex-1 text-center">
            <span className="text-[10px]" style={{ color: b.is_current ? "var(--qc-text-body)" : "var(--qc-text-muted)", fontWeight: b.is_current ? 700 : 400 }}>
              {b.label}{b.is_current && " ↓"}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 mt-3" style={{ borderTop: "1px solid var(--qc-border-inner)" }}>
        <div className="text-center">
          <p className="text-[10px] mb-0.5" style={{ color: "var(--qc-text-muted)" }}>Peak Debt</p>
          <p className="text-xs font-semibold" style={{ color: "var(--qc-down)" }}>{d.peak_debt}</p>
          {d.peak_label && <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{d.peak_label}</p>}
        </div>
        <div className="text-center">
          <p className="text-[10px] mb-0.5" style={{ color: "var(--qc-text-muted)" }}>Current</p>
          <p className="text-xs font-semibold" style={{ color: "var(--qc-text-heading)" }}>{d.current_debt}</p>
          {d.current_label && <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{d.current_label}</p>}
        </div>
        <div className="text-center">
          <p className="text-[10px] mb-0.5" style={{ color: "var(--qc-text-muted)" }}>Reduction</p>
          <p className="text-xs font-semibold" style={{ color: "var(--qc-up)" }}>{d.reduction_pct}</p>
          {d.reduction_label && <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{d.reduction_label}</p>}
        </div>
      </div>

      {d.insight && (
        <div className="rounded px-3 py-2.5 mt-3" style={{ border: "1px solid var(--qc-blue)", background: "var(--qc-blue-soft)" }}>
          <p className="text-xs font-light leading-relaxed" style={{ color: "var(--qc-text-muted)" }}><InsightText text={d.insight} /></p>
        </div>
      )}
    </div>
  );
}

// ─── Panel: Equity Allocation ──────────────────────────────────────────────────

function EquityAllocationPanel({ d }: { d: NonNullable<CapitalStructureSection["equity_allocation"]> }) {
  return (
    <div className="rounded-lg p-4 flex flex-col flex-1" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-heading)" }}>PAT Allocation</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--qc-text-muted)" }}>Retained vs Paid Out</p>
        </div>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      <p className="text-[10px] italic mb-4" style={{ color: "var(--qc-text-muted)" }}>
        Of every ₹100 earned, how much stays vs goes to shareholders?
      </p>

      <div className="flex-1 min-h-0 space-y-3" style={{ minHeight: 80 }}>
        {d.rows.map((row) => {
          const kept = row.kept_pct ?? 0;
          const paid = row.paid_pct ?? 0;
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px]" style={{ color: row.is_current ? "var(--qc-text-heading)" : "var(--qc-text-muted)", fontWeight: row.is_current ? 700 : 400 }}>
                  {row.label}
                </span>
                <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--qc-up)" }}>{kept}% retained</span>
                  {paid > 0 && <> · <span className="font-semibold" style={{ color: "var(--qc-warn)" }}>{paid}% paid out</span></>}
                </span>
              </div>
              <div className="flex h-5 w-full rounded overflow-hidden gap-[2px]">
                {kept > 0 && (
                  <div className="h-full rounded-l" style={{ width: `${kept}%`, background: "var(--qc-up)" }} />
                )}
                {paid > 0 && (
                  <div className="h-full rounded-r" style={{ width: `${paid}%`, background: "var(--qc-warn)" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-[10px] mt-4" style={{ color: "var(--qc-text-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3.5 rounded-sm inline-block" style={{ background: "var(--qc-up)" }} />
          Retained in business
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-3.5 rounded-sm inline-block" style={{ background: "var(--qc-warn)" }} />
          Paid as dividends / buybacks
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 mt-4" style={{ borderTop: "1px solid var(--qc-border-inner)" }}>
        <div>
          <p className="text-[10px] mb-0.5" style={{ color: "var(--qc-text-muted)" }}>{d.total_equity_sublabel ?? "Total Equity"}</p>
          <p className="text-xs font-semibold" style={{ color: "var(--qc-text-heading)" }}>{d.total_equity}</p>
        </div>
        <div>
          <p className="text-[10px] mb-0.5" style={{ color: "var(--qc-text-muted)" }}>ROE (FY24)</p>
          <p className="text-xs font-semibold" style={{ color: "var(--qc-up)" }}>{d.roe}</p>
          {d.roe_sublabel && <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{d.roe_sublabel}</p>}
        </div>
        <div>
          <p className="text-[10px] mb-0.5" style={{ color: "var(--qc-text-muted)" }}>Payout Trend</p>
          <p className="text-xs font-semibold" style={{
            color: d.payout_trend_direction === "up" ? "var(--qc-warn)"
              : d.payout_trend_direction === "down" ? "var(--qc-down)"
              : "var(--qc-text-body)",
          }}>
            {d.payout_trend}{" "}
            {d.payout_trend_direction === "up" ? "▲" : d.payout_trend_direction === "down" ? "▼" : ""}
          </p>
          {d.payout_sublabel && <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{d.payout_sublabel}</p>}
        </div>
      </div>

      {d.insight && (
        <div className="rounded px-3 py-2.5 mt-3" style={{ border: "1px solid var(--qc-blue)", background: "var(--qc-blue-soft)" }}>
          <p className="text-xs font-light leading-relaxed" style={{ color: "var(--qc-text-muted)" }}><InsightText text={d.insight} /></p>
        </div>
      )}
    </div>
  );
}

// ─── Panel: Capex Intensity ────────────────────────────────────────────────────

function CapexIntensityPanel({ d }: { d: NonNullable<CapitalStructureSection["capex_intensity"]> }) {
  return (
    <div className="rounded-lg p-4 space-y-4 h-full" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>Capex Intensity</p>
        <StatusBadge label={d.status} color={d.status_color} />
      </div>

      <div className="space-y-4">
        {d.metrics.map((m) => {
          const barColor = m.status === "red" ? "bg-red-400" : m.status === "yellow" ? "bg-amber-400" : "bg-emerald-400";
          return (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--qc-text-body)" }}>{m.label}</span>
                <div className="flex items-center gap-2">
                  {m.max_label && <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{m.max_label}</span>}
                  <span className="font-bold" style={{ color: "var(--qc-text-heading)" }}>
                    {m.value}
                    {m.status === "green" ? " ▼" : m.status === "yellow" ? " ●" : " ▲"}
                  </span>
                </div>
              </div>
              <SegmentedBar pct={m.bar_pct} color={barColor} />
              {m.note && <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{m.note}</p>}
            </div>
          );
        })}
      </div>

      {d.note && (
        <div className="rounded px-3 py-2.5" style={{ border: "1px solid var(--qc-blue)", background: "var(--qc-blue-soft)" }}>
          <p className="text-xs font-light leading-relaxed" style={{ color: "var(--qc-text-muted)" }}><InsightText text={d.note} /></p>
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

  const balanceCol1 = d.balance_sheet ? (
    <>
      <MetricTile label="Net Cash" value={d.balance_sheet.net_cash} sublabel={d.balance_sheet.status} icon={Wallet} />
      <MetricTile label="Cash & Investments" value={d.balance_sheet.cash_investments} sublabel={`Gross Debt: ${d.balance_sheet.gross_debt}`} icon={BarChart2} />
      {d.debt_trajectory && (
        <MetricTile label="Debt Reduction" value={d.debt_trajectory.reduction_pct} sublabel={`Current: ${d.debt_trajectory.current_debt}`} icon={TrendingDown} />
      )}
    </>
  ) : null;

  const equityCol1 = d.equity_allocation ? (
    <>
      <MetricTile label={d.equity_allocation.total_equity_sublabel ?? "Equity & Reserves"} value={d.equity_allocation.total_equity} icon={PieChart} />
      <MetricTile label="ROE (FY24)" value={d.equity_allocation.roe} sublabel={d.equity_allocation.roe_sublabel} icon={Percent} />
      <MetricTile label="Payout Ratio" value={`${d.equity_allocation.payout_trend}${d.equity_allocation.payout_trend_direction === "up" ? " ▲" : d.equity_allocation.payout_trend_direction === "down" ? " ▼" : ""}`} sublabel={d.equity_allocation.payout_sublabel} icon={TrendingDown} />
    </>
  ) : null;

  return (
    <div className="space-y-6">
      {(d.balance_sheet || d.debt_trajectory) && (
        <BentoSectionGrid
          col1={balanceCol1}
          col2={d.debt_trajectory ? <DebtTrajectoryPanel d={d.debt_trajectory} /> : undefined}
          col3={d.balance_sheet ? <BalanceSheetPanel d={d.balance_sheet} /> : undefined}
          takeaway={d.balance_sheet?.insight ? <InsightsCard title="BALANCE SHEET TAKEAWAY" text={d.balance_sheet.insight} /> : undefined}
        />
      )}

      {(d.equity_allocation || d.capex_intensity) && (
        <BentoSectionGrid
          col1={equityCol1}
          col2={d.equity_allocation ? <EquityAllocationPanel d={d.equity_allocation} /> : undefined}
          col3={d.capex_intensity ? <CapexIntensityPanel d={d.capex_intensity} /> : undefined}
          takeaway={d.equity_allocation?.insight ? <InsightsCard title="EQUITY & CAPEX TAKEAWAY" text={d.equity_allocation.insight} /> : undefined}
        />
      )}
    </div>
  );
}
