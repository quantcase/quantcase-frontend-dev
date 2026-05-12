"use client";

import type { LucideIcon } from "lucide-react";
import {
  Users, RefreshCw, PieChart, TrendingUp, UserMinus,
  Globe, Smartphone, Briefcase,
} from "lucide-react";
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

function pillStyle(variant: PillVariant): React.CSSProperties {
  if (variant === "positive") return { color: "var(--qc-up)", background: "var(--qc-up-soft)", border: "1px solid var(--qc-up)" };
  if (variant === "negative") return { color: "var(--qc-down)", background: "var(--qc-down-soft)", border: "1px solid var(--qc-down)" };
  if (variant === "neutral") return { color: "var(--qc-blue)", background: "var(--qc-blue-soft)", border: "1px solid var(--qc-blue)" };
  return { color: "var(--qc-ink-2)", background: "var(--qc-section)", border: "1px solid var(--qc-hair)" };
}

interface ScorecardRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  pill?: { label: string; variant: PillVariant };
  last?: boolean;
}

function ScorecardRow({ icon, label, value, sublabel, pill, last }: ScorecardRowProps) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 px-3"
      style={{ borderBottom: last ? "none" : "1px solid var(--qc-hair-2)" }}
    >
      <div className="flex items-center gap-2 w-40 shrink-0">
        <IconBox icon={icon} />
        <span className="text-[11px] font-medium uppercase tracking-wider leading-tight" style={{ color: "var(--qc-ink-2)" }}>{label}</span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold leading-snug" style={{ color: "var(--qc-ink)" }}>{value}</span>
        {sublabel && (
          <p className="text-[11px] leading-snug mt-0.5 line-clamp-1" style={{ color: "var(--qc-ink-2)" }}>{sublabel}</p>
        )}
      </div>

      {pill && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={pillStyle(pill.variant)}
        >
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
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: "var(--qc-section)", borderBottom: "1px solid var(--qc-hair)" }}>
        <Icon className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--qc-ink-2)" }}>{title}</span>
      </div>
      {rows.map((row, i) => (
        <ScorecardRow key={i} {...row} last={i === rows.length - 1} />
      ))}
    </div>
  );
}

const altDataIcons = [Globe, Smartphone, Briefcase];
type AltDataSignal = { source?: string; insight?: string };

function RevenueTrajectorySignals({ signals }: { signals: AltDataSignal[] }) {
  if (!signals || signals.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>
          Revenue Trajectory
        </p>
        <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
        <p className="text-[10px]" style={{ color: "var(--qc-ink-2)" }}>Alt Data Signals</p>
      </div>

      <div className="rounded-lg divide-y" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)", borderColor: "var(--qc-hair)" }}>
        {signals.map((s, i) => {
          const Icon = altDataIcons[i % altDataIcons.length];
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < signals.length - 1 ? "1px solid var(--qc-hair-2)" : "none" }}>
              <div className="mt-0.5 shrink-0" style={{ padding: 4, borderRadius: 5, border: "1px solid var(--qc-hair)", background: "var(--qc-chip)" }}>
                <Icon className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-tight mb-0.5" style={{ color: "var(--qc-ink)" }}>
                  {s.source ?? "N/A"}
                </p>
                <p style={{ fontSize: 11, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
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
    { ...safeMetric(metrics?.active_customers), icon: Users },
    { ...safeMetric(metrics?.net_retention), icon: RefreshCw },
    { ...safeMetric(metrics?.top_10_concentration), icon: PieChart },
    { ...safeMetric(metrics?.avg_contract_value), icon: TrendingUp },
    { ...safeMetric(metrics?.churn_rate), icon: UserMinus },
  ];

  const overallRows: Omit<ScorecardRowProps, "last">[] = customerMetrics.map((m) => ({
    icon: m.icon,
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
      <ScorecardGroup icon={TrendingUp} title="Overall Trend" rows={overallRows} />

      <div className="space-y-3">
        {(stickiness.length > 0 || expansion.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>
                Why Retention is Strong
              </p>
              <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
            </div>

            <div className="flex gap-4">
              {stickiness.length > 0 && (
                <div
                  className="flex-1 min-w-0 rounded-lg p-4 space-y-3"
                  style={{ border: "1px solid var(--qc-hair)", borderTopWidth: 3, borderTopColor: "var(--qc-ink)", background: "var(--qc-card)" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-ink)" }}>
                    Product Stickiness
                  </p>
                  <div className="space-y-1">
                    {stickiness.map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <div key={i} className="space-y-0.5">
                          {label ? (
                            <>
                              <p className="text-[12px] font-semibold" style={{ color: "var(--qc-ink)" }}>— {label}</p>
                              <ul className="pl-3">
                                <li style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.6 }}>– {body}</li>
                              </ul>
                            </>
                          ) : (
                            <ul className="pl-3">
                              <li style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.6 }}>– {body}</li>
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {expansion.length > 0 && (
                <div
                  className="flex-1 min-w-0 rounded-lg p-4 space-y-3"
                  style={{ border: "1px solid var(--qc-hair)", borderTopWidth: 3, borderTopColor: "var(--qc-ink-2)", background: "var(--qc-card)" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>
                    Expansion Drivers
                  </p>
                  <div className="space-y-1">
                    {expansion.map((item, i) => {
                      const [label, body] = splitLabelBody(item);
                      return (
                        <div key={i} className="space-y-0.5">
                          {label ? (
                            <>
                              <p className="text-[12px] font-semibold" style={{ color: "var(--qc-ink)" }}>— {label}</p>
                              <ul className="pl-3">
                                <li style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.6 }}>– {body}</li>
                              </ul>
                            </>
                          ) : (
                            <ul className="pl-3">
                              <li style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.6 }}>– {body}</li>
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

        {(tiers.length > 0 || altDataSignals.length > 0) && (
          <div className="rounded-lg p-4" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
            <div className="grid grid-cols-2 gap-6">
              {tiers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>
                      Customer Segmentation
                    </p>
                    <div className="flex-1 h-px" style={{ background: "var(--qc-hair)" }} />
                  </div>
                  <div className="rounded-lg divide-y" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
                    {tiers.map((tier, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < tiers.length - 1 ? "1px solid var(--qc-hair-2)" : "none" }}>
                        <div className="mt-0.5 shrink-0" style={{ padding: 4, borderRadius: 5, border: "1px solid var(--qc-hair)", background: "var(--qc-chip)" }}>
                          <Users className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold leading-tight mb-0.5" style={{ color: "var(--qc-ink)" }}>
                            {tier.name ?? "N/A"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>
                            {tier.description ?? "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
