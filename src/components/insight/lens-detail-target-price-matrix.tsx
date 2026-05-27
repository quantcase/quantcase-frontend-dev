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
  targetLo: string;
  targetHi: string;
  fromCmp: string;
  fromCmpPositive: boolean;
  cagr: string;
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

function buildScenarios(km: Record<string, string>): ScenarioDef[] {
  const revGrowth = parseFloat(km["MSWIL_Revenue_Growth_YoY"] ?? "19.6");
  const gfRev = parseFloat(km["Greenfield_Revenue_Growth_Q3"] ?? "18.8");

  // Derive scenario assumptions from available metrics
  // Bear: revenue slows, PAT lags further
  // Base: current trajectory continues
  // Bull: greenfield accelerates, margin expansion
  void revGrowth;
  void gfRev;

  return [
    {
      key: "bear",
      label: "Bear Case",
      icon: "🐻",
      probability: "25% Probability",
      isMostLikely: false,
      targetLo: "₹1,855",
      targetHi: "₹2,113",
      fromCmp: "-18.3% from CMP",
      fromCmpPositive: false,
      cagr: "CAGR: -6.4% p.a.",
      epsCagr: "-3.0%",
      exitPe: "18–21x",
      fyEps: "₹103",
      sectionLabel: "WHAT CAN GO WRONG",
      sectionLabelColor: "var(--qc-down)",
      narrative: "Demand slowdown persists, margin pressure continues and valuation de-rates further.",
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
      targetLo: "₹3,122",
      targetHi: "₹3,548",
      fromCmp: "+26.0% from CMP",
      fromCmpPositive: true,
      cagr: "CAGR: +8.0% p.a.",
      epsCagr: "8.0%",
      exitPe: "22–25x",
      fyEps: "₹142",
      sectionLabel: "WHAT DRIVES THIS OUTCOME",
      sectionLabelColor: "var(--qc-blue)",
      narrative: "Moderate demand recovery, stable margins and re-rating to historical average.",
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
      targetLo: "₹4,457",
      targetHi: "₹5,057",
      fromCmp: "+84.8% from CMP",
      fromCmpPositive: true,
      cagr: "CAGR: +15.0% p.a.",
      epsCagr: "15.0%",
      exitPe: "26–30x",
      fyEps: "₹171",
      sectionLabel: "WHAT CAN ACCELERATE UPSIDE",
      sectionLabelColor: "var(--qc-up)",
      narrative: "AI monetization scales faster, operating leverage improves and premium valuation restores.",
      narrativeIcon: "🚀",
      color: "var(--qc-up)",
      bg: "rgba(31,122,74,0.04)",
      border: "rgba(31,122,74,0.20)",
    },
  ];
}

// ─── Scenario card ─────────────────────────────────────────────────────────────

function ScenarioCard({ s }: { s: ScenarioDef }) {
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

      {/* Target range */}
      <div>
        <p style={{
          fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em",
          color: "var(--qc-ink-3)", margin: "0 0 4px",
        }}>Target Range</p>
        <p style={{
          fontSize: s.key === "base" ? 30 : 24, fontWeight: 600, color: s.color,
          margin: "0 0 4px", lineHeight: 1.3, letterSpacing: "-0.02em",
        }}>
          {s.targetLo} – {s.targetHi}
        </p>
        <p style={{
          fontSize: 12, fontWeight: 600, color: s.color,
          margin: "0 0 2px",
        }}>
          {s.fromCmp}
        </p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0 }}>{s.cagr}</p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--qc-hair)" }} />

      {/* EPS/PE/FY metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "EPS CAGR", value: s.epsCagr, color: s.fromCmpPositive ? s.color : "var(--qc-down)" },
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
  // Semi-circle gauge, 0-3x range, needle at ratio
  const pct = Math.min(1, ratio / 3);
  const angle = -180 + pct * 180; // -180 (left) to 0 (right)
  const rad = (angle * Math.PI) / 180;
  const cx = 60, cy = 60, r = 40;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <svg width={120} height={70} viewBox="0 0 120 70" style={{ overflow: "visible" }}>
      {/* Track */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#e5e7eb" strokeWidth={10} strokeLinecap="round" />
      {/* Fill red→amber→green */}
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--qc-down)" />
          <stop offset="50%" stopColor="var(--qc-warn)" />
          <stop offset="100%" stopColor="var(--qc-up)" />
        </linearGradient>
      </defs>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth={10} strokeLinecap="round" />
      {/* Needle */}
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

function WeightedOutcomeBar() {
  const tiles = [
    {
      icon: "Σ",
      label: "Probability Weighted Outcome · Expected 3Y CAGR",
      value: "+7% to +9%",
      valueColor: "var(--qc-up)",
      isText: true,
    },
    {
      icon: "◎",
      label: "Weighted Target Range",
      value: "₹2,950 – ₹3,250",
      sub: "+15% to +27% from CMP",
      isText: false,
    },
    {
      icon: "⚖",
      label: "Risk / Reward (vs Bear Case)",
      value: "1.6x",
      sub: "Attractive",
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
            {t.sub && (
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
        <RiskRewardGauge ratio={1.6} />
        <p style={{
          fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.5,
          margin: 0, maxWidth: 140,
        }}>
          Asymmetric payoff with limited downside and{" "}
          <strong style={{ color: "var(--qc-up)" }}>meaningful upside.</strong>
        </p>
      </div>
    </div>
  );
}

// ─── Sub-header ───────────────────────────────────────────────────────────────

function SubHeader({ km }: { km: Record<string, string> }) {
  const cmp = "₹2,560";
  const horizon = "3-year holding period";
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
          {horizon} · Current Price: {cmp} · 9M Revenue: {km["MSWIL_9M_Revenue"] ?? "8,143 Cr"}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LensDetailTargetPriceMatrix({ lens }: Props) {
  const scenarios = buildScenarios(lens.key_metrics);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SubHeader km={lens.key_metrics} />

      {/* 3 scenario cards */}
      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
        {scenarios.map((s) => (
          <ScenarioCard key={s.key} s={s} />
        ))}
      </div>

      {/* Probability-weighted outcome row */}
      <WeightedOutcomeBar />

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Attractive risk/reward with meaningful base-case upside."
        body={lens.takeaway}
        metrics={[
          { label: "Base Target", value: "₹3,122–₹3,548", sub: "+26% from CMP" },
          { label: "Bull Target", value: "₹4,457–₹5,057", sub: "+84.8% from CMP" },
          { label: "Risk/Reward", value: "1.6×", sub: "vs Bear case" },
        ]}
      />
    </div>
  );
}
