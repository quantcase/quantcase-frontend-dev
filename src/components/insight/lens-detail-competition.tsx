"use client";

import { useState } from "react";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0,
    }}>
      {children}
    </p>
  );
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: active ? 700 : 500,
      padding: "4px 12px", borderRadius: 20,
      border: `1px solid ${active ? "var(--qc-warn)" : "var(--qc-hair)"}`,
      color: active ? "var(--qc-warn)" : "var(--qc-ink-2)",
      background: active ? "var(--qc-warn-soft)" : "var(--qc-card)",
      whiteSpace: "nowrap", cursor: "default",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {children}
    </span>
  );
}

function statusColor(s: string) {
  const u = s.toUpperCase();
  if (u === "STRONG") return "var(--qc-up)";
  if (u === "WEAK") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function dedup(signals: TopSignal[]): TopSignal[] {
  const seen = new Set<string>();
  return signals.filter((s) => {
    if (seen.has(s.metric)) return false;
    seen.add(s.metric);
    return true;
  });
}

function signalDir(s: TopSignal): "up" | "down" | "neutral" {
  const text = (s.label + " " + (s.statement ?? "")).toLowerCase();
  if (text.includes("declin") || text.includes("moderat") || text.includes("slow") || text.includes("headwind") || text.includes("pressure")) return "down";
  if (s.actual_value !== null && s.actual_value > 0) return "up";
  return "neutral";
}

// ── sub-components ────────────────────────────────────────────────────────────

interface PillarTileProps {
  label: string;
  rating: string;
  sub: string;
  color: string;
  score: number;
  max: number;
}

function PillarTile({ label, rating, sub, color, score, max }: PillarTileProps) {
  return (
    <div style={{ padding: "16px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 5 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: 0,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 600, color, margin: 0, lineHeight: 1.1 }}>{rating}</p>
      <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{sub}</p>
      <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
        {Array.from({ length: max }).map((_, j) => (
          <div key={j} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: j < score ? color : "var(--qc-hair)",
          }} />
        ))}
      </div>
    </div>
  );
}

interface SignalCardProps {
  icon: "check" | "up" | "down" | "warn";
  headline: string;
  sub: string;
  badge: string;
  badgeColor: string;
}

function SignalCard({ icon, headline, sub, badge, badgeColor }: SignalCardProps) {
  const isPos = icon === "check" || icon === "up";
  const borderColor = isPos ? "var(--qc-up)" : icon === "warn" ? "var(--qc-warn)" : "var(--qc-down)";
  const arrow = icon === "check" ? "✓" : icon === "up" ? "↑" : icon === "warn" ? "↓" : "↓";
  const arrowColor = isPos ? "var(--qc-up)" : icon === "warn" ? "var(--qc-warn)" : "var(--qc-down)";

  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--qc-card)",
      border: "1px solid var(--qc-hair)",
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 8,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ flexShrink: 0, marginTop: 1, color: arrowColor, fontWeight: 700, fontSize: 14 }}>{arrow}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)", margin: 0, lineHeight: 1.4 }}>{headline}</p>
        <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "3px 0 0", lineHeight: 1.4 }}>{sub}</p>
      </div>
      {badge && (
        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: badgeColor, whiteSpace: "nowrap" }}>
          {badge}
        </span>
      )}
    </div>
  );
}

interface PeerCellProps {
  index: number;
}

function PeerCell({ index }: PeerCellProps) {
  return (
    <div style={{
      padding: "40px 20px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, background: "var(--qc-section)",
      borderRight: index % 2 === 0 ? "1px solid var(--qc-hair)" : undefined,
      borderTop: index >= 2 ? "1px solid var(--qc-hair)" : undefined,
      minHeight: 160,
    }}>
      <span style={{ fontSize: 22, color: "var(--qc-hair)", lineHeight: 1 }}>⊕</span>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>
        SELECT PEER {index + 1}
      </p>
    </div>
  );
}

// ── Peer company card ─────────────────────────────────────────────────────────

interface MODFramework {
  management: { label: string; color: string };
  opportunity: { label: string; color: string };
  deal: { label: string; color: string };
}

function ratingColor(r: string) {
  const l = r.toLowerCase();
  if (l === "strong" || l === "excellent" || l.includes("high")) return "var(--qc-up)";
  if (l === "weak" || l === "poor" || l.includes("decl")) return "var(--qc-down)";
  if (l === "expensive" || l.includes("under") || l.includes("down")) return "var(--qc-down)";
  return "var(--qc-warn)";
}

