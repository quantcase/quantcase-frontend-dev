import { Card, CardContent } from "@/components/ui/card";

interface ScenarioCard {
  label: string;
  barColor: string;
  labelColor: string;
  epsCagr: string;
  fy26Eps: string;
  exitPE: string;
  targetRange: string;
  fromCmp: string;
  fromCmpColor: string;
  cagr: string;
  probability: number;
  progressColor: string;
}

const scenarios: ScenarioCard[] = [
  {
    label: "BEAR CASE",
    barColor: "bg-red-500",
    labelColor: "text-red-500",
    epsCagr: "8.2%",
    fy26Eps: "₹6.3",
    exitPE: "22-25x",
    targetRange: "₹140-160",
    fromCmp: "-17%",
    fromCmpColor: "text-red-500",
    cagr: "CAGR: -6.0% p.a.",
    probability: 20,
    progressColor: "bg-red-500",
  },
  {
    label: "BASE CASE",
    barColor: "bg-blue-500",
    labelColor: "text-blue-500",
    epsCagr: "16.8%",
    fy26Eps: "₹8.8",
    exitPE: "30-35x",
    targetRange: "₹265-310",
    fromCmp: "+68%",
    fromCmpColor: "text-emerald-600",
    cagr: "CAGR: +17.2% p.a.",
    probability: 55,
    progressColor: "bg-blue-500",
  },
  {
    label: "BULL CASE",
    barColor: "bg-emerald-500",
    labelColor: "text-emerald-600",
    epsCagr: "24.6%",
    fy26Eps: "₹12.0",
    exitPE: "35-40x",
    targetRange: "₹420-480",
    fromCmp: "+150%",
    fromCmpColor: "text-emerald-600",
    cagr: "CAGR: +35.4% p.a.",
    probability: 25,
    progressColor: "bg-emerald-500",
  },
];

export function TargetPriceMatrix() {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
          Target Price Matrix (FY26 Exit)
        </h3>
        <span className="text-xs text-zinc-400">3-year holding period | Current Price: ₹168</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarios.map((s) => (
          <Card key={s.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Colored top bar */}
            <div className={`h-1.5 w-full ${s.barColor}`} />
            <CardContent className="p-5 space-y-3">
              <p className={`text-xs font-bold uppercase tracking-wider ${s.labelColor}`}>{s.label}</p>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase mb-0.5">EPS CAGR</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{s.epsCagr}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase mb-0.5">FY26 EPS</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{s.fy26Eps}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-zinc-400 uppercase mb-0.5">Exit P/E</p>
                  <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">{s.exitPE}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {s.label === "BEAR CASE" ? "Multiple compression to peer avg" :
                      s.label === "BASE CASE" ? "Maintain premium on execution" :
                        "Quality premium expansion"}
                  </p>
                </div>
              </div>

              {/* Target range */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1">
                <p className="text-[10px] text-zinc-400 uppercase">Target Range</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{s.targetRange}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${s.fromCmpColor}`}>{s.fromCmp}</span>
                  <span className="text-xs text-zinc-400">from CMP</span>
                </div>
                <p className="text-xs text-zinc-400">{s.cagr}</p>
              </div>

              {/* Probability bar */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-400 uppercase">Probability</p>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{s.probability}%</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.progressColor}`}
                    style={{ width: `${s.probability}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
