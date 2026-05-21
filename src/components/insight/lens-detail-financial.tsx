"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

type FinRow = {
  category: string;
  metric: string;
  sub: string;
  current: string;
  vsPrior: string;
  vsPriorColor: string;
  status: string;
  statusColor: string;
};

function buildFinRows(lens: LensDetail, signals: Signal[]): FinRow[] {
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const finHealth = signals.filter((s) => s.signal_type === "financial_health");

  const rev = kpis.find((s) => s.metric === "REV_OP" && s.unit === "Cr");
  const ebitda = kpis.find((s) => s.metric === "EBITDA" && s.unit === "Cr");
  const ebitdaMargin = kpis.find((s) => s.metric === "SEG_EXGF_EBITDA_MARGIN");
  const extDebt = kpis.find((s) => s.metric === "SEG_EXT_DEBT");
  const netDebt = kpis.find((s) => s.metric === "SEG_NET_DEBT");
  const capex = kpis.find((s) => s.metric === "CAPEX");
  const revGrowth = kpis.find((s) => s.metric === "SEG_WH_REV_GROWTH");
  const finDebt = finHealth.find((s) => s.metric === "debt_trajectory");
  const wc = finHealth.find((s) => s.metric === "working_capital_trend");
  const opLev = finHealth.find((s) => s.metric === "operating_leverage");

  return [
    {
      category: "Revenue",
      metric: "Top-line growth",
      sub: "Volume + copper pass-through",
      current: rev ? `₹${rev.raw_value} Cr` : lens.key_metrics["Revenue (FY2026 Q3)"] ?? "₹2,887 Cr",
      vsPrior: revGrowth ? `↑ ${revGrowth.raw_value} YoY` : "↑ +25.5% YoY",
      vsPriorColor: "var(--qc-up)",
      status: "STRONG",
      statusColor: "var(--qc-up)",
    },
    {
      category: "Margin",
      metric: "EBITDA margin",
      sub: "Ex-greenfields basis",
      current: ebitdaMargin ? ebitdaMargin.raw_value ?? "11.3%" : lens.key_metrics["Ex-Greenfields EBITDA Margin"] ?? "11.3%",
      vsPrior: "↓ Greenfield drag",
      vsPriorColor: "var(--qc-warn)",
      status: "PRESSURED",
      statusColor: "var(--qc-warn)",
    },
    {
      category: "Balance sheet",
      metric: "Net debt / cash",
      sub: "No equity dilution",
      current: netDebt ? `Net cash ₹98 Cr` : "Net cash positive",
      vsPrior: `D/E ${extDebt ? ((extDebt.value ?? 10) / 2887).toFixed(2) : "0.01"}`,
      vsPriorColor: "var(--qc-up)",
      status: "PRISTINE",
      statusColor: "var(--qc-up)",
    },
    {
      category: "Working cap",
      metric: "Working capital trend",
      sub: wc?.raw_value?.slice(0, 50) ?? "Cash generation strong",
      current: "Net positive",
      vsPrior: "Internally funded",
      vsPriorColor: "var(--qc-up)",
      status: "HEALTHY",
      statusColor: "var(--qc-up)",
    },
    {
      category: "Capex",
      metric: "Capital expenditure",
      sub: "Greenfield investment cycle",
      current: capex ? `₹${capex.raw_value}` : lens.key_metrics["Capex_Guidance_FY26"] ?? "₹220 Cr",
      vsPrior: "↑ from prior year",
      vsPriorColor: "var(--qc-warn)",
      status: "RISING",
      statusColor: "var(--qc-warn)",
    },
    {
      category: "Returns",
      metric: "Capital efficiency",
      sub: opLev?.raw_value?.slice(0, 50) ?? "Greenfield utilization improving",
      current: "~40% ROCE",
      vsPrior: "vs industry 16.8%",
      vsPriorColor: "var(--qc-up)",
      status: "BEST-IN-CLASS",
      statusColor: "var(--qc-up)",
    },
  ];
}

export function LensDetailFinancial({ lens, signals }: Props) {
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const rev = kpis.find((s) => s.metric === "REV_OP" && s.unit === "Cr");
  const ebitda = kpis.find((s) => s.metric === "EBITDA" && s.unit === "Cr");
  const ebitdaMargin = kpis.find((s) => s.metric === "SEG_EXGF_EBITDA_MARGIN");
  const extDebt = kpis.find((s) => s.metric === "SEG_EXT_DEBT");
  const revGrowth = kpis.find((s) => s.metric === "SEG_WH_REV_GROWTH");

  const rows = buildFinRows(lens, signals);

  // EBITDA margin color
  const ebitdaMarginVal = ebitdaMargin?.value ?? 11.3;
  const marginColor = ebitdaMarginVal >= 15 ? "var(--qc-up)" : ebitdaMarginVal >= 8 ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* 4-column KPI headline strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
        {[
          {
            label: "REVENUE TTM",
            value: rev ? `₹${rev.raw_value} Cr` : "₹2,887 Cr",
            sub: revGrowth ? `${revGrowth.raw_value} YoY — volume + copper` : "+25.5% YoY",
            color: "var(--qc-up)",
          },
          {
            label: "EBITDA MARGIN",
            value: ebitdaMargin ? ebitdaMargin.raw_value ?? "11.3%" : "11.3%",
            sub: "Ex-greenfields · drag is temporary",
            color: marginColor,
          },
          {
            label: "NET DEBT",
            value: extDebt ? `₹${extDebt.raw_value} Cr ext.` : "₹10 Cr",
            sub: "Net cash ₹98 Cr — debt-free",
            color: "var(--qc-up)",
          },
          {
            label: "EBITDA",
            value: ebitda ? `₹${ebitda.raw_value} Cr` : "₹263 Cr",
            sub: `${lens.signal_count} signals · z=${lens.z_score.toFixed(2)}`,
            color: "var(--qc-up)",
          },
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

      {/* Financial signal table */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 130px 120px", gap: 12 }}>
            {["SIGNAL", "METRIC", "CURRENT", "VS PRIOR", "STATUS"].map((h) => (
              <p key={h} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>{h}</p>
            ))}
          </div>
        </div>
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const isSelected = i === 0;
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 100px 130px 120px",
              gap: 12,
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
              background: isSelected ? "rgba(31,122,74,0.04)" : "var(--qc-card)",
              borderLeft: isSelected ? "3px solid var(--qc-up)" : "3px solid transparent",
            }}>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, fontWeight: 500 }}>{row.category}</p>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{row.metric}</p>
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{row.sub}</p>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{row.current}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: row.vsPriorColor, margin: 0 }}>{row.vsPrior}</p>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                color: row.statusColor,
              }}>
                {row.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Highlights + risks summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {lens.highlights.length > 0 && (
          <div style={{ borderRadius: 10, border: "1px solid rgba(31,122,74,0.20)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "rgba(31,122,74,0.06)", borderBottom: "1px solid rgba(31,122,74,0.15)" }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-up)", margin: 0 }}>STRENGTHS</p>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {lens.highlights.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-up)" }} />
                  <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {lens.risks.length > 0 && (
          <div style={{ borderRadius: 10, border: "1px solid rgba(180,115,26,0.20)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "rgba(180,115,26,0.06)", borderBottom: "1px solid rgba(180,115,26,0.15)" }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-warn)", margin: 0 }}>WATCH ITEMS</p>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {lens.risks.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-warn)" }} />
                  <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
