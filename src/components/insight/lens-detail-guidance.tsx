"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

function directionConfig(direction: string | null, impact: string | null) {
  const d = (direction ?? "").toLowerCase();
  const imp = (impact ?? "").toLowerCase();
  if (d === "beat" || d === "beat_early" || d === "beat_costly") {
    if (d === "beat_early") return { label: "BEAT EARLY", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
    if (d === "beat_costly") return { label: "BEAT (COSTLY)", color: "var(--qc-warn)", bg: "rgba(180,115,26,0.08)", border: "rgba(180,115,26,0.25)", leftBorder: "var(--qc-warn)" };
    return { label: "BEAT", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
  }
  if (d === "miss" || d === "major_miss") return { label: "MAJOR MISS", color: "var(--qc-down)", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", leftBorder: "var(--qc-down)" };
  if (d === "mediocre" || d === "minor_miss") return { label: d === "minor_miss" ? "MINOR" : "MEDIOCRE", color: "var(--qc-warn)", bg: "rgba(180,115,26,0.08)", border: "rgba(180,115,26,0.25)", leftBorder: "var(--qc-warn)" };
  if (d === "rolled_forward") return { label: "ROLLED FWD", color: "var(--qc-blue)", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.25)", leftBorder: "var(--qc-blue)" };
  if (d === "in_line" || d === "tracking") {
    if (imp === "high") return { label: d === "tracking" ? "TRACKING" : "IN LINE", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
    return { label: d === "tracking" ? "TRACKING" : "IN LINE", color: "var(--qc-ink-2)", bg: "var(--qc-section)", border: "var(--qc-hair)", leftBorder: "var(--qc-hair)" };
  }
  return { label: direction ?? "—", color: "var(--qc-ink-2)", bg: "var(--qc-section)", border: "var(--qc-hair)", leftBorder: "var(--qc-hair)" };
}

function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return "—";
  return unit ? `${value} ${unit}` : String(value);
}

function deltaLabel(pct: number | null): string {
  if (pct === null) return "";
  if (pct === 0) return "flat";
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

function deltaColor(pct: number | null): string {
  if (pct === null || pct === 0) return "var(--qc-ink-3)";
  return pct > 0 ? "var(--qc-up)" : "var(--qc-down)";
}

export function LensDetailGuidance({ lens, signals }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];
  const govSignals = signals.filter((s) => s.signal_type === "governance");

  const hitRate = lens.key_metrics["Signal_Count"] ?? lens.key_metrics["signal_count"] ?? null;
  const zScore = lens.key_metrics["Guidance_Credibility_Z_Score"] ?? null;
  const ci = lens.key_metrics["Confidence_Interval"] ?? null;
  const bias = lens.status;
  const biasColor = bias === "STRONG" ? "var(--qc-up)" : bias === "WEAK" ? "var(--qc-down)" : "var(--qc-warn)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Headline metric trio */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
        <div style={{ padding: "14px 14px 12px", background: "var(--qc-section)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-up)", margin: "0 0 4px" }}>SIGNAL COUNT</p>
          <p style={{ fontSize: 28, fontWeight: 500, color: "var(--qc-ink)", margin: 0, lineHeight: 1 }}>{hitRate ?? "—"}</p>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>governance signals</p>
        </div>
        <div style={{ padding: "14px 14px 12px", background: "var(--qc-section)", borderLeft: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-warn)", margin: "0 0 4px" }}>Z-SCORE</p>
          <p style={{ fontSize: 28, fontWeight: 500, color: "var(--qc-ink)", margin: 0, lineHeight: 1 }}>{zScore ?? lens.z_score.toFixed(2)}</p>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>confidence index</p>
        </div>
        <div style={{ padding: "14px 14px 12px", background: "var(--qc-section)", borderLeft: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: biasColor, margin: "0 0 4px" }}>GUIDANCE BIAS</p>
          <p style={{ fontSize: 22, fontWeight: 500, color: biasColor, margin: 0, lineHeight: 1.1, fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>{bias}</p>
          {ci && <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "4px 0 0", fontFamily: "monospace" }}>CI {ci}</p>}
        </div>
      </div>

      {/* Top signals — guidance vs actuals timeline table */}
      {topSignals.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
                GUIDANCE VS ACTUALS · TIMELINE
              </p>
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>Each row: forecast → reality → delta</p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 500, color: "var(--qc-ink-2)",
              background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
              borderRadius: 99, padding: "2px 10px",
            }}>
              {topSignals.length} entries
            </span>
          </div>
          <div>
            {topSignals.map((s, i) => {
              const isLast = i === topSignals.length - 1;
              const cfg = directionConfig(s.direction, s.impact);
              const guidedStr = formatValue(s.guided_value, s.unit);
              const actualStr = formatValue(s.actual_value, s.unit);
              const hasDelta = s.delta_pct !== null;
              const hasGuidedOrActual = s.guided_value !== null || s.actual_value !== null;
              return (
                <div
                  key={s.signal_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    padding: "14px 16px",
                    borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                    borderLeft: `3px solid ${cfg.leftBorder}`,
                    background: "var(--qc-card)",
                    alignItems: "center",
                  }}
                >
                  {/* Left: label + statement */}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>
                      {s.label}
                    </p>
                    {s.statement && (
                      <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>
                        {s.statement}
                      </p>
                    )}
                  </div>

                  {/* Right: guided / actual / delta / badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    {hasGuidedOrActual && (
                      <>
                        {/* Guided */}
                        <div style={{ textAlign: "right", minWidth: 64 }}>
                          <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>GUIDED</p>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>{guidedStr}</span>
                          {s.guided_date && <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0", fontVariantNumeric: "tabular-nums" }}>{s.guided_date}</p>}
                        </div>
                        {/* Actual */}
                        <div style={{ textAlign: "right", minWidth: 64 }}>
                          <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>ACTUAL</p>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>{actualStr}</span>
                          {s.actual_date && <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0", fontVariantNumeric: "tabular-nums" }}>{s.actual_date}</p>}
                        </div>
                      </>
                    )}

                    {/* Delta */}
                    {hasDelta && (
                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: deltaColor(s.delta_pct),
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 52, textAlign: "right",
                      }}>
                        {deltaLabel(s.delta_pct)}
                      </span>
                    )}

                    {/* Direction badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
                      borderRadius: 6, padding: "3px 9px", whiteSpace: "nowrap",
                    }}>
                      {cfg.label}
                    </span>
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
          <div style={{ padding: "10px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              GOVERNANCE SIGNALS
            </p>
          </div>
          {govSignals.map((s, i) => {
            const isLast = i === govSignals.length - 1;
            const isPositive = s.impact === "high" || s.value === 1;
            return (
              <div key={s.id} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "11px 16px",
                borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                background: "var(--qc-card)",
              }}>
                <span style={{
                  flexShrink: 0, marginTop: 4,
                  width: 7, height: 7, borderRadius: "50%",
                  background: isPositive ? "var(--qc-up)" : "var(--qc-ink-3)",
                }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>
                    {s.metric.replace(/_/g, " ")}
                  </p>
                  {s.raw_value && (
                    <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: "2px 0 0", lineHeight: 1.4 }}>{s.raw_value}</p>
                  )}
                  {s.statement && (
                    <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>
                      &ldquo;{s.statement.slice(0, 120)}{s.statement.length > 120 ? "…" : ""}&rdquo;
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
