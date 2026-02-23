"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Plus } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const scoreData = [{ value: 84, fill: "#6366f1" }];

const scoreBreakdown = [
  { label: "Management (M)", max: 20, value: 17.5, color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Opportunity (O)", max: 40, value: 35, color: "text-blue-600 dark:text-blue-400" },
  { label: "Deal (D)", max: 40, value: 31.5, color: "text-orange-500 dark:text-orange-400" },
];

export function IMScoreCard() {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Total IM Score
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gauge */}
        <div className="relative flex items-center justify-center" style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="80%"
              innerRadius="65%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              data={scoreData}
            >
              <RadialBar
                background={{ fill: "#f4f4f5" }}
                dataKey="value"
                max={100}
                cornerRadius={4}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 flex flex-col items-center">
            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">84</span>
            <span className="mt-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              Strong Buy
            </span>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          {scoreBreakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">/ {item.max}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
                <button className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Analyst quote */}
        <div className="flex items-start gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            EC
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              &ldquo;Strong buy rating based on structural ROCE expansion thesis and infrastructure tailwinds.&rdquo;
            </p>
            <p className="mt-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Ethan Caldwell, Lead Analyst</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
