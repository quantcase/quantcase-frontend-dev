import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetScreenerItem, AssetClass } from "@/types/portfolio";

interface AssetScreenerCardProps {
  items: AssetScreenerItem[];
  count?: number;
  onAddItem?: (item: AssetScreenerItem) => void;
}

const assetClassConfig: Record<AssetClass, { label: string; color: string }> = {
  growth: {
    label: "Growth",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0",
  },
  quality_compounder: {
    label: "Quality Compounder",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0",
  },
  value: {
    label: "Value",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-0",
  },
  income: {
    label: "Income",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0",
  },
};

export function AssetScreenerCard({ items, count, onAddItem }: AssetScreenerCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Asset Screener
          </CardTitle>
          {count !== undefined && (
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{count}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const config = assetClassConfig[item.assetClass];
          return (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                    {item.company}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-mono text-zinc-400">{item.ticker}</span>
                    <Badge className={cn("text-[10px] px-1.5 py-0 h-4", config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => onAddItem?.(item)}
                  className="flex-shrink-0 h-6 w-6 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                </button>
              </div>

              {/* Score row */}
              <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                {[
                  { label: "SCORE", value: item.score },
                  { label: "Q-SCR", value: item.qualityScore },
                  { label: "G-SCR", value: item.growthScore },
                  { label: "P/E", value: item.pe },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
