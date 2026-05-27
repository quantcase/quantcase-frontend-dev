"use client";

import { BarChart2 } from "lucide-react";
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

function TrendBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em]"
      style={{ color, background: color + "1A", border: `1px solid ${color}33` }}
    >
      {label}
    </span>
  );
}

export function VolumeAnalysis({ volume }: VolumeAnalysisProps) {
  const volumeTrendColor =
    volume.trend === "INCREASING"
      ? "var(--qc-up)"
      : volume.trend === "DECREASING"
        ? "var(--qc-down)"
        : "var(--qc-warn)";

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
      <div
        className="flex items-center justify-between py-2.5 px-2"
        style={{ borderTop: "1px solid var(--qc-hair-2)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink)" }}>Volume Trend</p>
        <TrendBadge label={volume.trend} color={volumeTrendColor} />
      </div>
      {SIGNAL_ROWS.map(({ label, key, positiveIsTrue }) => (
        <div
          key={key}
          className="flex items-center justify-between py-2.5 px-2"
          style={{ borderTop: "1px solid var(--qc-hair-2)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--qc-ink)" }}>{label}</p>
          <span
            className="font-mono text-[11px] font-semibold"
            style={{ color: booleanColor(volume.signals[key], positiveIsTrue) }}
          >
            {volume.signals[key] ? "YES" : "NO"}
          </span>
        </div>
      ))}
    </SectionPanel>
  );
}
