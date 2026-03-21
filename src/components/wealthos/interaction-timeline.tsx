import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { InteractionIcon } from "./interaction-icon";
import type { WealthInteraction } from "@/types/wealthos";

interface InteractionTimelineProps {
  interactions: WealthInteraction[];
}

const sentimentStyles: Record<string, string> = {
  positive: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  neutral: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  if (!interactions?.length) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">No interactions recorded</p>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <InteractionIcon type={interaction.type} />
            </div>
            <div className="w-px flex-1 bg-zinc-100 dark:bg-zinc-800 mt-1" />
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">{interaction.type}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatDate(interaction.timestamp)}</span>
              {interaction.sentiment && (
                <span className={cn(
                  "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize",
                  sentimentStyles[interaction.sentiment.toLowerCase()] ?? sentimentStyles.neutral
                )}>
                  {interaction.sentiment}
                </span>
              )}
            </div>
            {interaction.summary && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{interaction.summary}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
