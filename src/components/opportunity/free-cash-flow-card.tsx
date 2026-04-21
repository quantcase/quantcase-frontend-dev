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
import type { FreeCashFlowSection, FcfConversionDataPoint } from "@/types/opportunity";
import { InsightText } from "@/components/opportunity/bold-text";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { InsightsCard } from "@/components/opportunity/insights-card";
import { MetricTile } from "@/components/molecules/metric-tile";

// Chart hex colors (Recharts can't use CSS vars)
const CHART = {
  grid: "#f4f4f5",
  axis: "#a1a1aa",
  convLine: "#B4731A",    // --qc-warn
  fcfPos: "#1F7A4A",      // --qc-up
  fcfNeg: "#B23A2F",      // --qc-down
  pat: "#1F7A4A",         // --qc-up (lighter opacity)
};

function parseAmtCr(s?: string | null): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[₹,\s]/g, "").replace("Cr", ""));
  return isNaN(n) ? 0 : n;
}

function conversionHexColor(pct: number | null, threshold: number): string {
  if (pct == null) return "#a1a1aa";
  if (pct < 0) return CHART.fcfNeg;
  if (pct >= threshold) return CHART.fcfPos;
  return CHART.convLine;
}

const ConversionDot = (props: { cx?: number; cy?: number; payload?: FcfConversionDataPoint & { threshold: number } }) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload || payload.pct == null) return null;
  return <circle cx={cx} cy={cy} r={5} fill={conversionHexColor(payload.pct, payload.threshold)} stroke="white" strokeWidth={2} />;
};

