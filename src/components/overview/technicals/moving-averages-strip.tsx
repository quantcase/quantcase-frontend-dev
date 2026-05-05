"use client";

import { fp } from "./price-ladder-section";

interface SmaItem {
  label: string;
  val: number;
  above: boolean;
}

interface MovingAveragesStripProps {
  cmp: number;
  smas: SmaItem[];
  aboveSMAs: (string | null)[];
  belowSMAs: (string | null)[];
}

export function MovingAveragesStrip({ cmp, smas, aboveSMAs, belowSMAs }: MovingAveragesStripProps) {
  const summaryText =
    aboveSMAs.length === 4
      ? "Price above all four SMAs · bullish stack"
      : belowSMAs.length === 4
      ? "Price below all four SMAs · bearish stack"
      : `Above ${aboveSMAs.join(", ")} · Below ${belowSMAs.join(", ")}`;

  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
          Moving Averages · vs CMP {fp(cmp)}
        </h4>
        <div style={{ fontSize: 11.5, color: "var(--qc-ink-2)" }}>{summaryText}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {smas.map((sma) => {
          const gap = sma.val > 0 ? ((cmp - sma.val) / sma.val) * 100 : 0;
          const fillPct = Math.min(Math.abs(gap) * 3, 50);
          return (
            <div key={sma.label}>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--qc-ink-2)",
                  letterSpacing: ".02em",
                  marginBottom: 4,
                }}
              >
                {sma.label}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: "var(--qc-ink)",
                  marginBottom: 6,
                }}
              >
                {fp(sma.val)}
              </div>
              {/* Gap bar */}
              <div
                style={{
                  position: "relative",
                  height: 6,
                  background: "var(--qc-chip, #F2F1EC)",
                  borderRadius: 999,
                  overflow: "visible",
                  marginBottom: 6,
                }}
              >
                {/* Midpoint tick */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%", top: -3, bottom: -3,
                    width: 2,
                    background: "var(--qc-ink-2)",
                    opacity: 0.5,
                  }}
                />
                {/* Fill */}
                <div
                  style={{
                    position: "absolute",
                    top: 0, bottom: 0,
                    borderRadius: 999,
                    ...(sma.above
                      ? { left: "50%", width: `${fillPct}%`, background: "var(--qc-up)" }
                      : { right: "50%", width: `${fillPct}%`, background: "var(--qc-down)" }),
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: sma.above ? "var(--qc-up)" : "var(--qc-down)",
                    fontWeight: 500,
                  }}
                >
                  {sma.above ? "Above" : "Below"}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "var(--qc-ink)",
                    letterSpacing: ".02em",
                  }}
                >
                  {gap >= 0 ? "+" : ""}
                  {gap.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
