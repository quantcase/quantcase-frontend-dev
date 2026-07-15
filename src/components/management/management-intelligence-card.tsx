"use client";

import { useState } from "react";
import { Brain, Info, AlertTriangle, Target, Clock, Users, Lightbulb, GitBranch, type LucideIcon } from "lucide-react";
import type {
  ManagementIntelligence,
  MqiScore,
  IntelligenceSignalItem,
  IntelligenceRecommendedStrategy,
} from "@/types/management";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentVars(sentiment: IntelligenceSignalItem["sentiment"]) {
  if (sentiment === "positive") return { color: "var(--qc-up)", bg: "var(--qc-up-soft)", border: "var(--qc-up-soft)" };
  if (sentiment === "negative") return { color: "var(--qc-down)", bg: "var(--qc-down-soft)", border: "var(--qc-down-soft)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "var(--qc-warn-soft)" };
}

function labelVars(label: string) {
  const l = label.toLowerCase();
  if (l === "high" || l === "strong" || l === "good")
    return { tagBg: "rgba(0,0,0,0.14)", tagFg: "var(--qc-ink)", accent: "var(--qc-up)" };
  if (l === "low" || l === "poor" || l === "weak")
    return { tagBg: "rgba(0,0,0,0.14)", tagFg: "var(--qc-ink)", accent: "var(--qc-down)" };
  return { tagBg: "rgba(0,0,0,0.14)", tagFg: "var(--qc-ink)", accent: "var(--qc-warn)" };
}

// ─── Signal Row ───────────────────────────────────────────────────────────────

function SignalRow({ item }: { item: IntelligenceSignalItem }) {
  const [open, setOpen] = useState(false);
  const sv = sentimentVars(item.sentiment);
  const pct = item.max_score > 0 ? (item.score / item.max_score) * 100 : 0;
  const dimLabel = item.label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", cursor: "default" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sv.color, flexShrink: 0 }} />
        <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", width: 120, flexShrink: 0, lineHeight: 1.2 }}>{dimLabel}</span>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(0,0,0,0.10)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: sv.color, transition: "width .4s" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, width: 46, justifyContent: "flex-end", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-mono)", color: sv.color, fontVariantNumeric: "tabular-nums" }}>
            {item.score}
            <span style={{ color: "rgba(58,58,46,0.45)", fontWeight: "var(--qc-w-regular)" }}>/{item.max_score}</span>
          </span>
          <Info style={{ width: 10, height: 10, color: "rgba(58,58,46,0.35)", flexShrink: 0 }} />
        </div>
      </div>

      {/* hover popover */}
      {open && item.details.length > 0 && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 4,
          zIndex: 50, width: 280, borderRadius: 14,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-card, #FFFFFF)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderBottom: "1px solid var(--qc-hair)",
            background: sv.bg, borderRadius: "14px 14px 0 0",
          }}>
            <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{dimLabel}</span>
            <span style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-mono)", color: sv.color }}>{item.score}/{item.max_score}</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {item.details.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sv.color, flexShrink: 0, marginTop: 5 }} />
                <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Strategy Card ────────────────────────────────────────────────────────────

const STRATEGY_CONFIG: { key: keyof IntelligenceRecommendedStrategy; label: string; dot: string; Icon: LucideIcon }[] = [
  { key: "timing",    label: "Timing",    dot: "var(--qc-blue, #3A6BEF)", Icon: Clock },
  { key: "segment",   label: "Segment",   dot: "var(--qc-warn)",          Icon: Users },
  { key: "thesis",    label: "Thesis",    dot: "var(--qc-up)",            Icon: Lightbulb },
  { key: "rationale", label: "Rationale", dot: "var(--qc-down)",          Icon: GitBranch },
];

