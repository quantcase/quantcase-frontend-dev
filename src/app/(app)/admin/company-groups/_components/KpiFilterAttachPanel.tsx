"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { apiAuthDelete, apiAuthGet, apiAuthPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { KpiFilter, formatCondition } from "@/app/(app)/admin/kpi-filters/_components/types";
import { AttachedKpiFilter, RecomputeResult } from "./types";

const BASE = `${BACKEND_URL}/admin/company-groups`;
const INPUT_CLS =
  "rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";

interface Props {
  groupSlug: string;
  kpiFilters: KpiFilter[];
}

export function KpiFilterAttachPanel({ groupSlug, kpiFilters }: Props) {
  const [attached, setAttached] = useState<AttachedKpiFilter[]>([]);
  const [loadingAttached, setLoadingAttached] = useState(false);
  const [toAttach, setToAttach] = useState("");
  const [attaching, setAttaching] = useState(false);
  const [criteriaChanged, setCriteriaChanged] = useState(false);
  const [hasRecomputed, setHasRecomputed] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeResult, setRecomputeResult] = useState<RecomputeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadAttached() {
    apiAuthGet<{ success: boolean; data: AttachedKpiFilter[] }>(`${BASE}/${groupSlug}/filters`, {
      onStart: () => setLoadingAttached(true),
      onSuccess: (res) => setAttached(res.data ?? []),
      onError: setError,
      onComplete: () => setLoadingAttached(false),
    });
  }

  useEffect(() => { loadAttached(); }, [groupSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const attachedSlugs = new Set(attached.map((a) => a.kpi_filter.slug));
  const unattached = kpiFilters.filter((f) => !attachedSlugs.has(f.slug));

  function attach() {
    if (!toAttach) return;
    apiAuthPost<{ success: boolean; data: AttachedKpiFilter }>(
      `${BASE}/${groupSlug}/filters`,
      {
        onStart: () => { setAttaching(true); setError(null); },
        onSuccess: (res) => {
          setAttached((prev) => [...prev, res.data]);
          setToAttach("");
          setCriteriaChanged(true);
        },
        onError: setError,
        onComplete: () => setAttaching(false),
      },
      { kpi_filter_slug: toAttach }
    );
  }

  function detach(id: string) {
    const prev = attached;
    setAttached((a) => a.filter((x) => x.id !== id));
    apiAuthDelete<{ success: boolean }>(`${BASE}/${groupSlug}/filters/${id}`, {
      onSuccess: () => setCriteriaChanged(true),
      onError: (err) => { setAttached(prev); setError(err); },
    });
  }

  function recompute() {
    apiAuthPost<{ success: boolean; data: RecomputeResult }>(
      `${BASE}/${groupSlug}/recompute`,
      {
        onStart: () => { setRecomputing(true); setError(null); },
        onSuccess: (res) => {
          setRecomputeResult(res.data);
          setCriteriaChanged(false);
          setHasRecomputed(true);
        },
        onError: setError,
        onComplete: () => setRecomputing(false),
      }
    );
  }

  return (
    <div className="rounded-md border border-hair p-3 space-y-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">Attached KPI Filters</p>
        {loadingAttached ? (
          <div className="flex items-center gap-2 text-[12px] text-ink-3"><Loader2 className="size-3.5 animate-spin" /> Loading…</div>
        ) : attached.length === 0 ? (
          <p className="text-[12px] text-ink-3">None attached yet.</p>
        ) : (
          <div className="space-y-1.5">
            {attached.map((a) => {
              const meta = a.kpi_filter;
              return (
                <div key={a.id} className="flex items-center justify-between gap-2 rounded-md bg-secondary px-2.5 py-1.5">
                  <span className="text-[12px] text-ink">
                    <span className="font-medium">{meta?.label ?? a.kpi_filter_id}</span>
                    {meta && <span className="text-ink-3 font-mono"> — {meta.kpi_abbr} {formatCondition(meta)}</span>}
                  </span>
                  <button type="button" onClick={() => detach(a.id)} className="text-ink-3 hover:text-down shrink-0">
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select value={toAttach} onChange={(e) => setToAttach(e.target.value)} className={`${INPUT_CLS} flex-1`}>
          <option value="">Pick a KPI filter to attach…</option>
          {unattached.map((f) => (
            <option key={f.slug} value={f.slug}>{f.label} — {f.kpi_abbr} {formatCondition(f)}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={attach}
          disabled={!toAttach || attaching}
          className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-[12px] font-medium text-ink hover:border-ink disabled:opacity-40 transition-colors shrink-0"
        >
          {attaching ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Attach
        </button>
      </div>

      {criteriaChanged && hasRecomputed && (
        <div className="flex items-center gap-2 rounded-md border border-hair bg-warn-soft px-3 py-2 text-[12px] text-warn">
          <AlertCircle className="size-3.5 shrink-0" /> Criteria changed — re-run Recompute to apply.
        </div>
      )}

      {!hasRecomputed && !recomputeResult && (
        <p className="text-[11px] text-ink-3">Not yet computed — attach filters above, then Recompute to see matching companies.</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={recompute}
          disabled={recomputing || attached.length === 0}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {recomputing && <Loader2 className="size-3.5 animate-spin" />}
          Recompute
        </button>
        {recomputeResult && (
          <span className="text-[12px] text-up font-medium">Matched {recomputeResult.matched} companies</span>
        )}
      </div>

      {recomputeResult && recomputeResult.symbols.length > 0 && (
        <div className="max-h-[100px] overflow-y-auto rounded-md bg-secondary px-2.5 py-2 flex flex-wrap gap-1">
          {recomputeResult.symbols.map((s) => (
            <span key={s} className="text-[10px] font-mono text-ink-3 bg-card border border-hair rounded-sm px-1.5 py-0.5">{s}</span>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
