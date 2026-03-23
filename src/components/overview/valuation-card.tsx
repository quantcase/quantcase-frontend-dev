import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface ValuationCardProps {
  peRatio: number | null;
  forwardPE: number | null;
  pbRatio: number | null;
  evToEbitda: number | null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

export function ValuationCard({ peRatio, forwardPE, pbRatio, evToEbitda }: ValuationCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Valuation
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">Multiples</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            {peRatio != null ? `${peRatio.toFixed(1)}x` : "—"}
          </span>
          <span className="text-sm text-zinc-500">P/E Ratio</span>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Stat label="Forward P/E" value={forwardPE != null ? `${forwardPE.toFixed(1)}x` : "—"} />
          <Stat label="P/B Ratio" value={pbRatio != null ? `${pbRatio.toFixed(2)}x` : "—"} />
          <Stat label="EV/EBITDA" value={evToEbitda != null ? `${evToEbitda.toFixed(1)}x` : "—"} />
        </div>
      </CardContent>
    </Card>
  );
}
