import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConsistencyStatsRow } from "./consistency-stats-row";
import type { ConsistencyMetrics } from "@/types/management";

interface ConsistencyAnalysisProps {
  consistency: ConsistencyMetrics;
}

export function ConsistencyAnalysis({ consistency }: ConsistencyAnalysisProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
          <span className="text-blue-600 dark:text-blue-400">●</span>
          COMMENTARY CONSISTENCY ANALYSIS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ConsistencyStatsRow metrics={consistency} />
      </CardContent>
    </Card>
  );
}
