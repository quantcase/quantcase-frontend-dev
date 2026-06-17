"use client";

import { useState } from "react";
import type { LensDetail, Pattern } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

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
    drumbeat: "DRUMBEAT", emergence: "RISING", going_quiet: "GOING QUIET",
    tone_divergence: "TONE SHIFT", narrative_gap: "GAP", street_pressure: "STREET PRESSURE",
    voluntary_statutory_ratio: "VOLUNTARY", granularity_by_segment: "GRANULAR",
    exceptional_item_framing: "ONE-OFFS", bad_news_acknowledgement: "REACTIVE",
    audit_matter_evolution: "AUDIT", says_clearly: "CONSISTENT", says_vaguely: "VAGUE", doesnt_say: "ABSENT",
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
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const coords = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const lastPt = coords[coords.length - 1];
  const isRising = values[values.length - 1] > values[0];
  const lineColor = isRising ? "#4ade80" : "#f87171";
  return (
    <svg width={W} height={H} style={{ overflow: "visible", display: "block" }}>
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
      <circle cx={lastPt.x} cy={lastPt.y} r={3.5} fill={lineColor} />
    </svg>
  );
}

interface Props {
  lens: LensDetail;
}

// ── Headline tile config ──────────────────────────────────────────────────────

function indTileConfig(metric: string, direction: string | null, actualValue: number | null) {
  const d = (direction ?? "").toLowerCase();
  const up   = { color: "var(--qc-up)",    dot: "var(--qc-up)",    bg: "rgba(31,122,74,0.06)"  };
  const down = { color: "var(--qc-down)",  dot: "var(--qc-down)",  bg: "rgba(220,38,38,0.06)"  };
  const warn = { color: "var(--qc-warn)",  dot: "var(--qc-warn)",  bg: "rgba(180,115,26,0.06)" };
  const neut = { color: "var(--qc-ink-2)", dot: "var(--qc-ink-3)", bg: "var(--qc-section)"     };

  // Deflections: 0 = good (green), any positive = bad
  if (metric === "IND_DEFLECTIONS") {
    if (actualValue === 0) return up;
    if (actualValue !== null && actualValue > 0) return down;
    return neut;
  }
  if (d === "beat") return up;
  if (d === "miss") return down;
  if (d === "tracking" || d === "in_line") return neut;
  return warn;
}

// ── Analysis pattern columns ──────────────────────────────────────────────────

const ANALYSIS_TYPES = ["says_clearly", "says_vaguely", "doesnt_say"] as const;

const ANALYSIS_CONFIG: Record<string, { label: string; icon: string; iconBg: string; iconColor: string; dotColor: string; subLabel: string }> = {
  says_clearly: {
    label: "Says Clearly",
    icon: "✓",
    iconBg: "rgba(31,122,74,0.12)",
    iconColor: "var(--qc-up)",
    dotColor: "var(--qc-up)",
    subLabel: "Granular, consistent, verifiable",
  },
  says_vaguely: {
    label: "Says Vaguely",
    icon: "~",
    iconBg: "rgba(180,115,26,0.12)",
    iconColor: "var(--qc-warn)",
    dotColor: "var(--qc-warn)",
    subLabel: "Present but without enough to verify",
  },
  doesnt_say: {
    label: "Doesn't Say",
    icon: "✕",
    iconBg: "rgba(220,38,38,0.12)",
    iconColor: "var(--qc-down)",
    dotColor: "var(--qc-down)",
    subLabel: "Material — consistently absent",
  },
};

// ── QC Intuition table (reused pattern from guidance) ────────────────────────

