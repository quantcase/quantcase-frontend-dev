"use client";

import {
  TrendingUp, Package, BarChart2, Zap, AlertTriangle,
  DollarSign, CheckCircle2, XCircle, Info,
} from "lucide-react";
import type { IndustryOverviewSection } from "@/types/opportunity";
import { MetricTile } from "@/components/molecules/metric-tile";
import { TakeawayBox } from "@/components/opportunity/takeaway-box";
import { InsightsCard } from "@/components/opportunity/insights-card";

interface IndustryAnalysisCardProps {
  data?: IndustryOverviewSection;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sentimentToColor(sentiment: string): string {
  if (sentiment === "positive") return "green";
  if (sentiment === "negative") return "red";
  return "amber";
}

const FINDING_COLORS: Record<string, { border: string; label: string; labelColor: string }> = {
  green: { border: "#22c55e", label: "POSITIVE",   labelColor: "#22c55e" },
  red:   { border: "#ef4444", label: "NEGATIVE",   labelColor: "#ef4444" },
  amber: { border: "#f59e0b", label: "MIXED",      labelColor: "#f59e0b" },
};

function scoreColor(score: number, max: number) {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "#059669";
  if (pct >= 0.4) return "#D97706";
  return "#dc2626";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FindingsGrid({ data }: { data: IndustryOverviewSection }) {
  const signals = data.final_scoring?.signal_breakdown ?? [];
  if (!signals.length) return null;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {signals.map((s) => {
        const color = sentimentToColor(s.sentiment);
        const cfg = FINDING_COLORS[color];
        const fill = scoreColor(s.score, s.max_score);
        return (
          <div
            key={s.key}
            style={{
              borderLeft: `4px solid ${cfg.border}`,
              paddingLeft: 12, paddingTop: 10, paddingBottom: 10, paddingRight: 12,
              background: "#F9F9F9", borderRadius: "0 6px 6px 0",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p style={{ fontSize: 10, fontWeight: 600, color: cfg.labelColor, letterSpacing: "0.05em" }}>
                {s.label.toUpperCase()}
              </p>
              <span style={{ fontSize: 11, fontWeight: 700, color: fill }}>
                {s.score}/{s.max_score}
              </span>
            </div>
            <ul className="space-y-0.5">
              {s.details.map((d, i) => (
                <li key={i} style={{ fontSize: 12, color: "#121212", lineHeight: 1.6 }}>• {d}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ChecksList({ data }: { data: IndustryOverviewSection }) {
  const checks = data.final_scoring?.checks;
  if (!checks || Array.isArray(checks)) return null;
  const entries = Object.entries(checks as Record<string, { score: number; result: boolean }>);
  if (!entries.length) return null;

  return (
    <div className="space-y-1.5">
      {entries.map(([key, c]) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, ch => ch.toUpperCase());
        return (
          <div key={key} className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">
              {c.result
                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                : <XCircle className="h-3.5 w-3.5 text-zinc-300" />
              }
            </span>
            <p style={{ fontSize: 11, color: c.result ? "#121212" : "#888888", lineHeight: 1.5 }}>
              {label}
              {c.score > 0 && <span style={{ color: "#059669", fontWeight: 600 }}> +{c.score}</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IndustryAnalysisCard({ data }: IndustryAnalysisCardProps) {
  if (!data) return null;

  const m = data.metrics;
  const dsd = data.text?.demand_supply_dynamics;
  const opmTrend = data.text?.opm_trend;
  const fs = data.final_scoring;

  const kpiMetrics = data.kpi_metrics;

  const industryMetrics = [
    { label: "Industry Revenue (TTM)", value: m?.industry_revenue_ttm?.value ?? "N/A", sublabel: undefined, change: m?.industry_revenue_ttm?.change, icon: DollarSign },
    { label: "Industry CAGR",          value: (() => { const c = m?.industry_cagr; return c?.one_year ?? c?.three_year ?? c?.qoq ?? "N/A"; })(),
      sublabel: (() => { const c = m?.industry_cagr; return [c?.qoq && `QoQ: ${c.qoq}`, c?.one_year && `1Y: ${c.one_year}`, c?.three_year && `3Y: ${c.three_year}`].filter(Boolean).join(" | ") || undefined; })(),
      change: null, icon: TrendingUp },
    { label: "Industry OPM",           value: m?.current_opm?.value ?? "N/A", sublabel: undefined, change: m?.current_opm?.change, icon: BarChart2 },
    { label: m?.industry_aum?.label ?? "Industry AUM", value: m?.industry_aum?.value ?? "N/A", sublabel: undefined, change: m?.industry_aum?.change, icon: Package },
    { label: "Industry ROCE",          value: m?.industry_roce?.value ?? "N/A", sublabel: undefined, change: m?.industry_roce?.change, icon: BarChart2 },
    { label: "Demand Signal",          value: m?.demand_signal?.value ?? "N/A", sublabel: m?.demand_signal?.sublabel ?? undefined, change: m?.demand_signal?.change ?? null, icon: Zap },
    { label: "Supply Constraint",      value: m?.supply_constraint?.value ?? "N/A", sublabel: m?.supply_constraint?.sublabel ?? undefined, change: m?.supply_constraint?.change ?? null, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4">

      {/* Metric tiles — use kpi_metrics array when provided by the backend */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiMetrics && kpiMetrics.length > 0
          ? kpiMetrics.map((metric, i) => (
              <MetricTile
                key={i}
                label={metric.label}
                value={metric.value}
                sublabel={metric.sublabel ?? undefined}
                change={metric.change ?? undefined}
              />
            ))
          : industryMetrics.map((metric, i) => (
              <MetricTile
                key={i}
                label={metric.label}
                value={metric.value}
                sublabel={metric.sublabel}
                icon={metric.icon}
                change={metric.change ?? undefined}
              />
            ))
        }
      </div>

      <div className="space-y-4">

          {/* Scoring Criteria */}
          {fs?.checks && !Array.isArray(fs.checks) && (
            <div className="rounded-lg border border-zinc-100 bg-white p-4 space-y-3">
              <p style={{ fontSize: 10, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Scoring Criteria
              </p>
              <ChecksList data={data} />
            </div>
          )}

      </div>


    </div>
  );
}
