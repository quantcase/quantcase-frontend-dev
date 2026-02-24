import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TriangleAlert } from "lucide-react";
import type { RebalanceTrigger } from "@/types/portfolio";

interface RebalanceTriggersCardProps {
  triggers: RebalanceTrigger[];
}

export function RebalanceTriggersCard({ triggers }: RebalanceTriggersCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Rebalance Triggers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {triggers.map((trigger) => {
          const diff = trigger.currentAllocation - trigger.targetAllocation;
          return (
            <div
              key={trigger.id}
              className="rounded-lg border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-1"
            >
              <div className="flex items-center gap-1.5">
                <TriangleAlert className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {trigger.assetClass} allocation is {trigger.currentAllocation}%{" "}
                  <span className="font-normal text-zinc-500">(target: {trigger.targetAllocation}%)</span>
                </p>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-5">
                A {Math.abs(diff)}% deviation from target may affect the portfolio&apos;s risk-return profile.
              </p>
            </div>
          );
        })}
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic pt-1">
          Advisory triggers only. No automatic rebalancing.
        </p>
      </CardContent>
    </Card>
  );
}
