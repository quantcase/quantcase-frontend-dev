"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Loader2, AlertCircle, ChevronDown, CheckCircle2, XCircle, Clock, RefreshCw, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import { rawFetch, rawPost, rawPostDownload } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { CompanySourcePicker } from "./CompanySourcePicker";
import { GroupConfigTag } from "./GroupConfigTag";
import {
  TickerSource,
  L2DispatchOptions,
  L2OptionsResponse,
  L2Skill,
  L2ConfigKeyOption,
  L2CompanyGroupOption,
  L2CompressedPreviewResponse,
  L2CompressedPreviewTickerRow,
  L2RunTriggerResponse,
  L2Run,
  L2RunsResponse,
} from "./types";

const BASE = `${BACKEND_URL}/admin/pipeline-dispatch/l2-compressed-multi`;

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

// ── Preview per-ticker row ───────────────────────────────────────────────────

function PreviewTickerRow({ row }: { row: L2CompressedPreviewTickerRow }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-[8px] border border-hair bg-card text-left">
      <span className="font-mono text-[12px] font-medium text-ink w-24 shrink-0">{row.ticker}</span>
      {row.ready ? (
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-up">
          <CheckCircle2 className="size-3.5" /> Ready
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-down text-right">
          <XCircle className="size-3.5 shrink-0" /> Missing base L2 ({row.missing.join(", ")})
        </span>
      )}
    </div>
  );
}

// ── Run status badge ─────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: L2Run["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-up">
        <CheckCircle2 className="size-3.5" /> Completed
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-down">
        <XCircle className="size-3.5" /> Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-blue">
      <Clock className="size-3.5" /> Running
    </span>
  );
}

// ── Run history row ───────────────────────────────────────────────────────────

