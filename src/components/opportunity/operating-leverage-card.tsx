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
} from "recharts";
import { safeMetric, type OperatingLeverageSection, type DolDataPoint } from "@/types/opportunity";

// ─── Verdict metadata ──────────────────────────────────────────────────────────

const VERDICT_META: Record<string, { dotColor: string; textColor: string; bgColor: string }> = {
  leverage_active:   { dotColor: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400",   bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  leverage_pending:  { dotColor: "bg-yellow-400",   textColor: "text-yellow-600 dark:text-yellow-400",    bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  leverage_matured:  { dotColor: "bg-teal-500",     textColor: "text-teal-600 dark:text-teal-400",        bgColor: "bg-teal-50 dark:bg-teal-900/20" },
  cost_inflation:    { dotColor: "bg-orange-500",   textColor: "text-orange-600 dark:text-orange-400",    bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  negative_leverage: { dotColor: "bg-red-500",      textColor: "text-red-600 dark:text-red-400",          bgColor: "bg-red-50 dark:bg-red-900/20" },
  investment_mode:   { dotColor: "bg-blue-500",     textColor: "text-blue-600 dark:text-blue-400",        bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  // Short-key aliases sent by backend
  negative: { dotColor: "bg-red-500",      textColor: "text-red-600 dark:text-red-400",          bgColor: "bg-red-50 dark:bg-red-900/20" },
  neutral:  { dotColor: "bg-zinc-400",     textColor: "text-zinc-500 dark:text-zinc-400",         bgColor: "bg-zinc-50 dark:bg-zinc-800/30" },
  positive: { dotColor: "bg-emerald-500",  textColor: "text-emerald-600 dark:text-emerald-400",   bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
};

const FIXED_COST_COLORS: Record<string, { dot: string; bar: string }> = {
  blue:   { dot: "bg-blue-500",   bar: "bg-blue-500" },
  orange: { dot: "bg-orange-500", bar: "bg-orange-500" },
  slate:  { dot: "bg-slate-400",  bar: "bg-slate-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RenderWithBold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-semibold text-zinc-800 dark:text-zinc-200">{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// Colored dot per DOL threshold
const DolDot = (props: { cx?: number; cy?: number; payload?: DolDataPoint }) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  const color = payload.dol > 1.5 ? "#16a34a" : payload.dol >= 0.8 ? "#f59e0b" : "#ef4444";
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface OperatingLeverageCardProps {
  data?: OperatingLeverageSection;
}

export function OperatingLeverageCard({ data }: OperatingLeverageCardProps) {
  const d = data ?? {};
  const chartData      = d.dol_chart_data ?? [];
  const fixedCostLines = d.fixed_cost_lines ?? [];
  const totalFixed     = d.total_fixed_costs;
  const verdict        = d.verdict;
  const allVerdicts    = d.all_verdicts ?? [];
  const verdictMeta    = VERDICT_META[verdict?.status ?? "leverage_pending"];

  const revGrowth      = safeMetric(d.metrics?.revenue_growth_yoy);
  const ebitGrowth     = safeMetric(d.metrics?.ebit_growth_yoy);
  const levSpread      = safeMetric(d.metrics?.leverage_spread);

  return (
    <div className="space-y-4">

      {/* Equation header */}
      {d.fixed_cost_equation && (
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {d.fixed_cost_equation}
        </p>
      )}

      {/* ── Row 1: DOL Chart + Fixed Cost Lines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* DOL combo chart */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Degree of Operating Leverage (DOL)</h3>
              <p className="text-xs text-zinc-400 mt-0.5">For every 1% revenue growth, how much does EBIT grow?</p>
            </div>
            <div className="text-right shrink-0 space-y-0.5">
              <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">DOL = %ΔEBIT / %ΔRev</p>
              <p className="text-[10px] text-zinc-400">DOL &gt;1 = leverage · &lt;1 = dilution</p>
            </div>
          </div>

          <div className="h-52">
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
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 22]}
                />
                <YAxis
                  yAxisId="right" orientation="right"
                  tick={{ fontSize: 9, fill: "#f59e0b" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${v}x`}
                  domain={[0, 3]}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e4e4e7", backgroundColor: "white" }}
                  formatter={(value: number, name: string) =>
                    name === "DOL" ? [`${value}x`, name] : [`${value}%`, name]
                  }
                />
                <Bar yAxisId="left" dataKey="revenue_growth" name="Revenue Growth % YoY" fill="#64748b" opacity={0.85} barSize={11} />
                <Bar yAxisId="left" dataKey="ebit_growth"    name="EBIT Growth % YoY"    fill="#166534" opacity={0.85} barSize={11} />
                <Line
                  yAxisId="right"
                  dataKey="dol"
                  name="DOL"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={<DolDot />}
                  activeDot={{ r: 5, fill: "#f59e0b" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-500 opacity-85 inline-block" />
              Revenue Growth % YoY
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-green-800 opacity-85 inline-block" />
              EBIT Growth % YoY
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-full bg-yellow-500 inline-block" />
              DOL (EBIT growth / Rev growth)
            </span>
          </div>

          {/* DOL threshold legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] border-t border-zinc-100 dark:border-zinc-800 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-emerald-600 dark:text-emerald-400">DOL &gt;1.5 = Strong leverage</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" />
              <span className="text-yellow-600 dark:text-yellow-400">DOL 0.8–1.5 = Moderate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
              <span className="text-red-500">DOL &lt;0.8 = Cost drag</span>
            </span>
          </div>
        </div>

        {/* Fixed Cost Lines panel — new UI element */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Fixed Cost Lines — Current % of Revenue vs 1 Year Ago
          </h3>

          <div className="space-y-4 flex-1">
            {fixedCostLines.map((line, i) => {
              const isHex = line.color?.startsWith("#");
              const tailwindColors = FIXED_COST_COLORS[line.color] ?? FIXED_COST_COLORS.slate;
              const isUp = line.change_bps > 0;
              const barPct = Math.min((line.current_pct / 70) * 100, 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${isHex ? "" : tailwindColors.dot}`}
                        style={isHex ? { backgroundColor: line.color } : undefined}
                      />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{line.name}</span>
                    </div>
                    <span className={`text-xs font-semibold shrink-0 ${isUp ? "text-red-500" : "text-emerald-500"}`}>
                      {isUp ? "▲" : "▼"} {isUp ? "+" : ""}{line.change_bps}bps
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${isHex ? "" : tailwindColors.bar}`}
                        style={{ width: `${barPct}%`, ...(isHex ? { backgroundColor: line.color } : {}) }}
                      />
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{line.current_pct}%</span>
                      <span className="text-[11px] text-zinc-400 ml-1">was {line.prior_pct}%</span>
                    </div>
                  </div>
                  <p className="text-[11px] italic text-zinc-400 dark:text-zinc-500 leading-relaxed">{line.note}</p>
                </div>
              );
            })}
          </div>

          {totalFixed && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Fixed Costs</span>
                  <span className="text-xs text-zinc-400">was {totalFixed.prior_pct}%</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{totalFixed.current_pct}%</span>
                  <span className={`text-xs font-semibold ${totalFixed.change_bps > 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {totalFixed.change_bps > 0 ? "▲" : "▼"} +{Math.abs(totalFixed.change_bps)}bps net
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{totalFixed.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: 3 metric tiles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{revGrowth.label}</p>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{revGrowth.value}</p>
          <p className="text-xs text-zinc-400">{revGrowth.sublabel}</p>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{ebitGrowth.label}</p>
          <p className="text-4xl font-bold text-orange-500 tracking-tight">{ebitGrowth.value}</p>
          <p className="text-xs text-orange-400">{ebitGrowth.sublabel}</p>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{levSpread.label}</p>
          <p className="text-4xl font-bold text-red-500 tracking-tight">{levSpread.value}</p>
          <p className="text-xs text-zinc-400 leading-relaxed">{levSpread.sublabel}</p>
        </div>
      </div>

      {/* ── Row 3: Verdict ── */}
      {verdict && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">

            {/* Left: verdict content */}
            <div className="flex gap-4">
              <div className={`h-12 w-12 rounded-xl shrink-0 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 ${verdictMeta?.bgColor ?? ""}`}>
                <div className={`h-5 w-5 rounded-full ${verdictMeta?.dotColor ?? "bg-zinc-400"}`} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${verdictMeta?.textColor ?? ""}`}>{verdict.label}</h3>
                  <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium">
                    {verdict.tag}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <RenderWithBold text={verdict.description} />
                </p>
              </div>
            </div>

            {/* Right: all possible verdicts */}
            <div className="space-y-2 md:border-l md:border-zinc-200 md:dark:border-zinc-700 md:pl-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">All Possible Verdicts</p>
              {allVerdicts.map((v) => {
                const meta = VERDICT_META[v.status];
                return (
                  <div key={v.status} className={`flex items-center gap-2 ${v.is_current ? "" : "opacity-55"}`}>
                    {v.is_current
                      ? <span className="text-yellow-500 text-xs font-bold">→</span>
                      : <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
                    }
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${meta?.dotColor ?? "bg-zinc-400"}`} />
                    <span className={`text-xs font-medium ${v.is_current ? (meta?.textColor ?? "") : "text-zinc-500 dark:text-zinc-400"}`}>
                      {v.label}{v.is_current && " ←"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
