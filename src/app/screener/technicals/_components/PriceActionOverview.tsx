"use client";

import { Activity, TrendingUp, TrendingDown, BarChart2, Target } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { MetricTile } from "@/components/molecules/metric-tile";
import { TechnicalsPriceRaw, TechnicalsMetaRaw } from "@/types/technicals";

interface PriceActionOverviewProps {
  price: TechnicalsPriceRaw;
  meta: TechnicalsMetaRaw;
  changeDisplay: string;
}

export function PriceActionOverview({ price, meta, changeDisplay }: PriceActionOverviewProps) {
  return (
    <SectionPanel
      title="Price Action Overview"
      subtitle="Key price statistics from latest market data"
    >
      <div className="grid grid-cols-3 gap-4 pb-4">
        <MetricTile
          icon={Activity}
          label="Current Market Price"
          value={`₹${price.cmp.toLocaleString("en-IN")}`}
          change={changeDisplay}
        />
        <MetricTile
          icon={TrendingUp}
          label="52-Week High"
          value={`₹${price.high52w.toLocaleString("en-IN")}`}
          sublabel={`${price.distanceFrom52wHigh.toFixed(2)}% from high`}
        />
        <MetricTile
          icon={TrendingDown}
          label="52-Week Low"
          value={`₹${price.low52w.toLocaleString("en-IN")}`}
          sublabel={`+${price.distanceFrom52wLow.toFixed(2)}% above low`}
        />
        <MetricTile
          icon={BarChart2}
          label="Price / Earnings"
          value={meta.pe}
          sublabel="Trailing P/E"
        />
        <MetricTile
          icon={Target}
          label="S/R Range Width"
          value={meta.srRange}
          sublabel="Support to resistance band"
        />
        <MetricTile
          icon={BarChart2}
          label="Volume Ratio"
          value={`${price.volumeRatio.toFixed(2)}x`}
          sublabel="vs 20D avg vol"
          change={price.volumeRatio >= 1.5 ? `+${price.volumeRatio.toFixed(2)}x` : undefined}
        />
      </div>
    </SectionPanel>
  );
}
