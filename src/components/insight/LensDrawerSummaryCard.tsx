"use client";

import { Brain } from "lucide-react";
import { DarkGradientCard } from "@/components/ds/DarkGradientCard";

export interface LensDrawerSummaryMetric {
  label: string;
  value: string;
  sub: string;
}

interface LensDrawerSummaryCardProps {
  title: string;
  body: string;
  metrics: LensDrawerSummaryMetric[];
}

export function LensDrawerSummaryCard({ title, body, metrics }: LensDrawerSummaryCardProps) {
  return (
    <DarkGradientCard style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: "20px 24px" }}>
      {/* Brain icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--qc-golden-ink)",
      }}>
        <Brain size={20} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-golden-ink)", margin: "0 0 4px", lineHeight: 1.4 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: "var(--qc-on-dark, #fff)", margin: 0, lineHeight: 1.6 }}>
          {body}
        </p>
      </div>

      {/* Metrics */}
      {metrics.length > 0 && (
        <div style={{ display: "flex", gap: 28, flexShrink: 0, paddingLeft: 24, borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(255,255,255,0.55)", margin: "0 0 4px" }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--qc-golden-ink)", margin: "0 0 2px", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{m.value}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", margin: 0 }}>{m.sub}</p>
            </div>
          ))}
        </div>
      )}
    </DarkGradientCard>
  );
}
