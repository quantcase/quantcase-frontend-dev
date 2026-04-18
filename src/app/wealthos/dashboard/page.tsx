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
    <div className="min-h-screen bg-white px-6 pb-12">
      <div className="space-y-4">

        {/* Page header */}
        <div className="pt-6 pb-2 flex items-start justify-between">
          <div>
            <h3 style={{ color: "#0F172B", fontWeight: 500, fontSize: 28 }}>
              {selectedRm ? `${selectedRm.name}'s Dashboard` : "RM Dashboard"}
            </h3>
            <p style={{ fontSize: 13, color: "#888888", marginTop: 2 }}>
              {dashboard
                ? `Priority briefing for ${dashboard.date} · ${priorityList.length} client${priorityList.length !== 1 ? "s" : ""} require attention`
                : "Select an RM to view their priority clients"}
            </p>
          </div>

          {/* RM Selector */}
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize: 12, color: "#888888", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Viewing as</span>
            <div className="relative">
              <select
                value={selectedRmId}
                onChange={e => setSelectedRmId(e.target.value)}
                className="appearance-none rounded-md border border-[#E2E2E2] bg-white pl-3 pr-8 py-1.5 text-sm font-medium text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B] cursor-pointer"
              >
                <option value="">— Select RM —</option>
                {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-[#888888] pointer-events-none" />
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
        <div style={{ borderRadius: 10, border: "1px solid #E2E2E2", background: "#F5F5F5", padding: 8 }}>
          {/* Panel header */}
          <div className="flex items-center justify-between" style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", letterSpacing: "0.01em", textTransform: "uppercase" }}>
                Today&apos;s Priority Clients
              </div>
              {dashboard && (
                <p style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>
                  {priorityList.length} client{priorityList.length !== 1 ? "s" : ""} ranked by urgency · {dashboard.date}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {genError && <span className="text-xs text-red-600">{genError}</span>}
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isPolling || !selectedRmId}
                style={{ background: "#0F172B", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 500, gap: 6 }}
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <Sparkles className="size-3.5" />
                {isPolling ? "Generating…" : "Generate Suggestions"}
              </Button>
            </div>
          </div>

          {/* Panel content box */}
          <div style={{ borderRadius: 10, border: "1px solid rgba(226,226,226,0.10)", background: "#fff" }}>

            {/* Generation progress */}
            {isPolling && (
              <div className="px-5 pt-4 pb-3 border-b border-[#E2E2E2]">
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: 12, color: "#0F172B", fontWeight: 500 }}>AI generating suggestions…</span>
                  <span style={{ fontSize: 12, color: "#888888" }}>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {/* Empty / loading states */}
            {!selectedRmId && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p style={{ fontSize: 13, color: "#888888" }}>Select an RM above to view their priority clients</p>
              </div>
            )}

            {selectedRmId && loading && (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-xl border border-[#E2E2E2] bg-[#F5F5F5] h-24 animate-pulse" />
                ))}
              </div>
            )}

            {selectedRmId && error && !loading && (
              <div className="flex items-center gap-2 justify-center py-12">
                <AlertCircle className="size-4 text-red-600" />
                <p style={{ fontSize: 13, color: "#F8383C" }}>{error}</p>
              </div>
            )}

            {selectedRmId && !loading && !error && priorityList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <p style={{ fontSize: 13, color: "#888888" }}>No priority clients today.</p>
                <p style={{ fontSize: 12, color: "#888888" }}>Click &ldquo;Generate Suggestions&rdquo; to refresh.</p>
              </div>
            )}

            {/* Client list */}
            {priorityList.length > 0 && (
              <div className="p-4 space-y-3">
                {/* Priority groups */}
                {(["HIGH", "MEDIUM", "LOW"] as SuggestionPriority[]).map(priority => {
                  const group = priorityList.filter(item => item.priority === priority);
                  if (group.length === 0) return null;

                  const groupLabel = priority === "HIGH"
                    ? { label: "High Priority", icon: AlertCircle, color: "#F8383C", border: "#FCA5A5" }
                    : priority === "MEDIUM"
                    ? { label: "Medium Priority", icon: AlertTriangle, color: "#D97706", border: "#FCD34D" }
                    : { label: "Low Priority", icon: CheckCircle2, color: "#059669", border: "#6EE7B7" };

                  const Icon = groupLabel.icon;

                  return (
                    <div key={priority}>
                      <div className="flex items-center gap-1.5 px-1 mb-2">
                        <Icon style={{ color: groupLabel.color }} className="size-3.5" />
                        <span style={{ fontSize: 11, fontWeight: 600, color: groupLabel.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {groupLabel.label}
                        </span>
                        <span style={{ fontSize: 11, color: "#888888" }}>· {group.length}</span>
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
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "#888888" }}>Loading…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
