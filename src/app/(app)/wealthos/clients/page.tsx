"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useWealthClients } from "@/hooks/useWealthClients";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { SegmentBadge } from "@/components/wealthos/segment-badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  TrendingDown,
  Activity,
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  ChevronDown,
} from "lucide-react";
import type { Segment, WealthClient } from "@/types/wealthos";

// ─── Segment filter config ─────────────────────────────────────────────────────

const SEGMENTS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "UHNI", value: "UHNI" },
  { label: "HNI", value: "HNI" },
  { label: "Retail", value: "Retail" },
  { label: "Institutional", value: "Institutional" },
  { label: "Private", value: "Private" },
];

// ─── Stub quick actions ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Phone, label: "Schedule Call", desc: "Log a client call" },
  { icon: Mail, label: "Send Update", desc: "Email market update" },
  { icon: MessageSquare, label: "WhatsApp", desc: "Segment broadcast" },
  { icon: Calendar, label: "Set Review", desc: "Book portfolio review" },
];

// ─── Client row ───────────────────────────────────────────────────────────────

function ClientRow({ client, rank }: { client: WealthClient; rank: number }) {
  const router = useRouter();

  const churnColor =
    client.churn_probability > 0.6
      ? "var(--qc-down)"
      : client.churn_probability > 0.3
      ? "var(--qc-warn)"
      : "var(--qc-up)";

  const engagementColor =
    client.engagement_score > 70
      ? "var(--qc-up)"
      : client.engagement_score > 40
      ? "var(--qc-warn)"
      : "var(--qc-down)";

  const lastContact = client.last_contact_at
    ? new Date(client.last_contact_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "—";

  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      onClick={() => router.push(`/wealthos/clients/${client.id}`)}
      className="group flex items-center gap-3 cursor-pointer px-4 py-3 hover:bg-[rgba(0,0,0,0.025)] transition-colors"
      style={{ borderBottom: "1px solid var(--qc-border-default)" }}
    >
      {/* Rank */}
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-ibm-plex-mono, monospace)",
          fontWeight: 600,
          color: "var(--qc-text-muted)",
          width: 20,
          flexShrink: 0,
        }}
      >
        {String(rank).padStart(2, "0")}
      </span>

      {/* Avatar */}
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
        {initials}
      </div>

      {/* Name + segment */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="truncate"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }}
          >
            {client.name}
          </span>
          <SegmentBadge segment={client.segment} />
        </div>
        <p style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>
          Last contact <span style={{ fontWeight: 500, color: "var(--qc-text-heading)" }}>{lastContact}</span>
          {client.risk_profile && (
            <>
              {" · "}
              <span style={{ textTransform: "capitalize" }}>{client.risk_profile}</span>
            </>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>
            Churn
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: churnColor,
              fontFamily: "var(--font-ibm-plex-mono, monospace)",
            }}
          >
            {(client.churn_probability * 100).toFixed(0)}%
          </p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>
            Engagement
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: engagementColor,
              fontFamily: "var(--font-ibm-plex-mono, monospace)",
            }}
          >
            {client.engagement_score}
          </p>
        </div>
        <ArrowRight
          className="size-3.5 opacity-0 group-hover:opacity-50 transition-opacity"
          style={{ color: "var(--qc-text-muted)" }}
        />
      </div>
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function RightPanel({
  total,
  clients,
}: {
  total: number;
  clients: WealthClient[];
}) {
  const highRisk = clients.filter((c) => c.churn_probability > 0.6);
  const topRisk = clients.slice().sort((a, b) => b.churn_probability - a.churn_probability)[0];
  const avgChurn = clients.length
    ? clients.reduce((s, c) => s + c.churn_probability, 0) / clients.length
    : 0;

  const segmentCounts: Partial<Record<Segment, number>> = {};
  clients.forEach((c) => {
    segmentCounts[c.segment] = (segmentCounts[c.segment] ?? 0) + 1;
  });

  return (
    <div className="space-y-3">
      {/* Lime hero */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--qc-accent-primary) 0%, var(--qc-border-active) 100%)",
          padding: "22px 22px 18px",
          minHeight: 200,
        }}
      >
        <div className="absolute -top-8 -right-8 size-32 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="absolute -bottom-6 -left-6 size-24 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
                Client Portfolio
              </p>
            </div>
            <div className="flex items-center justify-center size-7 rounded-[8px]" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Users className="size-3.5" style={{ color: "rgba(255,255,255,0.8)" }} />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-end gap-1.5 mb-0.5">
              <span style={{ fontSize: 48, fontWeight: 500, lineHeight: 1, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.03em" }}>{total}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>clients</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>across all segments</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.15)" }}>
              <TrendingDown className="size-3" style={{ color: "rgba(255,255,255,0.9)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                {highRisk.length} at-risk
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Activity className="size-3" style={{ color: "rgba(255,255,255,0.9)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                {(avgChurn * 100).toFixed(0)}% avg churn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segment breakdown */}
      {Object.keys(segmentCounts).length > 0 && (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--qc-border-default)",
            background: "var(--qc-surface-card)",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--qc-text-heading)" }}>
              Segment Breakdown
            </span>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {(Object.entries(segmentCounts) as [Segment, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([seg, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={seg}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--qc-text-heading)" }}>{seg}</span>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 11, fontFamily: "var(--font-ibm-plex-mono, monospace)", fontWeight: 600, color: "var(--qc-text-heading)" }}>
                          {count}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--qc-surface-panel)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: "var(--qc-accent-primary)" }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Top at-risk client */}
      {topRisk && (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--qc-border-default)",
            background: "var(--qc-surface-card)",
            padding: "15px 16px",
          }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <AlertCircle className="size-3" style={{ color: "var(--qc-down)" }} />
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)" }}>
              Highest Churn Risk
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="size-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--qc-accent-primary) 0%, var(--qc-border-active) 100%)",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--qc-accent-primary-fg)",
              }}
            >
              {topRisk.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }} className="truncate">
                {topRisk.name}
              </p>
              <p style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>
                Churn{" "}
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--qc-down)",
                    fontFamily: "var(--font-ibm-plex-mono, monospace)",
                  }}
                >
                  {(topRisk.churn_probability * 100).toFixed(0)}%
                </span>
                {" · "}
                <span style={{ textTransform: "capitalize" }}>{topRisk.segment}</span>
              </p>
            </div>
          </div>

          {/* Mini churn bar */}
          <div className="mt-3">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--qc-surface-panel)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(topRisk.churn_probability * 100, 100)}%`,
                  background: "var(--qc-down)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--qc-border-default)",
          background: "var(--qc-surface-card)",
          padding: "15px 16px",
        }}
      >
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

// ─── Main content ─────────────────────────────────────────────────────────────

function ClientsContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [rmFilter, setRmFilter] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: rms } = useWealthRMList();
  const { data: clientsData, loading, error } = useWealthClients({
    page,
    size: 20,
    segment: segment as Segment | undefined,
    rm_id: rmFilter || undefined,
    search: debouncedSearch || undefined,
  });

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const totalPages = clientsData ? Math.ceil(clientsData.total / 20) : 0;
  const clients = clientsData?.items ?? [];
  const offset = (page - 1) * 20;

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--qc-surface-base)" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--qc-border-default)", background: "var(--qc-surface-base)", padding: "18px 24px 16px" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--qc-text-muted)", marginBottom: 3, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              WealthOS · Client Registry
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: "var(--qc-text-heading)", lineHeight: 1.15 }}>
              Clients
              {clientsData && (
                <span style={{ fontSize: 15, fontWeight: 400, color: "var(--qc-text-muted)", marginLeft: 10 }}>
                  {clientsData.total} total
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={() => router.push("/wealthos/clients/new")}
            className="flex items-center gap-1.5 hover:opacity-85 transition-opacity"
            style={{
              borderRadius: 7,
              border: "none",
              background: "var(--qc-accent-primary)",
              color: "var(--qc-accent-primary-fg)",
              fontSize: 12,
              fontWeight: 600,
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            <Plus className="size-3.5" />
            New Client
          </button>
        </div>
      </div>

      {/* Body: two-column */}
      <div className="px-6 pt-5">
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 310px" }}>

          {/* ── LEFT column ── */}
          <div className="space-y-3 min-w-0">

            {/* Filter bar */}
            <div
              className="flex flex-wrap items-center gap-2 px-4 py-3"
              style={{
                borderRadius: 10,
                border: "1px solid var(--qc-border-default)",
                background: "var(--qc-surface-card)",
              }}
            >
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: "var(--qc-text-muted)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  style={{
                    width: "100%",
                    borderRadius: 6,
                    border: "1px solid var(--qc-border-default)",
                    background: "var(--qc-surface-panel)",
                    color: "var(--qc-text-heading)",
                    fontSize: 13,
                    padding: "5px 10px 5px 30px",
                    outline: "none",
                  }}
                />
              </div>

              {/* Segment pills */}
              <div className="flex items-center gap-1">
                {SEGMENTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setSegment(s.value); setPage(1); }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      border: segment === s.value ? "1px solid var(--qc-border-active)" : "1px solid var(--qc-border-default)",
                      background: segment === s.value ? "var(--qc-accent-primary)" : "transparent",
                      color: segment === s.value ? "var(--qc-accent-primary-fg)" : "var(--qc-text-muted)",
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* RM dropdown */}
              <div className="relative">
                <select
                  value={rmFilter}
                  onChange={(e) => { setRmFilter(e.target.value); setPage(1); }}
                  className="appearance-none cursor-pointer"
                  style={{
                    borderRadius: 6,
                    border: "1px solid var(--qc-border-default)",
                    background: "var(--qc-surface-panel)",
                    color: "var(--qc-text-heading)",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "5px 26px 5px 10px",
                    outline: "none",
                  }}
                >
                  <option value="">All RMs</option>
                  {rms.map((rm) => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 pointer-events-none" style={{ color: "var(--qc-text-muted)" }} />
              </div>
            </div>

            {/* Client list */}
            <div
              style={{
                borderRadius: 12,
                border: "1px solid var(--qc-border-default)",
                background: "var(--qc-surface-card)",
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <div
                className="grid items-center px-4 py-2.5"
                style={{
                  gridTemplateColumns: "20px 32px 1fr 80px 80px 20px",
                  gap: "12px",
                  borderBottom: "1px solid var(--qc-border-default)",
                  background: "var(--qc-surface-panel)",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)" }}>#</span>
                <span />
                <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)" }}>Client</span>
                <span className="text-right" style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)" }}>Churn</span>
                <span className="text-right" style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-text-muted)" }}>Engage</span>
                <span />
              </div>

              {/* States */}
              {loading && (
                <div className="py-2 space-y-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 animate-pulse"
                      style={{ borderBottom: "1px solid var(--qc-border-default)" }}
                    >
                      <div className="h-3 rounded w-5" style={{ background: "var(--qc-surface-panel)" }} />
                      <div className="size-8 rounded-full" style={{ background: "var(--qc-surface-panel)" }} />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 rounded w-32" style={{ background: "var(--qc-surface-panel)" }} />
                        <div className="h-2.5 rounded w-24" style={{ background: "var(--qc-surface-panel)" }} />
                      </div>
                      <div className="h-3 rounded w-10" style={{ background: "var(--qc-surface-panel)" }} />
                      <div className="h-3 rounded w-10" style={{ background: "var(--qc-surface-panel)" }} />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 justify-center py-10">
                  <AlertCircle className="size-4" style={{ color: "var(--qc-down)" }} />
                  <p style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>
                </div>
              )}

              {!loading && !error && clients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Users className="size-7 mb-1" style={{ color: "var(--qc-text-muted)", opacity: 0.3 }} />
                  <p style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>No clients found</p>
                </div>
              )}

              {!loading && clients.map((client, idx) => (
                <ClientRow key={client.id} client={client} rank={offset + idx + 1} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 disabled:opacity-40 transition-opacity hover:opacity-70"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--qc-text-heading)",
                      background: "none",
                      border: "none",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft className="size-3.5" /> Prev
                  </button>
                  <span style={{ fontSize: 11, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 disabled:opacity-40 transition-opacity hover:opacity-70"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--qc-text-heading)",
                      background: "none",
                      border: "none",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div className="space-y-3">
            <RightPanel total={clientsData?.total ?? 0} clients={clients} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WealthOSClientsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
