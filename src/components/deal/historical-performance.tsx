"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";
import type { HistoricalPerformanceSection } from "@/types/deal";
import { historicalPerformanceData } from "@/components/deal/detailed-analysis-data";

interface HistoricalPerformanceProps {
  data?: HistoricalPerformanceSection;
  hideHeader?: boolean;
}

const statColors: Record<string, { value: string; bg: string; border: string }> = {
  emerald: { value: "text-[#0F172B]", bg: "bg-[#F5F5F5]", border: "border-[#E2E2E2]" },
  blue:    { value: "text-[#0F172B]", bg: "bg-[#F5F5F5]", border: "border-[#E2E2E2]" },
  purple:  { value: "text-[#0F172B]", bg: "bg-[#F5F5F5]", border: "border-[#E2E2E2]" },
};

export function HistoricalPerformance({ data, hideHeader }: HistoricalPerformanceProps) {
  // Fall back to static data during dev
  const title         = data?.meta?.title        ?? historicalPerformanceData.title;
  const subtitle      = data?.meta?.subtitle     ?? historicalPerformanceData.subtitle;
  const companyGrowth = data?.company_growth     ?? historicalPerformanceData.companyGrowth;
  const industryGrowth= data?.industry_growth    ?? historicalPerformanceData.industryGrowth;
  const companyName   = data?.company_name       ?? historicalPerformanceData.companyName;
  const industryName  = data?.industry_name      ?? historicalPerformanceData.industryName;
  const chartData     = data?.chart_data         ?? historicalPerformanceData.chartData;
  const stats         = data?.stats?.map(s => ({ ...s, color: s.color }))
                        ?? historicalPerformanceData.stats;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      {!hideHeader && (
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] flex items-center justify-center flex-shrink-0">
            <BarChart2 className="h-4 w-4 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#0F172B] uppercase tracking-[0.01em] mb-0.5">{title}</h3>
            {subtitle && <p className="text-[14px] text-[#888888]">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Top 2 stat tiles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-[#F5F5F5] border border-[#E2E2E2] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">
            Company Earnings Growth
          </p>
          <p className="text-[26px] font-normal text-[#0F172B]">{companyGrowth.value}</p>
          <p className="text-xs text-[#888888] mt-0.5">{companyGrowth.label}</p>
        </div>
        <div className="rounded-lg bg-[#F5F5F5] border border-[#E2E2E2] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">
            Industry Earnings Growth
          </p>
          <p className="text-[26px] font-normal text-[#0F172B]">{industryGrowth.value}</p>
          <p className="text-xs text-[#888888] mt-0.5">{industryGrowth.label}</p>
        </div>
      </div>

      {/* Combo chart */}
      <div className="rounded-lg border border-[#E2E2E2] bg-white p-4">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7", backgroundColor: "white" }} itemStyle={{ padding: '0px 10px' }} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(value: string) =>
                  value === "company"
                    ? `${companyName} Earnings Growth (%)`
                    : `${industryName} Earnings Growth (%)`
                }
              />
              <Bar dataKey="company" fill="#0F172B" radius={[3, 3, 0, 0]} maxBarSize={50} />
              <Line
                type="monotone"
                dataKey="industry"
                stroke="#71717a"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "#71717a" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom 3 stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => {
          const colors = statColors[stat.color] ?? statColors.emerald;
          return (
            <div key={i} className={`rounded-lg border ${colors.border} ${colors.bg} p-3 text-center`}>
              <p className={`text-[26px] font-normal ${colors.value}`}>{stat.value}</p>
              <p className="text-[10px] text-[#888888] mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
