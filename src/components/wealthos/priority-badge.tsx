import { cn } from "@/lib/utils";
import type { SuggestionPriority } from "@/types/wealthos";

interface PriorityBadgeProps {
  priority: SuggestionPriority;
  className?: string;
}

const priorityStyles: Record<SuggestionPriority, React.CSSProperties> = {
  HIGH: {
    background: "var(--qc-down-soft)",
    border: "1px solid rgba(178,58,47,0.25)",
    color: "var(--qc-down)",
  },
  MEDIUM: {
    background: "var(--qc-warn-soft)",
    border: "1px solid rgba(180,115,26,0.25)",
    color: "var(--qc-warn)",
  },
  LOW: {
    background: "var(--qc-up-soft)",
    border: "1px solid rgba(31,122,74,0.25)",
    color: "var(--qc-up)",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.04em]", className)}
      style={priorityStyles[priority]}
    >
      <span
        className="size-1.5 rounded-full shrink-0"
        style={{ background: "currentColor" }}
      />
      {priority}
    </span>
  );
}
