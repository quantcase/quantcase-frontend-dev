"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// Fixed KPI metrics that always appear in the top strip (from peer_context signals)
const KPI_METRICS = [
  "INDUSTRY_REVENUE",
  "INDUSTRY_REV_CAGR_3Y",
  "INDUSTRY_OPM",
  "INDUSTRY_ROCE",
] as const;

// Management consensus signal metrics (from peer_context)
const MGMT_DEMAND_BULLISH = "MGMT_DEMAND_BULLISH_COUNT";
const MGMT_DEMAND_TOTAL = "MGMT_DEMAND_TOTAL_COUNT";
const MGMT_SUPPLY_TIGHT = "MGMT_SUPPLY_TIGHT_COUNT";
const MGMT_SUPPLY_TOTAL = "MGMT_SUPPLY_TOTAL_COUNT";

const PEER_CONTEXT_METRICS = new Set([
  ...KPI_METRICS,
  MGMT_DEMAND_BULLISH,
  MGMT_DEMAND_TOTAL,
  MGMT_SUPPLY_TIGHT,
  MGMT_SUPPLY_TOTAL,
]);

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

function StatusBadge({ label, color }: { label: string; color: string }) {
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

function formatKpiValue(s: TopSignal): string {
  if (s.actual_value == null) return "—";
  const v = s.actual_value;
  const unit = s.unit ?? "";

  if (s.metric === "INDUSTRY_REVENUE") {
    // Express in Lakh Cr or Cr
    const cr = v / 1e7; // paise→Cr? Actually value is in raw INR
    // The API returns raw values like 3358401100000 (3.3 lakh Cr)
    if (v >= 1e12) return `₹${(v / 1e12).toFixed(1)}L Cr`;
    if (v >= 1e9) return `₹${(v / 1e7).toFixed(1)} Cr`;
    return `₹${v.toLocaleString("en-IN")}`;
  }
  if (unit === "%") return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "bps") return `${v} bps`;
  if (unit === "INR/KG") return `₹${v.toLocaleString("en-IN")}/kg`;
  if (unit === "USD/MT") return `$${v.toLocaleString("en-US")}/MT`;
  if (unit === "transcripts") return String(v);
  if (unit === "x") return `${v}x`;
  return String(v);
}

