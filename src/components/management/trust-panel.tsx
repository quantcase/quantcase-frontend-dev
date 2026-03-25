import { formatLabel } from "@/lib/utils";
import type { TrustScore, ConsistencyMetrics } from "@/types/management";
import { Shield } from "lucide-react";
import { ScoringCard } from "@/components/molecules/scoring-card";

interface TrustPanelProps {
  trust: TrustScore;
  consistency?: ConsistencyMetrics;
}

function getFilledBlocks(value: number): number {
  if (value >= 85) return 5;
  if (value >= 65) return 4;
  if (value >= 45) return 3;
  if (value >= 25) return 2;
  if (value > 0) return 1;
  return 0;
}

export function TrustPanel({ trust, consistency }: TrustPanelProps) {
  const hasScore = consistency && consistency.score != null && consistency.maxScore != null;

  const score = hasScore ? consistency!.score : 0;
  const maxScore = hasScore ? consistency!.maxScore : 20;

  const rows = Object.entries(trust.subfactors).map(([key, value]) => ({
    name: formatLabel(key),
    score: getFilledBlocks(value),
    maxScore: 5,
  }));

  return (
    <ScoringCard
      title={
        <span className="flex items-center gap-2">
          <Shield style={{ width: 14, height: 14, color: "#888888" }} />
          Management Quality Summary
        </span>
      }
      scoreLabel="Overall Trust Level"
      score={score}
      maxScore={maxScore}
      barColor="#22c55e"
      rows={rows}
      compactRows
    />
  );
}
