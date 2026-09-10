"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  TrendingDown,
  Activity,
  DollarSign,
  ShieldAlert,
  Pin,
  CheckCircle2,
  Plus,
  Calendar,
  Clock,
  User,
  Trash2
} from "lucide-react";

import { useWealthClient } from "@/hooks/useWealthClient";
import { useWealthPortfolio } from "@/hooks/useWealthPortfolio";
import { useWealthInteractions } from "@/hooks/useWealthInteractions";
import { useWealthActions } from "@/hooks/useWealthActions";
import { useWealthModels } from "@/hooks/useWealthModels";
import { useWealthNotes } from "@/hooks/useWealthNotes";
import { useWealthTasks } from "@/hooks/useWealthTasks";
import { apiPost, apiDelete, authFetch, authHeaders } from "@/lib/api";
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

type Tab = "overview" | "portfolio" | "interactions" | "notes" | "tasks" | "suggestions" | "actions";

const TAB_LABELS: Tab[] = ["overview", "portfolio", "interactions", "notes", "tasks", "suggestions", "actions"];
const TAB_DISPLAY: Record<Tab, string> = {
  overview:     "Overview",
  portfolio:    "Portfolio",
  interactions: "Interactions",
  notes:        "Notes",
  tasks:        "Tasks",
  suggestions:  "Suggestions",
  actions:      "Actions",
};

