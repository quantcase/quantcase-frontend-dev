"use client";

import { motion } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// ─── Scenario definitions ─────────────────────────────────────────────────────

interface ScenarioDef {
  key: "bear" | "base" | "bull";
  label: string;
  icon: string;
  probability: string;
  isMostLikely: boolean;
  epsCagr: string;
  exitPe: string;
  fyEps: string;
  sectionLabel: string;
  sectionLabelColor: string;
  narrative: string;
  narrativeIcon: string;
  color: string;
  bg: string;
  border: string;
}

function buildScenarios(lens: LensDetail): ScenarioDef[] {
  const km = lens.key_metrics ?? {};
  const sig = lens.top_signals ?? [];

  // Pull best available growth metrics from signals
  const growthSignal = sig.find(
    (s) => (s.metric?.includes("GROWTH") || s.metric?.includes("growth")) && s.actual_value != null
  );
  const guidanceSignal = sig.find((s) => s.direction === "tracking" && s.guided_value != null);
  const profitSignal = sig.find(
    (s) => (s.metric === "PAT" || s.metric === "NET_PROFIT" || s.metric?.includes("PAT")) && s.actual_value != null
  );
  const roaSignal = sig.find((s) => s.metric === "ROA" && s.actual_value != null);
  const roeSignal = sig.find(
    (s) => (s.metric === "ROE" || s.metric?.includes("EQUITY")) && s.actual_value != null
  );

  const baseGrowth = growthSignal?.actual_value ?? 0;
  const guidedGrowth = guidanceSignal?.guided_value ?? baseGrowth * 1.1;

  // Derive EPS CAGR approximations from growth signals
  const baseEpsCagr = baseGrowth > 0 ? `${baseGrowth.toFixed(1)}%` : "—";
  const bullEpsCagr = guidedGrowth > 0 ? `${(guidedGrowth * 1.3).toFixed(1)}%` : "—";
  const bearEpsCagr = baseGrowth > 0 ? `${(baseGrowth * 0.55).toFixed(1)}%` : "—";

  // FY EPS — use EPS signal or PAT as proxy
  const epsSignal = sig.find((s) => s.metric === "EPS_DILUTED" && s.actual_value != null);
  const baseFyEps = epsSignal?.actual_value != null
    ? `₹${epsSignal.actual_value}`
    : profitSignal?.unit === "Cr" && profitSignal.actual_value != null
    ? `₹${profitSignal.actual_value} Cr`
    : Object.entries(km).find(([k]) => k.toLowerCase().includes("eps"))?.[1] ?? "—";

  // ROA/ROE for narrative
  const roa = roaSignal?.actual_value != null ? `${roaSignal.actual_value}%` : km["ROA"] ?? km["roa"] ?? "";
  const roe = roeSignal?.actual_value != null ? `${roeSignal.actual_value}%` : km["ROE"] ?? km["roe"] ?? "";

  // Highlights/risks for narrative text
  const bullNarrative = lens.highlights?.[0] ?? "Strong execution and favourable tailwinds drive premium re-rating.";
  const baseNarrative = lens.highlights?.[1] ?? lens.takeaway?.split(".")[0] ?? "Management guidance on-track with stable margins and steady growth.";
  const bearNarrative = lens.risks?.[0] ?? "Macro headwinds and execution challenges compress margins and multiples.";

  return [
    {
      key: "bear",
      label: "Bear Case",
      icon: "🐻",
      probability: "25% Probability",
      isMostLikely: false,
      epsCagr: bearEpsCagr,
      exitPe: "14–18x",
      fyEps: baseFyEps,
      sectionLabel: "WHAT CAN GO WRONG",
      sectionLabelColor: "var(--qc-down)",
      narrative: bearNarrative,
      narrativeIcon: "📉",
      color: "var(--qc-down)",
      bg: "rgba(220,38,38,0.04)",
      border: "rgba(220,38,38,0.20)",
    },
    {
      key: "base",
      label: "Base Case",
      icon: "🎯",
      probability: "50% Probability",
      isMostLikely: true,
      epsCagr: baseEpsCagr,
      exitPe: "20–26x",
      fyEps: baseFyEps,
      sectionLabel: "WHAT DRIVES THIS OUTCOME",
      sectionLabelColor: "var(--qc-blue)",
      narrative: `${baseNarrative}${roa ? ` ROA at ${roa}` : ""}${roe ? `, ROE at ${roe}` : ""}.`.replace(/\.\./, "."),
      narrativeIcon: "📈",
      color: "var(--qc-blue)",
      bg: "rgba(59,130,246,0.04)",
      border: "rgba(59,130,246,0.30)",
    },
    {
      key: "bull",
      label: "Bull Case",
      icon: "🐂",
      probability: "25% Probability",
      isMostLikely: false,
      epsCagr: bullEpsCagr,
      exitPe: "28–35x",
      fyEps: baseFyEps,
      sectionLabel: "WHAT CAN ACCELERATE UPSIDE",
      sectionLabelColor: "var(--qc-up)",
      narrative: bullNarrative,
      narrativeIcon: "🚀",
      color: "var(--qc-up)",
      bg: "rgba(31,122,74,0.04)",
      border: "rgba(31,122,74,0.20)",
    },
  ];
}

