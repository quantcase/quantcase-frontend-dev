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
  { key: "drawdown", label: "Drawdown", color: "bg-red-400" },
  { key: "daysSinceContact", label: "Days w/o Contact", color: "bg-amber-400" },
  { key: "churnProbability", label: "Churn Risk", color: "bg-orange-400" },
  { key: "riskMismatch", label: "Risk Mismatch", color: "bg-rose-400" },
];

export function ScoreBar({ score, components, className }: ScoreBarProps) {
  const total = Object.values(components).reduce((sum, v) => sum + v, 0) || 1;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">Priority Score</span>
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
          {(score * 100).toFixed(0)}
        </span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {SEGMENTS.map(({ key, color }) => {
          const width = (components[key] / total) * 100;
          return (
            <div
              key={key}
              className={cn("h-full transition-all", color)}
              style={{ width: `${width}%` }}
              title={`${key}: ${components[key].toFixed(2)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {SEGMENTS.map(({ key, label, color }) => (
          <span key={key} className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
            <span className={cn("inline-block size-2 rounded-full", color)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
