"use client";

import { Activity } from "lucide-react";
import { MonoLabel } from "@/components/ds";

export interface MarketMetric {
  label: string;
  value: string;
  annotation: string;
  annotationPositive?: boolean;
}

interface MarketViewCardProps {
  score: number;
  sentiment: string;
  metrics: MarketMetric[];
  updatedTime: string;
}

export function MarketViewCard({ score, sentiment, metrics, updatedTime }: MarketViewCardProps) {
  const markerPct = score;

  return (
    <div
      className="rounded-[10px] p-2"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", minWidth: 260 }}
    >
      {/* Header — matches WhoToCallToday */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Market View</MonoLabel>
        </div>
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-11)",
            letterSpacing: "var(--qc-track-mono)",
            color: "var(--qc-ink-3)",
            whiteSpace: "nowrap",
          }}
        >
          LIVE · {updatedTime}
        </span>
      </div>

      {/* Inner white card */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--qc-card)" }}>
        {/* Gauge area */}
        <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--qc-hair-2)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 22 }}>
            <div style={{ fontSize: "var(--qc-fz-44)", fontWeight: "var(--qc-w-regular)", fontFamily: "var(--qc-font-mono)", lineHeight: 1, color: "var(--qc-ink)" }}>
              {score}
              <span style={{ fontSize: "var(--qc-fz-18)", color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)", fontWeight: "var(--qc-w-regular)" }}>/100</span>
            </div>
            <span
              style={{
                fontSize: "var(--qc-fz-11)",
                fontWeight: "var(--qc-w-bold)",
                fontFamily: "var(--qc-font-sans)",
                background: "var(--qc-up-soft)",
                color: "var(--qc-up)",
                borderRadius: 5,
                padding: "3px 9px",
                letterSpacing: "var(--qc-track-mono)",
                marginBottom: 4,
              }}
            >
              {sentiment}
            </span>
          </div>

          {/* Fear-Greed bar */}
          <div>
            <div
              style={{
                position: "relative",
                height: 8,
                borderRadius: 99,
                background: "linear-gradient(to right, var(--qc-down), var(--qc-warn) 40%, var(--qc-up) 80%)",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${markerPct}%`,
                  transform: "translate(-50%, -50%)",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "var(--qc-ink)",
                  border: "2px solid #fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)", fontWeight: "var(--qc-w-semi)", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)" }}>
              <span>FEAR</span>
              <span>NEUTRAL</span>
              <span>GREED</span>
            </div>
          </div>
        </div>

        {/* Metrics list */}
        <div style={{ padding: "10px 18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>{m.label}</span>
              <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-mono)", textAlign: "right" }}>
                <span style={{ color: m.annotationPositive === false ? "var(--qc-down)" : m.annotationPositive ? "var(--qc-up)" : "var(--qc-ink-3)", marginRight: 4 }}>
                  {m.value}
                </span>
                <span style={{ color: m.annotationPositive === false ? "var(--qc-down)" : m.annotationPositive ? "var(--qc-up)" : "var(--qc-ink-3)", fontWeight: "var(--qc-w-medium)" }}>
                  {m.annotation}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
