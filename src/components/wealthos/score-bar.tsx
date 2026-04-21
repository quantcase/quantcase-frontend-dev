import { cn } from "@/lib/utils";
import type { ScoreComponents } from "@/types/wealthos";

interface ScoreBarProps {
  score: number;
  components: ScoreComponents;
  className?: string;
}

interface Segment {
  key: keyof ScoreComponents;
  label: string;
  color: string;
}

const SEGMENTS: Segment[] = [
  { key: "drawdown", label: "Drawdown", color: "var(--qc-down)" },
  { key: "daysSinceContact", label: "Days w/o Contact", color: "var(--qc-warn)" },
  { key: "churnProbability", label: "Churn Risk", color: "var(--qc-down)" },
  { key: "riskMismatch", label: "Risk Mismatch", color: "var(--qc-warn)" },
];

export function ScoreBar({ score, components, className }: ScoreBarProps) {
  const total = Object.values(components).reduce((sum, v) => sum + v, 0) || 1;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Priority Score
        </span>
        <span style={{ fontSize: 11, fontFamily: "var(--font-ibm-plex-mono, monospace)", fontWeight: 600, color: "var(--qc-text-heading)" }}>
          {(score * 100).toFixed(0)}
        </span>
      </div>
      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--qc-surface-panel)" }}
      >
        {SEGMENTS.map(({ key, color }) => {
          const width = (components[key] / total) * 100;
          return (
            <div
              key={key}
              className="h-full transition-all"
              style={{ width: `${width}%`, background: color }}
              title={`${key}: ${components[key].toFixed(2)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {SEGMENTS.map(({ key, label, color }) => (
          <span key={key} className="flex items-center gap-1" style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>
            <span className="inline-block size-1.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
