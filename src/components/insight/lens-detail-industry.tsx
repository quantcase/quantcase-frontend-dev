"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

function tailwindPercent(highlights: string[], risks: string[]): number {
  const total = highlights.length + risks.length;
  if (total === 0) return 50;
  return Math.round((highlights.length / total) * 100);
}

function toneFromSignals(signals: Signal[]): { label: string; color: string } {
  const toneSignal = signals.find((s) => s.signal_type === "tone");
  const label = toneSignal?.raw_value ?? "Neutral";
  const lower = label.toLowerCase();
  const color =
    lower.includes("confident") || lower.includes("positive")
      ? "var(--qc-up)"
      : lower.includes("cautious") || lower.includes("concern")
      ? "var(--qc-warn)"
      : "var(--qc-ink-3)";
  return { label, color };
}

function signalDirection(s: TopSignal): "up" | "down" | "neutral" {
  if (s.direction === "beat" || s.direction === "above") return "up";
  if (s.direction === "miss" || s.direction === "below") return "down";
  // Infer from label/statement text
  const text = (s.label + " " + (s.statement ?? "")).toLowerCase();
  if (text.includes("declin") || text.includes("qoq declin") || text.includes("headwind") || text.includes("pressure") || text.includes("soft")) return "down";
  // Positive actual value for growth metrics
  if (s.actual_value !== null && s.actual_value > 0 && s.metric.toLowerCase().includes("growth")) return "up";
  return "neutral";
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0,
    }}>
      {children}
    </p>
  );
}

function StatusBadge({ label, color }: { label: string | null | undefined; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      border: `1px solid ${color}`,
      borderRadius: 20, padding: "3px 12px",
      color, background: "var(--qc-card)",
    }}>
      • {label}
    </span>
  );
}

