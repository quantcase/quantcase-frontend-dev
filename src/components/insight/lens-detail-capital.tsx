"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

const SUB_LENS_DEFS = [
  { key: "reinvestment", label: "Reinvestment quality", abbr: "RQ", description: "Capital deployed into core vs low-yield assets" },
  { key: "shareholder_returns", label: "Shareholder returns logic", abbr: "SR", description: "Dividend policy, buybacks, FCF linkage" },
  { key: "ma_discipline", label: "M&A discipline", abbr: "MA", description: "Acquisition quality, integration, goodwill" },
  { key: "capital_efficiency", label: "Capital efficiency trend", abbr: "CE", description: "ROA / ROE trajectory, cyclical adjustments" },
];

type SubLensData = {
  key: string;
  label: string;
  abbr: string;
  description: string;
  signals: Signal[];
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  score: number;
  max: number;
};

function buildSubLenses(signals: Signal[], keyMetrics: Record<string, string>): SubLensData[] {
  const kpiSignals = signals.filter((s) => s.signal_type === "kpi");
  const finSignals = signals.filter((s) => s.signal_type === "financial_health");
  const govSignals = signals.filter((s) => s.signal_type === "governance");
  const milestones = signals.filter((s) => s.signal_type === "milestone");

  // Capex, debt, revenue KPIs → reinvestment
  const reinvestmentSigs = [
    ...kpiSignals.filter((s) => ["CAPEX", "SEG_CAPEX_INCURRED", "SEG_EXT_DEBT", "SEG_NET_DEBT", "SEG_GF_UTIL", "SEG_GF_EBITDA_NET"].includes(s.metric)),
    ...finSignals.filter((s) => s.metric === "debt_trajectory" || s.metric === "working_capital_trend"),
  ];

  // EPS, dividends, equity → shareholder returns
  const shareholderSigs = kpiSignals.filter((s) => ["EPS_BASIC", "EPS_DILUTED", "EQ_SHARE_CAP", "PAT"].includes(s.metric));

  // Governance / capital allocation clarity → M&A discipline
  const maSigs = govSignals.filter((s) => s.metric === "capital_allocation_clarity" || s.metric === "guidance_given");

  // ROA-related: EBITDA, revenue, margin → capital efficiency
  const efficiencySigs = [
    ...kpiSignals.filter((s) => ["EBITDA", "REV_OP", "SEG_EXGF_EBITDA_MARGIN", "SEG_EXGF_EBITDA", "SEG_WH_REV_GROWTH"].includes(s.metric)),
    ...finSignals.filter((s) => s.metric === "margin_expansion_drivers" || s.metric === "operating_leverage"),
    ...milestones.filter((s) => s.metric === "EBITDA_MARGIN"),
  ];

  const sigMap: Record<string, Signal[]> = {
    reinvestment: reinvestmentSigs,
    shareholder_returns: shareholderSigs,
    ma_discipline: maSigs,
    capital_efficiency: efficiencySigs,
  };

  // Use key metrics as fallback scores if available
  const capexVal = parseFloat(keyMetrics["YoY Revenue Growth"] ?? "0") || 0;
  const ebitdaMargin = parseFloat(keyMetrics["Ex-Greenfields EBITDA Margin"] ?? "0") || 0;
  const extDebt = parseFloat(keyMetrics["External Debt"]?.replace(/[^\d.]/g, "") ?? "999") || 999;

  const heuristics: Record<string, number> = {
    reinvestment: extDebt < 50 ? 8 : extDebt < 200 ? 6 : 4,
    shareholder_returns: 6,
    ma_discipline: 8,
    capital_efficiency: ebitdaMargin >= 10 ? 8 : ebitdaMargin >= 6 ? 6 : 4,
  };

  return SUB_LENS_DEFS.map((def) => {
    const sigs = sigMap[def.key] ?? [];
    const rawScore = heuristics[def.key] ?? 5;
    const max = 10;
    const pct = (rawScore / max) * 100;

    let statusLabel: string;
    let statusColor: string;
    let statusBg: string;
    if (pct >= 70) {
      statusLabel = "DISCIPLINED"; statusColor = "var(--qc-up)"; statusBg = "rgba(31,122,74,0.10)";
    } else if (pct >= 40) {
      statusLabel = "MODERATE"; statusColor = "var(--qc-warn)"; statusBg = "rgba(180,115,26,0.10)";
    } else {
      statusLabel = "WEAK"; statusColor = "var(--qc-down)"; statusBg = "rgba(220,38,38,0.10)";
    }

    return { ...def, signals: sigs, score: rawScore, max, statusLabel, statusColor, statusBg };
  });
}

