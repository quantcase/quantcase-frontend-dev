"use client";

import { TrendingUp, Award, Activity, Lock, ZapIcon } from "lucide-react";
import { safeMetric, type CompetitionSection } from "@/types/opportunity";
import { MetricTile } from "@/components/molecules/metric-tile";
import { ExpandToggle } from "@/components/molecules/expand-toggle";
import { InsightsCard } from "@/components/opportunity/insights-card";

interface CompetitionCardProps {
  data?: CompetitionSection;
  showDetails?: boolean;
  onToggle?: () => void;
}

export function CompetitionCard({ data, showDetails = false, onToggle }: CompetitionCardProps) {
  const m = data?.metrics;
  const competitionMetrics = [
    { ...safeMetric(m?.pricing_power), icon: TrendingUp, iconColor: "text-emerald-500" },
    { ...safeMetric(m?.market_position), icon: Award, iconColor: "text-purple-500" },
    { ...safeMetric(m?.competitive_intensity), icon: Activity, iconColor: "text-orange-500" },
    { ...safeMetric(m?.entry_barriers), icon: Lock, iconColor: "text-zinc-500" },
  ];

  const ppd = data?.text?.pricing_power_dynamics;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {competitionMetrics.map((m, i) => (
          <MetricTile key={i} {...m} />
        ))}
      </div>

      {onToggle && (
        <ExpandToggle
          expanded={showDetails}
          onToggle={onToggle}
          label="Show Deep Dive"
          collapseLabel="Hide Deep Dive"
        />
      )}

      {showDetails && (
        <div className="space-y-3">
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <ZapIcon className="h-3.5 w-3.5 text-zinc-500" />
              <h6 className="uppercase tracking-wider">Pricing Power &amp; Dynamics</h6>
            </div>
            <h5>How Pricing Power is Shifting</h5>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-100 bg-white px-4 py-6 flex flex-col gap-2">
                <h5>Current State</h5>
                <p className="line-clamp-2">{ppd?.current_state ?? 'N/A'}</p>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-white px-4 py-6 flex flex-col gap-2">
                <h5>Shifting Dynamics</h5>
                <p className="line-clamp-2">{ppd?.shifting_dynamics ?? 'N/A'}</p>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-white px-4 py-6 flex flex-col gap-2">
                <h5>Future Trajectory</h5>
                <p className="line-clamp-2">{ppd?.future_trajectory ?? 'N/A'}</p>
              </div>
            </div>
          </div>
          {ppd?.watch_outs && (
            <InsightsCard title="Watch-outs" text={ppd.watch_outs} />
          )}
        </div>
      )}
    </div>
  );
}
