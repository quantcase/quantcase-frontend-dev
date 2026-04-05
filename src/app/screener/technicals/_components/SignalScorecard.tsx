"use client";

import { TrendingUp, Gauge, BarChart2, Waves } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TechnicalsSignalsRaw } from "@/types/technicals";
import { signalColor } from "./helpers";

interface SignalScorecardProps {
  signals: TechnicalsSignalsRaw;
}

const SCORE_COMPONENTS = [
  { icon: TrendingUp, label: "Trend Score", key: "trend" },
  { icon: Gauge, label: "Momentum Score", key: "momentum" },
  { icon: BarChart2, label: "Volume Score", key: "volume" },
  { icon: Waves, label: "Volatility Score", key: "volatility" },
] as const;

export function SignalScorecard({ signals }: SignalScorecardProps) {
  return (
    <SectionPanel
      title="Signal Scorecard"
      subtitle="Overall technical signal and component score breakdown"
    >
      <div className="flex items-center justify-between px-2 pt-2 pb-4 border-b border-zinc-100">
        <div>
          <h6 className="uppercase tracking-wider mb-1">Overall Signal</h6>
          <h3 className={signalColor(signals.overall)}>{signals.overall.replace(/_/g, " ")}</h3>
        </div>
        <div className="text-right">
          <h6 className="uppercase tracking-wider mb-1">Score</h6>
          <div className="flex items-baseline gap-1">
            <h2 style={{ color: "#0F172B" }}>{signals.score.toFixed(1)}</h2>
            <small>/100</small>
          </div>
        </div>
      </div>

      <div className="px-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => {
            const filled = signals.score >= (i + 1) * 5;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 20,
                  borderRadius: 2,
                  backgroundColor: filled ? "#0F172B" : "#E2E8F0",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between">
          <h6>SELL</h6>
          <h6>NEUTRAL</h6>
          <h6>BUY</h6>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 pb-4 pt-4">
        {SCORE_COMPONENTS.map(({ icon: Icon, label, key }) => (
          <div
            key={key}
            className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-2"
          >
            <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] w-fit">
              <Icon className="h-4 w-4 text-zinc-500" />
            </div>
            <small className="uppercase tracking-wider">{label}</small>
            <div className="flex items-baseline gap-1">
              <h3>{signals.components[key]}</h3>
              <small className="text-[#888888]">/100</small>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
