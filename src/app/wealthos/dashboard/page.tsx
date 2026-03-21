"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWealthDashboard } from "@/hooks/useWealthDashboard";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { useJobPoller } from "@/hooks/useJobPoller";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { ClientCard } from "@/components/wealthos/client-card";
import { MetricTile } from "@/components/molecules/metric-tile";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BarChart2, TrendingDown, Minus } from "lucide-react";
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

  return (
    <div className="p-6 space-y-6">
      {/* RM Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Viewing as RM:</label>
        <select
          value={selectedRmId}
          onChange={e => setSelectedRmId(e.target.value)}
          className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">— Select RM —</option>
          {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
        </select>
      </div>

      {/* Metric Tiles */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-3">
          <MetricTile label="High Priority" value={String(counts.HIGH)} icon={AlertCircle} iconColor="text-red-500" />
          <MetricTile label="Medium Priority" value={String(counts.MEDIUM)} icon={TrendingDown} iconColor="text-amber-500" />
          <MetricTile label="Low Priority" value={String(counts.LOW)} icon={Minus} iconColor="text-green-500" />
        </div>
      )}

      {/* Priority List */}
      <SectionPanel
        title="Today's Priority Clients"
        subtitle={dashboard ? `${priorityList.length} clients require attention · ${dashboard.date}` : undefined}
        contentClassName="px-6 pb-6 space-y-3"
      >
        <div className="flex items-center justify-between px-6 pt-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {priorityList.length} client{priorityList.length !== 1 ? "s" : ""} ranked by urgency
          </span>
          <div className="flex items-center gap-2">
            {genError && (
              <span className="text-xs text-red-500">{genError}</span>
            )}
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isPolling || !selectedRmId} className="flex items-center gap-1.5">
              <BarChart2 className="size-3.5" />
              {isPolling ? "Generating..." : "Generate Suggestions"}
            </Button>
          </div>
        </div>

        {isPolling && (
          <div className="space-y-1 px-6">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">AI is generating suggestions for all clients... {progress}%</p>
          </div>
        )}

        {!selectedRmId && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">Select an RM above to see their priority clients</p>
        )}
        {selectedRmId && loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 h-24 animate-pulse" />
            ))}
          </div>
        )}
        {selectedRmId && error && (
          <p className="text-sm text-red-500 py-6 text-center">{error}</p>
        )}
        {selectedRmId && !loading && priorityList.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">No priority clients for today. Click &ldquo;Generate Suggestions&rdquo; to refresh.</p>
        )}
        {priorityList.map(item => (
          <ClientCard key={item.client.id} mode="dashboard" item={item} />
        ))}
      </SectionPanel>
    </div>
  );
}

export default function WealthOSDashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
