import type { RiskRewardSummarySection, RiskRewardMetric } from "@/types/deal";

interface RiskRewardSummaryProps {
  data?: RiskRewardSummarySection;
}

function valueCssColor(value?: string): string {
  if (!value) return "var(--qc-ink)";
  if (value.startsWith("+")) return "var(--qc-up)";
  if (value.startsWith("-")) return "var(--qc-ink)";
  return "var(--qc-up)";
}

function MetricCard({ metric }: { metric?: RiskRewardMetric }) {
  return (
    <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>
        {metric?.label ?? "—"}
      </p>
      <p className="text-[26px] font-normal leading-none" style={{ color: valueCssColor(metric?.value) }}>
        {metric?.value ?? "N/A"}
      </p>
      <p className="text-xs pt-1" style={{ color: "var(--qc-ink-2)" }}>
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
