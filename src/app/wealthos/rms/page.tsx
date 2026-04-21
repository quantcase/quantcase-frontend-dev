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
    <div className="p-6 space-y-5" style={{ background: "var(--qc-surface-base)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between">
        <h1
          className="uppercase tracking-wide"
          style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", letterSpacing: "0.05em" }}
        >
          Relationship Managers
        </h1>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? "Cancel" : "+ New RM"}
        </Button>
      </div>

      {showForm && <CreateRMForm onSuccess={handleRMCreated} onCancel={() => setShowForm(false)} />}

      {/* RM Grid */}
      <SectionPanel title="All RMs" subtitle={`${rms.length} relationship managers`} contentClassName="px-6 pb-6">
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-24 rounded-xl animate-pulse"
                style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}
              />
            ))}
          </div>
        )}
        {error && <p style={{ fontSize: 13, color: "var(--qc-down)" }} className="py-4">{error}</p>}
        {!loading && rms.length === 0 && (
          <p className="py-6 text-center" style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>
            No RMs found. Create one to get started.
          </p>
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
          {!analyticsLoading && analytics && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricTile label="Total Clients" value={String(analytics.total_clients ?? "—")} icon={Users} />
              <MetricTile label="Avg Engagement" value={analytics.avg_engagement_score != null ? analytics.avg_engagement_score.toFixed(1) : "—"} icon={Activity} />
              <MetricTile label="Avg Churn" value={analytics.avg_churn_probability != null ? `${(analytics.avg_churn_probability * 100).toFixed(0)}%` : "—"} icon={TrendingUp} />
              <MetricTile label="Interactions (30d)" value={String(analytics.interactions_last_30d ?? "—")} icon={BarChart2} />
              <MetricTile label="Adoption Rate" value={analytics.suggestion_adoption_rate != null ? `${(analytics.suggestion_adoption_rate * 100).toFixed(0)}%` : "—"} icon={TrendingUp} />
              <MetricTile label="Avg Risk Score" value={analytics.avg_portfolio_risk_score != null ? analytics.avg_portfolio_risk_score.toFixed(1) : "—"} icon={BarChart2} />
            </div>
          )}

          <SectionPanel
            title={selectedRM ? `${selectedRM.name}'s Clients` : "Clients"}
            contentClassName="px-6 pb-6 space-y-3"
          >
            {rmLoading && (
              <p className="py-4" style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>Loading clients...</p>
            )}
            {!rmLoading && selectedRM?.clients?.length === 0 && (
              <p className="py-6 text-center" style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>
                No clients assigned to this RM
              </p>
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
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading...</div>}>
      <RMPageContent />
    </Suspense>
  );
}
