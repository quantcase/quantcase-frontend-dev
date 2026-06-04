"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  isBfsi?: boolean;
}

const KPI_METRICS_NON_BFSI = [
  "INDUSTRY_REVENUE",
  "INDUSTRY_REV_CAGR_3Y",
  "INDUSTRY_OPM",
  "INDUSTRY_ROCE",
] as const;

const BFSI_LOAN_BOOK_VARIANTS = ["INDUSTRY_AUM", "INDUSTRY_LOAN_ADV"] as const;

const KPI_METRICS_BFSI_BASE = [
  "INDUSTRY_ROA",
  "INDUSTRY_NIM",
  "INDUSTRY_REV_CAGR_3Y",
] as const;

const MGMT_DEMAND_BULLISH = "MGMT_DEMAND_BULLISH_COUNT";
const MGMT_SUPPLY_TIGHT = "MGMT_SUPPLY_TIGHT_COUNT";

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
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

  if (s.metric === "INDUSTRY_REVENUE" || s.metric === "INDUSTRY_AUM" || s.metric === "INDUSTRY_LOAN_ADV") {
    if (v >= 1e12) return `₹${(v / 1e12).toFixed(1)}L Cr`;
    if (v >= 1e9) return `₹${(v / 1e7).toFixed(1)} Cr`;
    return `₹${v.toLocaleString("en-IN")}`;
  }
  if (unit === "%") return `${v}%`;
  if (unit === "Cr") return `₹${v.toLocaleString("en-IN")} Cr`;
  if (unit === "bps") return `${v} bps`;
  if (unit === "INR/KG") return `₹${v.toLocaleString("en-IN")}/kg`;
  if (unit === "USD/MT") return `$${v.toLocaleString("en-US")}/MT`;
  if (unit === "x") return `${v}x`;
  return String(v);
}

function signalDir(s: TopSignal): "up" | "down" | "neutral" {
  if (s.direction === "beat" || s.direction === "above" || s.direction === "in_line") return "up";
  if (s.direction === "miss" || s.direction === "below" || s.direction === "major_miss") return "down";
  const text = ((s.label ?? "") + " " + (s.statement ?? "")).toLowerCase();
  if (text.includes("pressure") || text.includes("headwind") || text.includes("soft") || text.includes("declin")) return "down";
  return "neutral";
}


