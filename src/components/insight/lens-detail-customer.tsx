"use client";

import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

interface TractionTile {
  label: string;
  value: string;
  sub: string;
  color: string;
  bgColor: string;
}

interface SignalCard {
  headline: string;
  sub: string;
  delta: string;
  deltaColor: string;
  borderColor: string;
  bgColor: string;
  icon: "check" | "up" | "down" | "warn";
}

function buildTractionTiles(lens: LensDetail, topSignals: TopSignal[]): TractionTile[] {
  const km = lens.key_metrics;
  const evShare = topSignals.find((s) => s.metric === "EV_REV_SHARE");
  const evShareVal = evShare?.actual_value != null ? `${evShare.actual_value}%` : (km["EV_REV_SHARE_Q3"] ?? "5.8%");

  return [
    {
      label: "PV OEM GROWTH",
      value: "+19%",
      sub: "Passenger vehicles — largest revenue segment",
      color: "var(--qc-up)",
      bgColor: "var(--qc-up-soft)",
    },
    {
      label: "2W OEM GROWTH",
      value: "+15%",
      sub: "Two-wheelers — volume engine",
      color: "var(--qc-up)",
      bgColor: "var(--qc-up-soft)",
    },
    {
      label: "CV OEM GROWTH",
      value: "+18%",
      sub: "Commercial vehicles — recovery underway",
      color: "var(--qc-up)",
      bgColor: "var(--qc-up-soft)",
    },
    {
      label: "EV REV SHARE",
      value: evShareVal,
      sub: "Down from 6.7% — OEM timeline slippage",
      color: "var(--qc-warn)",
      bgColor: "var(--qc-warn-soft)",
    },
  ];
}

function buildSignalCards(topSignals: TopSignal[]): SignalCard[] {
  const gfRev = topSignals.find((s) => s.metric === "SEG_GREENFIELD_REV" && s.label.includes("QoQ"));
  const evShare = topSignals.find((s) => s.metric === "EV_REV_SHARE");

  const cards: SignalCard[] = [
    {
      headline: "Structural retention — OEM churn ≈ 0",
      sub: "Multi-year programmes; 12–18 mo. requalification = economic disincentive.",
      delta: "Lock-in",
      deltaColor: "var(--qc-up)",
      borderColor: "var(--qc-up)",
      bgColor: "rgba(31,122,74,0.04)",
      icon: "check",
    },
  ];

  const gfVal = gfRev?.actual_value != null ? `+${gfRev.actual_value}%` : "+108%";
  cards.push({
    headline: `Greenfield revenue ₹120 Cr → ₹250 Cr`,
    sub: `${gfVal} QoQ utilization recovery → real & accelerating.`,
    delta: gfVal,
    deltaColor: "var(--qc-up)",
    borderColor: "var(--qc-up)",
    bgColor: "rgba(31,122,74,0.04)",
    icon: "up",
  });

  const evVal = evShare?.actual_value != null ? `${evShare.actual_value}%` : "5.8%";
  cards.push({
    headline: `EV mix volatile: 5% → 6.7% → ${evVal}`,
    sub: "HV harness 2–3× rev/platform — Gujarat Q4 FY26 = catalyst.",
    delta: "Watch",
    deltaColor: "var(--qc-warn)",
    borderColor: "var(--qc-warn)",
    bgColor: "rgba(180,115,26,0.04)",
    icon: "warn",
  });

  cards.push({
    headline: `NRR proxy: +4.5% QoQ (₹2,761 → ₹2,887 Cr)`,
    sub: "Volume + OEM content expansion — concentration is industry-wide.",
    delta: "+4.5%",
    deltaColor: "#4B7BEC",
    borderColor: "#4B7BEC",
    bgColor: "rgba(75,123,236,0.04)",
    icon: "up",
  });

  return cards;
}

const ICON_SYMBOLS: Record<string, string> = {
  check: "✓",
  up: "↑",
  down: "↓",
  warn: "↓",
};

export function LensDetailCustomer({ lens }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];

  const tiles = buildTractionTiles(lens, topSignals);
  const cards = buildSignalCards(topSignals);

  const statusColor = lens.status.toUpperCase() === "STRONG" ? "var(--qc-up)" : lens.status.toUpperCase() === "WEAK" ? "var(--qc-down)" : "var(--qc-warn)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Customer Traction header strip */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>
        {/* Title row */}
        <div style={{
          padding: "10px 16px",
          background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--qc-ink-3)" }}>
            CUSTOMER TRACTION
          </span>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
            color: "var(--qc-ink-3)", background: "var(--qc-section)",
            border: "1px solid var(--qc-hair)", borderRadius: 4, padding: "2px 7px",
          }}>
            Q3 FY26
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: statusColor, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
            {lens.status.charAt(0).toUpperCase() + lens.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 12, color: "var(--qc-ink-2)", margin: 0 }}>
            PV, 2W, CV all covered — structural OEM contracts with near-zero churn and greenfield alignment
          </p>
        </div>

        {/* 4-column KPI tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0 }}>
          {tiles.map((tile, i) => (
            <div key={i} style={{
              padding: "16px 14px",
              background: "var(--qc-card)",
              borderRight: i < tiles.length - 1 ? "1px solid var(--qc-hair)" : undefined,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}>
              <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: tile.color, margin: 0 }}>
                {tile.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 600, color: tile.color, margin: "2px 0", lineHeight: 1 }}>
                {tile.value}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.35 }}>
                {tile.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Analyst quote / competitive intelligence blockquote */}
      <div style={{
        borderLeft: "3px solid var(--qc-ink)",
        paddingLeft: 16,
        paddingTop: 4,
        paddingBottom: 4,
        margin: "0 2px",
      }}>
        <p style={{
          fontSize: 13,
          fontStyle: "italic",
          color: "var(--qc-ink)",
          margin: "0 0 6px",
          lineHeight: 1.65,
          fontFamily: "var(--qc-font-serif, Georgia, serif)",
        }}>
          MSUMI's customer base IS the Indian auto industry. OEM contract embeddedness is nearly impossible to displace — the only risk is own-platform failure, not competitive displacement.
        </p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, letterSpacing: "0.04em" }}>
          Quantcase competitive analysis · Q3 FY26
        </p>
      </div>

      {/* Signal cards — 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            padding: "13px 14px",
            background: card.bgColor,
            border: `1px solid ${card.borderColor}30`,
            borderLeft: `3px solid ${card.borderColor}`,
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
                <span style={{ flexShrink: 0, marginTop: 1, color: card.borderColor, fontWeight: 700, fontSize: 13, lineHeight: 1 }}>
                  {ICON_SYMBOLS[card.icon]}
                </span>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.35 }}>
                  {card.headline}
                </p>
              </div>
              <span style={{
                flexShrink: 0,
                fontSize: 10,
                fontWeight: 700,
                color: card.deltaColor,
                whiteSpace: "nowrap",
                border: `1px solid ${card.deltaColor}40`,
                borderRadius: 4,
                padding: "2px 7px",
              }}>
                {card.delta}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4, paddingLeft: 21 }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Structural OEM retention with greenfield and EV expansion upside."
        body={lens.takeaway}
        metrics={[
          { label: "EV Rev Share", value: tiles[3].value, sub: "Current mix" },
          { label: "GF Revenue", value: "₹120→₹250 Cr", sub: "+108% QoQ recovery" },
          { label: "OEM Churn", value: "≈ 0%", sub: "Structural lock-in" },
        ]}
      />
    </div>
  );
}
