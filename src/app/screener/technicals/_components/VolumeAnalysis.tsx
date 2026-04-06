"use client";

import { BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionPanel } from "@/components/molecules/section-panel";
import { MetricTile } from "@/components/molecules/metric-tile";
import { TechnicalsVolumeRaw } from "@/types/technicals";
import { booleanColor } from "./helpers";

interface VolumeAnalysisProps {
  volume: TechnicalsVolumeRaw;
}

const SIGNAL_ROWS = [
  { label: "Volume Breakout", key: "volumeBreakout" as const, positiveIsTrue: true },
  { label: "Accumulation", key: "accumulation" as const, positiveIsTrue: true },
  { label: "Distribution", key: "distribution" as const, positiveIsTrue: false },
] as const;

export function VolumeAnalysis({ volume }: VolumeAnalysisProps) {
  const volumeTrendColor =
    volume.trend === "INCREASING"
      ? "text-emerald-600"
      : volume.trend === "DECREASING"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <SectionPanel
      title="Volume Analysis"
      subtitle="Volume levels, trend, and accumulation signals"
    >
      <div className="grid grid-cols-2 gap-3 pb-4 pt-2">
        <MetricTile
          icon={BarChart2}
          label="Current Volume"
          value={volume.current.toLocaleString("en-IN")}
          sublabel="Today's volume"
        />
        <MetricTile
          icon={BarChart2}
          label="Volume Ratio"
          value={`${volume.ratio.toFixed(2)}x`}
          sublabel="vs 20D avg"
          change={
            volume.ratio >= 1
              ? `+${volume.ratio.toFixed(2)}x`
              : `-${volume.ratio.toFixed(2)}x`
          }
        />
      </div>
      <div className="flex items-center justify-between py-3 border-t border-zinc-100 px-2">
        <h6 className="uppercase tracking-wider">Volume Trend</h6>
        <Badge className={volumeTrendColor}>{volume.trend}</Badge>
      </div>
      {SIGNAL_ROWS.map(({ label, key, positiveIsTrue }) => (
        <div
          key={key}
          className="flex items-center justify-between py-3 px-2 border-t border-zinc-100"
        >
          <p>{label}</p>
          <span className={`text-xs font-semibold ${booleanColor(volume.signals[key], positiveIsTrue)}`}>
            {volume.signals[key] ? "YES" : "NO"}
          </span>
        </div>
      ))}
    </SectionPanel>
  );
}
