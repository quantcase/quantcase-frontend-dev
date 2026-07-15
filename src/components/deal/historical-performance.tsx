"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";
import type { HistoricalPerformanceSection } from "@/types/deal";
import { fmtDealNum } from "@/lib/utils";
import { historicalPerformanceData } from "@/components/deal/detailed-analysis-data";
import { QC } from "@/lib/chart-tokens";

// Chart colors — Recharts/SVG accept var(--qc-*) directly.
const CHART = {
  grid: QC.hair,
  axis: QC.ink3,
  companyBar: QC.ink,
  industryLine: QC.ink2,
};

interface HistoricalPerformanceProps {
  data?: HistoricalPerformanceSection;
  hideHeader?: boolean;
}

export function HistoricalPerformance({ data, hideHeader }: HistoricalPerformanceProps) {
  const title          = data?.meta?.title        ?? historicalPerformanceData.title;
  const subtitle       = data?.meta?.subtitle     ?? historicalPerformanceData.subtitle;
  const companyGrowth  = data?.company_growth     ?? historicalPerformanceData.companyGrowth;
  const industryGrowth = data?.industry_growth    ?? historicalPerformanceData.industryGrowth;
  const companyName    = data?.company_name       ?? historicalPerformanceData.companyName;
  const industryName   = data?.industry_name      ?? historicalPerformanceData.industryName;
  const chartData      = data?.chart_data         ?? historicalPerformanceData.chartData;
  const stats          = data?.stats?.map(s => ({ ...s, color: s.color })) ?? historicalPerformanceData.stats;

  return (
    <div className="space-y-5">
      {!hideHeader && (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center flex-shrink-0" style={{ padding: 4, borderRadius: 6, border: "1px solid var(--qc-hair)", background: "var(--qc-chip)" }}>
            <BarChart2 className="h-4 w-4" style={{ color: "var(--qc-ink-2)" }} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold uppercase tracking-[0.01em] mb-0.5" style={{ color: "var(--qc-ink)" }}>{title}</h3>
            {subtitle && <p className="text-[14px]" style={{ color: "var(--qc-ink-2)" }}>{subtitle}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-4" style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--qc-ink-2)" }}>
            Company Earnings Growth
          </p>
          <p className="text-[26px] font-normal" style={{ color: "var(--qc-ink)" }}>{fmtDealNum(companyGrowth.value)}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--qc-ink-2)" }}>{companyGrowth.label}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--qc-ink-2)" }}>
            Industry Earnings Growth
          </p>
          <p className="text-[26px] font-normal" style={{ color: "var(--qc-ink)" }}>{fmtDealNum(industryGrowth.value)}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--qc-ink-2)" }}>{industryGrowth.label}</p>
        </div>
      </div>

      <div className="rounded-lg p-4" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: CHART.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: CHART.axis }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${QC.hair}`, backgroundColor: QC.card }} itemStyle={{ padding: "0px 10px" }} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(value: string) =>
                  value === "company"
                    ? `${companyName} Earnings Growth (%)`
                    : `${industryName} Earnings Growth (%)`
                }
              />
              <Bar dataKey="company" fill={CHART.companyBar} radius={[3, 3, 0, 0]} maxBarSize={50} />
              <Line type="monotone" dataKey="industry" stroke={CHART.industryLine} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: CHART.industryLine }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-lg p-3 text-center" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
            <p className="text-[26px] font-normal" style={{ color: "var(--qc-ink)" }}>{fmtDealNum(stat.value)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--qc-ink-2)" }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
