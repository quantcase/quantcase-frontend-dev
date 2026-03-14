import type { ReactNode } from "react";
import type { FinalScoringSection } from "@/types/opportunity";

const SCORE_COLORS: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function SectionScoreBadge({ scoring }: { scoring: FinalScoringSection }) {
  const colorClass = SCORE_COLORS[scoring.status_color ?? "green"] ?? SCORE_COLORS.green;
  return (
    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${colorClass}`}>
      <span>{scoring.score}/{scoring.max_score}</span>
      <span className="font-medium opacity-80">{scoring.status}</span>
    </div>
  );
}

interface SectionPanelProps {
  title: string;
  subtitle?: string;
  scoring?: FinalScoringSection;
  children: ReactNode;
  contentClassName?: string;
}

export function SectionPanel({
  title,
  subtitle,
  scoring,
  children,
  contentClassName = "px-6 space-y-4",
}: SectionPanelProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide mb-0.5">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
        </div>
        {scoring && <SectionScoreBadge scoring={scoring} />}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
