"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronUp,
  Users, RefreshCw, PieChart, TrendingUp, UserMinus,
  UserPlus, UserX,
  Shield, Zap, TrendingDown,
  Globe, Smartphone, Briefcase,
  CheckCircle2,
} from "lucide-react";
import { safeMetric, type CustomerTractionSection } from "@/types/opportunity";
import { TrendCharts } from "@/components/opportunity/trend-charts";

interface CustomerTractionCardProps {
  data?: CustomerTractionSection;
}

function splitLabelBody(item: string): [string, string] {
  const idx = item.indexOf(": ");
  if (idx === -1) return ["", item];
  return [item.slice(0, idx), item.slice(idx + 2)];
}

const altDataIcons = [Globe, Smartphone, Briefcase];

export function CustomerTractionCard({ data }: CustomerTractionCardProps) {
  const [showDetails, setShowDetails] = useState(true);

  const t = data?.text;
  const gm = t?.customer_growth?.metrics;
  const rm = t?.retention?.metrics;

  const customerMetrics = [
    { ...safeMetric(data?.metrics?.active_customers), icon: Users, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(data?.metrics?.net_retention), icon: RefreshCw, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(data?.metrics?.top_10_concentration), icon: PieChart, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(data?.metrics?.avg_contract_value), icon: TrendingUp, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { ...safeMetric(data?.metrics?.churn_rate), icon: UserMinus, iconColor: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800" },
  ];

  const growthTrajectory = [
    { ...safeMetric(gm?.current_base), icon: Users, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(gm?.five_year_growth), icon: TrendingUp, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(gm?.new_adds), icon: UserPlus, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(gm?.churned), icon: UserX, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  const retentionMetrics = [
    { ...safeMetric(rm?.net_revenue_retention), icon: TrendingUp, iconColor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { ...safeMetric(rm?.gross_revenue_retention), icon: Shield, iconColor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { ...safeMetric(rm?.expansion_revenue), icon: Zap, iconColor: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { ...safeMetric(rm?.annual_churn), icon: TrendingDown, iconColor: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  const acqItems = t?.customer_growth?.acquisition_dynamics ?? [];
  const acqGrid = acqItems.slice(0, 2);
  const acqBadge = acqItems[2];

  const stickiness = t?.retention?.product_stickiness ?? [];
  const expansion = t?.retention?.expansion_drivers ?? [];
  const seg = t?.segmentation;

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                {data?.meta?.section_id} {data?.meta?.title ?? 'Client / Customer Traction'}
              </h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 normal-case tracking-normal font-normal mt-0.5">
                {data?.meta?.subtitle}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs text-zinc-500">
            Weight: 15% of Total Score
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Top-level metric tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {customerMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                  <div className={`rounded-md p-1 ${m.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${m.iconColor}`} />
                  </div>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{m.value}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{m.sublabel}</p>
              </div>
            );
          })}
        </div>

        {/* Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {showDetails ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showDetails && (
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-4">

            {/* ── Key Customer Takeaway ── */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Key Customer Takeaway</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t?.key_takeaway ?? 'N/A'}</p>
            </div>

            {/* ── Customer Growth Trajectory ── */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
              <TrendCharts color="blue" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Customer Growth Trajectory</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {growthTrajectory.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                        <div className={`rounded-md p-1 ${m.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${m.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{m.value}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{m.sublabel}</p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Customer Acquisition Dynamics</span>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {acqGrid.map((item, i) => {
                    const [label, body] = splitLabelBody(item);
                    return (
                      <div key={i}>
                        {label && <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{label}</p>}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</p>
                      </div>
                    );
                  })}
                </div>
                {acqBadge && (() => {
                  const [label, body] = splitLabelBody(acqBadge);
                  return (
                    <div className="flex flex-wrap items-start gap-2 pt-1">
                      <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold uppercase shrink-0">
                        {label || "Note"}
                      </Badge>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{body}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── Retention & Revenue Expansion ── */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
              <TrendCharts color="blue" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Retention &amp; Revenue Expansion</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {retentionMetrics.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                        <div className={`rounded-md p-1 ${m.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${m.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{m.value}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{m.sublabel}</p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Why Retention is Strong</span>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Product Stickiness</p>
                    {stickiness.map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <div key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <div>
                            {label && <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}: </span>}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Expansion Drivers</p>
                    {expansion.map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <div key={i} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          <div>
                            {label && <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}: </span>}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Revenue Trajectory Projection (Alt Data Signals) ── */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Revenue Trajectory Projection (Alt Data Signals)</span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Alt Data Sources Tracked</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {(t?.alt_data_signals ?? []).map((s, i) => {
                  const Icon = altDataIcons[i % altDataIcons.length];
                  return (
                    <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-zinc-500" />
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{s.source ?? 'N/A'}</p>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.insight ?? 'N/A'}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Customer Segmentation & Revenue Mix ── */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Customer Segmentation &amp; Revenue Mix</span>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {(seg?.tiers ?? []).map((tier, i) => (
                  <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{tier.tier ?? 'N/A'}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{tier.customer_count ?? 'N/A'} Customers</p>
                    </div>
                    {tier.revenue_share && (
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-700 rounded px-2 py-1.5 leading-snug">
                        {tier.revenue_share}
                      </p>
                    )}
                    <div className="space-y-1">
                      {[
                        { label: "Avg ACV", value: tier.avg_acv },
                        { label: "Contracts", value: tier.contract_terms },
                        { label: "NRR", value: tier.nrr },
                        { label: "Churn", value: tier.churn },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-zinc-400 shrink-0" />
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="font-medium text-zinc-600 dark:text-zinc-300">{item.label}: </span>
                            {item.value ?? 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">⊙ Segmentation Strategy &amp; Insights</span>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Revenue Quality</p>
                    </div>
                    {(seg?.revenue_quality ?? []).map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <div key={i}>
                          {label && <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">{label}</p>}
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Growth Strategy</p>
                    </div>
                    {(seg?.growth_strategy ?? []).map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <div key={i}>
                          {label && <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">{label}</p>}
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2 pt-1">
                  <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold uppercase shrink-0">
                    Customer Takeaway
                  </Badge>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t?.takeaway ?? 'N/A'}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
