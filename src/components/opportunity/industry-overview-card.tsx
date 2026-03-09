"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronUp, TrendingUp, Package, BarChart2, Zap, AlertTriangle,
  DollarSign, Quote, FileText, Info, CheckCircle2,
} from "lucide-react";
import { safeMetric, type IndustryOverviewSection, type CompetitionSection } from "@/types/opportunity";
import { OperatingMetrics } from "@/components/opportunity/operating-metrics";

const insightAccents = [
  { border: "border-l-blue-500", icon: "text-blue-500", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  { border: "border-l-emerald-500", icon: "text-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  { border: "border-l-orange-500", icon: "text-orange-500", badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
  { border: "border-l-purple-500", icon: "text-purple-500", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
];

// Figma-style metric tile config: label color, value color, sublabel color, bg
const metricTileStyles = [
  { labelColor: "text-indigo-500", valueColor: "text-zinc-900 dark:text-zinc-50", sublabelColor: "text-indigo-400", bg: "bg-indigo-50/60 dark:bg-indigo-900/10" },
  { labelColor: "text-blue-500", valueColor: "text-blue-700 dark:text-blue-300", sublabelColor: "text-blue-400", bg: "bg-blue-50/60 dark:bg-blue-900/10" },
  { labelColor: "text-emerald-600", valueColor: "text-emerald-700 dark:text-emerald-300", sublabelColor: "text-emerald-500", bg: "bg-emerald-50/60 dark:bg-emerald-900/10" },
  { labelColor: "text-purple-500", valueColor: "text-purple-700 dark:text-purple-300", sublabelColor: "text-purple-400", bg: "bg-purple-50/60 dark:bg-purple-900/10" },
  { labelColor: "text-orange-500", valueColor: "text-orange-700 dark:text-orange-300", sublabelColor: "text-orange-400", bg: "bg-orange-50/60 dark:bg-orange-900/10" },
  { labelColor: "text-zinc-500", valueColor: "text-zinc-900 dark:text-zinc-50", sublabelColor: "text-zinc-400", bg: "bg-zinc-50/80 dark:bg-zinc-800/40" },
];

interface IndustryOverviewCardProps {
  data?: IndustryOverviewSection;
  competition?: CompetitionSection;
}

export function IndustryOverviewCard({ data, competition }: IndustryOverviewCardProps) {
  const [showDeepDive, setShowDeepDive] = useState(true);

  const m = data?.metrics;
  const industryMetrics = [
    { ...safeMetric(m?.industry_revenue_ttm), icon: DollarSign, style: metricTileStyles[0] },
    { ...safeMetric(m?.industry_cagr), icon: TrendingUp, style: metricTileStyles[1] },
    { ...safeMetric(m?.market_size), icon: Package, style: metricTileStyles[2] },
    { ...safeMetric(m?.current_opm), icon: BarChart2, style: metricTileStyles[3] },
    { ...safeMetric(m?.demand_signal), icon: Zap, style: metricTileStyles[4] },
    { ...safeMetric(m?.supply_constraint), icon: AlertTriangle, style: metricTileStyles[5] },
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
              <div key={i} className={`rounded-lg border border-zinc-100 dark:border-zinc-800 p-3 ${metric.style.bg}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={`h-3 w-3 ${metric.style.labelColor}`} />
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${metric.style.labelColor}`}>{metric.label}</p>
                </div>
                <p className={`text-lg font-bold ${metric.style.valueColor}`}>{metric.value}</p>
                <p className={`text-[11px] mt-0.5 ${metric.style.sublabelColor}`}>{metric.sublabel}</p>
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
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Demand-Supply Dynamics</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Demand: </span>
                  {dsd?.demand ?? 'N/A'}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Supply: </span>
                  {dsd?.supply ?? 'N/A'}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Net Impact: </span>
                  {dsd?.net_impact ?? 'N/A'}
                </p>
              </div>
            </div>

            {/* Operating Metrics & Trends */}
            <OperatingMetrics industryOverview={data} competition={competition} />

            {/* Margin Trend Analysis */}
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Margin Trend Analysis</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Key Observations</p>
                  </div>
                  <ul className="space-y-1.5">
                    {(opmTrend?.key_observations ?? []).map((s, i) => {
                      const colonIdx = s.indexOf(':');
                      const hasBold = colonIdx > 0 && colonIdx < 40;
                      return (
                        <li key={i} className="flex gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <span className="text-zinc-400 flex-shrink-0">•</span>
                          {hasBold
                            ? <span><span className="font-bold text-zinc-800 dark:text-zinc-200">{s.slice(0, colonIdx)}:</span>{s.slice(colonIdx + 1)}</span>
                            : <span>{s}</span>
                          }
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Margin Drivers</p>
                  </div>
                  <ul className="space-y-1.5">
                    {(opmTrend?.margin_drivers ?? []).map((s, i) => {
                      const colonIdx = s.indexOf(':');
                      const hasBold = colonIdx > 0 && colonIdx < 40;
                      return (
                        <li key={i} className="flex gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <span className="text-zinc-400 flex-shrink-0">•</span>
                          {hasBold
                            ? <span><span className="font-bold text-zinc-800 dark:text-zinc-200">{s.slice(0, colonIdx)}:</span>{s.slice(colonIdx + 1)}</span>
                            : <span>{s}</span>
                          }
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Forward Outlook */}
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-cyan-100 to-cyan-50 dark:from-zinc-900 dark:to-cyan-900/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Forward Outlook (FY25-FY27E)
                </p>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {opmTrend?.forward_outlook ?? 'N/A'}
              </p>
            </div>

            

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
