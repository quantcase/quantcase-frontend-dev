import { Activity } from "lucide-react";
import type { IndustryOverviewSection, CompetitionSection } from "@/types/opportunity";
import { MetricTile } from "@/components/molecules/metric-tile";

interface Props {
  industryOverview?: IndustryOverviewSection;
  competition?: CompetitionSection;
}


export function OperatingMetrics({ industryOverview, competition }: Props) {
  const opmTrendMetrics = industryOverview?.text?.opm_trend?.metrics;

  const currentOpm = opmTrendMetrics?.current_opm;
  const trendDirection = opmTrendMetrics?.trend_direction;
  const fiveYearChange = opmTrendMetrics?.five_year_change;
  const pricingPower = competition?.metrics?.pricing_power;

  const metrics = [
    { label: currentOpm?.label ?? "CURRENT OPM", value: currentOpm?.value ?? "N/A", sub: currentOpm?.sublabel ?? "" },
    { label: trendDirection?.label ?? "TREND DIRECTION", value: trendDirection?.value ?? "N/A", sub: trendDirection?.sublabel ?? "" },
    { label: fiveYearChange?.label ?? "5Y OPM CHANGE", value: fiveYearChange?.value ?? "N/A", sub: fiveYearChange?.sublabel ?? "" },
    { label: pricingPower?.label ?? "PRICING POWER", value: pricingPower?.value ?? "N/A", sub: pricingPower?.sublabel ?? "" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-zinc-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Industry Operating Margin Trends
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <MetricTile
            key={m.label}
            label={m.label}
            value={m.value}
            sublabel={m.sub}
          />
        ))}
      </div>
    </div>
  );
}
