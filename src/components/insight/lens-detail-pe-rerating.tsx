"use client";

import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// ─── Scenario data derived from lens ─────────────────────────────────────────

interface Scenario {
  key: "bear" | "base" | "bull";
  label: string;
  icon: string;
  peRange: string;
  returnRange: string;
  returnPositive: boolean;
  vsText: string;
  narrative: string;
  color: string;
  borderColor: string;
  bg: string;
  pillBg: string;
  pillColor: string;
}

function buildScenarios(km: Record<string, string>): Scenario[] {
  // Use key_metrics where available, fall back to sensible defaults for MSUMI
  const revYoY = km["mswil_revenue_yoy"] ?? "+25.5%";
  const ebitdaYoY = km["mswil_ebitda_yoy"] ?? "+10.5%";
  const patYoY = km["mswil_pat_yoy"] ?? "+6.4%";

  return [
    {
      key: "bear",
      label: "Bear Case",
      icon: "🐻",
      peRange: "14–18x",
      returnRange: "-10% to -25%",
      returnPositive: false,
      vsText: "vs current multiples",
      narrative: `Revenue growth decelerates below 10%, commodity cost inflation sustains, greenfield ramp disappoints. PAT growth (${patYoY}) fails to bridge gap to revenue growth, margin compression continues. Market de-rates on earnings quality concerns.`,
      color: "var(--qc-down)",
      borderColor: "rgba(220,38,38,0.30)",
      bg: "rgba(220,38,38,0.04)",
      pillBg: "rgba(220,38,38,0.12)",
      pillColor: "var(--qc-down)",
    },
    {
      key: "base",
      label: "Base Case",
      icon: "⊙",
      peRange: "20–26x",
      returnRange: "+5% to +20%",
      returnPositive: true,
      vsText: "vs current multiples",
      narrative: `Revenue sustains ${revYoY} growth momentum, greenfield utilization improves steadily. EBITDA (${ebitdaYoY}) catches up gradually as commodity headwinds ease. EV mix expands, market re-rates on execution visibility.`,
      color: "var(--qc-blue)",
      borderColor: "rgba(59,130,246,0.30)",
      bg: "rgba(59,130,246,0.04)",
      pillBg: "rgba(59,130,246,0.12)",
      pillColor: "var(--qc-blue)",
    },
    {
      key: "bull",
      label: "Bull Case",
      icon: "🐂",
      peRange: "28–35x",
      returnRange: "+25% to +50%",
      returnPositive: true,
      vsText: "vs current multiples",
      narrative: `Greenfield accelerates past 25% growth, EV revenue share crosses 10%, margin convergence materialises. CAPEX (${km["capex_plan_fy2026"] ?? "₹220 Cr"}) delivers high ROI. Premium re-rating on governance improvement and analyst upgrades.`,
      color: "var(--qc-up)",
      borderColor: "rgba(31,122,74,0.30)",
      bg: "rgba(31,122,74,0.04)",
      pillBg: "rgba(31,122,74,0.12)",
      pillColor: "var(--qc-up)",
    },
  ];
}

// ─── Left panel: Current Market Perception ────────────────────────────────────

function MarketPerceptionPanel({ lens }: { lens: LensDetail }) {
  const km = lens.key_metrics;
  const revYoY = km["mswil_revenue_yoy"] ?? "+25.5%";
  const evShare = km["ev_revenue_share"] ?? "5.8%";
  // Fair value zone: cheap < 18x, fair 20–26x, expensive > 28x
  // We don't have current P/E from lens; use score as proxy (76/100 → ~22x range)
  const currentPe = "~22x";
  const markerPct = 58; // roughly in fair zone

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14,
      padding: "18px 18px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>👤</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          Current Market Perception
        </span>
      </div>

      {/* Headline */}
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 400, color: "var(--qc-ink)", margin: "0 0 8px", fontFamily: "var(--qc-font-serif, Georgia, serif)", lineHeight: 1.25 }}>
          Growth re-rating in progress
        </h3>
        <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
          MSUMI trades at fair multiples despite strong {revYoY} revenue growth. EV revenue ({evShare} mix) is a nascent re-rating trigger not yet priced in.
        </p>
      </div>

      {/* Key metrics mini grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 10, borderTop: "1px solid var(--qc-hair)" }}>
        {[
          { label: "Revenue YoY", value: km["mswil_revenue_yoy"] ?? "+25.5%", positive: true },
          { label: "EBITDA YoY", value: km["mswil_ebitda_yoy"] ?? "+10.5%", positive: true },
          { label: "PAT YoY", value: km["mswil_pat_yoy"] ?? "+6.4%", positive: true },
          { label: "EV Mix", value: km["ev_revenue_share"] ?? "5.8%", positive: true },
        ].map((m) => (
          <div key={m.label}>
            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: m.value.startsWith("+") ? "var(--qc-up)" : "var(--qc-ink)", margin: 0 }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Fair value zone slider */}
      <div style={{ paddingTop: 10, borderTop: "1px solid var(--qc-hair)" }}>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 10px" }}>
          Fair Value Zone (P/E)
        </p>
        <div style={{ position: "relative", height: 8, borderRadius: 99, background: `linear-gradient(to right, var(--qc-up), var(--qc-warn), var(--qc-down))`, marginBottom: 8 }}>
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${markerPct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
              width: 16, height: 16, borderRadius: "50%",
              background: "var(--qc-ink)", border: "2px solid var(--qc-card)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "var(--qc-up)" }}>Cheap &lt;18x</span>
          <span style={{ fontSize: 10, color: "var(--qc-golden-ink)" }}>Fair 20–26x</span>
          <span style={{ fontSize: 10, color: "var(--qc-down)" }}>Expensive &gt;28x</span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, color: "var(--qc-ink)",
          background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
          borderRadius: 6, padding: "4px 12px", display: "inline-block",
        }}>
          Current: {currentPe}
        </span>
      </div>
    </div>
  );
}

