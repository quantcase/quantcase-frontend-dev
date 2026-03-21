import { cn } from "@/lib/utils";
import type { SuggestionPriority } from "@/types/wealthos";

interface PriorityBadgeProps {
  priority: SuggestionPriority;
  className?: string;
}

const priorityStyles: Record<SuggestionPriority, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  LOW: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        priorityStyles[priority],
        className
      )}
    >
      {priority}
    </span>
  );
}
