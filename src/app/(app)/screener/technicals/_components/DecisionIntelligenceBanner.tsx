"use client";

import { useState } from "react";
import { Brain, Info, AlertTriangle, Zap } from "lucide-react";
import type { DecisionIntelligence, DecisionIntelligenceIndicator } from "@/types/technicals";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentVars(sentiment: DecisionIntelligenceIndicator["sentiment"]) {
  if (sentiment === "positive") return { color: "var(--qc-up)", bg: "var(--qc-up-soft)", border: "rgba(31, 122, 74, 0.25)" };
  if (sentiment === "negative") return { color: "var(--qc-down)", bg: "var(--qc-down-soft)", border: "rgba(178, 58, 47, 0.25)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "rgba(180, 115, 26, 0.25)" };
}

function convictionConfig(level: string) {
  const l = level.toLowerCase();
  if (l === "high") return { color: "var(--qc-up)", barColor: "var(--qc-up)", width: "100%" };
  if (l === "medium") return { color: "var(--qc-warn)", barColor: "var(--qc-warn)", width: "66%" };
  return { color: "var(--qc-down)", barColor: "var(--qc-down)", width: "33%" };
}

// ─── Signal Bucket (2-col colored tile grid) ──────────────────────────────────

function SignalBucket({
  indicator,
}: {
  indicator: DecisionIntelligenceIndicator;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const sc = sentimentVars(indicator.sentiment);
  const watchout = indicator.growthWatchout || indicator.valueWatchout;

  return (
    <div
      className="relative rounded-[8px] border px-3 py-2.5"
      style={{ borderColor: sc.border, background: sc.bg }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-ink-2)" }}>{indicator.name}</p>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info className="h-3 w-3 cursor-help" style={{ color: "var(--qc-ink-2)" }} />
          {showTooltip && (
            <div
              className="absolute bottom-full right-0 mb-1.5 z-50 w-56 rounded-[10px] border shadow-lg overflow-hidden"
              style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
            >
              <div style={{
                padding: "8px 12px", borderBottom: "1px solid var(--qc-hair)",
                background: sc.bg,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)" }}>{indicator.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: sc.color }}>{indicator.tag}</span>
              </div>
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>{indicator.explanation}</p>
                {watchout && (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink-2)", lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 600 }}>Watchout: </span>{watchout}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-[12px] font-semibold" style={{ color: sc.color }}>{indicator.tag}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  di: DecisionIntelligence;
}

export function DecisionIntelligenceBanner({ di }: Props) {
  const conviction = convictionConfig(di.convictionLevel);

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

      {/* ── 1. Score card (Tag + meta + actionable insight) ── */}
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

        <div style={{ position: "relative", zIndex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Tag row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.3 }}>
                {di.tag}
              </p>
            </div>
          </div>

          {/* Lens / Ideal For / Timeframe — compact inline grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
          }}>
            {[
              { label: "Lens", value: di.lens },
              { label: "Ideal For", value: di.idealFor },
              { label: "Timeframe", value: di.timeframe },
            ].map((item) => (
              <div key={item.label} style={{
                background: "var(--qc-section)",
                border: "1px solid var(--qc-hair)",
                borderRadius: 8,
                padding: "6px 8px",
              }}>
                <p style={{
                  margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
                  letterSpacing: ".1em", marginBottom: 3,
                }}>
                  {item.label}
                </p>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.3 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: "var(--qc-hair)" }} />

          {/* Actionable Insight */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
            }}>
              Actionable Insight
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", lineHeight: 1.45, letterSpacing: "-0.005em" }}>
              {di.actionableInsight.action}
            </p>
            {di.actionableInsight.firstShift && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>
                {di.actionableInsight.firstShift}
              </p>
            )}
          </div>

          {/* Bias */}
          {di.actionBias && (
            <>
              <div style={{ height: 1, background: "var(--qc-hair)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
                }}>
                  Bias
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>
                  {di.actionBias}
                </p>
                {di.actionableInsight.existingHolderAction && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>
                    {di.actionableInsight.existingHolderAction}
                  </p>
                )}
                {di.actionableInsight.reEvaluateCondition && (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
                    Re-evaluate: {di.actionableInsight.reEvaluateCondition}
                  </p>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── 2. Signal Breakdown ── */}
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
          <Zap style={{ width: 11, height: 11, color: "var(--qc-ink-2)" }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
          }}>
            Signal Breakdown · hover for details
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {di.indicators.map((ind) => (
            <SignalBucket key={ind.name} indicator={ind} />
          ))}
        </div>

        {/* Conviction Meter */}
        <div style={{ borderTop: "1px solid var(--qc-hair)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
            }}>
              Conviction
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: conviction.color }}>{di.convictionLevel}</span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: "rgba(0,0,0,0.10)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, width: conviction.width, background: conviction.barColor, transition: "width .4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {["Low", "Medium", "High"].map((l) => (
              <span key={l} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "var(--qc-ink-2)" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Current Regime ── */}
      {di.currentRegime && (
        <div style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
          }}>
            Current Regime
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.3 }}>
            {di.currentRegime.label}
          </p>
          {di.currentRegime.description && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>
              {di.currentRegime.description}
            </p>
          )}
        </div>
      )}

      {/* ── 4. Risk Alerts + What Can Change ── */}
      {(di.riskAlerts.length > 0 || di.whatCanChange.length > 0) && (
        <div style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>

          {di.whatCanChange.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
              }}>
                What Can Change
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {di.whatCanChange.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "5px 0",
                    borderBottom: i < di.whatCanChange.length - 1 ? "1px solid var(--qc-hair)" : "none",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--qc-ink-2)", flexShrink: 0, marginTop: 5 }} />
                    <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
