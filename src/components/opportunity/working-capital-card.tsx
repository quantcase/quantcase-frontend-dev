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
import type { WorkingCapitalSection } from "@/types/opportunity";
import { InsightText } from "@/components/opportunity/bold-text";
import { BentoSectionGrid } from "@/components/opportunity/bento-section-grid";
import { InsightsCard } from "@/components/opportunity/insights-card";
import { MetricTile } from "@/components/molecules/metric-tile";
import { StatusBadge } from "@/components/opportunity/status-badge";
import { QC } from "@/lib/chart-tokens";

// Chart colors mapped to --qc-* tokens (Recharts SVG accepts var(--qc-*))
const CHART = {
  grid: QC.hair,
  axis: QC.ink3,
  refLine: QC.ink3,
  wcLine: QC.blue,
  dsoBar: QC.blue,
  dioBar: QC.warn,
  dpoBar: QC.up,
};

type WcChartDataPoint = {
  quarter: string;
  wc_pct?: number;
  dso?: number | null;
  dio?: number | null;
  dpo?: number | null;
};

function WcTrendChartPanel({
  d,
  quarters,
  rows,
}: {
  d: NonNullable<WorkingCapitalSection["trend_chart"]>;
  quarters: string[];
  rows: WorkingCapitalSection["rows"];
}) {
  const wcByQuarter = new Map(d.data.map((pt) => [pt.quarter, pt.wc_pct]));
  const dsoRow = rows.find((r) => r.key === "dso");
  const dioRow = rows.find((r) => r.key === "dio");
  const dpoRow = rows.find((r) => r.key === "dpo");

  const allQuarters = d.data.length > 0 ? d.data.map((pt) => pt.quarter) : quarters;

  const chartData: WcChartDataPoint[] = allQuarters.map((q) => {
    const rowIdx = quarters.indexOf(q);
    return {
      quarter: q,
      wc_pct: wcByQuarter.get(q),
      dso: rowIdx >= 0 ? (dsoRow?.values[rowIdx] ?? undefined) : undefined,
      dio: rowIdx >= 0 ? (dioRow?.values[rowIdx] ?? undefined) : undefined,
      dpo: rowIdx >= 0 ? (dpoRow?.values[rowIdx] ?? undefined) : undefined,
    };
  });

  return (
    <div className="rounded-lg p-4 flex flex-col flex-1" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--qc-ink)" }}>{d.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--qc-ink-2)" }}>Bars = DSO / DIO / DPO (days) · Line = WC as % of Revenue</p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-[10px] font-mono" style={{ color: "var(--qc-ink-2)" }}>WC % = Working Capital / Revenue</p>
          <p className="text-[10px]" style={{ color: "var(--qc-ink-2)" }}>Lower % = more asset-efficient</p>
        </div>
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 36, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.6} />
            <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}d`} domain={["auto", "auto"]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: CHART.wcLine }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: `1px solid ${QC.hair}`, backgroundColor: QC.card }}
              itemStyle={{ padding: "0px 10px" }}
              formatter={(value: number, name: string) => name === "WC % of Revenue" ? [`${value}%`, name] : [`${value} days`, name]}
            />
            <ReferenceLine yAxisId="left" y={0} stroke={CHART.refLine} strokeWidth={1} />
            <Bar yAxisId="left" dataKey="dso" name="DSO" fill={CHART.dsoBar} opacity={0.7} barSize={9} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="dio" name="DIO" fill={CHART.dioBar} opacity={0.7} barSize={9} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="dpo" name="DPO" fill={CHART.dpoBar} opacity={0.5} barSize={9} radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" dataKey="wc_pct" name="WC % of Revenue" stroke={CHART.wcLine} strokeWidth={3} dot={{ r: 4, fill: CHART.wcLine, stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6, fill: CHART.wcLine }} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] mt-3" style={{ color: "var(--qc-ink-2)" }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: CHART.dsoBar, opacity: 0.7 }} />
          DSO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: CHART.dioBar, opacity: 0.7 }} />
          DIO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: CHART.dpoBar, opacity: 0.5 }} />
          DPO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full inline-block" style={{ background: CHART.wcLine }} />
          WC % of Revenue
        </span>
      </div>

      {d.verdict_badge && (
        <div className="mt-3">
          <StatusBadge label={d.verdict_badge} color={d.verdict_color} />
        </div>
      )}
    </div>
  );
}

function WcSignalsPanel({ signals, insight }: { signals?: WorkingCapitalSection["signals"]; insight?: string }) {
  return (
    <div className="rounded-lg p-4 space-y-3 h-full" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
      {signals && signals.length > 0 && (
        <div className="flex flex-col gap-2">
          {signals.map((s, i) => (
            <StatusBadge key={i} label={s.label} color={s.color} />
          ))}
        </div>
      )}
      {insight && (
        <div className="rounded px-3 py-2.5" style={{ border: "1px solid var(--qc-blue)", background: "var(--qc-blue-soft)" }}>
          <p className="text-xs font-light leading-relaxed" style={{ color: "var(--qc-ink-2)" }}><InsightText text={insight} /></p>
        </div>
      )}
    </div>
  );
}

interface WorkingCapitalCardProps {
  data?: WorkingCapitalSection;
}

export function WorkingCapitalCard({ data }: WorkingCapitalCardProps) {
  const quarters = data?.quarters ?? [];
  const rows = data?.rows ?? [];
  const d = { ...data, quarters, rows };

  const col1 = (
    <>
      {d.rows.map((row) => {
        let displayIdx = d.quarters.length - 1;
        for (let i = row.values.length - 1; i >= 0; i--) {
          if (row.values[i] != null) { displayIdx = i; break; }
        }
        return (
          <MetricTile
            key={row.key}
            label={row.label}
            value={String(row.values[displayIdx] ?? "—")}
            sublabel={d.quarters[displayIdx] ?? "Latest"}
          />
        );
      })}
    </>
  );

  return (
    <div className="space-y-4">
      <BentoSectionGrid
        col1={col1}
        col2={d.trend_chart ? <WcTrendChartPanel d={d.trend_chart} quarters={d.quarters} rows={d.rows} /> : undefined}
        col3={(d.signals?.length || d.insight) ? <WcSignalsPanel signals={d.signals} insight={d.insight} /> : undefined}
        takeaway={d.insight ? <InsightsCard title="WORKING CAPITAL TAKEAWAY" text={d.insight} /> : undefined}
      />
    </div>
  );
}
