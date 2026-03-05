"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronUp, TrendingUp, Package, BarChart2, Zap, AlertTriangle,
  DollarSign, Quote, FileText,
} from "lucide-react";
import { safeMetric, type IndustryOverviewSection, type CompetitionSection } from "@/types/opportunity";
import { OperatingMetrics } from "@/components/opportunity/operating-metrics";

const insightAccents = [
  { border: "border-l-blue-500", icon: "text-blue-500" },
  { border: "border-l-emerald-500", icon: "text-emerald-500" },
  { border: "border-l-orange-500", icon: "text-orange-500" },
  { border: "border-l-purple-500", icon: "text-purple-500" },
];

interface IndustryOverviewCardProps {
  data?: IndustryOverviewSection;
  competition?: CompetitionSection;
}

export function IndustryOverviewCard({ data, competition }: IndustryOverviewCardProps) {
  const [showDeepDive, setShowDeepDive] = useState(true);

  const m = data?.metrics;
  const industryMetrics = [
    { ...safeMetric(m?.industry_revenue_ttm), icon: DollarSign, iconColor: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { ...safeMetric(m?.industry_cagr), icon: TrendingUp, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(m?.market_size), icon: Package, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(m?.current_opm), icon: BarChart2, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(m?.demand_signal), icon: Zap, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { ...safeMetric(m?.supply_constraint), icon: AlertTriangle, iconColor: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800" },
  ];

  const dsd = data?.text?.demand_supply_dynamics;
  const opmTrend = data?.text?.opm_trend;
  const transcripts = data?.text?.industry_transcripts;

  return (
    <div className="space-y-4">
        {/* 6 Metric tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {industryMetrics.map((metric, i) => {
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

        {/* Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {showDeepDive ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
            {showDeepDive ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showDeepDive && (
          <div className="space-y-4">

            {/* Demand-Supply Dynamics */}
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Demand-Supply Dynamics</span>
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Demand: </span>
                  {dsd?.demand ?? 'N/A'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Supply: </span>
                  {dsd?.supply ?? 'N/A'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Net Impact: </span>
                  {dsd?.net_impact ?? 'N/A'}
                </p>
              </div>
            </div>

            {/* Operating Metrics & Trends */}
            <OperatingMetrics industryOverview={data} competition={competition} />

            {/* Margin Trend Analysis */}
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Margin Trend Analysis</span>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Key Observations</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {(opmTrend?.key_observations ?? []).map(s => `• ${s}`).join("\n")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Margin Drivers</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {(opmTrend?.margin_drivers ?? []).map(s => `• ${s}`).join("\n")}
                  </p>
                </div>
              </div>
            </div>

            {/* Forward Outlook — separate callout block */}
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                  Forward Outlook (FY25-FY27E)
                </p>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {opmTrend?.forward_outlook ?? 'N/A'}
              </p>
            </div>

            {/* Key Insights from Industry Transcripts */}
            {(transcripts ?? []).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                    Key Insights from Industry Transcripts
                  </h3>
                </div>
                <div className="space-y-4">
                  {(transcripts ?? []).map((item, i) => {
                    const accent = insightAccents[i % insightAccents.length];
                    return (
                      <div key={i} className={`border-l-2 ${accent.border} pl-4 space-y-2`}>
                        <div className="flex gap-2.5">
                          <Quote className={`h-4 w-4 shrink-0 mt-0.5 ${accent.icon}`} />
                          <p className="text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            &ldquo;{item.quote}&rdquo;
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pl-6">
                          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{item.company}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-500">{item.context}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold border-0">
                            {item.sector}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Market Takeaway footer */}
        {data?.text?.takeaway && (
          <div className="border-t border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 -mx-6 px-6 py-3 rounded-b-lg">
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">MARKET TAKEAWAY: </span>
              {data.text.takeaway}
            </p>
          </div>
        )}
    </div>
  );
}
