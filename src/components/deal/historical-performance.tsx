"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { historicalPerformanceData } from "@/components/deal/detailed-analysis-data";

const statColors: Record<string, { value: string; bg: string }> = {
  emerald: { value: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  blue: { value: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  purple: { value: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
};

export function HistoricalPerformance() {
  const { title, subtitle, companyGrowth, industryGrowth, companyName, industryName, chartData, stats } =
    historicalPerformanceData;

  return (
    <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      {/* Header */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
          {title}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Top 2 stat cards */}
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
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
            />
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

      {/* Bottom 3 stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => {
          const colors = statColors[stat.color] ?? statColors.emerald;
          return (
            <div key={i} className={`rounded-lg ${colors.bg} p-3 text-center`}>
              <p className={`text-xl font-bold ${colors.value}`}>{stat.value}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