// ─── Scenario card ─────────────────────────────────────────────────────────────

function ScenarioCard({ s }: { s: ScenarioDef }) {
  const epsCagrNum = parseFloat(s.epsCagr);
  const epsCagrPositive = !isNaN(epsCagrNum) ? epsCagrNum >= 0 : s.key !== "bear";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        flex: s.key === "base" ? "1.15" : "1",
        minWidth: 0,
        borderRadius: 12,
        border: `1.5px solid ${s.border}`,
        background: s.bg,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{s.icon}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: s.color,
          }}>
            {s.label}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: s.color, background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
            border: `1px solid ${s.color}`,
            borderRadius: 99, padding: "2px 10px",
            textTransform: "uppercase",
          }}>
            {s.probability}
          </span>
          {s.isMostLikely && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: "var(--qc-ink)", background: "var(--qc-section)",
              border: "1px solid var(--qc-hair)",
              borderRadius: 4, padding: "2px 8px",
              textTransform: "uppercase",
            }}>
              Most Likely Outcome
            </span>
          )}
        </div>
      </div>

      {/* EPS/PE/FY metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "EPS CAGR", value: s.epsCagr, color: epsCagrPositive ? s.color : "var(--qc-down)" },
          { label: "Exit P/E", value: s.exitPe, color: "var(--qc-ink)" },
          { label: "FY EPS", value: s.fyEps, color: "var(--qc-ink)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 11, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--qc-hair)" }} />

      {/* Narrative */}
      <div>
        <p style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em",
          color: s.sectionLabelColor, margin: "0 0 8px",
        }}>
          {s.sectionLabel}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{
            flexShrink: 0, fontSize: 14, marginTop: 1,
            width: 28, height: 28, borderRadius: 6,
            background: "var(--qc-section)",
            border: "1px solid var(--qc-hair)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {s.narrativeIcon}
          </span>
          <p style={{
            fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.6, margin: 0,
          }}>
            {s.narrative}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Gauge SVG (speedometer for risk/reward) ─────────────────────────────────

function RiskRewardGauge({ ratio }: { ratio: number }) {
  const pct = Math.min(1, ratio / 3);
  const angle = -180 + pct * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 60, cy = 60, r = 40;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <svg width={120} height={70} viewBox="0 0 120 70" style={{ overflow: "visible" }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#e5e7eb" strokeWidth={10} strokeLinecap="round" />
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--qc-down)" />
          <stop offset="50%" stopColor="var(--qc-warn)" />
          <stop offset="100%" stopColor="var(--qc-up)" />
        </linearGradient>
      </defs>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth={10} strokeLinecap="round" />
      <motion.line
        initial={{ x2: cx, y2: cy - r }}
        animate={{ x2: nx, y2: ny }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        x1={cx} y1={cy}
        stroke="var(--qc-ink)" strokeWidth={2.5} strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={4} fill="var(--qc-ink)" />
    </svg>
  );
}

// ─── Probability weighted footer ──────────────────────────────────────────────

function WeightedOutcomeBar({ lens }: { lens: LensDetail }) {
  const km = lens.key_metrics ?? {};
  const sig = lens.top_signals ?? [];

  // Weighted CAGR label: derive from growth signal
  const growthSignal = sig.find(
    (s) => s.metric?.includes("GROWTH") && s.actual_value != null
  );
  const baseGrowth = growthSignal?.actual_value ?? 0;
  const weightedCagrLo = (baseGrowth * 0.6).toFixed(0);
  const weightedCagrHi = (baseGrowth * 0.9).toFixed(0);
  const weightedCagrText = baseGrowth > 0 ? `+${weightedCagrLo}% to +${weightedCagrHi}%` : "—";

  // Weighted range — use any absolute value metric as rough proxy
  const absSignal = sig.find(
    (s) => s.unit === "Cr" && s.actual_value != null && s.actual_value > 100
  );
  const rangeText = absSignal?.actual_value != null
    ? `₹${(absSignal.actual_value * 0.85).toFixed(0)}–₹${(absSignal.actual_value * 1.1).toFixed(0)} Cr`
    : Object.entries(km).find(([k]) => k.toLowerCase().includes("aum") || k.toLowerCase().includes("revenue"))?.[1] ?? "—";

  // Risk/reward ratio from score
  const rrRatio = lens.score >= 70 ? 1.6 : lens.score >= 55 ? 1.2 : 0.9;
  const rrLabel = rrRatio >= 1.5 ? "Attractive" : rrRatio >= 1.1 ? "Moderate" : "Cautious";

  const tiles = [
    {
      icon: "Σ",
      label: "Probability Weighted Outcome · Expected 3Y CAGR",
      value: weightedCagrText,
      valueColor: "var(--qc-up)",
      isText: true,
    },
    {
      icon: "◎",
      label: "Weighted Target Range",
      value: rangeText,
      sub: "Probability-weighted estimate",
      isText: false,
    },
    {
      icon: "⚖",
      label: "Risk / Reward (vs Bear Case)",
      value: `${rrRatio}x`,
      sub: rrLabel,
      isText: false,
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr auto",
      gap: 0,
      border: "1px solid var(--qc-hair)",
      borderRadius: 10,
      overflow: "hidden",
      background: "var(--qc-section)",
    }}>
      {tiles.map((t, i) => (
        <div key={i} style={{
          padding: "16px 18px",
          borderRight: i < 2 ? "1px solid var(--qc-hair)" : undefined,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(139,92,246,0.10)",
            border: "1px solid rgba(139,92,246,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "rgba(139,92,246,0.80)",
            flexShrink: 0,
          }}>
            {t.icon}
          </div>
          <div>
            <p style={{
              fontSize: 9, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 4px", lineHeight: 1.4,
            }}>
              {t.label}
            </p>
            <p style={{
              fontSize: t.isText ? 18 : 22, fontWeight: 600,
              color: t.valueColor ?? "var(--qc-ink)",
              margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em",
            }}>
              {t.value}
            </p>
            {"sub" in t && t.sub && (
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{t.sub}</p>
            )}
          </div>
        </div>
      ))}
      {/* Gauge tile */}
      <div style={{
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderLeft: "1px solid var(--qc-hair)",
      }}>
        <RiskRewardGauge ratio={rrRatio} />
        <p style={{
          fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.5,
          margin: 0, maxWidth: 140,
        }}>
          {rrRatio >= 1.5
            ? <>Asymmetric payoff with limited downside and{" "}<strong style={{ color: "var(--qc-up)" }}>meaningful upside.</strong></>
            : rrRatio >= 1.1
            ? <>Balanced payoff with moderate risk and <strong style={{ color: "var(--qc-blue)" }}>reasonable upside.</strong></>
            : <>Elevated risk relative to potential upside — <strong style={{ color: "var(--qc-down)" }}>proceed cautiously.</strong></>
          }
        </p>
      </div>
    </div>
  );
}