function formatSignalBadge(s: TopSignal): string | null {
  if (s.actual_value == null) return null;
  const v = s.actual_value;
  const unit = s.unit ?? "";
  if (unit === "%") return `${v > 0 ? "+" : ""}${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "INR/KG") return `₹${v.toLocaleString("en-IN")}`;
  if (unit === "USD/MT") return `$${v.toLocaleString("en-US")}`;
  if (unit === "x") return `${v}x`;
  if (unit === "transcripts") return `${v}`;
  if (s.delta_pct != null && s.delta_pct !== 0) return `${s.delta_pct > 0 ? "+" : ""}${s.delta_pct.toFixed(0)}%`;
  return null;
}

function signalDir(s: TopSignal): "up" | "down" | "neutral" {
  if (s.direction === "beat" || s.direction === "above" || s.direction === "in_line") return "up";
  if (s.direction === "miss" || s.direction === "below" || s.direction === "major_miss") return "down";
  const text = ((s.label ?? "") + " " + (s.statement ?? "")).toLowerCase();
  if (text.includes("pressure") || text.includes("headwind") || text.includes("soft") || text.includes("declin")) return "down";
  return "neutral";
}

function toneFromSignals(signals: Signal[]): { label: string; color: string } {
  const toneSignal = signals.find((s) => s.signal_type === "tone");
  const label = toneSignal?.raw_value ?? "Neutral";
  const lower = label.toLowerCase();
  const color =
    lower.includes("confident") || lower.includes("positive") || lower.includes("bullish")
      ? "var(--qc-up)"
      : lower.includes("cautious") || lower.includes("concern") || lower.includes("warning")
      ? "var(--qc-warn)"
      : "var(--qc-ink-3)";
  return { label, color };
}

function deriveQuarter(lens: LensDetail): string {
  if (lens.computed_at) {
    const d = new Date(lens.computed_at);
    if (!isNaN(d.getTime())) {
      const month = d.getMonth() + 1;
      const fy = month >= 4 ? d.getFullYear() + 1 : d.getFullYear();
      const q = month >= 4 && month <= 6 ? "Q1"
        : month >= 7 && month <= 9 ? "Q2"
        : month >= 10 && month <= 12 ? "Q3"
        : "Q4";
      return `${q} FY${String(fy).slice(2)}`;
    }
  }
  return lens.key_metrics["Quarter"] ?? "";
}

export function LensDetailIndustry({ lens, signals }: Props) {
  const topSignals = lens.top_signals ?? [];

  // --- KPI tiles: fixed 4 peer_context signals by metric name ---
  const kpiSignalMap = new Map<string, TopSignal>();
  for (const s of topSignals) {
    if (!kpiSignalMap.has(s.metric)) kpiSignalMap.set(s.metric, s);
  }

  const kpiTiles = KPI_METRICS.map((metric) => {
    const s = kpiSignalMap.get(metric);
    if (!s) return null;
    const dir = signalDir(s);
    const valueColor =
      dir === "up" ? "var(--qc-up)" :
      dir === "down" ? "var(--qc-down)" :
      "var(--qc-ink)";
    return { s, displayValue: formatKpiValue(s), valueColor };
  }).filter(Boolean) as { s: TopSignal; displayValue: string; valueColor: string }[];

  // --- Management consensus counts ---
  const demandBullish = kpiSignalMap.get(MGMT_DEMAND_BULLISH)?.actual_value ?? 0;
  const demandTotal = kpiSignalMap.get(MGMT_DEMAND_TOTAL)?.actual_value ?? 0;
  const supplyTight = kpiSignalMap.get(MGMT_SUPPLY_TIGHT)?.actual_value ?? 0;
  const supplyTotal = kpiSignalMap.get(MGMT_SUPPLY_TOTAL)?.actual_value ?? 0;

  const demandBullishStatement = kpiSignalMap.get(MGMT_DEMAND_BULLISH)?.statement ?? "";
  const supplyTightStatement = kpiSignalMap.get(MGMT_SUPPLY_TIGHT)?.statement ?? "";

  // Transcript count: use signal_count, or fallback from metadata
  const transcriptCount = kpiSignalMap.get(MGMT_DEMAND_TOTAL)?.actual_value
    ? String(kpiSignalMap.get(MGMT_DEMAND_TOTAL)?.actual_value)
    : String(Math.max(demandTotal, supplyTotal));

  // Tailwind vs headwind bar: use demand bullish / (demand + supply total)
  const totalConsensus = (demandTotal + supplyTotal) || 1;
  const tailwindPct = Math.round((demandBullish / totalConsensus) * 100);
  const headwindPct = 100 - tailwindPct;
  const tailwindsDominant = tailwindPct >= headwindPct;

  // --- Detail signal rows: non-peer_context, deduplicated ---
  const detailSignals: TopSignal[] = [];
  const seenIds = new Set<string>();
  for (const s of topSignals) {
    if (PEER_CONTEXT_METRICS.has(s.metric as typeof KPI_METRICS[number])) continue;
    if (seenIds.has(s.signal_id)) continue;
    seenIds.add(s.signal_id);
    detailSignals.push(s);
  }

  // Split detail signals into demand (up) and supply (down/neutral)
  const demandSignals = detailSignals.filter((s) => signalDir(s) === "up");
  const supplySignals = detailSignals.filter((s) => signalDir(s) !== "up");

  const { label: toneLabel, color: toneColor } = toneFromSignals(signals);
  const quarter = deriveQuarter(lens);

  // Summary card metrics
  const summaryMetrics = kpiTiles.slice(0, 3).map((t) => ({
    label: t.s.label,
    value: t.displayValue,
    sub: t.s.statement?.slice(0, 60) ?? "",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── INDUSTRY KPIS ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Header row */}
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
          <StatusBadge
            label={lens.status ?? "Neutral"}
            color={
              lens.status === "STRONG" ? "var(--qc-up)" :
              lens.status === "WEAK" ? "var(--qc-down)" :
              "var(--qc-warn)"
            }
          />
        </div>

        {/* Takeaway description */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
            {lens.takeaway ?? lens.description}
          </p>
        </div>

        {/* 4-column KPI strip */}
        {kpiTiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ background: "var(--qc-card)" }}>
            {kpiTiles.map((tile, i) => (
              <div key={tile.s.metric} style={{
                padding: "14px 16px",
                borderRight: i < kpiTiles.length - 1 ? "1px solid var(--qc-hair)" : undefined,
                borderTop: "1px solid var(--qc-hair)",
              }}>
                <p style={{
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 6px",
                }}>
                  {tile.s.label}
                </p>
                <p style={{
                  fontSize: 22, fontWeight: 600, color: tile.valueColor,
                  margin: "0 0 4px", lineHeight: 1.1,
                }}>
                  {tile.displayValue}
                </p>
                {tile.s.statement && (
                  <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                    {tile.s.statement.slice(0, 80)}{tile.s.statement.length > 80 ? "…" : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail signal rows — 2-column grid */}
        {detailSignals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{
            gap: 1,
            borderTop: "1px solid var(--qc-hair)",
            background: "var(--qc-hair)",
          }}>
            {detailSignals.map((s) => {
              const dir = signalDir(s);
              const borderColor = dir === "up" ? "var(--qc-up)" : dir === "down" ? "var(--qc-down)" : "var(--qc-warn)";
              const arrowColor = borderColor;
              const arrow = dir === "up" ? "↑" : dir === "down" ? "↓" : "→";
              const badge = formatSignalBadge(s);

              return (
                <div key={s.signal_id} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 16px",
                  background: "var(--qc-card)",
                  borderLeft: `3px solid ${borderColor}`,
                }}>
                  <span style={{ flexShrink: 0, marginTop: 1, color: arrowColor, fontWeight: 700, fontSize: 13 }}>
                    {arrow}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>
                      {s.label}
                    </p>
                    {s.statement && (
                      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.5 }}>
                        {s.statement.slice(0, 110)}{s.statement.length > 110 ? "…" : ""}
                      </p>
                    )}
                  </div>
                  {badge && (
                    <span style={{
                      flexShrink: 0, fontSize: 10, fontWeight: 700,
                      color: arrowColor, whiteSpace: "nowrap", marginTop: 2,
                    }}>
                      {badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MANAGEMENT CONSENSUS ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SectionLabel>MANAGEMENT CONSENSUS</SectionLabel>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)",
              background: "var(--qc-hair)", borderRadius: 4, padding: "2px 8px",
            }}>
              {transcriptCount} transcripts{quarter ? ` · ${quarter}` : ""}
            </span>
          </div>
          <StatusBadge label={`${toneLabel} tone`} color={toneColor} />
        </div>

        {/* Headline + subtitle */}
        <div style={{ padding: "12px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 2px",
            color: tailwindsDominant ? "var(--qc-up)" : "var(--qc-down)",
          }}>
            {tailwindsDominant ? "↑ Tailwinds Dominant" : "↓ Headwinds Dominant"}
          </p>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
            {tailwindsDominant
              ? (demandBullishStatement || lens.highlights[0]?.slice(0, 100) || "Positive demand signals dominant")
              : (supplyTightStatement || lens.risks[0]?.slice(0, 100) || "Supply pressure increasing")}
          </p>
        </div>

        {/* Tailwind / headwind bar */}
        <div style={{ padding: "12px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-up)" }}>
              ↑ Tailwinds {tailwindPct}%
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-down)" }}>
              {headwindPct}% Headwinds ↓
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 99, overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${tailwindPct}%`, background: "var(--qc-up)", transition: "width 0.5s ease" }} />
            <div style={{ flex: 1, background: "var(--qc-down)" }} />
          </div>
        </div>

        {/* Demand / Supply signal columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ background: "var(--qc-card)" }}>

          {/* Demand signals */}
          <div style={{ padding: "14px 16px", borderRight: "1px solid var(--qc-hair)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>DEMAND SIGNALS</SectionLabel>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: tailwindsDominant ? "var(--qc-up)" : "var(--qc-down)",
              }}>
                {tailwindsDominant ? "▲ Strong" : "▼ Weakening"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {demandSignals.length > 0 ? demandSignals.map((s) => (
                <div key={s.signal_id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-up)", fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 11 }}>↑</span>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, flex: 1, lineHeight: 1.5 }}>
                    {s.label}
                    {s.statement && (
                      <span style={{ color: "var(--qc-ink-3)", fontWeight: 400 }}>
                        {" — "}{s.statement.slice(0, 80)}{s.statement.length > 80 ? "…" : ""}
                      </span>
                    )}
                  </p>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-ink-3)", flexShrink: 0 }}>
                    100%
                  </span>
                </div>
              )) : lens.highlights.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-up)", fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 11 }}>↑</span>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                    {h}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Supply signals */}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>SUPPLY SIGNALS</SectionLabel>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: !tailwindsDominant ? "var(--qc-down)" : "var(--qc-warn)",
              }}>
                {!tailwindsDominant ? "▼ Pressure rising" : "▼ Moderate"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {supplySignals.length > 0 ? supplySignals.map((s) => (
                <div key={s.signal_id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-down)", fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 11 }}>↓</span>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, flex: 1, lineHeight: 1.5 }}>
                    {s.label}
                    {s.statement && (
                      <span style={{ color: "var(--qc-ink-3)", fontWeight: 400 }}>
                        {" — "}{s.statement.slice(0, 80)}{s.statement.length > 80 ? "…" : ""}
                      </span>
                    )}
                  </p>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-ink-3)", flexShrink: 0 }}>
                    100%
                  </span>
                </div>
              )) : lens.risks.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--qc-down)", fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 11 }}>↓</span>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>
                    {r}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway ?? lens.description}
        metrics={[]}
      />
    </div>
  );
}
