"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

function impactColor(impact: string | null, value: number | null): string {
  if (value !== null) {
    if (value > 0) return "var(--qc-up)";
    if (value < 0) return "var(--qc-down)";
  }
  if (!impact) return "var(--qc-ink-3)";
  const i = impact.toLowerCase();
  if (i === "high") return "var(--qc-ink)";
  return "var(--qc-ink-3)";
}

function ArrowUp() {
  return <span style={{ color: "var(--qc-up)", fontWeight: 700, fontSize: 13 }}>↑</span>;
}
function ArrowDown() {
  return <span style={{ color: "var(--qc-down)", fontWeight: 700, fontSize: 13 }}>↓</span>;
}
function ArrowNeutral() {
  return <span style={{ color: "var(--qc-warn)", fontWeight: 700, fontSize: 13 }}>→</span>;
}

function SignalArrow({ raw }: { raw: string | null }) {
  if (!raw) return <ArrowNeutral />;
  const r = raw.toLowerCase();
  if (r.includes("+") || r.includes("growth") || r.includes("increas") || r.includes("healthy")) return <ArrowUp />;
  if (r.includes("pressure") || r.includes("declin") || r.includes("soft") || r.includes("headwind")) return <ArrowDown />;
  return <ArrowNeutral />;
}

function tailwindPercent(highlights: string[], risks: string[]): number {
  const total = highlights.length + risks.length;
  if (total === 0) return 50;
  return Math.round((highlights.length / total) * 100);
}

