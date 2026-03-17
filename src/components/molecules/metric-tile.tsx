import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function changeTextColor(change: string): string {
  if (change.startsWith("+")) return "text-emerald-600 dark:text-emerald-400";
  if (change.startsWith("-")) return "text-red-500 dark:text-red-400";
  return "text-zinc-500 dark:text-zinc-400";
}

interface MetricTileProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  /** Color applied to both the icon and label text (unless labelColor is set separately) */
  iconColor?: string;
  labelColor?: string;
  valueColor?: string;
  sublabelColor?: string;
  bg?: string;
  /** Inline change string (e.g. "+12%"), colored automatically by sign */
  change?: string | null;
  /** "top-right" — icon sits in top-right corner (default). "left" — icon precedes label. */
  iconLayout?: "top-right" | "left";
  /** Font-size of the main value: "lg" (default) or "2xl" */
  valueSize?: "lg" | "2xl";
  className?: string;
}

export function MetricTile({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor = "text-zinc-500",
  labelColor,
  valueColor = "text-zinc-900 dark:text-zinc-50",
  sublabelColor = "text-zinc-500 dark:text-zinc-400",
  bg = "bg-white dark:bg-zinc-900",
  change,
  iconLayout = "top-right",
  valueSize = "lg",
  className,
}: MetricTileProps) {
  const effectiveLabelColor = labelColor ?? iconColor;

  return (
    <div className={cn("rounded-lg border border-zinc-100 dark:border-zinc-800 p-3", bg, className)}>
      {iconLayout === "left" ? (
        <div className="flex items-center gap-1.5 mb-2">
          {Icon && <Icon className={cn("h-3 w-3", effectiveLabelColor)} />}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-900/50 dark:text-zinc-50/50">
            {label}
          </p>
        </div>
      ) : (
        <div className="flex items-start justify-between mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-900/50 dark:text-zinc-50/50">
            {label}
          </p>
          {Icon && (
            <div className={cn("rounded-md p-1", bg)}>
              <Icon className={cn("h-3.5 w-3.5", iconColor)} />
            </div>
          )}
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <p className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50">
          {value}
        </p>
        {change && (
          <span className={cn("text-[11px] font-semibold", changeTextColor(change))}>
            {change}
          </span>
        )}
      </div>

      {sublabel && (
        <p className={cn("text-[11px] mt-0.5", sublabelColor)}>{sublabel}</p>
      )}
    </div>
  );
}
