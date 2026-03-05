import type { RiskRewardSummarySection, RiskRewardMetric } from "@/types/deal";

interface RiskRewardSummaryProps {
  data?: RiskRewardSummarySection;
}

// Starts with "+" → emerald, starts with "-" → zinc, no sign → emerald
function valueColor(value?: string) {
  if (!value) return "text-zinc-900 dark:text-zinc-50";
  if (value.startsWith("+")) return "text-emerald-600 dark:text-emerald-400";
  if (value.startsWith("-")) return "text-zinc-900 dark:text-zinc-50";
  return "text-emerald-600 dark:text-emerald-400";
}

function MetricCard({ metric }: { metric?: RiskRewardMetric }) {
  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-5 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {metric?.label ?? "—"}
      </p>
      <p className={`text-4xl font-bold leading-none ${valueColor(metric?.value)}`}>
        {metric?.value ?? "N/A"}
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">
        {metric?.subtitle}
      </p>
    </div>
  );
}

export function RiskRewardSummary({ data }: RiskRewardSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard metric={data?.probability_weighted_return} />
      <MetricCard metric={data?.risk_reward_ratio} />
      <MetricCard metric={data?.downside_protection} />
    </div>
  );
}
