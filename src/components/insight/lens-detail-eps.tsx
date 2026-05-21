"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// ─── P&L Waterfall ─────────────────────────────────────────────────────────────

type WaterfallItem = {
  label: string;
  value: number;
  type: "total" | "cost" | "subtotal" | "result";
  pct?: number;
};

function buildWaterfall(signals: Signal[]): WaterfallItem[] {
  const kpis = signals.filter((s) => s.signal_type === "kpi" && s.unit === "Cr" && s.value && s.value > 1_000_000);
  const get = (metric: string) => {
    const s = kpis.find((k) => k.metric === metric);
    return s ? Math.round(s.value! / 1e7) : null;
  };

  const rev = get("TOTAL_INCOME") ?? 2887;
  const costMat = get("COST_MAT") ?? 2017;
  const empExp = get("EMP_EXP") ?? 498;
  const othExp = get("OTH_EXP") ?? 177;
  const dep = get("DEP_AMORT") ?? 57;
  const fin = get("FIN_COST") ?? 7;
  const tax = get("TOTAL_TAX_EXP") ?? 50;
  const pat = get("PAT") ?? 149;

  const grossProfit = rev - costMat;
  const ebitda = grossProfit - empExp - othExp;
  const pbt = ebitda - dep - fin;

  return [
    { label: "Revenue", value: rev, type: "total", pct: 100 },
    { label: "Material cost", value: -costMat, type: "cost", pct: Math.round((costMat / rev) * 100) },
    { label: "Gross profit", value: grossProfit, type: "subtotal", pct: Math.round((grossProfit / rev) * 100) },
    { label: "Employee exp.", value: -empExp, type: "cost", pct: Math.round((empExp / rev) * 100) },
    { label: "Other opex", value: -othExp, type: "cost", pct: Math.round((othExp / rev) * 100) },
    { label: "EBITDA", value: ebitda, type: "subtotal", pct: Math.round((ebitda / rev) * 100) },
    { label: "D&A + Finance", value: -(dep + fin), type: "cost", pct: Math.round(((dep + fin) / rev) * 100) },
    { label: "PBT", value: pbt, type: "subtotal", pct: Math.round((pbt / rev) * 100) },
    { label: "Tax", value: -tax, type: "cost", pct: Math.round((tax / rev) * 100) },
    { label: "PAT", value: pat, type: "result", pct: Math.round((pat / rev) * 100) },
  ];
}

function WaterfallRow({ item, maxAbs, delay }: { item: WaterfallItem; maxAbs: number; delay: number }) {
  const isPositive = item.value > 0;
  const isCost = item.type === "cost";
  const isSubtotal = item.type === "subtotal";
  const isResult = item.type === "result";
  const isTotal = item.type === "total";

  const barColor = isResult
    ? "var(--qc-up)"
    : isTotal
    ? "var(--qc-ink)"
    : isSubtotal
    ? "var(--qc-ink-2)"
    : "var(--qc-down)";

  const barWidth = Math.min(100, Math.abs((item.value / maxAbs) * 100));
  const bgColor = isResult
    ? "rgba(31,122,74,0.06)"
    : isSubtotal
    ? "var(--qc-section)"
    : "var(--qc-card)";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "130px 1fr 70px 50px",
      gap: 10,
      alignItems: "center",
      padding: isSubtotal || isResult || isTotal ? "10px 14px" : "7px 14px",
      borderBottom: "1px solid var(--qc-hair)",
      background: bgColor,
      borderLeft: isResult ? "3px solid var(--qc-up)" : isTotal ? "3px solid var(--qc-ink)" : "3px solid transparent",
    }}>
      <p style={{
        fontSize: isSubtotal || isResult || isTotal ? 12 : 11,
        fontWeight: isSubtotal || isResult || isTotal ? 700 : 400,
        color: isResult ? "var(--qc-up)" : "var(--qc-ink)",
        margin: 0,
        paddingLeft: isCost ? 10 : 0,
      }}>
        {isCost ? "−" : ""}{item.label}
      </p>
      <div style={{ height: 6, borderRadius: 99, background: "var(--qc-hair)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.5, delay, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 99, background: barColor }}
        />
      </div>
      <p style={{
        fontSize: isSubtotal || isResult || isTotal ? 13 : 12,
        fontWeight: isSubtotal || isResult || isTotal ? 700 : 400,
        color: isCost ? "var(--qc-down)" : isResult ? "var(--qc-up)" : "var(--qc-ink)",
        margin: 0, textAlign: "right",
      }}>
        ₹{Math.abs(item.value).toLocaleString("en-IN")} Cr
      </p>
      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, textAlign: "right" }}>
        {item.pct}%
      </p>
    </div>
  );
}

