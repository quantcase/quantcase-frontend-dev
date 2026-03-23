import { cn } from "@/lib/utils";
import type { Segment } from "@/types/wealthos";

interface SegmentBadgeProps {
  segment: Segment;
  className?: string;
}

const segmentStyles: Record<Segment, string> = {
  UHNI: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  HNI: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Retail: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Institutional: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  Private: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function SegmentBadge({ segment, className }: SegmentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        segmentStyles[segment],
        className
      )}
    >
      {segment}
    </span>
  );
}
