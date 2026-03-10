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
}

const statColors: Record<string, { value: string; bg: string; border: string }> = {
  emerald: { value: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-800" },
  blue:    { value: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-100 dark:border-blue-800" },
  purple:  { value: "text-purple-600",  bg: "bg-purple-50 dark:bg-purple-950/30",   border: "border-purple-100 dark:border-purple-800" },
};

export function HistoricalPerformance({ data }: HistoricalPerformanceProps) {
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
      {/* Section Header — matches EpsEngine / ValuationVsPeers pattern */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>

      {/* Top 2 stat tiles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Company Earnings Growth
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{companyGrowth.value}</p>
          <p className="text-xs text-emerald-600 mt-0.5">{companyGrowth.label}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Industry Earnings Growth
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{industryGrowth.value}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{industryGrowth.label}</p>
        </div>
      </div>

      {/* Combo chart */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7", backgroundColor: "white" }} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(value: string) =>
                  value === "company"
                    ? `${companyName} Earnings Growth (%)`
                    : `${industryName} Earnings Growth (%)`
                }
              />
              <Bar dataKey="company" fill="#4ade80" radius={[3, 3, 0, 0]} maxBarSize={50} />
              <Line
                type="monotone"
                dataKey="industry"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "#6366f1" }}
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
              <p className={`text-xl font-bold ${colors.value}`}>{stat.value}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