function DisclosurePatternTable({ patterns, signalCount: lensSignalCount }: { patterns: Pattern[]; signalCount?: number }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const signalCount = lensSignalCount ?? patterns.reduce((s, p) => s + p.evidence.length, 0);

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
      {/* Dark header */}
      <div className="qc-dark-gradient-card" style={{ borderRadius: 0, padding: "20px 24px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.50)", background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "4px 10px",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", flexShrink: 0 }} />
            QC Intuition · Pattern Recognition
          </span>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {signalCount * 50}+
            </p>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "3px 0 0" }}>
              signals parsed
            </p>
          </div>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#ffffff", margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          How management controls information flow
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.55 }}>
          Disclosure behaviour patterns across <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>earnings calls, annual reports &amp; investor decks</strong>.{" "}
          Tracks <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>what gets disclosed, what stays vague, and what is consistently absent</strong>.
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 140px 160px 1fr",
        background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", padding: "0 24px",
      }}>
        {["PATTERN", "SIGNAL TREND", "STATUS", "WHAT IT MEANS"].map((h, i) => (
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
          const confidencePct = p.confidence >= 0 ? Math.round(p.confidence * 100) : null;

          return (
            <div key={i}>
              <div
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 140px 160px 1fr",
                  padding: "16px 24px",
                  borderBottom: !isLast || isExpanded ? "1px solid var(--qc-hair)" : undefined,
                  cursor: "pointer", transition: "background 0.15s",
                  background: isExpanded ? "var(--qc-section)" : "var(--qc-card)",
                  alignItems: "start",
                }}
                onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "var(--qc-section)"; }}
                onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "var(--qc-card)"; }}
              >
                {/* Theme */}
                <div style={{ paddingRight: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: "0 0 3px", lineHeight: 1.3 }}>{p.label}</p>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                    {p.sentence ? p.sentence.slice(0, 60) + (p.sentence.length > 60 ? "…" : "") : ""}
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
                  <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.6 }}>{p.sentence}</p>
                  {confidencePct != null && (
                    <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>
                      {confidencePct}% confidence · click to see evidence
                    </p>
                  )}
                </div>
              </div>

              {/* Expanded evidence */}
              {isExpanded && (
                <div style={{
                  background: "var(--qc-section)",
                  borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  padding: "0 24px 16px",
                }}>
                  {confidencePct != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--qc-ink-3)", flexShrink: 0 }}>Confidence</span>
                      <div style={{ flex: 1, height: 3, background: "var(--qc-hair)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${confidencePct}%`, background: cfg.color, borderRadius: 99, transition: "width 0.4s" }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, flexShrink: 0 }}>{confidencePct}%</span>
                    </div>
                  )}
                  {p.confidence_reason && (
                    <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "0 0 14px", lineHeight: 1.55, fontStyle: "italic" }}>
                      {p.confidence_reason}
                    </p>
                  )}
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
                          color: "var(--qc-ink-3)", whiteSpace: "nowrap", minWidth: 56,
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

      {/* Footer — Pattern Call */}
      <div className="qc-dark-gradient-card" style={{
        borderRadius: 0, borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 24px", display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <span style={{
          flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase",
          color: "var(--qc-dark-card-base, #0f172b)", background: "rgba(255,255,255,0.75)",
          borderRadius: 3, padding: "2px 6px", marginTop: 1,
        }}>
          PATTERN CALL
        </span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
          {patterns.find((p) => p.direction === "negative")?.sentence
            ?? patterns[0]?.sentence
            ?? "Patterns extracted from multi-period disclosure analysis."}
        </p>
      </div>
    </div>
  );
}

// ── Analysis section: says clearly / vaguely / doesn't say ───────────────────

function AnalysisSection({ patterns }: { patterns: Pattern[] }) {
  const cols = ANALYSIS_TYPES.map((type) => ({
    type,
    cfg: ANALYSIS_CONFIG[type],
    // Collect all matching patterns (e.g. multiple says_clearly)
    matchingPatterns: patterns.filter((p) => p.pattern_type === type),
  }));

  const hasAny = cols.some((c) => c.matchingPatterns.length > 0);
  if (!hasAny) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          ANALYSIS
        </p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>
          What gets said, what stays vague, what is absent
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>
        {cols.map(({ type, cfg, matchingPatterns }) => {
          const allEvidence: Pattern["evidence"] = matchingPatterns.flatMap((p) => p.evidence);
          return (
            <div key={type} style={{ background: "var(--qc-card)", padding: "16px" }}>
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 5, flexShrink: 0,
                  background: cfg.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: cfg.iconColor,
                }}>
                  {cfg.icon}
                </span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--qc-ink)", margin: 0, lineHeight: 1.2 }}>{cfg.label}</p>
                  <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.3 }}>{cfg.subLabel}</p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--qc-hair)", marginBottom: 12 }} />

              {/* Evidence bullets — collected across all matching patterns */}
              {matchingPatterns.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {allEvidence.length > 0
                    ? allEvidence.slice(0, 4).map((ev, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: cfg.dotColor, flexShrink: 0, marginTop: 5,
                        }} />
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.3 }}>
                            {ev.period}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.4 }}>
                            {ev.quote.slice(0, 100)}{ev.quote.length > 100 ? "…" : ""}
                          </p>
                        </div>
                      </div>
                    ))
                    : (
                      <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
                        {matchingPatterns[0].sentence}
                      </p>
                    )
                  }
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>No data</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Watching section (from lens.risks) ───────────────────────────────────────

