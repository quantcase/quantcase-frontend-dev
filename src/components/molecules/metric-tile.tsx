import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/molecules/icon-box";

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
  icon: Icon,
  change,
  className,
}: MetricTileProps) {
  return (
    <div className={cn("rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-2", className)}>
      {Icon && <IconBox icon={Icon} />}
      <small className="uppercase tracking-wider">{label}</small>
      <h3>{value}</h3>
      {change && (
        <small className={cn("text-[11px] font-semibold", changeTextColor(change))}>
          {change}
        </small>
      )}
      {sublabel && <small className="line-clamp-2">{sublabel}</small>}
    </div>
  );
}
