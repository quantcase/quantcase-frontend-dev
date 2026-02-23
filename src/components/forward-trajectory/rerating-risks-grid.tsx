import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

const reratingConditions = [
  "ROCE crossing 18% sustainably",
  "CFO/EBITDA improving to >80%",
  "EV and BESS revenue contribution >15%",
];

const killSwitchRisks = [
  "Rail tender cycle downturn lasting >2 years",
  "Odisha plant capex overrun >25%",
  "Promoter stake reduction",
];

export function ReratingRisksGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Re-Rating Conditions */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Re-Rating Conditions
              </h3>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {reratingConditions.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded border border-zinc-100 dark:border-zinc-800 p-3"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{c}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Kill-Switch Risks */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Kill-Switch Risks
              </h3>
            </div>
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {killSwitchRisks.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded border border-zinc-100 dark:border-zinc-800 p-3"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{r}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
