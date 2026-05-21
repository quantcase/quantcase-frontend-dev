import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function changeTextColor(change: string): string {
  if (change.startsWith("+") || change.startsWith("▲")) return "text-emerald-600 dark:text-emerald-400";
  if (change.startsWith("-") || change.startsWith("▼")) return "text-red-500 dark:text-red-400";
  if (change.startsWith("→")) return "text-amber-600 dark:text-amber-400";
  return "text-zinc-500 dark:text-zinc-400";
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
    <div
      className={cn("rounded-lg border px-3 py-3 flex flex-col gap-1", className)}
      style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-card)" }}
    >
      <p className="text-[10px] font-500 uppercase tracking-wider leading-tight" style={{ color: "var(--qc-text-muted)" }}>{label}</p>
      <p className="text-[15px] font-semibold leading-snug" style={{ color: "var(--qc-text-heading)" }}>{value}</p>
      {change && (
        <p className={cn("text-[10px] font-semibold", changeTextColor(change))}>
          {change}
        </p>
      )}
      {sublabel && <p className="text-[10px] line-clamp-2" style={{ color: "var(--qc-text-muted)" }}>{sublabel}</p>}
    </div>
  );
}
