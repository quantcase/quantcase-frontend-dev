"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { apiAuthDelete, apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { KpiFilter, KpiFiltersResponse, formatCondition } from "./_components/types";
import { KpiFilterFormDialog } from "./_components/KpiFilterFormDialog";
import { KpisResponse } from "../kpis/_components/types";

const BASE = `${BACKEND_URL}/admin/kpi-filters`;

function FilterRow({ filter, onEdit, onDelete }: { filter: KpiFilter; onEdit: () => void; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="rounded-[8px] border border-hair bg-card px-4 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-ink">{filter.label}</span>
          <span className="text-[10px] font-mono text-ink-3">{filter.slug}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-mono text-ink bg-secondary rounded-sm px-1.5 py-0.5">{filter.kpi_abbr}</span>
          <span className="text-[12px] text-ink-3 font-mono">{formatCondition(filter)}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 bg-secondary rounded-sm px-1.5 py-0.5">
            {filter.frequency ?? "any"}
          </span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        <button onClick={onEdit} className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:text-ink hover:bg-secondary transition-colors">
          <Pencil className="size-3.5" />
        </button>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:text-down hover:bg-down-soft transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={onDelete} className="text-[11px] font-medium text-down hover:underline">Confirm</button>
            <button onClick={() => setConfirmDelete(false)} className="text-ink-3 hover:text-ink"><X className="size-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KpiFiltersPage() {
  const [filters, setFilters] = useState<KpiFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kpiAbbrFilter, setKpiAbbrFilter] = useState("");
  const [abbrOptions, setAbbrOptions] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<KpiFilter | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const load = useCallback((q: string, abbr: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("search", q.trim());
    if (abbr) params.set("kpi_abbr", abbr);
    apiAuthGet<KpiFiltersResponse>(`${BASE}?${params}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setFilters(res.data ?? []),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, []);

  useEffect(() => { load("", ""); }, [load]);

  useEffect(() => {
    apiAuthGet<KpisResponse>(`${BACKEND_URL}/admin/kpis?limit=500`, {
      onSuccess: (res) => setAbbrOptions((res.data ?? []).map((k) => k.abbr)),
      onError: () => {},
    });
  }, []);

  function openCreate() {
    setEditingFilter(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openEdit(filter: KpiFilter) {
    setEditingFilter(filter);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function handleDelete(slug: string) {
    const prev = filters;
    setFilters((fs) => fs.filter((f) => f.slug !== slug));
    apiAuthDelete<{ success: boolean }>(`${BASE}/${slug}`, {
      onSuccess: () => {},
      onError: (err) => { setFilters(prev); setError(err); },
    });
  }

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">KPI Filters</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            Reusable threshold conditions on a KPI, independent of any one group — attach them to a
            &ldquo;KPI filter&rdquo; company group to build membership from them.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="size-4" /> New Filter
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(search, kpiAbbrFilter); }}
              placeholder="label or slug"
              className="rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong w-48"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">KPI Abbr</label>
            <select
              value={kpiAbbrFilter}
              onChange={(e) => { setKpiAbbrFilter(e.target.value); load(search, e.target.value); }}
              className="rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong w-48"
            >
              <option value="">All</option>
              {abbrOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button
            onClick={() => load(search, kpiAbbrFilter)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
            Search
          </button>
        </div>
        <button
          onClick={() => load(search, kpiAbbrFilter)}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
          Refresh
        </button>
      </div>

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading && filters.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-[8px] bg-secondary animate-pulse" />)}
        </div>
      )}

      {!loading && !error && filters.length === 0 && (
        <div className="rounded-[10px] border border-hair bg-secondary px-4 py-10 text-center">
          <p className="text-[13px] text-ink-3">No KPI filters match this search.</p>
        </div>
      )}

      <div className="space-y-2">
        {filters.map((f) => (
          <FilterRow key={f.slug} filter={f} onEdit={() => openEdit(f)} onDelete={() => handleDelete(f.slug)} />
        ))}
      </div>

      <KpiFilterFormDialog
        key={dialogKey}
        open={dialogOpen}
        filter={editingFilter}
        abbrOptions={abbrOptions}
        onClose={() => setDialogOpen(false)}
        onSaved={() => load(search, kpiAbbrFilter)}
      />
    </div>
  );
}
