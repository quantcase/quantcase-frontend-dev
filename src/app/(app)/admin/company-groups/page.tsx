"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Loader2, Plus, Pencil, Trash2, RefreshCw, X } from "lucide-react";
import { apiCall, apiDelete, rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { CompanyGroup, ResolveResult, isManualConfig } from "./_components/types";
import { GroupFormDialog } from "./_components/GroupFormDialog";

const BASE = `${BACKEND_URL}/admin/company-groups`;

interface L1OptionsForCompanies {
  companies: string[];
}

function FilterSummary({ group }: { group: CompanyGroup }) {
  if (isManualConfig(group)) {
    const count = group.filter_config.tickers?.length ?? 0;
    return <span className="text-[12px] text-[#888888]">{count} ticker{count !== 1 ? "s" : ""}, manual</span>;
  }
  const cfg = group.filter_config as Record<string, unknown>;
  const parts: string[] = [];
  if (cfg.nameRange) parts.push("alphabet range");
  if (cfg.transcript) parts.push("transcript");
  if (cfg.ppt) parts.push("ppt");
  if (cfg.annualReport) parts.push("annual report");
  if (cfg.marketCap) parts.push("market cap");
  if (Array.isArray(cfg.industries) && cfg.industries.length > 0) parts.push("industry");
  return <span className="text-[12px] text-[#888888]">{parts.length > 0 ? parts.join(" · ") : "no filters — empty"}</span>;
}

function GroupRow({
  group,
  onEdit,
  onDelete,
}: {
  group: CompanyGroup;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [count, setCount] = useState<number | "loading" | "error" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function resolveCount() {
    setCount("loading");
    rawFetch<{ success: boolean; data: ResolveResult }>(`${BASE}/${group.slug}/resolve`, {
      onSuccess: (res) => setCount(res.data.count),
      onError: () => setCount("error"),
    });
  }

  return (
    <div className="rounded-[8px] border border-[#E2E2E2] bg-white px-4 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#0F172B]">{group.name}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#888888] bg-[#F5F5F5] rounded-sm px-1.5 py-0.5">
            {group.filter_type}
          </span>
          {group.config_key && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#0F172B] bg-emerald-50 border border-emerald-200 rounded-sm px-1.5 py-0.5">
              config: {group.config_key}
            </span>
          )}
        </div>
        {group.description && <p className="text-[12px] text-[#888888] mt-0.5">{group.description}</p>}
        <div className="mt-1"><FilterSummary group={group} /></div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {count === null && (
          <button onClick={resolveCount} className="text-[11px] text-[#888888] hover:text-[#0F172B] underline">
            Preview count
          </button>
        )}
        {count === "loading" && <Loader2 className="size-3.5 animate-spin text-[#888888]" />}
        {count === "error" && <span className="text-[11px] text-red-600">count failed</span>}
        {typeof count === "number" && (
          <span className="text-[12px] text-[#0F172B] font-medium">{count} companies</span>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1">
        <button
          onClick={onEdit}
          className="flex size-7 items-center justify-center rounded-md text-[#888888] hover:text-[#0F172B] hover:bg-[#F5F5F5] transition-colors"
        >
          <Pencil className="size-3.5" />
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex size-7 items-center justify-center rounded-md text-[#888888] hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={onDelete} className="text-[11px] font-medium text-red-600 hover:underline">
              Confirm
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-[#888888] hover:text-[#0F172B]">
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompanyGroupsPage() {
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CompanyGroup | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const loadGroups = useCallback(() => {
    apiCall<{ success: boolean; data: CompanyGroup[] }>(BASE, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setGroups(res.data ?? []),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  useEffect(() => {
    rawFetch<L1OptionsForCompanies>(`${BACKEND_URL}/admin/pipeline-dispatch/l1-multi/options`, {
      onSuccess: (res) => setCompanies(res.companies ?? []),
      onError: () => {},
    });
  }, []);

  function openCreate() {
    setEditingGroup(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openEdit(group: CompanyGroup) {
    setEditingGroup(group);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function handleDelete(slug: string) {
    const prev = groups;
    setGroups((gs) => gs.filter((g) => g.slug !== slug));
    apiDelete<{ success: boolean }>(`${BASE}/${slug}`, {
      onSuccess: () => {},
      onError: (err) => { setGroups(prev); setError(err); },
    });
  }

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Company Groups</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            Manual ticker lists and live filters, reusable anywhere a ticker set is needed — L1
            dispatch today, L2/L3 later.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="size-4" /> New Group
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
          {groups.length} group{groups.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={loadGroups}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] text-[#888888] hover:text-[#0F172B] disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
          Refresh
        </button>
      </div>

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading && groups.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-[8px] bg-[#F5F5F5] animate-pulse" />)}
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-10 text-center">
          <p className="text-[13px] text-[#888888]">No groups yet — create one to reuse a ticker set across dispatch flows.</p>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((g) => (
          <GroupRow key={g.slug} group={g} onEdit={() => openEdit(g)} onDelete={() => handleDelete(g.slug)} />
        ))}
      </div>

      <GroupFormDialog
        key={dialogKey}
        open={dialogOpen}
        group={editingGroup}
        companies={companies}
        onClose={() => setDialogOpen(false)}
        onSaved={loadGroups}
      />
    </div>
  );
}
