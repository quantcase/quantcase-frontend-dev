"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWealthDashboard } from "@/hooks/useWealthDashboard";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { useJobPoller } from "@/hooks/useJobPoller";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { SegmentBadge } from "@/components/wealthos/segment-badge";
import { ScoreBar } from "@/components/wealthos/score-bar";
import {
  Sparkles,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Calendar,
  Target,
  Activity,
  ChevronRight,
} from "lucide-react";
import type { WealthJobsResponse, SuggestionPriority, PriorityListItem } from "@/types/wealthos";

// ─── Stub data (wire up later) ────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Phone, label: "Schedule Call", desc: "Log a client call" },
  { icon: Mail, label: "Send Update", desc: "Email market update" },
  { icon: MessageSquare, label: "WhatsApp Blast", desc: "Segment broadcast" },
  { icon: Calendar, label: "Set Review", desc: "Book portfolio review" },
];

const PORTFOLIO_ALERTS = [
  { label: "HDFC Bank", detail: "Drawdown > 8% — review allocation", severity: "high" as const },
  { label: "Nippon Small Cap", detail: "Risk mismatch: aggressive client in conservative fund", severity: "medium" as const },
  { label: "SBI Blue Chip", detail: "3 clients overdue for rebalance (90+ days)", severity: "low" as const },
];

const RM_METRICS = [
  { label: "Total Clients", value: "24", icon: Users, delta: null, deltaPositive: true },
  { label: "Avg Engagement", value: "71", icon: Activity, delta: "+4 pts", deltaPositive: true },
  { label: "Actions Taken", value: "12", icon: Zap, delta: "this week", deltaPositive: true },
  { label: "Avg Churn Risk", value: "34%", icon: TrendingDown, delta: "−2%", deltaPositive: true },
];

// ─── Compact inline metrics strip ────────────────────────────────────────────

