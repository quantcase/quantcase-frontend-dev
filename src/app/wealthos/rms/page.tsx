"use client";

import { useState, Suspense } from "react";
import { useWealthRMList, useWealthRM } from "@/hooks/useWealthRM";
import { useWealthRMAnalytics } from "@/hooks/useWealthAnalytics";
import { RMCard } from "@/components/wealthos/rm-card";
import { ClientCard } from "@/components/wealthos/client-card";
import { CreateRMForm } from "@/components/wealthos/create-rm-form";
import { MetricTile } from "@/components/molecules/metric-tile";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, BarChart2, Activity } from "lucide-react";
import type { WealthRM } from "@/types/wealthos";

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

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">Relationship Managers</h1>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? "Cancel" : "+ New RM"}
        </Button>
      </div>

      {showForm && <CreateRMForm onSuccess={handleRMCreated} onCancel={() => setShowForm(false)} />}

      {/* RM Grid */}
      <SectionPanel title="All RMs" subtitle={`${rms.length} relationship managers`} contentClassName="px-6 pb-6">
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />)}
          </div>
        )}
        {error && <p className="text-sm text-red-500 py-4">{error}</p>}
        {!loading && rms.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">No RMs found. Create one to get started.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rms.map(rm => (
            <RMCard
              key={rm.id}
              rm={rm}
              isSelected={rm.id === selectedRmId}
              onClick={() => setSelectedRmId(rm.id === selectedRmId ? "" : rm.id)}
            />
          ))}
        </div>
      </SectionPanel>

      {/* RM Detail Panel */}
      {selectedRmId && (
        <>
          {/* Analytics */}
          {!analyticsLoading && analytics && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricTile label="Total Clients" value={String(analytics.total_clients ?? "—")} icon={Users} iconColor="text-blue-500" />
              <MetricTile label="Avg Engagement" value={analytics.avg_engagement_score != null ? analytics.avg_engagement_score.toFixed(1) : "—"} icon={Activity} iconColor="text-green-500" />
              <MetricTile label="Avg Churn" value={analytics.avg_churn_probability != null ? `${(analytics.avg_churn_probability * 100).toFixed(0)}%` : "—"} icon={TrendingUp} iconColor="text-red-500" />
              <MetricTile label="Interactions (30d)" value={String(analytics.interactions_last_30d ?? "—")} icon={BarChart2} iconColor="text-purple-500" />
              <MetricTile label="Adoption Rate" value={analytics.suggestion_adoption_rate != null ? `${(analytics.suggestion_adoption_rate * 100).toFixed(0)}%` : "—"} icon={TrendingUp} iconColor="text-amber-500" />
              <MetricTile label="Avg Risk Score" value={analytics.avg_portfolio_risk_score != null ? analytics.avg_portfolio_risk_score.toFixed(1) : "—"} icon={BarChart2} iconColor="text-zinc-500" />
            </div>
          )}

          {/* Client List */}
          <SectionPanel
            title={selectedRM ? `${selectedRM.name}'s Clients` : "Clients"}
            contentClassName="px-6 pb-6 space-y-3"
          >
            {rmLoading && <p className="text-sm text-zinc-400 py-4">Loading clients...</p>}
            {!rmLoading && selectedRM?.clients?.length === 0 && (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">No clients assigned to this RM</p>
            )}
            {selectedRM?.clients?.map(client => (
              <ClientCard key={client.id} mode="list" item={client} />
            ))}
          </SectionPanel>
        </>
      )}
    </div>
  );
}

export default function WealthOSRMPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading...</div>}>
      <RMPageContent />
    </Suspense>
  );
}
