"use client";

import { useState, useRef, useCallback } from "react";
import { renderMd } from "@/lib/render-md";


export interface SignalTileMetric {
  name: string;
  value: string;
  comment?: string;
  assessment: "Positive" | "Negative" | "Neutral";
}

export interface SignalTileProps {
  label: string;
  value: string;
  sentiment?: "positive" | "negative" | "neutral";
  /** Optional detail text shown in popup when no metrics are provided */
  detail?: string;
  /** Structured metrics shown in the hover popup */
  metrics?: SignalTileMetric[];
}

function sentimentStyles(sentiment: "positive" | "negative" | "neutral"): {
  color: string;
  bg: string;
  border: string;
} {
  if (sentiment === "positive")
    return { color: "var(--qc-up)", bg: "var(--qc-up-soft)", border: "rgba(31, 122, 74, 0.25)" };
  if (sentiment === "negative")
    return { color: "var(--qc-down)", bg: "var(--qc-down-soft)", border: "rgba(178, 58, 47, 0.25)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "rgba(180, 115, 26, 0.25)" };
}

function inferSentiment(value: string): "positive" | "negative" | "neutral" {
  const v = value.toLowerCase();
  if (["strong", "good", "positive", "low risk", "stable"].some((k) => v.includes(k))) return "positive";
  if (["weak", "expensive", "high risk", "negative", "poor"].some((k) => v.includes(k))) return "negative";
  return "neutral";
}

function metricAssessmentVars(assessment: SignalTileMetric["assessment"]) {
  if (assessment === "Positive") return { color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  if (assessment === "Negative") return { color: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)" };
}

export function SignalTile({ label, value, sentiment, detail, metrics = [] }: SignalTileProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  const resolved = sentiment ?? inferSentiment(value);
  const sc = sentimentStyles(resolved);

  const hasPopup = metrics.length > 0 || !!detail;

  const handleMouseEnter = useCallback(() => {
    if (!hasPopup) return;
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      setAlignRight(rect.left > window.innerWidth / 2);
    }
    setShowTooltip(true);
  }, [hasPopup]);

  return (
    <div
      ref={tileRef}
      className="relative rounded-[8px] border px-3 py-2.5 cursor-default"
      style={{ borderColor: sc.border, background: sc.bg }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] truncate" style={{ color: "var(--qc-ink-2)" }}>
          {label}
        </p>
      </div>
      <p className="text-[12px] font-semibold" style={{ color: sc.color }}>{value}</p>

      {showTooltip && hasPopup && (
        <div
          className="absolute bottom-full mb-1.5 z-50 w-64 rounded-[10px] border shadow-lg overflow-hidden"
          style={{
            borderColor: "var(--qc-hair)",
            background: "var(--qc-card)",
            ...(alignRight ? { right: 0 } : { left: 0 }),
          }}
        >
          <div style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--qc-hair)",
            background: sc.bg,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)" }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: sc.color }}>{value}</span>
          </div>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {metrics.length > 0
              ? metrics.map((m) => {
                  const mc = metricAssessmentVars(m.assessment);
                  return (
                    <div key={m.name}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)" }}>{m.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: mc.color }}>{m.value}</span>
                      </div>
                      {m.comment && (
                        <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink)", lineHeight: 1.5 }}>{renderMd(m.comment)}</p>
                      )}
                    </div>
                  );
                })
              : detail && (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink)", lineHeight: 1.5 }}>{renderMd(detail)}</p>
                )}
          </div>
        </div>
      )}
    </div>
  );
}
