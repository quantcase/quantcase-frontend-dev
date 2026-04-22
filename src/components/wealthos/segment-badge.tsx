import { cn } from "@/lib/utils";
import type { Segment } from "@/types/wealthos";

interface SegmentBadgeProps {
  segment: Segment;
  className?: string;
}

export function SegmentBadge({ segment, className }: SegmentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        background: "var(--qc-chip-bg)",
        border: "1px solid var(--qc-chip-border)",
        color: "var(--qc-chip-fg)",
      }}
    >
      {segment}
    </span>
  );
}
