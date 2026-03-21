"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useWealthClient } from "@/hooks/useWealthClient";
import { useWealthPortfolio } from "@/hooks/useWealthPortfolio";
import { useWealthInteractions } from "@/hooks/useWealthInteractions";
import { useWealthActions } from "@/hooks/useWealthActions";
import { useWealthModels } from "@/hooks/useWealthModels";
import { apiPost, apiDelete } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

import { MetricTile } from "@/components/molecules/metric-tile";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { SegmentBadge } from "@/components/wealthos/segment-badge";
import { PortfolioHoldingsTable } from "@/components/wealthos/portfolio-holdings-table";
import { InteractionTimeline } from "@/components/wealthos/interaction-timeline";
import { LogInteractionForm } from "@/components/wealthos/log-interaction-form";
import { SuggestionsPanel } from "@/components/wealthos/suggestions-panel";
import { ActionLogTable } from "@/components/wealthos/action-log-table";
import { ModelCard } from "@/components/wealthos/model-card";
import { Button } from "@/components/ui/button";

import { TrendingDown, Activity, DollarSign, ShieldAlert } from "lucide-react";

type Tab = "overview" | "portfolio" | "interactions" | "suggestions" | "actions";

const TAB_LABELS: Tab[] = ["overview", "portfolio", "interactions", "suggestions", "actions"];
const TAB_DISPLAY: Record<Tab, string> = {
  overview: "Overview",
  portfolio: "Portfolio",
  interactions: "Interactions",
  suggestions: "Suggestions",
  actions: "Actions",
};

function ClientDetailContent() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activatedTabs, setActivatedTabs] = useState<Set<Tab>>(new Set(["overview"]));

  const { data: client, loading, error } = useWealthClient(clientId);
  const { data: models } = useWealthModels();

  // Lazy-load data only when a tab is first activated
  const portfolioEnabled = activatedTabs.has("portfolio");
  const interactionsEnabled = activatedTabs.has("interactions");
  const actionsEnabled = activatedTabs.has("actions");

  const { data: portfolio, loading: portfolioLoading } = useWealthPortfolio(portfolioEnabled ? clientId : "");
  const { data: interactionsData, loading: interactionsLoading, refetch: refetchInteractions } = useWealthInteractions(interactionsEnabled ? clientId : "");
  const { data: actionsData, loading: actionsLoading } = useWealthActions(actionsEnabled ? clientId : "");

  const handleTabChange = (tab: string) => {
    const t = tab as Tab;
    setActiveTab(t);
    setActivatedTabs(prev => new Set([...prev, t]));
  };

  const handleAssignModel = (modelId: string) => {
    apiPost(`${BACKEND_URL}/api/wealthos/clients/${clientId}/models/${modelId}`, {
      onSuccess: () => {},
      onError: () => {},
    });
  };

  const handleRemoveModel = (modelId: string) => {
    apiDelete(`${BACKEND_URL}/api/wealthos/clients/${clientId}/models/${modelId}`, {
      onSuccess: () => {},
      onError: () => {},
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-48" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !client) {
    return <div className="p-6 text-sm text-red-500">{error || "Client not found"}</div>;
  }

  return (
    <div className="p-6 space-y-5">
      {/* Back link */}
      <Link
        href="/wealthos/clients"
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors w-fit"
      >
        <ChevronLeft className="size-4" /> Back to Clients
      </Link>

      {/* Client Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{client.name}</h1>
        <SegmentBadge segment={client.segment} />
        <span className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">{client.risk_profile} risk</span>
        {client.rm && (
          <span className="text-sm text-zinc-400 dark:text-zinc-500">· RM: {client.rm.name}</span>
        )}
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile
          label="Engagement Score"
          value={String(client.engagement_score)}
          icon={Activity}
          iconColor="text-blue-500"
        />
        <MetricTile
          label="Churn Probability"
          value={`${(client.churn_probability * 100).toFixed(0)}%`}
          icon={TrendingDown}
          iconColor={client.churn_probability > 0.6 ? "text-red-500" : client.churn_probability > 0.3 ? "text-amber-500" : "text-green-500"}
        />
        <MetricTile
          label="Portfolio Value"
          value={client.portfolio?.total_value
            ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(client.portfolio.total_value)
            : "—"}
          icon={DollarSign}
          iconColor="text-green-500"
        />
        <MetricTile
          label="Risk Score"
          value={client.portfolio?.risk_score != null ? client.portfolio.risk_score.toFixed(1) : "—"}
          icon={ShieldAlert}
          iconColor="text-amber-500"
        />
      </div>

      {/* Tabs */}
      <TabToggle
        options={TAB_LABELS.map(t => TAB_DISPLAY[t])}
        value={TAB_DISPLAY[activeTab]}
        onChange={(label) => handleTabChange(TAB_LABELS.find(t => TAB_DISPLAY[t] === label) ?? "overview")}
      />

      {/* Tab content */}
      {activeTab === "overview" && (
        <SectionPanel title="Client Overview" contentClassName="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.email && (
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Email</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Phone</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{client.phone}</p>
              </div>
            )}
            {client.last_contact_at && (
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Last Contact</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{new Date(client.last_contact_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Segment</p>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{client.segment}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Approved Models</p>
            {models.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No models available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {models.map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    action={
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAssignModel(model.id)} className="text-xs py-0.5 h-7">
                          Assign
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveModel(model.id)} className="text-xs py-0.5 h-7 text-red-500 hover:text-red-600">
                          Remove
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </SectionPanel>
      )}

      {activeTab === "portfolio" && (
        <SectionPanel title="Portfolio" contentClassName="px-6 pb-6">
          {portfolioLoading && <p className="text-sm text-zinc-400 py-4">Loading portfolio...</p>}
          {!portfolioLoading && !portfolio && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">No portfolio data available</p>
          )}
          {portfolio && <PortfolioHoldingsTable portfolio={portfolio} />}
        </SectionPanel>
      )}

      {activeTab === "interactions" && (
        <SectionPanel title="Interactions" contentClassName="px-6 pb-6 space-y-4">
          <LogInteractionForm clientId={clientId} onSuccess={refetchInteractions} />
          {interactionsLoading && <p className="text-sm text-zinc-400 py-4">Loading interactions...</p>}
          {interactionsData && <InteractionTimeline interactions={interactionsData.items} />}
        </SectionPanel>
      )}

      {activeTab === "suggestions" && (
        <SectionPanel title="AI Suggestions" contentClassName="px-6 pb-6">
          <SuggestionsPanel clientId={clientId} />
        </SectionPanel>
      )}

      {activeTab === "actions" && (
        <SectionPanel title="Action Log" contentClassName="px-6 pb-6">
          {actionsLoading && <p className="text-sm text-zinc-400 py-4">Loading actions...</p>}
          {actionsData && <ActionLogTable actions={actionsData.items} />}
        </SectionPanel>
      )}
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading client...</div>}>
      <ClientDetailContent />
    </Suspense>
  );
}
