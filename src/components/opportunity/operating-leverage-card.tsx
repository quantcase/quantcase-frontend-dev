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
import { TrendingUp, TrendingDown, Gauge } from "lucide-react";
import { type OperatingLeverageSection, type DolDataPoint } from "@/types/opportunity";
import { SegmentedBar } from "@/components/opportunity/segmented-bar";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { MetricTile } from "@/components/molecules/metric-tile";

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
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Degree of Operating Leverage Trend</h3>
          <p className="text-xs text-zinc-400 mt-0.5">For every 1% revenue growth, how much does EBIT grow?</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">DOL = %ΔEBIT / %ΔRev</p>
          <p className="text-[10px] text-zinc-400">DOL &gt;1 = leverage · &lt;1 = dilution</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
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
              itemStyle={{ padding: '0px 10px' }}
              formatter={(value: number, name: string) =>
                name === "DOL"
                  ? [`${value}x (${dolZone(value)})`, name]
                  : [`${value}%`, name]
              }
            />
            <ReferenceLine yAxisId="left" y={0} stroke="#71717a" strokeWidth={1} />
            <ReferenceLine yAxisId="right" y={0} stroke="#71717a" strokeWidth={1} strokeDasharray="3 3" />
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

      <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-600 dark:text-zinc-400 mt-3">
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
            const currentPct = line.current_pct ?? 0;
            const changeBps = line.change_bps ?? 0;
            const isUp = changeBps > 0;
            const barPct = Math.min((currentPct / 70) * 100, 100);
            return (
              <div key={i} className={i > 0 ? "pt-3 border-t border-zinc-100 dark:border-zinc-800" : ""}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{line.label} (% Revenue)</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">{currentPct}%</span>
                </div>
                <SegmentedBar pct={barPct} color="bg-slate-400" />
                <p className="text-xs text-zinc-400 mt-1">
                  Prior: {line.prior_pct ?? "N/A"}% | {isUp ? "+" : ""}{changeBps} bps {isUp ? "increase" : "improvement"}
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
              <p className="text-xs text-zinc-400">was {totalFixed.prior_pct ?? "N/A"}%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50">{totalFixed.current_pct ?? "N/A"}%</span>
              {totalFixed.change_bps != null && (
                <span className={`text-xs font-semibold ${totalFixed.change_bps > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  {totalFixed.change_bps > 0 ? "▲" : "▼"} {Math.abs(totalFixed.change_bps)}bps net
                </span>
              )}
            </div>
          </div>
          {totalFixed.note && <p className="text-xs text-zinc-400">{totalFixed.note}</p>}
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

  const revM       = d.metrics?.revenue_growth_yoy;
  const ebitM      = d.metrics?.ebit_growth_yoy;
  const spreadM    = d.metrics?.leverage_spread;

  const revGrowth  = { label: revM?.label ?? "Revenue Growth YoY", value: revM?.value ?? "—", sublabel: "" };
  const ebitGrowth = { label: ebitM?.label ?? "EBIT Growth YoY",   value: ebitM?.value ?? "—", sublabel: "" };
  const levSpread  = { label: spreadM?.label ?? "Leverage Spread",  value: spreadM?.value ?? "—", sublabel: "" };
  const revChange  = revM?.change ?? undefined;

  // Latest DOL value from chart data
  const latestDol = chartData.length > 0 ? chartData[chartData.length - 1].dol : null;

  const dolValue = latestDol != null ? `${latestDol}x` : "—";
  const dolChange = verdict?.tag ?? undefined;

  const col1 = (
    <>
      <MetricTile
        label="DOL Score"
        value={dolValue}
        sublabel={dolChange}
        icon={Gauge}
      />
      <MetricTile
        label={revGrowth.label}
        value={revGrowth.value}
        sublabel={revGrowth.sublabel}
        change={revChange ?? undefined}
        icon={TrendingUp}
      />
      <MetricTile
        label={ebitGrowth.label}
        value={ebitGrowth.value}
        sublabel={ebitGrowth.sublabel}
        change={levSpread.value !== "N/A" ? `Leverage Spread: ${levSpread.value}` : undefined}
        icon={TrendingDown}
      />
    </>
  );

  return (
    <div className="space-y-4">
      <BentoSectionGrid
        col1={col1}
        col2={<DolChartPanel chartData={chartData} />}
        col3={<FixedCostLinesPanel fixedCostLines={fixedCostLines} totalFixed={totalFixed} />}
      />
    </div>
  );
}
