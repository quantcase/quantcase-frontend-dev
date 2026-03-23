"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Users, RefreshCw, PieChart, TrendingUp, UserMinus,
  UserPlus, UserX, Shield, Zap, TrendingDown,
  Globe, Smartphone, Briefcase, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { safeMetric, type CustomerTractionSection } from "@/types/opportunity";
import { ExpandToggle } from "@/components/molecules/expand-toggle";
import { TakeawayBox } from "@/components/opportunity/takeaway-box";
import { InsightsCard } from "@/components/opportunity/insights-card";
import { IconBox } from "@/components/molecules/icon-box";

interface CustomerTractionCardProps {
  data?: CustomerTractionSection;
}

function splitLabelBody(item: string): [string, string] {
  const idx = item.indexOf(": ");
  if (idx === -1) return ["", item];
  return [item.slice(0, idx), item.slice(idx + 2)];
}

// Derive a status pill from the metric value string
type PillVariant = "positive" | "negative" | "neutral" | "muted";

function deriveStatus(value: string): { label: string; variant: PillVariant } {
  const v = value.toLowerCase();
  if (v === "n/a" || v === "not disclosed" || v === "na") return { label: "N/A", variant: "muted" };
  if (/none|no losses|very low|implied very low|low \(proxy\)|greenfield/.test(v)) return { label: "Low", variant: "positive" };
  if (/(>100%|implied.*100|high.*proxy|high|strong|increasing|multiple oem|new oem|₹250)/.test(v)) return { label: "Strong", variant: "positive" };
  if (/(risk|declining|high churn|concentrated|weak)/.test(v)) return { label: "Risk", variant: "negative" };
  if (/(proxy|implied|n\/a|undisclosed|not disclosed)/.test(v)) return { label: "Est.", variant: "neutral" };
  return { label: "OK", variant: "neutral" };
}

const pillStyles: Record<PillVariant, string> = {
  positive: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  negative: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  neutral:  "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  muted:    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

interface ScorecardRowProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string;
  sublabel?: string;
  pill?: { label: string; variant: PillVariant };
  last?: boolean;
}

function ScorecardRow({ icon, label, value, sublabel, pill, last }: ScorecardRowProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 py-2.5 px-3",
      !last && "border-b border-zinc-200 dark:border-zinc-800"
    )}>
      {/* Left: icon + label */}
      <div className="flex items-center gap-2 w-40 shrink-0">
        <IconBox icon={icon} />
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-tight">{label}</span>
      </div>

      {/* Center: value */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{value}</span>
        {sublabel && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-snug mt-0.5 line-clamp-1">{sublabel}</p>
        )}
      </div>

      {/* Right: status pill */}
      {pill && (
        <span className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          pillStyles[pill.variant]
        )}>
          {pill.label}
        </span>
      )}
    </div>
  );
}

interface ScorecardGroupProps {
  icon: LucideIcon;
  title: string;
  rows: Omit<ScorecardRowProps, "last">[];
}

