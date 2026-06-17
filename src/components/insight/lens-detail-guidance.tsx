"use client";

import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { LensDetail, TopSignal, Pattern } from "@/hooks/useLenses";
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
  if (d === "unresolvable") return { label: "UNRESOLVABLE", color: "var(--qc-ink-3)", bg: "var(--qc-section)", border: "var(--qc-hair)", leftBorder: "var(--qc-hair)" };
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
  const WIDTH = 440;
  const GAP = 8;
  const vpW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vpH = typeof window !== "undefined" ? window.innerHeight : 800;

  const left = Math.min(Math.max(anchorRect.left, 8), vpW - WIDTH - 8);
  const ESTIMATED_HEIGHT = 480;
  const spaceBelow = vpH - anchorRect.bottom - GAP;
  const showAbove = spaceBelow < ESTIMATED_HEIGHT && anchorRect.top > ESTIMATED_HEIGHT;
  const top = showAbove ? anchorRect.top - ESTIMATED_HEIGHT - GAP : anchorRect.bottom + GAP;

  const BG      = "#16181d";
  const BORDER  = "rgba(255,255,255,0.08)";
  const DIVIDER = "rgba(255,255,255,0.07)";
  const MUTED   = "rgba(255,255,255,0.35)";
  const BODY    = "rgba(255,255,255,0.70)";
  const WHITE   = "#ffffff";

  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.09em", color: MUTED, display: "block", marginBottom: 3 }}>
      {children}
    </span>
  );

  const content = (
    <div style={{
      position: "fixed", top, left, width: WIDTH, zIndex: 9999,
      background: BG, border: `1px solid ${BORDER}`,
      borderRadius: 12, boxShadow: "0 20px 56px rgba(0,0,0,0.55)",
      overflow: "hidden", pointerEvents: "none",
      fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
    }}>

      {/* ── Header ── */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${DIVIDER}`, display: "flex", alignItems: "center", gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: WHITE, margin: 0, flex: 1, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{metricTitle}</p>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
          color: dirCfg.color, background: "rgba(255,255,255,0.06)", border: `1px solid ${dirCfg.color}44`,
          borderRadius: 5, padding: "3px 9px", flexShrink: 0,
        }}>{dirCfg.label}</span>
        {deltaStr && <span style={{ fontSize: 14, fontWeight: 700, color: dirCfg.color, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{deltaStr}</span>}
      </div>

      {/* ── Guided → Actual → Delta strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid ${DIVIDER}` }}>
        {[
          { label: "Guided", value: guidedStr !== "—" ? guidedStr : "—" },
          { label: "Actual", value: actualStr !== "—" ? actualStr : "—" },
          { label: "Delta", value: deltaStr || "—" },
        ].map(({ label, value }, i) => (
          <div key={label} style={{
            padding: "10px 14px",
            borderRight: i < 2 ? `1px solid ${DIVIDER}` : undefined,
          }}>
            <Lbl>{label}</Lbl>
            <span style={{ fontSize: 16, fontWeight: 700, color: label === "Delta" && deltaStr ? dirCfg.color : WHITE, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Timeline dates ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid ${DIVIDER}` }}>
        {[
          { label: "Announced", value: s.announcement_date ? formatDate(s.announcement_date) : "—" },
          { label: "Target date", value: s.target_date ? formatDate(s.target_date) : "—" },
          { label: "Actual date", value: s.actual_date ? formatDate(s.actual_date) : "—" },
        ].map(({ label, value }, i) => (
          <div key={label} style={{
            padding: "8px 14px",
            borderRight: i < 2 ? `1px solid ${DIVIDER}` : undefined,
          }}>
            <Lbl>{label}</Lbl>
            <span style={{ fontSize: 12, fontWeight: 500, color: BODY, fontVariantNumeric: "tabular-nums" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Statement / original statement ── */}
      {(s.statement || s.original_statement) && (
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${DIVIDER}`, display: "flex", flexDirection: "column", gap: 8 }}>
          {s.statement && (
            <div>
              <Lbl>Statement</Lbl>
              <p style={{ fontSize: 12, color: BODY, margin: 0, lineHeight: 1.6 }}>{s.statement}</p>
            </div>
          )}
          {s.original_statement && s.original_statement !== s.statement && (
            <div>
              <Lbl>Original quote</Lbl>
              <p style={{ fontSize: 11, color: BODY, margin: 0, lineHeight: 1.6, fontStyle: "italic", opacity: 0.8 }}>"{s.original_statement}"</p>
            </div>
          )}
        </div>
      )}

      {/* ── Evidence quotes ── */}
      {s.evidence && s.evidence.length > 0 && (
        <div style={{ padding: "10px 16px 12px" }}>
          <Lbl>Evidence ({s.evidence.length})</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {s.evidence.map((ev, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                background: "rgba(255,255,255,0.04)", borderRadius: 7,
                padding: "8px 10px", border: `1px solid ${DIVIDER}`,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", marginTop: 2, minWidth: 48 }}>
                  {formatDate(ev.period)}
                </span>
                <p style={{ fontSize: 11, color: BODY, margin: 0, lineHeight: 1.55, fontStyle: "italic" }}>"{ev.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer metadata ── */}
      <div style={{
        padding: "7px 16px", borderTop: `1px solid ${DIVIDER}`,
        display: "flex", alignItems: "center", gap: 16,
        background: "rgba(255,255,255,0.02)",
      }}>
        {s.source_ref && (
          <span style={{ fontSize: 10, color: MUTED }}>
            <span style={{ color: "rgba(255,255,255,0.20)", marginRight: 5 }}>SOURCE</span>{s.source_ref}
          </span>
        )}
        {s.impact && (
          <span style={{ fontSize: 10, color: MUTED, marginLeft: "auto" }}>
            <span style={{ color: "rgba(255,255,255,0.20)", marginRight: 5 }}>IMPACT</span>
            <span style={{ color: s.impact === "high" ? "#facc15" : BODY, fontWeight: 600, textTransform: "uppercase" }}>{s.impact}</span>
          </span>
        )}
      </div>

    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ── QC Intuition — pattern recognition table ─────────────────────────────────

function patternTypeConfig(type: string | undefined, direction: string | undefined) {
  const d = (direction ?? "").toLowerCase();
  const t = (type ?? "").toLowerCase();

  const isPositive = d === "positive";
  const isNegative = d === "negative";
  const isWatch = d === "watch";

  const color = isPositive ? "var(--qc-up)" : isNegative ? "var(--qc-down)" : isWatch ? "var(--qc-warn)" : "var(--qc-ink-3)";
  const bg = isPositive ? "rgba(31,122,74,0.10)" : isNegative ? "rgba(220,38,38,0.10)" : isWatch ? "rgba(180,115,26,0.10)" : "rgba(120,120,120,0.10)";
  const border = isPositive ? "rgba(31,122,74,0.28)" : isNegative ? "rgba(220,38,38,0.28)" : isWatch ? "rgba(180,115,26,0.28)" : "rgba(120,120,120,0.20)";

  const labelMap: Record<string, string> = {
    drumbeat: "DRUMBEAT",
    emergence: "RISING",
    going_quiet: "GOING QUIET",
    tone_divergence: "TONE SHIFT",
    narrative_gap: "GAP",
    street_pressure: "STREET PRESSURE",
  };
  const label = labelMap[t] ?? t.replace(/_/g, " ").toUpperCase();

  return { color, bg, border, label };
}

function PatternSparkline({ shapeData }: { shapeData: string | null }) {
  if (!shapeData) return <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>—</span>;

  let values: number[] = [];
  try {
    const parsed = JSON.parse(shapeData);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
      values = (parsed as Array<{ count?: number; value?: number }>).map((p) => p.count ?? p.value ?? 0);
    } else if (Array.isArray(parsed)) {
      values = parsed.map(Number).filter((v) => !isNaN(v));
    }
  } catch {
    values = shapeData.split(",").map(Number).filter((v) => !isNaN(v));
  }

  if (values.length < 2) return <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>{values[0] ?? "—"}</span>;

  const W = 120, H = 36, PAD = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return { x, y };
  });

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const lastPt = coords[coords.length - 1];
  const isRising = values[values.length - 1] > values[0];
  const lineColor = isRising ? "#4ade80" : "#f87171";
  const dotColor = lineColor;

  return (
    <svg width={W} height={H} style={{ overflow: "visible", display: "block" }}>
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
      <circle cx={lastPt.x} cy={lastPt.y} r={3.5} fill={dotColor} />
    </svg>
  );
}

function QCIntuitionTable({ patterns }: { patterns: Pattern[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div style={{
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid var(--qc-hair)",
    }}>
      {/* Dark header — uses DarkGradientCard bg */}
      <div className="qc-dark-gradient-card" style={{
        borderRadius: 0,
        padding: "20px 24px 18px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.50)",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 99, padding: "4px 10px",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", flexShrink: 0 }} />
            QC Intuition · Pattern Recognition
          </span>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {patterns.reduce((sum, p) => sum + p.evidence.length, 0) * 50}+
            </p>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "3px 0 0" }}>
              signals parsed
            </p>
          </div>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#ffffff", margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          What management is really saying
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.55 }}>
          Narrative themes extracted from <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>earnings calls, annual reports &amp; investor decks</strong>.{" "}
          Each theme tracks how often and how confidently management references it — surfacing strategic pivots{" "}
          <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>before they show in the P&amp;L</strong>.
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 140px 120px 1fr",
        background: "var(--qc-section)",
        borderBottom: "1px solid var(--qc-hair)",
        padding: "0 24px",
      }}>
        {["THEME", "SIGNAL TREND", "STATUS", "WHAT IT MEANS"].map((h, i) => (
          <div key={h} style={{ padding: "8px 0", paddingRight: i < 3 ? 12 : 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--qc-ink-3)" }}>{h}</span>
          </div>
        ))}
      </div>

      {/* Pattern rows */}
      <div style={{ background: "var(--qc-card)" }}>
        {patterns.map((p, i) => {
          const cfg = patternTypeConfig(p.pattern_type, p.direction);
          const isLast = i === patterns.length - 1;
          const isExpanded = expandedIdx === i;
          const confidencePct = Math.round(p.confidence * 100);

          return (
            <div key={i}>
              <div
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 140px 120px 1fr",
                  padding: "16px 24px",
                  borderBottom: !isLast || isExpanded ? "1px solid var(--qc-hair)" : undefined,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  background: isExpanded ? "var(--qc-section)" : "var(--qc-card)",
                  alignItems: "start",
                  gap: 0,
                }}
                onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "var(--qc-section)"; }}
                onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "var(--qc-card)"; }}
              >
                {/* Theme */}
                <div style={{ paddingRight: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: "0 0 3px", lineHeight: 1.3 }}>{p.label}</p>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                    {p.evidence.length} data point{p.evidence.length !== 1 ? "s" : ""} · {p.evidence[0]?.period}
                    {p.evidence.length > 1 ? ` → ${p.evidence[p.evidence.length - 1]?.period}` : ""}
                  </p>
                </div>

                {/* Sparkline */}
                <div style={{ paddingRight: 12, paddingTop: 2 }}>
                  <PatternSparkline shapeData={p.shape_data} />
                </div>

                {/* Status badge */}
                <div style={{ paddingRight: 12 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
                    borderRadius: 99, padding: "4px 10px", whiteSpace: "nowrap",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                    {cfg.label}
                  </span>
                </div>

                {/* What it means */}
                <div>
                  <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.6 }}>
                    {p.sentence}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>
                    {confidencePct}% confidence · click to see evidence
                  </p>
                </div>
              </div>

              {/* Expanded evidence panel */}
              {isExpanded && (
                <div style={{
                  background: "var(--qc-section)",
                  borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  padding: "0 24px 16px",
                }}>
                  {/* Confidence bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--qc-ink-3)", flexShrink: 0 }}>
                      Confidence
                    </span>
                    <div style={{ flex: 1, height: 3, background: "var(--qc-hair)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${confidencePct}%`, background: cfg.color, borderRadius: 99, transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, flexShrink: 0 }}>{confidencePct}%</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "0 0 14px", lineHeight: 1.55, fontStyle: "italic" }}>
                    {p.confidence_reason}
                  </p>
                  {/* Evidence quotes */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {p.evidence.map((ev, ei) => (
                      <div key={ei} style={{
                        display: "flex", gap: 12, alignItems: "flex-start",
                        background: "var(--qc-card)", borderRadius: 8,
                        padding: "10px 14px", border: "1px solid var(--qc-hair)",
                      }}>
                        <span style={{
                          flexShrink: 0, marginTop: 1,
                          fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                          color: "var(--qc-ink-3)", whiteSpace: "nowrap",
                          minWidth: 56,
                        }}>
                          {ev.period}
                        </span>
                        <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.55, fontStyle: "italic" }}>
                          "{ev.quote}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer — THE EDGE */}
      <div className="qc-dark-gradient-card" style={{
        borderRadius: 0,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 24px",
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <span style={{
          flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase",
          color: "var(--qc-dark-card-base, #0f172b)", background: "rgba(255,255,255,0.75)",
          borderRadius: 3, padding: "2px 6px", marginTop: 1,
        }}>
          THE EDGE
        </span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
          {patterns.find((p) => p.pattern_type === "street_pressure")?.sentence
            ?? patterns[0]?.sentence
            ?? "Patterns extracted from multi-quarter transcript analysis."}
        </p>
      </div>
    </div>
  );
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
    (s) => !["HEADLINE_HIT_RATE", "HEADLINE_MAJOR_MISS", "HEADLINE_GUIDANCE_BIAS", "HEADLINE_ENTRY_COUNT"].includes(s.metric)
      && s.direction != null
      && (s.direction as string) !== "none"
      && (s.direction as string) !== "unresolvable"
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

      {/* QC Intuition — pattern recognition table */}
      {lens.patterns && lens.patterns.length > 0 && (
        <QCIntuitionTable patterns={lens.patterns} />
      )}

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
            // -1 is the sentinel meaning "no value" from the API
            const guidedRaw = s.value_targeted ?? s.value_at_announcement ?? s.guided_value;
            const guidedNum = (guidedRaw !== null && guidedRaw !== undefined && (guidedRaw as unknown) !== "undefined" && guidedRaw !== -1) ? guidedRaw : null;
            const actualNum = (s.actual_value !== null && s.actual_value !== undefined && (s.actual_value as unknown) !== "undefined" && s.actual_value !== -1) ? s.actual_value : null;
            const guidedStr = formatValue(guidedNum, s.unit);
            const actualStr = formatValue(actualNum, s.unit, isTracking || actualNum === null);
            // Compute delta inline if API doesn't provide it
            const computedDelta = (guidedNum !== null && actualNum !== null && guidedNum !== 0) ? actualNum - guidedNum : null;
            const computedDeltaPct = (guidedNum !== null && actualNum !== null && guidedNum !== 0) ? ((actualNum - guidedNum) / Math.abs(guidedNum)) * 100 : null;
            const effectiveDelta = s.delta ?? computedDelta;
            const effectiveDeltaPct = s.delta_pct ?? computedDeltaPct;
            const hasDelta = !isTracking && effectiveDeltaPct != null && guidedNum !== null && actualNum !== null;
            const hasGuidedOrActual = guidedNum !== null || actualNum !== null;
            // announcement_date = when guidance was made; target_date = when it was due
            const announcedLabel = formatDate(s.announcement_date);
            const targetLabel = formatDate(s.target_date ?? s.actual_date);
            // label is the clean human-readable signal name; fall back to formatted metric key
            const metricTitle = (s.label && s.label.length > 0) ? s.label : s.metric.replace(/_/g, " ");

            return (
              <div
                key={s.signal_id ?? `${s.metric}-${i}`}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  showTooltip({ signal: s, rect, metricTitle, guidedStr, actualStr, deltaStr: hasDelta ? deltaLabel(effectiveDelta, effectiveDeltaPct, s.unit) : "", dateLabel: announcedLabel });
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
                {/* Date column: announced → due */}
                <div style={{
                  padding: "14px 10px 14px 12px",
                  borderRight: "1px solid var(--qc-hair)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  alignSelf: "stretch", gap: 3,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.4 }}>
                    {announcedLabel}
                  </span>
                  {targetLabel && targetLabel !== announcedLabel && (
                    <span style={{ fontSize: 8, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.4, opacity: 0.6 }}>
                      → {targetLabel}
                    </span>
                  )}
                </div>

                {/* Metric name + label */}
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
                    {hasDelta ? deltaLabel(effectiveDelta, effectiveDeltaPct, s.unit) : ""}
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
