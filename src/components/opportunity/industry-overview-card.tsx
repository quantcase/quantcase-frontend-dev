"use client";

import { useState } from "react";
import {
  TrendingUp, Package, BarChart2, Zap, AlertTriangle,
  DollarSign, Info, CheckCircle2,
} from "lucide-react";
import { safeMetric, type IndustryOverviewSection, type CompetitionSection, type IndustryCagrMetric } from "@/types/opportunity";
import { OperatingMetrics } from "@/components/opportunity/operating-metrics";
import { MetricTile } from "@/components/molecules/metric-tile";
import { ExpandToggle } from "@/components/molecules/expand-toggle";
import { TakeawayBox } from "@/components/opportunity/takeaway-box";

const metricTileStyles = [
  { labelColor: "text-indigo-500", valueColor: "text-zinc-900 dark:text-zinc-50" },
  { labelColor: "text-blue-500", valueColor: "text-blue-700 dark:text-blue-300" },
  { labelColor: "text-emerald-600", valueColor: "text-emerald-700 dark:text-emerald-300" },
  { labelColor: "text-purple-500", valueColor: "text-purple-700 dark:text-purple-300" },
  { labelColor: "text-orange-500", valueColor: "text-orange-700 dark:text-orange-300" },
  { labelColor: "text-zinc-500", valueColor: "text-zinc-900 dark:text-zinc-50" },
];

interface IndustryOverviewCardProps {
  data?: IndustryOverviewSection;
  competition?: CompetitionSection;
}

function cagrDisplay(cagr?: IndustryCagrMetric): { value: string; sublabel: string } {
  const value = cagr?.one_year ?? cagr?.three_year ?? cagr?.qoq ?? "N/A";
  const parts = [
    cagr?.qoq ? `QoQ: ${cagr.qoq}` : null,
    cagr?.one_year ? `1Y: ${cagr.one_year}` : null,
    cagr?.three_year ? `3Y: ${cagr.three_year}` : null,
  ].filter(Boolean);
  return { value, sublabel: parts.join(" | ") || cagr?.sublabel || "" };
}

export function IndustryOverviewCard({ data, competition }: IndustryOverviewCardProps) {
  const [showDeepDive, setShowDeepDive] = useState(false);

  const m = data?.metrics;
  const cagr = cagrDisplay(m?.industry_cagr);

  const industryMetrics = [
    { ...safeMetric(m?.industry_revenue_ttm), change: m?.industry_revenue_ttm?.change, icon: DollarSign, style: metricTileStyles[0] },
    { label: m?.industry_cagr?.label ?? "Industry CAGR", value: cagr.value, sublabel: cagr.sublabel, change: null, icon: TrendingUp, style: metricTileStyles[1] },
    { ...safeMetric(m?.current_opm), change: m?.current_opm?.change, icon: BarChart2, style: metricTileStyles[3] },
    { ...safeMetric(m?.industry_aum), change: m?.industry_aum?.change, icon: Package, style: metricTileStyles[2] },
    { ...safeMetric(m?.industry_roce), change: m?.industry_roce?.change, icon: BarChart2, style: metricTileStyles[0] },
    { ...safeMetric(m?.demand_signal), change: null, icon: Zap, style: metricTileStyles[4] },
    { ...safeMetric(m?.supply_constraint), change: null, icon: AlertTriangle, style: metricTileStyles[5] },
  ];

  const dsd = data?.text?.demand_supply_dynamics;
  const opmTrend = data?.text?.opm_trend;

  return (
    <div className="space-y-4">
      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {industryMetrics.map((metric, i) => (
          <MetricTile
            key={i}
            label={metric.label}
            value={metric.value}
            sublabel={metric.sublabel}
            icon={metric.icon}
            iconColor={metric.style.labelColor}
            valueColor={metric.style.valueColor}
            change={metric.change ?? undefined}
            iconLayout="left"
            valueSize="2xl"
          />
        ))}
      </div>

      <ExpandToggle
        expanded={showDeepDive}
        onToggle={() => setShowDeepDive(!showDeepDive)}
        label="Show Detailed Analysis"
        collapseLabel="Hide Detailed Analysis"
      />

      {showDeepDive && (
        <div className="space-y-4">

          {/* Demand-Supply Dynamics */}
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
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
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50 px-3 py-2">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <span className="font-bold text-amber-700 dark:text-amber-400">Net Impact: </span>
                  {dsd?.net_impact ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Operating Metrics & Trends */}
          <OperatingMetrics industryOverview={data} competition={competition} />

          {/* Margin Trend Analysis */}
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
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
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
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
        <TakeawayBox title="MARKET TAKEAWAY" text={data.text.takeaway} />
      )}
    </div>
  );
}
