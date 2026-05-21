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
            fontSize: 11,
            letterSpacing: "0.04em",
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
            <div style={{ fontSize: 44, fontWeight: 400, lineHeight: 1, color: "var(--qc-ink)" }}>
              {score}
              <span style={{ fontSize: 20, color: "var(--qc-ink-3)", fontWeight: 400 }}>/100</span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "#dcfce7",
                color: "#15803d",
                borderRadius: 5,
                padding: "3px 9px",
                letterSpacing: "0.06em",
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
                background: "linear-gradient(to right, #ef4444, #f59e0b 40%, #22c55e 80%)",
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--qc-ink-3)" }}>
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
              <span style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>{m.label}</span>
              <span style={{ fontSize: 12, textAlign: "right" }}>
                <span style={{ color: m.annotationPositive === false ? "var(--qc-down)" : m.annotationPositive ? "var(--qc-up)" : "var(--qc-ink-3)", marginRight: 4 }}>
                  {m.value}
                </span>
                <span style={{ color: m.annotationPositive === false ? "var(--qc-down)" : m.annotationPositive ? "var(--qc-up)" : "var(--qc-ink-3)", fontWeight: 500 }}>
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
