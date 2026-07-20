"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AlertCircle, List, Loader2, Network, Plus, RefreshCw, Search } from "lucide-react";
import { apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Kpi, KpiResponse, KpisResponse } from "./_components/types";
import { KpiFormDialog } from "./_components/KpiFormDialog";
import { KpiCatalogueTree } from "./_components/KpiCatalogueTree";
import { KpiGroupNode, KpiGroupTreeResponse, flattenTree } from "../kpi-groups/_components/types";

const BASE = `${BACKEND_URL}/admin/kpis`;

export default function KpisPage() {
  const [search, setSearch] = useState("");
  const [includeAllSources, setIncludeAllSources] = useState(false);
  const [coreOnly, setCoreOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");
  const [kpiGroupTree, setKpiGroupTree] = useState<KpiGroupNode[] | null>(null);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [fetchingEdit, setFetchingEdit] = useState<string | null>(null);

  const load = useCallback((q: string, allSources: boolean) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("search", q.trim());
    if (allSources) params.set("includeAllSources", "true");
    apiAuthGet<KpisResponse>(`${BASE}?${params}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setKpis(res.data ?? []),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, []);

  useEffect(() => { load("", false); }, [load]);

  // Backs both "Core metrics only" (flat-table filter) and the Tree view (browse by KPI Group,
  // used to find KPIs the flat/paginated list makes hard to locate — e.g. Reserves).
  useEffect(() => {
    if (!(coreOnly || viewMode === "tree") || kpiGroupTree) return;
    apiAuthGet<KpiGroupTreeResponse>(`${BACKEND_URL}/admin/kpi-groups/tree`, {
      onSuccess: (res) => setKpiGroupTree(res.data ?? []),
      onError: () => {},
    });
  }, [coreOnly, viewMode, kpiGroupTree]);

  const coreAbbrs = useMemo(() => {
    if (!kpiGroupTree) return null;
    const abbrs = flattenTree(kpiGroupTree).map((n) => n.kpi_abbr).filter((a): a is string => !!a);
    return new Set(abbrs);
  }, [kpiGroupTree]);

  function openCreate() {
    setEditingKpi(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openEditByAbbr(abbr: string) {
    setFetchingEdit(abbr);
    apiAuthGet<KpiResponse>(`${BASE}/${abbr}`, {
      onSuccess: (res) => {
        setEditingKpi(res.data);
        setDialogOpen(true);
        setDialogKey((k) => k + 1);
      },
      onError: (err) => setError(err),
      onComplete: () => setFetchingEdit(null),
    });
  }

  function openEdit(kpi: Kpi) {
    openEditByAbbr(kpi.abbr);
  }

  const abbrOptions = kpis.map((k) => k.abbr);
  const visibleKpis = useMemo(
    () => (coreOnly && coreAbbrs ? kpis.filter((k) => coreAbbrs.has(k.abbr)) : kpis),
    [kpis, coreOnly, coreAbbrs]
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">KPI Catalogue</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            Raw values, computed formulas, and fallback chains. Every column in a Prowess CSV export
            must map to a KPI here.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="size-4" /> New KPI
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(search, includeAllSources); }}
              placeholder="abbr or full form"
              className="rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong w-56"
            />
          </div>
          <button
            onClick={() => load(search, includeAllSources)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
            Search
          </button>
          <label className="flex items-center gap-1.5 text-[12px] text-ink-3 pb-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAllSources}
              onChange={(e) => { setIncludeAllSources(e.target.checked); load(search, e.target.checked); }}
              className="size-3.5"
            />
            Include all sources
          </label>
          {viewMode === "list" && (
            <label className="flex items-center gap-1.5 text-[12px] text-ink-3 pb-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={coreOnly}
                onChange={(e) => setCoreOnly(e.target.checked)}
                className="size-3.5"
              />
              Core metrics only
            </label>
          )}
          <div className="inline-flex rounded-md border border-hair p-0.5 bg-secondary mb-2.5">
            {([
              { mode: "list" as const, icon: List, label: "List" },
              { mode: "tree" as const, icon: Network, label: "Tree" },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                  viewMode === mode ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                }`}
              >
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => load(search, includeAllSources)}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40 pb-2.5"
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

      {viewMode === "tree" ? (
        !kpiGroupTree ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-[8px] bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <KpiCatalogueTree nodes={kpiGroupTree} onSelectLeaf={openEditByAbbr} fetchingAbbr={fetchingEdit} />
        )
      ) : (
        <>
      {loading && visibleKpis.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-[8px] bg-secondary animate-pulse" />)}
        </div>
      )}

      {!loading && !error && visibleKpis.length === 0 && (
        <div className="rounded-[10px] border border-hair bg-secondary px-4 py-10 text-center">
          <p className="text-[13px] text-ink-3">No KPIs match this search.</p>
        </div>
      )}

      {visibleKpis.length > 0 && (
        <div className="rounded-[10px] border border-hair bg-card overflow-hidden overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary border-b border-hair">
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Abbr</th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Full Form</th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Source</th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Frequency</th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">KPI Type</th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Unit</th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Fallbacks</th>
              </tr>
            </thead>
            <tbody>
              {visibleKpis.map((k) => (
                <tr
                  key={k.id ?? k.abbr}
                  onClick={() => openEdit(k)}
                  className="border-b border-hair last:border-0 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2 text-ink font-medium font-mono whitespace-nowrap">
                    {fetchingEdit === k.abbr ? <Loader2 className="size-3 animate-spin inline" /> : k.abbr}
                  </td>
                  <td className="px-3 py-2 text-ink">{k.full_form}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold rounded-sm px-1.5 py-0.5 ${
                        k.formula_expression ? "text-blue bg-blue-soft" : "text-ink-3 bg-secondary"
                      }`}
                    >
                      {k.formula_expression ? "Computed" : "Raw"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-3 whitespace-nowrap">{k.frequency ?? "—"}</td>
                  <td className="px-3 py-2 text-ink-3 whitespace-nowrap">{k.kpi_type}</td>
                  <td className="px-3 py-2 text-ink-3 whitespace-nowrap">{k.unit_label ?? "—"}</td>
                  <td className="px-3 py-2 text-ink-3 whitespace-nowrap">{k.fallback_abbrs?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}

      <KpiFormDialog
        key={dialogKey}
        open={dialogOpen}
        kpi={editingKpi}
        abbrOptions={abbrOptions}
        onClose={() => setDialogOpen(false)}
        onSaved={() => load(search, includeAllSources)}
      />
    </div>
  );
}
