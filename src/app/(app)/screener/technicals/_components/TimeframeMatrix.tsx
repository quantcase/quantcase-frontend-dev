"use client";

import { SectionPanel } from "@/components/molecules/section-panel";
import { TechnicalsTimeframesRaw } from "@/types/technicals";
import { signalColor, directionColor } from "./helpers";

interface TimeframeMatrixProps {
  timeframes: TechnicalsTimeframesRaw;
}

const TIMEFRAME_ROWS = [
  { label: "DAILY", key: "daily" as const },
  { label: "WEEKLY", key: "weekly" as const },
  { label: "MONTHLY", key: "monthly" as const },
] as const;

function SignalBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em]"
      style={{ color, background: color + "1A", border: `1px solid ${color}33` }}
    >
      {label}
    </span>
  );
}

export function TimeframeMatrix({ timeframes }: TimeframeMatrixProps) {
  return (
    <SectionPanel
      title="Timeframe Matrix"
      subtitle="Signal alignment across daily, weekly, monthly"
    >
      <div className="pb-4">
        {TIMEFRAME_ROWS.map(({ label, key }, i) => {
          const tf = timeframes[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 px-2"
              style={i > 0 ? { borderTop: "1px solid var(--qc-border-inner)" } : undefined}
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-heading)" }}>{label}</p>
                <p className="text-[12px] font-medium" style={{ color: directionColor(tf.trend) }}>{tf.trend}</p>
              </div>
              <SignalBadge label={tf.signal.replace(/_/g, " ")} color={signalColor(tf.signal)} />
            </div>
          );
        })}
        <div
          className="flex items-center justify-between py-2.5 px-2"
          style={{ borderTop: "1px solid var(--qc-border-inner)" }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-heading)" }}>Multi-TF Score</p>
            <p className="text-[12px]" style={{ color: "var(--qc-text-body)" }}>{timeframes.multiTimeframeScore.toFixed(1)}/100</p>
          </div>
          <SignalBadge label={timeframes.multiTimeframeSignal} color={signalColor(timeframes.multiTimeframeSignal)} />
        </div>
      </div>
    </SectionPanel>
  );
}
