"use client";

import { PILLAR_MUTED } from "@/lib/chart-tokens";

export const PILLAR_COLORS = {
  M: { dot: "var(--qc-blue, #2563EB)", seg: PILLAR_MUTED.M },
  O: { dot: "var(--qc-up, #1F7A4A)", seg: PILLAR_MUTED.O },
  D: { dot: "var(--qc-warn, #B4731A)", seg: PILLAR_MUTED.D },
} as const;

export type PillarKey = "M" | "O" | "D";

interface PillarPillsProps {
  activePillar: PillarKey;
  onSelect: (key: PillarKey) => void;
  scores: Record<PillarKey, { score: number | null; max: number }>;
  labels: Record<PillarKey, string>;
}

export function PillarPills({ activePillar, onSelect, scores, labels }: PillarPillsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "4px 0 14px" }}>
      {(["M", "O", "D"] as PillarKey[]).map((key) => {
        const isOn = activePillar === key;
        const { score, max } = scores[key];
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px",
              border: `1px solid ${isOn ? "var(--qc-ink)" : "var(--qc-hair)"}`,
              borderRadius: 10,
              background: isOn ? "var(--qc-ink)" : "var(--qc-card)",
              cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              color: isOn ? "#fff" : "inherit",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%",
                flexShrink: 0, background: PILLAR_COLORS[key].dot,
              }}
            />
            <span
              style={{
                fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", flex: 1,
                color: isOn ? "#fff" : "var(--qc-ink)", fontFamily: "var(--qc-font-sans)",
              }}
            >
              {labels[key]}
            </span>
            <span
              style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-13)",
                color: isOn ? "#fff" : score == null ? "var(--qc-ink-2)" : "var(--qc-ink)",
                letterSpacing: "-0.01em",
              }}
            >
              {score != null ? Math.round(score) : "—"}
              <span
                style={{
                  fontSize: "var(--qc-fz-10)",
                  color: isOn ? "rgba(255,255,255,0.55)" : "var(--qc-ink-2)",
                  marginLeft: 1,
                }}
              >
                /{max}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
