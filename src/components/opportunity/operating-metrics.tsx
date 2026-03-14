import { Activity } from "lucide-react";
import type { IndustryOverviewSection, CompetitionSection } from "@/types/opportunity";

interface Props {
  industryOverview?: IndustryOverviewSection;
  competition?: CompetitionSection;
}

function trendColor(value?: string | null): string {
  if (!value) return "text-zinc-900 dark:text-zinc-50";
  const v = value.toLowerCase();
  if (v.includes("improv") || v.includes("high") || v.includes("strong")) return "text-blue-600 dark:text-blue-400";
  if (v.includes("declin") || v.includes("low") || v.includes("weak")) return "text-red-600 dark:text-red-400";
  if (v.includes("moderate") || v.includes("stable")) return "text-orange-500 dark:text-orange-400";
  return "text-zinc-900 dark:text-zinc-50";
}

export function OperatingMetrics({ industryOverview, competition }: Props) {
  const opmTrendMetrics = industryOverview?.text?.opm_trend?.metrics;

  const currentOpm = opmTrendMetrics?.current_opm;
  const trendDirection = opmTrendMetrics?.trend_direction;
  const fiveYearChange = opmTrendMetrics?.five_year_change;
  const pricingPower = competition?.metrics?.pricing_power;

  const metrics = [
    {
      label: currentOpm?.label ?? "CURRENT OPM",
      value: currentOpm?.value ?? "N/A",
      sub: currentOpm?.sublabel ?? "",
      valueColor: "text-zinc-900 dark:text-zinc-50",
      subColor: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: trendDirection?.label ?? "TREND DIRECTION",
      value: trendDirection?.value ?? "N/A",
      sub: trendDirection?.sublabel ?? "",
      valueColor: trendColor(trendDirection?.value),
      subColor: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: fiveYearChange?.label ?? "5Y OPM CHANGE",
      value: fiveYearChange?.value ?? "N/A",
      sub: fiveYearChange?.sublabel ?? "",
      valueColor: trendColor(fiveYearChange?.value),
      subColor: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: pricingPower?.label ?? "PRICING POWER",
      value: pricingPower?.value ?? "N/A",
      sub: pricingPower?.sublabel ?? "",
      valueColor: trendColor(pricingPower?.value),
      subColor: "text-zinc-500 dark:text-zinc-400",
    },
  ];

  const cardStyles = [
    { labelColor: "text-blue-500", bg: "bg-white dark:bg-zinc-900", sublabelColor: "text-zinc-500 dark:text-zinc-400" },
    { labelColor: "text-emerald-600", bg: "bg-white dark:bg-zinc-900", sublabelColor: "text-zinc-500 dark:text-zinc-400" },
    { labelColor: "text-purple-500", bg: "bg-white dark:bg-zinc-900", sublabelColor: "text-zinc-500 dark:text-zinc-400" },
    { labelColor: "text-orange-500", bg: "bg-white dark:bg-zinc-900", sublabelColor: "text-zinc-500 dark:text-zinc-400" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-zinc-400" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Industry Operating Margin Trends
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m, i) => {
          const cs = cardStyles[i];
          return (
            <div key={m.label} className={`rounded-lg border border-zinc-100 dark:border-zinc-800 p-4 ${cs.bg}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${cs.labelColor}`}>{m.label}</p>
              <p className={`text-2xl font-bold mb-0.5 ${m.valueColor}`}>{m.value}</p>
              <p className={`text-[11px] font-medium ${cs.sublabelColor}`}>{m.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