function RunHistoryRow({ run }: { run: L2Run }) {
  const [open, setOpen] = useState(false);
  const hasMeta = !!run.metadata;

  return (
    <div className="rounded-[8px] border border-hair bg-card overflow-hidden">
      <button
        onClick={() => hasMeta && setOpen((v) => !v)}
        className={`w-full flex items-center gap-4 px-3 py-2 text-left transition-colors ${hasMeta ? "hover:bg-secondary" : ""}`}
      >
        <span className="font-mono text-[11px] text-ink-3 w-40 truncate shrink-0">{run.job_id}</span>
        <RunStatusBadge status={run.status} />
        <span className="text-[11px] text-ink-3">
          {run.records_processed != null ? `${run.records_processed} queued` : "—"}
        </span>
        {run.ended_at && <span className="text-[11px] text-ink-3">ended {new Date(run.ended_at).toLocaleString()}</span>}
        {hasMeta && (
          <ChevronDown className={`size-3.5 text-ink-3 ml-auto transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {run.status === "failed" && run.error && (
        <div className="border-t border-hair px-3 py-2 text-[11px] text-down bg-down-soft">{run.error}</div>
      )}

      {open && run.metadata && (
        <div className="border-t border-hair px-3 py-3 bg-secondary space-y-2">
          <div className="flex gap-4 text-[11px] text-ink-3">
            <span>Queued: <span className="text-ink font-medium">{run.metadata.queued}</span></span>
            <span>Skipped: <span className="text-ink font-medium">{run.metadata.skipped ?? run.metadata.noSource ?? 0}</span></span>
            <span>Failed: <span className="text-ink font-medium">{run.metadata.failed}</span></span>
          </div>
          {run.metadata.perTicker?.length > 0 && (
            <div className="rounded-md border border-hair overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary border-b border-hair">
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">Ticker</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">Status</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">Job ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair bg-card">
                  {run.metadata.perTicker.map((p) => (
                    <tr key={p.ticker}>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-ink">{p.ticker}</td>
                      <td className="px-3 py-1.5 text-[11px] text-ink-3">{p.status ?? "—"}</td>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-ink-3">{p.jobId ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skill multi-select — closed dropdown trigger + checkbox popover ─────────

function SkillMultiSelect({
  skills,
  selected,
  onChange,
  loading,
}: {
  skills: L2Skill[];
  selected: string[];
  onChange: (next: string[]) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = skills.length > 0 && skills.every((s) => selected.includes(s.slug));
  const selectedNames = skills.filter((s) => selected.includes(s.slug)).map((s) => s.name);

  function toggle(slug: string) {
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);
  }
  function toggleAll() {
    onChange(allSelected ? [] : skills.map((s) => s.slug));
  }

  const label = loading
    ? "Loading…"
    : skills.length === 0
    ? "No skills available"
    : selected.length === 0
    ? "Select skills…"
    : allSelected
    ? `All skills (${skills.length})`
    : selectedNames.length <= 2
    ? selectedNames.join(", ")
    : `${selected.length} skills selected`;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={skills.length === 0}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-hair bg-card px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong disabled:opacity-40"
      >
        <span className="truncate text-left">{label}</span>
        <ChevronDown className={`size-3.5 text-ink-3 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && skills.length > 0 && (
        <div className="absolute z-[100] top-full mt-1 left-0 w-full min-w-[240px] rounded-md border border-hair bg-card shadow-lg overflow-y-auto max-h-[280px]">
          <label className="flex items-center gap-1.5 px-3 py-2 border-b border-hair cursor-pointer hover:bg-secondary">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded accent-[var(--qc-ink)]" />
            <span className="text-[12px] font-medium text-ink">Select all ({skills.length})</span>
          </label>
          {skills.map((s) => (
            <label key={s.slug} className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-secondary">
              <input
                type="checkbox"
                checked={selected.includes(s.slug)}
                onChange={() => toggle(s.slug)}
                className="rounded accent-[var(--qc-ink)]"
              />
              <span className="text-[12px] text-ink">{s.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface ResolveCountResponse {
  data: { tickers: string[]; count: number };
}

// ── Main tab ───────────────────────────────────────────────────────────────

export function L2CompressedHtmlRegenerationTab() {
  const [skills, setSkills] = useState<L2Skill[]>([]);
  const [skillSlugs, setSkillSlugs] = useState<string[]>([]);
  const [configKeys, setConfigKeys] = useState<L2ConfigKeyOption[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyGroups, setCompanyGroups] = useState<L2CompanyGroupOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [source, setSource] = useState<TickerSource>("manual");
  const [tickers, setTickers] = useState<string[]>([]);
  const [groupSlug, setGroupSlug] = useState("");
  const [groupCounts, setGroupCounts] = useState<Record<string, number | "loading" | "error">>({});

  const [historic, setHistoric] = useState(true);
  const [force, setForce] = useState(false);

  const [preview, setPreview] = useState<L2CompressedPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [multiSkillNotice, setMultiSkillNotice] = useState(false);
  const multiSkillNoticeShown = useRef(false);

  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const [confirmArmed, setConfirmArmed] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRunIds, setActiveRunIds] = useState<string[]>([]);

  const [runs, setRuns] = useState<L2Run[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<L2OptionsResponse>(`${BASE}/options`, {
      onStart: () => { setOptionsLoading(true); setOptionsError(null); },
      onSuccess: (res) => {
        setSkills(res.skills ?? []);
        setConfigKeys(res.configKeys ?? []);
        setCompanies(res.companies ?? []);
        setCompanyGroups(res.companyGroups ?? []);
        if ((res.skills ?? []).length > 0) setSkillSlugs([(res.skills ?? [])[0].slug]);
      },
      onError: setOptionsError,
      onComplete: () => setOptionsLoading(false),
    });
  }, []);

  useEffect(() => {
    if (source !== "group") return;
    companyGroups.forEach((g) => {
      if (g.slug in groupCounts) return;
      setGroupCounts((p) => ({ ...p, [g.slug]: "loading" }));
      rawFetch<ResolveCountResponse>(`${BACKEND_URL}/admin/company-groups/${g.slug}/resolve`, {
        onSuccess: (res) => setGroupCounts((p) => ({ ...p, [g.slug]: res.data.count })),
        onError: () => setGroupCounts((p) => ({ ...p, [g.slug]: "error" })),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, companyGroups]);

  const loadRuns = useCallback(() => {
    rawFetch<L2RunsResponse>(`${BASE}/runs?limit=20`, {
      onStart: () => setRunsLoading(true),
      onSuccess: (res) => setRuns(res.runs ?? []),
      onError: setRunsError,
      onComplete: () => setRunsLoading(false),
    });
  }, []);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  const activeRuns = runs.filter((r) => activeRunIds.includes(r.job_id));
  const isRunLive = activeRunIds.length > 0 && activeRunIds.some((id) => {
    const r = runs.find((x) => x.job_id === id);
    return !r || r.status === "running";
  });

  useEffect(() => {
    if (!isRunLive) return;
    const iv = setInterval(loadRuns, 2000);
    return () => clearInterval(iv);
  }, [isRunLive, loadRuns]);

  const sourceUsable = source !== "default";
  const selectedGroup = companyGroups.find((g) => g.slug === groupSlug);

  const tickerBody = useMemo<Omit<L2DispatchOptions, "slug" | "historic" | "force">>(() => {
    const b: Omit<L2DispatchOptions, "slug" | "historic" | "force"> = {};
    if (source === "all") b.all = true;
    else if (source === "group" && groupSlug) b.groupSlug = groupSlug;
    else if (source === "manual" && tickers.length > 0) b.tickers = tickers;
    return b;
  }, [source, groupSlug, tickers]);

  const previewSlug = skillSlugs[0];
  const previewKey = JSON.stringify({ ...tickerBody, previewSlug, historic });
  const canPreview = sourceUsable && skillSlugs.length > 0 && !previewLoading;
  const canRun = sourceUsable && skillSlugs.length > 0 && !previewLoading && !triggering && !isRunLive;

  function doPreview(targetPage = 1) {
    if (!previewSlug) return;
    if (skillSlugs.length > 1 && !multiSkillNoticeShown.current) {
      multiSkillNoticeShown.current = true;
      setMultiSkillNotice(true);
    }
    const key = previewKey;
    const reqBody = { ...tickerBody, slug: previewSlug, historic, ...(targetPage > 1 ? { page: targetPage } : {}) };
    rawPost<L2CompressedPreviewResponse>(`${BASE}/preview`, {
      onStart: () => { setPreviewLoading(true); setPreviewError(null); },
      onSuccess: (res) => { setPreview(res); setPreviewedKey(key); setPage(targetPage); },
      onError: setPreviewError,
      onComplete: () => setPreviewLoading(false),
    }, reqBody);
  }

  function doExportCsv() {
    if (!previewSlug) return;
    rawPostDownload(`${BASE}/preview/csv`, {
      onStart: () => { setCsvLoading(true); setCsvError(null); },
      onError: setCsvError,
      onComplete: () => setCsvLoading(false),
    }, { ...tickerBody, slug: previewSlug, historic }, `l2-compressed-preview-${previewSlug}.csv`);
  }

  function handleRunClick() {
    if (!confirmArmed) { setConfirmArmed(true); return; }
    if (skillSlugs.length === 0) return;
    setTriggering(true);
    setRunError(null);
    const runIds: string[] = [];
    let remaining = skillSlugs.length;
    let firstError: string | null = null;
    const runBody: Omit<L2DispatchOptions, "slug"> = { ...tickerBody };
    if (historic) runBody.historic = true;
    if (force) runBody.force = true;
    skillSlugs.forEach((slug) => {
      rawPost<L2RunTriggerResponse>(`${BASE}/regenerate-html`, {
        onSuccess: (res) => { runIds.push(res.run_id); },
        onError: (err) => { firstError = firstError ?? `${slug}: ${err}`; },
        onComplete: () => {
          remaining -= 1;
          if (remaining === 0) {
            setActiveRunIds(runIds);
            setConfirmArmed(false);
            setTriggering(false);
            if (firstError) setRunError(firstError);
            loadRuns();
          }
        },
      }, { ...runBody, slug });
    });
  }

  // Sort missing first, then alphabetically
  const rows = useMemo(
    () => [...(preview?.perTicker ?? [])].sort((a, b) => {
      if (a.ready === b.ready) return a.ticker.localeCompare(b.ticker);
      return a.ready ? 1 : -1;
    }),
    [preview]
  );

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Intro */}
      <div className="rounded-md border border-hair bg-secondary px-4 py-3">
        <p className="text-[13px] text-ink font-medium">On-demand L2.5 HTML Regeneration</p>
        <p className="text-[12px] text-ink-3 mt-1">Queues HTML regeneration for the selected L2.5 skills against the chosen ticker set. A ticker without underlying JSON output will fail.</p>
      </div>

      {optionsError && !optionsLoading && (
        <div className="flex items-center gap-2 rounded-md border border-down-soft bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {optionsError}
        </div>
      )}

      <CompanySourcePicker
        source={source}
        onSourceChange={setSource}
        tickers={tickers}
        onTickersChange={setTickers}
        companies={companies}
        defaultTickerCount={0}
        groupSlug={groupSlug}
        onGroupSlugChange={setGroupSlug}
        companyGroups={companyGroups}
        groupCounts={groupCounts}
        loading={optionsLoading}
        noDefault
      />

      {source === "group" && selectedGroup && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Group Config Tag</span>
          <GroupConfigTag
            group={selectedGroup}
            configKeys={configKeys}
            onTagged={(slug, configKey) =>
              setCompanyGroups((gs) => gs.map((gg) => (gg.slug === slug ? { ...gg, config_key: configKey } : gg)))
            }
          />
        </div>
      )}

      {/* Options form */}
      <div className="rounded-[10px] border border-hair bg-card p-4 space-y-4">
        <div>
          <label className={LABEL_CLS}>
            Skills {optionsLoading && <span className="normal-case tracking-normal font-normal">— loading…</span>}
          </label>
          <SkillMultiSelect skills={skills} selected={skillSlugs} onChange={setSkillSlugs} loading={optionsLoading} />
        </div>

        <div className="flex flex-wrap gap-6 pt-1 border-t border-hair">
          <CheckboxField
            checked={historic}
            onChange={setHistoric}
            disabled
            label="Historic mode"
            hint="Checks for historic base L2 coverage instead of incremental. Incremental is disabled for now."
          />
          <CheckboxField
            checked={force}
            onChange={setForce}
            label="Force"
            hint="Bypasses cache on Run. Run only — ignored by Preview."
          />
        </div>
      </div>

      {/* Errors */}
      {previewError && (
        <div className="flex items-center gap-2 rounded-md border border-down-soft bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {previewError}
        </div>
      )}
      {csvError && (
        <div className="flex items-center gap-2 rounded-md border border-down-soft bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {csvError}
        </div>
      )}
      {runError && (
        <div className="flex items-center gap-2 rounded-md border border-down-soft bg-down-soft px-4 py-3 text-sm text-down">
          <AlertCircle className="size-4 shrink-0" /> {runError}
        </div>
      )}

      {multiSkillNotice && (
        <div className="flex items-start gap-2 rounded-md border border-warn-soft bg-warn-soft px-4 py-3 text-sm text-warn">
          <AlertCircle className="size-4 shrink-0 mt-px" />
          <span className="flex-1">
            Preview only queries {skills.find((s) => s.slug === previewSlug)?.name ?? previewSlug} (the
            first selected skill) — Run will still dispatch all {skillSlugs.length} selected skills
            concurrently.
          </span>
          <button onClick={() => setMultiSkillNotice(false)} className="text-warn hover:opacity-80 shrink-0">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => doPreview(1)}
          disabled={!canPreview}
          className="flex items-center gap-1.5 rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink hover:border-ink transition-colors disabled:opacity-40"
        >
          {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
          Preview
        </button>

        <button
          onClick={doExportCsv}
          disabled={!sourceUsable || skillSlugs.length === 0 || csvLoading}
          title="Export CSV of readiness status for the selected skill."
          className="flex items-center gap-1.5 rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink hover:border-ink transition-colors disabled:opacity-40"
        >
          {csvLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Export CSV
        </button>

        <button
          onClick={handleRunClick}
          disabled={!canRun}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
            confirmArmed ? "bg-down hover:opacity-90" : "bg-ink hover:opacity-90"
          }`}
        >
          {triggering && <Loader2 className="size-3.5 animate-spin" />}
          {confirmArmed ? "Confirm dispatch" : "Run"}
        </button>

        {confirmArmed && (
          <button onClick={() => setConfirmArmed(false)} className="text-sm text-ink-3 hover:text-ink">
            Cancel
          </button>
        )}

        <span className="text-[11px] text-ink-3">
          {confirmArmed
            ? `This queues real jobs for ${skillSlugs.length} skill${skillSlugs.length === 1 ? "" : "s"} concurrently.`
            : "Preview is optional — Run dispatches with the current options whether or not you've previewed them."}
        </span>
      </div>

      {previewLoading && (
        <div className="flex items-center gap-2 text-[12px] text-ink-3 mt-3">
          <Loader2 className="size-3.5 animate-spin" />
          Previewing…
        </div>
      )}

      {/* Active run banners — one per skill dispatched concurrently */}
      {activeRuns.length > 0 && (
        <div className="space-y-1.5 mt-3">
          {activeRuns.map((r) => (
            <div key={r.job_id} className="flex items-center gap-2 rounded-md border border-blue-soft bg-blue-soft px-4 py-3 text-sm text-blue">
              <Loader2 className="size-4 shrink-0 animate-spin" />
              Dispatching run {r.job_id}… check back under Run History.
            </div>
          ))}
        </div>
      )}

      {/* Preview results */}
      {preview && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Preview</span>
              <span className="text-[10px] text-ink-3">{preview.tickerCount} companies total</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {preview.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => doPreview(page - 1)}
                    disabled={page <= 1 || previewLoading || previewedKey !== previewKey}
                    className="flex items-center justify-center size-6 rounded border border-hair text-ink-3 hover:text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-ink-3 transition-colors"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <span className="text-[11px] text-ink-3">Page {preview.page} of {preview.totalPages}</span>
                  <button
                    onClick={() => doPreview(page + 1)}
                    disabled={page >= preview.totalPages || previewLoading || previewedKey !== previewKey}
                    className="flex items-center justify-center size-6 rounded border border-hair text-ink-3 hover:text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-ink-3 transition-colors"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            {rows.map((row) => <PreviewTickerRow key={row.ticker} row={row} />)}
          </div>
        </div>
      )}

      {/* Run history */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Run History</span>
          <button
            onClick={loadRuns}
            disabled={runsLoading}
            className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
          >
            {runsLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            Refresh
          </button>
        </div>

        {runsError && !runsLoading && (
          <div className="flex items-center gap-2 rounded-md border border-down-soft bg-down-soft px-4 py-3 text-sm text-down">
            <AlertCircle className="size-4 shrink-0" /> {runsError}
          </div>
        )}

        {runs.length === 0 && !runsLoading && !runsError && (
          <p className="text-[12px] text-ink-3">No runs yet.</p>
        )}

        <div className="space-y-1.5">
          {runs.map((run) => <RunHistoryRow key={run.job_id} run={run} />)}
        </div>
      </div>
    </div>
  );
}