interface RatingChipProps {
  label: string;
  value: string;
}

function RatingChip({ label, value }: RatingChipProps) {
  const color = ratingColor(value);
  return (
    <div style={{
      border: `1px solid ${color}44`,
      borderRadius: 8, padding: "6px 10px",
      display: "inline-flex", flexDirection: "column", gap: 1,
      background: `${color}08`,
    }}>
      <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

function PrimaryPeerCard({ lens }: { lens: LensDetail }) {
  const km = lens.key_metrics;
  const statusCol = statusColor(lens.status);

  const mod: MODFramework = {
    management: { label: "Management", color: "var(--qc-up)" },
    opportunity: { label: "Opportunity", color: "var(--qc-warn)" },
    deal: { label: "Deal", color: "var(--qc-ink-3)" },
  };

  // Derive approximate labels from key_metrics / score
  const companyGrowth = km["Company PV Growth (Q3)"] ?? "+25%";
  const pvGrowth = km["PV Industry Growth (Q3)"] ?? "+19%";
  const gfEbitdaQ3 = km["Greenfield EBITDA Growth (Q3)"] ?? "+7.6%";
  const outperf = km["Outperformance vs PV Market"] ?? "+6pp";

  // MOD ratings derived from lens
  const modManagement = lens.score >= 70 ? "Strong" : lens.score >= 40 ? "Moderate" : "Weak";
  const modOpportunity = "Moderate";
  const modDeal = "Fair";

  // Fundamentals
  const fundamentals = [
    { label: "GROWTH", value: companyGrowth },
    { label: "OUTPERF.", value: outperf },
    { label: "GF EBITDA", value: gfEbitdaQ3 },
    { label: "PV INDUSTRY", value: pvGrowth },
  ];

  return (
    <div style={{ padding: "18px 20px", background: "var(--qc-card)", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Name + status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", margin: 0 }}>
            {/* Ticker from lens or static */}
            MSUMI
          </p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "2px 0 0" }}>NSE: MSUMI · Auto Ancillaries</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: statusCol, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {lens.status}
        </span>
      </div>

      {/* M.O.D. Framework */}
      <div>
        <p style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px",
        }}>
          M.O.D. FRAMEWORK
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <RatingChip label="MANAGEMENT" value={modManagement} />
          <RatingChip label="OPPORTUNITY" value={modOpportunity} />
          <RatingChip label="DEAL" value={modDeal} />
        </div>
      </div>

      {/* Fundamentals */}
      <div>
        <p style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.12em", color: "var(--qc-ink-3)", margin: "0 0 8px",
        }}>
          KEY METRICS
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {fundamentals.map((f) => (
            <RatingChip key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

const PEER_TICKERS = ["MSUMI", "MOTHERSON", "BOSCHLTD", "SCHAEFFLER", "BHARATFORG", "SUMITOMO ELEC", "MINDA CORP", "LUMAX INDS", "YAZAKI INDIA"];

export function LensDetailCompetition({ lens, signals }: Props) {
  const [peerExpanded, setPeerExpanded] = useState(false);
  const [swotExpanded, setSwotExpanded] = useState(false);

  const km = lens.key_metrics;
  const topSignals = dedup(lens.top_signals ?? []);
  const quarter = "Q3 FY26";
  const statusCol = statusColor(lens.status);

  // ── Competitive position pillars ──
  const outperf = km["Outperformance vs PV Market"] ?? "+6 percentage points";
  const companyGrowth = km["Company PV Growth (Q3)"] ?? "+25%";
  const pvGrowth = km["PV Industry Growth (Q3)"] ?? "+19%";
  const gfEbitda9m = km["Greenfield EBITDA Growth (9M)"] ?? "+9.6%";

  const pillars: PillarTileProps[] = [
    {
      label: "Market Position",
      rating: "Strong",
      sub: `3/3 signal · ${companyGrowth} vs ${pvGrowth} industry`,
      color: "var(--qc-up)",
      score: 3, max: 3,
    },
    {
      label: "Pricing Power",
      rating: "Medium",
      sub: "2/3 · Copper pass-through partial; timing lag",
      color: "var(--qc-warn)",
      score: 2, max: 3,
    },
    {
      label: "Entry Barriers",
      rating: "High",
      sub: "3/3 · OEM quals, capex, long-term programmes",
      color: "var(--qc-up)",
      score: 3, max: 3,
    },
    {
      label: "Porter's Score",
      rating: `${Math.round(lens.score / 10)}/10`,
      sub: "Comp. intensity medium · Buyer power high",
      color: lens.score >= 70 ? "var(--qc-up)" : lens.score >= 40 ? "var(--qc-warn)" : "var(--qc-down)",
      score: Math.round(lens.score / 10), max: 10,
    },
  ];

  // ── Quote from top signal statement ──
  const quoteSignal = topSignals.find((s) => s.statement && s.statement.length > 60) ?? null;

  // ── Signal cards from top_signals ──
  const outperfSignal = topSignals.find((s) => s.metric === "MSWIL_outperformed_market");
  const gfRevSignal = topSignals.find((s) => s.metric === "SEG_GREENFIELD_REV");
  const gfEbitdaSignal = topSignals.find((s) => s.metric === "SEG_GREENFIELD_EBITDA" && s.label.includes("9M"));
  const twSignal = topSignals.find((s) => s.metric === "2W_INDUSTRY_GROWTH" && s.label.includes("Q3"));
  const gfEbitdaQ3 = topSignals.find((s) => s.metric === "SEG_GREENFIELD_EBITDA" && s.label.includes("Quarterly"));

  const signalCards: SignalCardProps[] = [
    {
      icon: "check",
      headline: outperfSignal
        ? `Company grew ${outperfSignal.actual_value}% YoY vs ${pvGrowth} PV market`
        : "Engine-agnostic: ICE · hybrid · EV all covered",
      sub: outperfSignal?.statement ?? "Moat = 12–18 month OEM requalification cycle.",
      badge: outperf,
      badgeColor: "var(--qc-up)",
    },
    {
      icon: "up",
      headline: gfRevSignal
        ? `Greenfield revenue +${gfRevSignal.actual_value}% — 9M cumulative`
        : "Greenfield segment revenue accelerating",
      sub: gfRevSignal?.statement ?? "Margin-accretive expansion driving competitive moat.",
      badge: gfEbitda9m,
      badgeColor: "var(--qc-up)",
    },
    {
      icon: "warn",
      headline: twSignal
        ? `2W segment +${twSignal.actual_value}% YoY but -2% QoQ`
        : "Two-wheeler sequential moderation",
      sub: twSignal?.statement ?? "OEM timeline slippage = key watch-out.",
      badge: "-2% QoQ",
      badgeColor: "var(--qc-warn)",
    },
    {
      icon: "down",
      headline: gfEbitdaQ3
        ? `Greenfield EBITDA +${gfEbitdaQ3.actual_value}% Q3 vs +${gfEbitdaSignal?.actual_value ?? 9.6}% 9M`
        : "Greenfield EBITDA margin pace slowing",
      sub: gfEbitdaQ3?.statement ?? "Potential margin pressure or operational headwinds in Q3.",
      badge: `+${gfEbitdaQ3?.actual_value ?? 7.6}%`,
      badgeColor: "var(--qc-down)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── COMPETITIVE POSITION ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", background: "var(--qc-section)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SectionLabel>COMPETITIVE POSITION</SectionLabel>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)",
              background: "var(--qc-hair)", borderRadius: 4, padding: "2px 8px",
            }}>
              {quarter}
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            border: `1px solid ${statusCol}`,
            borderRadius: 20, padding: "3px 12px",
            color: statusCol, background: "var(--qc-card)",
          }}>
            • {lens.status}
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ padding: "8px 16px", background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.5 }}>
            {companyGrowth} revenue vs {pvGrowth} PV market growth — share gains visible; greenfield margins hold at {gfEbitda9m}
          </p>
        </div>

        {/* 4-column pillar strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, background: "var(--qc-hair)" }}>
          {pillars.map((p, i) => <PillarTile key={i} {...p} />)}
        </div>

        {/* Blockquote */}
        {quoteSignal && (
          <div style={{
            margin: "0", padding: "16px 20px",
            background: "var(--qc-card)",
            borderTop: "1px solid var(--qc-hair)",
          }}>
            <div style={{ borderLeft: "3px solid var(--qc-ink-3)", paddingLeft: 14 }}>
              <p style={{
                fontSize: 13, fontStyle: "italic",
                color: "var(--qc-ink)", margin: 0, lineHeight: 1.7,
                fontFamily: "var(--qc-font-serif, Georgia, serif)",
              }}>
                {quoteSignal.statement?.slice(0, 240)}{(quoteSignal.statement?.length ?? 0) > 240 ? "…" : ""}
              </p>
              <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "6px 0 0" }}>
                Quantcase peer analysis · {quarter}
              </p>
            </div>
          </div>
        )}

        {/* Signal cards 2×2 */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, padding: "14px 16px",
          background: "var(--qc-card)",
          borderTop: "1px solid var(--qc-hair)",
        }}>
          {signalCards.map((card, i) => <SignalCard key={i} {...card} />)}
        </div>

        {/* Collapsible: Detailed Peer KPI & SWOT */}
        <div
          onClick={() => setSwotExpanded((v) => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", cursor: "pointer",
            background: "var(--qc-section)", borderTop: "1px solid var(--qc-hair)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--qc-ink-2)", fontWeight: 500 }}>Detailed Peer KPI & SWOT</span>
          <span style={{ fontSize: 10, color: "var(--qc-ink-3)" }}>{swotExpanded ? "▲" : "▼"}</span>
        </div>
        {swotExpanded && (
          <div style={{ padding: "14px 16px", background: "var(--qc-card)", borderTop: "1px solid var(--qc-hair)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--qc-hair)", borderRadius: 8, overflow: "hidden" }}>
              {Object.entries(km).slice(0, 8).map(([k, v], i, arr) => (
                <div key={k} style={{
                  padding: "12px 14px", background: "var(--qc-section)",
                  borderRight: i % 2 === 0 ? "1px solid var(--qc-hair)" : undefined,
                  borderBottom: i < arr.length - 2 ? "1px solid var(--qc-hair)" : undefined,
                }}>
                  <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: "0 0 3px" }}>
                    {k}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Strong competitive position — market share gains across segments."
        body={lens.takeaway}
        metrics={[
          { label: "Company Growth", value: companyGrowth, sub: "Revenue YoY Q3" },
          { label: "Outperformance", value: outperf, sub: "vs PV market" },
          { label: "GF EBITDA 9M", value: gfEbitda9m, sub: "Greenfield margin" },
        ]}
      />

      {/* ── SIGNAL QUADRANT ── */}
      <div style={{ borderRadius: 10, border: "1px solid var(--qc-hair)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "var(--qc-card)",
          borderBottom: "1px solid var(--qc-hair)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionLabel>SIGNAL QUADRANT</SectionLabel>
              <span style={{
                fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)",
                background: "var(--qc-section)", borderRadius: 20,
                padding: "2px 10px", border: "1px solid var(--qc-hair)",
              }}>
                vs Peer Set
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", margin: "4px 0 0" }}>
              Select up to 3 peers from the wiring harness & auto ancillary universe to compare signals side-by-side
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            border: "1px solid var(--qc-warn)",
            borderRadius: 20, padding: "3px 12px",
            color: "var(--qc-warn)", background: "var(--qc-warn-soft)",
          }}>
            • Peer Comparison
          </span>
        </div>

        {/* Peer chip selector */}
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--qc-hair)",
          background: "var(--qc-section)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginRight: 4 }}>
              PEER SET
            </span>
            {PEER_TICKERS.map((t) => (
              <Chip key={t} active={t === "MSUMI"}>{t}{t === "MSUMI" ? " ✓" : ""}</Chip>
            ))}
          </div>
        </div>

        {/* 2×2 peer grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--qc-hair)" }}>
          {/* Primary peer — always MSUMI */}
          <div style={{
            background: "var(--qc-card)",
            borderRight: "1px solid var(--qc-hair)",
          }}>
            <PrimaryPeerCard lens={lens} />
          </div>

          {/* Peer 1 placeholder */}
          <PeerCell index={0} />

          {/* Peer 2 placeholder */}
          <div style={{ borderTop: "1px solid var(--qc-hair)", borderRight: "1px solid var(--qc-hair)" }}>
            <PeerCell index={1} />
          </div>

          {/* Peer 3 placeholder */}
          <div style={{ borderTop: "1px solid var(--qc-hair)" }}>
            <PeerCell index={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