// ─── Segment split ──────────────────────────────────────────────────────────────

function SegmentSplit({ signals, lens }: { signals: Signal[]; lens: LensDetail }) {
  const kpis = signals.filter((s) => s.signal_type === "kpi" && s.unit === "Cr");
  const exGfRev = kpis.find((s) => s.metric === "SEG_EXGF_REV_OP")?.value ?? 2637;
  const exGfEbitda = kpis.find((s) => s.metric === "SEG_EXGF_EBITDA")?.value ?? 299;
  const exGfPat = kpis.find((s) => s.metric === "SEG_EXGF_PAT")?.value ?? 182;
  const gfEbitda = kpis.find((s) => s.metric === "SEG_GF_EBITDA_NET")?.value ?? 250;
  const exGfMargin = kpis.find((s) => s.metric === "SEG_EXGF_EBITDA_MARGIN")?.value ?? 11.3;
  const totalRev = kpis.find((s) => s.metric === "REV_OP" && s.value && s.value < 10000)?.value ?? 2887;

  const gfRev = totalRev - exGfRev;
  const exGfPct = Math.round((exGfRev / totalRev) * 100);
  const gfPct = 100 - exGfPct;

  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>EARNINGS ATTRIBUTION · EX-GF vs GREENFIELDS</p>
      </div>

      {/* Revenue bar split */}
      <div style={{ padding: "14px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Revenue split · ₹{totalRev.toLocaleString("en-IN")} Cr total</p>
        <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", gap: 1 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${exGfPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: "var(--qc-ink)", borderRadius: "99px 0 0 99px" }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${gfPct}%` }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            style={{ background: "var(--qc-ink-3)", borderRadius: "0 99px 99px 0" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "var(--qc-ink)", fontWeight: 600 }}>Ex-GF {exGfPct}% · ₹{exGfRev} Cr</span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)", fontWeight: 600 }}>Greenfields {gfPct}% · ₹{gfRev} Cr</span>
        </div>
      </div>

      {/* Two-column metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--qc-hair)" }}>
        <div style={{ padding: "14px 16px", background: "var(--qc-card)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 10px" }}>EX-GREENFIELDS · CORE</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Revenue", value: `₹${exGfRev} Cr`, color: "var(--qc-ink)" },
              { label: "EBITDA", value: `₹${exGfEbitda} Cr`, color: "var(--qc-ink)" },
              { label: "EBITDA margin", value: `${exGfMargin}%`, color: exGfMargin >= 10 ? "var(--qc-up)" : "var(--qc-warn)" },
              { label: "PAT", value: `₹${exGfPat} Cr`, color: "var(--qc-up)" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 16px", background: "var(--qc-section)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 10px" }}>GREENFIELDS · GROWTH</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Revenue", value: `₹${gfRev} Cr`, color: "var(--qc-ink)" },
              { label: "Net EBITDA", value: `₹${gfEbitda} Cr`, color: "var(--qc-up)" },
              { label: "Utilization", value: "~80% target", color: "var(--qc-warn)" },
              { label: "Breakeven", value: "2–3 qtrs", color: "var(--qc-warn)" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Earnings quality signals ───────────────────────────────────────────────────

type QualitySignal = { label: string; value: string; status: "positive" | "watch" | "neutral"; icon: string };

function buildQualitySignals(signals: Signal[], lens: LensDetail): QualitySignal[] {
  const fh = signals.filter((s) => s.signal_type === "financial_health");
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const eps = kpis.find((s) => s.metric === "EPS_BASIC");
  const netDebt = kpis.find((s) => s.metric === "SEG_NET_DEBT" && s.unit === "Cr");

  return [
    {
      label: "EPS (Basic)",
      value: eps ? `₹${eps.raw_value}` : "₹0.23",
      status: "positive",
      icon: "↑",
    },
    {
      label: "Revenue growth quality",
      value: (fh.find((s) => s.metric === "revenue_growth_drivers")?.raw_value?.slice(0, 40) ?? "Volume + copper pass-through") + "…",
      status: "positive",
      icon: "✓",
    },
    {
      label: "Debt trajectory",
      value: "Net cash ₹98 Cr · debt-free",
      status: "positive",
      icon: "✓",
    },
    {
      label: "Margin trajectory",
      value: (fh.find((s) => s.metric === "margin_expansion_drivers")?.raw_value?.slice(0, 40) ?? "Copper lag to reverse") + "…",
      status: "watch",
      icon: "→",
    },
    {
      label: "Operating leverage",
      value: "GF plants pre-loading costs",
      status: "watch",
      icon: "→",
    },
    {
      label: "Working capital",
      value: "Strong FCF; internally funded",
      status: "positive",
      icon: "✓",
    },
  ];
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function LensDetailEps({ lens, signals }: Props) {
  const [activeTab, setActiveTab] = useState<"waterfall" | "segments">("waterfall");

  const waterfall = buildWaterfall(signals);
  const maxAbs = Math.max(...waterfall.map((w) => Math.abs(w.value)));
  const qualitySignals = buildQualitySignals(signals, lens);

  const kpis = signals.filter((s) => s.signal_type === "kpi" && s.unit === "Cr");
  const eps = kpis.find((s) => s.metric === "EPS_BASIC");
  const revGrowth = kpis.find((s) => s.metric === "SEG_WH_REV_GROWTH");
  const pat = kpis.find((s) => s.metric === "PAT" && s.value && s.value < 10000);
  const ebitda = kpis.find((s) => s.metric === "EBITDA" && s.value && s.value < 10000);
  const ebitdaMargin = kpis.find((s) => s.metric === "SEG_EXGF_EBITDA_MARGIN");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Headline KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
        {[
          { label: "EPS (BASIC)", value: eps ? `₹${eps.raw_value}` : "₹0.23", sub: "Q3 FY26 · per share", color: "var(--qc-up)" },
          { label: "PAT", value: pat ? `₹${pat.raw_value} Cr` : "₹149 Cr", sub: "Net profit · Q3 FY26", color: "var(--qc-up)" },
          { label: "EBITDA", value: ebitda ? `₹${ebitda.raw_value} Cr` : "₹263 Cr", sub: "Consolidated · Q3 FY26", color: "var(--qc-ink)" },
          { label: "EX-GF MARGIN", value: ebitdaMargin ? ebitdaMargin.raw_value ?? "11.3%" : "11.3%", sub: "Core business margin", color: "var(--qc-warn)" },
          { label: "REV GROWTH", value: revGrowth ? revGrowth.raw_value ?? "+25.5%" : "+25.5%", sub: "YoY · Q3 FY26", color: "var(--qc-up)" },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "13px 14px",
            background: "var(--qc-section)",
            borderRight: i < 4 ? "1px solid var(--qc-hair)" : undefined,
          }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>{item.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: item.color, margin: "0 0 2px", lineHeight: 1 }}>{item.value}</p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 1, background: "var(--qc-hair)", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {[
          { id: "waterfall" as const, label: "P&L Waterfall" },
          { id: "segments" as const, label: "Segment Split" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              background: activeTab === tab.id ? "var(--qc-card)" : "transparent",
              color: activeTab === tab.id ? "var(--qc-ink)" : "var(--qc-ink-3)",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Waterfall view */}
      {activeTab === "waterfall" && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>P&L BRIDGE · Q3 FY2026 · ₹ CRORE</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 70px 50px", gap: 10, padding: "8px 14px 6px" }}>
            {["LINE ITEM", "CONTRIBUTION", "AMOUNT", "MARGIN"].map((h) => (
              <p key={h} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: 0 }}>{h}</p>
            ))}
          </div>
          {waterfall.map((item, i) => (
            <WaterfallRow key={item.label} item={item} maxAbs={maxAbs} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Segment split view */}
      {activeTab === "segments" && <SegmentSplit signals={signals} lens={lens} />}

      {/* Earnings quality signals */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>EARNINGS QUALITY SIGNALS</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--qc-hair)" }}>
          {qualitySignals.map((qs) => {
            const color = qs.status === "positive" ? "var(--qc-up)" : qs.status === "watch" ? "var(--qc-warn)" : "var(--qc-ink-3)";
            return (
              <div key={qs.label} style={{ padding: "12px 14px", background: "var(--qc-card)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color, marginTop: 1 }}>{qs.icon}</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>{qs.label}</p>
                  <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{qs.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights + Risks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ borderRadius: 10, border: "1px solid rgba(31,122,74,0.20)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(31,122,74,0.06)", borderBottom: "1px solid rgba(31,122,74,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-up)", margin: 0 }}>EPS DRIVERS</p>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {lens.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: "var(--qc-up)" }} />
                <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderRadius: 10, border: "1px solid rgba(180,115,26,0.20)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(180,115,26,0.06)", borderBottom: "1px solid rgba(180,115,26,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-warn)", margin: 0 }}>EARNINGS RISKS</p>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {lens.risks.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: "var(--qc-warn)" }} />
                <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
