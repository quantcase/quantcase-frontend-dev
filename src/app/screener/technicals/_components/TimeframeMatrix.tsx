"use client";

import { Badge } from "@/components/ui/badge";
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

export function TimeframeMatrix({ timeframes }: TimeframeMatrixProps) {
  return (
    <SectionPanel
      title="Timeframe Matrix"
      subtitle="Signal alignment across daily, weekly, monthly"
    >
      <div className="divide-y divide-zinc-100 pb-4">
        {TIMEFRAME_ROWS.map(({ label, key }) => {
          const tf = timeframes[key];
          return (
            <div key={key} className="flex items-center justify-between py-3 px-2">
              <div>
                <h6 className="uppercase tracking-wider">{label}</h6>
                <p className={directionColor(tf.trend)}>{tf.trend}</p>
              </div>
              <Badge className={signalColor(tf.signal)}>{tf.signal.replace(/_/g, " ")}</Badge>
            </div>
          );
        })}
        <div className="flex items-center justify-between py-3 px-2">
          <div>
            <h6 className="uppercase tracking-wider">Multi-TF Score</h6>
            <p>{timeframes.multiTimeframeScore.toFixed(1)}/100</p>
          </div>
          <Badge className={signalColor(timeframes.multiTimeframeSignal)}>
            {timeframes.multiTimeframeSignal}
          </Badge>
        </div>
      </div>
    </SectionPanel>
  );
}
