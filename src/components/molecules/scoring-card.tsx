"use client";

import { SectionPanel } from "@/components/molecules/section-panel";
import type { ReactNode } from "react";

export interface ScoringRow {
  name: string;
  /** Numeric score, or null if not available */
  score: number | null;
  maxScore: number;
  /** Optional status label shown on the right (e.g. "UNFAVORABLE") */
  status?: string;
}

interface ScoringCardProps {
  /** Panel title — passed to SectionPanel header */
  title: ReactNode;
  /** Small uppercase label shown above the big score number */
  scoreLabel?: string;
  score: number;
  maxScore: number;
  rows?: ScoringRow[];
  /**
   * Override the filled-bar color.
   * Defaults to semantic color derived from score percentage.
   */
  barColor?: string;
  /**
   * When true, rows show only the name + mini-bar, hiding the score text and
   * status label. Used by management-style cards.
   */
  compactRows?: boolean;
}

function semanticColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct <= 0.4) return "#F8383C";
  if (pct <= 0.7) return "#FBBF24";
  return "#888888";
}

export function ScoringCard({
  title,
  scoreLabel,
  score,
  maxScore,
  rows = [],
  barColor,
  compactRows = false,
}: ScoringCardProps) {
  const fillColor = barColor ?? semanticColor(score, maxScore);
  const filledCount = Math.round(Math.min(score, maxScore));

  return (
    <SectionPanel title={title}>
      <div className="space-y-4">
        {/* Score */}
        <div>
          {scoreLabel && (
            <p style={{ fontSize: 11, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              {scoreLabel}
            </p>
          )}
          <div>
            <span style={{ fontSize: 56, fontWeight: 500, color: "#0F172B", lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: 28, fontWeight: 400, color: "rgba(18,18,18,0.40)" }}>
              /{maxScore}
            </span>
          </div>
        </div>

        {/* Segmented bar */}
        <div className="space-y-1.5">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {Array.from({ length: maxScore }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 32,
                  borderRadius: 2,
                  backgroundColor: i < filledCount ? fillColor : "#E2E8F0",
                }}
              />
            ))}
          </div>
          <div className="flex justify-between">
            <h6>LOW</h6>
            <h6>MODERATE</h6>
            <h6>HIGH</h6>
          </div>
        </div>

        {/* Per-section rows */}
        {rows.length > 0 && (
          <div className="border-t border-zinc-100 pt-4">
            {rows.map((row) => {
              const hasScore = row.score !== null && !isNaN(row.score);
              const sFilled = hasScore ? Math.round(Math.min(row.score!, row.maxScore)) : 0;
              const rowColor = barColor ?? (hasScore ? semanticColor(row.score!, row.maxScore) : "#E2E2E2");

              if (compactRows) {
                return (
                  <div key={row.name} className="flex items-center justify-between gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                    <span style={{ fontSize: 12, color: "#888888" }}>{row.name}</span>
                    <div style={{ display: "flex", gap: 3 }}>
                      {Array.from({ length: row.maxScore }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 16,
                            borderRadius: 2,
                            backgroundColor: i < sFilled ? rowColor : "#E2E2E2",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={row.name} className="flex items-center gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                  <h6 className="w-40 shrink-0">{row.name}</h6>
                  <span style={{ fontSize: 14, fontWeight: 500, color: hasScore ? "#0F172B" : "#94a3b8", whiteSpace: "nowrap" }}>
                    {hasScore ? `${row.score}/${row.maxScore}` : "N/A"}
                  </span>
                  {hasScore ? (
                    <div style={{ display: "flex", gap: 2, flex: 1, justifyContent: "center" }}>
                      {Array.from({ length: row.maxScore }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            height: 12,
                            width: 6,
                            borderRadius: 1,
                            backgroundColor: i < sFilled ? rowColor : "#E2E8F0",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ flex: 1 }} />
                  )}
                  <h6 className="shrink-0 text-right w-36" style={{ color: hasScore ? undefined : "#94a3b8" }}>
                    {row.status ?? "N/A"}
                  </h6>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
