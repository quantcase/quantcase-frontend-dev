"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// Sub-lens definitions for Disclosure Honesty — mapped from signals
const SUB_LENS_DEFS = [
  { key: "bad_news", label: "Bad news disclosure", abbr: "BN", description: "Proactive vs reactive disclosure of negative outcomes" },
  { key: "narrative_consistency", label: "Narrative consistency", abbr: "NC", description: "Consistency of management narrative across quarters" },
  { key: "transparency_depth", label: "Transparency depth", abbr: "TD", description: "Quantitative depth vs vague qualitative language" },
  { key: "governance_signals", label: "Governance signals", abbr: "GV", description: "Audit quality, pledge status, regulatory compliance" },
];

type SubLensData = {
  key: string;
  label: string;
  abbr: string;
  description: string;
  signals: Signal[];
  score: number;
  max: number;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
};

function buildSubLenses(signals: Signal[]): SubLensData[] {
  const govSignals = signals.filter((s) => s.signal_type === "governance");
  const finSignals = signals.filter((s) => s.signal_type === "financial_health");
  const milestones = signals.filter((s) => s.signal_type === "milestone");
  const toneSignals = signals.filter((s) => s.signal_type === "tone");

  // Map signals to sub-lenses heuristically
  const mapping: Record<string, Signal[]> = {
    bad_news: govSignals.filter((s) => s.metric.includes("proactive") || s.metric.includes("transparent")),
    narrative_consistency: [...toneSignals, ...govSignals.filter((s) => s.metric.includes("transparent"))],
    transparency_depth: milestones,
    governance_signals: [...finSignals, ...govSignals.filter((s) => s.metric.includes("capital") || s.metric.includes("guidance"))],
  };

  return SUB_LENS_DEFS.map((def) => {
    const sigs = mapping[def.key] ?? [];
    const posCount = sigs.filter((s) => s.value === 1 || (s.value ?? 0) > 0).length;
    const total = Math.max(sigs.length, 1);
    const score = Math.round((posCount / total) * 10 * 10) / 10;
    const maxScore = 10;
    const pct = (score / maxScore) * 100;

    let statusLabel: string;
    let statusColor: string;
    let statusBg: string;
    if (pct >= 70) {
      statusLabel = "CLEAN"; statusColor = "var(--qc-up)"; statusBg = "rgba(31,122,74,0.10)";
    } else if (pct >= 40) {
      statusLabel = "REACTIVE"; statusColor = "var(--qc-warn)"; statusBg = "rgba(180,115,26,0.10)";
    } else {
      statusLabel = "WEAK"; statusColor = "var(--qc-down)"; statusBg = "rgba(220,38,38,0.10)";
    }

    return { ...def, signals: sigs, score, max: maxScore, statusLabel, statusColor, statusBg };
  });
}

function SubLensCard({ sub }: { sub: SubLensData }) {
  const pct = (sub.score / sub.max) * 100;
  const barColor = sub.statusColor;

  return (
    <div style={{
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      padding: "16px 16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "var(--qc-ink-3)", letterSpacing: "0.04em",
          }}>
            {sub.abbr}
          </span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.2 }}>{sub.label}</p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.3 }}>{sub.description}</p>
          </div>
        </div>
        <span style={{
          flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
          color: sub.statusColor, background: sub.statusBg,
          borderRadius: 4, padding: "3px 8px", textTransform: "uppercase",
        }}>
          {sub.statusLabel}
        </span>
      </div>

      {/* Score bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "var(--qc-ink)" }}>{sub.score.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: "var(--qc-ink-3)", alignSelf: "flex-end", marginBottom: 2 }}>/{sub.max}</span>
        </div>
        <div style={{ height: 4, borderRadius: 99, background: "var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Signal bullets */}
      {sub.signals.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {sub.signals.map((s) => {
            const isPos = s.value === 1 || (s.value ?? 0) > 0;
            const dotColor = isPos ? "var(--qc-up)" : "var(--qc-down)";
            return (
              <div key={s.id} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: dotColor }} />
                <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.45 }}>
                  {s.raw_value ?? s.metric.replace(/_/g, " ")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LensDetailDisclosure({ lens, signals }: Props) {
  const subLenses = buildSubLenses(signals);
  const captureRate = lens.key_metrics["signal_capture_rate"] ?? lens.key_metrics["Signal_Count"] ?? null;
  const dominantTheme = lens.key_metrics["dominant_theme"] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
        <div style={{ padding: "13px 14px", background: "var(--qc-section)" }}>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>SIGNAL CAPTURE</p>
          <p style={{ fontSize: 20, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{captureRate ?? `${lens.signal_count} signals`}</p>
        </div>
        <div style={{ padding: "13px 14px", background: "var(--qc-section)", borderLeft: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>DOMINANT THEME</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.3 }}>{dominantTheme ?? "Governance transparency"}</p>
        </div>
      </div>

      {/* Sub-lens 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {subLenses.map((sub) => <SubLensCard key={sub.key} sub={sub} />)}
      </div>

      {/* Callout insights */}
      {lens.highlights.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-up)", margin: 0 }}>HIGHLIGHTS</p>
          </div>
          <div style={{ padding: "12px 14px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 8 }}>
            {lens.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-up)" }} />
                <p style={{ fontSize: 12, color: "var(--qc-ink)", margin: 0, lineHeight: 1.55 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lens.risks.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid rgba(180,115,26,0.25)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(180,115,26,0.06)", borderBottom: "1px solid rgba(180,115,26,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-warn)", margin: 0 }}>WATCH ITEMS</p>
          </div>
          <div style={{ padding: "12px 14px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 8 }}>
            {lens.risks.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-warn)" }} />
                <p style={{ fontSize: 12, color: "var(--qc-ink)", margin: 0, lineHeight: 1.55 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