function WatchingSection({ risks }: { risks: string[] }) {
  if (!risks || risks.length === 0) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          WATCHING
        </p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>Unresolved — next quarters</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(risks.length, 3)}, 1fr)`, gap: 10 }}>
        {risks.map((risk, i) => {
          const parts = risk.split(" — ");
          const title = parts[0];
          const body = parts.slice(1).join(" — ");
          return (
            <div key={i} style={{
              padding: "16px",
              background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 10,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--qc-warn)", margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: 0, lineHeight: 1.3 }}>{title}</p>
              {body && <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>{body}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LensDetailDisclosure({ lens }: Props) {
  const topSignals = lens.top_signals ?? [];
  const patterns = lens.patterns ?? [];

  // Headline IND_ signals (all 4)
  const indSignals = topSignals.filter((s) => s.metric.startsWith("IND_"));

  // META_POSTURE for sources bar
  const metaPosture = topSignals.find((s) => s.metric === "META_POSTURE");

  // Split patterns: behavioral (for QC intuition table) vs analysis columns
  const analysisTypes = new Set(ANALYSIS_TYPES as readonly string[]);
  const behavioralPatterns = patterns.filter((p) => !analysisTypes.has(p.pattern_type));
  const analysisPatterns = patterns.filter((p) => analysisTypes.has(p.pattern_type));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Headline 3-col strip ── */}
      {indSignals.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              HEADLINE
            </p>
            {metaPosture?.original_statement && (
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{metaPosture.original_statement}</p>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${indSignals.length}, 1fr)`, borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
            {indSignals.map((s, i) => {
              const cfg = indTileConfig(s.metric, s.direction, s.actual_value);
              return (
                <div key={s.signal_id} style={{
                  padding: "18px 16px", background: cfg.bg,
                  borderRight: i < indSignals.length - 1 ? "1px solid var(--qc-hair)" : undefined,
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
                      {s.label}
                    </p>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: cfg.color, margin: "2px 0 0", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                    {s.actual_value != null && s.actual_value !== -1 ? `${s.actual_value}` : "—"}
                    {s.unit && s.actual_value != null && s.actual_value !== -1
                      ? <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 4 }}>{s.unit}</span>
                      : null}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                    {s.statement}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── QC Intuition patterns table ── */}
      {behavioralPatterns.length > 0 && (
        <DisclosurePatternTable patterns={behavioralPatterns} signalCount={lens.signal_count} />
      )}

      {/* ── Sources bar ── */}
      {metaPosture && (
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden",
          background: "var(--qc-section)",
        }}>
          <div style={{ padding: "10px 16px", borderRight: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
              SOURCES
            </p>
          </div>
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>
              {lens.signal_count} signals · {metaPosture.source_ref}
            </span>
          </div>
        </div>
      )}

      {/* ── Analysis section ── */}
      {analysisPatterns.length > 0 && (
        <AnalysisSection patterns={analysisPatterns} />
      )}

      {/* ── Watching section ── */}
      <WatchingSection risks={lens.risks ?? []} />

      {/* ── Takeaway ── */}
      {lens.takeaway && lens.takeaway !== "No signals available for this lens." && (
        <LensDrawerSummaryCard
          title={lens.name}
          body={lens.takeaway}
          metrics={[]}
        />
      )}
    </div>
  );
}
