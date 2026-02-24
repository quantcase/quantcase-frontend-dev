import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export function EfficiencyCard() {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Efficiency
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">Return on Capital</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">15.2%</span>
          <span className="text-sm text-zinc-500">ROCE (FY25E)</span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">CFO / EBITDA</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">60%</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Net Debt / EBITDA</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">0.4x</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
