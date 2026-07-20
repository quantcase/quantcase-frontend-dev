"use client";

import { useState } from "react";
import { ScoreGauge } from "@/components/ds/ScoreGauge";
import type { TechnicalsScores } from "@/types/technicals";
import { SCORE_MODULES } from "@/lib/technicals-scores";

interface Props {
  scores: TechnicalsScores | null | undefined;
}

/**
 * Labels the backend emits when it could not actually score the stock. These
 * must not be coloured as a bad score — there is no score.
 */
const DEGRADED_LABELS = new Set([
  "insufficient data",
  "breakdown — insufficient data",
  "incomplete assessment",
  "no data — cannot score",
]);

function isDegraded(label: string): boolean {
  const l = label.trim().toLowerCase();
  return DEGRADED_LABELS.has(l) || l.includes("insufficient") || l.includes("cannot score") || l.includes("incomplete");
}

/** Tone from the grade (A–D), which is coarser and steadier than the raw score. */
function gradeTone(grade: string): { tier: "up" | "warn" | "down" | undefined; text: string; bg: string } {
  const g = grade.trim().toUpperCase();
  if (g === "A" || g === "B") return { tier: "up", text: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  if (g === "C") return { tier: "warn", text: "var(--qc-warn)", bg: "var(--qc-warn-soft)" };
  if (g === "D") return { tier: "down", text: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  return { tier: undefined, text: "var(--qc-ink-2)", bg: "var(--qc-section)" };
}

const EYEBROW = {
  fontFamily: "var(--qc-font-mono)",
  fontSize: "var(--qc-fz-9)",
  color: "var(--qc-ink-2)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
};

/**
 * Compact technical-score ring that lives in the Decision Intelligence header.
 * The 7-module breakdown is deferred to a hover/focus popover so the sticky rail
 * stays short — the score is glanceable, the arithmetic is on demand.
 *
 * No run-over-run delta badge: three consecutive backend runs on identical input
 * returned 43 → 41 → 38, so a "score moved" badge would render LLM noise as a
 * real signal. Reinstate (via `resolveScoreDirection`) once scoring is
 * stabilised backend-side.
 */
export function TechnicalsScoreDial({ scores }: Props) {
  const [open, setOpen] = useState(false);

  if (!scores) return null;

  const label = scores.label ?? "";
  const degraded = isDegraded(label);
  const tone = gradeTone(scores.grade ?? "");

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center", gap: 7 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={degraded ? `Technical score unavailable — ${label}` : `Technical score ${scores.final_score} of 100, grade ${scores.grade}`}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 7, cursor: "default" }}
      >
        <span style={EYEBROW}>Score</span>

        {degraded ? (
          <span
            className="grid place-items-center rounded-full"
            style={{ width: 34, height: 34, border: "2px solid var(--qc-hair)", fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)" }}
          >
            —
          </span>
        ) : (
          <ScoreGauge value={scores.final_score} max={100} shape="ring" size={34} strokeWidth={3} tier={tone.tier} />
        )}

        {scores.grade && !degraded && (
          <span
            className="rounded-[4px] px-1.5 py-0.5"
            style={{ background: tone.bg, color: tone.text, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)" }}
          >
            {scores.grade}
          </span>
        )}
      </button>

      {open && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            zIndex: 60,
            width: 260,
            borderRadius: 10,
            border: "1px solid var(--qc-hair)",
            background: "var(--qc-card)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "9px 12px", borderBottom: "1px solid var(--qc-hair)", background: degraded ? "var(--qc-section)" : tone.bg }}>
            <p style={{ ...EYEBROW, margin: 0, marginBottom: 3 }}>Technical Score</p>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-bold)", color: degraded ? "var(--qc-ink-2)" : "var(--qc-ink)", lineHeight: 1 }}>
                  {degraded ? "—" : scores.final_score}
                </span>
                {!degraded && <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)" }}>/ 100</span>}
              </div>
              <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", color: degraded ? "var(--qc-ink-2)" : tone.text, fontFamily: "var(--qc-font-sans)" }}>
                {label}
              </span>
            </div>
          </div>

          {/* Module scores are meaningless when the stock couldn't be scored. */}
          {degraded ? (
            <p style={{ margin: 0, padding: "10px 12px", fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-2)", lineHeight: 1.5, fontFamily: "var(--qc-font-sans)" }}>
              Not enough price history to score this stock. The breakdown appears once the modules can be computed.
            </p>
          ) : (
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {SCORE_MODULES.map(({ key, label: name, max }) => {
                const value = scores[key] ?? 0;
                const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
                return (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>{name}</span>
                      <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)" }}>{value}/{max}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: "var(--qc-section)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "var(--qc-ink)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
