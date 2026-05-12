"use client";

import {
  TrendingUp, Package, BarChart2, Zap, AlertTriangle,
  DollarSign, CheckCircle2, XCircle,
} from "lucide-react";
import type { IndustryOverviewSection } from "@/types/opportunity";
import { MetricTile } from "@/components/molecules/metric-tile";

interface IndustryAnalysisCardProps {
  data?: IndustryOverviewSection;
}

function sentimentToLevel(sentiment: string): "up" | "down" | "warn" {
  if (sentiment === "positive") return "up";
  if (sentiment === "negative") return "down";
  return "warn";
}

function levelCssColor(level: "up" | "down" | "warn"): string {
  if (level === "up") return "var(--qc-up)";
  if (level === "down") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function scoreColor(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "var(--qc-up)";
  if (pct >= 0.4) return "var(--qc-warn)";
  return "var(--qc-down)";
}

function FindingsGrid({ data }: { data: IndustryOverviewSection }) {
  const signals = data.final_scoring?.signal_breakdown ?? [];
  if (!signals.length) return null;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {signals.map((s) => {
        const level = sentimentToLevel(s.sentiment);
        const borderColor = levelCssColor(level);
        const fill = scoreColor(s.score, s.max_score);
        return (
          <div
            key={s.key}
            style={{
              borderLeft: `4px solid ${borderColor}`,
              paddingLeft: 12, paddingTop: 10, paddingBottom: 10, paddingRight: 12,
              background: "var(--qc-section)", borderRadius: "0 6px 6px 0",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p style={{ fontSize: 10, fontWeight: 600, color: borderColor, letterSpacing: "0.05em" }}>
                {s.label.toUpperCase()}
              </p>
              <span style={{ fontSize: 11, fontWeight: 700, color: fill }}>
                {s.score}/{s.max_score}
              </span>
            </div>
            <ul className="space-y-0.5">
              {s.details.map((d, i) => (
                <li key={i} style={{ fontSize: 12, color: "var(--qc-ink)", lineHeight: 1.6 }}>• {d}</li>
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
                ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--qc-up)" }} />
                : <XCircle className="h-3.5 w-3.5" style={{ color: "var(--qc-ink-2)" }} />
              }
            </span>
            <p style={{ fontSize: 11, color: c.result ? "var(--qc-ink)" : "var(--qc-ink-2)", lineHeight: 1.5 }}>
              {label}
              {c.score > 0 && <span style={{ color: "var(--qc-up)", fontWeight: 600 }}> +{c.score}</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function IndustryAnalysisCard({ data }: IndustryAnalysisCardProps) {
  if (!data) return null;

  const m = data.metrics;
  const fs = data.final_scoring;
  const kpiMetrics = data.kpi_metrics;

  const industryMetrics = [
    { label: "Industry Revenue (TTM)", value: m?.industry_revenue_ttm?.value ?? "N/A", sublabel: undefined, change: m?.industry_revenue_ttm?.change, icon: DollarSign },
    { label: "Industry CAGR", value: (() => { const c = m?.industry_cagr; return c?.one_year ?? c?.three_year ?? c?.qoq ?? "N/A"; })(),
      sublabel: (() => { const c = m?.industry_cagr; return [c?.qoq && `QoQ: ${c.qoq}`, c?.one_year && `1Y: ${c.one_year}`, c?.three_year && `3Y: ${c.three_year}`].filter(Boolean).join(" | ") || undefined; })(),
      change: null, icon: TrendingUp },
    { label: "Industry OPM", value: m?.current_opm?.value ?? "N/A", sublabel: undefined, change: m?.current_opm?.change, icon: BarChart2 },
    { label: m?.industry_aum?.label ?? "Industry AUM", value: m?.industry_aum?.value ?? "N/A", sublabel: undefined, change: m?.industry_aum?.change, icon: Package },
    { label: "Industry ROCE", value: m?.industry_roce?.value ?? "N/A", sublabel: undefined, change: m?.industry_roce?.change, icon: BarChart2 },
    { label: "Demand Signal", value: m?.demand_signal?.value ?? "N/A", sublabel: m?.demand_signal?.sublabel ?? undefined, change: m?.demand_signal?.change ?? null, icon: Zap },
    { label: "Supply Constraint", value: m?.supply_constraint?.value ?? "N/A", sublabel: m?.supply_constraint?.sublabel ?? undefined, change: m?.supply_constraint?.change ?? null, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiMetrics && kpiMetrics.length > 0
          ? kpiMetrics.map((metric, i) => (
              <MetricTile key={i} label={metric.label} value={metric.value} sublabel={metric.sublabel ?? undefined} change={metric.change ?? undefined} />
            ))
          : industryMetrics.map((metric, i) => (
              <MetricTile key={i} label={metric.label} value={metric.value} sublabel={metric.sublabel} icon={metric.icon} change={metric.change ?? undefined} />
            ))
        }
      </div>

      <div className="space-y-4">
        {fs?.checks && !Array.isArray(fs.checks) && (
          <div className="rounded-lg p-4 space-y-3" style={{ border: "1px solid var(--qc-hair-2)", background: "var(--qc-card)" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Scoring Criteria
            </p>
            <ChecksList data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
