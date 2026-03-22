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
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <TrendingUp className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Consistency Score</p>
          <p className="text-2xl font-normal text-zinc-900 dark:text-zinc-50">
            <DataValue value={metrics.score !== null && metrics.score !== undefined ? metrics.score : null} />
            {metrics.score !== null && metrics.score !== undefined && (
              <span className="text-xs font-light text-zinc-400 dark:text-zinc-600">
                /{metrics.maxScore}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Target className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Hit Rate</p>
          <p className="text-2xl font-normal text-zinc-900 dark:text-zinc-50">
            <DataValue value={metrics.hitRate !== null && metrics.hitRate !== undefined ? `${metrics.hitRate}%` : null} />
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Shield className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Bad News Disclosure</p>
          <p className="text-sm font-normal text-zinc-900 dark:text-zinc-50 capitalize">
            <DataValue value={metrics.disclosurePattern} />
          </p>
        </div>
      </div>
    </div>
  );
}
