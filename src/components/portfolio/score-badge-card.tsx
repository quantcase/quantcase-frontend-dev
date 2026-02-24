import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ScoreBadgeCardProps {
  label: string;
  value: number;
  maxValue: number;
  sublabel: string;
  color: "green" | "amber" | "orange" | "red" | "blue";
  icon?: LucideIcon;
  className?: string;
}

const colorMap = {
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/50",
    label: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-500 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-100 dark:border-amber-900/50",
    label: "text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
    icon: "text-amber-500 dark:text-amber-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-100 dark:border-orange-900/50",
    label: "text-orange-600 dark:text-orange-400",
    value: "text-orange-600 dark:text-orange-400",
    icon: "text-orange-500 dark:text-orange-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-100 dark:border-red-900/50",
    label: "text-red-600 dark:text-red-400",
    value: "text-red-600 dark:text-red-400",
    icon: "text-red-500 dark:text-red-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-100 dark:border-blue-900/50",
    label: "text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-500 dark:text-blue-400",
  },
};

export function ScoreBadgeCard({
  label,
  value,
  maxValue,
  sublabel,
  color,
  icon: Icon,
  className,
}: ScoreBadgeCardProps) {
  const colors = colorMap[color];
  return (
    <div
      className={cn(
        "rounded-lg border p-3 flex flex-col gap-1",
        colors.bg,
        colors.border,
        className
      )}
    >
      <div className={cn("flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider", colors.label)}>
        {Icon && <Icon className={cn("h-3 w-3", colors.icon)} />}
        {label}
      </div>
      <div className={cn("text-xl font-bold", colors.value)}>
        {value}
        <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">/{maxValue}</span>
      </div>
      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{sublabel}</div>
    </div>
  );
}
