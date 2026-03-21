"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Users, RefreshCw, PieChart, TrendingUp, UserMinus,
  UserPlus, UserX,
  Shield, Zap, TrendingDown,
  Globe, Smartphone, Briefcase,
  CheckCircle2, Database, Info,
} from "lucide-react";
import { safeMetric, type CustomerTractionSection } from "@/types/opportunity";
import { MetricTile } from "@/components/molecules/metric-tile";
import { ExpandToggle } from "@/components/molecules/expand-toggle";
import { TakeawayBox } from "@/components/opportunity/takeaway-box";

interface CustomerTractionCardProps {
  data?: CustomerTractionSection;
}

function splitLabelBody(item: string): [string, string] {
  const idx = item.indexOf(": ");
  if (idx === -1) return ["", item];
  return [item.slice(0, idx), item.slice(idx + 2)];
}

const altDataIcons = [Globe, Smartphone, Briefcase];
const altDataTitleColors = ["text-purple-600", "text-blue-600", "text-green-600"];
const tierCardBg = ["bg-white dark:bg-zinc-900", "bg-white dark:bg-zinc-900", "bg-white dark:bg-zinc-900"];
const tierTitleColors = ["text-blue-600 dark:text-blue-400", "text-green-600 dark:text-green-400", "text-purple-600 dark:text-purple-400"];
const tierValueColors = ["text-blue-700 dark:text-blue-300", "text-green-700 dark:text-green-300", "text-purple-700 dark:text-purple-300"];

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

  const growthTrajectory = [
    { ...safeMetric(gm?.current_base), icon: Users, iconColor: "text-blue-500" },
    { ...safeMetric(gm?.five_year_growth), icon: TrendingUp, iconColor: "text-emerald-500" },
    { ...safeMetric(gm?.new_adds), icon: UserPlus, iconColor: "text-purple-500" },
    { ...safeMetric(gm?.churned), icon: UserX, iconColor: "text-orange-500" },
  ];

  const retentionMetrics = [
    { ...safeMetric(rm?.net_revenue_retention), icon: TrendingUp, iconColor: "text-blue-500" },
    { ...safeMetric(rm?.gross_revenue_retention), icon: Shield, iconColor: "text-emerald-500" },
    { ...safeMetric(rm?.expansion_revenue), icon: Zap, iconColor: "text-purple-500" },
    { ...safeMetric(rm?.annual_churn), icon: TrendingDown, iconColor: "text-orange-500" },
  ];

  const acqItems = t?.customer_growth?.acquisition_dynamics ?? [];
  const acqGrid = acqItems.slice(0, 2);
  const acqBadge = acqItems[2];

  const stickiness = t?.retention?.product_stickiness ?? [];
  const expansion = t?.retention?.expansion_drivers ?? [];
  const seg = t?.segmentation;

  return (
    <div className="space-y-4">

      {/* Top-level metric tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {customerMetrics.map((m, i) => (
          <MetricTile key={i} {...m} />
        ))}
      </div>

      <ExpandToggle expanded={showDetails} onToggle={() => setShowDetails(!showDetails)} />

      {showDetails && (
        <div className="">

          {/* Key Customer Takeaway */}
          <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <h5>Key Customer Takeaway</h5>
            </div>
            <p>{t?.key_takeaway ?? 'N/A'}</p>
          </div>

          {/* ── Customer Growth Trajectory ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
              <h6 className="uppercase tracking-wider">Customer Growth Trajectory</h6>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {growthTrajectory.map((m, i) => (
                <MetricTile key={i} {...m} className="border-zinc-200 dark:border-zinc-700" />
              ))}
            </div>
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <h5>Customer Acquisition Dynamics</h5>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {acqGrid.map((item, i) => {
                  const [label, body] = splitLabelBody(item);
                  return (
                    <div key={i}>
                      {label && <h6 className="mb-1">{label}</h6>}
                      <p>{body}</p>
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
                    <p>{body}</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── Retention & Revenue Expansion ── */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
              <h6 className="uppercase tracking-wider">Retention &amp; Revenue Expansion</h6>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {retentionMetrics.map((m, i) => (
                <MetricTile key={i} {...m} className="border-zinc-200 dark:border-zinc-700" />
              ))}
            </div>
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <h5>Why Retention is Strong</h5>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2.5">
                  <h5>Product Stickiness</h5>
                  {stickiness.map((item, i) => {
                    const [label, body] = splitLabelBody(item);
                    return (
                      <div key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <div>
                          {label && <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}: </span>}
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{body}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2.5">
                  <h5>Expansion Drivers</h5>
                  {expansion.map((item, i) => {
                    const [label, body] = splitLabelBody(item);
                    return (
                      <div key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <div>
                          {label && <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}: </span>}
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
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
              <h6 className="uppercase tracking-wider">Revenue Trajectory Projection (Alt Data Signals)</h6>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <h6 className="uppercase tracking-wider">Alt Data Sources Tracked</h6>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {(t?.alt_data_signals ?? []).map((s, i) => {
                  const Icon = altDataIcons[i % altDataIcons.length];
                  const titleColor = altDataTitleColors[i % altDataTitleColors.length];
                  return (
                    <div key={i} className="bg-white dark:bg-zinc-900 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${titleColor}`} />
                        <h6 className={titleColor}>{s.source ?? 'N/A'}</h6>
                      </div>
                      <p>{s.insight ?? 'N/A'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Customer Segmentation & Revenue Mix ── */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-zinc-500" />
              <h6 className="uppercase tracking-wider">Customer Segmentation &amp; Revenue Mix</h6>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {(seg?.tiers ?? []).map((tier, i) => (
                <div key={i} className={`rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 space-y-3 ${tierCardBg[i % tierCardBg.length]}`}>
                  <div>
                    <h6 className={`uppercase tracking-wider ${tierTitleColors[i % tierTitleColors.length]}`}>{tier.tier ?? 'N/A'}</h6>
                    <p className="mt-0.5">{tier.customer_count ?? 'N/A'} Customers</p>
                  </div>
                  {tier.revenue_share && (
                    <p className={`font-semibold ${tierValueColors[i % tierValueColors.length]} bg-zinc-50 dark:bg-zinc-800 rounded px-2 py-1.5 leading-snug`}>
                      {tier.revenue_share}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {[
                      { label: "Avg ACV", value: tier.avg_acv },
                      { label: "Contracts", value: tier.contract_terms },
                      { label: "NRR", value: tier.nrr },
                      { label: "Churn", value: tier.churn },
                    ].map((item) => (
                      <p key={item.label}>
                        <span className="mr-1 text-zinc-400">•</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.label}:</span>{" "}
                        {item.value ?? 'N/A'}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <h5>Segmentation Strategy &amp; Insights</h5>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <h5>Revenue Quality</h5>
                  </div>
                  {(seg?.revenue_quality ?? []).map((item, i) => {
                    const [label, body] = splitLabelBody(item);
                    return (
                      <div key={i}>
                        {label && <h6 className="mb-0.5">{label}</h6>}
                        <p>{body}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                    <h5>Growth Strategy</h5>
                  </div>
                  {(seg?.growth_strategy ?? []).map((item, i) => {
                    const [label, body] = splitLabelBody(item);
                    return (
                      <div key={i}>
                        {label && <h6 className="mb-0.5">{label}</h6>}
                        <p>{body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      <TakeawayBox title="CUSTOMER TAKEAWAY" text={t?.takeaway} />
    </div>
  );
}
