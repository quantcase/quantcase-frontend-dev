"use client";

import type { LensDetail } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

type TractionTile = { label: string; value: string; sub: string; color: string };
type SignalCard = { headline: string; sub: string; delta: string; deltaColor: string; icon: "check" | "up" | "down" | "warn" };

function buildTractionTiles(lens: LensDetail, signals: Signal[]): TractionTile[] {
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const pvYoy = kpis.find((s) => s.metric === "SEG_PV_YOY");
  const twoWYoy = kpis.find((s) => s.metric === "SEG_2W_YOY");
  const cvYoy = kpis.find((s) => s.metric === "SEG_CV_YOY");
  const evShare = kpis.find((s) => s.metric === "SEG_EV_REV_SHARE");

  return [
    {
      label: "PV OEM GROWTH",
      value: pvYoy?.raw_value ? `+${pvYoy.raw_value}` : "+19%",
      sub: "Passenger vehicles — largest revenue segment",
      color: "var(--qc-up)",
    },
    {
      label: "2W OEM GROWTH",
      value: twoWYoy?.raw_value ? `+${twoWYoy.raw_value}` : "+15%",
      sub: "Two-wheelers — volume engine",
      color: "var(--qc-up)",
    },
    {
      label: "CV OEM GROWTH",
      value: cvYoy?.raw_value ? `+${cvYoy.raw_value}` : "+18%",
      sub: "Commercial vehicles — recovery underway",
      color: "var(--qc-up)",
    },
    {
      label: "EV REV SHARE",
      value: evShare?.raw_value ?? "5.8%",
      sub: "Down from 6.7% — OEM timeline slippage",
      color: "var(--qc-warn)",
    },
  ];
}

function buildSignalCards(lens: LensDetail, signals: Signal[]): SignalCard[] {
  const kpis = signals.filter((s) => s.signal_type === "kpi");
  const customers = signals.filter((s) => s.signal_type === "customer");
  const gfUtil = kpis.find((s) => s.metric === "SEG_GF_UTIL");
  const gfEbitda = kpis.find((s) => s.metric === "SEG_GF_EBITDA_NET");
  const evShare = kpis.find((s) => s.metric === "SEG_EV_REV_SHARE");
  const revOp = kpis.find((s) => s.metric === "REV_OP" && s.unit === "Cr");
  const exGfRev = kpis.find((s) => s.metric === "SEG_EXGF_REV_OP");
  const churn = customers.find((s) => s.metric === "churn_rate");
  const bookedBiz = customers.find((s) => s.metric === "SEG_BOOKED_BIZ");

  const cards: SignalCard[] = [
    {
      headline: "Structural retention — OEM churn ≈ 0",
      sub: "Multi-year programmes; 12–18 mo. requalification = economic disincentive",
      delta: "Lock-in",
      deltaColor: "var(--qc-up)",
      icon: "check",
    },
  ];

  if (gfUtil || gfEbitda) {
    cards.push({
      headline: `Greenfield revenue ramp at ${gfUtil?.raw_value ?? "~80%"} utilization`,
      sub: "Utilization recovery underway — real & accelerating",
      delta: "+108%",
      deltaColor: "var(--qc-up)",
      icon: "up",
    });
  }

  if (evShare) {
    cards.push({
      headline: `EV mix volatile: ${evShare.raw_value} of revenue`,
      sub: "HV harness 2–3× rev/platform — Gujarat Q4 FY26 = catalyst",
      delta: "Watch",
      deltaColor: "var(--qc-warn)",
      icon: "warn",
    });
  }

  if (revOp && exGfRev) {
    const nrrProxy = revOp.value && exGfRev.value
      ? `+${(((revOp.value - exGfRev.value) / exGfRev.value) * 100).toFixed(1)}% QoQ`
      : "+4.5% QoQ";
    cards.push({
      headline: `NRR proxy: ${nrrProxy} revenue expansion`,
      sub: "Volume + OEM content expansion — concentration is industry-wide",
      delta: "+4.5%",
      deltaColor: "var(--qc-up)",
      icon: "up",
    });
  }

  return cards;
}

export function LensDetailCustomer({ lens, signals }: Props) {
  const tractionTiles = buildTractionTiles(lens, signals);
  const signalCards = buildSignalCards(lens, signals);

  // Find a quote from customer or financial_health signals
  const customerSigs = signals.filter((s) => s.signal_type === "customer" && s.statement && s.statement.length > 60);
  const industrySigs = signals.filter((s) => s.signal_type === "industry" && s.statement && s.statement.length > 60);
  const quoteSource = customerSigs[0] ?? industrySigs[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Customer Traction — 4-column header */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)", display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>CUSTOMER TRACTION</p>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", color: "var(--qc-ink-3)", background: "var(--qc-hair)", borderRadius: 4, padding: "2px 8px" }}>Q3 FY26</span>
          <span style={{
            marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", color: "var(--qc-up)",
            border: "1px solid var(--qc-up)", borderRadius: 20, padding: "2px 10px",
          }}>
            Strong
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, background: "var(--qc-hair)" }}>
          {tractionTiles.map((tile, i) => (
            <div key={i} style={{ padding: "16px 14px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>{tile.label}</p>
              <p style={{ fontSize: 24, fontWeight: 600, color: tile.color, margin: "2px 0" }}>{tile.value}</p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.3 }}>{tile.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Company quote / competitive intelligence */}
      {quoteSource && (
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0 }}>CUSTOMER INTELLIGENCE · IN THEIR OWN WORDS</p>
            <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>{quoteSource.call_date} · {quoteSource.quarter} {quoteSource.fiscal_year} analyst call</p>
          </div>
          <div style={{ padding: "16px 20px", background: "var(--qc-card)" }}>
            <div style={{ borderLeft: "3px solid var(--qc-ink-3)", paddingLeft: 14 }}>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--qc-ink)", margin: 0, lineHeight: 1.7, fontFamily: "var(--qc-font-serif, Georgia, serif)" }}>
                "{quoteSource.statement?.slice(0, 240)}{(quoteSource.statement?.length ?? 0) > 240 ? "…" : ""}"
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
                  <span style={{ flexShrink: 0, marginTop: 1, color: borderColor, fontWeight: 700, fontSize: 14 }}>
                    {card.icon === "check" ? "✓" : card.icon === "up" ? "↑" : card.icon === "warn" ? "↓" : "↓"}
                  </span>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.35 }}>{card.headline}</p>
                </div>
                {card.delta && (
                  <span style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 700, color: card.deltaColor,
                    whiteSpace: "nowrap",
                    border: `1px solid ${card.deltaColor}40`, borderRadius: 4, padding: "1px 6px",
                  }}>
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
          {Object.entries(lens.key_metrics).map(([k, v], i, arr) => (
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
