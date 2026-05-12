"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

type PillarScore = { label: string; rating: string; sub: string; score: number; max: number; color: string };

function buildPillars(lens: LensDetail, signals: Signal[]): PillarScore[] {
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const pvYoy = kpis.find((s) => s.metric === "SEG_PV_YOY")?.value ?? 19;
  const gfUtil = kpis.find((s) => s.metric === "SEG_GF_UTIL")?.value ?? 36;
  const ext = kpis.find((s) => s.metric === "SEG_EXT_DEBT")?.value ?? 10;
  const copperImpact = kpis.find((s) => s.metric === "SEG_COPPER_IMPACT_PCT")?.value ?? 2;

  return [
    {
      label: "Market Position",
      rating: pvYoy >= 15 ? "Strong" : pvYoy >= 8 ? "Medium" : "Weak",
      sub: `3/3 signal · Dominant India wiring harness`,
      score: pvYoy >= 15 ? 3 : pvYoy >= 8 ? 2 : 1,
      max: 3,
      color: pvYoy >= 15 ? "var(--qc-up)" : pvYoy >= 8 ? "var(--qc-warn)" : "var(--qc-down)",
    },
    {
      label: "Pricing Power",
      rating: copperImpact <= 2 ? "Medium" : "Low",
      sub: `${copperImpact}/3 · Copper pass-through partial`,
      score: 2,
      max: 3,
      color: "var(--qc-warn)",
    },
    {
      label: "Entry Barriers",
      rating: "High",
      sub: "3/3 · OEM quals, capex, long-term programmes",
      score: 3,
      max: 3,
      color: "var(--qc-up)",
    },
    {
      label: "Porter's Score",
      rating: `${lens.score}/100`,
      sub: `Comp. intensity medium · Buyer power high`,
      score: Math.round(lens.score / 10),
      max: 10,
      color: lens.score >= 70 ? "var(--qc-up)" : lens.score >= 40 ? "var(--qc-warn)" : "var(--qc-down)",
    },
  ];
}

type SignalCard = { headline: string; sub: string; delta: string; deltaColor: string; icon: "check" | "up" | "down" | "warn" };

function buildSignalCards(lens: LensDetail, signals: Signal[]): SignalCard[] {
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const evShare = kpis.find((s) => s.metric === "SEG_EV_REV_SHARE");
  const gfUtil = kpis.find((s) => s.metric === "SEG_GF_UTIL");
  const gfEbitda = kpis.find((s) => s.metric === "SEG_GF_EBITDA_NET");
  const pvQoQ = kpis.find((s) => s.metric === "SEG_PV_QOQ");

  const cards: SignalCard[] = [
    {
      headline: "Engine-agnostic: ICE · hybrid · EV all covered",
      sub: "Moat = 12–18 month OEM requalification cycle",
      delta: "Moat",
      deltaColor: "var(--qc-up)",
      icon: "check",
    },
    {
      headline: `Debt-free vs peers · D/E ${(10 / 2887).toFixed(2)}`,
      sub: "Funds new plants without dilution → optionality",
      delta: "D/E 0.01",
      deltaColor: "var(--qc-up)",
      icon: "check",
    },
  ];

  if (evShare) {
    cards.push({
      headline: `EV revenue share ${evShare.raw_value} → potential growth`,
      sub: "OEM EV timeline slippage = key watch-out",
      delta: evShare.value !== null && evShare.value < 7 ? "-90 bps" : "",
      deltaColor: "var(--qc-warn)",
      icon: "warn",
    });
  }

  if (gfUtil) {
    cards.push({
      headline: `Greenfield utilization ramp at ${gfUtil.raw_value}`,
      sub: "Sector recovery underway → MSUMI to follow",
      delta: `+${gfUtil.value ?? 80}%`,
      deltaColor: "var(--qc-up)",
      icon: "up",
    });
  }

  return cards;
}

