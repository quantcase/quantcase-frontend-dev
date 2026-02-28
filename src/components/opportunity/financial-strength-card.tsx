"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, TrendingUp, BarChart2, Wallet, CreditCard, Target } from "lucide-react";
import { safeMetric, type FinancialStrengthSection } from "@/types/opportunity";

interface FinancialStrengthCardProps {
  data?: FinancialStrengthSection;
}

export function FinancialStrengthCard({ data }: FinancialStrengthCardProps) {
  const [showDetails, setShowDetails] = useState(true);

  const m = data?.metrics;
  const financialMetrics = [
    { ...safeMetric(m?.revenue), icon: TrendingUp, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(m?.ebitda_margin), icon: BarChart2, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(m?.free_cash_flow), icon: Wallet, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(m?.net_debt_ebitda), icon: CreditCard, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { ...safeMetric(m?.roce), icon: Target, iconColor: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800" },
  ];

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                {data?.meta?.section_id} {data?.meta?.title ?? 'Financial Strength'}
              </h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 normal-case tracking-normal font-normal mt-0.5">
                {data?.meta?.subtitle}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs text-zinc-500">
            Weight: 20% of Total Score
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {financialMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                  <div className={`rounded-md p-1 ${m.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${m.iconColor}`} />
                  </div>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{m.value}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{m.sublabel}</p>
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
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Key Financial Takeaway</span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {data?.text?.key_takeaway ?? 'N/A'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
