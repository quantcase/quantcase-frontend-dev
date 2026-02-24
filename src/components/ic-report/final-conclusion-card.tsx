import type { ICConclusion } from "@/types/portfolio";
import { cn } from "@/lib/utils";

interface FinalConclusionCardProps {
  conclusion: ICConclusion;
}

function StyleClassificationCard({ value }: { value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 p-4 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
        Style Classification
      </p>
      <p className="text-base font-bold text-orange-500 dark:text-orange-400">{value}</p>
    </div>
  );
}

function ConfidenceLevelCard({ value }: { value: string }) {
  const color =
    value.toLowerCase() === "high"
      ? "text-emerald-600 dark:text-emerald-400"
      : value.toLowerCase() === "medium"
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 p-4 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
        Confidence Level
      </p>
      <p className={cn("text-base font-bold", color)}>{value}</p>
    </div>
  );
}

export function FinalConclusionCard({ conclusion }: FinalConclusionCardProps) {
  return (
    <div className="rounded-xl border-2 border-amber-400 dark:border-amber-500/60 bg-white dark:bg-zinc-900 p-6 space-y-5">
      {/* Section label */}
      <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
        Final IC Conclusion
      </p>

      {/* Conclusion text */}
      <p className="text-base text-zinc-800 dark:text-zinc-200 leading-relaxed">
        {conclusion.conclusionText}
      </p>

      {/* Sub-cards row */}
      <div className="flex gap-4">
        <StyleClassificationCard value={conclusion.styleClassification} />
        <ConfidenceLevelCard value={conclusion.confidenceLevel} />
      </div>

      {/* Target owner */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Target Owner:{" "}
        </span>
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{conclusion.targetOwner}</span>
      </div>

      {/* Why now */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Why Now:{" "}
        </span>
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{conclusion.whyNow}</span>
      </div>

      {/* Divider + Score */}
      <div className="flex items-end justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Final IM Score Recap
        </p>
        <p className="text-4xl font-extrabold text-emerald-500 dark:text-emerald-400 tabular-nums">
          {conclusion.imScore}
          <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">/100</span>
        </p>
      </div>
    </div>
  );
}
