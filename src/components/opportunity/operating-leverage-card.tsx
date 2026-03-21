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
import { safeMetric, type OperatingLeverageSection, type DolDataPoint } from "@/types/opportunity";
import { SegmentedBar } from "@/components/opportunity/segmented-bar";
import { StatusBadge } from "@/components/opportunity/status-badge";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { InsightsCard } from "@/components/opportunity/insights-card";

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

const FIXED_COST_COLORS: Record<string, { bar: string }> = {
  blue:   { bar: "bg-blue-500" },
  orange: { bar: "bg-orange-500" },
  slate:  { bar: "bg-slate-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dolZone(dol: number): string {
  if (dol > 1.5) return "Strong leverage";
  if (dol >= 0.8) return "Moderate";
  return "Cost drag";
}

function dolColor(dol: number): string {
  if (dol > 1.5) return "#16a34a";
  if (dol >= 0.8) return "#f59e0b";
  return "#ef4444";
}

// Colored dot per DOL threshold
const DolDot = (props: { cx?: number; cy?: number; payload?: DolDataPoint }) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  return <circle cx={cx} cy={cy} r={5} fill={dolColor(payload.dol)} stroke="white" strokeWidth={2} />;
};

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function DolChartPanel({ chartData }: { chartData: DolDataPoint[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Degree of Operating Leverage Trend</h3>
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
              domain={["auto", "auto"]}
            />
            <YAxis
              yAxisId="right" orientation="right"
              tick={{ fontSize: 9, fill: "#f59e0b" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}x`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e4e4e7", backgroundColor: "white" }}
              formatter={(value: number, name: string) =>
                name === "DOL"
                  ? [`${value}x (${dolZone(value)})`, name]
                  : [`${value}%`, name]
              }
            />
            <ReferenceLine yAxisId="left" y={0} stroke="#d4d4d8" strokeWidth={1} />
            <ReferenceLine yAxisId="right" y={0} stroke="#d4d4d8" strokeWidth={1} strokeDasharray="3 3" />
            <Bar yAxisId="left" dataKey="revenue_growth" name="Revenue Growth % YoY" fill="#64748b" opacity={0.3} barSize={11} />
            <Bar yAxisId="left" dataKey="ebit_growth"    name="EBIT Growth % YoY"    fill="#166534" opacity={0.3} barSize={11} />
            <Line
              yAxisId="right"
              dataKey="dol"
              name="DOL"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={<DolDot />}
              activeDot={{ r: 6, fill: "#f59e0b" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

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
    </div>
  );
}

function FixedCostLinesPanel({
  fixedCostLines,
  totalFixed,
}: {
  fixedCostLines: NonNullable<OperatingLeverageSection["fixed_cost_lines"]>;
  totalFixed?: OperatingLeverageSection["total_fixed_costs"];
}) {
  return (
    <>
      {/* Merged cost lines card */}
      {fixedCostLines.length > 0 && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          {fixedCostLines.map((line, i) => {
            const isHex = line.color?.startsWith("#");
            const tailwindColors = FIXED_COST_COLORS[line.color] ?? FIXED_COST_COLORS.slate;
            const isUp = line.change_bps > 0;
            const barPct = Math.min((line.current_pct / 70) * 100, 100);
            return (
              <div key={i} className={i > 0 ? "pt-3 border-t border-zinc-100 dark:border-zinc-800" : ""}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{line.name} (% Revenue)</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">{line.current_pct}%</span>
                </div>
                <SegmentedBar
                  pct={barPct}
                  color={isHex ? undefined : tailwindColors.bar}
                  hexColor={isHex ? line.color : undefined}
                />
                <p className="text-xs text-zinc-400 mt-1">
                  FY24: {line.prior_pct}% | {isUp ? "+" : ""}{line.change_bps} bps {isUp ? "increase" : "improvement"}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {totalFixed && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Fixed Costs</p>
              <p className="text-xs text-zinc-400">was {totalFixed.prior_pct}%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50">{totalFixed.current_pct}%</span>
              <span className={`text-xs font-semibold ${totalFixed.change_bps > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {totalFixed.change_bps > 0 ? "▲" : "▼"} {Math.abs(totalFixed.change_bps)}bps net
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400">{totalFixed.note}</p>
        </div>
      )}
    </>
  );
}

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
  const verdictMeta    = VERDICT_META[verdict?.status ?? "leverage_pending"];

  const revGrowth  = safeMetric(d.metrics?.revenue_growth_yoy);
  const ebitGrowth = safeMetric(d.metrics?.ebit_growth_yoy);
  const levSpread  = safeMetric(d.metrics?.leverage_spread);
  const revChange  = d.metrics?.revenue_growth_yoy?.change;

  // Latest DOL value from chart data
  const latestDol = chartData.length > 0 ? chartData[chartData.length - 1].dol : null;

  const col1 = (
    <>
      {/* DOL Score tile */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">DOL Score</p>
        </div>
        <p className={`text-[26px] font-normal tracking-tight ${verdictMeta?.textColor ?? "text-zinc-900 dark:text-zinc-50"}`}>
          {latestDol != null ? latestDol : "—"}
        </p>
        {verdict?.tag && <p className="text-xs text-zinc-400">{verdict.tag}</p>}
      </div>

      {/* Revenue Growth YoY */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{revGrowth.label}</p>
        <p className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50 tracking-tight">{revGrowth.value}</p>
        {revGrowth.sublabel && <p className="text-xs text-zinc-400">{revGrowth.sublabel}</p>}
        {revChange && <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{revChange}</p>}
      </div>

      {/* EBIT Growth YoY — with leverage spread callout */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{ebitGrowth.label}</p>
        <p className="text-[26px] font-normal text-orange-500 tracking-tight">{ebitGrowth.value}</p>
        {ebitGrowth.sublabel && <p className="text-xs text-zinc-400">{ebitGrowth.sublabel}</p>}
        {levSpread.value !== "N/A" && (
          <p className="text-xs font-semibold text-red-500">Leverage Spread: {levSpread.value}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <BentoSectionGrid
        col1={col1}
        col2={<DolChartPanel chartData={chartData} />}
        col3={<FixedCostLinesPanel fixedCostLines={fixedCostLines} totalFixed={totalFixed} />}
        takeaway={
          verdict
            ? <InsightsCard title={verdict.tag ?? "OPERATING LEVERAGE"} text={verdict.description} />
            : undefined
        }
      />
    </div>
  );
}