function ScorecardGroup({ icon: Icon, title, rows }: ScorecardGroupProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900">
      {/* Section header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <Icon className="h-3 w-3 text-zinc-400" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{title}</span>
      </div>
      {rows.map((row, i) => (
        <ScorecardRow key={i} {...row} last={i === rows.length - 1} />
      ))}
    </div>
  );
}

const altDataIcons = [Globe, Smartphone, Briefcase];

export function CustomerTractionCard({ data }: CustomerTractionCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const t = data?.text;
  const gm = t?.customer_growth?.metrics;
  const rm = t?.retention?.metrics;

  const customerMetrics = [
    { ...safeMetric(data?.metrics?.active_customers), icon: Users, iconColor: "text-blue-500" },
    { ...safeMetric(data?.metrics?.net_retention), icon: RefreshCw, iconColor: "text-emerald-500" },
    { ...safeMetric(data?.metrics?.top_10_concentration), icon: PieChart, iconColor: "text-purple-500" },
    { ...safeMetric(data?.metrics?.avg_contract_value), icon: TrendingUp, iconColor: "text-orange-500" },
    { ...safeMetric(data?.metrics?.churn_rate), icon: UserMinus, iconColor: "text-zinc-500" },
  ];

  const overallRows: Omit<ScorecardRowProps, "last">[] = customerMetrics.map((m) => ({
    icon: m.icon,
    iconColor: m.iconColor,
    label: m.label,
    value: m.value,
    sublabel: m.sublabel,
    pill: deriveStatus(m.value),
  }));

  const growthRows: Omit<ScorecardRowProps, "last">[] = [
    { ...safeMetric(gm?.current_base), icon: Users, iconColor: "text-blue-500" },
    { ...safeMetric(gm?.five_year_growth), icon: TrendingUp, iconColor: "text-emerald-500" },
    { ...safeMetric(gm?.new_adds), icon: UserPlus, iconColor: "text-purple-500" },
    { ...safeMetric(gm?.churned), icon: UserX, iconColor: "text-orange-500" },
  ].map((m) => ({ ...m, pill: deriveStatus(m.value) }));

  const retentionRows: Omit<ScorecardRowProps, "last">[] = [
    { ...safeMetric(rm?.net_revenue_retention), icon: TrendingUp, iconColor: "text-blue-500" },
    { ...safeMetric(rm?.gross_revenue_retention), icon: Shield, iconColor: "text-emerald-500" },
    { ...safeMetric(rm?.expansion_revenue), icon: Zap, iconColor: "text-purple-500" },
    { ...safeMetric(rm?.annual_churn), icon: TrendingDown, iconColor: "text-orange-500" },
  ].map((m) => ({ ...m, pill: deriveStatus(m.value) }));

  const acqItems = t?.customer_growth?.acquisition_dynamics ?? [];
  const acqGrid = acqItems.slice(0, 2);
  const acqBadgeItem = acqItems[2];
  const [acqBadgeLabel, acqBadgeBody] = acqBadgeItem ? splitLabelBody(acqBadgeItem) : ["Note", ""];

  const stickiness = t?.retention?.product_stickiness ?? [];
  const expansion = t?.retention?.expansion_drivers ?? [];
  const seg = t?.segmentation;

  const acqText = acqGrid
    .map((item) => {
      const [label, body] = splitLabelBody(item);
      return label ? `${label}: ${body}` : body;
    })
    .join(" · ");

  return (
    <div className="space-y-4">

      {/* ── Top section: Overall Trend (2 cols) + Insights (1 col) ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Overall Trend — spans 2 columns */}
        <div className="md:col-span-2">
          <ScorecardGroup icon={TrendingUp} title="Overall Trend" rows={overallRows} />
        </div>
        {/* Insights column — spans 1 column */}
        <div className="flex flex-col gap-1.5">
          {acqText && (
            <InsightsCard title="Customer Acquisition Dynamics" text={acqText} />
          )}
          {acqBadgeItem && (
            <InsightsCard title={acqBadgeLabel || "Note"} text={acqBadgeBody} />
          )}
          <InsightsCard title="Key Customer Takeaway" text={t?.key_takeaway ?? null} />
        </div>
      </div>

      <ExpandToggle expanded={showDetails} onToggle={() => setShowDetails(!showDetails)} />

      {showDetails && (
        <div className="space-y-3">

          {/* ── Growth + Retention: equal 2-col ── */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ScorecardGroup icon={Users} title="Customer Growth Trajectory" rows={growthRows} />
            <ScorecardGroup icon={RefreshCw} title="Retention & Revenue Expansion" rows={retentionRows} />
          </div>

          {/* ── Why Retention is Strong ── */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center gap-4 pb-4">
              <h5>Why Retention is Strong</h5>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex gap-2.5 pb-3">
                  <IconBox icon={Shield} />
                  <h5>PRODUCT STICKINESS</h5>
                </div>
                <ul>
                  {stickiness.map((item, i) => {
                    const [label, body] = splitLabelBody(item);
                    return (
                      <li key={i}>
                        {label && <span className="font-semibold">{label}: </span>}{body}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2.5 pb-3">
                  <IconBox icon={Zap} />
                  <h5>EXPANSION DRIVERS</h5>
                </div>
                <ul>
                  {expansion.map((item, i) => {
                    const [label, body] = splitLabelBody(item);
                    return (
                      <li key={i}>
                        {label && <span className="font-semibold">{label}: </span>}{body}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Alt Data Signals ── */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Revenue Trajectory — Alt Data Signals</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3">
              {(t?.alt_data_signals ?? []).map((s, i) => {
                const Icon = altDataIcons[i % altDataIcons.length];
                return (
                  <div key={i} className="flex items-start gap-4 my-4">
                    <Icon className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-tight">{s.source ?? "N/A"}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug pt-1">{s.insight ?? "N/A"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Customer Segmentation & Revenue Mix  ── */}
          {(seg?.tiers ?? []).length > 0 && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center gap-4 pb-1">
                <h5>Customer Segmentation &amp; Revenue Mix</h5>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(seg?.tiers ?? []).map((tier, i) => (
                  <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                    <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{tier.tier ?? "N/A"}</span>
                      <p className="text-xs text-zinc-400 mt-0.5">{tier.customer_count ?? "N/A"} customers</p>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {tier.revenue_share && (
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{tier.revenue_share}</p>
                      )}
                      {[
                        { label: "Avg ACV", value: tier.avg_acv },
                        { label: "Contracts", value: tier.contract_terms },
                        { label: "NRR", value: tier.nrr },
                        { label: "Churn", value: tier.churn },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-baseline gap-2">
                          <span className="text-[11px] text-zinc-400 shrink-0">{item.label}</span>
                          <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 text-right">{item.value ?? "N/A"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Segmentation Strategy & Insights */}
          {((seg?.revenue_quality ?? []).length > 0 || (seg?.growth_strategy ?? []).length > 0) && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center gap-4 pb-4">
                <h5>Segmentation Strategy &amp; Insights</h5>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex gap-2.5 pb-3">
                    <IconBox icon={CheckCircle2} />
                    <h5>REVENUE QUALITY</h5>
                  </div>
                  <ul>
                    {(seg?.revenue_quality ?? []).map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <li key={i}>
                          {label && <span className="font-semibold">{label}: </span>}{body}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2.5 pb-3">
                    <IconBox icon={TrendingUp} />
                    <h5>GROWTH STRATEGY</h5>
                  </div>
                  <ul>
                    {(seg?.growth_strategy ?? []).map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <li key={i}>
                          {label && <span className="font-semibold">{label}: </span>}{body}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      <TakeawayBox title="CUSTOMER TAKEAWAY" text={t?.takeaway} />
    </div>
  );
}
