import { StatusBadge, type StatusSentiment } from "@/components/ds";
import type { SuggestionPriority } from "@/types/wealthos";

interface PriorityBadgeProps {
  priority: SuggestionPriority;
  className?: string;
}

const SENTIMENT: Record<SuggestionPriority, StatusSentiment> = {
  HIGH: "negative",
  MEDIUM: "caution",
  LOW: "positive",
};

/**
 * Priority pill rendered through the canonical `ds/StatusBadge` — HIGH=negative
 * (red), MEDIUM=caution (amber), LOW=positive (green). Single-source styling.
 */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <StatusBadge
      label={priority}
      sentiment={SENTIMENT[priority]}
      className={className}
    />
  );
}