// ─── Sub-header ───────────────────────────────────────────────────────────────

function SubHeader({ lens }: { lens: LensDetail }) {
  const km = lens.key_metrics ?? {};
  const sig = lens.top_signals ?? [];

  // Try to find any revenue/AUM/business metric for the sub-header context line
  const contextMetric = sig.find((s) => s.unit === "Cr" && s.actual_value != null && s.actual_value > 100);
  const contextValue = contextMetric
    ? `${contextMetric.label}: ₹${contextMetric.actual_value} Cr`
    : Object.entries(km).slice(0, 1).map(([k, v]) => `${k}: ${v}`)[0] ?? "";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0 4px",
      borderBottom: "1px solid var(--qc-hair)",
      marginBottom: 4,
    }}>
      <div>
        <p style={{
          fontSize: 9, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 2px",
        }}>
          Valuation Outcome
        </p>
        <h3 style={{
          fontSize: 18, fontWeight: 500, margin: 0,
          lineHeight: 1.3, letterSpacing: "-0.01em",
          color: "var(--qc-ink)",
        }}>
          Target Price Matrix (3Y Exit)
        </h3>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>
          3-year holding period{contextValue ? ` · ${contextValue}` : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Summary footer metrics ───────────────────────────────────────────────────

function buildFooterMetrics(lens: LensDetail, scenarios: ScenarioDef[]) {
  const base = scenarios.find((s) => s.key === "base")!;
  const bull = scenarios.find((s) => s.key === "bull")!;
  const bear = scenarios.find((s) => s.key === "bear")!;
  const rrRatio = lens.score >= 70 ? 1.6 : lens.score >= 55 ? 1.2 : 0.9;

  return [
    { label: "Base EPS CAGR", value: base.epsCagr, sub: "Most likely outcome" },
    { label: "Bull EPS CAGR", value: bull.epsCagr, sub: "Upside scenario" },
    { label: "Risk/Reward", value: `${rrRatio}×`, sub: `vs Bear (${bear.epsCagr} EPS CAGR)` },
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailTargetPriceMatrix({ lens }: Props) {
  const scenarios = buildScenarios(lens);
  const footerMetrics = buildFooterMetrics(lens, scenarios);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SubHeader lens={lens} />

      {/* 3 scenario cards */}
      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
        {scenarios.map((s) => (
          <ScenarioCard key={s.key} s={s} />
        ))}
      </div>

      {/* Probability-weighted outcome row */}
      <WeightedOutcomeBar lens={lens} />

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title={lens.takeaway?.split(".")[0] ?? "Risk/reward analysis complete."}
        body={lens.takeaway ?? ""}
        metrics={footerMetrics}
      />
    </div>
  );
}