function IconCheck() {
  return <span style={{ color: "var(--qc-up)", fontSize: 14, fontWeight: 700 }}>✓</span>;
}
function IconUp() {
  return <span style={{ color: "var(--qc-up)", fontSize: 14, fontWeight: 700 }}>↑</span>;
}
function IconDown() {
  return <span style={{ color: "var(--qc-down)", fontSize: 14, fontWeight: 700 }}>↓</span>;
}
function IconWarn() {
  return <span style={{ color: "var(--qc-warn)", fontSize: 14, fontWeight: 700 }}>↓</span>;
}

export function LensDetailCompetition({ lens, signals }: Props) {
  const pillars = buildPillars(lens, signals);
  const signalCards = buildSignalCards(lens, signals);

  // Find a quote from governance or industry signals
  const govSignals = signals.filter((s) => s.signal_type === "governance" && s.statement && s.statement.length > 60);
  const industrySignals = signals.filter((s) => s.signal_type === "industry" && s.statement && s.statement.length > 60);
  const quoteSource = govSignals[0] ?? industrySignals[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Competitive position header — 4 pillars */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>COMPETITIVE POSITION</p>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", color: "var(--qc-ink-3)", background: "var(--qc-hair)", borderRadius: 4, padding: "2px 8px" }}>
            {lens.key_metrics["9M_PV_Growth"] ? "9M FY26" : "Q3 FY26"}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, background: "var(--qc-hair)" }}>
          {pillars.map((p, i) => (
            <div key={i} style={{ padding: "16px 16px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>{p.label}</p>
              <p style={{ fontSize: 22, fontWeight: 600, color: p.color, margin: 0, lineHeight: 1 }}>{p.rating}</p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.3 }}>{p.sub}</p>
              {/* Mini score dots */}
              <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                {Array.from({ length: p.max }).map((_, j) => (
                  <div key={j} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: j < p.score ? p.color : "var(--qc-hair)",
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantcase quote block */}
      {quoteSource && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>COMPETITIVE INTELLIGENCE · SIGNAL</p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{quoteSource.call_date} · {quoteSource.quarter} {quoteSource.fiscal_year} analyst call</p>
          </div>
          <div style={{ padding: "16px 20px", background: "var(--qc-card)" }}>
            <div style={{ borderLeft: "3px solid var(--qc-ink-3)", paddingLeft: 14 }}>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--qc-ink)", margin: 0, lineHeight: 1.7, fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>
                "{quoteSource.statement?.slice(0, 220)}{(quoteSource.statement?.length ?? 0) > 220 ? "…" : ""}"
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "8px 0 0" }}>
                — Management · {quoteSource.call_date}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signal cards — 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {signalCards.map((card, i) => {
          const isPositive = card.icon === "check" || card.icon === "up";
          const borderColor = isPositive ? "var(--qc-up)" : card.icon === "warn" ? "var(--qc-warn)" : "var(--qc-down)";
          const bgColor = isPositive ? "rgba(31,122,74,0.04)" : card.icon === "warn" ? "rgba(180,115,26,0.04)" : "rgba(220,38,38,0.04)";
          return (
            <div key={i} style={{
              padding: "14px 14px",
              background: bgColor,
              border: `1px solid ${borderColor}22`,
              borderLeft: `3px solid ${borderColor}`,
              borderRadius: 8,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>
                    {card.icon === "check" ? <IconCheck /> : card.icon === "up" ? <IconUp /> : card.icon === "down" ? <IconDown /> : <IconWarn />}
                  </span>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.35 }}>{card.headline}</p>
                </div>
                {card.delta && (
                  <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: card.deltaColor, whiteSpace: "nowrap" }}>
                    {card.delta}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4, paddingLeft: 22 }}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Key metrics from lens */}
      {Object.keys(lens.key_metrics).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--qc-hair)" }}>
          {Object.entries(lens.key_metrics).slice(0, 8).map(([k, v], i, arr) => (
            <div key={k} style={{
              padding: "12px 14px",
              background: "var(--qc-section)",
              borderRight: i % 2 === 0 ? "1px solid var(--qc-hair)" : undefined,
              borderBottom: i < arr.length - 2 ? "1px solid var(--qc-hair)" : undefined,
            }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 3px" }}>{k.replace(/_/g, " ")}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
