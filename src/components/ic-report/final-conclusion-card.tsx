import type { ICConclusion } from "@/types/portfolio";
import { cn } from "@/lib/utils";
import { ScoreValue } from "@/components/ds";

interface FinalConclusionCardProps {
  conclusion: ICConclusion;
}

function StyleClassificationCard({ value }: { value: string }) {
  return (
    <div className="rounded-lg bg-secondary border border-hair p-4 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-2">
        Style Classification
      </p>
      <p className="text-base font-bold text-warn">{value}</p>
    </div>
  );
}

function ConfidenceLevelCard({ value }: { value: string }) {
  const color =
    value.toLowerCase() === "high"
      ? "text-up"
      : value.toLowerCase() === "medium"
      ? "text-warn"
      : "text-down";

  return (
    <div className="rounded-lg bg-secondary border border-hair p-4 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-2">
        Confidence Level
      </p>
      <p className={cn("text-base font-bold", color)}>{value}</p>
    </div>
  );
}

export function FinalConclusionCard({ conclusion }: FinalConclusionCardProps) {
  return (
    <div className="rounded-xl border-2 border-warn bg-card p-6 space-y-5">
      {/* Section label */}
      <p className="text-xs font-bold uppercase tracking-widest text-warn">
        Final IC Conclusion
      </p>

      {/* Conclusion text */}
      <p className="text-base text-ink leading-relaxed">
        {conclusion.conclusionText}
      </p>

      {/* Sub-cards row */}
      <div className="flex gap-4">
        <StyleClassificationCard value={conclusion.styleClassification} />
        <ConfidenceLevelCard value={conclusion.confidenceLevel} />
      </div>

      {/* Target owner */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
          Target Owner:{" "}
        </span>
        <span className="text-sm text-ink-2">{conclusion.targetOwner}</span>
      </div>

      {/* Why now */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-warn">
          Why Now:{" "}
        </span>
        <span className="text-sm text-ink-2">{conclusion.whyNow}</span>
      </div>

      {/* Divider + Score */}
      <div className="flex items-end justify-between pt-4 border-t border-hair">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
          Final IM Score Recap
        </p>
        <ScoreValue value={conclusion.imScore} max={100} size="md" />
      </div>
    </div>
  );
}
