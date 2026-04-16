"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import type { IndustryAnalysis } from "@/types/opportunity";
import { ScoringCard } from "@/components/molecules/scoring-card";
import { TakeawayBox } from "@/components/opportunity/takeaway-box";
import { InsightsCard } from "@/components/opportunity/insights-card";
import { GrowthRisks } from "@/components/opportunity/growth-risks";
import { IndustryCompanyTable } from "@/components/opportunity/industry-company-table";
import { ExpandToggle } from "@/components/molecules/expand-toggle";
import { MetricTile } from "@/components/molecules/metric-tile";
import {
  TrendingUp, TrendingDown, BarChart2, Activity, Package,
  CheckCircle2, XCircle, AlertTriangle, Clock,
} from "lucide-react";

interface IndustryAnalysisCardProps {
  data: IndustryAnalysis;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FINDING_COLORS: Record<string, { border: string; label: string; labelColor: string }> = {
  green:  { border: "#22c55e", label: "POSITIVE",  labelColor: "#22c55e" },
  red:    { border: "#ef4444", label: "NEGATIVE",  labelColor: "#ef4444" },
  amber:  { border: "#f59e0b", label: "MIXED",     labelColor: "#f59e0b" },
  blue:   { border: "#3b82f6", label: "STRUCTURAL",labelColor: "#3b82f6" },
};

function FindingsGrid({ findings }: { findings: IndustryAnalysis["key_findings"] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {findings.map((f, i) => {
        const cfg = FINDING_COLORS[f.color] ?? FINDING_COLORS.amber;
        return (
          <div
            key={i}
            style={{
              borderLeft: `4px solid ${cfg.border}`,
              paddingLeft: 12,
              paddingTop: 10,
              paddingBottom: 10,
              paddingRight: 12,
              background: "#F9F9F9",
              borderRadius: "0 6px 6px 0",
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, color: cfg.labelColor, letterSpacing: "0.05em", marginBottom: 4 }}>
              {f.theme.toUpperCase()}
            </p>
            <p style={{ fontSize: 12, color: "#121212", lineHeight: 1.6 }}>{f.body}</p>
          </div>
        );
      })}
    </div>
  );
}

function CoherenceChecks({ checks }: { checks: IndustryAnalysis["coherence_checks"] }) {
  return (
    <div className="space-y-3">
      {checks.map((c, i) => {
        const isCoherent = c.type === "coherent";
        const border = isCoherent ? "#22c55e" : "#ef4444";
        const labelColor = isCoherent ? "#22c55e" : "#ef4444";
        const label = isCoherent ? "COHERENT" : "INCOHERENT";
        return (
          <div
            key={i}
            style={{
              borderLeft: `4px solid ${border}`,
              paddingLeft: 12,
              paddingTop: 10,
              paddingBottom: 10,
              paddingRight: 12,
              background: "#F9F9F9",
              borderRadius: "0 6px 6px 0",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {isCoherent
                ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: labelColor }} />
                : <XCircle className="h-3.5 w-3.5 shrink-0" style={{ color: labelColor }} />
              }
              <p style={{ fontSize: 11, fontWeight: 700, color: labelColor, letterSpacing: "0.05em" }}>{label}</p>
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", marginBottom: 4 }}>{c.pattern}</p>
            <p style={{ fontSize: 12, color: "#888888", lineHeight: 1.6 }}>{c.explanation}</p>
          </div>
        );
      })}
    </div>
  );
}

function IndustryMetricsGrid({ metrics }: { metrics: IndustryAnalysis["industry_metrics"] }) {
  const tiles = [
    {
      key: "industry_roce",
      icon: TrendingUp,
      format: (m: typeof metrics[string]) => ({
        value: m.value ?? "N/A",
        sublabel: m.vs_wacc_spread ?? "",
      }),
    },
    {
      key: "revenue_growth_yoy",
      icon: BarChart2,
      format: (m: typeof metrics[string]) => ({ value: m.value ?? "N/A", sublabel: "" }),
    },
    {
      key: "operating_margin",
      icon: Activity,
      format: (m: typeof metrics[string]) => ({
        value: m.value ?? "N/A",
        sublabel: m.trend ?? "",
      }),
    },
    {
      key: "avg_capacity_utilization",
      icon: Package,
      format: (m: typeof metrics[string]) => ({ value: m.value ?? "N/A", sublabel: "" }),
    },
    {
      key: "rising_capex_count",
      icon: TrendingUp,
      format: (m: typeof metrics[string]) => ({
        value: m.count != null && m.total != null ? `${m.count}/${m.total}` : "N/A",
        sublabel: "",
      }),
    },
    {
      key: "bullish_sentiment",
      icon: Activity,
      format: (m: typeof metrics[string]) => ({
        value: m.count != null && m.total != null ? `${m.count}/${m.total}` : "N/A",
        sublabel: "",
      }),
    },
    {
      key: "inventory_trend",
      icon: Package,
      format: (m: typeof metrics[string]) => ({
        value: m.direction ? m.direction.charAt(0).toUpperCase() + m.direction.slice(1) : "N/A",
        sublabel: m.count != null && m.total != null ? `${m.count}/${m.total} cos` : "",
      }),
    },
    {
      key: "falling_receivables_count",
      icon: TrendingDown,
      format: (m: typeof metrics[string]) => ({
        value: m.count != null && m.total != null ? `${m.count}/${m.total}` : "N/A",
        sublabel: "",
      }),
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map(({ key, icon, format }) => {
        const m = metrics[key];
        if (!m) return null;
        const { value, sublabel } = format(m);
        return (
          <MetricTile
            key={key}
            label={m.label}
            value={value}
            sublabel={sublabel || undefined}
            icon={icon}
          />
        );
      })}
    </div>
  );
}

function WatchpointsList({ points }: { points: string[] }) {
  return (
    <div className="space-y-2">
      {points.map((p, i) => (
        <div key={i} className="flex gap-2.5">
          <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-400" />
          <p style={{ fontSize: 12, color: "#888888", lineHeight: 1.6 }}>{p}</p>
        </div>
      ))}
    </div>
  );
}

function RepresentativeQuotes({ quotes }: { quotes: string[] }) {
  if (!quotes.length) return null;
  return (
    <div className="space-y-2 pt-2 border-t border-zinc-100">
      <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Representative Quotes
      </p>
      {quotes.map((q, i) => (
        <div key={i} className="flex gap-2.5">
          <Quote className="h-3 w-3 shrink-0 mt-0.5 text-zinc-300" />
          <p style={{ fontSize: 11, color: "#888888", lineHeight: 1.6 }}>{q}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IndustryAnalysisCard({ data }: IndustryAnalysisCardProps) {
  const [showDeepDive, setShowDeepDive] = useState(false);

  const sc = data.score_card;
  const scoringRows = Object.entries(sc.dimensions).map(([key, dim]) => ({
    name: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    score: dim.score,
    maxScore: dim.max,
    status: dim.status,
  }));

  const impl = data.investment_implications;
  const strategy = impl.recommended_strategy;

  return (
    <div className="space-y-4">
      {/* Score card + metrics tiles */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <ScoringCard
            title={sc.status.replace(/_/g, " ")}
            scoreLabel="INDUSTRY SCORE"
            score={sc.total}
            maxScore={Object.values(sc.dimensions).reduce((sum, d) => sum + d.max, 0)}
            rows={scoringRows}
          />
        </div>
        <div className="lg:col-span-2">
          <IndustryMetricsGrid metrics={data.industry_metrics} />
        </div>
      </div>

      {/* Key Findings */}
      <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
        <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Key Findings
        </p>
        <FindingsGrid findings={data.key_findings} />
      </div>

      <ExpandToggle
        expanded={showDeepDive}
        onToggle={() => setShowDeepDive(!showDeepDive)}
        label="Show Deep Dive"
        collapseLabel="Hide Deep Dive"
      />

      {showDeepDive && (
        <div className="space-y-4">

          {/* Company Table */}
          <div className="space-y-2">
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Peer Company Snapshot
            </p>
            <IndustryCompanyTable rows={data.company_table} />
          </div>

          {/* Demand Drivers */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Demand Drivers
            </p>
            <GrowthRisks
              positiveTitle="Positive Drivers"
              negativeTitle="Headwinds / Concerns"
              positiveItems={data.demand_drivers.positive.map(d => d.driver ?? "")}
              negativeItems={data.demand_drivers.negative.map(d => d.concern ?? "")}
            />
            <RepresentativeQuotes quotes={data.demand_drivers.representative_quotes} />
          </div>

          {/* Supply Drivers */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Supply Dynamics
            </p>
            <GrowthRisks
              positiveTitle="Tightness Indicators"
              negativeTitle="Excess / Slack Indicators"
              positiveItems={data.supply_drivers.tightness_indicators.map(d => d.indicator ?? "")}
              negativeItems={data.supply_drivers.excess_indicators.map(d => d.indicator ?? "")}
            />
            <RepresentativeQuotes quotes={data.supply_drivers.representative_quotes} />
          </div>

          {/* Coherence Checks */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Signal Coherence Checks
            </p>
            <CoherenceChecks checks={data.coherence_checks} />
          </div>

          {/* Investment Implications */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Investment Implications
            </p>
            <GrowthRisks
              positiveTitle="Positive Signals"
              negativeTitle="Key Risks"
              positiveItems={impl.positive_signals.map(s => `${s.signal} — ${s.evidence}`)}
              negativeItems={impl.risks.map(r => `${r.risk} — ${r.evidence}`)}
            />
          </div>

          {/* Recommended Strategy */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-zinc-400" />
              <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Recommended Strategy
              </p>
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#fff",
                background: "#0F172B", borderRadius: 4, padding: "2px 8px",
                letterSpacing: "0.05em",
              }}>
                {strategy.action}
              </span>
            </div>
            <InsightsCard title="THESIS" text={strategy.thesis} />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <InsightsCard title="SEGMENT" text={strategy.segment} />
              <InsightsCard title="RATIONALE" text={strategy.rationale} />
            </div>
            <InsightsCard title="TIMING" text={strategy.timing} />
          </div>

          {/* Next Quarter Watchpoints */}
          <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
            <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Next Quarter Watchpoints
            </p>
            <WatchpointsList points={impl.next_quarter_watchpoints} />
          </div>

        </div>
      )}

      {/* Key Takeaway */}
      <TakeawayBox title="INDUSTRY TAKEAWAY" text={data.key_takeaway} noBleed />
    </div>
  );
}
