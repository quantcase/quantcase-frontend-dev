"use client";

import { useState } from "react";
import type { LensDetail, Pattern } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

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
    deployment_discipline: "STEADY",
    returns_on_capital: "RISING",
    conviction_accountability_gap: "WATCH",
    shareholder_return_discipline: "RISING",
    ma_allocation_quality: "NEUTRAL",
    cfo_capex_self_funding: "STEADY",
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

// ── Headline tiles ────────────────────────────────────────────────────────────

const HEADLINE_SLOTS = [
  { key: "strength", label: "STRENGTH", color: "var(--qc-up)",   dot: "var(--qc-up)",   bg: "rgba(31,122,74,0.06)"  },
  { key: "tension",  label: "TENSION",  color: "var(--qc-warn)", dot: "var(--qc-warn)", bg: "rgba(180,115,26,0.06)" },
  { key: "risk",     label: "RISK",     color: "var(--qc-down)", dot: "var(--qc-down)", bg: "rgba(220,38,38,0.06)"  },
];

// ── Pattern table ─────────────────────────────────────────────────────────────

function CapitalPatternTable({ patterns, signalCount }: { patterns: Pattern[]; signalCount: number }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Derive a sentence for the pattern call footer
  const patternCallSentence =
    patterns.find((p) => p.direction === "watch")?.sentence ??
    patterns[0]?.sentence ??
    "Patterns extracted from multi-period capital allocation analysis.";

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
              {signalCount.toLocaleString()}
            </p>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "3px 0 0" }}>
              signals parsed
            </p>
          </div>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#ffffff", margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          What the capital allocation signals reveal
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.55 }}>
          Capital allocation patterns extracted from <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>earnings calls, annual reports &amp; investor decks</strong>.{" "}
          Each pattern tracks how management&apos;s emphasis and accountability language shifts —{" "}
          surfacing <strong style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>where conviction is real versus where it is aspirational</strong>.
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 140px 120px 1fr",
        background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", padding: "0 24px",
      }}>
        {["PATTERN", "SIGNAL TREND", "STATUS", "WHAT IT MEANS FOR CAPITAL ALLOCATION"].map((h, i) => (
          <div key={h} style={{ padding: "8px 0", paddingRight: i < 3 ? 12 : 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--qc-ink-3)" }}>{h}</span>
          </div>
        ))}
      </div>

      {/* Rows */}
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
                  display: "grid", gridTemplateColumns: "1fr 140px 120px 1fr",
                  padding: "16px 24px",
                  borderBottom: !isLast || isExpanded ? "1px solid var(--qc-hair)" : undefined,
                  cursor: "pointer", transition: "background 0.15s",
                  background: isExpanded ? "var(--qc-section)" : "var(--qc-card)",
                  alignItems: "start",
                }}
                onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "var(--qc-section)"; }}
                onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "var(--qc-card)"; }}
              >
                {/* Pattern label + sub */}
                <div style={{ paddingRight: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: "0 0 3px", lineHeight: 1.3 }}>{p.label}</p>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                    {p.sentence ? p.sentence.slice(0, 55) + (p.sentence.length > 55 ? "…" : "") : ""}
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

                {/* Sentence */}
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
                          color: "var(--qc-ink-3)", whiteSpace: "nowrap", minWidth: 60,
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

      {/* Pattern call footer */}
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
          {patternCallSentence}
        </p>
      </div>
    </div>
  );
}

// ── Analysis section ──────────────────────────────────────────────────────────

