"use client";

import type { LucideIcon } from "lucide-react";
import {
  Users, RefreshCw, PieChart, TrendingUp, UserMinus,
  Globe, Smartphone, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { safeMetric, type CustomerTractionSection } from "@/types/opportunity";
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

// ── Revenue Trajectory — Alt Data Signals ─────────────────────────────────────

const altDataIcons = [Globe, Smartphone, Briefcase];
type AltDataSignal = { source?: string; insight?: string };

function RevenueTrajectorySignals({ signals }: { signals: AltDataSignal[] }) {
  if (!signals || signals.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
          Revenue Trajectory
        </p>
        <div className="flex-1 h-px bg-[#E2E2E2]" />
        <p className="text-[10px] text-[#AAAAAA]">Alt Data Signals</p>
      </div>

      <div className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] divide-y divide-[#E2E2E2]">
        {signals.map((s, i) => {
          const Icon = altDataIcons[i % altDataIcons.length];
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 p-1 rounded-[5px] border border-[rgba(18,18,18,0.10)] bg-white shrink-0">
                <Icon className="h-3 w-3 text-zinc-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#0F172B] leading-tight mb-0.5">
                  {s.source ?? "N/A"}
                </p>
                <p style={{ fontSize: 11, color: "#888888", lineHeight: 1.5 }}>
                  {s.insight ?? "N/A"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CustomerTractionCard({ data }: CustomerTractionCardProps) {
  const core = data?.core;
  const t = core?.text;
  const metrics = core?.metrics;

  const customerMetrics = [
    { ...safeMetric(metrics?.active_customers), icon: Users, iconColor: "text-blue-500" },
    { ...safeMetric(metrics?.net_retention), icon: RefreshCw, iconColor: "text-emerald-500" },
    { ...safeMetric(metrics?.top_10_concentration), icon: PieChart, iconColor: "text-purple-500" },
    { ...safeMetric(metrics?.avg_contract_value), icon: TrendingUp, iconColor: "text-orange-500" },
    { ...safeMetric(metrics?.churn_rate), icon: UserMinus, iconColor: "text-zinc-500" },
  ];

  const overallRows: Omit<ScorecardRowProps, "last">[] = customerMetrics.map((m) => ({
    icon: m.icon,
    iconColor: m.iconColor,
    label: m.label,
    value: m.value,
    sublabel: m.sublabel,
    pill: deriveStatus(m.value),
  }));

  const stickiness = t?.retention?.product_stickiness ?? [];
  const expansion = t?.retention?.expansion_drivers ?? [];
  const tiers = t?.segmentation?.tiers ?? [];
  const altDataSignals = t?.alt_data_signals ?? [];

  return (
    <div className="space-y-4">

      {/* ── Overall Trend ── */}
      <ScorecardGroup icon={TrendingUp} title="Overall Trend" rows={overallRows} />

      <div className="space-y-3">

          {/* ── Why Retention is Strong ── */}
          {(stickiness.length > 0 || expansion.length > 0) && (
            <div className="space-y-3">
              {/* Section label */}
              <div className="flex items-center gap-2">
                <p style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Why Retention is Strong
                </p>
                <div className="flex-1 h-px bg-[#E2E2E2]" />
              </div>

              {/* Two-column layout */}
              <div className="flex gap-4">
                {/* Product Stickiness */}
                {stickiness.length > 0 && (
                  <div
                    className="flex-1 min-w-0 rounded-lg border bg-white p-4 space-y-3"
                    style={{ borderColor: "#0F172B", borderTopWidth: 3 }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0F172B]">
                      Product Stickiness
                    </p>
                    <div className="space-y-1">
                      {stickiness.map((item, i) => {
                        const [label, body] = splitLabelBody(item);
                        return (
                          <div key={i} className="space-y-0.5">
                            {label ? (
                              <>
                                <p className="text-[12px] font-semibold text-[#0F172B]">— {label}</p>
                                <ul className="pl-3">
                                  <li style={{ fontSize: 12, color: "#888888", lineHeight: 1.6 }}>– {body}</li>
                                </ul>
                              </>
                            ) : (
                              <ul className="pl-3">
                                <li style={{ fontSize: 12, color: "#888888", lineHeight: 1.6 }}>– {body}</li>
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expansion Drivers */}
                {expansion.length > 0 && (
                  <div
                    className="flex-1 min-w-0 rounded-lg border bg-white p-4 space-y-3"
                    style={{ borderColor: "#71717a", borderTopWidth: 3 }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Expansion Drivers
                    </p>
                    <div className="space-y-1">
                      {expansion.map((item, i) => {
                        const [label, body] = splitLabelBody(item);
                        return (
                          <div key={i} className="space-y-0.5">
                            {label ? (
                              <>
                                <p className="text-[12px] font-semibold text-[#0F172B]">— {label}</p>
                                <ul className="pl-3">
                                  <li style={{ fontSize: 12, color: "#888888", lineHeight: 1.6 }}>– {body}</li>
                                </ul>
                              </>
                            ) : (
                              <ul className="pl-3">
                                <li style={{ fontSize: 12, color: "#888888", lineHeight: 1.6 }}>– {body}</li>
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Customer Segmentation + Revenue Trajectory ── */}
          {(tiers.length > 0 || altDataSignals.length > 0) && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <div className="grid grid-cols-2 gap-6">

                {/* Left col — Customer Segmentation (stacked list, Revenue Trajectory style) */}
                {tiers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                        Customer Segmentation
                      </p>
                      <div className="flex-1 h-px bg-[#E2E2E2]" />
                    </div>
                    <div className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] divide-y divide-[#E2E2E2]">
                      {tiers.map((tier, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3">
                          <div className="mt-0.5 p-1 rounded-[5px] border border-[rgba(18,18,18,0.10)] bg-white shrink-0">
                            <Users className="h-3 w-3 text-zinc-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#0F172B] leading-tight mb-0.5">
                              {tier.name ?? "N/A"}
                            </p>
                            <p style={{ fontSize: 11, color: "#888888", lineHeight: 1.5 }}>
                              {tier.description ?? "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Right col — Revenue Trajectory (Alt Data Signals) */}
                {altDataSignals.length > 0 && (
                  <div>
                    <RevenueTrajectorySignals signals={altDataSignals} />
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

    </div>
  );
}
