"use client";

import { useState, Suspense } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useWealthClientAnalytics, useWealthRMAnalytics } from "@/hooks/useWealthAnalytics";
import { useWealthClients } from "@/hooks/useWealthClients";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { useModels } from "@/hooks/useModels";
import {
  Users,
  TrendingUp,
  BarChart2,
  Activity,
  MessageSquare,
  Layers,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import type { RiskProfileType } from "@/types/portfolio";
import type { SegmentAnalytic } from "@/types/wealthos";

const LIME_GRADIENT = "linear-gradient(135deg, var(--qc-accent-primary) 0%, var(--qc-border-active) 100%)";

const RISK_COLOR: Record<RiskProfileType, string> = {
  conservative: "var(--qc-up)",
  balanced: "var(--qc-warn)",
  aggressive: "var(--qc-down)",
  "goal-based": "var(--qc-warn)",
};

// ── Stat pill ──────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 8,
        padding: "6px 12px",
        display: "inline-flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-ibm-plex-mono, monospace)", letterSpacing: "-0.02em" }}>
        {value}
      </span>
    </div>
  );
}

// ── RM selector button ─────────────────────────────────────────────────────

function RMSelectorRow({
  rms,
  selectedRmId,
  onSelect,
}: {
  rms: { id: string; name: string; team?: string; performance_score?: number }[];
  selectedRmId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {rms.map((rm) => {
        const isSelected = rm.id === selectedRmId;
        const score = rm.performance_score ?? 0;
        const scoreColor = score >= 85 ? "var(--qc-up)" : score >= 70 ? "var(--qc-warn)" : "var(--qc-down)";
        return (
          <button
            key={rm.id}
            onClick={() => onSelect(isSelected ? "" : rm.id)}
            style={{
              borderRadius: 8,
              border: isSelected ? "1.5px solid #a8e63d" : "1px solid var(--qc-border-default)",
              background: isSelected ? "rgba(200,245,105,0.08)" : "var(--qc-surface-card)",
              padding: "7px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: isSelected ? LIME_GRADIENT : "var(--qc-surface-panel)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: isSelected ? "rgba(255,255,255,0.95)" : "var(--qc-text-muted)",
                flexShrink: 0,
              }}
            >
              {rm.name.slice(0, 2).toUpperCase()}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-text-heading)" }}>{rm.name}</span>
            {rm.performance_score !== undefined && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: scoreColor,
                  fontFamily: "var(--font-ibm-plex-mono, monospace)",
                  marginLeft: 2,
                }}
              >
                {score.toFixed(0)}
              </span>
            )}
            <ChevronDown
              style={{
                width: 12,
                height: 12,
                color: "var(--qc-text-muted)",
                transform: isSelected ? "rotate(180deg)" : "none",
                transition: "transform 0.15s",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

// ── RM Analytics panel ─────────────────────────────────────────────────────

function RMAnalyticsPanel({ rmId, rmName }: { rmId: string; rmName: string }) {
  const { data, loading } = useWealthRMAnalytics(rmId);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl animate-pulse"
            style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const adoptionPct = ((data.suggestion_adoption_rate ?? 0) * 100).toFixed(0);
  const churnPct = ((data.avg_churn_probability ?? 0) * 100).toFixed(0);

  const metrics = [
    { label: "Total Clients", value: String(data.total_clients ?? 0), icon: Users, note: "under management" },
    { label: "Avg Engagement", value: (data.avg_engagement_score ?? 0).toFixed(1), icon: Activity, note: "/ 10.0 scale" },
    {
      label: "Avg Churn Risk",
      value: `${churnPct}%`,
      icon: TrendingUp,
      color: Number(churnPct) > 40 ? "var(--qc-down)" : Number(churnPct) > 20 ? "var(--qc-warn)" : "var(--qc-up)",
      note: "probability",
    },
    { label: "Interactions (30d)", value: String(data.interactions_last_30d ?? 0), icon: MessageSquare, note: "touchpoints" },
    {
      label: "Suggestion Adoption",
      value: `${adoptionPct}%`,
      icon: BarChart2,
      color: Number(adoptionPct) >= 60 ? "var(--qc-up)" : Number(adoptionPct) >= 35 ? "var(--qc-warn)" : "var(--qc-down)",
      note: "of AI suggestions",
    },
    { label: "Avg Portfolio Risk", value: (data.avg_portfolio_risk_score ?? 0).toFixed(1), icon: Layers, note: "risk score" },
  ];

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-card)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--qc-border-default)",
          background: "var(--qc-surface-panel)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: LIME_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            flexShrink: 0,
          }}
        >
          {rmName.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }}>{rmName}</p>
          <p style={{ fontSize: 10, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Performance snapshot
          </p>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-3 gap-px" style={{ background: "var(--qc-border-default)" }}>
        {metrics.map(({ label, value, icon: Icon, color, note }) => (
          <div
            key={label}
            style={{
              background: "var(--qc-surface-card)",
              padding: "14px 16px",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon style={{ width: 11, height: 11, color: "var(--qc-text-muted)" }} />
              <span style={{ fontSize: 10, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
              </span>
            </div>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
                color: color ?? "var(--qc-text-heading)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginBottom: 3,
              }}
            >
              {value}
            </p>
            {note && (
              <p style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>{note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Segment bar chart ──────────────────────────────────────────────────────

function SegmentChart({ data }: { data: SegmentAnalytic[] | undefined }) {
  const safeData = data ?? [];
  const chartData = safeData.map((d) => ({
    segment: d.segment,
    engagement: parseFloat(d.avg_engagement.toFixed(1)),
    churn: parseFloat((d.avg_churn * 100).toFixed(1)),
    count: d.count,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)", marginBottom: 2 }}>
            Segment Performance
          </p>
          <p style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>
            Avg engagement vs churn probability — by client segment
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--qc-text-heading)", display: "inline-block" }} />
            Engagement
          </span>
          <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#a1a1aa", display: "inline-block" }} />
            Churn %
          </span>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={4}>
            <XAxis
              dataKey="segment"
              tick={{ fontSize: 10, fill: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: "1px solid var(--qc-border-default)",
                background: "var(--qc-surface-card)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />
            <Bar dataKey="engagement" fill="var(--qc-text-heading)" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="churn" fill="#a1a1aa" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Segment summary row */}
      <div className="flex gap-3 mt-4">
        {safeData.map((seg) => (
          <div
            key={seg.segment}
            style={{
              flex: 1,
              borderRadius: 8,
              border: "1px solid var(--qc-border-default)",
              background: "var(--qc-surface-panel)",
              padding: "8px 10px",
            }}
          >
            <p style={{ fontSize: 10, color: "var(--qc-text-muted)", marginBottom: 3 }}>{seg.segment}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)", letterSpacing: "-0.02em" }}>
              {seg.count}
            </p>
            <p style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>clients</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Risk profile matrix ────────────────────────────────────────────────────

const RISK_BUCKETS = ["conservative", "moderate", "aggressive"] as const;
type RiskBucket = typeof RISK_BUCKETS[number];

const RISK_LABEL: Record<RiskBucket, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

const RISK_DOT_COLOR: Record<RiskBucket, string> = {
  conservative: "var(--qc-up)",
  moderate: "var(--qc-warn)",
  aggressive: "var(--qc-down)",
};

interface ClientDot {
  name: string;
  engagement: number;
  churn: number;
  risk: RiskBucket;
  segment: string;
}

function RiskProfileMatrix({ clients }: { clients: ClientDot[] }) {
  const byRisk = RISK_BUCKETS.map((r) => ({
    risk: r,
    items: clients.filter((c) => c.risk === r),
  }));

  const total = clients.length || 1;

  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)", marginBottom: 2 }}>
        Risk Profile Breakdown
      </p>
      <p style={{ fontSize: 11, color: "var(--qc-text-muted)", marginBottom: 16 }}>
        Clients by risk appetite — engagement vs churn probability
      </p>

      {/* Stacked proportion bar */}
      <div className="flex h-[6px] rounded-full overflow-hidden gap-px mb-5">
        {byRisk.map(({ risk, items }) => (
          <div
            key={risk}
            style={{
              width: `${(items.length / total) * 100}%`,
              background: RISK_DOT_COLOR[risk],
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      {/* Per-risk band */}
      <div className="space-y-4">
        {byRisk.map(({ risk, items }) => {
          const pct = ((items.length / total) * 100).toFixed(0);
          const avgEng = items.length ? (items.reduce((s, c) => s + c.engagement, 0) / items.length).toFixed(1) : "—";
          const avgChurn = items.length ? ((items.reduce((s, c) => s + c.churn, 0) / items.length) * 100).toFixed(0) : "—";

          return (
            <div key={risk}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: RISK_DOT_COLOR[risk],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-text-heading)" }}>
                    {RISK_LABEL[risk]}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-ibm-plex-mono, monospace)",
                      color: "var(--qc-text-muted)",
                    }}
                  >
                    {items.length} clients · {pct}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>
                    eng <span style={{ fontWeight: 700, color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{avgEng}</span>
                  </span>
                  <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>
                    churn <span style={{ fontWeight: 700, color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{avgChurn}%</span>
                  </span>
                </div>
              </div>

              {/* Client dots row */}
              {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((c) => (
                    <div
                      key={c.name}
                      title={`${c.name} · ${c.segment} · eng ${c.engagement} · churn ${(c.churn * 100).toFixed(0)}%`}
                      style={{
                        borderRadius: 6,
                        border: "1px solid var(--qc-border-default)",
                        background: "var(--qc-surface-panel)",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: RISK_DOT_COLOR[risk],
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 10, color: "var(--qc-text-heading)", fontWeight: 500 }}>
                        {c.name.split(" ")[0]}
                      </span>
                      <span style={{ fontSize: 9, color: "var(--qc-text-muted)" }}>{c.segment}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Right panel ────────────────────────────────────────────────────────────

function RightPanel({
  totalRMs,
  totalClients,
  totalModels,
  riskBreakdown,
}: {
  totalRMs: number;
  totalClients: number;
  totalModels: number;
  riskBreakdown: { conservative: number; balanced: number; aggressive: number };
}) {
  const totalModelsNorm = totalModels || 1;
  const riskItems = [
    { label: "Conservative", key: "conservative" as RiskProfileType, count: riskBreakdown.conservative },
    { label: "Balanced", key: "balanced" as RiskProfileType, count: riskBreakdown.balanced },
    { label: "Aggressive", key: "aggressive" as RiskProfileType, count: riskBreakdown.aggressive },
  ];

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div
        style={{
          borderRadius: 16,
          background: LIME_GRADIENT,
          padding: "20px 20px 18px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "rgba(255,255,255,0.6)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          WealthOS · Analytics
        </p>
        <p
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "rgba(255,255,255,0.95)",
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          Overview
        </p>
        <div className="flex flex-wrap gap-2">
          <StatPill label="RMs" value={String(totalRMs)} />
          <StatPill label="Clients" value={String(totalClients)} />
          <StatPill label="Models" value={String(totalModels)} />
        </div>
      </div>

      {/* Model risk profile breakdown */}
      <div
        style={{
          borderRadius: 14,
          border: "1px solid var(--qc-border-default)",
          background: "var(--qc-surface-card)",
          padding: "16px",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Layers style={{ width: 13, height: 13, color: "var(--qc-text-muted)" }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-text-heading)" }}>
            Model Risk Mix
          </p>
        </div>
        <p style={{ fontSize: 10, color: "var(--qc-text-muted)", marginBottom: 12 }}>
          Portfolio models by risk profile
        </p>
        <div className="space-y-3">
          {riskItems.map(({ label, key, count }) => {
            const pct = ((count / totalModelsNorm) * 100).toFixed(0);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 11, color: "var(--qc-text-muted)", textTransform: "capitalize" }}>
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "var(--font-ibm-plex-mono, monospace)",
                        color: RISK_COLOR[key],
                      }}
                    >
                      {count}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>{pct}%</span>
                  </div>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "var(--qc-surface-panel)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: RISK_COLOR[key],
                      borderRadius: 2,
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div
        style={{
          borderRadius: 14,
          border: "1px solid var(--qc-border-default)",
          background: "var(--qc-surface-card)",
          padding: "16px",
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-text-heading)", marginBottom: 12 }}>
          Quick Navigate
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Clients", href: "/wealthos/clients" },
            { label: "RMs", href: "/wealthos/rms" },
            { label: "Models", href: "/wealthos/models" },
            { label: "Dashboard", href: "/wealthos/dashboard" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                borderRadius: 8,
                border: "1px solid var(--qc-border-default)",
                background: "var(--qc-surface-panel)",
                padding: "8px 10px",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--qc-text-heading)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
            >
              {label}
              <ArrowUpRight style={{ width: 11, height: 11, color: "var(--qc-text-muted)" }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main content ───────────────────────────────────────────────────────────

function AnalyticsContent() {
  const [selectedRmId, setSelectedRmId] = useState("");

  const { data: clientAnalytics, loading: clientLoading } = useWealthClientAnalytics();
  const { data: clientsPage, loading: clientsLoading } = useWealthClients({ size: 50 });
  const { data: rms } = useWealthRMList();
  const { models } = useModels();

  const selectedRM = rms.find((r) => r.id === selectedRmId);

  // Risk breakdown from models
  const riskBreakdown = models.reduce(
    (acc, m) => {
      const rp = m.riskProfile;
      const key = rp === "goal-based" ? "balanced" : rp;
      if (key in acc) acc[key] += 1;
      return acc;
    },
    { conservative: 0, balanced: 0, aggressive: 0 }
  );

  // Unique client count across segments
  const totalClients = (clientAnalytics?.by_segment ?? []).reduce((s, seg) => s + seg.count, 0);

  // Client dots for risk profile matrix
  const clientDots: ClientDot[] = (clientsPage?.items ?? []).map((c) => ({
    name: c.name,
    engagement: c.engagement_score,
    churn: c.churn_probability,
    risk: (c.risk_profile as RiskBucket) ?? "moderate",
    segment: c.segment,
  }));

  return (
    <div
      style={{
        background: "var(--qc-surface-base)",
        minHeight: "100vh",
        padding: "28px 28px 40px",
      }}
    >
      {/* Page header */}
      <div className="mb-8">
        <p
          style={{
            fontSize: 9,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "var(--qc-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 6,
          }}
        >
          WealthOS · Analytics
        </p>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--qc-text-heading)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Intelligence Overview
        </h1>
        <p style={{ fontSize: 13, color: "var(--qc-text-muted)", marginTop: 4 }}>
          Client segmentation, interaction patterns, and RM performance
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 20, alignItems: "start" }}>
        {/* Left — main content */}
        <div className="space-y-5">
          {/* Client Segmentation card */}
          <div
            style={{
              borderRadius: 16,
              border: "1px solid var(--qc-border-default)",
              background: "var(--qc-surface-card)",
              padding: "20px 24px",
            }}
          >
            {clientLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-48 rounded animate-pulse" style={{ background: "var(--qc-surface-panel)" }} />
                <div className="h-52 rounded-xl animate-pulse" style={{ background: "var(--qc-surface-panel)" }} />
              </div>
            ) : clientAnalytics ? (
              <SegmentChart data={clientAnalytics.by_segment} />
            ) : null}
          </div>

          {/* Risk profile matrix card */}
          <div
            style={{
              borderRadius: 16,
              border: "1px solid var(--qc-border-default)",
              background: "var(--qc-surface-card)",
              padding: "20px 24px",
            }}
          >
            {clientsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "var(--qc-surface-panel)" }} />
                ))}
              </div>
            ) : (
              <RiskProfileMatrix clients={clientDots} />
            )}
          </div>

          {/* RM Performance section */}
          <div
            style={{
              borderRadius: 16,
              border: "1px solid var(--qc-border-default)",
              background: "var(--qc-surface-card)",
              padding: "20px 24px",
            }}
          >
            <div className="mb-4">
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)", marginBottom: 2 }}>
                RM Performance
              </p>
              <p style={{ fontSize: 11, color: "var(--qc-text-muted)", marginBottom: 12 }}>
                Select an RM to view detailed performance analytics
              </p>
              {rms.length > 0 ? (
                <RMSelectorRow rms={rms} selectedRmId={selectedRmId} onSelect={setSelectedRmId} />
              ) : (
                <p style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>No RMs found</p>
              )}
            </div>

            {selectedRmId && selectedRM ? (
              <div className="mt-4">
                <RMAnalyticsPanel rmId={selectedRmId} rmName={selectedRM.name} />
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 10,
                  border: "1px dashed var(--qc-border-default)",
                  padding: "32px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Activity style={{ width: 24, height: 24, color: "var(--qc-text-muted)", opacity: 0.4 }} />
                <p style={{ fontSize: 12, color: "var(--qc-text-muted)", textAlign: "center" }}>
                  Select an RM above to view their performance metrics
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ position: "sticky", top: 20 }}>
          <RightPanel
            totalRMs={rms.length}
            totalClients={totalClients}
            totalModels={models.length}
            riskBreakdown={riskBreakdown}
          />
        </div>
      </div>
    </div>
  );
}

export default function WealthOSAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
