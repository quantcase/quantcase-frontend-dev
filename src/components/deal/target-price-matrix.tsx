import { Card, CardContent } from "@/components/ui/card";
import type { TargetPriceMatrixSection, DPriceScenario } from "@/types/deal";

interface TargetPriceMatrixProps {
  data?: TargetPriceMatrixSection;
}

const scenarioConfig = [
  {
    key: "bear" as const,
    label: "BEAR CASE",
    barColor: "bg-zinc-200 dark:bg-zinc-700",
    labelColor: "text-zinc-500 dark:text-zinc-400",
    progressColor: "bg-zinc-900 dark:bg-zinc-400",
  },
  {
    key: "base" as const,
    label: "BASE CASE",
    barColor: "bg-zinc-200 dark:bg-zinc-700",
    labelColor: "text-zinc-500 dark:text-zinc-400",
    progressColor: "bg-zinc-900 dark:bg-zinc-400",
  },
  {
    key: "bull" as const,
    label: "BULL CASE",
    barColor: "bg-zinc-200 dark:bg-zinc-700",
    labelColor: "text-zinc-500 dark:text-zinc-400",
    progressColor: "bg-zinc-900 dark:bg-zinc-400",
  },
];

function isPositive(fromCmp?: string) {
  return fromCmp?.startsWith("+") ?? true;
}

function PriceCard({
  config,
  caseData,
}: {
  config: (typeof scenarioConfig)[number];
  caseData?: DPriceScenario;
}) {
  const fromCmpColor = isPositive(caseData?.from_cmp)
    ? "text-emerald-600"
    : "text-red-500";

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className={`h-1.5 w-full ${config.barColor}`} />
      <CardContent className="p-5 space-y-3">
        <p className={`text-xs font-bold uppercase tracking-wider ${config.labelColor}`}>
          {config.label}
        </p>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase mb-0.5">EPS CAGR</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {caseData?.eps_cagr ?? "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase mb-0.5">FY EPS</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {caseData?.fy_eps ?? "N/A"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-zinc-400 uppercase mb-0.5">Exit P/E</p>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {caseData?.exit_pe ?? "N/A"}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{caseData?.pe_rationale}</p>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1">
          <p className="text-[10px] text-zinc-400 uppercase">Target Range</p>
          <p className="text-[26px] font-normal text-zinc-900 dark:text-zinc-50">
            {caseData?.target_range ?? "N/A"}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${fromCmpColor}`}>
              {caseData?.from_cmp ?? "N/A"}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">from CMP</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{caseData?.cagr}</p>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-zinc-400 uppercase">Probability</p>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {caseData?.probability ?? 0}%
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${config.progressColor}`}
              style={{ width: `${caseData?.probability ?? 0}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TargetPriceMatrix({ data }: TargetPriceMatrixProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {scenarioConfig.map((config) => (
        <PriceCard key={config.key} config={config} caseData={data?.[config.key]} />
      ))}
    </div>
  );
}
