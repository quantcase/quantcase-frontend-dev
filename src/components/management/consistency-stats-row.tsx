import type { ConsistencyMetrics } from "@/types/management";
import { DataValue } from "@/components/molecules/data-value";
import { TrendingUp, Target, Shield } from "lucide-react";

interface ConsistencyStatsRowProps {
  metrics: ConsistencyMetrics;
}

export function ConsistencyStatsRow({ metrics }: ConsistencyStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-3">
      <div className="flex items-center gap-4">
        <div style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(18,18,18,0.10)", background: "rgba(18,18,18,0.03)", flexShrink: 0 }}>
          <TrendingUp className="h-5 w-5 text-zinc-500" />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Consistency Score
          </p>
          <p style={{ fontSize: 28, fontWeight: 400, color: "#0F172B", lineHeight: 1 }}>
            <DataValue value={metrics.score !== null && metrics.score !== undefined ? metrics.score : null} />
            {metrics.score !== null && metrics.score !== undefined && (
              <span style={{ fontSize: 12, fontWeight: 300, color: "#888888" }}>
                /{metrics.maxScore}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(18,18,18,0.10)", background: "rgba(18,18,18,0.03)", flexShrink: 0 }}>
          <Target className="h-5 w-5 text-zinc-500" />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Hit Rate
          </p>
          <p style={{ fontSize: 28, fontWeight: 400, color: "#0F172B", lineHeight: 1 }}>
            <DataValue value={metrics.hitRate !== null && metrics.hitRate !== undefined ? `${metrics.hitRate}%` : null} />
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(18,18,18,0.10)", background: "rgba(18,18,18,0.03)", flexShrink: 0 }}>
          <Shield className="h-5 w-5 text-zinc-500" />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
            Bad News Disclosure
          </p>
          <p style={{ fontSize: 18, fontWeight: 400, color: "#0F172B", lineHeight: 1.2 }} className="capitalize">
            <DataValue value={metrics.disclosurePattern} />
          </p>
        </div>
      </div>
    </div>
  );
}
