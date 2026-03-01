import { Card, CardContent } from "@/components/ui/card";
import type { IndustryOverviewSection, CompetitionSection } from "@/types/opportunity";

interface Props {
  industryOverview?: IndustryOverviewSection;
  competition?: CompetitionSection;
}

function trendColor(value?: string | null): string {
  if (!value) return "text-zinc-900 dark:text-zinc-50";
  const v = value.toLowerCase();
  if (v.includes("improv") || v.includes("high") || v.includes("strong")) return "text-emerald-600 dark:text-emerald-400";
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

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Operating Metrics &amp; Trends
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">{m.label}</p>
              <p className={`text-2xl font-bold mb-0.5 ${m.valueColor}`}>
                {m.value}
              </p>
              <p className={`text-[11px] font-medium ${m.subColor}`}>{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