function AnalysisSection({ takeaway, highlights, risks, sourceRef, computedAt }: {
  takeaway: string | null;
  highlights: string[];
  risks: string[];
  sourceRef: string | null;
  computedAt: string | null;
}) {
  // Format date from computedAt
  let periodLabel = "";
  if (computedAt) {
    const d = new Date(computedAt);
    if (!isNaN(d.getTime())) {
      const q = Math.ceil((d.getMonth() + 1) / 3);
      const fy = d.getMonth() < 3 ? d.getFullYear() : d.getFullYear() + 1;
      periodLabel = `FY${String(fy).slice(2)} · Q${q} signals`;
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          ANALYSIS
        </p>
        {periodLabel && (
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{periodLabel}</p>
        )}
      </div>

      {/* Verdict card */}
      {takeaway && (
        <div style={{
          padding: "20px 24px",
          border: "1px solid var(--qc-hair)", borderRadius: 10,
          marginBottom: 10, background: "var(--qc-card)",
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 10px" }}>
            VERDICT
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--qc-ink)", margin: 0, lineHeight: 1.45, letterSpacing: "-0.01em" }}>
            {takeaway}
          </p>
        </div>
      )}

      {/* Core signals + Trajectory 2-col */}
      {(highlights.length > 0 || risks.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {highlights.length > 0 && (
            <div style={{ padding: "18px 20px", border: "1px solid var(--qc-hair)", borderRadius: 10, background: "var(--qc-card)" }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 14px" }}>
                CORE SIGNALS
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {highlights.map((h, i) => {
                  const parts = h.split(". ");
                  const title = parts[0];
                  const body = parts.slice(1).join(". ");
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "var(--qc-up)", flexShrink: 0, marginTop: 5,
                      }} />
                      <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                        <strong style={{ color: "var(--qc-ink)", fontWeight: 700 }}>{title}{body ? "." : ""}</strong>
                        {body ? ` ${body}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {risks.length > 0 && (
            <div style={{ padding: "18px 20px", border: "1px solid var(--qc-hair)", borderRadius: 10, background: "var(--qc-card)" }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 14px" }}>
                TRAJECTORY
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {risks.map((r, i) => {
                  const parts = r.split(". ");
                  const title = parts[0];
                  const body = parts.slice(1).join(". ");
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "var(--qc-warn)", flexShrink: 0, marginTop: 5,
                      }} />
                      <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                        <strong style={{ color: "var(--qc-ink)", fontWeight: 700 }}>{title}{body ? "." : ""}</strong>
                        {body ? ` ${body}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Watching section ──────────────────────────────────────────────────────────

function WatchingSection({ risks }: { risks: string[] }) {
  if (!risks || risks.length === 0) return null;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          WATCHING
        </p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>Unresolved tensions — next quarters</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(risks.length, 3)}, 1fr)`, gap: 10 }}>
        {risks.map((risk, i) => {
          const dashIdx = risk.indexOf(": ");
          const title = dashIdx !== -1 ? risk.slice(0, dashIdx) : risk;
          const body = dashIdx !== -1 ? risk.slice(dashIdx + 2) : "";
          return (
            <div key={i} style={{
              padding: "16px 18px",
              background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
              borderLeft: "3px solid var(--qc-warn)",
              borderRadius: 10, display: "flex", flexDirection: "column", gap: 6,
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

export function LensDetailCapital({ lens }: Props) {
  const patterns = lens.patterns ?? [];
  const highlights = lens.highlights ?? [];
  const risks = lens.risks ?? [];

  // Derive sources from the patterns with the richest source_ref
  const sourcePatterns = patterns.filter((p) => p.source_ref);
  const latestSource = sourcePatterns[sourcePatterns.length - 1]?.source_ref ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Headline 3-col strip ── */}
      {highlights.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              HEADLINE
            </p>
            {latestSource && (
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{latestSource} · Earnings calls, Annual Report &amp; Investor Decks</p>
            )}
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: `repeat(${Math.min(highlights.length, 3)}, 1fr)`,
            borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden",
          }}>
            {highlights.slice(0, 3).map((h, i) => {
              const slot = HEADLINE_SLOTS[i];
              // First sentence is the "value" headline, rest is sub-text
              const dotIdx = h.indexOf(";");
              const title = dotIdx !== -1 ? h.slice(0, dotIdx).trim() : h;
              const sub = dotIdx !== -1 ? h.slice(dotIdx + 1).trim() : "";
              return (
                <div key={i} style={{
                  padding: "18px 16px", background: slot.bg,
                  borderRight: i < Math.min(highlights.length, 3) - 1 ? "1px solid var(--qc-hair)" : undefined,
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: slot.dot, flexShrink: 0 }} />
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
                      {slot.label}
                    </p>
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: slot.color, margin: "2px 0 0", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                    {title}
                  </p>
                  {sub && (
                    <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{sub}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── QC Intuition patterns table ── */}
      {patterns.length > 0 && (
        <CapitalPatternTable patterns={patterns} signalCount={lens.signal_count ?? 0} />
      )}

      {/* ── Sources bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden",
        background: "var(--qc-section)",
      }}>
        <div style={{ padding: "10px 16px", borderRight: "1px solid var(--qc-hair)", flexShrink: 0 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
            SOURCES
          </p>
        </div>
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {sourcePatterns.slice(0, 4).map((p, i) => (
            <span key={i} style={{
              fontSize: 11, color: "var(--qc-ink-2)",
              paddingRight: i < Math.min(sourcePatterns.length, 4) - 1 ? 16 : 0,
              borderRight: i < Math.min(sourcePatterns.length, 4) - 1 ? "1px solid var(--qc-hair)" : undefined,
            }}>
              {p.source_ref}
            </span>
          ))}
        </div>
      </div>

      {/* ── Analysis section ── */}
      <AnalysisSection
        takeaway={lens.takeaway ?? null}
        highlights={highlights}
        risks={risks}
        sourceRef={latestSource}
        computedAt={lens.computed_at ?? null}
      />

      {/* ── Watching section ── */}
      <WatchingSection risks={risks} />

      {/* ── Takeaway ── */}
      {lens.takeaway && (
        <LensDrawerSummaryCard
          title={lens.name}
          body={lens.takeaway}
          metrics={[]}
        />
      )}
    </div>
  );
}