export function LensDetailIndustry({ lens, signals }: Props) {
  const topSignals = lens.top_signals ?? [];

  // De-duplicate by metric, keep highest-impact per metric
  const seen = new Set<string>();
  const uniqueSignals = topSignals.filter((s) => {
    if (seen.has(s.metric)) return false;
    seen.add(s.metric);
    return true;
  });

  // Key segment growth signals for KPI strip
  const pvSignal = uniqueSignals.find((s) => s.metric === "PV_INDUSTRY_GROWTH");
  const cvSignal = uniqueSignals.find((s) => s.metric === "CV_INDUSTRY_GROWTH");
  const twSignal = uniqueSignals.find((s) => s.metric === "2W_INDUSTRY_GROWTH");
  const coSignal = uniqueSignals.find((s) => s.metric === "MSWIL_outperformed_market");
  const greenSignal = uniqueSignals.find((s) => s.metric === "SEG_GREENFIELD_REV");

  const km = lens.key_metrics;

  const kpiTiles = [
    {
      label: "PV GROWTH",
      value: pvSignal?.actual_value != null ? `${pvSignal.actual_value}%` : (km["PV_Industry_YoY_Growth"] ?? "—"),
      sub: pvSignal?.statement ?? "YoY growth — passenger vehicles",
      valueColor: "var(--qc-up)",
    },
    {
      label: "CV GROWTH",
      value: cvSignal?.actual_value != null ? `${cvSignal.actual_value}%` : (km["CV_Industry_YoY_Growth"] ?? "—"),
      sub: cvSignal?.statement ?? "YoY growth — commercial vehicles",
      valueColor: "var(--qc-up)",
    },
    {
      label: "2W GROWTH",
      value: twSignal?.actual_value != null ? `${twSignal.actual_value}%` : (km["2W_Industry_YoY_Growth"] ?? "—"),
      sub: twSignal?.statement ?? "YoY growth — two-wheelers",
      valueColor: twSignal?.actual_value != null && twSignal.actual_value > 0 ? "var(--qc-up)" : "var(--qc-warn)",
    },
    {
      label: "CO. OUTPERFORMANCE",
      value: coSignal?.actual_value != null ? `${coSignal.actual_value}%` : (km["MSWIL_Outperformance"] ?? "—"),
      sub: coSignal?.statement ?? "Company vs blended industry",
      valueColor: "var(--qc-up)",
    },
  ];

  // Signal rows (all unique signals except the 4 KPIs above)
  const kpiMetrics = new Set(["PV_INDUSTRY_GROWTH", "CV_INDUSTRY_GROWTH", "2W_INDUSTRY_GROWTH", "MSWIL_outperformed_market"]);
  const detailSignals = uniqueSignals.filter((s) => !kpiMetrics.has(s.metric));

  const tailwindPct = tailwindPercent(lens.highlights, lens.risks);
  const headwindPct = 100 - tailwindPct;
  const { label: toneLabel, color: toneColor } = toneFromSignals(signals);

  const quarter = km["Quarter"] ?? "Q3 FY26";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* INDUSTRY KPIS card */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Card header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SectionLabel>INDUSTRY KPIS</SectionLabel>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)",
              background: "var(--qc-hair)", borderRadius: 4, padding: "2px 8px",
            }}>
              {quarter}
            </span>
          </div>
          <StatusBadge label={lens.status} color={lens.status === "STRONG" ? "var(--qc-up)" : lens.status === "WEAK" ? "var(--qc-down)" : "var(--qc-warn)"} />
        </div>

        {/* KPI subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
            {lens.description}
          </p>
        </div>

        {/* 4-column KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", background: "var(--qc-card)", borderTop: "1px solid var(--qc-hair)" }}>
          {kpiTiles.map((tile, i) => (
            <div key={i} style={{
              padding: "14px 16px",
              borderRight: i < 3 ? "1px solid var(--qc-hair)" : undefined,
            }}>
              <p style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 6px",
              }}>
                {tile.label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, color: tile.valueColor, margin: "0 0 4px", lineHeight: 1.1 }}>
                {tile.value}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                {tile.sub.slice(0, 70)}{tile.sub.length > 70 ? "…" : ""}
              </p>
            </div>
          ))}
        </div>

        {/* Detail signal rows in 2-column grid */}
        {detailSignals.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 1, borderTop: "1px solid var(--qc-hair)",
            background: "var(--qc-hair)",
          }}>
            {detailSignals.slice(0, 4).map((s) => {
              const dir = signalDirection(s);
              const borderColor = dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)";
              const arrowColor = dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)";
              const arrow = dir === "up" ? "↑" : dir === "down" ? "↓" : "→";
              const badge = s.actual_value != null ? `${s.actual_value}${s.unit ?? "%"}` : undefined;

              return (
                <div key={s.signal_id} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 16px",
                  background: "var(--qc-card)",
                  borderLeft: `3px solid ${borderColor}`,
                }}>
                  <span style={{ flexShrink: 0, marginTop: 2, color: arrowColor, fontWeight: 700, fontSize: 13 }}>
                    {arrow}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>
                      {s.label}
                    </p>
                    {s.statement && (
                      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.5 }}>
                        {s.statement.slice(0, 100)}{s.statement.length > 100 ? "…" : ""}
                      </p>
                    )}
                  </div>
                  {badge && (
                    <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, color: arrowColor, whiteSpace: "nowrap" }}>
                      {badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MANAGEMENT CONSENSUS */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div>
            <SectionLabel>MANAGEMENT CONSENSUS</SectionLabel>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "3px 0 0" }}>
              {lens.signal_count} signals · {quarter}
            </p>
          </div>
          <StatusBadge label={`${toneLabel} tone`} color={toneColor} />
        </div>

        {/* Dominant direction */}
        <div style={{ padding: "12px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          {tailwindPct >= headwindPct ? (
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-up)", margin: "0 0 2px" }}>↑ Tailwinds Dominant</p>
          ) : (
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-down)", margin: "0 0 2px" }}>↓ Headwinds Dominant</p>
          )}
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
            {tailwindPct >= headwindPct
              ? "Demand recovery and volume growth driving broad-based tailwinds"
              : "Cost pressures and capacity drag weighing on near-term margins"}
          </p>
        </div>

        {/* Tailwind / Headwind bar */}
        <div style={{ padding: "12px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-up)" }}>↑ Tailwinds {tailwindPct}%</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-down)" }}>{headwindPct}% Headwinds ↓</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${tailwindPct}%`, background: "var(--qc-up)", transition: "width 0.5s ease" }} />
            <div style={{ flex: 1, background: "var(--qc-down)" }} />
          </div>
        </div>

        {/* Demand + Supply columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--qc-card)" }}>
          <div style={{ padding: "14px 16px", borderRight: "1px solid var(--qc-hair)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <SectionLabel>DEMAND SIGNALS</SectionLabel>
              <span style={{ fontSize: 10, fontWeight: 600, color: tailwindPct < 50 ? "var(--qc-down)" : "var(--qc-up)" }}>
                {tailwindPct < 50 ? "▼ Weakening" : "▲ Strong"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lens.highlights.slice(0, 4).map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-up)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>↑</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                      {h.slice(0, 100)}{h.length > 100 ? "…" : ""}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>100%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <SectionLabel>SUPPLY SIGNALS</SectionLabel>
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-down)" }}>▼ Pressure rising</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lens.risks.slice(0, 4).map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-down)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>↓</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                      {r.slice(0, 100)}{r.length > 100 ? "…" : ""}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>100%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Greenfield highlight if present */}
      {greenSignal && (
        <div style={{
          padding: "12px 16px", borderRadius: 10,
          border: "1px solid var(--qc-hair)",
          background: "var(--qc-up-soft)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--qc-up)", flexShrink: 0 }}>
            {greenSignal.actual_value}%
          </span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{greenSignal.label}</p>
            {greenSignal.statement && (
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{greenSignal.statement}</p>
            )}
          </div>
        </div>
      )}

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Multi-segment industry growth — company outperforming market."
        body={lens.takeaway}
        metrics={[
          { label: "PV Growth", value: kpiTiles[0].value, sub: "Passenger vehicles YoY" },
          { label: "CV Growth", value: kpiTiles[1].value, sub: "Commercial vehicles YoY" },
          { label: "Co. Outperformance", value: kpiTiles[3].value, sub: "vs blended industry" },
        ]}
      />
    </div>
  );
}