function MetricsStrip() {
  return (
    <div
      className="grid grid-cols-4"
      style={{
        borderRadius: 10,
        border: "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-card)",
        overflow: "hidden",
      }}
    >
      {RM_METRICS.map(({ label, value, icon: Icon, delta, deltaPositive }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3" style={{ borderRight: "1px solid var(--qc-border-default)" }}>
          <div
            className="flex items-center justify-center size-7 rounded-[7px] shrink-0"
            style={{ background: "var(--qc-accent-primary)" }}
          >
            <Icon className="size-3.5" style={{ color: "var(--qc-accent-primary-fg)" }} />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--qc-text-muted)", marginBottom: 1 }}>
              {label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--qc-text-heading)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {value}
              </span>
              {delta && (
                <span style={{ fontSize: 10, fontWeight: 600, color: deltaPositive ? "var(--qc-up)" : "var(--qc-down)" }}>
                  {delta}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Client row ───────────────────────────────────────────────────────────────

function ClientRow({ item, rank }: { item: PriorityListItem; rank: number }) {
  const router = useRouter();
  const churnPct = Math.round(item.client.churn_probability * 100);
  const score = Math.round(item.score * 100);

  const churnColor =
    item.client.churn_probability > 0.6 ? "var(--qc-down)"
    : item.client.churn_probability > 0.3 ? "var(--qc-warn)"
    : "var(--qc-up)";

  const priorityDot =
    item.priority === "HIGH" ? "var(--qc-down)"
    : item.priority === "MEDIUM" ? "var(--qc-warn)"
    : "var(--qc-up)";

  return (
    <div
      onClick={() => router.push(`/wealthos/clients/${item.client.id}`)}
      className="group flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-[9px] hover:bg-[rgba(0,0,0,0.03)] transition-colors"
    >
      {/* Rank + dot */}
      <div className="flex flex-col items-center gap-1 w-5 shrink-0">
        <span style={{ fontSize: 10, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)", fontWeight: 600 }}>
          {String(rank).padStart(2, "0")}
        </span>
        <div className="size-1.5 rounded-full" style={{ background: priorityDot }} />
      </div>

      {/* Monogram avatar */}
      <div
        className="size-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "var(--qc-surface-panel)",
          border: "1px solid var(--qc-border-default)",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--qc-text-heading)",
          letterSpacing: "-0.02em",
        }}
      >
        {item.client.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
      </div>

      {/* Name + suggested action */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }} className="truncate">
            {item.client.name}
          </span>
          <SegmentBadge segment={item.client.segment} />
        </div>
        <p style={{ fontSize: 11, color: "var(--qc-text-muted)" }} className="truncate">
          {item.suggested_action}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 shrink-0">
        <div className="text-right">
          <p style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>Churn</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: churnColor, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{churnPct}%</p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>Score</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{score}</p>
        </div>
        <ChevronRight className="size-4 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--qc-text-muted)" }} />
      </div>
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function RightPanel({
  counts, date, total, topItem,
}: {
  counts: Record<SuggestionPriority, number>;
  date: string;
  total: number;
  topItem?: PriorityListItem;
}) {
  const urgencyScore = Math.round(
    ((counts.HIGH * 3 + counts.MEDIUM * 1.5 + counts.LOW * 0.5) / Math.max(total, 1)) * 100
  ) / 10;

  return (
    <div className="space-y-3">
      {/* Lime hero card */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--qc-accent-primary) 0%, var(--qc-border-active) 100%)",
          padding: "22px 22px 18px",
          minHeight: 210,
        }}
      >
        <div className="absolute -top-8 -right-8 size-32 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="absolute -bottom-6 -left-6 size-24 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
                Today&apos;s Briefing
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{date}</p>
            </div>
            <div className="flex items-center justify-center size-7 rounded-[8px]" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Target className="size-3.5" style={{ color: "rgba(255,255,255,0.8)" }} />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-end gap-1.5 mb-0.5">
              <span style={{ fontSize: 48, fontWeight: 500, lineHeight: 1, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.03em" }}>{total}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>clients</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>require your attention today</p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {counts.HIGH > 0 && (
              <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div className="size-1.5 rounded-full" style={{ background: "var(--qc-down)" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{counts.HIGH} high</span>
              </div>
            )}
            {counts.MEDIUM > 0 && (
              <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div className="size-1.5 rounded-full" style={{ background: "var(--qc-warn)" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{counts.MEDIUM} med</span>
              </div>
            )}
            {counts.LOW > 0 && (
              <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div className="size-1.5 rounded-full" style={{ background: "var(--qc-up)" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{counts.LOW} low</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio urgency */}
      <div style={{ borderRadius: 12, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", padding: "15px 16px" }}>
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)", marginBottom: 3 }}>
              Portfolio Urgency
            </p>
            <div className="flex items-end gap-1">
              <span style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, color: "var(--qc-text-heading)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                {urgencyScore.toFixed(1)}
              </span>
              <span style={{ fontSize: 11, color: "var(--qc-text-muted)", marginBottom: 3 }}>/10</span>
            </div>
          </div>
          <BarChart3 className="size-4 mt-1" style={{ color: "var(--qc-text-muted)", opacity: 0.4 }} />
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--qc-surface-panel)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(urgencyScore * 10, 100)}%`,
              background: urgencyScore > 6 ? "var(--qc-down)" : urgencyScore > 3 ? "var(--qc-warn)" : "var(--qc-accent-primary)",
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "var(--qc-text-muted)", marginTop: 6 }}>
          {urgencyScore > 6 ? "High urgency — prioritize outreach" : urgencyScore > 3 ? "Moderate — review medium clients" : "Portfolio is stable today"}
        </p>
      </div>

      {/* Top priority client */}
      {topItem && (
        <div style={{ borderRadius: 12, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", padding: "15px 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)", marginBottom: 10 }}>
            Top Priority Client
          </p>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="size-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, var(--qc-accent-primary) 0%, var(--qc-border-active) 100%)", fontSize: 12, fontWeight: 700, color: "var(--qc-accent-primary-fg)" }}
            >
              {topItem.client.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }}>{topItem.client.name}</p>
              <p style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>
                Churn{" "}
                <span style={{ fontWeight: 700, color: "var(--qc-down)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                  {Math.round(topItem.client.churn_probability * 100)}%
                </span>
              </p>
            </div>
          </div>
          <ScoreBar score={topItem.score} components={topItem.score_components} />
        </div>
      )}

      {/* Quick actions */}
      <div style={{ borderRadius: 12, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", padding: "15px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)", marginBottom: 10 }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              className="flex flex-col gap-1.5 rounded-[9px] p-3 text-left hover:bg-[rgba(0,0,0,0.03)] transition-colors cursor-pointer"
              style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
            >
              <div className="flex items-center justify-center size-6 rounded-[6px]" style={{ background: "var(--qc-accent-primary)" }}>
                <Icon className="size-3.5" style={{ color: "var(--qc-accent-primary-fg)" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-text-heading)" }}>{label}</span>
              <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio alerts ─────────────────────────────────────────────────────────

function PortfolioAlerts() {
  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", overflow: "hidden" }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
        <div className="flex items-center gap-2">
          <AlertCircle className="size-3" style={{ color: "var(--qc-warn)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--qc-text-heading)" }}>
            Portfolio Alerts
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>3 active</span>
      </div>
      {PORTFOLIO_ALERTS.map((alert, i) => {
        const barColor = alert.severity === "high" ? "var(--qc-down)" : alert.severity === "medium" ? "var(--qc-warn)" : "var(--qc-up)";
        return (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-colors"
            style={{ borderBottom: i < PORTFOLIO_ALERTS.length - 1 ? "1px solid var(--qc-border-default)" : undefined }}
          >
            <div className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: barColor }} />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-text-heading)" }}>{alert.label}</p>
              <p style={{ fontSize: 11, color: "var(--qc-text-muted)", marginTop: 1 }}>{alert.detail}</p>
            </div>
            <ArrowRight className="size-3.5 shrink-0 mt-0.5" style={{ color: "var(--qc-text-muted)", opacity: 0.35 }} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function DashboardContent() {
  const searchParams = useSearchParams();
  const [selectedRmId, setSelectedRmId] = useState(searchParams.get("rm_id") || "");
  const [genError, setGenError] = useState<string | null>(null);

  const { data: rms } = useWealthRMList();
  const { data: dashboard, loading, error } = useWealthDashboard(selectedRmId);
  const { isPolling, progress, startPolling } = useJobPoller({
    onComplete: () => {},
    onError: (err) => setGenError(err),
  });

  useEffect(() => {
    if (!selectedRmId && rms.length > 0) setSelectedRmId(String(rms[0].id));
  }, [rms, selectedRmId]);

  const handleGenerate = () => {
    if (!selectedRmId) return;
    setGenError(null);
    apiPost<WealthJobsResponse>(
      `${BACKEND_URL}/api/wealthos/suggestions/generate`,
      {
        onSuccess: (res) => startPolling(res.jobs.map(j => j.id)),
        onError: (err) => setGenError(err),
      },
      { rm_id: selectedRmId }
    );
  };

  const priorityList = dashboard?.priority_list ?? [];
  const counts: Record<SuggestionPriority, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  priorityList.forEach(item => { counts[item.priority]++; });
  const selectedRm = rms.find(r => String(r.id) === selectedRmId);
  const topItem = priorityList[0];

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--qc-surface-base)" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--qc-border-default)", background: "var(--qc-surface-base)", padding: "18px 24px 16px" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--qc-text-muted)", marginBottom: 3, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              Relationship Manager · Priority Dashboard
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: "var(--qc-text-heading)", lineHeight: 1.15 }}>
              {selectedRm ? `${selectedRm.name}'s Dashboard` : "RM Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {genError && <span style={{ fontSize: 12, color: "var(--qc-down)" }}>{genError}</span>}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 10, color: "var(--qc-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                Viewing as
              </span>
              <div className="relative">
                <select
                  value={selectedRmId}
                  onChange={e => setSelectedRmId(e.target.value)}
                  className="appearance-none cursor-pointer"
                  style={{
                    borderRadius: 7,
                    border: "1px solid var(--qc-border-default)",
                    background: "var(--qc-surface-card)",
                    color: "var(--qc-text-heading)",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "6px 30px 6px 11px",
                    outline: "none",
                  }}
                >
                  <option value="">— Select RM —</option>
                  {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none" style={{ color: "var(--qc-text-muted)" }} />
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isPolling || !selectedRmId}
              className="flex items-center gap-1.5 hover:opacity-85 disabled:opacity-40 transition-opacity"
              style={{
                borderRadius: 7,
                border: "none",
                background: "var(--qc-accent-primary)",
                color: "var(--qc-accent-primary-fg)",
                fontSize: 12,
                fontWeight: 600,
                padding: "7px 14px",
                cursor: isPolling || !selectedRmId ? "not-allowed" : "pointer",
              }}
            >
              <Sparkles className="size-3.5" />
              {isPolling ? "Generating…" : "Generate Suggestions"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pt-5">
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 310px" }}>

          {/* ── LEFT column ── */}
          <div className="space-y-3 min-w-0">

            {/* Compact metrics strip */}
            <MetricsStrip />

            {/* Priority clients panel */}
            <div style={{ borderRadius: 12, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", overflow: "hidden" }}>
              {/* Panel header */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
              >
                <div className="flex items-center gap-2">
                  <Users className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--qc-text-heading)" }}>
                    Today&apos;s Priority Clients
                  </span>
                  {dashboard && (
                    <span
                      className="rounded-full px-2 py-0.5"
                      style={{ fontSize: 10, fontWeight: 700, background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }}
                    >
                      {priorityList.length}
                    </span>
                  )}
                </div>
                {dashboard && (
                  <span style={{ fontSize: 11, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                    {dashboard.date}
                  </span>
                )}
              </div>

              {/* AI progress */}
              {isPolling && (
                <div className="px-4 pt-3 pb-2" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontSize: 12, color: "var(--qc-text-heading)", fontWeight: 500 }}>AI generating suggestions…</span>
                    <span style={{ fontSize: 11, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              )}

              {/* Empty / loading states */}
              {!selectedRmId && (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <TrendingUp className="size-7 mb-1" style={{ color: "var(--qc-text-muted)", opacity: 0.3 }} />
                  <p style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>Select an RM above to view priority clients</p>
                </div>
              )}
              {selectedRmId && loading && (
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 rounded-[9px] animate-pulse" style={{ background: "var(--qc-surface-panel)" }} />
                  ))}
                </div>
              )}
              {selectedRmId && error && !loading && (
                <div className="flex items-center gap-2 justify-center py-10">
                  <AlertCircle className="size-4" style={{ color: "var(--qc-down)" }} />
                  <p style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>
                </div>
              )}
              {selectedRmId && !loading && !error && priorityList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <CheckCircle2 className="size-7 mb-1" style={{ color: "var(--qc-accent-primary)", opacity: 0.7 }} />
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-text-heading)" }}>All clear today.</p>
                  <p style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>Generate suggestions to refresh the list.</p>
                </div>
              )}

              {/* Client rows grouped by priority */}
              {priorityList.length > 0 && (
                <div className="py-1.5">
                  {(["HIGH", "MEDIUM", "LOW"] as SuggestionPriority[]).map(priority => {
                    const group = priorityList.filter(i => i.priority === priority);
                    if (group.length === 0) return null;

                    const meta =
                      priority === "HIGH" ? { label: "High Priority", color: "var(--qc-down)" }
                      : priority === "MEDIUM" ? { label: "Medium Priority", color: "var(--qc-warn)" }
                      : { label: "Low Priority", color: "var(--qc-up)" };

                    const offset = priority === "HIGH" ? 0 : priority === "MEDIUM" ? counts.HIGH : counts.HIGH + counts.MEDIUM;

                    return (
                      <div key={priority}>
                        <div
                          className="flex items-center gap-2 px-4 py-1.5"
                          style={{ borderTop: priority !== "HIGH" ? "1px solid var(--qc-border-default)" : undefined }}
                        >
                          <div className="size-1.5 rounded-full" style={{ background: meta.color }} />
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: meta.color, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                            {meta.label}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                            · {group.length}
                          </span>
                        </div>
                        <div className="px-2 space-y-0.5">
                          {group.map((item, idx) => (
                            <ClientRow key={item.client.id} item={item} rank={offset + idx + 1} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Portfolio alerts */}
            <PortfolioAlerts />
          </div>

          {/* ── RIGHT column ── */}
          <div className="space-y-3">
            {dashboard ? (
              <RightPanel counts={counts} date={dashboard.date} total={priorityList.length} topItem={topItem} />
            ) : (
              <>
                <div style={{ borderRadius: 14, background: "linear-gradient(135deg, var(--qc-accent-primary) 0%, var(--qc-border-active) 100%)", minHeight: 210, opacity: 0.3 }} />
                <div style={{ borderRadius: 12, border: "1px solid var(--qc-border-default)", height: 72, background: "var(--qc-surface-card)", opacity: 0.5 }} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WealthOSDashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
