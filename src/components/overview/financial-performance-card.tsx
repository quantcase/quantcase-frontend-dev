"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { QuarterlyTrend } from "@/types/screener";
import { formatINR } from "@/lib/utils";

interface FinancialPerformanceCardProps {
  revenue: number | null;
  revenueGrowth: number | null;
  ebitda: number | null;
  ebitdaMargins: number | null;
  earningsGrowth: number | null;
  quarterlyTrend: QuarterlyTrend[] | null;
}

function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function FinancialPerformanceCard({
  revenue,
  revenueGrowth,
  ebitda,
  ebitdaMargins,
  earningsGrowth,
  quarterlyTrend,
}: FinancialPerformanceCardProps) {
  const chartData = quarterlyTrend
    ? quarterlyTrend
        .filter((q) => q.revenue != null)
        .map((q) => ({
          quarter: q.period,
          revenue: parseFloat(((q.revenue as number) / 1e7).toFixed(1)),
          ebitda: q.ebitda != null ? parseFloat((q.ebitda / 1e7).toFixed(1)) : null,
        }))
    : [];

  const metrics = [
    {
      label: "Revenue (TTM)",
      value: revenue != null ? formatINR(revenue) : "—",
      change: revenueGrowth != null ? formatPct(revenueGrowth) : null,
      positive: (revenueGrowth ?? 0) >= 0,
    },
    {
      label: "EBITDA",
      value: ebitda != null ? formatINR(ebitda) : "—",
      change: ebitdaMargins != null ? formatPct(ebitdaMargins) : null,
      positive: (ebitdaMargins ?? 0) >= 0,
    },
    {
      label: "EPS Growth",
      value: earningsGrowth != null ? `${(earningsGrowth * 100).toFixed(0)}%` : "—",
      change: null,
      positive: (earningsGrowth ?? 0) >= 0,
    },
  ];

  return (
    <Card className="bg-white border border-[#E2E2E2] rounded-[10px] shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Financial Performance
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">Trailing twelve months</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[18px] font-normal leading-none text-[#0F172B]">{m.value}</span>
                {m.change && (
                  <span className={`flex items-center text-xs font-semibold ${m.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {m.positive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {m.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-[#0F172B]" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-[#71717a]" />
            EBITDA
          </span>
        </div>

        {/* Bar chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height={192}>
            <BarChart data={chartData} barGap={2} barCategoryGap="30%">
              <XAxis
                dataKey="quarter"
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
                contentStyle={{
                  background: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: 8,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
                itemStyle={{ padding: '0px 10px' }}
                formatter={(value: number, name: string) => [`₹${value}Cr`, name]}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#0F172B" radius={[2, 2, 0, 0]} />
              <Bar dataKey="ebitda" name="EBITDA" fill="#71717a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
