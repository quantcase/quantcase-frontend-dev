"use client";

import {
  TrendingUp, BarChart2, Wallet, Target,
  DollarSign, PieChart, Shield, Activity,
} from "lucide-react";
import { safeMetric, type FinancialStrengthSection } from "@/types/opportunity";
import { MetricTile } from "@/components/molecules/metric-tile";
import { ExpandToggle } from "@/components/molecules/expand-toggle";

interface FinancialStrengthCardProps {
  data?: FinancialStrengthSection;
  showDetails?: boolean;
  onToggle?: () => void;
}

export function FinancialStrengthCard({ data, showDetails = true, onToggle }: FinancialStrengthCardProps) {
  const m = data?.metrics;
  const financialMetrics = [
    { ...safeMetric(m?.revenue), icon: TrendingUp, iconColor: "text-blue-500" },
    { ...safeMetric(m?.gross_margin), icon: BarChart2, iconColor: "text-emerald-500" },
    { ...safeMetric(m?.ebitda_margin), icon: PieChart, iconColor: "text-purple-500" },
    { ...safeMetric(m?.pat), icon: DollarSign, iconColor: "text-indigo-500" },
    { ...safeMetric(m?.free_cash_flow), icon: Wallet, iconColor: "text-teal-500" },
    { ...safeMetric(m?.interest_coverage), icon: Shield, iconColor: "text-orange-500" },
    { ...safeMetric(m?.roce), icon: Target, iconColor: "text-rose-500" },
    { ...safeMetric(m?.roe), icon: Activity, iconColor: "text-zinc-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {financialMetrics.map((metric, i) => (
          <MetricTile key={i} {...metric} />
        ))}
      </div>

      {onToggle && (
        <ExpandToggle expanded={showDetails} onToggle={onToggle} />
      )}
    </div>
  );
}
