import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriftItem } from "@/types/portfolio";

interface AllocationDriftCardProps {
  driftItems: DriftItem[];
}

export function AllocationDriftCard({ driftItems }: AllocationDriftCardProps) {
  const alertCount = driftItems.filter((d) => Math.abs(d.driftPercent) >= 10).length;

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Allocation Drift
          </CardTitle>
          {alertCount > 0 && (
            <span className="text-[11px] font-bold text-red-500 dark:text-red-400">
              {alertCount} Alert{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {driftItems.map((item) => {
          const isNegative = item.driftPercent < 0;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              <div className="flex items-center gap-2">
                {isNegative ? (
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {item.assetClass}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    Target: {item.targetAllocation}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {item.currentAllocation}%
                </p>
                <p
                  className={cn(
                    "text-[11px] font-semibold",
                    isNegative
                      ? "text-red-500 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {item.driftPercent > 0 ? "+" : ""}
                  {item.driftPercent}% Drift
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
