import { BarChart3, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ValuationVsPeersSection, ValuationRichSegment } from "@/types/deal";
import { valuationVsPeersData, type DescriptionSegment } from "@/components/deal/detailed-analysis-data";

interface ValuationVsPeersProps {
  data?: ValuationVsPeersSection;
}

const positionColors: Record<string, { bg: string; value: string }> = {
  amber:   { bg: "bg-secondary", value: "text-ink" },
  emerald: { bg: "bg-secondary", value: "text-ink" },
};

const multipleColors: Record<string, string> = {
  emerald: "text-ink",
  blue:    "text-ink",
  red:     "text-ink",
};

const multipleSubColors: Record<string, string> = {
  emerald: "text-ink-3",
  blue:    "text-ink-3",
  red:     "text-ink-3",
};

const segmentColor: Record<string, string> = {
  emerald: "text-up",
  blue:    "text-blue",
  red:     "text-down",
};

function RichDescription({ segments }: { segments: (DescriptionSegment | ValuationRichSegment)[] }) {
  return (
    <p className="text-sm text-ink-2">
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
          <BarChart3 className="h-4 w-4 text-ink-2" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-ink uppercase tracking-[0.01em] mb-0.5">{title}</h3>
          {subtitle && <p className="text-[14px] text-ink-3">{subtitle}</p>}
        </div>
      </div>

      {/* Current Valuation Position */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-3">
          Current Valuation Position
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {currentPosition.map((item, i) => {
            const colors = positionColors[item.color] ?? positionColors.amber;
            return (
              <div
                key={i}
                className={`rounded-lg border border-hair p-4 ${colors.bg}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">
                  {item.label}
                </p>
                <p className={`text-[26px] font-normal ${colors.value}`}>{item.value}</p>
                <p className="text-xs text-ink-3 mt-0.5">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multiple Re-Rating Potential */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-3">
          Multiple Re-Rating Potential
        </p>
        <Card className="bg-secondary border border-hair">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-card flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-ink-2" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Re-Rating View
                </p>
                <Badge className="bg-card text-ink text-[10px] font-bold border border-hair">
                  {reRatingView.badge}
                </Badge>
              </div>
            </div>
            <h4 className="text-sm font-bold text-ink mb-2">
              {reRatingView.title}
            </h4>
            <RichDescription segments={reRatingView.description} />
          </CardContent>
        </Card>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Expansion Drivers */}
        <Card className="bg-card border border-hair">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ink-2" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                Expansion Drivers
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {expansionDrivers.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-ink-3 text-sm mt-0.5">▲</span>
                <p className="text-xs text-ink-3">
                  <span className="font-semibold text-ink">
                    {item.text}
                  </span>{" "}
                  {item.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contraction Risks */}
        <Card className="bg-card border border-hair">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-ink-2" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                Contraction Risks
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {contractionRisks.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-ink-3 text-sm mt-0.5">▼</span>
                <p className="text-xs text-ink-3">
                  <span className="font-semibold text-ink">
                    {item.text}
                  </span>{" "}
                  {item.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scenario Multiples */}
        <Card className="bg-card border border-hair">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-ink-2" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                Scenario Multiples
              </h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scenarioMultiples.map((item, i) => (
              <div key={i}>
                <p className="text-[10px] text-ink-3">{item.label}</p>
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
