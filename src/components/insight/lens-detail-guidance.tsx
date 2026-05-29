"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
}

function directionConfig(direction: string | null, impact: string | null) {
  const d = (direction ?? "").toLowerCase();
  const imp = (impact ?? "").toLowerCase();
  if (d === "beat_early") return { label: "BEAT EARLY", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
  if (d === "beat_costly") return { label: "BEAT (COSTLY)", color: "var(--qc-warn)", bg: "rgba(180,115,26,0.08)", border: "rgba(180,115,26,0.25)", leftBorder: "var(--qc-warn)" };
  if (d === "beat") return { label: "BEAT", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
  if (d === "miss" || d === "major_miss") return { label: "MAJOR MISS", color: "var(--qc-down)", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", leftBorder: "var(--qc-down)" };
  if (d === "mediocre" || d === "minor_miss") return { label: d === "minor_miss" ? "MINOR" : "MEDIOCRE", color: "var(--qc-warn)", bg: "rgba(180,115,26,0.08)", border: "rgba(180,115,26,0.25)", leftBorder: "var(--qc-warn)" };
  if (d === "rolled_forward") return { label: "ROLLED FWD", color: "var(--qc-blue)", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.25)", leftBorder: "var(--qc-blue)" };
  if (d === "tracking") {
    if (imp === "high") return { label: "TRACKING", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
    return { label: "TRACKING", color: "var(--qc-ink-2)", bg: "var(--qc-section)", border: "var(--qc-hair)", leftBorder: "var(--qc-hair)" };
  }
  if (d === "in_line") {
    if (imp === "high") return { label: "IN LINE", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
    return { label: "IN LINE", color: "var(--qc-ink-2)", bg: "var(--qc-section)", border: "var(--qc-hair)", leftBorder: "var(--qc-hair)" };
  }
  if (!d) return { label: "—", color: "var(--qc-ink-3)", bg: "var(--qc-section)", border: "var(--qc-hair)", leftBorder: "var(--qc-hair)" };
  return { label: d.toUpperCase(), color: "var(--qc-ink-2)", bg: "var(--qc-section)", border: "var(--qc-hair)", leftBorder: "var(--qc-hair)" };
}

function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return "—";
  return unit ? `${value} ${unit}` : String(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const q = Math.ceil((d.getMonth() + 1) / 3);
  const fy = d.getMonth() < 3 ? d.getFullYear() : d.getFullYear() + 1;
  return `Q${q} FY${String(fy).slice(2)}`;
}

function deltaLabel(pct: number | null): string {
  if (pct === null) return "";
  if (pct === 0) return "flat";
  return pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
}

function deltaColor(pct: number | null): string {
  if (pct === null || pct === 0) return "var(--qc-ink-3)";
  return pct > 0 ? "var(--qc-up)" : "var(--qc-down)";
}


export function LensDetailGuidance({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];
  const st = lens.status ?? "";
  const statusColor = st === "STRONG" ? "var(--qc-up)" : st === "WEAK" ? "var(--qc-down)" : "var(--qc-warn)";

  const km = lens.key_metrics ?? {};
  const signalCount = km["signal_count"] ?? String(lens.signal_count ?? "—");
  const zScore = lens.z_score != null ? lens.z_score.toFixed(2) : (km["weighted_z_score"] ?? "—");
  const ci = km["confidence_interval"] ?? km["Confidence_Interval"] ?? null;

  const timelineSignals = topSignals.filter((s) => s.direction !== null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header strip */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            GUIDANCE CREDIBILITY
          </span>
          {st && (
            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: statusColor, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
              {st.charAt(0) + st.slice(1).toLowerCase()}
            </span>
          )}
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 0 }}>
          {[
            { label: "SIGNAL COUNT", value: signalCount, sub: "Governance signals evaluated", color: "var(--qc-ink)" },
            { label: "Z-SCORE", value: zScore, sub: ci ? `CI ${ci}` : "Confidence index", color: "var(--qc-ink)" },
            { label: "GUIDANCE BIAS", value: st || "—", sub: "Assessed status", color: statusColor },
          ].map((tile, i, arr) => (
            <div key={i} style={{
              padding: "14px 14px",
              background: "var(--qc-card)",
              borderRight: i < arr.length - 1 ? "1px solid var(--qc-hair)" : undefined,
              borderTop: "1px solid var(--qc-hair)",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
                {tile.label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, color: tile.color, margin: "2px 0", lineHeight: 1 }}>
                {tile.value}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.35 }}>
                {tile.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Guidance vs Actuals timeline table */}
      {timelineSignals.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{
            padding: "10px 16px", background: "var(--qc-section)",
            borderBottom: "1px solid var(--qc-hair)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
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
              {timelineSignals.length} entries
            </span>
          </div>

          {timelineSignals.map((s, i) => {
            const isLast = i === timelineSignals.length - 1;
            const cfg = directionConfig(s.direction, s.impact);
            const guidedStr = formatValue(s.guided_value, s.unit);
            const actualStr = formatValue(s.actual_value, s.unit);
            const hasDelta = s.delta_pct !== null;
            const hasGuidedOrActual = s.guided_value !== null || s.actual_value !== null;
            const dateLabel = formatDate(s.guided_date ?? s.actual_date);

            return (
              <div
                key={s.signal_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr auto",
                  gap: 0,
                  borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  borderLeft: `3px solid ${cfg.leftBorder}`,
                  background: "var(--qc-card)",
                  alignItems: "stretch",
                }}
              >
                {/* Date column */}
                <div style={{
                  padding: "14px 10px 14px 12px",
                  borderRight: "1px solid var(--qc-hair)",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.4 }}>
                    {dateLabel}
                  </span>
                </div>

                {/* Label + statement */}
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>
                    {s.label}
                  </p>
                  {s.statement && (
                    <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>
                      {s.statement.slice(0, 100)}{s.statement.length > 100 ? "…" : ""}
                    </p>
                  )}
                </div>

                {/* Guided / Actual / Delta / Badge */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 20 }}>
                  {hasGuidedOrActual && (
                    <>
                      <div style={{ textAlign: "right", minWidth: 60 }}>
                        <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>GUIDED</p>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>{guidedStr}</span>
                        {s.guided_date && <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{formatDate(s.guided_date)}</p>}
                      </div>
                      <div style={{ textAlign: "right", minWidth: 60 }}>
                        <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>ACTUAL</p>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>{actualStr}</span>
                        {s.actual_date && <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{formatDate(s.actual_date)}</p>}
                      </div>
                    </>
                  )}
                  {hasDelta && (
                    <span style={{
                      fontSize: 14, fontWeight: 600, color: deltaColor(s.delta_pct),
                      fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right",
                    }}>
                      {deltaLabel(s.delta_pct)}
                    </span>
                  )}
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
      )}


      {/* Summary footer */}
      {lens.takeaway && (
        <LensDrawerSummaryCard
          title="Guidance credibility assessment."
          body={lens.takeaway}
          metrics={[
            { label: "Signal Count", value: signalCount, sub: "Governance signals" },
            { label: "Z-Score", value: zScore, sub: "Confidence index" },
            { label: "Status", value: st || "—", sub: "Assessed bias" },
          ]}
        />
      )}
    </div>
  );
}
