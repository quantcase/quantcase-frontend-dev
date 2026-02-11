import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConsistencyStatsRow } from "./consistency-stats-row";
import type { ConsistencyMetrics } from "@/types/management";

interface ConsistencyAnalysisProps {
  consistency: ConsistencyMetrics;
}

export function ConsistencyAnalysis({ consistency }: ConsistencyAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">●</span> COMMENTARY CONSISTENCY ANALYSIS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ConsistencyStatsRow metrics={consistency} />
      </CardContent>
    </Card>
  );
}
