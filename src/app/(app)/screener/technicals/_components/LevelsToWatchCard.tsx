"use client";

import type { DecisionIntelligence } from "@/types/technicals";

type Levels = DecisionIntelligence["levelsToWatch"];

interface Props {
  levels: Levels | null;
  cmp: number;
}

const ROWS: { key: "immediate" | "structural" | "regime"; heading: string }[] = [
  { key: "immediate", heading: "Immediate" },
  { key: "structural", heading: "Structural" },
  { key: "regime", heading: "Regime" },
];

const fmtPrice = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/**
 * The AI's three watch levels, with each one's distance from the current price
 * computed client-side.
 */
export function LevelsToWatchCard({ levels, cmp }: Props) {
  if (!levels) return null;

  const rows = ROWS.map(({ key, heading }) => ({ heading, level: levels[key] })).filter(
    (r) => r.level && typeof r.level.price === "number",
  );

  if (rows.length === 0) return null;

  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Levels To Watch
      </span>

      <div className="flex flex-col">
        {rows.map(({ heading, level }, i) => {
          const distPct = cmp > 0 ? ((level.price - cmp) / cmp) * 100 : 0;
          const above = distPct >= 0;
          return (
            <div
              key={heading}
              className="flex items-center justify-between gap-3 py-2"
              style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : "none" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>
                  {heading}
                </span>
                <span className="truncate" style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)", lineHeight: 1.4 }}>
                  {level.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>
                  {fmtPrice(level.price)}
                </span>
                <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: above ? "var(--qc-up)" : "var(--qc-down)" }}>
                  ({above ? "+" : ""}{distPct.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {levels.horizonNote && (
        <p style={{ margin: 0, fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", lineHeight: 1.5, fontFamily: "var(--qc-font-sans)" }}>
          {levels.horizonNote}
        </p>
      )}
    </div>
  );
}
