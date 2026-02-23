import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Target, ShieldAlert } from "lucide-react";

const growthDrivers = [
  "Institutional apparatus turning towards domestic infra, Capex cycle (Private + Public)",
  "China+1 alternative acceleration: heavy industry 'Make in India' focus implies structural tailwinds.",
  "Robust Momentum: Last 3 years of FCF+ROCE is on structural mean rev vs <10% cyclically.",
];

const keyRisks = [
  "Global slowdown risk: May dampen export demand for adjacent segments.",
  "Regulatory Haze: Policy risk around environmental clearances remains overhang.",
  "Execution bottleneck: Land acquisition delays could impact 2026 targets.",
];

export function GrowthRisks() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Growth Drivers */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Key Growth Drivers</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {growthDrivers.map((d, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{d}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Risks */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Key Risks</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {keyRisks.map((r, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{r}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
