"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabularCard } from "@/components/molecules/tabular-card";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

// ── Signal stat tiles ─────────────────────────────────────────────────────────
// MetricTile doesn't support semantic-colored large values, so a local variant.

function SignalTile({ label, value, valueColor, sublabel }: {
  label: string; value: string; valueColor: string; sublabel: string;
}) {
  return (
    <Card
      className="rounded-[10px] shadow-none px-4 py-3 gap-1.5"
      style={{ borderColor: "var(--qc-border-default)" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>{label}</p>
      <p className="text-[28px] font-bold leading-none" style={{ color: valueColor }}>{value}</p>
      <p className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{sublabel}</p>
    </Card>
  );
}

// ── Signal styles ─────────────────────────────────────────────────────────────

type SignalType = "entry" | "exit" | "trap" | "emerging";

const SIGNAL_STYLES: Record<SignalType, { label: string; bg: string; color: string; border: string }> = {
  entry:    { label: "ROTATION ENTRY", bg: "var(--qc-up-soft)",   color: "var(--qc-up)",   border: "var(--qc-up)" },
  exit:     { label: "ROTATION EXIT",  bg: "var(--qc-down-soft)", color: "var(--qc-down)", border: "var(--qc-down)" },
  trap:     { label: "TRAP ALERT",     bg: "var(--qc-warn-soft)", color: "var(--qc-warn)", border: "var(--qc-warn)" },
  emerging: { label: "EMERGING",       bg: "var(--qc-blue-soft)", color: "var(--qc-blue)", border: "var(--qc-blue)" },
};

// ── Unified signal + news column card (cols 1 & 2) ───────────────────────────
// Merges the signal card and its confirming news into one visual unit.

function SignalColumnCard({ type, industry, detail, newsTag, newsHeadline, newsDir, newsTags }: {
  type: SignalType;
  industry: string;
  detail: string;
  newsTag: string;
  newsHeadline: string;
  newsDir: "positive" | "negative";
  newsTags: string;
}) {
  const s = SIGNAL_STYLES[type];
  return (
    <Card
      className="rounded-[10px] shadow-none p-0 gap-0 overflow-hidden"
      style={{ borderColor: s.border }}
    >
      {/* Signal section — tinted header */}
      <div className="px-4 py-3 flex flex-col gap-1.5" style={{ background: s.bg }}>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</span>
        <p className="text-[17px] font-semibold leading-snug" style={{ color: s.color }}>{industry}</p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{detail}</p>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: "var(--qc-border-inner)" }} />

      {/* News section — card background */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--qc-text-muted)" }}>
          News Confirming Signal
        </span>
        <Badge className="self-start text-[9px] font-bold tracking-widest px-2 py-0.5">{newsTag}</Badge>
        <p className="text-[12px] leading-snug" style={{ color: "var(--qc-text-heading)" }}>{newsHeadline}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: newsDir === "positive" ? "var(--qc-up)" : "var(--qc-down)" }}
          >
            {newsDir === "positive" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {newsDir === "positive" ? "Positive" : "Negative"}
          </span>
          <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{newsTags}</span>
        </div>
      </div>
    </Card>
  );
}

// ── Standalone signal card (Trap / Emerging — col 3, no news section) ─────────

function SignalCard({ type, industry, detail }: { type: SignalType; industry: string; detail: string }) {
  const s = SIGNAL_STYLES[type];
  return (
    <Card
      className="rounded-[10px] shadow-none px-4 py-3 gap-1.5"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</span>
      <p className="text-[17px] font-semibold leading-snug" style={{ color: s.color }}>{industry}</p>
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{detail}</p>
    </Card>
  );
}

// ── High conviction pick ──────────────────────────────────────────────────────

