"use client";

import { Brain, AlertTriangle, Zap } from "lucide-react";
import type { FundamentalsIntelligence } from "@/types/financials";
import { SignalCard } from "@/components/overview/signal-card";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function convictionConfig(level: string) {
  const l = level.toLowerCase();
  if (l === "high") return { color: "var(--qc-up)", barColor: "var(--qc-up)", width: "100%" };
  if (l === "medium") return { color: "var(--qc-warn)", barColor: "var(--qc-warn)", width: "66%" };
  return { color: "var(--qc-down)", barColor: "var(--qc-down)", width: "33%" };
}

const SIGNAL_METRIC_HINTS: Record<string, string[]> = {
  growth: ["Revenue Growth", "Profit Growth"],
  valuation: ["P/E", "P/B"],
  balanceSheet: ["Debt-to-Equity"],
  profitability: ["Operating Margin", "ROE"],
  cashConversion: ["Cash from Operations"],
};

const SIGNAL_LABELS: Record<string, string> = {
  growth: "Growth",
  valuation: "Valuation",
  balanceSheet: "Balance Sheet",
  profitability: "Profitability",
  cashConversion: "Cash Conversion",
};

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  fi: FundamentalsIntelligence;
}

export function FundamentalsIntelligenceBanner({ fi }: Props) {
  const conviction = convictionConfig(fi.convictionLevel);

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

      {/* Header */}
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

      {/* ── 1. Grade + Tag + Actionable Insight ── */}
      <div style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: "auto 0 0 0", height: "50%",
          background: "linear-gradient(180deg, transparent 0%, var(--qc-lime) 100%)",
          zIndex: 0, pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Tag + Grade row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const, marginBottom: 6,
              }}>
                Tag
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--qc-ink)", lineHeight: 1.3 }}>
                {fi.tag}
              </p>
            </div>
            <div style={{
              padding: "4px 10px",
              background: "var(--qc-ink)",
              borderRadius: 999,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
                {fi.fundamentalGrade}
              </span>
            </div>
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
              {fi.actionableInsight.action}
            </p>
            {fi.actionableInsight.rationale && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>
                {fi.actionableInsight.rationale}
              </p>
            )}
          </div>

          {/* Bias */}
          {fi.actionBias && (
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
                  {fi.actionBias}
                </p>
                {fi.actionableInsight.existingHolderAction && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>
                    {fi.actionableInsight.existingHolderAction}
                  </p>
                )}
                {fi.actionableInsight.reEvaluateCondition && (
                  <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
                    Re-evaluate: {fi.actionableInsight.reEvaluateCondition}
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
            Signal Breakdown
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(fi.signals).map(([key, value]) => {
            const hints = SIGNAL_METRIC_HINTS[key] ?? [];
            const allMetrics = fi.keyMetricsSummary ?? [];
            const relatedMetrics = allMetrics.filter((m) =>
              hints.some((h) => m.name.toLowerCase().includes(h.toLowerCase()))
            );
            return (
              <SignalCard
                key={key}
                label={SIGNAL_LABELS[key] ?? key}
                value={value}
                metrics={relatedMetrics}
              />
            );
          })}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: conviction.color }}>{fi.convictionLevel}</span>
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

      {/* ── 3. Risk Alerts + What Can Change ── */}
      {(fi.riskAlerts.length > 0 || fi.whatCanChange.length > 0) && (
        <div style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {fi.riskAlerts.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle style={{ width: 11, height: 11, color: "var(--qc-ink-2)" }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
                }}>
                  Risk Alerts
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {fi.riskAlerts.map((alert, i) => (
                  <span key={i} style={{
                    padding: "3px 8px",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 4,
                    background: "var(--qc-down-soft)",
                    color: "var(--qc-down)",
                    border: "1px solid rgba(178, 58, 47, 0.20)",
                  }}>
                    {alert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fi.whatCanChange.length > 0 && (
            <>
              {fi.riskAlerts.length > 0 && <div style={{ height: 1, background: "var(--qc-hair)" }} />}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  letterSpacing: ".16em", color: "var(--qc-ink-2)", textTransform: "uppercase" as const,
                }}>
                  What Can Change
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {fi.whatCanChange.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "5px 0",
                      borderBottom: i < fi.whatCanChange.length - 1 ? "1px solid var(--qc-hair)" : "none",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--qc-ink-2)", flexShrink: 0, marginTop: 5 }} />
                      <p style={{ margin: 0, fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.55 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
