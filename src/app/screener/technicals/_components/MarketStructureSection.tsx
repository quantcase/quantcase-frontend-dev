"use client";

import { Badge } from "@/components/ui/badge";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TechnicalsTrendRaw, TechnicalsPattern } from "@/types/technicals";
import { directionColor } from "./helpers";

interface MarketStructureSectionProps {
  trend: TechnicalsTrendRaw;
  patterns: TechnicalsPattern[];
}

export function MarketStructureSection({ trend, patterns }: MarketStructureSectionProps) {
  const trendStrengthColor =
    trend.strength === "STRONG" && trend.direction === "UPTREND"
      ? "text-emerald-600"
      : trend.strength === "STRONG" && trend.direction === "DOWNTREND"
        ? "text-red-600"
        : "text-amber-600";

  const phaseColor =
    trend.phase === "MARK-DOWN" || trend.phase === "DISTRIBUTION"
      ? "text-red-600"
      : "text-emerald-600";

  return (
    <SectionPanel
      title="Market Structure"
      subtitle="Trend direction, Wyckoff phase & identified price pattern"
    >
      <div className="divide-y divide-zinc-100 pb-4">
        <div className="flex items-center justify-between py-2 px-2">
          <div className="space-y-0.5">
            <h6 className="uppercase tracking-wider">Trend</h6>
            <p>Medium-term price direction</p>
          </div>
          <Badge className={`uppercase font-semibold ${directionColor(trend.direction)}`}>
            {trend.direction}
          </Badge>
        </div>
        <div className="flex items-center justify-between py-2 px-2">
          <div className="space-y-0.5">
            <h6 className="uppercase tracking-wider">Trend Strength</h6>
            <p>ADX {trend.adx14.toFixed(1)}</p>
          </div>
          <Badge className={`font-semibold ${trendStrengthColor}`}>{trend.strength}</Badge>
        </div>
        <div className="flex items-center justify-between py-2 px-2">
          <div className="space-y-0.5">
            <h6 className="uppercase tracking-wider">Wyckoff Phase</h6>
            <p>Current market cycle phase</p>
          </div>
          <Badge className={`font-semibold ${phaseColor}`}>{trend.phase}</Badge>
        </div>
        <div className="flex items-center justify-between py-2 px-2">
          <div className="space-y-0.5">
            <h6 className="uppercase tracking-wider">Price Pattern</h6>
            <p>Identified chart formation</p>
          </div>
          <Badge>{patterns[0]?.name ?? "None"}</Badge>
        </div>
        <div className="flex items-center justify-between py-2 px-2">
          <div className="space-y-0.5">
            <h6 className="uppercase tracking-wider">Market Structure</h6>
            <p>Price action sequence</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className={`text-xs font-semibold ${trend.structure.higherHighs ? "text-emerald-600" : "text-red-600"}`}>
              {trend.structure.higherHighs ? "Higher Highs" : "Lower Highs"}
            </span>
            <span className={`text-xs font-semibold ${trend.structure.higherLows ? "text-emerald-600" : "text-red-600"}`}>
              {trend.structure.higherLows ? "Higher Lows" : "Lower Lows"}
            </span>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
