"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle } from "lucide-react";
import { qualityOfEarningsData } from "@/components/deal/detailed-analysis-data";

const changeColors: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  purple: "text-purple-600",
  amber: "text-amber-600",
};

export function QualityOfEarnings() {
  const { title, subtitle, metrics, chartData, bottomLine } = qualityOfEarningsData;

  return (
    <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      {/* Header */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
          {title}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              {metric.label}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{metric.value}</p>
            <p className={`text-xs font-medium mt-0.5 ${changeColors[metric.changeColor]}`}>
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Chart sub-header */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        Quality Metrics Trend
      </p>

      {/* Line Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
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
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="roe"
              name="ROE (%)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="roic"
              name="ROIC (%)"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="marketShare"
              name="Market Share (%)"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Line callout */}
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 flex items-start gap-3">
        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
            Bottom Line
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{bottomLine}</p>
        </div>
      </div>
    </div>
  );
}
