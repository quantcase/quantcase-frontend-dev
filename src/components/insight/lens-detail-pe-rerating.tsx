"use client";

import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// ─── Re-rating catalyst scorecard ──────────────────────────────────────────────

type Catalyst = {
  label: string;
  score: number;
  max: number;
  status: string;
  statusColor: string;
  evidence: string;
};

function buildCatalysts(lens: LensDetail, signals: Signal[]): Catalyst[] {
  const gov = signals.filter((s) => s.signal_type === "governance");
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const fh = signals.filter((s) => s.signal_type === "financial_health");
  const revGrowth = kpis.find((s) => s.metric === "SEG_WH_REV_GROWTH")?.value ?? 25.5;
  const ebitdaMargin = kpis.find((s) => s.metric === "SEG_EXGF_EBITDA_MARGIN")?.value ?? 11.3;
  const extDebt = kpis.find((s) => s.metric === "SEG_EXT_DEBT" && s.unit === "Cr")?.value ?? 10;
  const govCount = gov.filter((s) => s.value === 1).length;

  return [
    {
      label: "Earnings growth visibility",
      score: revGrowth >= 20 ? 9 : revGrowth >= 10 ? 7 : 5,
      max: 10,
      status: revGrowth >= 20 ? "STRONG" : "MODERATE",
      statusColor: revGrowth >= 20 ? "var(--qc-up)" : "var(--qc-warn)",
      evidence: `${revGrowth}% YoY revenue growth with greenfield ramp adding to base`,
    },
    {
      label: "Balance sheet quality",
      score: extDebt <= 20 ? 10 : extDebt <= 100 ? 7 : 4,
      max: 10,
      status: extDebt <= 20 ? "PRISTINE" : "MODERATE",
      statusColor: extDebt <= 20 ? "var(--qc-up)" : "var(--qc-warn)",
      evidence: `Net cash ₹98 Cr · ₹${extDebt} Cr ext. debt · zero refinancing risk`,
    },
    {
      label: "Governance & transparency",
      score: Math.min(10, govCount * 2.5),
      max: 10,
      status: govCount >= 4 ? "INSTITUTIONAL" : govCount >= 2 ? "DEVELOPING" : "WEAK",
      statusColor: govCount >= 4 ? "var(--qc-up)" : "var(--qc-warn)",
      evidence: `${govCount}/4 governance signals · explicit capex, disclosure, guidance`,
    },
    {
      label: "Margin expansion path",
      score: ebitdaMargin >= 12 ? 9 : ebitdaMargin >= 8 ? 7 : 4,
      max: 10,
      status: ebitdaMargin >= 12 ? "CLEAR" : "EMERGING",
      statusColor: ebitdaMargin >= 12 ? "var(--qc-up)" : "var(--qc-warn)",
      evidence: `Ex-GF ${ebitdaMargin}% · copper lag reversal + GF utilization ramp`,
    },
    {
      label: "Sector tailwinds",
      score: 8,
      max: 10,
      status: "FAVORABLE",
      statusColor: "var(--qc-up)",
      evidence: "PV +19% · 2W +15% · CV +18% · EV ramp as incremental lever",
    },
    {
      label: "Re-rating signal confidence",
      score: Math.min(10, Math.round(lens.z_score * 10)),
      max: 10,
      status: lens.z_score >= 0.7 ? "HIGH" : lens.z_score >= 0.4 ? "MODERATE" : "LOW",
      statusColor: lens.z_score >= 0.7 ? "var(--qc-up)" : "var(--qc-warn)",
      evidence: `z-score ${lens.z_score.toFixed(2)} · ${lens.signal_count} signals · CI: ${lens.key_metrics["Signal_Confidence_Z_Score"] ?? "6.46"}`,
    },
  ];
}

function CatalystRow({ catalyst, delay }: { catalyst: Catalyst; delay: number }) {
  const pct = (catalyst.score / catalyst.max) * 100;
  const barColor = pct >= 70 ? "var(--qc-up)" : pct >= 40 ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 80px 160px",
      gap: 16,
      alignItems: "center",
      padding: "11px 16px",
      borderBottom: "1px solid var(--qc-hair)",
      background: "var(--qc-card)",
    }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 3px" }}>{catalyst.label}</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{catalyst.evidence}</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: catalyst.statusColor,
          border: `1px solid ${catalyst.statusColor}40`,
          borderRadius: 4, padding: "2px 7px",
        }}>
          {catalyst.status}
        </span>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--qc-hair)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, delay, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 99, background: barColor }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 28, textAlign: "right" }}>
            {catalyst.score}/{catalyst.max}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Governance checklist ───────────────────────────────────────────────────────

