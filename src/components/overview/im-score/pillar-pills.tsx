"use client";

export const PILLAR_COLORS = {
  M: { dot: "var(--qc-blue, #2563EB)", seg: "#0E0E0C" },
  O: { dot: "var(--qc-up, #1F7A4A)", seg: "#1E3A2B" },
  D: { dot: "var(--qc-warn, #B4731A)", seg: "#7A5A12" },
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
              border: `1px solid ${isOn ? "var(--qc-text-heading)" : "var(--qc-border-default)"}`,
              borderRadius: 10,
              background: isOn ? "var(--qc-text-heading)" : "var(--qc-surface-white)",
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
                fontSize: 13, fontWeight: 500, flex: 1,
                color: isOn ? "#fff" : "var(--qc-text-heading)",
              }}
            >
              {labels[key]}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
                color: isOn ? "#fff" : score == null ? "var(--qc-text-muted)" : "var(--qc-text-heading)",
                letterSpacing: "-0.01em",
              }}
            >
              {score != null ? Math.round(score) : "—"}
              <span
                style={{
                  fontSize: 10.5,
                  color: isOn ? "rgba(255,255,255,0.55)" : "var(--qc-text-muted)",
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
