import { cn } from "@/lib/utils";
import { Users, TrendingUp } from "lucide-react";
import type { WealthRM } from "@/types/wealthos";

interface RMCardProps {
  rm: WealthRM;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function RMCard({ rm, isSelected, onClick, className }: RMCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-white dark:bg-zinc-900 p-4 cursor-pointer transition-all",
        isSelected
          ? "border-blue-500 dark:border-blue-400 shadow-sm"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
      ,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{rm.name}</p>
          {rm.team && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{rm.team}</p>}
        </div>
        {rm.email && (
          <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">{rm.email}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <Users className="size-3" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{rm._count?.clients ?? 0}</span> clients
        </span>
        {rm.performance_score !== undefined && (
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3" />
            Score <span className="font-medium text-zinc-700 dark:text-zinc-300">{rm.performance_score.toFixed(1)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