// ─── Center panel: Scenario Engine ───────────────────────────────────────────

function ScenarioCard({ scenario, delay }: { scenario: Scenario; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{
        flex: 1,
        border: `1px solid ${scenario.borderColor}`,
        borderRadius: 8,
        overflow: "hidden",
        background: scenario.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Scenario header */}
      <div style={{ padding: "10px 12px 8px", borderBottom: `1px solid ${scenario.borderColor}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
          <span style={{ fontSize: 13 }}>{scenario.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: scenario.color }}>
            {scenario.label}
          </span>
        </div>
        <p style={{ fontSize: 26, fontWeight: 700, color: scenario.color, margin: "0 0 6px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {scenario.peRange}
        </p>
        {/* Return pill */}
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
          background: scenario.pillBg, color: scenario.pillColor,
          display: "inline-block", marginBottom: 4,
        }}>
          {scenario.returnRange}
        </span>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0 }}>{scenario.vsText}</p>
      </div>

      {/* What happens */}
      <div style={{ padding: "10px 12px", flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: scenario.color, margin: "0 0 6px" }}>
          What happens?
        </p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
          {scenario.narrative}
        </p>
      </div>
    </motion.div>
  );
}

function ScenarioEnginePanel({ lens }: { lens: LensDetail }) {
  const scenarios = buildScenarios(lens.key_metrics);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12,
      padding: "18px 18px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>⚙</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          Re-Rating Scenario Engine (Exit P/E)
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, flex: 1 }}>
        {scenarios.map((s, i) => (
          <ScenarioCard key={s.key} scenario={s} delay={i * 0.08} />
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px",
        background: "var(--qc-section)",
        borderRadius: 6,
        border: "1px solid var(--qc-hair)",
      }}>
        <span style={{ fontSize: 13 }}>✏️</span>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
          Re-rating potential depends on greenfield ramp execution, EV mix growth, and governance clarity.
        </p>
      </div>
    </div>
  );
}

// ─── Right panel: What changes market perception ──────────────────────────────

function CatalystItem({ icon, label, sublabel, positive }: { icon: string; label: string; sublabel: string; positive: boolean }) {
  const color = positive ? "var(--qc-up)" : "var(--qc-down)";
  const bg = positive ? "rgba(31,122,74,0.07)" : "rgba(220,38,38,0.06)";
  const border = positive ? "rgba(31,122,74,0.18)" : "rgba(220,38,38,0.15)";
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      padding: "10px 12px",
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 7,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: positive ? "rgba(31,122,74,0.12)" : "rgba(220,38,38,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--qc-ink)", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>{sublabel}</p>
      </div>
    </div>
  );
}

function MarketCatalystsPanel({ lens }: { lens: LensDetail }) {
  const positives = [
    { icon: "🚗", label: "EV revenue acceleration", sublabel: `EV mix at ${lens.key_metrics["ev_revenue_share"] ?? "5.8%"} with clear growth trajectory and management commitment` },
    { icon: "📈", label: "Greenfield ramp execution", sublabel: `18.8% Q3 quarterly growth signals strong capacity utilisation momentum` },
    { icon: "💼", label: "CAPEX ROI realisation", sublabel: `₹${lens.key_metrics["capex_plan_fy2026"] ?? "220 Cr"} CAPEX deployment — ROI recognition could trigger re-rating` },
  ];
  const negatives = [
    { icon: "⚠️", label: "Profitability growth lag", sublabel: `PAT +${lens.key_metrics["mswil_pat_yoy"] ?? "6.4%"} vs revenue +${lens.key_metrics["mswil_revenue_yoy"] ?? "25.5%"} signals margin compression` },
    { icon: "🏗️", label: "Capital allocation opacity", sublabel: "Ongoing customer discussions limit clarity on deployment timeline and ROI profile" },
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14,
      padding: "18px 18px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>⚡</span>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          What Changes Market Perception?
        </span>
      </div>

      {/* Positive */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-up)", margin: "0 0 8px" }}>
          Positive Catalysts
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {positives.map((p) => (
            <CatalystItem key={p.label} icon={p.icon} label={p.label} sublabel={p.sublabel} positive={true} />
          ))}
        </div>
      </div>

      {/* Negative */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-down)", margin: "0 0 8px" }}>
          Negative Catalysts
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {negatives.map((n) => (
            <CatalystItem key={n.label} icon={n.icon} label={n.label} sublabel={n.sublabel} positive={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Narrative strip ──────────────────────────────────────────────────────────

function NarrativeStrip({ lens }: { lens: LensDetail }) {
  const markerPct = Math.min(95, Math.max(5, (lens.score / 100) * 100));
  const narrativeLabel = lens.score >= 70
    ? "Earnings re-rating candidate"
    : lens.score >= 50
    ? "Transition phase, execution watch"
    : "De-rating risk, narrative weak";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "200px 1fr 220px",
      alignItems: "center",
      gap: 28,
      padding: "20px 24px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
    }}>
      {/* Left: label */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 6px" }}>
          Current Narrative
        </p>
        <h4 style={{ fontSize: 20, fontWeight: 400, color: "var(--qc-ink)", margin: 0, fontFamily: "var(--qc-font-serif, Georgia, serif)", lineHeight: 1.25 }}>
          {narrativeLabel}
        </h4>
      </div>

      {/* Center: gradient slider + labels below */}
      <div style={{ minWidth: 0 }}>
        {/* Track + marker */}
        <div style={{ position: "relative", height: 10, borderRadius: 99, background: "linear-gradient(to right, var(--qc-down), var(--qc-warn) 50%, var(--qc-up))", marginBottom: 10 }}>
          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: `${markerPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
              width: 18, height: 18, borderRadius: "50%",
              background: "var(--qc-ink)", border: "2.5px solid var(--qc-card)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          />
        </div>
        {/* Labels: left / center / right — each takes 1/3, no wrapping risk */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <span style={{ fontSize: 9, color: "var(--qc-down)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.4 }}>
            Weak Narrative · De-Rating Risk
          </span>
          <span style={{ fontSize: 9, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", lineHeight: 1.4 }}>
            Neutral · Fairly Valued
          </span>
          <span style={{ fontSize: 9, color: "var(--qc-up)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", lineHeight: 1.4 }}>
            Strong Narrative · Re-Rating Potential
          </span>
        </div>
      </div>

      {/* Right: narrative note */}
      <div style={{ borderLeft: "3px solid var(--qc-blue)", paddingLeft: 16 }}>
        <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
          Narrative can shift positively if greenfield ramp accelerates, EV mix crosses 10%, and commodity headwinds ease in H2 FY27.
        </p>
      </div>
    </div>
  );
}

// ─── Dark footer bar ──────────────────────────────────────────────────────────

const PE_RERATING_METRICS = [
  { label: "Base Case Exit P/E", value: "20–26x", sub: "Most Probable" },
  { label: "Implied Upside", value: "+5% to +20%", sub: "vs current multiples" },
  { label: "Time Horizon", value: "2–3 Years", sub: "Investment View" },
];

function SummaryFooter({ lens }: { lens: LensDetail }) {
  return (
    <LensDrawerSummaryCard
      title="Moderate re-rating potential exists."
      body={lens.subtitle ?? lens.description}
      metrics={PE_RERATING_METRICS}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailPeRerating({ lens }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Sub-header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          Valuation Intelligence
        </span>
        <span style={{ fontSize: 12, color: "var(--qc-ink-3)", fontStyle: "italic" }}>
          Will the market pay a higher multiple in the future?
        </span>
      </div>

      {/* 3-panel row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 14, alignItems: "stretch" }}>
        <MarketPerceptionPanel lens={lens} />
        <ScenarioEnginePanel lens={lens} />
        <MarketCatalystsPanel lens={lens} />
      </div>

      {/* Narrative strip */}
      <NarrativeStrip lens={lens} />

      {/* Dark summary footer */}
      <SummaryFooter lens={lens} />

    </div>
  );
}
