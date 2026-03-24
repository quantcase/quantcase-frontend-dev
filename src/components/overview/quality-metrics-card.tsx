"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { QuarterlyTrend } from "@/types/screener";

interface QualityMetricsTrendCardProps {
  quarterlyTrend: QuarterlyTrend[] | null;
  grossMargins: number | null;
  operatingMargins: number | null;
  profitMargins: number | null;
  ebitda: number | null;
  totalCash: number | null;
  totalDebt: number | null;
  debtToEquity: number | null;
}

type ViewMode = "margins" | "efficiency";

function pct(v: number | null) {
  return v != null ? `${(v * 100).toFixed(1)}%` : "—";
}

export function QualityMetricsTrendCard({
  quarterlyTrend,
  grossMargins,
  operatingMargins,
  profitMargins,
  ebitda,
  totalCash,
  totalDebt,
  debtToEquity,
}: QualityMetricsTrendCardProps) {
  const [view, setView] = useState<ViewMode>("margins");

  const netDebtOverEbitda =
    totalDebt != null && totalCash != null && ebitda != null && ebitda !== 0
      ? (totalDebt - totalCash) / ebitda
      : null;

  const chartData = quarterlyTrend
    ? quarterlyTrend
        .filter((q) => q.revenue != null && q.revenue > 0)
        .map((q) => {
          const rev = q.revenue as number;
          return {
            quarter: q.period,
            opMargin: q.operatingIncome != null ? parseFloat(((q.operatingIncome / rev) * 100).toFixed(1)) : null,
            netMargin: q.netIncome != null ? parseFloat(((q.netIncome / rev) * 100).toFixed(1)) : null,
            grossMargin: q.grossProfit != null ? parseFloat(((q.grossProfit / rev) * 100).toFixed(1)) : null,
            ebitdaMargin: q.ebitda != null ? parseFloat(((q.ebitda / rev) * 100).toFixed(1)) : null,
          };
        })
    : [];

  return (
    <Card className="bg-white border border-zinc-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900">
              Quality Metrics Trend
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">Quarterly progression</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-[#E2E2E2] overflow-hidden text-xs">
              <button
                onClick={() => setView("margins")}
                className={`px-3 py-1 font-medium transition-colors ${
                  view === "margins"
                    ? "bg-[#0F172B] text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Margins
              </button>
              <button
                onClick={() => setView("efficiency")}
                className={`px-3 py-1 font-medium transition-colors ${
                  view === "efficiency"
                    ? "bg-[#0F172B] text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Efficiency
              </button>
            </div>
            <ArrowUpRight className="h-4 w-4 text-zinc-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Custom legend — only shows items for active tab */}
        <div className="flex items-center gap-4 mb-2">
          {view === "margins" ? (
            <>
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="inline-block w-2 h-2 rounded-full bg-[#0F172B]" />
                Op. Margin
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="inline-block w-2 h-2 rounded-full bg-[#71717a]" />
                Net Margin
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="inline-block w-2 h-2 rounded-full bg-[#a1a1aa]" />
                Gross Margin
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="inline-block w-2 h-2 rounded-full bg-[#0F172B]" />
              EBITDA Margin
            </span>
          )}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height={192}>
            <LineChart data={chartData}>
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
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e4e4e7",
                  borderRadius: 8,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
                itemStyle={{ padding: "1px 0", margin: 0 }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Line
                type="monotone"
                dataKey="opMargin"
                name="Op. Margin"
                stroke="#0F172B"
                strokeWidth={2}
                dot={{ r: 3, fill: "#0F172B" }}
                activeDot={{ r: 4 }}
                connectNulls
                hide={view !== "margins"}
              />
              <Line
                type="monotone"
                dataKey="netMargin"
                name="Net Margin"
                stroke="#71717a"
                strokeWidth={2}
                dot={{ r: 3, fill: "#71717a" }}
                activeDot={{ r: 4 }}
                connectNulls
                hide={view !== "margins"}
              />
              <Line
                type="monotone"
                dataKey="grossMargin"
                name="Gross Margin"
                stroke="#a1a1aa"
                strokeWidth={2}
                dot={{ r: 3, fill: "#a1a1aa" }}
                activeDot={{ r: 4 }}
                connectNulls
                hide={view !== "margins"}
              />
              <Line
                type="monotone"
                dataKey="ebitdaMargin"
                name="EBITDA Margin"
                stroke="#0F172B"
                strokeWidth={2}
                dot={{ r: 3, fill: "#0F172B" }}
                activeDot={{ r: 4 }}
                connectNulls
                hide={view !== "efficiency"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metric tiles below chart */}
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 pt-3 mt-1">
          {view === "margins" ? (
            <>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Gross Margin</p>
                <p className="text-lg font-bold text-zinc-900">{pct(grossMargins)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Op. Margin</p>
                <p className="text-lg font-bold text-zinc-900">{pct(operatingMargins)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Net Margin</p>
                <p className="text-lg font-bold text-zinc-900">{pct(profitMargins)}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Net Debt / EBITDA</p>
                <p className="text-lg font-bold text-zinc-900">
                  {netDebtOverEbitda != null ? `${netDebtOverEbitda.toFixed(1)}x` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Debt / Equity</p>
                <p className="text-lg font-bold text-zinc-900">
                  {debtToEquity != null ? `${debtToEquity.toFixed(1)}x` : "—"}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
