"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

function pctColor(pct: number) {
  if (pct >= 70) return "var(--qc-up)";
  if (pct >= 40) return "var(--qc-warn)";
  return "var(--qc-down)";
}

function impactBadgeStyle(impact: string | null) {
  const i = (impact ?? "").toLowerCase();
  if (i === "positive" || i === "high") return { color: "var(--qc-up)", bg: "rgba(31,122,74,0.10)", border: "rgba(31,122,74,0.25)" };
  if (i === "negative" || i === "low") return { color: "var(--qc-down)", bg: "rgba(220,38,38,0.10)", border: "rgba(220,38,38,0.25)" };
  return { color: "var(--qc-warn)", bg: "rgba(180,115,26,0.10)", border: "rgba(180,115,26,0.25)" };
}

function deltaLabel(value: number | null): string {
  if (value === null) return "—";
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return "flat";
}

function deltaColor(value: number | null): string {
  if (value === null || value === 0) return "var(--qc-ink-3)";
  if (value > 0) return "var(--qc-up)";
  return "var(--qc-down)";
}

export function LensDetailGuidance({ lens, signals }: Props) {
  const milestones = signals.filter((s) => s.signal_type === "milestone");
  const govSignals = signals.filter((s) => s.signal_type === "governance");

  // Build headline metric cards from key_metrics
  const hitRate = lens.key_metrics["Signal_Count"] ?? lens.key_metrics["signal_count"] ?? null;
  const zScore = lens.key_metrics["Guidance_Credibility_Z_Score"] ?? null;
  const ci = lens.key_metrics["Confidence_Interval"] ?? null;

  // Bias from status
  const bias = lens.status;
  const biasColor = bias === "STRONG" ? "var(--qc-up)" : bias === "WEAK" ? "var(--qc-down)" : "var(--qc-warn)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Headline metric trio */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
        {/* Signal count */}
        <div style={{ padding: "14px 14px 12px", background: "var(--qc-section)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-up)", margin: "0 0 4px" }}>SIGNAL COUNT</p>
          <p style={{ fontSize: 28, fontWeight: 500, color: "var(--qc-ink)", margin: 0, lineHeight: 1 }}>{hitRate ?? "—"}</p>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>governance signals</p>
        </div>

        {/* Z-Score */}
        <div style={{ padding: "14px 14px 12px", background: "var(--qc-section)", borderLeft: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-warn)", margin: "0 0 4px" }}>Z-SCORE</p>
          <p style={{ fontSize: 28, fontWeight: 500, color: "var(--qc-ink)", margin: 0, lineHeight: 1 }}>{zScore ?? lens.z_score.toFixed(2)}</p>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>confidence index</p>
        </div>

        {/* Guidance bias */}
        <div style={{ padding: "14px 14px 12px", background: "var(--qc-section)", borderLeft: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: biasColor, margin: "0 0 4px" }}>GUIDANCE BIAS</p>
          <p style={{ fontSize: 22, fontWeight: 500, color: biasColor, margin: 0, lineHeight: 1.1, fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>{bias}</p>
          {ci && <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "4px 0 0", fontFamily: "monospace" }}>CI {ci}</p>}
        </div>
      </div>

      {/* Milestone signals — guidance track record */}
      {milestones.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              GUIDANCE VS ACTUALS · MILESTONES
            </p>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>Each row: metric → value → impact</p>
          </div>
          <div>
            {milestones.map((s, i) => {
              const badge = impactBadgeStyle(s.impact);
              const isLast = i === milestones.length - 1;
              return (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    padding: "12px 14px",
                    borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                    background: "var(--qc-card)",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{s.metric.replace(/_/g, " ").toUpperCase()}</p>
                    {s.raw_value && (
                      <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: "2px 0 0", lineHeight: 1.4 }}>{s.raw_value}</p>
                    )}
                    {s.statement && (
                      <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>
                        "{s.statement.slice(0, 120)}{s.statement.length > 120 ? "…" : ""}"
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    {s.value !== null && (
                      <span style={{ fontSize: 15, fontWeight: 600, color: deltaColor(s.value), fontVariantNumeric: "tabular-nums" }}>
                        {deltaLabel(s.value)}
                      </span>
                    )}
                    {s.impact && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`,
                        borderRadius: 4, padding: "2px 7px",
                      }}>
                        {s.impact.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Governance signals */}
      {govSignals.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              GOVERNANCE SIGNALS
            </p>
          </div>
          {govSignals.map((s, i) => {
            const isLast = i === govSignals.length - 1;
            const isPositive = s.value === 1;
            return (
              <div key={s.id} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "11px 14px",
                borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                background: "var(--qc-card)",
              }}>
                <span style={{
                  flexShrink: 0, marginTop: 3,
                  width: 7, height: 7, borderRadius: "50%",
                  background: isPositive ? "var(--qc-up)" : "var(--qc-down)",
                }} />
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>
                    {s.metric.replace(/_/g, " ")}
                  </p>
                  {s.raw_value && (
                    <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: "2px 0 0", lineHeight: 1.4 }}>{s.raw_value}</p>
                  )}
                  {s.statement && (
                    <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>
                      "{s.statement.slice(0, 100)}{s.statement.length > 100 ? "…" : ""}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insight summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {lens.highlights.slice(0, 2).map((h, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            background: "rgba(31,122,74,0.06)",
            border: "1px solid rgba(31,122,74,0.20)",
            borderLeft: "3px solid var(--qc-up)",
            borderRadius: 8,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--qc-up)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {i === 0 ? "Strength" : "Track Record"}
            </p>
            <p style={{ fontSize: 12, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{h}</p>
          </div>
        ))}
        {lens.risks.slice(0, 2).map((r, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            background: "rgba(180,115,26,0.06)",
            border: "1px solid rgba(180,115,26,0.20)",
            borderLeft: "3px solid var(--qc-warn)",
            borderRadius: 8,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--qc-warn)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Watch
            </p>
            <p style={{ fontSize: 12, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{r}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
