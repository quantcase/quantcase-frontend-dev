"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

function rowIcon(direction: string | null): { icon: string; bg: string; color: string } {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { icon: "✓", bg: "rgba(22,163,74,0.12)", color: "#16a34a" };
  if (d === "miss") return { icon: "✕", bg: "rgba(220,38,38,0.12)", color: "#dc2626" };
  // in_line, tracking, etc → neutral grey pill
  return { icon: "—", bg: "rgba(18,18,18,0.07)", color: "#888888" };
}

function insightBorderColor(direction: string | null): string {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return "#16a34a";
  if (d === "miss") return "#dc2626";
  return "#d97706"; // amber for tracking/neutral
}

function insightIconStyle(direction: string | null): { bg: string; color: string; icon: string } {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { bg: "rgba(22,163,74,0.12)", color: "#16a34a", icon: "✓" };
  if (d === "miss") return { bg: "rgba(220,38,38,0.12)", color: "#dc2626", icon: "✕" };
  return { bg: "rgba(217,119,6,0.12)", color: "#d97706", icon: "●" };
}

function formatDelta(delta: number | null | undefined): { text: string; color: string } {
  if (delta == null) return { text: "—", color: "#888888" };
  if (delta === 0) return { text: "flat", color: "#888888" };
  const text = delta > 0 ? `+${delta.toFixed(1)} pp` : `${delta.toFixed(1)} pp`;
  return { text, color: delta > 0 ? "#16a34a" : "#dc2626" };
}

export function LensDetailPromoter({ lens, signals: _signals }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const stakeRows = topSignals.filter(
    (s) => s.metric === "PROMOTER_STAKE" && !s.label?.startsWith("META_")
  );
  const insightCards = topSignals.filter((s) => s.metric === "PROMOTER_INSIGHT");

  // META signals for pledge column and header context
  const metaPledge = topSignals.find((s) => s.label === "META_PLEDGE_PCT");
  const metaVerdict = topSignals.find((s) => s.label === "META_VERDICT");
  const globalPledge = metaPledge?.actual_value ?? 0;

  const subtitle = lens.description ?? metaVerdict?.statement ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Section header */}
      <div>
        <p style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 4px",
        }}>
          PROMOTER ACTIVITY · {lens.name.toUpperCase()}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Stake timeline table */}
      {stakeRows.length > 0 && (
        <div style={{
          borderRadius: 10,
          border: "1px solid var(--qc-hair)",
          overflow: "hidden",
          background: "var(--qc-card)",
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "100px 110px 120px 72px 1fr",
            alignItems: "center",
            padding: "8px 20px",
            borderBottom: "1px solid var(--qc-hair)",
            background: "var(--qc-surface, #F5F5F5)",
            gap: 0,
          }}>
            {["Period", "Stake", "Pledge", "Change", "Signal"].map((h) => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 500, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "#888888",
              }}>
                {h}
              </span>
            ))}
          </div>
          {stakeRows.map((s, i) => {
            const isLast = i === stakeRows.length - 1;
            const pledgePct = s.guided_value != null ? s.guided_value : globalPledge;
            const delta = formatDelta(s.delta ?? s.delta_pct);
            const icon = rowIcon(s.direction ?? null);

            return (
              <div
                key={s.signal_id ?? i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 110px 120px 72px 1fr",
                  alignItems: "center",
                  padding: "13px 20px",
                  borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  gap: 0,
                }}
              >
                {/* Date */}
                <span style={{
                  fontSize: 12, color: "var(--qc-ink-3)", fontWeight: 500,
                }}>
                  {s.label ?? "—"}
                </span>

                {/* Stake % */}
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "var(--qc-ink)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {s.actual_value != null ? `${s.actual_value}%` : "—"}
                </span>

                {/* Pledge % */}
                <span style={{
                  fontSize: 12, color: "var(--qc-ink-3)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {`${pledgePct.toFixed(2)}% pledge`}
                </span>

                {/* Delta */}
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: delta.color,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {delta.text}
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
                  <span style={{
                    fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.4,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {s.statement}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insight cards */}
      {insightCards.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}>
          {insightCards.map((s, i) => {
            const borderColor = insightBorderColor(s.direction ?? null);
            const iconStyle = insightIconStyle(s.direction ?? null);
            return (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  background: "var(--qc-card)",
                  border: "1px solid var(--qc-hair)",
                  borderLeft: `3px solid ${borderColor}`,
                  borderRadius: 8,
                  display: "flex", flexDirection: "column", gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    background: iconStyle.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: iconStyle.color,
                  }}>
                    {iconStyle.icon}
                  </span>
                  <p style={{
                    fontSize: 12, fontWeight: 700, color: "var(--qc-ink)",
                    margin: 0, lineHeight: 1.3,
                  }}>
                    {s.label}
                  </p>
                </div>
                {s.statement && (
                  <p style={{
                    fontSize: 12, color: "var(--qc-ink-3)",
                    margin: 0, lineHeight: 1.5,
                  }}>
                    {s.statement}
                  </p>
                )}
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
    </div>
  );
}
