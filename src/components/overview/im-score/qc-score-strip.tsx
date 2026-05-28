"use client";

import { PILLAR_COLORS, type PillarKey } from "./pillar-pills";

interface QcScoreStripProps {
  displayScore: number;
  rating: string;
  weightedPct: number;
  weights: Record<PillarKey, number>;
}

const PILLAR_LABELS: Record<PillarKey, string> = {
  M: "Management",
  O: "Opportunity",
  D: "Deal",
};

export function QcScoreStrip({ displayScore, rating, weightedPct, weights }: QcScoreStripProps) {
  const ringColor =
    weightedPct >= 0.65
      ? "var(--qc-up)"
      : weightedPct >= 0.35
      ? "var(--qc-warn)"
      : "var(--qc-down)";
  const circumference = 2 * Math.PI * 24;
  const dashOffset = circumference * (1 - displayScore / 100);

  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: "auto 1px 1fr",
        gap: 20,
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 12,
        alignItems: "center",
      }}
    >
      {/* Score + rating badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
          <svg viewBox="0 0 60 60" width="60" height="60">
            <circle cx="30" cy="30" r="24" stroke="var(--qc-hair)" strokeWidth="5" fill="none" />
            <circle
              cx="30" cy="30" r="24"
              stroke={ringColor} strokeWidth="5" fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${dashOffset}`}
              transform="rotate(-90 30 30)"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute", inset: 0, display: "grid", placeItems: "center",
              fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-medium)", letterSpacing: "-0.015em", fontFamily: "var(--qc-font-mono)",
            }}
          >
            {displayScore}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)",
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "#fff", background: ringColor,
                padding: "4px 9px", borderRadius: 999,
              }}
            >
              {rating}
            </span>
          </div>
          <div style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", lineHeight: 1.4, fontFamily: "var(--qc-font-sans)" }}>
            Weighted QC score across M · O · D framework
          </div>
        </div>
      </div>

      {/* Separator */}
      <div style={{ alignSelf: "stretch", background: "var(--qc-hair-2)" }} />

      {/* Weight summary */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)",
              letterSpacing: "0.14em", color: "var(--qc-ink-2)", textTransform: "uppercase",
            }}
          >
            Current Weighting
          </span>
          <span
            style={{
              fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-11)",
              color: "var(--qc-ink-2)", letterSpacing: "0.04em",
            }}
          >
            {Object.values(weights).reduce((a, b) => a + b, 0)}% total
          </span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {(["M", "O", "D"] as PillarKey[]).map((key) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: PILLAR_COLORS[key].dot, flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-sans)" }}>{PILLAR_LABELS[key]}</span>
              <span
                style={{
                  fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-12)",
                  color: "var(--qc-ink)", fontWeight: "var(--qc-w-medium)",
                }}
              >
                {weights[key]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
