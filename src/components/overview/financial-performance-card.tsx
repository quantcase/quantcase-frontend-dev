"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { quarter: "Q1", revenue: 720, ebitda: 80 },
  { quarter: "Q2", revenue: 820, ebitda: 90 },
  { quarter: "Q3", revenue: 980, ebitda: 110 },
  { quarter: "Q4", revenue: 940, ebitda: 100 },
  { quarter: "Q1 FY25", revenue: 1010, ebitda: 115 },
  { quarter: "Q2 FY25", revenue: 1080, ebitda: 120 },
  { quarter: "Q3 FY25", revenue: 1150, ebitda: 130 },
  { quarter: "Q4 FY25E", revenue: 1280, ebitda: 145 },
];

interface Metric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

const metrics: Metric[] = [
  { label: "Revenue (TTM)", value: "₹1.25L", change: "+18.5%", positive: true },
  { label: "EBITDA", value: "₹190Cr", change: "-2.1%", positive: false },
  { label: "EPS Growth", value: "26%", change: "+4.2%", positive: true },
];

export function FinancialPerformanceCard() {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Financial Performance
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">Updated 14:30 IST</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{m.value}</span>
                <span className={`flex items-center text-xs font-semibold ${m.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {m.positive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {m.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
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
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#818cf8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="ebitda" name="EBITDA" fill="#f87171" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