function GovernanceChecklist({ signals }: { signals: Signal[] }) {
  const gov = signals.filter((s) => s.signal_type === "governance");

  const items = [
    { metric: "guidance_given", label: "Explicit forward guidance", icon: "📋" },
    { metric: "proactive_disclosure", label: "Proactive bad-news disclosure", icon: "📢" },
    { metric: "capital_allocation_clarity", label: "Capital allocation clarity", icon: "💰" },
    { metric: "transparent", label: "Quantitative transparency", icon: "🔍" },
  ];

  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>INSTITUTIONAL GOVERNANCE CHECKLIST</p>
        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--qc-up)", background: "rgba(31,122,74,0.10)", borderRadius: 4, padding: "2px 8px" }}>
          {gov.filter((s) => s.value === 1).length}/{items.length} PASSED
        </span>
      </div>
      {items.map((item, i) => {
        const sig = gov.find((s) => s.metric === item.metric);
        const passed = sig?.value === 1;
        const isLast = i === items.length - 1;
        return (
          <div key={item.metric} style={{
            display: "grid",
            gridTemplateColumns: "28px 1fr auto",
            gap: 12,
            alignItems: "flex-start",
            padding: "12px 14px",
            borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined,
            background: passed ? "rgba(31,122,74,0.03)" : "var(--qc-card)",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: passed ? "rgba(31,122,74,0.12)" : "var(--qc-section)",
              border: `1px solid ${passed ? "rgba(31,122,74,0.30)" : "var(--qc-hair)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: passed ? "var(--qc-up)" : "var(--qc-ink-3)",
              flexShrink: 0,
            }}>
              {passed ? "✓" : "○"}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: passed ? "var(--qc-ink)" : "var(--qc-ink-3)", margin: "0 0 2px" }}>{item.label}</p>
              {sig?.raw_value && (
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>
                  {sig.raw_value.slice(0, 80)}{sig.raw_value.length > 80 ? "…" : ""}
                </p>
              )}
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              color: passed ? "var(--qc-up)" : "var(--qc-ink-3)",
              whiteSpace: "nowrap",
            }}>
              {passed ? "PASS" : "MISS"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Forward catalyst timeline ──────────────────────────────────────────────────

function CatalystTimeline({ signals, lens }: { signals: Signal[]; lens: LensDetail }) {
  const milestones = signals.filter((s) => s.signal_type === "milestone");
  const capex = milestones.find((s) => s.metric === "CAPEX");
  const gfUtil = milestones.find((s) => s.metric === "SEG_GF_UTIL");
  const ebitdaMilestone = milestones.find((s) => s.metric === "EBITDA_MARGIN");

  type TimelineEvent = { horizon: string; event: string; impact: string; color: string };
  const events: TimelineEvent[] = [
    {
      horizon: "Q4 FY26",
      event: "Greenfield utilization target: optimal levels",
      impact: "Margin inflection point",
      color: "var(--qc-up)",
    },
    {
      horizon: "Q4 FY26",
      event: "Next capex budget guidance clarity",
      impact: "Forward visibility catalyst",
      color: "var(--qc-up)",
    },
    {
      horizon: "FY26 Full Year",
      event: `Capex completion: ${capex?.raw_value ?? "₹220 Cr"} programme`,
      impact: "ROI realization window opens",
      color: "var(--qc-ink)",
    },
    {
      horizon: "FY27+",
      event: "Ex-GF margins → blended GF convergence",
      impact: ebitdaMilestone?.raw_value?.slice(0, 50) ?? "Multiple expansion trigger",
      color: "var(--qc-warn)",
    },
  ];

  return (
    <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>FORWARD RE-RATING CATALYSTS</p>
      </div>
      <div style={{ padding: "4px 0" }}>
        {events.map((ev, i) => {
          const isLast = i === events.length - 1;
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "72px auto 1fr auto",
              gap: 0,
              alignItems: "flex-start",
            }}>
              {/* Horizon label */}
              <div style={{ padding: "12px 10px 12px 14px", borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "var(--qc-ink-3)", margin: 0, textAlign: "right", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {ev.horizon}
                </p>
              </div>
              {/* Timeline dot + line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 10px", borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined }}>
                <div style={{ marginTop: 14, width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
                {!isLast && <div style={{ flex: 1, width: 1, background: "var(--qc-hair)", minHeight: 20 }} />}
              </div>
              {/* Event content */}
              <div style={{ padding: "12px 12px", borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>{ev.event}</p>
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{ev.impact}</p>
              </div>
              {/* Color bar accent */}
              <div style={{ width: 3, background: ev.color, alignSelf: "stretch", borderBottom: !isLast ? "1px solid var(--qc-hair)" : undefined }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Confidence interval visualizer ────────────────────────────────────────────

function ConfidenceInterval({ lens }: { lens: LensDetail }) {
  const raw = lens.key_metrics["Signal_Confidence_Z_Score"] ?? "6.46 (95% CI: 6.34–6.57)";
  const match = raw.match(/([\d.]+)\s*\(95%\s*CI:\s*([\d.]+)[–-]([\d.]+)\)/);
  const center = match ? parseFloat(match[1]) : lens.z_score * 10;
  const lo = match ? parseFloat(match[2]) : center * 0.95;
  const hi = match ? parseFloat(match[3]) : center * 1.05;
  const domainMax = 8;
  const centerPct = Math.min(100, (center / domainMax) * 100);
  const loPct = Math.min(100, (lo / domainMax) * 100);
  const hiPct = Math.min(100, (hi / domainMax) * 100);
  const bandWidth = hiPct - loPct;
  const color = centerPct >= 70 ? "var(--qc-up)" : centerPct >= 40 ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{ padding: "14px 16px", background: "var(--qc-section)", borderRadius: 10, border: "1px solid var(--qc-hair)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>SIGNAL CONFIDENCE · Z-SCORE DISTRIBUTION</p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>{lens.signal_count} signals · 95% CI</p>
      </div>
      <div style={{ position: "relative", height: 24, marginBottom: 6 }}>
        {/* Track */}
        <div style={{ position: "absolute", inset: "9px 0", borderRadius: 99, background: "var(--qc-hair)" }} />
        {/* CI band */}
        <motion.div
          initial={{ width: 0, left: `${loPct}%` }}
          animate={{ width: `${bandWidth}%`, left: `${loPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute", top: 6, height: 12, borderRadius: 99,
            background: `${color}30`, border: `1px solid ${color}60`,
          }}
        />
        {/* Center marker */}
        <motion.div
          initial={{ left: "0%" }}
          animate={{ left: `${centerPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute", top: 0, width: 24, height: 24,
            marginLeft: -12,
            borderRadius: "50%",
            background: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{center.toFixed(1)}</span>
        </motion.div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>CI low: {lo.toFixed(2)}</span>
        <span style={{ fontSize: 10, color, fontWeight: 600 }}>z = {center.toFixed(2)}</span>
        <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>CI high: {hi.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function LensDetailPeRerating({ lens, signals }: Props) {
  const catalysts = buildCatalysts(lens, signals);
  const overallScore = Math.round(catalysts.reduce((s, c) => s + (c.score / c.max) * 10, 0) / catalysts.length);
  const scoreColor = overallScore >= 7 ? "var(--qc-up)" : overallScore >= 4 ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Re-rating verdict strip */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "center", padding: "16px 20px", background: "var(--qc-section)", borderRadius: 10, border: "1px solid var(--qc-hair)" }}>
        {/* Score circle */}
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg viewBox="0 0 64 64" style={{ width: 64, height: 64, transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--qc-hair)" strokeWidth="5" />
            <motion.circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke={scoreColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - overallScore / 10) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{overallScore}</span>
            <span style={{ fontSize: 8, color: "var(--qc-ink-3)", fontWeight: 600 }}>/10</span>
          </div>
        </div>
        {/* Verdict text */}
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>RE-RATING VERDICT</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 4px", lineHeight: 1.3 }}>
            {overallScore >= 8 ? "Strong re-rating candidate" : overallScore >= 6 ? "Moderate re-rating potential" : "Re-rating contingent on execution"}
          </p>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>{lens.takeaway.slice(0, 140)}…</p>
        </div>
        {/* Status badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--qc-up)", background: "rgba(31,122,74,0.12)",
            border: "1px solid rgba(31,122,74,0.25)", borderRadius: 20, padding: "4px 12px",
          }}>
            {lens.status}
          </span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>{lens.signal_count} signals</span>
        </div>
      </div>

      {/* Confidence interval */}
      <ConfidenceInterval lens={lens} />

      {/* Catalyst scorecard table */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 160px", gap: 16 }}>
            {["RE-RATING CATALYST", "STATUS", "SIGNAL STRENGTH"].map((h) => (
              <p key={h} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: 0, textAlign: h === "STATUS" ? "center" : "left" }}>{h}</p>
            ))}
          </div>
        </div>
        {catalysts.map((c, i) => <CatalystRow key={c.label} catalyst={c} delay={i * 0.06} />)}
      </div>

      {/* Forward catalyst timeline */}
      <CatalystTimeline signals={signals} lens={lens} />

      {/* Governance checklist */}
      <GovernanceChecklist signals={signals} />

      {/* Upside / risk cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ borderRadius: 10, border: "1px solid rgba(31,122,74,0.20)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(31,122,74,0.06)", borderBottom: "1px solid rgba(31,122,74,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-up)", margin: 0 }}>MULTIPLE EXPANSION DRIVERS</p>
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
        <div style={{ borderRadius: 10, border: "1px solid rgba(220,38,38,0.15)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.04)", borderBottom: "1px solid rgba(220,38,38,0.10)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-down)", margin: 0 }}>RE-RATING BLOCKERS</p>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {lens.risks.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: "var(--qc-down)" }} />
                <p style={{ fontSize: 11, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
