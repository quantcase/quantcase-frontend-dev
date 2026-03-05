"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronUp, TrendingUp, BarChart2, Wallet, Target,
  DollarSign, PieChart, Shield, Activity,
} from "lucide-react";
import { safeMetric, type FinancialStrengthSection } from "@/types/opportunity";
import { TrendCharts } from "@/components/opportunity/trend-charts";

interface FinancialStrengthCardProps {
  data?: FinancialStrengthSection;
}

export function FinancialStrengthCard({ data }: FinancialStrengthCardProps) {
  const [showDetails, setShowDetails] = useState(true);

  const m = data?.metrics;
  const financialMetrics = [
    { ...safeMetric(m?.revenue), icon: TrendingUp, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(m?.gross_margin), icon: BarChart2, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(m?.ebitda_margin), icon: PieChart, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(m?.pat), icon: DollarSign, iconColor: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { ...safeMetric(m?.free_cash_flow), icon: Wallet, iconColor: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20" },
    { ...safeMetric(m?.interest_coverage), icon: Shield, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { ...safeMetric(m?.roce), icon: Target, iconColor: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { ...safeMetric(m?.roe), icon: Activity, iconColor: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800" },
  ];

  return (
    <div className="space-y-4">
        {/* 8 metric tiles in a 4-column grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {financialMetrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{metric.label}</p>
                  <div className={`rounded-md p-1 ${metric.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${metric.iconColor}`} />
                  </div>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{metric.value}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{metric.sublabel}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {showDetails ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showDetails && (
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
            <TrendCharts color="green" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Key Financial Takeaway</span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {data?.text?.key_takeaway ?? 'N/A'}
            </p>
          </div>
        )}
    </div>
  );
}
