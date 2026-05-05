"use client";

import { useState } from "react";
import { Brain, Info, AlertTriangle, Target, Clock, Users, Lightbulb, GitBranch, type LucideIcon } from "lucide-react";
import type { DealIntelligence, DealIntelligenceSignal, DealRecommendedStrategy, DealWatchout } from "@/types/deal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentVars(sentiment: DealIntelligenceSignal["sentiment"]) {
  if (sentiment === "positive") return { color: "var(--qc-up)", bg: "var(--qc-up-soft)", border: "#BBD9C6" };
  if (sentiment === "negative") return { color: "var(--qc-down)", bg: "var(--qc-down-soft)", border: "#F0C0BB" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "#E8D4A0" };
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

function SignalRow({ item }: { item: DealIntelligenceSignal }) {
  const [open, setOpen] = useState(false);
  const sv = sentimentVars(item.sentiment);
  const pct = item.max_score > 0 ? (item.score / item.max_score) * 100 : 0;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", cursor: "default" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sv.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--qc-ink)", width: 130, flexShrink: 0, lineHeight: 1.2 }}>{item.label}</span>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(0,0,0,0.10)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: sv.color, transition: "width .4s" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, width: 56, justifyContent: "flex-end", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: sv.color, fontVariantNumeric: "tabular-nums" }}>
            {item.score}
            <span style={{ color: "rgba(58,58,46,0.45)", fontWeight: 400 }}>/{item.max_score}</span>
          </span>
          <Info style={{ width: 10, height: 10, color: "rgba(58,58,46,0.35)", flexShrink: 0 }} />
        </div>
      </div>

      {open && item.details.length > 0 && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 4,
          zIndex: 50, width: 290, borderRadius: 14,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-card, #FFFFFF)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderBottom: "1px solid var(--qc-hair)",
            background: sv.bg, borderRadius: "14px 14px 0 0",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{item.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: sv.color }}>{item.score}/{item.max_score}</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {item.details.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sv.color, flexShrink: 0, marginTop: 5 }} />
                <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Strategy Card ────────────────────────────────────────────────────────────

const STRATEGY_CONFIG: { key: keyof DealRecommendedStrategy; label: string; dot: string; Icon: LucideIcon }[] = [
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
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
            color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
            letterSpacing: ".1em", display: "block", marginBottom: 2,
          }}>
            {label}
          </span>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 500,
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)" }}>{label}</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.6 }}>{body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendedStrategyCard({ strategy }: { strategy: DealRecommendedStrategy }) {
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
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
        }}>
          Recommended Strategy
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
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

function WatchoutsList({ items }: { items: DealWatchout[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "8px 0",
          borderBottom: i < items.length - 1 ? "1px solid var(--qc-hair)" : "none",
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--qc-down)", flexShrink: 0, marginTop: 5,
          }} />
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.4, display: "block" }}>
              {item.title}
            </span>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--qc-ink)", lineHeight: 1.5 }}>
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DealIntelligenceCard({ intelligence }: { intelligence: DealIntelligence }) {
  const { deal_score, key_takeaways, recommended_strategy, watchouts } = intelligence;
  const theme = labelVars(deal_score.label);

  return (
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
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", letterSpacing: "0.01em" }}>
          Decision Intelligence
        </span>
      </div>

      {/* ── 1. Score + Signal Breakdown ── */}
      <div style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* lime gradient overlay */}
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
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const, marginBottom: 6,
              }}>
                Deal Score
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{
                  fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em",
                  color: "var(--qc-ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums",
                }}>
                  {Math.round(deal_score.total)}
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 15,
                  color: "var(--qc-ink-2)", fontWeight: 400,
                }}>
                  /100
                </span>
              </div>
            </div>
            <span style={{
              display: "inline-block", borderRadius: 999,
              padding: "4px 11px", fontSize: 11, fontWeight: 600,
              background: theme.tagBg, color: theme.tagFg,
              marginTop: 2,
            }}>
              {deal_score.label}
            </span>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Signal Breakdown rows */}
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const, marginBottom: 8,
            }}>
              Signal Breakdown · hover for details
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {deal_score.signals_breakdown.map((item) => (
                <SignalRow key={item.key} item={item} />
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          {key_takeaways.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--qc-hair)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
                }}>
                  Key Takeaway
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1.45, letterSpacing: "-0.005em" }}>
                  {key_takeaways[0]}
                </p>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── 2. Recommended Strategy ── */}
      <RecommendedStrategyCard strategy={recommended_strategy} />

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
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
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