function FcfChartPanel({
  growth,
  conversion,
}: {
  growth: NonNullable<FreeCashFlowSection["growth_trajectory"]>;
  conversion?: NonNullable<FreeCashFlowSection["conversion_consistency"]>;
}) {
  const threshold = conversion?.healthy_threshold_pct ?? 80;

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

  const chartData = quarterlyData.length > 0
    ? quarterlyData
    : [
        { quarter: `Start (${growth.periods})`, pct: null, threshold, fcf: parseAmtCr(growth.fcf_start), pat: parseAmtCr(growth.pat_start) },
        { quarter: "Latest", pct: null, threshold, fcf: parseAmtCr(growth.fcf_end), pat: parseAmtCr(growth.pat_end) },
      ];

  const rangeData = conversion;

  return (
    <div className="rounded-lg p-4 flex flex-col h-full" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--qc-text-heading)" }}>FCF vs PAT Comparison</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--qc-text-muted)" }}>Bars = absolute values · Line = FCF/PAT conversion %</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-[10px] font-mono" style={{ color: "var(--qc-text-muted)" }}>FCF / PAT %</p>
          <p className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>&gt;{threshold}% = healthy · &lt;{threshold}% = compressed</p>
        </div>
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 36, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.6} />
            <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} domain={["auto", "auto"]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: CHART.convLine }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e4e4e7", backgroundColor: "white" }}
              itemStyle={{ padding: "0px 10px" }}
              formatter={(value: number, name: string) => name === "FCF/PAT %" ? [`${value}%`, name] : [`₹${value} Cr`, name]}
            />
            <ReferenceLine yAxisId="right" y={threshold} stroke={CHART.convLine} strokeWidth={1} strokeDasharray="4 3" />
            <Bar yAxisId="left" dataKey="fcf" name="Free Cash Flow" barSize={11} radius={[2, 2, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={(entry.fcf ?? 0) < 0 ? CHART.fcfNeg : CHART.fcfPos} opacity={0.85} />
              ))}
            </Bar>
            <Bar yAxisId="left" dataKey="pat" name="PAT" fill={CHART.pat} opacity={0.35} barSize={11} radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" dataKey="pct" name="FCF/PAT %" stroke={CHART.convLine} strokeWidth={3} connectNulls={false} dot={<ConversionDot />} activeDot={{ r: 6, fill: CHART.convLine }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] mt-3" style={{ color: "var(--qc-text-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: CHART.fcfPos, opacity: 0.85 }} />
          Free Cash Flow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: CHART.pat, opacity: 0.35 }} />
          PAT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full inline-block" style={{ background: CHART.convLine }} />
          FCF/PAT Conversion %
        </span>
      </div>

      {rangeData && (
        <div className="grid grid-cols-3 gap-2 pt-3 mt-3" style={{ borderTop: "1px solid var(--qc-border-default)" }}>
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>10Q Range</p>
            <p className="text-sm font-bold" style={{ color: "var(--qc-text-heading)" }}>
              {rangeData.range_low != null ? `${rangeData.range_low}%` : "—"} – {rangeData.range_high != null ? `${rangeData.range_high}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>Floor</p>
            <p className="text-sm font-bold" style={{ color: "var(--qc-warn)" }}>{rangeData.floor_pct != null ? `${rangeData.floor_pct}%` : "—"}</p>
            <p className="text-[10px] font-semibold" style={{ color: "var(--qc-warn)" }}>{rangeData.floor_quarter}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>All 10Q above</p>
            <p className="text-sm font-bold" style={{ color: "var(--qc-text-heading)" }}>
              {rangeData.healthy_threshold_pct}%{" "}
              <span className="font-bold" style={{ color: "var(--qc-up)" }}>threshold</span>
            </p>
            {rangeData.all_above_threshold && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded text-white text-[10px] font-bold mt-0.5" style={{ background: "var(--qc-up)" }}>
                ✓
              </span>
            )}
          </div>
        </div>
      )}

      {growth.insight_body && (
        <p className="text-xs leading-relaxed mt-3" style={{ color: "var(--qc-text-muted)" }}>
          <InsightText text={growth.insight_body} />
        </p>
      )}
    </div>
  );
}

function FcfInsightCardsPanel({
  ocf,
  growth,
}: {
  ocf: NonNullable<FreeCashFlowSection["ocf_to_fcf"]>;
  growth?: FreeCashFlowSection["growth_trajectory"];
}) {
  return (
    <div className="rounded-lg p-4 space-y-3 h-full flex flex-col" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
      {/* OCF — positive */}
      <div className="rounded-lg p-3 space-y-1" style={{ background: "var(--qc-up-soft)", border: "1px solid var(--qc-up)" }}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--qc-up)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--qc-up)" }}>Operating Cash Flow</p>
        </div>
        <p className="text-xs leading-relaxed pl-6" style={{ color: "var(--qc-up)" }}>
          OCF robust at {ocf.ocf_ttm} (TTM), demonstrating healthy earnings quality despite FCF compression
        </p>
      </div>

      {/* Capex Drag */}
      {ocf.capex != null && ocf.capex_ocf_pct != null && ocf.fcf_ttm != null ? (
        <div className="rounded-lg p-3 space-y-1" style={{ background: "var(--qc-down-soft)", border: "1px solid var(--qc-down)" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "var(--qc-down)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--qc-down)" }}>Capex Drag</p>
          </div>
          <p className="text-xs leading-relaxed pl-6" style={{ color: "var(--qc-down)" }}>
            Capex of {ocf.capex.replace("-", "")} absorbed {ocf.capex_ocf_pct}% of OCF, reducing FCF to {ocf.fcf_ttm}
          </p>
        </div>
      ) : (
        <div className="rounded-lg p-3 space-y-1" style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" style={{ color: "var(--qc-text-muted)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--qc-text-muted)" }}>Capex Not Disclosed</p>
          </div>
          <p className="text-xs leading-relaxed pl-6" style={{ color: "var(--qc-text-muted)" }}>
            Capex figures not available — FCF cannot be computed from reported data
          </p>
        </div>
      )}

      {/* Capex Intensity */}
      {ocf.capex_revenue_pct != null && ocf.capex_ocf_pct != null && (
        <div className="rounded-lg p-3 space-y-1" style={{ background: "var(--qc-blue-soft)", border: "1px solid var(--qc-blue)" }}>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" style={{ color: "var(--qc-blue)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--qc-blue)" }}>Capex Intensity</p>
          </div>
          <p className="text-xs leading-relaxed pl-6" style={{ color: "var(--qc-blue)" }}>
            Capex at {ocf.capex_revenue_pct}% of revenue — {ocf.capex_ocf_pct > 50 ? "3x above" : "at"} normal 5-6% maintenance level
          </p>
        </div>
      )}

      <div className="pt-3 space-y-1 mt-auto" style={{ borderTop: "1px solid var(--qc-border-inner)" }}>
        {growth?.pat_cagr_pct != null && (
          <p className="text-xs" style={{ color: "var(--qc-text-muted)" }}>
            <span className="font-semibold">PAT Growth:</span> +{growth.pat_cagr_pct}% YoY
          </p>
        )}
        <p className="text-xs" style={{ color: "var(--qc-text-muted)" }}>
          <span className="font-semibold">FCF/Revenue:</span> {ocf.capex_revenue_pct > 0 ? (100 - ocf.capex_revenue_pct).toFixed(1) : "—"}%
        </p>
        <p className="text-xs" style={{ color: "var(--qc-text-muted)" }}>
          <span className="font-semibold">Capex/OCF:</span> {ocf.capex_ocf_pct}%
        </p>
      </div>
    </div>
  );
}

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
      <MetricTile label="FCF Conversion" value={d.conversion_consistency?.range_high != null ? `${d.conversion_consistency.range_high}%` : "—"} sublabel="TTM Conversion Rate" icon={Percent} />
      <MetricTile label="FCF Growth" value={d.growth_trajectory?.fcf_cagr_pct != null ? `${d.growth_trajectory.fcf_cagr_pct}%` : "—"} sublabel={fcfGrowthSublabel} change={d.growth_trajectory?.status} icon={TrendingUp} />
      <MetricTile label="FCF Yield" value={yieldNow?.yield_pct != null ? `${yieldNow.yield_pct}%` : "—"} sublabel={yieldNow?.zone} icon={DollarSign} />
    </>
  );

  return (
    <div className="space-y-4">
      <BentoSectionGrid
        col1={col1}
        col2={d.growth_trajectory ? <FcfChartPanel growth={d.growth_trajectory} conversion={d.conversion_consistency} /> : undefined}
        col3={d.ocf_to_fcf ? <FcfInsightCardsPanel ocf={d.ocf_to_fcf} growth={d.growth_trajectory} /> : undefined}
        takeaway={d.growth_trajectory?.insight_body ? <InsightsCard title="FREE CASH FLOW" text={d.growth_trajectory.insight_body} /> : undefined}
      />
    </div>
  );
}
