import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function changeTextColor(change: string): string {
  if (change.startsWith("+") || change.startsWith("▲")) return "text-up";
  if (change.startsWith("-") || change.startsWith("▼")) return "text-down";
  if (change.startsWith("→")) return "text-warn";
  return "text-ink-3";
}

interface MetricTileProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  change?: string | null;
  className?: string;
  // deprecated — no longer used, kept for backward compatibility
  iconColor?: string;
  labelColor?: string;
  valueColor?: string;
  sublabelColor?: string;
  bg?: string;
  iconLayout?: string;
  valueSize?: string;
}

export function MetricTile({
  label,
  value,
  sublabel,
  icon: _Icon,
  change,
  className,
}: MetricTileProps) {
  return (
    <div className={cn("rounded-lg border border-hair bg-card px-3 py-3 flex flex-col gap-1", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wider leading-tight text-ink-3">{label}</p>
      <p className="text-[15px] font-semibold leading-snug text-ink">{value}</p>
      {change && (
        <p className={cn("text-[10px] font-semibold", changeTextColor(change))}>
          {change}
        </p>
      )}
      {sublabel && <p className="text-[10px] line-clamp-2 text-ink-3">{sublabel}</p>}
    </div>
  );
}
