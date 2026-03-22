import { ConsistencyStatsRow } from "./consistency-stats-row";
import type { ConsistencyMetrics } from "@/types/management";

interface ConsistencyAnalysisProps {
  consistency: ConsistencyMetrics;
}

export function ConsistencyAnalysis({ consistency }: ConsistencyAnalysisProps) {
  return <ConsistencyStatsRow metrics={consistency} />;
}
