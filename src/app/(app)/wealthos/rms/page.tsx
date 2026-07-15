"use client";

import { useState, Suspense } from "react";
import { useWealthRMList, useWealthRM } from "@/hooks/useWealthRM";
import { useWealthRMAnalytics } from "@/hooks/useWealthAnalytics";
import { CreateRMForm } from "@/components/wealthos/create-rm-form";
import { SegmentBadge } from "@/components/wealthos/segment-badge";
import {
  Users,
  BarChart2,
  ArrowRight,
  ChevronRight,
  Plus,
  Phone,
  Mail,
  Star,
  AlertTriangle,
} from "lucide-react";
import type { WealthRM, WealthClient, RMAnalytics } from "@/types/wealthos";

// ─── RM Row ────────────────────────────────────────────────────────────────────
function RMRow({
  rm,
  rank,
  isSelected,
  onClick,
}: {
  rm: WealthRM;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const score = rm.performance_score ?? 0;
  const scoreColor =
    score >= 85 ? "var(--qc-up)" : score >= 70 ? "var(--qc-warn)" : "var(--qc-down)";
  const clientCount = rm._count?.clients ?? 0;

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 cursor-pointer transition-all duration-150"
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid var(--qc-hair)",
        background: isSelected ? "rgba(200,245,105,0.07)" : "transparent",
        borderLeft: isSelected ? "2px solid var(--qc-lime-edge)" : "2px solid transparent",
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-ibm-plex-mono, monospace)",
          color: "var(--qc-ink-2)",
          width: 20,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {String(rank).padStart(2, "0")}
      </span>

      {/* Avatar */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: isSelected
            ? "linear-gradient(135deg, var(--qc-ink) 0%, var(--qc-ink) 100%)"
            : "var(--qc-section)",
          border: "1px solid var(--qc-hair)",
          fontSize: 11,
          fontWeight: 700,
          color: isSelected ? "rgba(255,255,255,0.95)" : "var(--qc-ink)",
          letterSpacing: "0.02em",
        }}
      >
        {rm.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}
        >
          {rm.name}
        </div>
        {rm.team && (
          <div
            className="truncate"
            style={{ fontSize: 10, color: "var(--qc-ink-2)", marginTop: 1 }}
          >
            {rm.team}
          </div>
        )}
      </div>

      {/* Clients */}
      <div className="flex flex-col items-end shrink-0" style={{ minWidth: 40 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "var(--qc-ink)",
          }}
        >
          {clientCount}
        </span>
        <span style={{ fontSize: 9, color: "var(--qc-ink-2)", textTransform: "uppercase" }}>
          clients
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end shrink-0" style={{ minWidth: 44 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: scoreColor,
          }}
        >
          {score.toFixed(1)}
        </span>
        <span style={{ fontSize: 9, color: "var(--qc-ink-2)", textTransform: "uppercase" }}>
          score
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight
        className="size-3.5 transition-opacity shrink-0"
        style={{
          color: isSelected ? "var(--qc-lime-edge)" : "var(--qc-ink-2)",
          opacity: isSelected ? 1 : 0,
        }}
      />
    </div>
  );
}

