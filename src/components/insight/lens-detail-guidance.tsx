"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";

interface Props {
  lens: LensDetail;
}

function directionConfig(direction: string | null, impact: string | null) {
  const d = (direction ?? "").toLowerCase();
  const imp = (impact ?? "").toLowerCase();
  if (d === "beat_early") return { label: "BEAT EARLY", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
  if (d === "beat_costly") return { label: "BEAT (COSTLY)", color: "var(--qc-warn)", bg: "rgba(180,115,26,0.08)", border: "rgba(180,115,26,0.25)", leftBorder: "var(--qc-warn)" };
  if (d === "beat") return { label: "BEAT", color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", leftBorder: "var(--qc-up)" };
  if (d === "major_miss") return { label: "MAJOR MISS", color: "var(--qc-down)", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", leftBorder: "var(--qc-down)" };
  if (d === "miss") return { label: "MISS", color: "var(--qc-down)", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", leftBorder: "var(--qc-down)" };
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

function deltaLabel(pct: number | null | undefined): string {
  if (pct == null) return "";
  if (pct === 0) return "flat";
  return pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
}

function deltaColor(pct: number | null | undefined): string {
  if (pct == null || pct === 0) return "var(--qc-ink-3)";
  return pct > 0 ? "var(--qc-up)" : "var(--qc-down)";
}

export function LensDetailGuidance({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  // Split headline tiles from timeline signals
  const headlineHitRate = topSignals.find((s) => s.metric === "HEADLINE_HIT_RATE");
  const headlineMajorMiss = topSignals.find((s) => s.metric === "HEADLINE_MAJOR_MISS");
  const headlineGuidanceBias = topSignals.find((s) => s.metric === "HEADLINE_GUIDANCE_BIAS");
  const timelineSignals = topSignals.filter(
    (s) => !["HEADLINE_HIT_RATE", "HEADLINE_MAJOR_MISS", "HEADLINE_GUIDANCE_BIAS", "HEADLINE_ENTRY_COUNT"].includes(s.metric) && s.direction != null
  );

  // Hit Rate tile
  const hitRateValue = headlineHitRate?.label ?? `${headlineHitRate?.actual_value ?? "—"}`;
  const hitRateSub = headlineHitRate?.statement ?? "Guidance commitments evaluated";

  // Major Miss tile — direction "beat" means no major miss (positive), "miss" means bad
  const majorMissValue = headlineMajorMiss?.label ?? "—";
  const majorMissSub = headlineMajorMiss?.statement ?? "Largest single guidance gap";
  const majorMissDir = (headlineMajorMiss?.direction ?? "").toLowerCase();
  const majorMissIsBeat = majorMissDir === "beat";
  const majorMissColor = majorMissIsBeat ? "var(--qc-up)" : "var(--qc-down)";
  const majorMissTileBg = majorMissIsBeat ? "rgba(31,122,74,0.06)" : "rgba(220,38,38,0.06)";
  const majorMissDotColor = majorMissIsBeat ? "var(--qc-up)" : "var(--qc-down)";

  // Guidance Bias tile
  const guidanceBiasValue = (headlineGuidanceBias?.label) ?? (lens.status || "—");
  const guidanceBiasSub = headlineGuidanceBias?.statement ?? "Guidance posture assessment";
  const gbLabel = (headlineGuidanceBias?.label ?? "").toLowerCase();
  const guidanceBiasColor = gbLabel.includes("conservative") ? "var(--qc-up)"
    : gbLabel.includes("aggressive") ? "var(--qc-down)"
    : gbLabel.includes("balanced") ? "var(--qc-blue, #2563eb)"
    : "var(--qc-ink-2)";
  const guidanceBiasTileBg = gbLabel.includes("conservative") ? "rgba(31,122,74,0.06)"
    : gbLabel.includes("aggressive") ? "rgba(220,38,38,0.06)"
    : "rgba(37,99,235,0.06)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Section header */}
      <div style={{ paddingBottom: 4 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>
          HEADLINE METRICS
        </p>
        {lens.description && (
          <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0 }}>{lens.description}</p>
        )}
      </div>

      {/* Headline KPI strip */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div className="grid grid-cols-3" style={{ gap: 0 }}>

          {/* Hit Rate tile — always green tint */}
          <div style={{
            padding: "18px 16px",
            background: "rgba(31,122,74,0.06)",
            borderRight: "1px solid var(--qc-hair)",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--qc-up)", flexShrink: 0 }} />
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
                HIT RATE
              </p>
            </div>
            <p style={{ fontSize: 36, fontWeight: 700, color: "var(--qc-up)", margin: "2px 0 0", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {hitRateValue}
            </p>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
              {hitRateSub}
            </p>
          </div>

          {/* Major Miss tile */}
          <div style={{
            padding: "18px 16px",
            background: majorMissTileBg,
            borderRight: "1px solid var(--qc-hair)",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: majorMissDotColor, flexShrink: 0 }} />
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
                MAJOR MISS
              </p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: majorMissColor, margin: "2px 0 0", lineHeight: 1.2 }}>
              {majorMissValue}
            </p>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
              {majorMissSub}
            </p>
          </div>

          {/* Guidance Bias tile */}
          <div style={{
            padding: "18px 16px",
            background: guidanceBiasTileBg,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: guidanceBiasColor, flexShrink: 0 }} />
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
                GUIDANCE BIAS
              </p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: guidanceBiasColor, margin: "2px 0 0", lineHeight: 1.2 }}>
              {guidanceBiasValue}
            </p>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
              {guidanceBiasSub}
            </p>
          </div>
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
            const hasDelta = s.delta_pct != null;
            const hasGuidedOrActual = s.guided_value !== null || s.actual_value !== null;
            const dateLabel = s.label ?? formatDate(s.guided_date ?? s.actual_date);
            const metricTitle = s.metric.replace(/_/g, " ");

            return (
              <div
                key={s.signal_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr auto",
                  gap: 0,
                  borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  borderLeft: `3px solid ${cfg.leftBorder}`,
                  background: "var(--qc-card)",
                  alignItems: "stretch",
                }}
              >
                {/* Date / period column */}
                <div style={{
                  padding: "14px 10px 14px 12px",
                  borderRight: "1px solid var(--qc-hair)",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.4 }}>
                    {dateLabel}
                  </span>
                </div>

                {/* Metric name + statement */}
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>
                    {metricTitle}
                  </p>
                  {s.statement && (
                    <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>
                      {s.statement.slice(0, 120)}{s.statement.length > 120 ? "…" : ""}
                    </p>
                  )}
                </div>

                {/* Guided / Actual / Delta / Badge */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                  {hasGuidedOrActual && (
                    <>
                      <div style={{ textAlign: "right", minWidth: 54 }}>
                        <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>GUIDED</p>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>{guidedStr}</span>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 54 }}>
                        <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>ACTUAL</p>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>{actualStr}</span>
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

      {/* Takeaway */}
      {lens.takeaway && (
        <div style={{
          padding: "14px 16px", background: "var(--qc-section)",
          borderRadius: 10, border: "1px solid var(--qc-hair)",
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
            ANALYST TAKEAWAY
          </p>
          <p style={{ fontSize: 13, color: "var(--qc-ink)", margin: 0, lineHeight: 1.6 }}>
            {lens.takeaway}
          </p>
        </div>
      )}
    </div>
  );
}