function StrategyRow({ label, body, dot, Icon }: { label: string; body: string; dot: string; Icon: LucideIcon }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", cursor: "default" }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
          display: "grid", placeItems: "center",
          background: "var(--qc-chip)",
          border: "1px solid var(--qc-hair)",
        }}>
          <Icon style={{ width: 10, height: 10, color: dot }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)",
            color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
            letterSpacing: ".1em", display: "block", marginBottom: 2,
          }}>
            {label}
          </span>
          <p style={{
            margin: 0, fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-medium)",
            fontFamily: "var(--qc-font-sans)",
            color: "var(--qc-ink)", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {body}
          </p>
        </div>
      </div>

      {open && (
        <div style={{
          position: "absolute", left: 0, top: "100%", marginTop: 2,
          zIndex: 50, width: 300, borderRadius: 12,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-card, var(--qc-card))",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}>
          <div style={{
            padding: "8px 12px", borderBottom: "1px solid var(--qc-hair)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Icon style={{ width: 10, height: 10, color: dot, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{label}</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.6 }}>{body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendedStrategyCard({ strategy }: { strategy: IntelligenceRecommendedStrategy }) {
  const rows = STRATEGY_CONFIG
    .map((c) => ({ ...c, body: strategy[c.key] as string | null | undefined }))
    .filter((r) => r.body);

  return (
    <div style={{
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 14,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          padding: 5, borderRadius: 6,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-chip)",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <Target style={{ width: 10, height: 10, color: "var(--qc-ink)" }} />
        </div>
        <div style={{
          fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)",
          letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
        }}>
          Recommended Strategy
        </div>
      </div>

      <p style={{ margin: 0, fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.4, letterSpacing: "var(--qc-track-display)" }}>
        {strategy.action}
      </p>

      {rows.length > 0 && (
        <div style={{ borderTop: "1px solid var(--qc-hair)", display: "flex", flexDirection: "column" }}>
          {rows.map((r, i) => (
            <div key={r.key} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : "none" }}>
              <StrategyRow label={r.label} body={r.body!} dot={r.dot} Icon={r.Icon} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Watchouts ────────────────────────────────────────────────────────────────

function WatchoutsList({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((point, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "6px 0",
          borderBottom: i < items.length - 1 ? "1px solid var(--qc-hair)" : "none",
        }}>
          <span style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", flexShrink: 0, lineHeight: 1.5, userSelect: "none" }}>–</span>
          <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.5 }}>{point}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  intelligence: ManagementIntelligence;
  mqiScore: MqiScore;
}

export function ManagementIntelligenceCard({ intelligence, mqiScore }: Props) {
  const { key_takeaways, signals_breakdown, recommended_strategy, watchouts } = intelligence;
  const theme = labelVars(mqiScore.label);

  return (
    /* ── Outer section card ── */
    <div style={{
      background: "var(--qc-section)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 18,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>

      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 2px" }}>
        <div style={{
          padding: 6, borderRadius: 8, display: "grid", placeItems: "center",
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-chip)",
        }}>
          <Brain style={{ width: 14, height: 14, color: "var(--qc-ink)" }} />
        </div>
        <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", letterSpacing: "0.01em" }}>
          Decision Intelligence
        </span>
      </div>

      {/* ── 1. Score + Signal Breakdown — white bg + lime gradient overlay ── */}
      <div style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* lime gradient overlay at bottom */}
        <div style={{
          position: "absolute", inset: "auto 0 0 0", height: "50%",
          background: "linear-gradient(180deg, transparent 0%, var(--qc-lime) 100%)",
          zIndex: 0, pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Score row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)",
                letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const, marginBottom: 6,
              }}>
                Credibility Score
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{
                  fontSize: "var(--qc-fz-44)", fontWeight: "var(--qc-w-medium)", letterSpacing: "-0.03em",
                  fontFamily: "var(--qc-font-mono)",
                  color: "var(--qc-ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums",
                }}>
                  {mqiScore.total}
                </span>
                <span style={{
                  fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-14)",
                  color: "var(--qc-ink-2)", fontWeight: "var(--qc-w-regular)",
                }}>
                  /100
                </span>
              </div>
            </div>
            <span style={{
              display: "inline-block", borderRadius: 999,
              padding: "4px 11px", fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)",
              fontFamily: "var(--qc-font-sans)",
              background: theme.tagBg, color: theme.tagFg,
              marginTop: 2,
            }}>
              {mqiScore.label}
            </span>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Signal Breakdown rows */}
          <div>
            <div style={{
              fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)",
              letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const, marginBottom: 8,
            }}>
              Signal Breakdown · hover for details
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {signals_breakdown.map((item) => (
                <SignalRow key={item.key} item={item} />
              ))}
            </div>
          </div>

          {/* Key Takeaway inside lime card */}
          {key_takeaways.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--qc-hair)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)",
                  letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
                }}>
                  Key Takeaway
                </div>
                <p style={{ margin: 0, fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.45, letterSpacing: "-0.005em" }}>
                  {key_takeaways[0]}
                </p>
                {key_takeaways.slice(1).map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--qc-hair)", flexShrink: 0, marginTop: 7 }} />
                    <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.55 }}>{t}</p>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── 2. Recommended Strategy ── */}
      {recommended_strategy && (
        <RecommendedStrategyCard strategy={recommended_strategy} />
      )}

      {/* ── 3. Watch Outs ── */}
      {watchouts.length > 0 && (
        <div style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle style={{ width: 11, height: 11, color: "var(--qc-ink-2)" }} />
            <div style={{
              fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)",
              letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
            }}>
              Watch Outs
            </div>
          </div>
          <WatchoutsList items={watchouts} />
        </div>
      )}

    </div>
  );
}