// ─── Client Row (inside RM detail) ─────────────────────────────────────────────
function ClientRow({ client, rank }: { client: WealthClient; rank: number }) {
  const churnColor =
    client.churn_probability > 0.6
      ? "var(--qc-down)"
      : client.churn_probability > 0.3
      ? "var(--qc-warn)"
      : "var(--qc-up)";

  return (
    <div
      className="group flex items-center gap-3 transition-all duration-150 cursor-pointer"
      style={{
        padding: "8px 16px",
        borderBottom: "1px solid var(--qc-hair)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-ibm-plex-mono, monospace)",
          color: "var(--qc-ink-2)",
          width: 18,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {String(rank).padStart(2, "0")}
      </span>

      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "var(--qc-section)",
          border: "1px solid var(--qc-hair)",
          fontSize: 9,
          fontWeight: 700,
          color: "var(--qc-ink)",
        }}
      >
        {client.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="truncate"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink)" }}
          >
            {client.name}
          </span>
          <SegmentBadge segment={client.segment} />
        </div>
        <div style={{ fontSize: 10, color: "var(--qc-ink-2)", marginTop: 1 }}>
          {client.risk_profile}
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0" style={{ minWidth: 44 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: churnColor,
          }}
        >
          {(client.churn_probability * 100).toFixed(0)}%
        </span>
        <span style={{ fontSize: 9, color: "var(--qc-ink-2)", textTransform: "uppercase" }}>
          churn
        </span>
      </div>

      <div className="flex flex-col items-end shrink-0" style={{ minWidth: 32 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "var(--qc-ink)",
          }}
        >
          {client.engagement_score}
        </span>
        <span style={{ fontSize: 9, color: "var(--qc-ink-2)", textTransform: "uppercase" }}>
          eng
        </span>
      </div>

      <ArrowRight
        className="size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        style={{ color: "var(--qc-ink-2)" }}
      />
    </div>
  );
}

// ─── Analytics stat pill ────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      className="flex flex-col gap-0.5"
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "var(--qc-ink-2)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "var(--font-ibm-plex-mono, monospace)",
          color: color ?? "var(--qc-ink)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Right Panel ────────────────────────────────────────────────────────────────