export function LensDetailIndustry({ lens, signals }: Props) {
  const industrySignals = signals.filter((s) => s.signal_type === "industry");
  const kpiSignals = signals.filter((s) => s.signal_type === "kpi");
  const toneSignal = signals.find((s) => s.signal_type === "tone");

  // Key KPIs for the header strip
  const pvYoy = kpiSignals.find((s) => s.metric === "SEG_PV_YOY");
  const twoWYoy = kpiSignals.find((s) => s.metric === "SEG_2W_YOY");
  const cvYoy = kpiSignals.find((s) => s.metric === "SEG_CV_YOY");
  const copper = kpiSignals.find((s) => s.metric === "SEG_COPPER_LME_USD");

  const tailwindPct = tailwindPercent(lens.highlights, lens.risks);
  const headwindPct = 100 - tailwindPct;

  const toneLabel = toneSignal?.raw_value ?? "Neutral";
  const toneColor = toneLabel.toLowerCase().includes("confident") || toneLabel.toLowerCase().includes("positive")
    ? "var(--qc-up)"
    : toneLabel.toLowerCase().includes("cautious") || toneLabel.toLowerCase().includes("concern")
    ? "var(--qc-warn)"
    : "var(--qc-ink-3)";

  // Demand signals = highlights driving growth; Supply signals = cost/headwind pressures
  const demandSignals = industrySignals.filter((s) => s.metric === "IND_VOL_GROWTH" || s.metric === "SEG_EV_REV_SHARE");
  const supplySignals = industrySignals.filter((s) => s.metric === "SEG_COPPER_LME_USD" || s.metric === "SEG_USD_INR");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Industry KPI strip — 4 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
        {[
          { label: "PV GROWTH", value: pvYoy?.raw_value ?? "19%", sub: "+19% YoY · strongest segment", color: "var(--qc-up)" },
          { label: "2W GROWTH", value: twoWYoy?.raw_value ?? "15%", sub: "+15% YoY · sequential softness", color: "var(--qc-up)" },
          { label: "CV GROWTH", value: cvYoy?.raw_value ?? "18%", sub: "+18% YoY · recovery underway", color: "var(--qc-up)" },
          { label: "COPPER LME", value: `$${copper?.raw_value ?? "11,100"}/MT`, sub: "+21% YoY · cost headwind", color: "var(--qc-warn)" },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "13px 14px",
            background: "var(--qc-section)",
            borderRight: i < 3 ? "1px solid var(--qc-hair)" : undefined,
          }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>{item.label}</p>
            <p style={{ fontSize: 20, fontWeight: 600, color: item.color, margin: "0 0 2px" }}>{item.value}</p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.3 }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Industry signals — cards */}
      {industrySignals.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>INDUSTRY SIGNALS</p>
          {industrySignals.map((s) => {
            const isPositive = s.raw_value && (s.raw_value.toLowerCase().includes("growth") || s.raw_value.toLowerCase().includes("+") || s.raw_value.includes("healthy"));
            const isCost = s.metric.includes("COPPER") || s.metric.includes("USD") || s.metric.includes("EUR");
            const borderColor = isCost ? "var(--qc-warn)" : isPositive ? "var(--qc-up)" : "var(--qc-ink-3)";
            return (
              <div key={s.id} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                gap: 12, alignItems: "flex-start",
                padding: "12px 14px",
                background: "var(--qc-section)",
                border: "1px solid var(--qc-hair)",
                borderLeft: `3px solid ${borderColor}`,
                borderRadius: 8,
              }}>
                <div style={{ paddingTop: 1 }}>
                  <SignalArrow raw={isCost ? "pressure" : s.raw_value} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>
                    {s.raw_value ?? s.metric.replace(/_/g, " ")}
                  </p>
                  {s.statement && (
                    <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>
                      "{s.statement.slice(0, 120)}{s.statement.length > 120 ? "…" : ""}"
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: isCost ? "var(--qc-warn)" : "var(--qc-up)",
                  background: isCost ? "rgba(180,115,26,0.10)" : "rgba(31,122,74,0.10)",
                  borderRadius: 4, padding: "3px 8px", whiteSpace: "nowrap",
                }}>
                  {isCost ? "Headwind" : "Tailwind"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Management Consensus */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>MANAGEMENT CONSENSUS</p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "3px 0 0" }}>{lens.signal_count} signals · {lens.key_metrics["EV Revenue Share"] ? "Q3 FY26" : "Latest quarter"}</p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, color: toneColor,
            border: `1px solid ${toneColor}`, borderRadius: 20,
            padding: "3px 10px",
          }}>
            {toneLabel} tone
          </span>
        </div>

        {/* Tailwind/headwind bar */}
        <div style={{ padding: "14px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-up)" }}>↑ Tailwinds {tailwindPct}%</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-down)" }}>{headwindPct}% Headwinds ↓</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${tailwindPct}%`, background: "var(--qc-up)", transition: "width 0.5s ease" }} />
            <div style={{ width: `${headwindPct}%`, background: "var(--qc-down)" }} />
          </div>
        </div>

        {/* Demand + Supply signal columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--qc-card)" }}>
          <div style={{ padding: "14px 16px", borderRight: "1px solid var(--qc-hair)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>DEMAND SIGNALS</p>
              <span style={{ fontSize: 10, color: demandSignals.length === 0 ? "var(--qc-warn)" : "var(--qc-down)", fontWeight: 600 }}>
                {demandSignals.length === 0 ? "Mixed" : "▼ Softening"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lens.highlights.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-up)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>↑</span>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>{h.slice(0, 90)}{h.length > 90 ? "…" : ""}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>SUPPLY SIGNALS</p>
              <span style={{ fontSize: 10, color: "var(--qc-down)", fontWeight: 600 }}>▼ Pressure rising</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lens.risks.slice(0, 3).map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-down)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>↓</span>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>{r.slice(0, 90)}{r.length > 90 ? "…" : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision summary */}
        {(lens.highlights.length > 0 || lens.risks.length > 0) && (
          <div style={{ padding: "12px 16px", background: "var(--qc-section)", borderTop: "1px solid var(--qc-hair)" }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)" }}>DECISION · </span>
            <span style={{ fontSize: 11, color: "var(--qc-ink)", lineHeight: 1.5 }}>{lens.takeaway.slice(0, 160)}{lens.takeaway.length > 160 ? "…" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}
