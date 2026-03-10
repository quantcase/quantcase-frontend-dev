"use client";

import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ShieldCheck, CheckCircle } from "lucide-react";
import type { QualityOfEarningsSection } from "@/types/deal";
import { qualityOfEarningsData } from "@/components/deal/detailed-analysis-data";

interface QualityOfEarningsProps {
  data?: QualityOfEarningsSection;
}

const changeColors: Record<string, string> = {
  emerald: "text-emerald-600",
  blue:    "text-blue-600",
  purple:  "text-purple-600",
  amber:   "text-amber-600",
};

export function QualityOfEarnings({ data }: QualityOfEarningsProps) {
  const title      = data?.meta?.title    ?? qualityOfEarningsData.title;
  const subtitle   = data?.meta?.subtitle ?? qualityOfEarningsData.subtitle;
  const metrics    = data?.metrics        ?? qualityOfEarningsData.metrics.map(m => ({
    ...m, change_color: m.changeColor,
  }));
  const chartData  = data?.chart_data     ?? qualityOfEarningsData.chartData;
  const bottomLine = data?.bottom_line    ?? qualityOfEarningsData.bottomLine;

  return (
    <div className="space-y-5">
      {/* Section Header — matches EpsEngine / ValuationVsPeers pattern */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>

      {/* 4 Metric tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              {metric.label}
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{metric.value}</p>
            <p className={`text-xs font-medium mt-0.5 ${changeColors[metric.change_color ?? (metric as { changeColor?: string }).changeColor ?? "emerald"]}`}>
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
          Quality Metrics Trend
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7", backgroundColor: "white" }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="roe"          name="ROE (%)"          stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="roic"         name="ROIC (%)"         stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="market_share" name="Market Share (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Line callout */}
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 flex items-start gap-3">
        <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
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