export function LensDetailIndustry({ lens, isBfsi }: Props) {
  const topSignals = lens.top_signals ?? [];

  const signalMap = new Map<string, TopSignal>();
  for (const s of topSignals) {
    if (!signalMap.has(s.metric)) signalMap.set(s.metric, s);
  }

  // KPI tiles
  const loanBookMetric = BFSI_LOAN_BOOK_VARIANTS.find((m) => signalMap.has(m)) ?? BFSI_LOAN_BOOK_VARIANTS[0];
  const KPI_METRICS: readonly string[] = isBfsi
    ? [...KPI_METRICS_BFSI_BASE, loanBookMetric]
    : KPI_METRICS_NON_BFSI;

  const kpiTiles = KPI_METRICS.map((metric) => {
    const s = signalMap.get(metric);
    if (!s) return null;
    const dir = signalDir(s);
    const valueColor =
      dir === "up" ? "var(--qc-up)" :
      dir === "down" ? "var(--qc-down)" :
      "var(--qc-ink)";
    return { s, displayValue: formatKpiValue(s), valueColor };
  }).filter(Boolean) as { s: TopSignal; displayValue: string; valueColor: string }[];

  // Management consensus counts
  const demandBullish = signalMap.get(MGMT_DEMAND_BULLISH)?.actual_value ?? 0;
  const supplyTight = signalMap.get(MGMT_SUPPLY_TIGHT)?.actual_value ?? 0;

  // Tailwind % = bullish demand signals / (bullish demand + tight supply)
  const totalSentiment = (demandBullish + supplyTight) || 1;
  const tailwindPct = Math.round((demandBullish / totalSentiment) * 100);
  const headwindPct = 100 - tailwindPct;
  const tailwindsDominant = tailwindPct >= headwindPct;


  // Exclude KPI and MGMT metrics; classify remaining by metric prefix then direction
  const KPI_PREFIXES = ["INDUSTRY_", "MGMT_"];
  const detailSignals = topSignals.filter(
    (s) => !KPI_PREFIXES.some((p) => s.metric.startsWith(p))
  );
  const demandSignals = detailSignals.filter((s) => s.metric.startsWith("DEMAND_"));
  const supplySignals = detailSignals.filter((s) => s.metric.startsWith("SUPPLY_"));
  // Signals that don't match either prefix fall back to direction-based classification
  const unclassified = detailSignals.filter(
    (s) => !s.metric.startsWith("DEMAND_") && !s.metric.startsWith("SUPPLY_")
  );
  const allDemandSignals = [
    ...demandSignals,
    ...unclassified.filter((s) => s.direction === "beat" || s.direction === "above" || s.direction === "tracking" || s.direction === "in_line"),
  ];
  const allSupplySignals = [
    ...supplySignals,
    ...unclassified.filter((s) => s.direction === "miss" || s.direction === "below" || s.direction === "major_miss"),
  ];

  // Tone derived from tailwind ratio
  const toneLabel = tailwindPct >= 60
    ? "reasonably sanguine and happy tone"
    : tailwindPct >= 40
    ? "mixed tone"
    : "cautious tone";
  const toneColor = tailwindPct >= 60 ? "var(--qc-up)" : tailwindPct >= 40 ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── INDUSTRY KPIS ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <SectionLabel>INDUSTRY KPIS</SectionLabel>
          <StatusBadge
            label={toTitleCase(lens.status ?? "Neutral")}
            color={
              lens.status === "STRONG" ? "var(--qc-up)" :
              lens.status === "WEAK" ? "var(--qc-down)" :
              "var(--qc-warn)"
            }
          />
        </div>

        <div style={{ padding: "12px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", margin: 0, lineHeight: 1.7 }}>
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
                  {(tile.s.metric === "INDUSTRY_AUM" || tile.s.metric === "INDUSTRY_LOAN_ADV") ? "Industry AUM" : tile.s.label}
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

        {/* Highlights & Risks — 2-column layout with headers */}
        {(lens.highlights.length > 0 || lens.risks.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{
            borderTop: "1px solid var(--qc-hair)",
            background: "var(--qc-card)",
          }}>
            {/* Highlights column */}
            <div style={{ padding: "14px 16px", borderRight: "1px solid var(--qc-hair)" }}>
              <div style={{ marginBottom: 10 }}>
                <SectionLabel>HIGHLIGHTS</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lens.highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ flexShrink: 0, color: "var(--qc-up)", fontWeight: 700, fontSize: 11 }}>↑</span>
                    <p style={{ fontSize: 11, fontWeight: 400, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>{h}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Risks column */}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ marginBottom: 10 }}>
                <SectionLabel>RISKS</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lens.risks.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ flexShrink: 0, color: "var(--qc-down)", fontWeight: 700, fontSize: 11 }}>↓</span>
                    <p style={{ fontSize: 11, fontWeight: 400, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.5 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MANAGEMENT CONSENSUS ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <SectionLabel>MANAGEMENT CONSENSUS</SectionLabel>
          <StatusBadge label={toTitleCase(toneLabel)} color={toneColor} />
        </div>

        <div style={{ padding: "12px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{
            fontSize: 16, fontWeight: 700, margin: "0 0 2px",
            color: tailwindsDominant ? "var(--qc-up)" : "var(--qc-down)",
          }}>
            {tailwindsDominant ? "↑ Tailwinds Dominant" : "↓ Headwinds Dominant"}
          </p>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
            {tailwindsDominant
              ? (allDemandSignals[0]?.statement ?? lens.highlights[0]?.slice(0, 100) ?? "Positive demand signals dominant")
              : (allSupplySignals[0]?.statement ?? lens.risks[0]?.slice(0, 100) ?? "Supply pressure increasing")}
          </p>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ background: "var(--qc-card)" }}>

          <div style={{ padding: "14px 16px", borderRight: "1px solid var(--qc-hair)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>DEMAND SIGNALS</SectionLabel>
              <span style={{ fontSize: 10, fontWeight: 600, color: tailwindsDominant ? "var(--qc-up)" : "var(--qc-down)" }}>
                {tailwindsDominant ? "▲ Strong" : "▼ Weakening"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allDemandSignals.map((s) => (
                <div key={s.signal_id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: "var(--qc-ink-3)", display: "inline-block" }} />
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, flex: 1, lineHeight: 1.5 }}>
                    {s.label}
                    {s.statement && (
                      <span style={{ color: "var(--qc-ink-3)", fontWeight: 400 }}>
                        {" — "}{s.statement}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>SUPPLY SIGNALS</SectionLabel>
              <span style={{ fontSize: 10, fontWeight: 600, color: !tailwindsDominant ? "var(--qc-down)" : "var(--qc-warn)" }}>
                {!tailwindsDominant ? "▼ Pressure rising" : "▼ Moderate"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allSupplySignals.map((s) => (
                <div key={s.signal_id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: "var(--qc-ink-3)", display: "inline-block" }} />
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, flex: 1, lineHeight: 1.5 }}>
                    {s.label}
                    {s.statement && (
                      <span style={{ color: "var(--qc-ink-3)", fontWeight: 400 }}>
                        {" — "}{s.statement}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <LensDrawerSummaryCard
        title={lens.name}
        body={lens.takeaway ?? lens.description}
        metrics={[]}
      />
    </div>
  );
}
