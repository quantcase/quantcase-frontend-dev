"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Position, AssetClass } from "@/types/portfolio";

interface AllocatedPositionsCardProps {
  positions: Position[];
  totalAllocation: number;
}

const assetClassConfig: Record<AssetClass, { label: string; color: string }> = {
  growth: {
    label: "Growth",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  quality_compounder: {
    label: "Quality Compounder",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  value: {
    label: "Value",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  },
  income: {
    label: "Income",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
};

export function AllocatedPositionsCard({ positions, totalAllocation }: AllocatedPositionsCardProps) {
  const remaining = 100 - totalAllocation;

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
            Allocated Positions
          </CardTitle>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            TOTAL{" "}
            <span className="text-zinc-900 dark:text-zinc-100 font-bold text-sm">
              {totalAllocation}%
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                totalAllocation > 80 ? "bg-amber-500" : "bg-zinc-900 dark:bg-zinc-200"
              )}
              style={{ width: `${Math.min(totalAllocation, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-zinc-400">0%</span>
            <span className="text-[11px] text-zinc-400">{remaining}% remaining</span>
            <span className="text-[11px] text-zinc-400">100%</span>
          </div>
        </div>

        {/* Position rows */}
        <div className="space-y-2">
          {positions.map((position) => {
            const config = assetClassConfig[position.assetClass];
            return (
              <div
                key={position.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 px-3 py-2.5"
              >
                <GripVertical className="h-4 w-4 text-zinc-300 dark:text-zinc-600 flex-shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {position.company}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{position.ticker}</span>
                    <Badge className={cn("text-[10px] px-1.5 py-0 h-4 border-0", config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-zinc-400">
                    <Star className="h-3 w-3" />
                    Score: {position.score}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums w-10 text-right">
                    {position.allocation}%
                  </span>
                  <button className="text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