function RightPanel({
  rms,
  selectedRM,
  analytics,
  analyticsLoading,
}: {
  rms: WealthRM[];
  selectedRM: WealthRM | null;
  analytics: RMAnalytics | null;
  analyticsLoading: boolean;
}) {
  const totalClients = rms.reduce((s, rm) => s + (rm._count?.clients ?? 0), 0);
  const avgScore =
    rms.length > 0
      ? rms.reduce((s, rm) => s + (rm.performance_score ?? 0), 0) / rms.length
      : 0;
  const topRM = rms.slice().sort((a, b) => (b.performance_score ?? 0) - (a.performance_score ?? 0))[0];

  return (
    <div className="flex flex-col gap-3" style={{ position: "sticky", top: 16 }}>
      {/* Lime hero */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--qc-ink) 0%, var(--qc-ink) 100%)",
          padding: "20px 18px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.6)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          RM Overview
        </p>
        <div className="flex items-end gap-3 mb-4">
          <div>
            <p
              style={{
                fontSize: 40,
                fontWeight: 800,
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {rms.length}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
              Relationship Managers
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Users className="size-2.5" style={{ color: "rgba(255,255,255,0.8)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              {totalClients}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>total clients</span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Star className="size-2.5" style={{ color: "rgba(255,255,255,0.8)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              {avgScore.toFixed(1)}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>avg score</span>
          </div>
        </div>
      </div>

      {/* Top performer */}
      {topRM && (
        <div
          className="rounded-[14px]"
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            padding: "14px 16px",
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: "var(--qc-ink-2)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Top Performer
          </p>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--qc-ink) 0%, var(--qc-ink) 100%)",
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {topRM.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>
                {topRM.name}
              </p>
              {topRM.team && (
                <p style={{ fontSize: 10, color: "var(--qc-ink-2)" }}>{topRM.team}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <StatPill
              label="Score"
              value={(topRM.performance_score ?? 0).toFixed(1)}
              color="var(--qc-up)"
            />
            <StatPill label="Clients" value={String(topRM._count?.clients ?? 0)} />
          </div>
        </div>
      )}

      {/* Selected RM analytics */}
      {selectedRM && (
        <div
          className="rounded-[14px]"
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            padding: "14px 16px",
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: "var(--qc-ink-2)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            {selectedRM.name} · Analytics
          </p>
          {analyticsLoading || !analytics ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-[10px] animate-pulse"
                  style={{ background: "var(--qc-section)" }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <StatPill
                  label="Avg Churn"
                  value={`${(analytics.avg_churn_probability * 100).toFixed(0)}%`}
                  color={
                    analytics.avg_churn_probability > 0.5
                      ? "var(--qc-down)"
                      : analytics.avg_churn_probability > 0.3
                      ? "var(--qc-warn)"
                      : "var(--qc-up)"
                  }
                />
                <StatPill
                  label="Avg Eng"
                  value={analytics.avg_engagement_score.toFixed(1)}
                  color="var(--qc-ink)"
                />
              </div>
              <div className="flex gap-2">
                <StatPill
                  label="Interactions"
                  value={String(analytics.interactions_last_30d)}
                />
                <StatPill
                  label="Adoption"
                  value={`${(analytics.suggestion_adoption_rate * 100).toFixed(0)}%`}
                  color={
                    analytics.suggestion_adoption_rate > 0.6
                      ? "var(--qc-up)"
                      : "var(--qc-warn)"
                  }
                />
              </div>
              <StatPill
                label="Avg Portfolio Risk Score"
                value={analytics.avg_portfolio_risk_score.toFixed(1)}
              />
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div
        className="rounded-[14px]"
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Phone, label: "Schedule Call" },
            { icon: Mail, label: "Send Briefing" },
            { icon: BarChart2, label: "Performance Report" },
            { icon: AlertTriangle, label: "Risk Review" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-[10px] transition-all"
              style={{
                padding: "10px 8px",
                background: "var(--qc-section)",
                border: "1px solid var(--qc-hair)",
                cursor: "pointer",
              }}
            >
              <Icon className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
              <span style={{ fontSize: 9, color: "var(--qc-ink-2)", textAlign: "center", lineHeight: 1.3 }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main content ───────────────────────────────────────────────────────────────
function RMPageContent() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRmId, setSelectedRmId] = useState("");

  const { data: rms, loading, error } = useWealthRMList();
  const { data: selectedRM, loading: rmLoading } = useWealthRM(selectedRmId);
  const { data: analytics, loading: analyticsLoading } = useWealthRMAnalytics(selectedRmId);

  const handleRMCreated = (rm: WealthRM) => {
    setShowForm(false);
    setSelectedRmId(rm.id);
  };

  const sortedRMs = rms.slice().sort((a, b) => (b.performance_score ?? 0) - (a.performance_score ?? 0));

  return (
    <div
      style={{
        background: "var(--qc-bg)",
        minHeight: "100vh",
        padding: "20px 24px",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p
            style={{
              fontSize: 9,
              fontFamily: "var(--font-ibm-plex-mono, monospace)",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "var(--qc-ink-2)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            WealthOS · Team Registry
          </p>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--qc-ink)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Relationship Managers{" "}
            {rms.length > 0 && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "var(--qc-ink-2)",
                  fontFamily: "var(--font-ibm-plex-mono, monospace)",
                  letterSpacing: 0,
                }}
              >
                {rms.length}
              </span>
            )}
          </h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 transition-all"
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: showForm ? "var(--qc-section)" : "var(--qc-ink)",
            color: showForm ? "var(--qc-ink)" : "var(--qc-on-dark)",
            border: showForm ? "1px solid var(--qc-hair)" : "none",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus className="size-3.5" />
          {showForm ? "Cancel" : "New RM"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-4">
          <CreateRMForm onSuccess={handleRMCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 290px", alignItems: "start" }}>
        {/* Left: RM list */}
        <div className="flex flex-col gap-3">
          {/* RM list card */}
          <div
            className="rounded-[14px] overflow-hidden"
            style={{
              background: "var(--qc-card)",
              border: "1px solid var(--qc-hair)",
            }}
          >
            {/* Table header */}
            <div
              className="flex items-center gap-4"
              style={{
                padding: "8px 16px",
                borderBottom: "1px solid var(--qc-hair)",
                background: "var(--qc-section)",
              }}
            >
              <span style={{ width: 20, flexShrink: 0 }} />
              <span style={{ width: 32, flexShrink: 0 }} />
              <span
                className="flex-1"
                style={{
                  fontSize: 9,
                  color: "var(--qc-ink-2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Name
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--qc-ink-2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                Clients
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--qc-ink-2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  minWidth: 44,
                  textAlign: "right",
                }}
              >
                Score
              </span>
              <span style={{ width: 14, flexShrink: 0 }} />
            </div>

            {loading && (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl animate-pulse"
                    style={{ background: "var(--qc-section)" }}
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="p-4" style={{ fontSize: 13, color: "var(--qc-down)" }}>
                {error}
              </p>
            )}

            {!loading && rms.length === 0 && (
              <p
                className="py-10 text-center"
                style={{ fontSize: 13, color: "var(--qc-ink-2)" }}
              >
                No RMs found. Create one to get started.
              </p>
            )}

            {sortedRMs.map((rm, i) => (
              <RMRow
                key={rm.id}
                rm={rm}
                rank={i + 1}
                isSelected={rm.id === selectedRmId}
                onClick={() => setSelectedRmId(rm.id === selectedRmId ? "" : rm.id)}
              />
            ))}
          </div>

          {/* Selected RM client list */}
          {selectedRmId && (
            <div
              className="rounded-[14px] overflow-hidden"
              style={{
                background: "var(--qc-card)",
                border: "1px solid var(--qc-hair)",
              }}
            >
              {/* Section header */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--qc-hair)",
                  background: "var(--qc-section)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      style={{
                        fontSize: 9,
                        color: "var(--qc-ink-2)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 2,
                      }}
                    >
                      Assigned Clients
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>
                      {selectedRM?.name ?? "Loading…"}
                    </p>
                  </div>
                  {selectedRM?.clients && (
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-ibm-plex-mono, monospace)",
                        color: "var(--qc-ink-2)",
                      }}
                    >
                      {selectedRM.clients.length} clients
                    </span>
                  )}
                </div>
              </div>

              {/* Client table header */}
              {!rmLoading && selectedRM?.clients && selectedRM.clients.length > 0 && (
                <div
                  className="flex items-center gap-3"
                  style={{
                    padding: "6px 16px",
                    borderBottom: "1px solid var(--qc-hair)",
                    background: "rgba(0,0,0,0.015)",
                  }}
                >
                  <span style={{ width: 18, flexShrink: 0 }} />
                  <span style={{ width: 26, flexShrink: 0 }} />
                  <span
                    className="flex-1"
                    style={{
                      fontSize: 9,
                      color: "var(--qc-ink-2)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Client
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--qc-ink-2)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      minWidth: 44,
                      textAlign: "right",
                    }}
                  >
                    Churn
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--qc-ink-2)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      minWidth: 32,
                      textAlign: "right",
                    }}
                  >
                    Eng
                  </span>
                  <span style={{ width: 12, flexShrink: 0 }} />
                </div>
              )}

              {rmLoading && (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 rounded-xl animate-pulse"
                      style={{ background: "var(--qc-section)" }}
                    />
                  ))}
                </div>
              )}

              {!rmLoading && (!selectedRM?.clients || selectedRM.clients.length === 0) && (
                <p
                  className="py-8 text-center"
                  style={{ fontSize: 13, color: "var(--qc-ink-2)" }}
                >
                  No clients assigned to this RM
                </p>
              )}

              {!rmLoading &&
                selectedRM?.clients?.map((client, i) => (
                  <ClientRow key={client.id} client={client} rank={i + 1} />
                ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <RightPanel
          rms={rms}
          selectedRM={selectedRM}
          analytics={analytics}
          analyticsLoading={analyticsLoading}
        />
      </div>
    </div>
  );
}

export default function WealthOSRMPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm" style={{ color: "var(--qc-ink-2)" }}>
          Loading…
        </div>
      }
    >
      <RMPageContent />
    </Suspense>
  );
}
