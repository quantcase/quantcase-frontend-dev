import type { ConsistencyMetrics } from "@/types/management";
import { TrendingUp, Target, Shield } from "lucide-react";

interface ConsistencyStatsRowProps {
  metrics: ConsistencyMetrics;
}

export function ConsistencyStatsRow({ metrics }: ConsistencyStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Consistency Score</p>
          <p className="text-2xl font-bold">
            {metrics.score} <span className="text-sm text-muted-foreground">/{metrics.maxScore}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
          <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Hit Rate</p>
          <p className="text-2xl font-bold">{metrics.hitRate}%</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Bad News Disclosure</p>
          <p className="text-lg font-semibold">{metrics.disclosurePattern}</p>
        </div>
      </div>
    </div>
  );
}
