"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { apiAuthDelete, apiAuthGet, rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { KpiGroupTree } from "./_components/KpiGroupTree";
import { KpiGroupFormDialog } from "./_components/KpiGroupFormDialog";
import { CompanyGroupOption, KpiGroupListResponse, KpiGroupNode, KpiGroupTreeResponse, findAncestorPath } from "./_components/types";
import { KpisResponse } from "../kpis/_components/types";

const BASE = `${BACKEND_URL}/admin/kpi-groups`;

interface CompanyGroupsRaw { success: boolean; data: { slug: string; name: string }[] }

export default function KpiGroupsPage() {
  const [tree, setTree] = useState<KpiGroupNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<KpiGroupNode[] | null>(null);
  const [searching, setSearching] = useState(false);

  const [companyGroups, setCompanyGroups] = useState<CompanyGroupOption[]>([]);
  const [abbrOptions, setAbbrOptions] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<KpiGroupNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const loadTree = useCallback(() => {
    apiAuthGet<KpiGroupTreeResponse>(`${BASE}/tree`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setTree(res.data ?? []),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, []);

  useEffect(() => { loadTree(); }, [loadTree]);

  useEffect(() => {
    rawFetch<CompanyGroupsRaw>(`${BACKEND_URL}/admin/company-groups`, {
      onSuccess: (res) => setCompanyGroups((res.data ?? []).map((g) => ({ slug: g.slug, name: g.name }))),
      onError: () => {},
    });
    apiAuthGet<KpisResponse>(`${BACKEND_URL}/admin/kpis?limit=500`, {
      onSuccess: (res) => setAbbrOptions((res.data ?? []).map((k) => k.abbr)),
      onError: () => {},
    });
  }, []);

  function runSearch(q: string) {
    if (!q.trim()) { setSearchResults(null); return; }
    const params = new URLSearchParams({ search: q.trim() });
    apiAuthGet<KpiGroupListResponse>(`${BASE}?${params}`, {
      onStart: () => setSearching(true),
      onSuccess: (res) => setSearchResults(res.data ?? []),
      onError: setError,
      onComplete: () => setSearching(false),
    });
  }

  function openCreateRoot() {
    setEditingNode(null);
    setDefaultParentId(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openAddChild(parentId: string) {
    setEditingNode(null);
    setDefaultParentId(parentId);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openEdit(node: KpiGroupNode) {
    setEditingNode(node);
    setDefaultParentId(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function handleDelete(node: KpiGroupNode) {
    apiAuthDelete<{ success: boolean }>(`${BASE}/${node.slug}`, {
      onSuccess: () => loadTree(),
      onError: setError,
    });
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">KPI Groups</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            Parent/child tree for organizing KPIs into screener sections. Admin-managed only — not
            yet wired into the live screener response.
          </p>
        </div>
        <button
          onClick={openCreateRoot}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="size-4" /> New Root Section
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runSearch(search); }}
            placeholder="Search sections or leaves…"
            className="rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong w-64"
          />
          <button
            onClick={() => runSearch(search)}
            disabled={searching}
            className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40"
          >
            {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
            Search
          </button>
          {searchResults !== null && (
            <button
              onClick={() => { setSearch(""); setSearchResults(null); }}
              className="text-[12px] text-ink-3 hover:text-ink underline"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={loadTree}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading && tree.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-[8px] bg-secondary animate-pulse" />)}
        </div>
      )}

      {searchResults !== null ? (
        searchResults.length === 0 ? (
          <p className="text-[12px] text-ink-3">No sections match this search.</p>
        ) : (
          <div className="rounded-[10px] border border-hair bg-card divide-y divide-[var(--qc-hair)]">
            {searchResults.map((n) => {
              const path = findAncestorPath(tree, n.slug);
              return (
                <button
                  key={n.id}
                  onClick={() => openEdit(n)}
                  className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors"
                >
                  {path && path.length > 0 && (
                    <p className="text-[10px] text-ink-3">{path.map((p) => p.label).join(" / ")}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-ink">{n.label}</span>
                    <span className="text-[10px] font-mono text-ink-3">{n.slug}</span>
                    {n.kpi_abbr && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue-soft rounded-sm px-1.5 py-0.5 font-mono">
                        leaf: {n.kpi_abbr}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )
      ) : (
        !loading && tree.length > 0 && (
          <KpiGroupTree nodes={tree} onAddChild={openAddChild} onEdit={openEdit} onDelete={handleDelete} />
        )
      )}

      <KpiGroupFormDialog
        key={dialogKey}
        open={dialogOpen}
        node={editingNode}
        defaultParentId={defaultParentId}
        tree={tree}
        abbrOptions={abbrOptions}
        companyGroups={companyGroups}
        onClose={() => setDialogOpen(false)}
        onSaved={loadTree}
      />
    </div>
  );
}
