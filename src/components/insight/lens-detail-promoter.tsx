"use client";

import { useState } from "react";
import type { LensDetail, TopSignal, Pattern } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPeriod(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function patternTypeConfig(type: string | undefined, direction: string | undefined) {
  const d = (direction ?? "").toLowerCase();
  const t = (type ?? "").toLowerCase();
  const isPositive = d === "positive";
  const isNegative = d === "negative";
  const isWatch = d === "watch";
  const isNeutral = d === "neutral";
  const color = isPositive ? "var(--qc-up)" : isNegative ? "var(--qc-down)" : isWatch ? "var(--qc-warn)" : "var(--qc-ink-3)";
  const bg = isPositive ? "rgba(31,122,74,0.10)" : isNegative ? "rgba(220,38,38,0.10)" : isWatch ? "rgba(180,115,26,0.10)" : "rgba(120,120,120,0.10)";
  const border = isPositive ? "rgba(31,122,74,0.28)" : isNegative ? "rgba(220,38,38,0.28)" : isWatch ? "rgba(180,115,26,0.28)" : "rgba(120,120,120,0.20)";
  const labelMap: Record<string, string> = {
    ownership_structure: "STRUCTURAL",
    insider_participation: "RISING",
    equity_discipline: "STEADY",
    institutional_quality: "RISING",
    pledge_risk: isNeutral ? "N/A" : "WATCH",
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

// ── Row icon for timeline ─────────────────────────────────────────────────────

function rowIconConfig(direction: string | null): { icon: string; bg: string; color: string } {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { icon: "✓", bg: "rgba(22,163,74,0.12)", color: "#16a34a" };
  if (d === "miss") return { icon: "✕", bg: "rgba(220,38,38,0.12)", color: "#dc2626" };
  if (d === "in_line" || d === "tracking") return { icon: "—", bg: "rgba(18,18,18,0.06)", color: "#888888" };
  return { icon: "!", bg: "rgba(217,119,6,0.12)", color: "#d97706" };
}

// ── QC Intuition patterns table ───────────────────────────────────────────────

function PromoterPatternTable({ patterns, signalCount, description }: { patterns: Pattern[]; signalCount: number; description: string }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const patternCallSentence =
    patterns.find((p) => p.direction === "watch")?.sentence
    ?? patterns.find((p) => p.direction === "positive")?.sentence
    ?? patterns[0]?.sentence
    ?? "Patterns extracted from ownership and governance signal analysis.";

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
          What ownership signals reveal about conviction
        </h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.55 }}>
          {description || "Ownership and insider activity patterns across earnings calls, annual reports & investor decks."}
        </p>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 140px 120px 1fr",
        background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", padding: "0 24px",
      }}>
        {["PATTERN", "SIGNAL TREND", "STATUS", "WHAT IT MEANS FOR OWNERSHIP CONVICTION"].map((h, i) => (
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
          const confidencePct = p.confidence > 0 ? Math.round(p.confidence * 100) : null;

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
                          {formatPeriod(ev.period)}
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

// ── Sources bar ───────────────────────────────────────────────────────────────

function SourcesBar({ patterns, topSignals }: { patterns: Pattern[]; topSignals: TopSignal[] }) {
  // Collect distinct source refs
  const sources = new Set<string>();
  [...patterns, ...topSignals].forEach((s) => {
    if (s.source_ref) sources.add(s.source_ref);
  });
  const sourceList = Array.from(sources).filter(Boolean).slice(0, 5);

  // Date range from first/last actual_date in signals
  const dates = topSignals
    .map((s) => s.actual_date)
    .filter(Boolean)
    .sort() as string[];
  const dateRange = dates.length >= 2
    ? `${formatPeriod(dates[0])} → ${formatPeriod(dates[dates.length - 1])}`
    : dates.length === 1 ? formatPeriod(dates[0]) : null;

  if (sourceList.length === 0) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0,
      border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden",
      background: "var(--qc-section)",
    }}>
      <div style={{ padding: "10px 16px", borderRight: "1px solid var(--qc-hair)", flexShrink: 0 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
          SOURCES
        </p>
      </div>
      {sourceList.map((src, i) => (
        <div key={i} style={{
          padding: "10px 14px",
          borderRight: i < sourceList.length - 1 ? "1px solid var(--qc-hair)" : undefined,
        }}>
          <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>{src}</span>
        </div>
      ))}
      {dateRange && (
        <div style={{ padding: "10px 14px", marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>{dateRange}</span>
        </div>
      )}
    </div>
  );
}

// ── Shareholding timeline ─────────────────────────────────────────────────────

function ShareholdingTimeline({ topSignals, metaStake, metaPledge }: {
  topSignals: TopSignal[];
  metaStake: TopSignal | undefined;
  metaPledge: TopSignal | undefined;
}) {
  // Build timeline rows from PROMOTER_INSIGHT and OWNERSHIP_STRUCTURE signals that have actual_date
  const rows = topSignals
    .filter((s) => ["PROMOTER_INSIGHT", "OWNERSHIP_STRUCTURE"].includes(s.metric) && s.actual_date)
    .sort((a, b) => (a.actual_date ?? "").localeCompare(b.actual_date ?? ""));

  if (rows.length === 0) return null;

  const stakeValue = metaStake?.actual_value != null && metaStake.actual_value !== -1
    ? metaStake.actual_value
    : 0;
  const pledgeValue = metaPledge?.actual_value != null && metaPledge.actual_value !== -1
    ? metaPledge.actual_value
    : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
          PROMOTER ACTIVITY · SHAREHOLDING TIMELINE
        </p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>
          Promoter shareholding trends, pledging, and insider confidence signals
        </p>
      </div>

      <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>
        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "110px 120px 140px 80px 1fr",
          padding: "8px 20px", borderBottom: "1px solid var(--qc-hair)",
          background: "var(--qc-section)",
        }}>
          {["PERIOD", "STAKE", "PLEDGE", "CHANGE", "SIGNAL"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {rows.map((s, i) => {
          const isLast = i === rows.length - 1;
          const icon = rowIconConfig(s.direction);
          return (
            <div key={s.signal_id ?? i} style={{
              display: "grid", gridTemplateColumns: "110px 120px 140px 80px 1fr",
              padding: "13px 20px",
              borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
              alignItems: "center", background: "var(--qc-card)",
            }}>
              {/* Period */}
              <span style={{ fontSize: 12, color: "var(--qc-ink-3)", fontWeight: 500 }}>
                {formatPeriod(s.actual_date)}
              </span>

              {/* Stake */}
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>
                {stakeValue.toFixed(2)}%
              </span>

              {/* Pledge */}
              <span style={{ fontSize: 12, color: "var(--qc-ink-3)", fontVariantNumeric: "tabular-nums" }}>
                {pledgeValue.toFixed(2)}% pledge
              </span>

              {/* Change badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 600, color: "var(--qc-ink-3)",
                background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap",
              }}>
                — flat
              </span>

              {/* Icon + statement */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  background: icon.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: icon.color,
                }}>
                  {icon.icon}
                </span>
                <span style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.4 }}>
                  {s.statement}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Insight cards ─────────────────────────────────────────────────────────────

const INSIGHT_SLOTS = [
  { label: "STABILITY",      dotColor: "var(--qc-up)"   },
  { label: "PENDING EVENT",  dotColor: "var(--qc-warn)" },
  { label: "INSIDER SIGNAL", dotColor: "var(--qc-up)"   },
];

function insightBorderColor(direction: string | null): string {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return "var(--qc-up)";
  if (d === "miss") return "var(--qc-down)";
  if (d === "in_line") return "var(--qc-ink-3)";
  return "var(--qc-warn)";
}

function InsightCards({ signals }: { signals: TopSignal[] }) {
  if (signals.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(signals.length, 3)}, 1fr)`, gap: 0, border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>
      {signals.slice(0, 3).map((s, i) => {
        const slot = INSIGHT_SLOTS[i] ?? INSIGHT_SLOTS[0];
        const borderColor = insightBorderColor(s.direction);
        return (
          <div key={i} style={{
            padding: "18px 20px",
            background: "var(--qc-card)",
            borderRight: i < Math.min(signals.length, 3) - 1 ? "1px solid var(--qc-hair)" : undefined,
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: slot.dotColor, flexShrink: 0 }} />
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
                {slot.label}
              </p>
            </div>
            <p style={{
              fontSize: 20, fontWeight: 700, color: borderColor,
              margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em",
            }}>
              {s.label}
            </p>
            {s.statement && (
              <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
                {s.statement}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LensDetailPromoter({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];
  const patterns: Pattern[] = lens.patterns ?? [];

  const metaStake    = topSignals.find((s) => s.metric === "META_CURRENT_STAKE");
  const metaPledge   = topSignals.find((s) => s.metric === "META_PLEDGE_PCT");
  const insightCards = topSignals.filter((s) => s.metric === "PROMOTER_INSIGHT");

  const hasData = patterns.length > 0 || topSignals.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Empty state ── */}
      {!hasData && (
        <div style={{
          padding: "32px 24px", border: "1px solid var(--qc-hair)", borderRadius: 10,
          background: "var(--qc-section)", textAlign: "center",
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink-2)", margin: "0 0 6px" }}>
            Promoter signal data not yet computed
          </p>
          <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0 }}>
            Shareholding timeline and pattern analysis will appear once signals are processed for this ticker.
          </p>
        </div>
      )}

      {/* ── QC Intuition patterns table ── */}
      {patterns.length > 0 && (
        <PromoterPatternTable
          patterns={patterns}
          signalCount={lens.signal_count ?? 0}
          description={lens.description ?? ""}
        />
      )}

      {/* ── Sources bar ── */}
      {hasData && <SourcesBar patterns={patterns} topSignals={topSignals} />}

      {/* ── Shareholding timeline ── */}
      {topSignals.length > 0 && (
        <ShareholdingTimeline
          topSignals={topSignals}
          metaStake={metaStake}
          metaPledge={metaPledge}
        />
      )}

      {/* ── Insight cards ── */}
      {insightCards.length > 0 && (
        <InsightCards signals={insightCards} />
      )}

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
