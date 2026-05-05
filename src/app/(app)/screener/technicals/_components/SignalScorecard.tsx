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
      <div
        className="flex items-center justify-between px-2 pt-2 pb-4"
        style={{ borderBottom: "1px solid var(--qc-border-inner)" }}
      >
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] mb-1"
            style={{ color: "var(--qc-text-muted)" }}
          >Overall Signal</p>
          <span
            className="text-xl font-semibold"
            style={{ color: signalColor(signals.overall) }}
          >{signals.overall.replace(/_/g, " ")}</span>
        </div>
        <div className="text-right">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] mb-1"
            style={{ color: "var(--qc-text-muted)" }}
          >Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold" style={{ color: "var(--qc-text-heading)" }}>
              {signals.score.toFixed(1)}
            </span>
            <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>/100</span>
          </div>
        </div>
      </div>

      <div className="px-2 py-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => {
            const filled = signals.score >= (i + 1) * 5;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 18,
                  borderRadius: 3,
                  backgroundColor: filled ? "var(--qc-text-heading)" : "var(--qc-surface-row-alt)",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>SELL</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>NEUTRAL</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>BUY</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 pb-4 pt-2">
        {SCORE_COMPONENTS.map(({ icon: Icon, label, key }) => (
          <div
            key={key}
            className="rounded-[10px] border px-4 py-4 flex flex-col gap-2"
            style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
          >
            <div
              className="p-1 rounded-[6px] border w-fit"
              style={{ borderColor: "var(--qc-border-inner)", background: "var(--qc-surface-row-alt)" }}
            >
              <Icon className="h-4 w-4" style={{ color: "var(--qc-text-muted)" }} />
            </div>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: "var(--qc-text-muted)" }}
            >{label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold" style={{ color: "var(--qc-text-heading)" }}>
                {signals.components[key]}
              </span>
              <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>/100</span>
            </div>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}
