import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export function ValuationCard() {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Valuation
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">Current P/E vs Peers</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">32.5x</span>
          <span className="text-sm text-zinc-500">P/E Ratio</span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Industry Avg</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">28.4x</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">3Y Median</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">35.1x</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
