import type { ConsistencyMetrics } from "@/types/management";
import { DataValue } from "@/components/molecules/data-value";
import { TrendingUp, Target, Shield } from "lucide-react";

interface ConsistencyStatsRowProps {
  metrics: ConsistencyMetrics;
}

export function ConsistencyStatsRow({ metrics }: ConsistencyStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Consistency Score</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            <DataValue value={metrics.score !== null && metrics.score !== undefined ? metrics.score : null} />
            {metrics.score !== null && metrics.score !== undefined && (
              <span className="text-sm text-zinc-400 dark:text-zinc-600 font-normal">
                /{metrics.maxScore}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Hit Rate</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            <DataValue value={metrics.hitRate !== null && metrics.hitRate !== undefined ? `${metrics.hitRate}%` : null} />
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Bad News Disclosure</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
            <DataValue value={metrics.disclosurePattern} />
          </p>
        </div>
      </div>
    </div>
  );
}
