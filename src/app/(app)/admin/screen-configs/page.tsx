"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { apiAuthDelete, apiAuthGet, rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { ScreenConfigFormDialog } from "./_components/ScreenConfigFormDialog";
import { CompanyGroupOption, ScreenConfig, ScreenConfigResponse, ScreenConfigsResponse } from "./_components/types";
import { KpisResponse } from "../kpis/_components/types";

const BASE = `${BACKEND_URL}/admin/screen-configs`;

interface CompanyGroupsRaw { success: boolean; data: { slug: string; name: string }[] }

function SectionRow({ section, companyGroups, onEdit, onDelete }: {
  section: ScreenConfig;
  companyGroups: CompanyGroupOption[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pinnedGroupName = section.company_group_slug
    ? companyGroups.find((g) => g.slug === section.company_group_slug)?.name ?? section.company_group_slug
    : null;

  return (
    <div className="rounded-[8px] border border-hair bg-card px-4 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-ink font-mono">{section.key}</span>
          <span className="text-[12px] text-ink-3">{section.label}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {section.endpoint && (
            <span className="text-[11px] font-mono text-ink-3">{section.endpoint}</span>
          )}
          <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 bg-secondary rounded-sm px-1.5 py-0.5">
            {section.periods_shown != null ? `${section.periods_shown} periods` : "all periods"}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 bg-secondary rounded-sm px-1.5 py-0.5">
            {section.decimal_places != null ? `${section.decimal_places}dp` : "no default dp"}
          </span>
          {section.frequency && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 bg-secondary rounded-sm px-1.5 py-0.5">
              {section.frequency}
            </span>
          )}
          {section.variant_of_key && (
            <span
              title={`Overrides ${section.variant_of_key} for this group only`}
              className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue-soft rounded-sm px-1.5 py-0.5"
            >
              variant of {section.variant_of_key}
            </span>
          )}
          {pinnedGroupName && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue-soft rounded-sm px-1.5 py-0.5">
              {pinnedGroupName}
            </span>
          )}
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
            <button onClick={onDelete} className="text-[11px] font-medium text-down hover:underline">Confirm — deletes its items too</button>
            <button onClick={() => setConfirmDelete(false)} className="text-ink-3 hover:text-ink"><X className="size-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScreenConfigsPage() {
  const [sections, setSections] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [abbrOptions, setAbbrOptions] = useState<string[]>([]);
  const [companyGroups, setCompanyGroups] = useState<CompanyGroupOption[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ScreenConfig | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [fetchingEdit, setFetchingEdit] = useState<string | null>(null);

  const load = useCallback((q: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("search", q.trim());
    apiAuthGet<ScreenConfigsResponse>(`${BASE}?${params}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setSections(res.data ?? []),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, []);

  useEffect(() => { load(""); }, [load]);

  useEffect(() => {
    apiAuthGet<KpisResponse>(`${BACKEND_URL}/admin/kpis?limit=500`, {
      onSuccess: (res) => setAbbrOptions((res.data ?? []).map((k) => k.abbr)),
      onError: () => {},
    });
    rawFetch<CompanyGroupsRaw>(`${BACKEND_URL}/admin/company-groups`, {
      onSuccess: (res) => setCompanyGroups((res.data ?? []).map((g) => ({ slug: g.slug, name: g.name }))),
      onError: () => {},
    });
  }, []);

  function openCreate() {
    setEditingSection(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openEdit(section: ScreenConfig) {
    setFetchingEdit(section.key);
    apiAuthGet<ScreenConfigResponse>(`${BASE}/${section.key}`, {
      onSuccess: (res) => {
        setEditingSection(res.data);
        setDialogOpen(true);
        setDialogKey((k) => k + 1);
      },
      onError: (err) => setError(err),
      onComplete: () => setFetchingEdit(null),
    });
  }

  function handleDelete(key: string) {
    const prev = sections;
    setSections((s) => s.filter((sec) => sec.key !== key));
    apiAuthDelete<{ success: boolean }>(`${BASE}/${key}`, {
      onSuccess: () => {},
      onError: (err) => { setSections(prev); setError(err); },
    });
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Screen Configs</h1>
          <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
            Controls which metrics show on which screener page section, in what order, with what
            formatting — reorder, relabel, add, or remove any row/column/series without a deploy.
            Separate from KPI Groups, which is the KPI catalogue&apos;s own display hierarchy.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="size-4" /> New Section
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(search); }}
              placeholder="key or label"
              className="rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong w-56"
            />
          </div>
          <button
            onClick={() => load(search)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
            Search
          </button>
        </div>
        <button
          onClick={() => load(search)}
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

      {loading && sections.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-[8px] bg-secondary animate-pulse" />)}
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className="rounded-[10px] border border-hair bg-secondary px-4 py-10 text-center">
          <p className="text-[13px] text-ink-3">No sections match this search.</p>
        </div>
      )}

      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.key} className="relative">
            {fetchingEdit === s.key && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[8px] bg-card/60">
                <Loader2 className="size-4 animate-spin text-ink-3" />
              </div>
            )}
            <SectionRow section={s} companyGroups={companyGroups} onEdit={() => openEdit(s)} onDelete={() => handleDelete(s.key)} />
          </div>
        ))}
      </div>

      <ScreenConfigFormDialog
        key={dialogKey}
        open={dialogOpen}
        section={editingSection}
        abbrOptions={abbrOptions}
        companyGroups={companyGroups}
        existingKeys={sections.map((s) => s.key)}
        onClose={() => setDialogOpen(false)}
        onSaved={() => load(search)}
      />
    </div>
  );
}
