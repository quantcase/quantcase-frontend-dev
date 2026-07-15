import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Segment } from "@/types/wealthos";

interface SegmentBadgeProps {
  segment: Segment;
  className?: string;
}

/**
 * Neutral category tag rendered through the canonical Badge (secondary variant
 * = --qc-section chip + hairline border), keeping the single-source styling.
 */
export function SegmentBadge({ segment, className }: SegmentBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("border-hair text-ink-2 font-medium", className)}>
      {segment}
    </Badge>
  );
}
