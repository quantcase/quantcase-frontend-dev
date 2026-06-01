"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

function directionIcon(direction: string | null): { icon: string; color: string } {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { icon: "✓", color: "var(--qc-up)" };
  if (d === "miss") return { icon: "✕", color: "var(--qc-down)" };
  return { icon: "●", color: "var(--qc-ink-3)" };
}

function insightCardStyle(direction: string | null) {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { border: "var(--qc-up)", iconBg: "rgba(31,122,74,0.10)", iconColor: "var(--qc-up)", icon: "✓" };
  if (d === "miss") return { border: "var(--qc-down)", iconBg: "rgba(220,38,38,0.10)", iconColor: "var(--qc-down)", icon: "✕" };
  return { border: "var(--qc-warn)", iconBg: "rgba(180,115,26,0.10)", iconColor: "var(--qc-warn)", icon: "●" };
}

function formatDelta(pct: number | null | undefined): { text: string; color: string } {
  if (pct == null) return { text: "—", color: "var(--qc-ink-3)" };
  if (pct === 0) return { text: "flat", color: "var(--qc-ink-3)" };
  const text = pct > 0 ? `+${pct.toFixed(1)} pp` : `${pct.toFixed(1)} pp`;
  return { text, color: pct > 0 ? "var(--qc-up)" : "var(--qc-down)" };
}

function formatStake(value: number | null, unit: string | null): string {
  if (value == null || value === 0) return "—";
  return unit ? `${value}${unit}` : String(value);
}

export function LensDetailPromoter({ lens, signals: _signals }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const stakeSignals = topSignals.filter((s) => s.metric === "PROMOTER_STAKE");
  const insightSignals = topSignals.filter((s) => s.metric === "PROMOTER_INSIGHT");

  // META signals for header context
  const metaStake = topSignals.find((s) => s.metric === "META_CURRENT_STAKE");
  const metaPledge = topSignals.find((s) => s.metric === "META_PLEDGE_PCT");
  const metaVerdict = topSignals.find((s) => s.metric === "META_VERDICT");

  // Header subtitle: lens description or meta verdict
  const subtitle = lens.description ?? metaVerdict?.statement ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Section header */}
      <div>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>
          PROMOTER ACTIVITY · {lens.name.toUpperCase()}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
        )}
      </div>

      {/* Stake timeline table */}
      {stakeSignals.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          {stakeSignals.map((s, i) => {
            const isLast = i === stakeSignals.length - 1;
            const stake = formatStake(s.actual_value, s.unit);
            const pledge = s.guided_value != null ? `${s.guided_value}% pledge` : "—";
            const delta = formatDelta(s.delta_pct);
            const icon = directionIcon(s.direction);

            return (
              <div
                key={s.signal_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 130px 110px 70px 1fr",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                  background: "var(--qc-card)",
                  gap: 0,
                }}
              >
                {/* Date */}
                <span style={{ fontSize: 12, color: "var(--qc-ink-3)", fontWeight: 500 }}>
                  {s.label ?? "—"}
                </span>

                {/* Stake % */}
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", fontVariantNumeric: "tabular-nums" }}>
                  {stake}
                </span>

                {/* Pledge % */}
                <span style={{ fontSize: 13, color: "var(--qc-ink-3)", fontVariantNumeric: "tabular-nums" }}>
                  {pledge}
                </span>

                {/* Delta */}
                <span style={{ fontSize: 13, fontWeight: 500, color: delta.color, fontVariantNumeric: "tabular-nums" }}>
                  {delta.text}
                </span>

                {/* Direction icon + statement */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    background: icon.color === "var(--qc-up)" ? "rgba(31,122,74,0.12)" : icon.color === "var(--qc-down)" ? "rgba(220,38,38,0.12)" : "rgba(18,18,18,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: icon.color,
                  }}>
                    {icon.icon}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--qc-ink-2)", lineHeight: 1.4 }}>
                    {s.statement}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insight cards */}
      {insightSignals.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {insightSignals.map((s, i) => {
            const style = insightCardStyle(s.direction);
            return (
              <div key={i} style={{
                padding: "16px 18px",
                background: "var(--qc-card)",
                border: "1px solid var(--qc-hair)",
                borderLeft: `3px solid ${style.border}`,
                borderRadius: 8,
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    background: style.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: style.iconColor,
                  }}>
                    {style.icon}
                  </span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: 0, lineHeight: 1.3 }}>
                    {s.label}
                  </p>
                </div>
                {s.statement && (
                  <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
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
        <div style={{
          padding: "14px 16px", background: "var(--qc-section)",
          borderRadius: 10, border: "1px solid var(--qc-hair)",
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px" }}>
            QUANTCASE ASSESSMENT
          </p>
          <p style={{ fontSize: 13, color: "var(--qc-ink)", margin: 0, lineHeight: 1.6 }}>
            {lens.takeaway}
          </p>
        </div>
      )}
    </div>
  );
}