function ClientDetailContent() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activatedTabs, setActivatedTabs] = useState<Set<Tab>>(new Set(["overview"]));
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const { data: client, loading, error } = useWealthClient(clientId);
  const { data: models } = useWealthModels();

  const portfolioEnabled = activatedTabs.has("portfolio");
  const interactionsEnabled = activatedTabs.has("interactions");
  const actionsEnabled = activatedTabs.has("actions");
  const notesEnabled = activatedTabs.has("notes");
  const tasksEnabled = activatedTabs.has("tasks");

  const { data: portfolio, loading: portfolioLoading } = useWealthPortfolio(portfolioEnabled ? clientId : "");
  const { data: interactionsData, loading: interactionsLoading, refetch: refetchInteractions } = useWealthInteractions(interactionsEnabled ? clientId : "");
  const { data: actionsData, loading: actionsLoading } = useWealthActions(actionsEnabled ? clientId : "");
  const { data: notes, loading: notesLoading, refetch: refetchNotes } = useWealthNotes(notesEnabled ? clientId : "");
  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useWealthTasks(tasksEnabled ? { client_id: clientId } : {});

  const handleTabChange = (tab: string) => {
    const t = tab as Tab;
    setActiveTab(t);
    setActivatedTabs((prev) => new Set([...prev, t]));
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

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      setAddingNote(true);
      await authFetch(`${BACKEND_URL}/api/wealthos/clients/${clientId}/notes`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: newNoteText.trim() }),
      });
      setNewNoteText("");
      refetchNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await authFetch(`${BACKEND_URL}/api/wealthos/clients/${clientId}/notes/${noteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      refetchNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "done" ? "open" : "done";
    try {
      await authFetch(`${BACKEND_URL}/api/wealthos/tasks/${taskId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });
      refetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 bg-background min-h-screen">
        <div className="h-8 rounded animate-pulse w-48 bg-secondary" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-lg animate-pulse bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6 text-xs text-down">
        {error || "Client not found"}
      </div>
    );
  }

  const clientTasks = tasksData?.data || tasksData?.items || [];
  const clientAum = client.aum_cr ?? client.portfolio?.total_value_cr ?? client.portfolio?.total_value ?? 0;

  return (
    <div className="p-6 space-y-5 bg-background min-h-screen text-ink">
      {/* Back link */}
      <Link
        href="/wealthos/clients"
        className="flex items-center gap-1 w-fit text-ink-2 hover:text-ink text-xs transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to Clients
      </Link>

      {/* Client Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-hair">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl font-bold text-ink">{client.name}</h1>
          <SegmentBadge segment={client.segment} />
          <span className="capitalize text-xs text-ink-2">
            {client.risk_profile} risk
          </span>
          <span className="text-xs text-ink-3">
            · Lifecycle: <span className="text-ink capitalize font-medium">{client.lifecycle_status}</span>
          </span>
          {client.rm && (
            <span className="text-xs text-ink-2 font-mono">
              · RM: {client.rm.display_name || client.rm.name}
            </span>
          )}
        </div>

        <div className="text-xs font-mono font-bold text-ink bg-card px-3 py-1.5 rounded-lg border border-hair">
          AUM: ₹{clientAum} Cr
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="Engagement Score" value={String(client.engagement_score)} icon={Activity} />
        <MetricTile
          label="Churn Probability"
          value={`${(client.churn_probability * 100).toFixed(0)}%`}
          icon={TrendingDown}
        />
        <MetricTile
          label="Portfolio AUM"
          value={`₹${clientAum} Cr`}
          icon={DollarSign}
        />
        <MetricTile
          label="Risk Score"
          value={client.portfolio?.risk_score != null ? client.portfolio.risk_score.toFixed(1) : "—"}
          icon={ShieldAlert}
        />
      </div>

      {/* Tabs */}
      <TabToggle
        options={TAB_LABELS.map((t) => TAB_DISPLAY[t])}
        value={TAB_DISPLAY[activeTab]}
        onChange={(label) => handleTabChange(TAB_LABELS.find((t) => TAB_DISPLAY[t] === label) ?? "overview")}
      />

      {/* Tab content */}
      {activeTab === "overview" && (
        <SectionPanel title="Client Profile & Demographics" contentClassName="px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {client.email && (
              <div>
                <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-ink mt-0.5">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-ink mt-0.5">{client.phone}</p>
              </div>
            )}
            {client.city && (
              <div>
                <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">City</p>
                <p className="text-sm font-medium text-ink mt-0.5">{client.city}</p>
              </div>
            )}
            {client.pan_number && (
              <div>
                <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">PAN Number</p>
                <p className="text-sm font-medium font-mono text-ink mt-0.5">{client.pan_number}</p>
              </div>
            )}
            {client.last_contact_at && (
              <div>
                <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">Last Contact</p>
                <p className="text-sm font-medium text-ink mt-0.5">
                  {new Date(client.last_contact_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
            <div>
              <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">KYC Status</p>
              <p className="text-sm font-medium text-ink mt-0.5 capitalize">{client.kyc_status?.replace(/_/g, " ") || "Verified"}</p>
            </div>
          </div>

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div className="pt-2">
              <p className="font-mono text-[10px] text-ink-3 uppercase tracking-wider mb-1.5">Client Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {client.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs bg-secondary text-ink-2 font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Approved Models */}
          <div className="pt-4 border-t border-hair">
            <p className="text-sm font-semibold text-ink mb-3 font-serif">
              Model Portfolio Mandates
            </p>
            {models.length === 0 ? (
              <p className="text-xs text-ink-2">No models available in catalog</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {models.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isAssigned={client.model_mappings?.some((m: any) => m.model_id === model.id) ?? false}
                    onAssign={handleAssignModel}
                    onRemove={handleRemoveModel}
                  />
                ))}
              </div>
            )}
          </div>
        </SectionPanel>
      )}

      {activeTab === "portfolio" && (
        <SectionPanel title="Portfolio & Relational Holdings">
          {portfolioLoading ? (
            <div className="py-8 text-center text-xs text-ink-2">Loading holdings data...</div>
          ) : portfolio ? (
            <PortfolioHoldingsTable portfolio={portfolio} />
          ) : (
            <p className="text-xs text-ink-2">No portfolio recorded for this client.</p>
          )}
        </SectionPanel>
      )}

      {activeTab === "notes" && (
        <SectionPanel title="Client Relationship Notes" contentClassName="px-6 pb-6 space-y-4">
          {/* Note Input */}
          <form onSubmit={handleCreateNote} className="flex gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add an internal note about this client (e.g. family priorities, tax requirements)..."
              className="flex-1 bg-card border border-hair rounded-lg px-3.5 py-2 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary"
            />
            <Button type="submit" size="sm" disabled={addingNote || !newNoteText.trim()} className="text-xs gap-1">
              <Plus className="size-3.5" />
              Add Note
            </Button>
          </form>

          {/* Notes list */}
          <div className="space-y-2.5 pt-2">
            {notesLoading ? (
              <div className="text-center py-6 text-xs text-ink-2">Loading notes...</div>
            ) : !notes || notes.length === 0 ? (
              <div className="text-center py-6 text-xs text-ink-3">No notes recorded yet for this client.</div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-lg border border-hair bg-card flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="text-ink font-medium leading-relaxed">{note.content}</p>
                    <p className="text-[10px] text-ink-3 font-mono">
                      {new Date(note.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-ink-3 hover:text-down transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </SectionPanel>
      )}

      {activeTab === "tasks" && (
        <SectionPanel title="Action Items & Tasks" contentClassName="px-6 pb-6 space-y-4">
          <div className="space-y-2.5">
            {tasksLoading ? (
              <div className="text-center py-6 text-xs text-ink-2">Loading tasks...</div>
            ) : clientTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-ink-3">No open tasks for this client.</div>
            ) : (
              clientTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-hair bg-card flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        task.status === "done" ? "bg-up border-up text-white" : "border-hair hover:border-up"
                      }`}
                    >
                      {task.status === "done" && <CheckCircle2 className="size-3" />}
                    </button>
                    <div>
                      <p className={`font-medium ${task.status === "done" ? "line-through text-ink-3" : "text-ink"}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-[11px] text-ink-2 mt-0.5">{task.description}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-ink-3">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionPanel>
      )}

      {activeTab === "interactions" && (
        <SectionPanel title="Interactions">
          <div className="space-y-6">
            <LogInteractionForm clientId={clientId} onLogged={refetchInteractions} />
            <InteractionTimeline interactions={interactionsData?.data ?? []} loading={interactionsLoading} />
          </div>
        </SectionPanel>
      )}

      {activeTab === "suggestions" && (
        <SectionPanel title="Suggestions">
          <SuggestionsPanel clientId={clientId} />
        </SectionPanel>
      )}

      {activeTab === "actions" && (
        <SectionPanel title="Actions">
          <ActionLogTable actions={actionsData?.data ?? []} loading={actionsLoading} />
        </SectionPanel>
      )}
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-2">Loading Client Profile...</div>}>
      <ClientDetailContent />
    </Suspense>
  );
}