function HighConvictionCard() {
  return (
    <Card
      className="rounded-[10px] shadow-none px-4 py-4 gap-3"
      style={{ background: "var(--qc-text-heading)", borderColor: "transparent" }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
          High Conviction Pick
        </span>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Top stock · Top cluster</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>
          {/* #C084FC — light purple, visible on dark background */}
          <span style={{ color: "#C084FC" }}>TCS</span>{" · IT Services #1"}
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          RS vs market +14% · Revisions +9 · Quality 91
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-lg justify-center hover:opacity-80"
        style={{ borderColor: "rgba(255,255,255,0.2)", color: "#ffffff", background: "rgba(255,255,255,0.08)" }}
      >
        Full case <ArrowUpRight className="h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}

// ── Regime weight adjustments ─────────────────────────────────────────────────

const REGIME_WEIGHTS = [
  { label: "Momentum weight",  value: "30%", delta: "+5pp", deltaColor: "var(--qc-up)",   note: "Growth & momentum rewarded" },
  { label: "Fundamentals",     value: "28%", delta: null,   deltaColor: null,              note: "Slightly reduced from 30% base" },
  { label: "Valuation weight", value: "7%",  delta: "−3pp", deltaColor: "var(--qc-down)", note: "Discipline relaxed in risk-on" },
];

function RegimeWeightsPanel() {
  return (
    <SectionPanel
      title={
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--qc-warn)" }}>
          Regime Weight Adjustments — Risk-On Active
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-8">
        {REGIME_WEIGHTS.map((w) => (
          <div key={w.label} className="flex flex-col gap-1">
            <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{w.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold" style={{ color: "var(--qc-text-heading)" }}>{w.value}</span>
              {w.delta && (
                <span className="text-[12px] font-semibold" style={{ color: w.deltaColor ?? undefined }}>{w.delta}</span>
              )}
            </div>
            <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{w.note}</span>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function RotationAlertsTab() {
  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* Signal stat tiles */}
      <div className="grid grid-cols-4 gap-3">
        <SignalTile label="Entry signals"  value="2" valueColor="var(--qc-up)"   sublabel="Industrials · Energy" />
        <SignalTile label="Exit signals"   value="1" valueColor="var(--qc-down)" sublabel="Real Estate" />
        <SignalTile label="Trap alerts"    value="1" valueColor="var(--qc-warn)" sublabel="Utilities" />
        <SignalTile label="News confirmed" value="2" valueColor="var(--qc-blue)" sublabel="News supports 2 of 3" />
      </div>

      {/* Active signals — 3-column grid inside a unified panel */}
      <TabularCard title="Active Signals">
        <div className="grid grid-cols-3 gap-4 p-1">

          {/* Col 1: Entry signal + confirming news (unified card) */}
          <SignalColumnCard
            type="entry"
            industry="Industrials"
            detail="Rank +7 in 3 weeks · Breadth 68% · Revisions +12 · Momentum top decile"
            newsTag="POLICY"
            newsHeadline="Rs 1.2L cr defence capex — Confirms entry"
            newsDir="positive"
            newsTags="Growth · Sentiment"
          />

          {/* Col 2: Exit signal + confirming news (unified card) */}
          <SignalColumnCard
            type="exit"
            industry="Real Estate"
            detail="Rank −4 in 3 weeks · Breadth 21% · Revisions −8"
            newsTag="MACRO"
            newsHeadline="RBI rate hold — Real Estate bonds cleared"
            newsDir="negative"
            newsTags="Valuation · Sentiment"
          />

          {/* Col 3: Trap + Emerging + High Conviction (stacked) */}
          <div className="flex flex-col gap-3">
            <SignalCard
              type="trap"
              industry="Utilities"
              detail="Price +6% in 4w but breadth only 28% and revisions −5"
            />
            <SignalCard
              type="emerging"
              industry="Materials"
              detail="Score +18 in 2w · Watch for breadth confirmation"
            />
            <HighConvictionCard />
          </div>

        </div>
      </TabularCard>

      {/* Regime weights */}
      <RegimeWeightsPanel />

    </div>
  );
}
