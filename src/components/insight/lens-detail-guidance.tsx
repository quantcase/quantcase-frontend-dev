"use client";

import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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

function formatValue(value: number | null | undefined | string, unit: string | null, isUnresolved = false): string {
  if (isUnresolved) return "—";
  if (value === null || value === undefined || value === "undefined" || value === 0 && unit === "binary") return "—";
  if (typeof value === "number" && isNaN(value)) return "—";
  // unit "ratio" is a count label (e.g. "6/8"), don't append the unit
  if (!unit || unit === "binary" || unit === "ratio") return String(value);
  return `${value} ${unit}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const q = Math.ceil((d.getMonth() + 1) / 3);
  const fy = d.getMonth() < 3 ? d.getFullYear() : d.getFullYear() + 1;
  return `Q${q} FY${String(fy).slice(2)}`;
}

function deltaLabel(delta: number | null | undefined, deltaPct: number | null | undefined, unit: string | null): string {
  // For large absolute deltas (revenue in Cr, subscribers in millions), prefer absolute delta
  // For % metrics, prefer pct-point delta; for ratios/counts, use pct delta
  if (delta == null && deltaPct == null) return "";
  if (unit === "%" || unit === "pp") {
    const v = delta ?? deltaPct;
    if (v == null) return "";
    return v > 0 ? `+${v.toFixed(1)} pp` : v < 0 ? `${v.toFixed(1)} pp` : "flat";
  }
  if (deltaPct == null) return "";
  return deltaPct > 0 ? `+${deltaPct.toFixed(1)}%` : deltaPct < 0 ? `${deltaPct.toFixed(1)}%` : "flat";
}


// ── Signal detail tooltip ────────────────────────────────────────────────────

interface TooltipProps {
  signal: TopSignal;
  anchorRect: DOMRect;
  dirCfg: ReturnType<typeof directionConfig>;
  metricTitle: string;
  guidedStr: string;
  actualStr: string;
  deltaStr: string;
  dateLabel: string;
}

function SignalTooltip({ signal: s, anchorRect, dirCfg, metricTitle, guidedStr, actualStr, deltaStr, dateLabel }: TooltipProps) {
  const WIDTH = 420;
  const GAP = 8;
  const vpW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vpH = typeof window !== "undefined" ? window.innerHeight : 800;

  const left = Math.min(Math.max(anchorRect.left, 8), vpW - WIDTH - 8);

  const ESTIMATED_HEIGHT = 200;
  const spaceBelow = vpH - anchorRect.bottom - GAP;
  const showAbove = spaceBelow < ESTIMATED_HEIGHT && anchorRect.top > ESTIMATED_HEIGHT;
  const top = showAbove ? anchorRect.top - ESTIMATED_HEIGHT - GAP : anchorRect.bottom + GAP;

  const cells: Array<{ label: string; value: string; accent?: boolean }> = [];
  if (dateLabel) cells.push({ label: "Period", value: dateLabel });
  if (s.announcement_date) cells.push({ label: "Announced", value: s.announcement_date });
  if (guidedStr && guidedStr !== "—") cells.push({ label: "Guided", value: guidedStr, accent: true });
  if (s.target_date) cells.push({ label: "Target date", value: formatDate(s.target_date) });
  if (actualStr && actualStr !== "—") cells.push({ label: "Actual", value: actualStr, accent: true });
  if (s.actual_date) cells.push({ label: "Actual date", value: formatDate(s.actual_date) });
  if (s.value_at_announcement != null) cells.push({ label: "At announcement", value: `${s.value_at_announcement} ${s.unit ?? ""}`.trim() });
  if (deltaStr) cells.push({ label: "Delta", value: deltaStr, accent: true });
  if (s.impact) cells.push({ label: "Impact", value: s.impact });

  // Dark palette constants
  const BG       = "#16181d";
  const BORDER   = "rgba(255,255,255,0.08)";
  const DIVIDER  = "rgba(255,255,255,0.07)";
  const MUTED    = "rgba(255,255,255,0.38)";
  const BODY     = "rgba(255,255,255,0.72)";
  const WHITE    = "#ffffff";

  const content = (
    <div style={{
      position: "fixed", top, left, width: WIDTH, zIndex: 9999,
      background: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
      overflow: "hidden",
      pointerEvents: "none",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px 11px", borderBottom: `1px solid ${DIVIDER}`, display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: WHITE, margin: 0, flex: 1, letterSpacing: "-0.01em" }}>{metricTitle}</p>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
          color: dirCfg.color, background: "rgba(255,255,255,0.07)", border: `1px solid rgba(255,255,255,0.12)`,
          borderRadius: 5, padding: "2px 8px", flexShrink: 0,
        }}>{dirCfg.label}</span>
        {deltaStr && <span style={{ fontSize: 13, fontWeight: 600, color: dirCfg.color, flexShrink: 0 }}>{deltaStr}</span>}
      </div>

      {/* Statement */}
      {s.statement && (
        <div style={{ padding: "10px 16px 11px", borderBottom: `1px solid ${DIVIDER}` }}>
          <p style={{ fontSize: 12, color: BODY, margin: 0, lineHeight: 1.6 }}>{s.statement}</p>
        </div>
      )}

      {/* Original statement */}
      {s.original_statement && (
        <div style={{ padding: "10px 16px 11px", borderBottom: `1px solid ${DIVIDER}` }}>
          <p style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", color: MUTED, margin: "0 0 4px" }}>Original statement</p>
          <p style={{ fontSize: 12, color: BODY, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>{s.original_statement}</p>
        </div>
      )}

      {/* 2-col data grid */}
      {cells.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "12px 16px", gap: "10px 20px" }}>
          {cells.map(({ label, value, accent }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", color: MUTED }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: accent ? 600 : 400, color: accent ? WHITE : BODY, fontVariantNumeric: "tabular-nums", letterSpacing: accent ? "-0.01em" : undefined }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ── Main component ───────────────────────────────────────────────────────────

type TooltipState = { signal: TopSignal; rect: DOMRect; metricTitle: string; guidedStr: string; actualStr: string; deltaStr: string; dateLabel: string };

export function LensDetailGuidance({ lens }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const showTooltip = useCallback((state: TooltipState) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setTooltip(state);
  }, []);

  const hideTooltip = useCallback(() => {
    hideTimer.current = setTimeout(() => setTooltip(null), 120);
  }, []);

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

          {/* Column header row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "56px 1fr 90px 90px 80px 90px",
            gap: 0,
            borderBottom: "1px solid var(--qc-hair)",
            background: "var(--qc-section)",
            borderLeft: "3px solid transparent",
          }}>
            <div style={{ padding: "6px 10px 6px 12px", borderRight: "1px solid var(--qc-hair)" }} />
            <div style={{ padding: "6px 16px", borderRight: "1px solid var(--qc-hair)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>METRIC</span>
            </div>
            <div style={{ padding: "6px 12px", textAlign: "right", borderRight: "1px solid var(--qc-hair)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>GUIDED</span>
            </div>
            <div style={{ padding: "6px 12px", textAlign: "right", borderRight: "1px solid var(--qc-hair)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>ACTUAL</span>
            </div>
            <div style={{ padding: "6px 12px", textAlign: "right", borderRight: "1px solid var(--qc-hair)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>DELTA</span>
            </div>
            <div style={{ padding: "6px 14px 6px 12px", textAlign: "right" }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>STATUS</span>
            </div>
          </div>

          {timelineSignals.map((s, i) => {
            const isLast = i === timelineSignals.length - 1;
            const cfg = directionConfig(s.direction, s.impact);
            const isTracking = (s.direction ?? "").toLowerCase() === "tracking";
            // value_targeted / value_at_announcement are the authoritative keys; fall back to guided_value
            const guidedRaw = s.value_targeted ?? s.value_at_announcement ?? s.guided_value;
            const guidedNum = (guidedRaw !== null && guidedRaw !== undefined && (guidedRaw as unknown) !== "undefined") ? guidedRaw : null;
            const actualNum = (s.actual_value !== null && s.actual_value !== undefined && (s.actual_value as unknown) !== "undefined" && s.actual_value !== 0) ? s.actual_value : null;
            const guidedStr = formatValue(guidedNum, s.unit);
            const actualStr = formatValue(actualNum, s.unit, isTracking || actualNum === null);
            const hasDelta = !isTracking && s.delta_pct != null && guidedNum !== null && actualNum !== null;
            const hasGuidedOrActual = guidedNum !== null || actualNum !== null;
            // announcement_date is the period label (e.g. "Q3 FY26"); fall back to target_date → guided_date → actual_date
            const dateLabel = s.announcement_date ?? s.label ?? formatDate(s.target_date ?? s.guided_date ?? s.actual_date);
            // Extract a clean metric title from the statement (everything before " guided") or fall back to formatted metric key
            const statementTitle = s.statement
              ? s.statement.split(/ guided | at | guided at /i)[0].trim()
              : null;
            const metricTitle = statementTitle && statementTitle.length <= 40
              ? statementTitle
              : s.metric.replace(/_/g, " ");

            return (
              <div
                key={s.signal_id ?? `${s.metric}-${i}`}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  showTooltip({ signal: s, rect, metricTitle, guidedStr, actualStr, deltaStr: hasDelta ? deltaLabel(s.delta, s.delta_pct, s.unit) : "", dateLabel });
                }}
                onMouseLeave={hideTooltip}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr 90px 90px 80px 90px",
                  gap: 0,
                  borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  borderLeft: `3px solid ${cfg.leftBorder}`,
                  background: "var(--qc-card)",
                  alignItems: "center",
                }}
              >
                {/* Date / period column */}
                <div style={{
                  padding: "14px 10px 14px 12px",
                  borderRight: "1px solid var(--qc-hair)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  alignSelf: "stretch",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.4 }}>
                    {dateLabel}
                  </span>
                </div>

                {/* Metric name + statement */}
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid var(--qc-hair)", alignSelf: "stretch" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>
                    {metricTitle}
                  </p>
                  {s.statement && (
                    <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>
                      {s.statement.slice(0, 120)}{s.statement.length > 120 ? "…" : ""}
                    </p>
                  )}
                </div>

                {/* GUIDED column */}
                <div style={{ padding: "12px", textAlign: "right", borderRight: "1px solid var(--qc-hair)", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>
                    {hasGuidedOrActual ? guidedStr : "—"}
                  </span>
                </div>

                {/* ACTUAL column */}
                <div style={{ padding: "12px", textAlign: "right", borderRight: "1px solid var(--qc-hair)", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>
                    {hasGuidedOrActual ? actualStr : ""}
                  </span>
                </div>

                {/* Delta column */}
                <div style={{ padding: "12px", textAlign: "right", borderRight: "1px solid var(--qc-hair)", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: hasDelta ? cfg.color : "var(--qc-ink-3)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {hasDelta ? deltaLabel(s.delta, s.delta_pct, s.unit) : ""}
                  </span>
                </div>

                {/* Status badge column */}
                <div style={{ padding: "12px 14px 12px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
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
        <LensDrawerSummaryCard
          title={lens.name}
          body={lens.takeaway}
          metrics={[]}
        />
      )}

      {/* Signal detail tooltip */}
      {tooltip && (
        <SignalTooltip
          signal={tooltip.signal}
          anchorRect={tooltip.rect}
          dirCfg={directionConfig(tooltip.signal.direction, tooltip.signal.impact)}
          metricTitle={tooltip.metricTitle}
          guidedStr={tooltip.guidedStr}
          actualStr={tooltip.actualStr}
          deltaStr={tooltip.deltaStr}
          dateLabel={tooltip.dateLabel}
        />
      )}
    </div>
  );
}