function SubLensCard({ sub }: { sub: SubLensData }) {
  const pct = (sub.score / sub.max) * 100;

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
      {/* Header */}
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
          borderRadius: 4, padding: "3px 8px", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          {sub.statusLabel}
        </span>
      </div>

      {/* Score bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "var(--qc-ink)" }}>{sub.score}</span>
          <span style={{ fontSize: 11, color: "var(--qc-ink-3)", alignSelf: "flex-end", marginBottom: 2 }}>/{sub.max}</span>
        </div>
        <div style={{ height: 4, borderRadius: 99, background: "var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: sub.statusColor, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Key signal bullets */}
      {sub.signals.slice(0, 4).map((s) => {
        const val = s.value;
        const dotColor = val !== null && val > 0 ? "var(--qc-up)" : val !== null && val < 0 ? "var(--qc-down)" : "var(--qc-ink-3)";
        const label = s.raw_value ?? s.metric.replace(/_/g, " ");
        return (
          <div key={s.id} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: dotColor }} />
            <p style={{ fontSize: 11, color: "var(--qc-ink-2)", margin: 0, lineHeight: 1.45 }}>
              <strong style={{ color: "var(--qc-ink)", fontWeight: 600 }}>{s.metric.replace(/_/g, " ").replace(/^SEG /, "")}</strong>
              {label !== s.metric.replace(/_/g, " ") ? ` — ${label}` : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Find a quote-worthy governance signal
function findQuote(signals: Signal[]): Signal | null {
  const candidates = signals.filter((s) => s.signal_type === "governance" && s.statement && s.statement.length > 40);
  return candidates[0] ?? null;
}

export function LensDetailCapital({ lens, signals }: Props) {
  const subLenses = buildSubLenses(signals, lens.key_metrics);
  const quote = findQuote(signals);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Key metrics grid */}
      {Object.keys(lens.key_metrics).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
          {Object.entries(lens.key_metrics).map(([k, v], i, arr) => (
            <div key={k} style={{
              padding: "12px 14px",
              background: "var(--qc-section)",
              borderRight: i % 2 === 0 ? "1px solid var(--qc-hair)" : undefined,
              borderBottom: i < arr.length - 2 ? "1px solid var(--qc-hair)" : undefined,
            }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 3px" }}>{k}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sub-lens 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {subLenses.map((sub) => <SubLensCard key={sub.key} sub={sub} />)}
      </div>

      {/* "In Their Own Words" quote */}
      {quote && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>
              CAPITAL ALLOCATION · IN THEIR OWN WORDS
            </p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{quote.call_date} · {quote.quarter} {quote.fiscal_year} analyst call</p>
          </div>
          <div style={{ padding: "16px 20px", background: "var(--qc-card)" }}>
            <div style={{ borderLeft: "3px solid var(--qc-ink-3)", paddingLeft: 14 }}>
              <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--qc-ink)", margin: 0, lineHeight: 1.7, fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>
                "{quote.statement}"
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "8px 0 0" }}>
                — Management · {quote.call_date}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards: highlights + risks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {lens.highlights.map((h, i) => (
          <div key={i} style={{
            padding: "12px 13px",
            background: "rgba(31,122,74,0.05)",
            border: "1px solid rgba(31,122,74,0.18)",
            borderLeft: "3px solid var(--qc-up)",
            borderRadius: 8,
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "var(--qc-up)", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Strength {i + 1}
            </p>
            <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{h}</p>
          </div>
        ))}
        {lens.risks.map((r, i) => (
          <div key={i} style={{
            padding: "12px 13px",
            background: "rgba(180,115,26,0.05)",
            border: "1px solid rgba(180,115,26,0.18)",
            borderLeft: "3px solid var(--qc-warn)",
            borderRadius: 8,
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "var(--qc-warn)", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Watch {i + 1}
            </p>
            <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{r}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
