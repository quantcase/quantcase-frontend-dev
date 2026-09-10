"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Activity,
  Sparkles,
  ChevronDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Phone,
  MessageSquare,
  Users,
  Search,
  Plus
} from "lucide-react";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { useWealthDashboard } from "@/hooks/useWealthDashboard";
import { useWealthOpportunities } from "@/hooks/useWealthOpportunities";
import { useWealthTasks } from "@/hooks/useWealthTasks";
import { useWealthDashboardSummary } from "@/hooks/useWealthDashboardSummary";
import { useRmHeartbeat, useCioHeartbeat } from "@/hooks/useWealthHeartbeat";
import { RMHeartbeatGraph } from "@/components/dashboard/rm-heartbeat-graph";
import { ClientImportModal } from "@/components/wealthos/client-import-modal";
import { ExportButton } from "@/components/wealthos/export-button";
import { Button } from "@/components/ui/button";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthOpportunity, WealthTask } from "@/types/wealthos";

function WealthOSDashboardContent() {
  const [selectedRmId, setSelectedRmId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"graph" | "pipeline">("graph");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Fetch real data from hooks
  const { data: rms, loading: loadingRms } = useWealthRMList();
  const { data: summary, refetch: refetchSummary } = useWealthDashboardSummary();
  const { data: dashboardData, loading: loadingDash } = useWealthDashboard(selectedRmId);
  const { data: oppsResponse, loading: loadingOpps, refetch: refetchOpps } = useWealthOpportunities({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    status: "open",
  });
  const { data: tasksResponse, refetch: refetchTasks } = useWealthTasks({ status: "open" });

  // Heartbeat Graph data
  const { data: rmGraphData, loading: loadingRmGraph } = useRmHeartbeat(selectedRmId || (rms?.[0]?.id ?? ""));
  const { data: cioGraphData } = useCioHeartbeat();

  // Set default RM if not set
  React.useEffect(() => {
    if (!selectedRmId && rms && rms.length > 0) {
      setSelectedRmId(rms[0].id);
    }
  }, [rms, selectedRmId]);

  const opportunities: WealthOpportunity[] = oppsResponse?.data || oppsResponse?.items || [];
  const tasks: WealthTask[] = tasksResponse?.data || tasksResponse?.items || [];

  const handleDismissOpportunity = async (oppId: string) => {
    try {
      await authFetch(`${BACKEND_URL}/api/wealthos/opportunities/${oppId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: "dismissed" }),
      });
      refetchOpps();
      refetchSummary();
    } catch (e) {
      console.error("Failed to dismiss opportunity:", e);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await authFetch(`${BACKEND_URL}/api/wealthos/tasks/${taskId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: "done" }),
      });
      refetchTasks();
      refetchSummary();
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
  };

  const currentRm = useMemo(() => {
    return rms?.find((r) => r.id === selectedRmId) || rms?.[0];
  }, [rms, selectedRmId]);

  const priorityList = dashboardData?.priority_list || [];

  return (
    <div className="min-h-screen bg-background text-ink">
      <main className="max-w-[1440px] mx-auto px-6 py-6 pb-20 font-sans space-y-6">

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between pb-5 border-b border-hair gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl md:text-3xl text-ink tracking-tight">
                Relationship & Portfolio Intelligence
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                Live Book
              </span>
            </div>
            <p className="text-xs text-ink-2 mt-1">
              Active relationship heartbeat, client churn signals, and real-time rebalancing opportunities.
            </p>
          </div>

          {/* Controls: RM Switcher + Import/Export */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {rms && rms.length > 0 && (
              <div className="flex items-center bg-card border border-hair rounded-lg px-3 py-1.5 shadow-sm text-xs">
                <span className="text-ink-3 mr-2 font-mono">RM:</span>
                <select
                  value={selectedRmId}
                  onChange={(e) => setSelectedRmId(e.target.value)}
                  className="bg-transparent font-medium text-ink focus:outline-none cursor-pointer"
                >
                  {rms.map((r) => (
                    <option key={r.id} value={r.id} className="bg-card text-ink">
                      {r.display_name} ({r.team || "Private Wealth"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
              className="text-xs h-9 border-hair"
            >
              Import Roster
            </Button>

            <ExportButton entityType="clients" label="Export Book" />
          </div>
        </header>

        {/* ── SUMMARY STATS TILES ─────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl border border-hair bg-card shadow-sm">
            <span className="text-xs text-ink-2 font-mono uppercase tracking-wider">Managed AUM</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-serif font-bold text-ink">
                ₹{currentRm?.total_aum_cr || summary?.total_aum_cr || 0}
              </span>
              <span className="text-xs text-ink-3 font-mono">Cr</span>
            </div>
            <div className="text-[11px] text-up flex items-center gap-1 mt-1 font-mono">
              <span>Target: ₹{currentRm?.target_aum_cr || 1000} Cr</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-hair bg-card shadow-sm">
            <span className="text-xs text-ink-2 font-mono uppercase tracking-wider">Active Clients</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-serif font-bold text-ink">
                {currentRm?._count?.clients ?? summary?.total_clients ?? 0}
              </span>
              <span className="text-xs text-ink-3 font-mono">relationships</span>
            </div>
            <p className="text-[11px] text-ink-2 mt-1">Across Private Wealth</p>
          </div>

          <div className="p-4 rounded-xl border border-hair bg-card shadow-sm">
            <span className="text-xs text-ink-2 font-mono uppercase tracking-wider">Live Opportunities</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-serif font-bold text-primary">
                {opportunities.length}
              </span>
              <span className="text-xs text-ink-3 font-mono">
                (₹{summary?.opportunity_aum_cr || 2.4} Cr value)
              </span>
            </div>
            <p className="text-[11px] text-ink-2 mt-1">High receptivity leads</p>
          </div>

          <div className="p-4 rounded-xl border border-hair bg-card shadow-sm">
            <span className="text-xs text-ink-2 font-mono uppercase tracking-wider">Follow-up Tasks</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-serif font-bold text-ink">
                {tasks.length}
              </span>
              <span className="text-xs text-ink-3 font-mono">pending</span>
            </div>
            <p className="text-[11px] text-warn mt-1">Due today or overdue</p>
          </div>
        </section>

        {/* ── CENTERPIECE VIEW SELECTOR ───────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-hair pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("graph")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "graph"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-ink-2 hover:text-ink"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Relationship Heartbeat Graph</span>
              </button>

              <button
                onClick={() => setViewMode("pipeline")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "pipeline"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-ink-2 hover:text-ink"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Opportunities Pipeline ({opportunities.length})</span>
              </button>
            </div>

            <span className="text-xs text-ink-3 font-mono hidden md:inline">
              Centerpiece visual flow · Real-time D3 node physics
            </span>
          </div>

          {/* VIEW A: INTERACTIVE HEARTBEAT GRAPH */}
          {viewMode === "graph" && (
            <div className="rounded-xl border border-hair overflow-hidden shadow-sm bg-card">
              <div className="p-3 bg-secondary/40 border-b border-hair flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-ink">
                    Interactive Tree for {currentRm?.display_name || "Palash Jain"}
                  </span>
                  <span className="text-ink-3">
                    ({rmGraphData?.meta?.total_clients || currentRm?._count?.clients || 7} clients · {rmGraphData?.meta?.total_alerts || 4} drift alerts)
                  </span>
                </div>
                <span className="text-ink-3">Drag nodes to inspect · Double click to focus</span>
              </div>
              <div className="h-[620px] w-full">
                <RMHeartbeatGraph data={rmGraphData} loading={loadingRmGraph} />
              </div>
            </div>
          )}

          {/* VIEW B: OPPORTUNITIES PIPELINE */}
          {viewMode === "pipeline" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: "All Opportunities" },
                  { id: "client_asked", label: "Client Inquiries" },
                  { id: "life_event", label: "Life Milestones" },
                  { id: "idle_cash", label: "Idle Cash Deployment" },
                  { id: "coverage_gap", label: "Coverage Gaps" },
                  { id: "rebalance", label: "Portfolio Drift" },
                  { id: "tax_saving", label: "Tax Harvesting" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                      selectedCategory === cat.id
                        ? "bg-card border-primary text-primary font-medium shadow-xs"
                        : "bg-transparent border-hair text-ink-2 hover:bg-secondary"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Opportunities List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {opportunities.length === 0 ? (
                  <div className="col-span-2 p-12 text-center border border-hair rounded-xl bg-card">
                    <Sparkles className="w-8 h-8 mx-auto text-ink-3 mb-2" />
                    <p className="text-sm font-medium text-ink">No active opportunities in this category</p>
                    <p className="text-xs text-ink-2 mt-1">All client portfolios are currently aligned with model targets.</p>
                  </div>
                ) : (
                  opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-xl border border-hair bg-card shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <Link
                            href={`/wealthos/clients/${opp.client_id}`}
                            className="font-serif font-semibold text-ink hover:text-primary transition-colors text-sm"
                          >
                            {opp.client?.name || "Client"}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-ink-2 font-mono text-[11px]">
                              Fit: {Math.round(opp.fit_score * 100)}%
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] capitalize">
                              {opp.category.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-medium text-ink mb-1.5">{opp.headline}</p>

                        {opp.evidence && (
                          <div className="p-2 rounded bg-secondary/50 border border-hair/60 text-[11px] text-ink-2 italic mb-3">
                            &ldquo;{opp.evidence}&rdquo;
                          </div>
                        )}

                        {opp.indicative_value_cr && (
                          <div className="text-xs text-ink-2 flex items-center gap-1 mb-2 font-mono">
                            <span>Indicative Value:</span>
                            <span className="font-semibold text-ink">₹{opp.indicative_value_cr} Cr</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-hair/70 flex items-center justify-between text-xs">
                        <Link
                          href={`/wealthos/clients/${opp.client_id}`}
                          className="text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          View Client Details
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissOpportunity(opp.id)}
                            className="h-7 text-xs text-ink-3 hover:text-down"
                          >
                            Dismiss
                          </Button>
                          <Link href={`/wealthos/clients/${opp.client_id}`}>
                            <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                              Act
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── BOTTOM DUAL SECTION: PRIORITY LIST & TASKS ──────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* TODAY'S CLIENT OUTREACH LIST */}
          <div className="rounded-xl border border-hair bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-hair mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-ink">Clients Needing Attention</h2>
                <p className="text-xs text-ink-2">Algorithmic risk signals & dormant contact triggers</p>
              </div>
              <Link href="/wealthos/clients" className="text-xs text-primary hover:underline font-medium">
                View All Clients
              </Link>
            </div>

            <div className="space-y-3">
              {priorityList.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-2">
                  No priority clients triggered today. All relationships up to date.
                </div>
              ) : (
                priorityList.slice(0, 5).map((item) => (
                  <div
                    key={item.client.id}
                    className="p-3 rounded-lg border border-hair/80 bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/wealthos/clients/${item.client.id}`}
                          className="font-medium text-xs text-ink hover:text-primary transition-colors"
                        >
                          {item.client.name}
                        </Link>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-secondary text-ink-3 font-mono">
                          {item.client.segment}
                        </span>
                        {item.priority === "HIGH" && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-down-soft text-down font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-2 mt-1">
                        {item.suggested_action?.reason || "Portfolio rebalance suggested based on risk drift"}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-ink">
                        ₹{item.client.aum_cr || 0} Cr
                      </span>
                      <div className="mt-1">
                        <Link href={`/wealthos/clients/${item.client.id}`}>
                          <Button variant="outline" size="sm" className="h-6 text-[11px] px-2 border-hair">
                            Engage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ACTIVE TASKS & FOLLOW-UPS */}
          <div className="rounded-xl border border-hair bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-hair mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-ink">Follow-Up Action Board</h2>
                <p className="text-xs text-ink-2">Client calls, document collection & review commitments</p>
              </div>
              <span className="text-xs font-mono text-ink-3">{tasks.length} open</span>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-2">
                  No pending tasks. You are all caught up!
                </div>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-hair/80 bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="mt-0.5 w-4 h-4 rounded border border-hair hover:border-up hover:bg-up/10 flex items-center justify-center transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3 text-ink-3 hover:text-up" />
                      </button>
                      <div>
                        <p className="text-xs font-medium text-ink">{task.title}</p>
                        {task.client && (
                          <p className="text-[11px] text-ink-2 mt-0.5">
                            Client: <span className="font-medium text-ink">{task.client.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-ink-3 font-mono">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>

        {/* Modal for CSV Roster Import */}
        <ClientImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            refetchSummary();
            refetchOpps();
          }}
        />

      </main>
    </div>
  );
}

export default function WealthOSDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-2">Loading WealthOS Dashboard...</div>}>
      <WealthOSDashboardContent />
    </Suspense>
  );
}
