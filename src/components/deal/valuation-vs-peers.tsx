import { BarChart3, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ValuationVsPeersSection, ValuationRichSegment } from "@/types/deal";
import { valuationVsPeersData, type DescriptionSegment } from "@/components/deal/detailed-analysis-data";

interface ValuationVsPeersProps {
  data?: ValuationVsPeersSection;
}

const positionColors: Record<string, { bg: string; value: string }> = {
  amber: { bg: "bg-amber-50 dark:bg-amber-950/20", value: "text-amber-600" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", value: "text-emerald-600" },
};

const multipleColors: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  red: "text-red-500",
};

const multipleSubColors: Record<string, string> = {
  emerald: "text-emerald-500",
  blue: "text-blue-500",
  red: "text-red-400",
};

const segmentColor: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  red: "text-red-500",
};

function RichDescription({ segments }: { segments: (DescriptionSegment | ValuationRichSegment)[] }) {
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      {segments.map((seg, i) => {
        const colorClass = seg.color ? segmentColor[seg.color] : "";
        return (
          <span key={i} className={[seg.bold ? "font-semibold" : "", colorClass].join(" ").trim()}>
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}

export function ValuationVsPeers({ data }: ValuationVsPeersProps) {
  const title             = data?.meta?.title           ?? valuationVsPeersData.title;
  const subtitle          = data?.meta?.subtitle        ?? valuationVsPeersData.subtitle;
  const currentPosition   = data?.current_position     ?? valuationVsPeersData.currentPosition;
  const reRatingView      = data?.re_rating_view        ?? valuationVsPeersData.reRatingView;
  const expansionDrivers  = data?.expansion_drivers     ?? valuationVsPeersData.expansionDrivers;
  const contractionRisks  = data?.contraction_risks     ?? valuationVsPeersData.contractionRisks;
  const scenarioMultiples = data?.scenario_multiples    ?? valuationVsPeersData.scenarioMultiples;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-0.5">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
        </div>
      </div>

      {/* Current Valuation Position */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
          Current Valuation Position
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {currentPosition.map((item, i) => {
            const colors = positionColors[item.color] ?? positionColors.amber;
            return (
              <div
                key={i}
                className={`rounded-lg border border-zinc-100 dark:border-zinc-800 p-4 ${colors.bg}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  {item.label}
                </p>
                <p className={`text-[26px] font-normal ${colors.value}`}>{item.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multiple Re-Rating Potential */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
          Multiple Re-Rating Potential
        </p>
        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Re-Rating View
                </p>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border-0">
                  {reRatingView.badge}
                </Badge>
              </div>
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {reRatingView.title}
            </h4>
            <RichDescription segments={reRatingView.description} />
          </CardContent>
        </Card>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Expansion Drivers */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Expansion Drivers
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {expansionDrivers.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 text-sm mt-0.5">▲</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.text}
                  </span>{" "}
                  {item.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contraction Risks */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">
                Contraction Risks
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {contractionRisks.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-500 text-sm mt-0.5">▼</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.text}
                  </span>{" "}
                  {item.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scenario Multiples */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-zinc-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Scenario Multiples
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scenarioMultiples.map((item, i) => (
              <div key={i}>
                <p className="text-[10px] text-zinc-400">{item.label}</p>
                <p className={`text-[26px] font-normal ${multipleColors[item.color]}`}>
                  {item.value}
                </p>
                <p className={`text-xs ${multipleSubColors[item.color]}`}>{item.change}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
