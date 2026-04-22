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
    { ...safeMetric(m?.revenue), icon: TrendingUp },
    { ...safeMetric(m?.gross_margin), icon: BarChart2 },
    { ...safeMetric(m?.ebitda_margin), icon: PieChart },
    { ...safeMetric(m?.pat), icon: DollarSign },
    { ...safeMetric(m?.free_cash_flow), icon: Wallet },
    { ...safeMetric(m?.interest_coverage), icon: Shield },
    { ...safeMetric(m?.roce), icon: Target },
    { ...safeMetric(m?.roe), icon: Activity },
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
