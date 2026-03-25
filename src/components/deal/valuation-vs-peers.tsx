import { BarChart3, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ValuationVsPeersSection, ValuationRichSegment } from "@/types/deal";
import { valuationVsPeersData, type DescriptionSegment } from "@/components/deal/detailed-analysis-data";

interface ValuationVsPeersProps {
  data?: ValuationVsPeersSection;
}

const positionColors: Record<string, { bg: string; value: string }> = {
  amber:   { bg: "bg-[#F5F5F5]", value: "text-[#0F172B]" },
  emerald: { bg: "bg-[#F5F5F5]", value: "text-[#0F172B]" },
};

const multipleColors: Record<string, string> = {
  emerald: "text-[#0F172B]",
  blue:    "text-[#0F172B]",
  red:     "text-[#0F172B]",
};

const multipleSubColors: Record<string, string> = {
  emerald: "text-[#888888]",
  blue:    "text-[#888888]",
  red:     "text-[#888888]",
};

const segmentColor: Record<string, string> = {
  emerald: "text-emerald-600",
  blue:    "text-blue-600",
  red:     "text-red-500",
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
        <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] flex items-center justify-center flex-shrink-0">
          <BarChart3 className="h-4 w-4 text-zinc-500" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172B] uppercase tracking-[0.01em] mb-0.5">{title}</h3>
          {subtitle && <p className="text-[14px] text-[#888888]">{subtitle}</p>}
        </div>
      </div>

      {/* Current Valuation Position */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-3">
          Current Valuation Position
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {currentPosition.map((item, i) => {
            const colors = positionColors[item.color] ?? positionColors.amber;
            return (
              <div
                key={i}
                className={`rounded-lg border border-[#E2E2E2] p-4 ${colors.bg}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">
                  {item.label}
                </p>
                <p className={`text-[26px] font-normal ${colors.value}`}>{item.value}</p>
                <p className="text-xs text-[#888888] mt-0.5">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multiple Re-Rating Potential */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-3">
          Multiple Re-Rating Potential
        </p>
        <Card className="bg-[#F5F5F5] border border-[#E2E2E2]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-white flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Re-Rating View
                </p>
                <Badge className="bg-white text-[#0F172B] text-[10px] font-bold border border-[#E2E2E2]">
                  {reRatingView.badge}
                </Badge>
              </div>
            </div>
            <h4 className="text-sm font-bold text-[#0F172B] mb-2">
              {reRatingView.title}
            </h4>
            <RichDescription segments={reRatingView.description} />
          </CardContent>
        </Card>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Expansion Drivers */}
        <Card className="bg-white border border-[#E2E2E2]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172B]">
                Expansion Drivers
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {expansionDrivers.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-zinc-400 text-sm mt-0.5">▲</span>
                <p className="text-xs text-[#888888]">
                  <span className="font-semibold text-[#121212]">
                    {item.text}
                  </span>{" "}
                  {item.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contraction Risks */}
        <Card className="bg-white border border-[#E2E2E2]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-zinc-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172B]">
                Contraction Risks
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {contractionRisks.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-zinc-400 text-sm mt-0.5">▼</span>
                <p className="text-xs text-[#888888]">
                  <span className="font-semibold text-[#121212]">
                    {item.text}
                  </span>{" "}
                  {item.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scenario Multiples */}
        <Card className="bg-white border border-[#E2E2E2]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-zinc-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172B]">
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
