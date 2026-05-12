"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

function deltaStyle(raw: string | null): { color: string; label: string } {
  if (!raw) return { color: "var(--qc-ink-3)", label: "—" };
  const r = raw.toLowerCase();
  if (r.includes("increas") || r.includes("bought") || r.includes("acquired")) return { color: "var(--qc-up)", label: raw };
  if (r.includes("decreas") || r.includes("sold") || r.includes("pledge")) return { color: "var(--qc-down)", label: raw };
  return { color: "var(--qc-ink-3)", label: raw };
}

function badgeForSignal(signal: Signal): { label: string; color: string; bg: string } {
  const metric = signal.metric.toLowerCase();
  const v = signal.value;
  if (metric.includes("pledge")) {
    if (v === 0 || (signal.raw_value ?? "").includes("0.00") || (signal.raw_value ?? "").toLowerCase().includes("no pledge"))
      return { label: "NO PLEDGE", color: "var(--qc-up)", bg: "rgba(31,122,74,0.10)" };
    return { label: "PLEDGED", color: "var(--qc-down)", bg: "rgba(220,38,38,0.10)" };
  }
  if (metric.includes("insider") || metric.includes("bought")) return { label: "BUYING", color: "var(--qc-up)", bg: "rgba(31,122,74,0.10)" };
  if (metric.includes("sold") || metric.includes("sell")) return { label: "SELLING", color: "var(--qc-down)", bg: "rgba(220,38,38,0.10)" };
  return { label: "STABLE", color: "var(--qc-ink-3)", bg: "var(--qc-section)" };
}

export function LensDetailPromoter({ lens, signals }: Props) {
  // Use entity signals for persons and governance signals for activity
  const personSignals = signals.filter((s) => s.signal_type === "entity" && s.metric === "person");
  const govSignals = signals.filter((s) => s.signal_type === "governance");
  const finSignals = signals.filter((s) => s.signal_type === "financial_health");

  // Key metrics from lens
  const metricEntries = Object.entries(lens.key_metrics);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Key metrics grid */}
      {metricEntries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
          {metricEntries.map(([k, v], i) => (
            <div
              key={k}
              style={{
                padding: "13px 14px",
                background: "var(--qc-section)",
                borderRight: i % 2 === 0 ? "1px solid var(--qc-hair)" : undefined,
                borderBottom: i < metricEntries.length - 2 ? "1px solid var(--qc-hair)" : undefined,
              }}
            >
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>{k.replace(/_/g, " ")}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Promoter activity — governance signals as timeline */}
      {govSignals.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              PROMOTER ACTIVITY · SIGNALS
            </p>
          </div>
          {govSignals.map((s, i) => {
            const badge = badgeForSignal(s);
            const { color } = deltaStyle(s.raw_value);
            const isLast = i === govSignals.length - 1;
            return (
              <div key={s.id} style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "flex-start",
                padding: "12px 14px",
                borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                background: "var(--qc-card)",
              }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{s.metric.replace(/_/g, " ")}</p>
                  {s.raw_value && (
                    <p style={{ fontSize: 12, color, margin: "2px 0 0", lineHeight: 1.4 }}>{s.raw_value}</p>
                  )}
                  {s.statement && (
                    <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>
                      "{s.statement.slice(0, 110)}{s.statement.length > 110 ? "…" : ""}"
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: badge.color, background: badge.bg,
                  borderRadius: 4, padding: "3px 8px", whiteSpace: "nowrap",
                }}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Entity — key persons */}
      {personSignals.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              KEY PERSONS
            </p>
          </div>
          {personSignals.map((s, i) => {
            const isLast = i === personSignals.length - 1;
            return (
              <div key={s.id} style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "10px 14px",
                borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                background: "var(--qc-card)",
              }}>
                <div style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                  background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, color: "var(--qc-ink-3)",
                }}>
                  {(s.raw_value ?? "?")[0]}
                </div>
                <p style={{ fontSize: 12, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>{s.raw_value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Financial signals */}
      {finSignals.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              FINANCIAL HEALTH SIGNALS
            </p>
          </div>
          {finSignals.map((s, i) => {
            const isLast = i === finSignals.length - 1;
            return (
              <div key={s.id} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "11px 14px",
                borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
                background: "var(--qc-card)",
              }}>
                <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-up)" }} />
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{s.metric.replace(/_/g, " ")}</p>
                  {s.raw_value && <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: "2px 0 0", lineHeight: 1.4 }}>{s.raw_value}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary insight cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lens.highlights.map((h, i) => (
          <div key={i} style={{
            padding: "11px 14px",
            background: "rgba(31,122,74,0.05)",
            border: "1px solid rgba(31,122,74,0.18)",
            borderLeft: "3px solid var(--qc-up)",
            borderRadius: 8,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-up)" }} />
            <p style={{ fontSize: 12, color: "var(--qc-ink)", margin: 0, lineHeight: 1.55 }}>{h}</p>
          </div>
        ))}
        {lens.risks.map((r, i) => (
          <div key={i} style={{
            padding: "11px 14px",
            background: "rgba(180,115,26,0.05)",
            border: "1px solid rgba(180,115,26,0.18)",
            borderLeft: "3px solid var(--qc-warn)",
            borderRadius: 8,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-warn)" }} />
            <p style={{ fontSize: 12, color: "var(--qc-ink)", margin: 0, lineHeight: 1.55 }}>{r}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
