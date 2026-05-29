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
  const text = (s.label + " " + (s.statement ?? "")).toLowerCase();
  if (text.includes("declin") || text.includes("headwind") || text.includes("pressure") || text.includes("soft")) return "down";
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

function formatSignalValue(s: TopSignal): string {
  if (s.actual_value == null) return "—";
  const v = s.actual_value;
  const unit = s.unit ?? "";
  if (unit === "%" ) return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "bps") return `${v} bps`;
  if (unit === "users") return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)} Cr` : v >= 1_000 ? `${(v / 1_000).toFixed(1)}L` : `${v}`;
  return `${v}`;
}

// Pick the top 4 most representative signals for the KPI strip
function buildKpiTiles(topSignals: TopSignal[], km: Record<string, string>) {
  // Prefer high-impact growth signals, then fall back to anything with a value
  const highImpact = topSignals.filter((s) => s.impact === "high" && s.actual_value != null);
  const pool = highImpact.length >= 4 ? highImpact : topSignals.filter((s) => s.actual_value != null);
  const picked = pool.slice(0, 4);

  // Pad with key_metrics entries if fewer than 4 signals
  const kmEntries = Object.entries(km);
  let idx = 0;
  while (picked.length < 4 && idx < kmEntries.length) {
    const [k, v] = kmEntries[idx++];
    picked.push({
      signal_id: k,
      metric: k,
      label: k.replace(/_/g, " "),
      actual_value: null,
      guided_value: null,
      actual_date: null,
      guided_date: null,
      unit: null,
      delta: null,
      delta_pct: null,
      direction: null,
      impact: null,
      statement: v,
    });
  }

  return picked.slice(0, 4).map((s) => {
    const dir = signalDirection(s);
    const valueColor = dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-ink)";
    const displayValue = s.actual_value != null ? formatSignalValue(s) : (s.statement ?? km[s.metric] ?? "—");
    return {
      label: s.label,
      value: displayValue,
      sub: s.statement && s.actual_value != null ? s.statement.slice(0, 70) : "",
      valueColor,
      signal: s,
    };
  });
}

export function LensDetailIndustry({ lens, signals }: Props) {
  const topSignals = lens.top_signals ?? [];

  const seen = new Set<string>();
  const uniqueSignals = topSignals.filter((s) => {
    if (seen.has(s.signal_id)) return false;
    seen.add(s.signal_id);
    return true;
  });

  const km = lens.key_metrics;
  const kpiTiles = buildKpiTiles(uniqueSignals, km);
  const kpiSignalIds = new Set(kpiTiles.map((t) => t.signal?.signal_id));
  const detailSignals = uniqueSignals.filter((s) => !kpiSignalIds.has(s.signal_id));

  const tailwindPct = tailwindPercent(lens.highlights, lens.risks);
  const headwindPct = 100 - tailwindPct;
  const { label: toneLabel, color: toneColor } = toneFromSignals(signals);

  // Derive quarter from computed_at or fall back to key_metrics
  const quarter = (() => {
    if (lens.computed_at) {
      const d = new Date(lens.computed_at);
      if (!isNaN(d.getTime())) {
        const month = d.getMonth() + 1;
        const fy = month >= 4 ? d.getFullYear() + 1 : d.getFullYear();
        const q = month >= 4 && month <= 6 ? "Q1" : month >= 7 && month <= 9 ? "Q2" : month >= 10 && month <= 12 ? "Q3" : "Q4";
        return `${q} FY${String(fy).slice(2)}`;
      }
    }
    return km["Quarter"] ?? "";
  })();

  // Summary footer metrics: use first 3 KPI tiles
  const summaryMetrics = kpiTiles.slice(0, 3).map((t) => ({
    label: t.label,
    value: t.value,
    sub: t.sub || t.signal?.label || "",
  }));

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
            {quarter && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)",
                background: "var(--qc-hair)", borderRadius: 4, padding: "2px 8px",
              }}>
                {quarter}
              </span>
            )}
          </div>
          <StatusBadge label={lens.status} color={lens.status === "STRONG" ? "var(--qc-up)" : lens.status === "WEAK" ? "var(--qc-down)" : "var(--qc-warn)"} />
        </div>

        {/* Description */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
            {lens.description}
          </p>
        </div>

        {/* 4-column KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ background: "var(--qc-card)", borderTop: "1px solid var(--qc-hair)" }}>
          {kpiTiles.map((tile, i) => (
            <div key={i} style={{
              padding: "14px 16px",
              borderRight: i < 3 ? "1px solid var(--qc-hair)" : undefined,
            }}>
              <p style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 6px",
              }}>
                {tile.label.slice(0, 28)}
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, color: tile.valueColor, margin: "0 0 4px", lineHeight: 1.1 }}>
                {tile.value.slice(0, 16)}
              </p>
              {tile.sub && (
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                  {tile.sub.slice(0, 70)}{tile.sub.length > 70 ? "…" : ""}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Detail signal rows in 2-column grid */}
        {detailSignals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{
            gap: 1, borderTop: "1px solid var(--qc-hair)",
            background: "var(--qc-hair)",
          }}>
            {detailSignals.slice(0, 4).map((s) => {
              const dir = signalDirection(s);
              const borderColor = dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)";
              const arrowColor = dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)";
              const arrow = dir === "up" ? "↑" : dir === "down" ? "↓" : "→";
              const badge = s.actual_value != null ? formatSignalValue(s) : undefined;

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

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div>
            <SectionLabel>MANAGEMENT CONSENSUS</SectionLabel>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "3px 0 0" }}>
              {lens.signal_count} signals{quarter ? ` · ${quarter}` : ""}
            </p>
          </div>
          <StatusBadge label={`${toneLabel} tone`} color={toneColor} />
        </div>

        <div style={{ padding: "12px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          {tailwindPct >= headwindPct ? (
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-up)", margin: "0 0 2px" }}>↑ Tailwinds Dominant</p>
          ) : (
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-down)", margin: "0 0 2px" }}>↓ Headwinds Dominant</p>
          )}
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
            {tailwindPct >= headwindPct
              ? lens.highlights[0]?.slice(0, 100) ?? "Positive signals dominant"
              : lens.risks[0]?.slice(0, 100) ?? "Risk signals dominant"}
          </p>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ background: "var(--qc-card)" }}>
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
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                    {h.slice(0, 120)}{h.length > 120 ? "…" : ""}
                  </p>
                </div>
              ))}
              {lens.highlights.length === 0 && (
                <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>No demand signals available</p>
              )}
            </div>
          </div>

          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <SectionLabel>SUPPLY SIGNALS</SectionLabel>
              <span style={{ fontSize: 10, fontWeight: 600, color: headwindPct > 50 ? "var(--qc-down)" : "var(--qc-warn)" }}>
                {headwindPct > 50 ? "▼ Dominant" : "▼ Moderate"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lens.risks.slice(0, 4).map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-down)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>↓</span>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                    {r.slice(0, 120)}{r.length > 120 ? "…" : ""}
                  </p>
                </div>
              ))}
              {lens.risks.length === 0 && (
                <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>No risk signals available</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway}
        metrics={summaryMetrics}
      />
    </div>
  );
}
