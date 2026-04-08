import type { TargetPriceMatrixSection, DPriceScenario } from "@/types/deal";

interface TargetPriceMatrixProps {
  data?: TargetPriceMatrixSection;
}

const scenarioConfig = [
  {
    key: "bear" as const,
    label: "Bear case",
    borderColor: "border-orange-400",
    badgeBg: "bg-orange-100 text-orange-700",
    targetColor: "text-red-500",
    progressColor: "bg-orange-400",
  },
  {
    key: "base" as const,
    label: "Base case",
    borderColor: "border-blue-400",
    badgeBg: "bg-blue-100 text-blue-700",
    targetColor: "text-blue-600",
    progressColor: "bg-blue-500",
  },
  {
    key: "bull" as const,
    label: "Bull case",
    borderColor: "border-emerald-400",
    badgeBg: "bg-emerald-100 text-emerald-700",
    targetColor: "text-emerald-600",
    progressColor: "bg-emerald-400",
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
    <div className={`rounded-lg border-2 ${config.borderColor} bg-white dark:bg-zinc-900 overflow-hidden`}>
      <div className="p-5 space-y-4">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.badgeBg}`}>
            {config.label}
          </span>
          {(caseData?.tags ?? []).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Target Range — prominent */}
        <div className="space-y-1">
          <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Target range</p>
          <p className={`text-[32px] font-medium leading-tight ${config.targetColor}`}>
            {caseData?.target_range ?? "N/A"}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${fromCmpColor}`}>
              {caseData?.from_cmp ?? "N/A"}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">from CMP</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{caseData?.cagr}</p>
        </div>

        {/* Metrics table */}
        <div className="space-y-0 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">EPS CAGR</span>
            <span className={`text-sm font-semibold ${config.targetColor}`}>
              {caseData?.eps_cagr ?? "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">FY EPS</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {caseData?.fy_eps ?? "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Exit P/E</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {caseData?.exit_pe ?? "N/A"}
            </span>
          </div>

          {/* Probability */}
          <div className="flex items-center justify-between py-1.5 border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-2.5">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Probability</span>
              <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${config.progressColor}`}
                  style={{ width: `${caseData?.probability ?? 0}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              {caseData?.probability ?? 0}%
            </span>
          </div>
        </div>

        {/* PE Rationale */}
        {caseData?.pe_rationale && (
          <p className="text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            {caseData.pe_rationale}
          </p>
        )}
      </div>
    </div>
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
