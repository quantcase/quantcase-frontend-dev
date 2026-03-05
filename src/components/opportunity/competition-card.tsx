"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Shield, TrendingUp, Award, Activity, Lock } from "lucide-react";
import { safeMetric, type CompetitionSection } from "@/types/opportunity";

interface CompetitionCardProps {
  data?: CompetitionSection;
}

export function CompetitionCard({ data }: CompetitionCardProps) {
  const [showDeepDive, setShowDeepDive] = useState(true);

  const m = data?.metrics;
  const competitionMetrics = [
    { ...safeMetric(m?.porters_score), icon: Shield, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(m?.pricing_power), icon: TrendingUp, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(m?.market_position), icon: Award, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(m?.competitive_intensity), icon: Activity, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { ...safeMetric(m?.entry_barriers), icon: Lock, iconColor: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800" },
  ];

  const ppd = data?.text?.pricing_power_dynamics;

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {competitionMetrics.map((m, i) => {
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
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {showDeepDive ? "Hide Deep Dive" : "Show Deep Dive"}
            {showDeepDive ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showDeepDive && (
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Pricing Power &amp; Dynamics</span>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Current State (FY24)</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{ppd?.current_state ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Shifting Dynamics</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{ppd?.shifting_dynamics ?? 'N/A'}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-2 pt-1">
              <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold uppercase shrink-0">
                Future Trajectory (FY25-27E)
              </Badge>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{ppd?.future_trajectory ?? 'N/A'}</p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold uppercase shrink-0">
                Watch-outs
              </Badge>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{ppd?.watch_outs ?? 'N/A'}</p>
            </div>
          </div>
        )}
    </div>
  );
}
