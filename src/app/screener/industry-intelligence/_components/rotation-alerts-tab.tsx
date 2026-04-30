"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabularCard } from "@/components/molecules/tabular-card";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import type { IIRotationAlerts, IIMeta, IIHighConvictionPick, IIRegimeWeight } from "@/types/industry-intelligence";

// ── Signal stat tiles ─────────────────────────────────────────────────────────

function SignalTile({ label, value, valueColor, sublabel }: {
  label: string; value: string; valueColor: string; sublabel: string;
}) {
  return (
    <Card className="rounded-[10px] shadow-none px-4 py-3 gap-1.5" style={{ borderColor: "var(--qc-border-default)" }}>
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

// ── Unified signal + news column card ────────────────────────────────────────

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
    <Card className="rounded-[10px] shadow-none p-0 gap-0 overflow-hidden" style={{ borderColor: s.border }}>
      <div className="px-4 py-3 flex flex-col gap-1.5" style={{ background: s.bg }}>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</span>
        <p className="text-[17px] font-semibold leading-snug" style={{ color: s.color }}>{industry}</p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{detail}</p>
      </div>
      <div className="h-px" style={{ background: "var(--qc-border-inner)" }} />
      <div className="px-4 py-3 flex flex-col gap-2">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--qc-text-muted)" }}>
          News Confirming Signal
        </span>
        <Badge className="self-start text-[9px] font-bold tracking-widest px-2 py-0.5">{newsTag}</Badge>
        <p className="text-[12px] leading-snug" style={{ color: "var(--qc-text-heading)" }}>{newsHeadline}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] font-semibold"
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

// ── Standalone signal card ────────────────────────────────────────────────────

function SignalCard({ type, industry, detail }: { type: SignalType; industry: string; detail: string }) {
  const s = SIGNAL_STYLES[type];
  return (
    <Card className="rounded-[10px] shadow-none px-4 py-3 gap-1.5" style={{ background: s.bg, borderColor: s.border }}>
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</span>
      <p className="text-[17px] font-semibold leading-snug" style={{ color: s.color }}>{industry}</p>
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{detail}</p>
    </Card>
  );
}

// ── High conviction card ──────────────────────────────────────────────────────

function HighConvictionCard({ pick }: { pick: IIHighConvictionPick }) {
  return (
    <Card className="rounded-[10px] shadow-none px-4 py-4 gap-3" style={{ background: "var(--qc-text-heading)", borderColor: "transparent" }}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
          High Conviction Pick
        </span>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{pick.context}</span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>
          <span style={{ color: "#C084FC" }}>{pick.ticker}</span>{` · ${pick.cluster_label}`}
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          RS vs market {pick.rs_vs_market_pct} · Revisions {pick.revisions} · Quality {pick.quality_score}
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

// ── Regime weights panel ──────────────────────────────────────────────────────

function RegimeWeightsPanel({ weights, regime }: { weights: IIRegimeWeight[]; regime: string }) {
  return (
    <SectionPanel
      title={
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--qc-warn)" }}>
          Regime Weight Adjustments — {regime} Active
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-8">
        {weights.map((w) => (
          <div key={w.label} className="flex flex-col gap-1">
            <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{w.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold" style={{ color: "var(--qc-text-heading)" }}>{w.value_pct}</span>
              {w.delta && (
                <span className="text-[12px] font-semibold" style={{
                  color: w.delta_direction === "positive" ? "var(--qc-up)" : "var(--qc-down)",
                }}>
                  {w.delta}
                </span>
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

export function RotationAlertsTab({ data, meta }: { data: IIRotationAlerts; meta: IIMeta }) {
  const { signal_counts: sc, active_signals: as_, high_conviction_pick, regime_weights } = data;

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* Signal stat tiles */}
      <div className="grid grid-cols-4 gap-3">
        <SignalTile label="Entry signals"  value={String(sc.entry_count)}           valueColor="var(--qc-up)"   sublabel={sc.entry_industries.join(" · ")} />
        <SignalTile label="Exit signals"   value={String(sc.exit_count)}            valueColor="var(--qc-down)" sublabel={sc.exit_industries.join(" · ")} />
        <SignalTile label="Trap alerts"    value={String(sc.trap_count)}            valueColor="var(--qc-warn)" sublabel={sc.trap_industries.join(" · ")} />
        <SignalTile label="News confirmed" value={String(sc.news_confirmed_count)}  valueColor="var(--qc-blue)" sublabel={sc.news_confirmed_detail} />
      </div>

      {/* Active signals */}
      <TabularCard title="Active Signals">
        <div className="grid grid-cols-3 gap-4 p-1">

          <SignalColumnCard
            type="entry"
            industry={as_.entry.industry}
            detail={as_.entry.detail}
            newsTag={as_.entry.confirming_news.category}
            newsHeadline={as_.entry.confirming_news.headline}
            newsDir={as_.entry.confirming_news.sentiment_direction}
            newsTags={as_.entry.confirming_news.factor_tags.join(" · ")}
          />

          <SignalColumnCard
            type="exit"
            industry={as_.exit.industry}
            detail={as_.exit.detail}
            newsTag={as_.exit.confirming_news.category}
            newsHeadline={as_.exit.confirming_news.headline}
            newsDir={as_.exit.confirming_news.sentiment_direction}
            newsTags={as_.exit.confirming_news.factor_tags.join(" · ")}
          />

          <div className="flex flex-col gap-3">
            <SignalCard type="trap"     industry={as_.trap.industry}     detail={as_.trap.detail} />
            <SignalCard type="emerging" industry={as_.emerging.industry} detail={as_.emerging.detail} />
            <HighConvictionCard pick={high_conviction_pick} />
          </div>

        </div>
      </TabularCard>

      <RegimeWeightsPanel weights={regime_weights} regime={meta.regime} />

    </div>
  );
}
