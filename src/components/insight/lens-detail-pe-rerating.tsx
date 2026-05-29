"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: unknown[];
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

function formatPeRange(lo: number | null | undefined, hi: number | null | undefined): string {
  if (lo == null && hi == null) return "—";
  if (lo != null && hi != null) return `${lo}–${hi}x`;
  if (lo != null) return `${lo}x`;
  return `${hi}x`;
}

function formatReturnRange(lo: number | null | undefined, hi: number | null | undefined): string {
  if (lo == null && hi == null) return "—";
  const fmt = (n: number) => `${n >= 0 ? "+" : ""}${n}%`;
  if (lo != null && hi != null) return `${fmt(lo)} to ${fmt(hi)}`;
  if (lo != null) return fmt(lo);
  return fmt(hi!);
}

function buildScenarios(lens: LensDetail): Scenario[] {
  const sig = lens.top_signals ?? [];

  const findSig = (metric: string) => sig.find((s) => s.metric === metric);

  // Dynamic P/E ranges: actual_value = range low, guided_value = range high
  const bearPe   = findSig("SCENARIO_BEAR_PE_RANGE");
  const basePe   = findSig("SCENARIO_BASE_PE_RANGE");
  const bullPe   = findSig("SCENARIO_BULL_PE_RANGE");
  const bearRet  = findSig("SCENARIO_BEAR_RETURN");
  const baseRet  = findSig("SCENARIO_BASE_RETURN");
  const bullRet  = findSig("SCENARIO_BULL_RETURN");

  const bearPeRange  = formatPeRange(bearPe?.actual_value, bearPe?.guided_value);
  const basePeRange  = formatPeRange(basePe?.actual_value, basePe?.guided_value);
  const bullPeRange  = formatPeRange(bullPe?.actual_value, bullPe?.guided_value);
  const bearRetRange = formatReturnRange(bearRet?.actual_value, bearRet?.guided_value);
  const baseRetRange = formatReturnRange(baseRet?.actual_value, baseRet?.guided_value);
  const bullRetRange = formatReturnRange(bullRet?.actual_value, bullRet?.guided_value);

  const bullNarrative = lens.highlights?.[0] ?? "Strong execution on guidance targets accelerates growth. Premium re-rating on sustained delivery.";
  const baseNarrative = lens.highlights?.[1] ?? "Steady growth sustains with stable profitability. Market re-rates on execution visibility.";
  const bearNarrative = lens.risks?.[0] ?? "Growth decelerates below guidance. Market de-rates on earnings quality concerns.";

  return [
    {
      key: "bear",
      label: "Bear Case",
      icon: "🐻",
      peRange: bearPeRange,
      returnRange: bearRetRange,
      returnPositive: false,
      vsText: "vs current multiples",
      narrative: bearNarrative,
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
      peRange: basePeRange,
      returnRange: baseRetRange,
      returnPositive: (baseRet?.actual_value ?? 0) >= 0,
      vsText: "vs current multiples",
      narrative: baseNarrative,
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
      peRange: bullPeRange,
      returnRange: bullRetRange,
      returnPositive: true,
      vsText: "vs current multiples",
      narrative: bullNarrative,
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
  const sig = lens.top_signals ?? [];

  // key_metrics is always empty for deal lenses — use top 4 high-impact signals
  const metricGrid = sig
    .filter((s) => s.actual_value != null && s.impact === "high")
    .slice(0, 4)
    .map((s) => {
      const val = s.unit === "Cr"
        ? `₹${s.actual_value} Cr`
        : s.unit === "%"
        ? `${s.actual_value}%`
        : s.unit
        ? `${s.actual_value} ${s.unit}`
        : `${s.actual_value}`;
      return {
        label: s.label.replace(/\(.*?\)/, "").trim().toUpperCase().slice(0, 18),
        value: val,
        positive: (s.direction === "beat" || s.direction === "tracking") || (s.actual_value ?? 0) > 0,
      };
    });

  // Score-derived P/E zone marker
  const markerPct = Math.min(95, Math.max(5, (lens.score / 100) * 100));
  const peZone = lens.score >= 70 ? "Fair–Premium" : lens.score >= 50 ? "Fair" : "Discount";

  // Headline — first sentence of takeaway is now a short 2-4 word phrase per backend guidelines
  const headlineSentence = lens.takeaway?.split(".")[0]?.trim() ?? "";
  const headline = headlineSentence.length > 0 && headlineSentence.length <= 60
    ? headlineSentence
    : (lens.highlights?.[0] ?? lens.description);

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

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 400, color: "var(--qc-ink)", margin: "0 0 8px", lineHeight: 1.35 }}>
          {headline}
        </h3>
        <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
          Score: {lens.score}/100 — {lens.status ?? "Moderate"} re-rating signal
        </p>
      </div>

      {/* Key metrics mini grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 10, borderTop: "1px solid var(--qc-hair)" }}>
        {metricGrid.map((m) => (
          <div key={m.label}>
            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: m.positive ? "var(--qc-up)" : "var(--qc-ink)", margin: 0 }}>{m.value}</p>
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
          <span style={{ fontSize: 10, color: "var(--qc-golden-ink, var(--qc-warn))" }}>Fair 20–26x</span>
          <span style={{ fontSize: 10, color: "var(--qc-down)" }}>Expensive &gt;28x</span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, color: "var(--qc-ink)",
          background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
          borderRadius: 6, padding: "4px 12px", display: "inline-block",
        }}>
          Zone: {peZone}
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
  const scenarios = buildScenarios(lens);

  // Context note derived from risks/highlights
  const footerNote = lens.risks?.[0] ?? lens.description ?? "Re-rating potential depends on execution and macro conditions.";

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

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px",
        background: "var(--qc-section)",
        borderRadius: 6,
        border: "1px solid var(--qc-hair)",
      }}>
        <span style={{ fontSize: 13 }}>✏️</span>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
          {footerNote.length > 120 ? footerNote.slice(0, 117) + "..." : footerNote}
        </p>
      </div>
    </div>
  );
}

// ─── Right panel: What changes market perception ──────────────────────────────

function CatalystItem({ icon, label, sublabel, positive }: { icon: string; label: string; sublabel: string; positive: boolean }) {
  const [showPopup, setShowPopup] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const color = positive ? "var(--qc-up)" : "var(--qc-down)";
  const bg = positive ? "rgba(31,122,74,0.07)" : "rgba(220,38,38,0.06)";
  const border = positive ? "rgba(31,122,74,0.18)" : "rgba(220,38,38,0.15)";
  const popupBg = positive ? "rgba(31,122,74,0.06)" : "rgba(220,38,38,0.05)";

  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAlignRight(rect.left > window.innerWidth / 2);
    }
    setShowPopup(true);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "flex", gap: 10, alignItems: "center",
        padding: "8px 12px",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 7,
        cursor: "default",
        position: "relative",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowPopup(false)}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: positive ? "rgba(31,122,74,0.12)" : "rgba(220,38,38,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color, margin: 0 }}>{label}</p>

      {showPopup && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            ...(alignRight ? { right: 0 } : { left: 0 }),
            zIndex: 50,
            width: 240,
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: "var(--qc-card)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <div style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${border}`,
            background: popupBg,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--qc-ink)" }}>{label}</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--qc-ink-3)", lineHeight: 1.6 }}>{sublabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketCatalystsPanel({ lens }: { lens: LensDetail }) {
  // Build positive catalysts from highlights, negative from risks
  const positives = (lens.highlights ?? []).slice(0, 3).map((h, i) => ({
    icon: ["📈", "💼", "🚀"][i] ?? "✅",
    label: h.split(" ").slice(0, 5).join(" "),
    sublabel: h,
  }));

  const negatives = (lens.risks ?? []).slice(0, 2).map((r, i) => ({
    icon: ["⚠️", "🏗️"][i] ?? "⚠️",
    label: r.split(" ").slice(0, 5).join(" "),
    sublabel: r,
  }));

  // Fallbacks if no highlights/risks
  if (positives.length === 0) {
    positives.push({ icon: "📈", label: "Strong fundamentals", sublabel: lens.takeaway ?? "Solid operational metrics." });
  }
  if (negatives.length === 0) {
    negatives.push({ icon: "⚠️", label: "Execution risk", sublabel: "Monitor guidance delivery and macro conditions." });
  }

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

  // Derive shift narrative from risks and highlights
  const shiftNote = lens.risks?.[0]
    ? `${lens.risks[0].slice(0, 100)}...`
    : "Narrative can shift if execution on guidance targets improves and macro conditions ease.";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_220px]" style={{
      alignItems: "center",
      gap: 28,
      padding: "20px 24px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
    }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 6px" }}>
          Current Narrative
        </p>
        <h4 style={{ fontSize: 18, fontWeight: 400, color: "var(--qc-ink)", margin: 0, lineHeight: 1.25 }}>
          {narrativeLabel}
        </h4>
      </div>

      <div style={{ minWidth: 0 }}>
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

      <div style={{ borderLeft: "3px solid var(--qc-blue)", paddingLeft: 16 }}>
        <p style={{ fontSize: 12, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.6 }}>
          {shiftNote}
        </p>
      </div>
    </div>
  );
}

// ─── Summary footer metrics ───────────────────────────────────────────────────

function SummaryFooter({ lens }: { lens: LensDetail }) {
  const sig = lens.top_signals ?? [];
  const basePe  = sig.find((s) => s.metric === "SCENARIO_BASE_PE_RANGE");
  const baseRet = sig.find((s) => s.metric === "SCENARIO_BASE_RETURN");

  const metrics = [
    {
      label: "Base Case Exit P/E",
      value: formatPeRange(basePe?.actual_value, basePe?.guided_value),
      sub: "Most Probable",
    },
    {
      label: "Implied Upside",
      value: formatReturnRange(baseRet?.actual_value, baseRet?.guided_value),
      sub: "vs current multiples",
    },
    { label: "Time Horizon", value: "2–3 Years", sub: "Investment View" },
  ];

  const title = lens.score >= 70
    ? "Solid re-rating potential with positive momentum."
    : lens.score >= 50
    ? "Moderate re-rating potential exists."
    : "Limited re-rating potential; monitor execution.";

  return (
    <LensDrawerSummaryCard
      title={title}
      body={lens.takeaway ?? lens.description}
      metrics={metrics}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailPeRerating({ lens }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
          Valuation Intelligence
        </span>
        <span style={{ fontSize: 12, color: "var(--qc-ink-3)", fontStyle: "italic" }}>
          Will the market pay a higher multiple in the future?
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]" style={{ gap: 14, alignItems: "stretch" }}>
        <MarketPerceptionPanel lens={lens} />
        <ScenarioEnginePanel lens={lens} />
        <MarketCatalystsPanel lens={lens} />
      </div>

      <NarrativeStrip lens={lens} />

      <SummaryFooter lens={lens} />

    </div>
  );
}
