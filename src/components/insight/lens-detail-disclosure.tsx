"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

const DIMS = [
  { prefix: "DIM_BN", abbr: "BN", label: "Bad news disclosure", metaScore: "META_BN_SCORE" },
  { prefix: "DIM_NC", abbr: "NC", label: "Narrative consistency", metaScore: "META_NC_SCORE" },
  { prefix: "DIM_TD", abbr: "TD", label: "Transparency depth", metaScore: "META_TD_SCORE" },
  { prefix: "DIM_GV", abbr: "GV", label: "Governance signals", metaScore: "META_GV_SCORE" },
];

function scoreBarColor(direction: string | null): string {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return "var(--qc-up)";
  if (d === "miss") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function scoreBarWidth(label: string | null | undefined): number {
  if (!label) return 0;
  // label like "5/8" → 5/8 * 100
  const m = label.match(/^(\d+)\/(\d+)$/);
  if (m) return (parseInt(m[1]) / parseInt(m[2])) * 100;
  return 0;
}

function calloutTagStyle(direction: string | null) {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { color: "var(--qc-up)", bg: "rgba(31,122,74,0.08)", border: "rgba(31,122,74,0.25)", dot: "var(--qc-up)" };
  if (d === "miss") return { color: "var(--qc-down)", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", dot: "var(--qc-down)" };
  return { color: "var(--qc-warn)", bg: "rgba(180,115,26,0.08)", border: "rgba(180,115,26,0.25)", dot: "var(--qc-warn)" };
}

function bulletIcon(direction: string | null): { icon: string; color: string; bg: string } {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { icon: "✓", color: "var(--qc-up)", bg: "rgba(31,122,74,0.12)" };
  if (d === "miss") return { icon: "✕", color: "var(--qc-down)", bg: "rgba(220,38,38,0.12)" };
  return { icon: "●", color: "var(--qc-warn)", bg: "rgba(180,115,26,0.10)" };
}

function calloutBoxStyle(direction: string | null) {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { bg: "rgba(31,122,74,0.05)", border: "rgba(31,122,74,0.20)", iconColor: "var(--qc-up)", textColor: "var(--qc-up)" };
  if (d === "miss") return { bg: "rgba(220,38,38,0.05)", border: "rgba(220,38,38,0.20)", iconColor: "var(--qc-down)", textColor: "var(--qc-down)" };
  return { bg: "rgba(180,115,26,0.05)", border: "rgba(180,115,26,0.20)", iconColor: "var(--qc-warn)", textColor: "var(--qc-warn)" };
}

function analystReadStyle(direction: string | null) {
  const d = (direction ?? "").toLowerCase();
  if (d === "beat") return { border: "var(--qc-up)", iconBg: "rgba(31,122,74,0.12)", iconColor: "var(--qc-up)", icon: "✓" };
  if (d === "miss") return { border: "var(--qc-down)", iconBg: "rgba(220,38,38,0.12)", iconColor: "var(--qc-down)", icon: "✕" };
  return { border: "var(--qc-warn)", iconBg: "rgba(180,115,26,0.10)", iconColor: "var(--qc-warn)", icon: "●" };
}

// Extract the callout tag text from callout label — e.g. "Amber — Reactive margin pattern" → "REACTIVE"
// or just uppercase the part after "—" if present
function calloutTagLabel(label: string | null | undefined): string {
  if (!label) return "";
  const parts = label.split("—");
  if (parts.length >= 2) return parts[1].trim().toUpperCase();
  return label.toUpperCase();
}

export function LensDetailDisclosure({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const quoteSig = topSignals.find((s) => s.metric === "QUOTE");
  const analystReads = topSignals.filter((s) => s.metric === "ANALYST_READ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* 2×2 dimension cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
        {DIMS.map(({ prefix, abbr, label, metaScore }) => {
          const header = topSignals.find((s) => s.metric === `${prefix}_HEADER`);
          const bullets = topSignals.filter((s) => s.metric === `${prefix}_BULLET`);
          const callout = topSignals.find((s) => s.metric === `${prefix}_CALLOUT`) ?? null;
          const meta = topSignals.find((s) => s.metric === metaScore);

          const scoreLabel = meta?.label ?? (header?.actual_value != null ? `${header.actual_value}/10` : null);
          const barWidth = scoreBarWidth(scoreLabel);
          const barColor = scoreBarColor(header?.direction ?? null);
          const tagStyle = calloutTagStyle(callout?.direction ?? null);
          const tagText = calloutTagLabel(callout?.label);

          return (
            <div key={abbr} style={{
              padding: "16px",
              background: "var(--qc-card)",
              border: "1px solid var(--qc-hair)",
              borderRadius: 10,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {/* Card header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                    background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "var(--qc-ink-3)", letterSpacing: "0.04em",
                  }}>
                    {abbr}
                  </span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0, lineHeight: 1.2 }}>
                      {label}
                    </p>
                    {header?.statement && (
                      <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.4 }}>
                        {header.statement}
                      </p>
                    )}
                  </div>
                </div>
                {/* Callout tag — top right */}
                {tagText && (
                  <span style={{
                    flexShrink: 0,
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                    color: tagStyle.color, background: tagStyle.bg, border: `1px solid ${tagStyle.border}`,
                    borderRadius: 99, padding: "3px 10px", whiteSpace: "nowrap",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: tagStyle.dot, flexShrink: 0 }} />
                    {tagText}
                  </span>
                )}
              </div>

              {/* Score fraction + bar */}
              {scoreLabel && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: barColor, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                    {scoreLabel}
                  </span>
                  <div style={{ height: 5, borderRadius: 99, background: "var(--qc-hair)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${barWidth}%`,
                      background: barColor,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              )}

              {/* Bullet list */}
              {bullets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {bullets.map((sig, j) => {
                    const bi = bulletIcon(sig.direction);
                    return (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{
                          flexShrink: 0, marginTop: 1,
                          width: 16, height: 16, borderRadius: 4,
                          background: bi.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, color: bi.color,
                        }}>
                          {bi.icon}
                        </span>
                        <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.45 }}>
                          <strong style={{ color: "var(--qc-ink)", fontWeight: 600 }}>{sig.label}</strong>
                          {sig.statement ? ` — ${sig.statement}` : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Callout box */}
              {callout && (() => {
                const cs = calloutBoxStyle(callout.direction);
                const icon = callout.direction === "beat" ? "▲" : callout.direction === "miss" ? "✕" : "⚠";
                return (
                  <div style={{
                    padding: "10px 12px",
                    background: cs.bg,
                    border: `1px solid ${cs.border}`,
                    borderRadius: 8,
                    display: "flex", flexDirection: "column", gap: 4,
                    marginTop: 2,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: cs.iconColor }}>{icon}</span>
                      <p style={{ fontSize: 12, fontWeight: 700, color: cs.textColor, margin: 0, lineHeight: 1.3 }}>
                        {callout.label}
                      </p>
                    </div>
                    {callout.statement && (
                      <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                        {callout.statement}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Quote section */}
      {quoteSig && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 3px" }}>
              DISCLOSURE EVIDENCE · IN THEIR OWN WORDS
            </p>
            {quoteSig.label && (
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>{quoteSig.label}</p>
            )}
          </div>
          <div style={{
            borderLeft: "3px solid var(--qc-ink-3)",
            paddingLeft: 18, paddingTop: 8, paddingBottom: 8,
          }}>
            <p style={{
              fontSize: 15, fontStyle: "italic", color: "var(--qc-ink)", margin: "0 0 10px",
              lineHeight: 1.7, fontFamily: "var(--qc-font-serif, Georgia, serif)",
            }}>
              {quoteSig.statement}
            </p>
            {quoteSig.actual_date && (
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
                — {quoteSig.label} · {quoteSig.actual_date}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Analyst read cards */}
      {analystReads.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {analystReads.map((ar, i) => {
            const st = analystReadStyle(ar.direction);
            return (
              <div key={i} style={{
                padding: "14px 16px",
                background: "var(--qc-card)",
                border: "1px solid var(--qc-hair)",
                borderLeft: `3px solid ${st.border}`,
                borderRadius: 8,
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    background: st.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: st.iconColor,
                  }}>
                    {st.icon}
                  </span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", margin: 0, lineHeight: 1.3 }}>
                    {ar.label}
                  </p>
                </div>
                {ar.statement && (
                  <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
                    {ar.statement}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
