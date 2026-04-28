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

// Chart colors must be hex (Recharts can't use CSS vars)
const CHART_COLORS = {
  grid: "#f4f4f5",
  axis: "#a1a1aa",
  refLine: "#a1a1aa",
  revenueBar: "#64748b",
  ebitBar: "var(--qc-text-heading)",   // --qc-text-heading approx
  dolLine: "#B4731A",   // --qc-warn approx
  dolUp: "#1F7A4A",     // --qc-up
  dolMid: "#B4731A",    // --qc-warn
  dolDown: "#B23A2F",   // --qc-down
};

function dolZone(dol: number): string {
  if (dol > 1.5) return "Strong leverage";
  if (dol >= 0.8) return "Moderate";
  return "Cost drag";
}

function dolHexColor(dol: number): string {
  if (dol > 1.5) return CHART_COLORS.dolUp;
  if (dol >= 0.8) return CHART_COLORS.dolMid;
  return CHART_COLORS.dolDown;
}

const DolDot = (props: { cx?: number; cy?: number; payload?: DolDataPoint }) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  return <circle cx={cx} cy={cy} r={5} fill={dolHexColor(payload.dol)} stroke="white" strokeWidth={2} />;
};

function DolChartPanel({ chartData }: { chartData: DolDataPoint[] }) {
  return (
    <div className="rounded-lg p-4 flex flex-col h-full" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--qc-text-heading)" }}>Degree of Operating Leverage Trend</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--qc-text-muted)" }}>For every 1% revenue growth, how much does EBIT grow?</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-[10px] font-mono" style={{ color: "var(--qc-text-muted)" }}>DOL = %ΔEBIT / %ΔRev</p>
          <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>DOL &gt;1 = leverage · &lt;1 = dilution</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 36, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} strokeOpacity={0.6} />
            <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 9, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={["auto", "auto"]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: CHART_COLORS.dolLine }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--qc-border-default)", backgroundColor: "white" }}
              itemStyle={{ padding: "0px 10px" }}
              formatter={(value: number, name: string) =>
                name === "DOL" ? [`${value}x (${dolZone(value)})`, name] : [`${value}%`, name]
              }
            />
            <ReferenceLine yAxisId="left" y={0} stroke={CHART_COLORS.refLine} strokeWidth={1} />
            <ReferenceLine yAxisId="right" y={0} stroke={CHART_COLORS.refLine} strokeWidth={1} strokeDasharray="3 3" />
            <Bar yAxisId="left" dataKey="revenue_growth" name="Revenue Growth % YoY" fill={CHART_COLORS.revenueBar} opacity={0.3} barSize={11} />
            <Bar yAxisId="left" dataKey="ebit_growth" name="EBIT Growth % YoY" fill={CHART_COLORS.ebitBar} opacity={0.3} barSize={11} />
            <Line yAxisId="right" dataKey="dol" name="DOL" stroke={CHART_COLORS.dolLine} strokeWidth={3} dot={<DolDot />} activeDot={{ r: 6, fill: CHART_COLORS.dolLine }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] mt-3" style={{ color: "var(--qc-text-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: CHART_COLORS.revenueBar, opacity: 0.85 }} />
          Revenue Growth % YoY
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: CHART_COLORS.ebitBar, opacity: 0.85 }} />
          EBIT Growth % YoY
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full inline-block" style={{ background: CHART_COLORS.dolLine }} />
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
      {fixedCostLines.length > 0 && (
        <div className="rounded-lg p-4 space-y-3" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
          {fixedCostLines.map((line, i) => {
            const currentPct = line.current_pct ?? 0;
            const changeBps = line.change_bps ?? 0;
            const isUp = changeBps > 0;
            const barPct = Math.min((currentPct / 70) * 100, 100);
            return (
              <div key={i} className={i > 0 ? "pt-3" : ""} style={{ borderTop: i > 0 ? "1px solid var(--qc-border-inner)" : "none" }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold" style={{ color: "var(--qc-text-body)" }}>{line.label} (% Revenue)</span>
                  <span className="text-base font-bold" style={{ color: "var(--qc-text-heading)" }}>{currentPct}%</span>
                </div>
                <SegmentedBar pct={barPct} color="bg-slate-400" />
                <p className="text-xs mt-1" style={{ color: "var(--qc-text-muted)" }}>
                  Prior: {line.prior_pct ?? "N/A"}% | {isUp ? "+" : ""}{changeBps} bps {isUp ? "increase" : "improvement"}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {totalFixed && (
        <div className="rounded-lg p-4 space-y-1" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>Total Fixed Costs</p>
              <p className="text-xs" style={{ color: "var(--qc-text-muted)" }}>was {totalFixed.prior_pct ?? "N/A"}%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[26px] font-normal" style={{ color: "var(--qc-text-heading)" }}>{totalFixed.current_pct ?? "N/A"}%</span>
              {totalFixed.change_bps != null && (
                <span className="text-xs font-semibold" style={{ color: totalFixed.change_bps > 0 ? "var(--qc-down)" : "var(--qc-up)" }}>
                  {totalFixed.change_bps > 0 ? "▲" : "▼"} {Math.abs(totalFixed.change_bps)}bps net
                </span>
              )}
            </div>
          </div>
          {totalFixed.note && <p className="text-xs" style={{ color: "var(--qc-text-muted)" }}>{totalFixed.note}</p>}
        </div>
      )}
    </>
  );
}

interface OperatingLeverageCardProps {
  data?: OperatingLeverageSection;
}

export function OperatingLeverageCard({ data }: OperatingLeverageCardProps) {
  const d = data ?? {};
  const chartData      = d.dol_chart_data ?? [];
  const fixedCostLines = d.fixed_cost_lines ?? [];
  const totalFixed     = d.total_fixed_costs;
  const verdict        = d.verdict;

  const revM    = d.metrics?.revenue_growth_yoy;
  const ebitM   = d.metrics?.ebit_growth_yoy;
  const spreadM = d.metrics?.leverage_spread;

  const revGrowth  = { label: revM?.label ?? "Revenue Growth YoY", value: revM?.value ?? "—", sublabel: "" };
  const ebitGrowth = { label: ebitM?.label ?? "EBIT Growth YoY", value: ebitM?.value ?? "—", sublabel: "" };
  const levSpread  = { label: spreadM?.label ?? "Leverage Spread", value: spreadM?.value ?? "—", sublabel: "" };
  const revChange  = revM?.change ?? undefined;

  const latestDol = chartData.length > 0 ? chartData[chartData.length - 1].dol : null;
  const dolValue = latestDol != null ? `${latestDol}x` : "—";
  const dolChange = verdict?.tag ?? undefined;

  const col1 = (
    <>
      <MetricTile label="DOL Score" value={dolValue} sublabel={dolChange} icon={Gauge} />
      <MetricTile label={revGrowth.label} value={revGrowth.value} sublabel={revGrowth.sublabel} change={revChange ?? undefined} icon={TrendingUp} />
      <MetricTile label={ebitGrowth.label} value={ebitGrowth.value} sublabel={ebitGrowth.sublabel} change={levSpread.value !== "N/A" ? `Leverage Spread: ${levSpread.value}` : undefined} icon={TrendingDown} />
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
