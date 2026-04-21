"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWealthDashboard } from "@/hooks/useWealthDashboard";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { useJobPoller } from "@/hooks/useJobPoller";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { ClientCard } from "@/components/wealthos/client-card";
import { MetricTile } from "@/components/molecules/metric-tile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronDown, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { WealthJobsResponse, SuggestionPriority } from "@/types/wealthos";

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
    if (!selectedRmId && rms.length > 0) {
      setSelectedRmId(String(rms[0].id));
    }
  }, [rms, selectedRmId]);

  const handleGenerate = () => {
    if (!selectedRmId) return;
    setGenError(null);
    apiPost<WealthJobsResponse>(
      `${BACKEND_URL}/api/wealthos/suggestions/generate`,
      {
        onSuccess: (response) => {
          const jobIds = response.jobs.map(j => j.id);
          startPolling(jobIds);
        },
        onError: (err) => setGenError(err),
      },
      { rm_id: selectedRmId }
    );
  };

  const priorityList = dashboard?.priority_list ?? [];
  const counts: Record<SuggestionPriority, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  priorityList.forEach(item => { counts[item.priority]++; });

  const selectedRm = rms.find(r => String(r.id) === selectedRmId);

  return (
    <div className="min-h-screen px-6 pb-12" style={{ background: "var(--qc-surface-base)" }}>
      <div className="space-y-4">

        {/* Page header */}
        <div className="pt-6 pb-2 flex items-start justify-between">
          <div>
            <h3 style={{ color: "var(--qc-text-heading)", fontWeight: 500, fontSize: 28 }}>
              {selectedRm ? `${selectedRm.name}'s Dashboard` : "RM Dashboard"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--qc-text-muted)", marginTop: 2 }}>
              {dashboard
                ? `Priority briefing for ${dashboard.date} · ${priorityList.length} client${priorityList.length !== 1 ? "s" : ""} require attention`
                : "Select an RM to view their priority clients"}
            </p>
          </div>

          {/* RM Selector */}
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize: 11, color: "var(--qc-text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              Viewing as
            </span>
            <div className="relative">
              <select
                value={selectedRmId}
                onChange={e => setSelectedRmId(e.target.value)}
                className="appearance-none cursor-pointer"
                style={{
                  borderRadius: 6,
                  border: "1px solid var(--qc-border-default)",
                  background: "var(--qc-surface-card)",
                  color: "var(--qc-text-heading)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "5px 28px 5px 10px",
                  outline: "none",
                }}
              >
                <option value="">— Select RM —</option>
                {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none"
                style={{ color: "var(--qc-text-muted)" }}
              />
            </div>
          </div>
        </div>

        {/* Metric tiles */}
        {dashboard && (
          <div className="grid grid-cols-3 gap-3">
            <MetricTile
              label="High Priority"
              value={String(counts.HIGH)}
              sublabel={counts.HIGH > 0 ? "Needs immediate attention" : "No urgent clients"}
              change={counts.HIGH > 0 ? `▲ ${counts.HIGH} critical` : undefined}
            />
            <MetricTile
              label="Medium Priority"
              value={String(counts.MEDIUM)}
              sublabel={counts.MEDIUM > 0 ? "Review recommended" : "All clear"}
              change={counts.MEDIUM > 0 ? `→ ${counts.MEDIUM} to review` : undefined}
            />
            <MetricTile
              label="Low Priority"
              value={String(counts.LOW)}
              sublabel="Routine follow-up"
            />
          </div>
        )}

        {/* Priority list panel */}
        <div style={{ borderRadius: 10, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)", padding: 8 }}>
          {/* Panel header */}
          <div className="flex items-center justify-between" style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", letterSpacing: "0.01em", textTransform: "uppercase" }}>
                Today&apos;s Priority Clients
              </div>
              {dashboard && (
                <p style={{ fontSize: 12, color: "var(--qc-text-muted)", marginTop: 2 }}>
                  {priorityList.length} client{priorityList.length !== 1 ? "s" : ""} ranked by urgency · {dashboard.date}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {genError && <span style={{ fontSize: 12, color: "var(--qc-down)" }}>{genError}</span>}
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isPolling || !selectedRmId}
                className="flex items-center hover:opacity-90 transition-opacity"
                style={{ background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)", borderRadius: 6, fontSize: 12, fontWeight: 500, gap: 6 }}
              >
                <Sparkles className="size-3.5" />
                {isPolling ? "Generating…" : "Generate Suggestions"}
              </Button>
            </div>
          </div>

          {/* Panel content box */}
          <div style={{ borderRadius: 10, border: "1px solid var(--qc-border-inner)", background: "var(--qc-surface-card)" }}>

            {/* Generation progress */}
            {isPolling && (
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: 12, color: "var(--qc-text-heading)", fontWeight: 500 }}>AI generating suggestions…</span>
                  <span style={{ fontSize: 12, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {/* Empty / loading states */}
            {!selectedRmId && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>Select an RM above to view their priority clients</p>
              </div>
            )}

            {selectedRmId && loading && (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="rounded-xl h-24 animate-pulse"
                    style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
                  />
                ))}
              </div>
            )}

            {selectedRmId && error && !loading && (
              <div className="flex items-center gap-2 justify-center py-12">
                <AlertCircle className="size-4" style={{ color: "var(--qc-down)" }} />
                <p style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>
              </div>
            )}

            {selectedRmId && !loading && !error && priorityList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <CheckCircle2 className="size-5" style={{ color: "var(--qc-up)" }} />
                <p style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>No priority clients today.</p>
                <p style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>Click &ldquo;Generate Suggestions&rdquo; to refresh.</p>
              </div>
            )}

            {/* Client list */}
            {priorityList.length > 0 && (
              <div className="p-4 space-y-3">
                {(["HIGH", "MEDIUM", "LOW"] as SuggestionPriority[]).map(priority => {
                  const group = priorityList.filter(item => item.priority === priority);
                  if (group.length === 0) return null;

                  const groupMeta = priority === "HIGH"
                    ? { label: "High Priority", icon: AlertCircle, color: "var(--qc-down)" }
                    : priority === "MEDIUM"
                    ? { label: "Medium Priority", icon: AlertTriangle, color: "var(--qc-warn)" }
                    : { label: "Low Priority", icon: CheckCircle2, color: "var(--qc-up)" };

                  const Icon = groupMeta.icon;

                  return (
                    <div key={priority}>
                      <div className="flex items-center gap-1.5 px-1 mb-2">
                        <Icon className="size-3.5" style={{ color: groupMeta.color }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: groupMeta.color, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                          {groupMeta.label}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>· {group.length}</span>
                      </div>
                      <div className="space-y-2">
                        {group.map(item => (
                          <ClientCard key={item.client.id} mode="dashboard" item={item} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
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
