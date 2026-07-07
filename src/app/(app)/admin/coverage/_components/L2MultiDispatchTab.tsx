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
  L2PreviewResponse,
  L2PreviewTickerRow,
  L2RunTriggerResponse,
  L2Run,
  L2RunsResponse,
} from "./types";

type L2SortSource = "transcript" | "ppt" | "annual_report";
const SORT_LABEL: Record<L2SortSource, string> = {
  transcript: "Transcript",
  ppt: "PPT",
  annual_report: "Annual Report",
};

const BASE = `${BACKEND_URL}/admin/pipeline-dispatch/l2-multi`;

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5";

// ── Preview per-ticker row — signal-availability report (one query for the whole batch) ─────

function PreviewSourceBlock({ label, cov, hasQuarter }: { label: string; cov: L2PreviewTickerRow["transcript"]; hasQuarter: boolean }) {
  if (cov.periods.length === 0) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">{label}</div>
      <div className="rounded-md border border-[#E2E2E2] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
              <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Year</th>
              {hasQuarter && <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Quarter</th>}
              <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0] bg-white">
            {cov.periods.map((p, i) => (
              <tr key={i}>
                <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{p.fiscal_year}</td>
                {hasQuarter && <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{p.quarter}</td>}
                <td className="px-3 py-1.5 text-center text-[11px] font-medium text-[#0F172B]">{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PreviewTickerRow({ row }: { row: L2PreviewTickerRow }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[8px] border border-[#F0F0F0] bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-3 py-2 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <span className="font-mono text-[12px] font-medium text-[#0F172B] w-24 shrink-0">{row.ticker}</span>
        <span className="text-[11px] text-[#888888]">
          Transcript: <span className="text-[#0F172B] font-medium">{row.transcript.total}</span>
        </span>
        <span className="text-[11px] text-[#888888]">
          PPT: <span className="text-[#0F172B] font-medium">{row.ppt.total}</span>
        </span>
        <span className="text-[11px] text-[#888888]">
          Annual: <span className="text-[#0F172B] font-medium">{row.annual_report.total}</span>
        </span>
        <ChevronDown className={`size-3.5 text-[#888888] ml-auto transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-[#F0F0F0] px-3 py-3 bg-[#FAFAFA] space-y-3">
          <PreviewSourceBlock label="Transcript" cov={row.transcript} hasQuarter />
          <PreviewSourceBlock label="PPT" cov={row.ppt} hasQuarter />
          <PreviewSourceBlock label="Annual Report" cov={row.annual_report} hasQuarter={false} />
        </div>
      )}
    </div>
  );
}

// ── Run status badge ─────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: L2Run["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
        <CheckCircle2 className="size-3.5" /> Completed
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
        <XCircle className="size-3.5" /> Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
      <Clock className="size-3.5" /> Running
    </span>
  );
}

// ── Run history row ───────────────────────────────────────────────────────────

function RunHistoryRow({ run }: { run: L2Run }) {
  const [open, setOpen] = useState(false);
  const hasMeta = !!run.metadata;

  return (
    <div className="rounded-[8px] border border-[#F0F0F0] bg-white overflow-hidden">
      <button
        onClick={() => hasMeta && setOpen((v) => !v)}
        className={`w-full flex items-center gap-4 px-3 py-2 text-left transition-colors ${hasMeta ? "hover:bg-[#FAFAFA]" : ""}`}
      >
        <span className="font-mono text-[11px] text-[#888888] w-40 truncate shrink-0">{run.job_id}</span>
        <RunStatusBadge status={run.status} />
        <span className="text-[11px] text-[#888888]">
          {run.records_processed != null ? `${run.records_processed} queued` : "—"}
        </span>
        {run.ended_at && <span className="text-[11px] text-[#888888]">ended {new Date(run.ended_at).toLocaleString()}</span>}
        {hasMeta && (
          <ChevronDown className={`size-3.5 text-[#888888] ml-auto transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {run.status === "failed" && run.error && (
        <div className="border-t border-[#F0F0F0] px-3 py-2 text-[11px] text-red-700 bg-red-50">{run.error}</div>
      )}

      {open && run.metadata && (
        <div className="border-t border-[#F0F0F0] px-3 py-3 bg-[#FAFAFA] space-y-2">
          <p className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
            <AlertCircle className="size-3.5 shrink-0 mt-px" />
            Queued/failed here only mean dispatch succeeded — config resolution happens per-job,
            later, inside the worker. A ticker can show &ldquo;queued&rdquo; here and still fail
            once picked up; check the job/Bull Board flow for the real per-ticker outcome.
          </p>
          <div className="flex gap-4 text-[11px] text-[#888888]">
            <span>Queued: <span className="text-[#0F172B] font-medium">{run.metadata.queued}</span></span>
            <span>No source: <span className="text-[#0F172B] font-medium">{run.metadata.noSource}</span></span>
            <span>Failed: <span className="text-[#0F172B] font-medium">{run.metadata.failed}</span></span>
          </div>
          {run.metadata.perTicker?.length > 0 && (
            <div className="rounded-md border border-[#E2E2E2] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Ticker</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Status</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Job ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0] bg-white">
                  {run.metadata.perTicker.map((p) => (
                    <tr key={p.ticker}>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-[#0F172B]">{p.ticker}</td>
                      <td className="px-3 py-1.5 text-[11px] text-[#888888]">{p.status ?? "—"}</td>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{p.jobId ?? "—"}</td>
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
        className="w-full flex items-center justify-between gap-2 rounded-md border border-[#E2E2E2] bg-white px-3 py-2 text-sm text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B] disabled:opacity-40"
      >
        <span className="truncate text-left">{label}</span>
        <ChevronDown className={`size-3.5 text-[#888888] shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && skills.length > 0 && (
        <div className="absolute z-[100] top-full mt-1 left-0 w-full min-w-[240px] rounded-md border border-[#E2E2E2] bg-white shadow-lg overflow-y-auto max-h-[280px]">
          <label className="flex items-center gap-1.5 px-3 py-2 border-b border-[#F0F0F0] cursor-pointer hover:bg-[#FAFAFA]">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded accent-[#0F172B]" />
            <span className="text-[12px] font-medium text-[#0F172B]">Select all ({skills.length})</span>
          </label>
          {skills.map((s) => (
            <label key={s.slug} className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-[#FAFAFA]">
              <input
                type="checkbox"
                checked={selected.includes(s.slug)}
                onChange={() => toggle(s.slug)}
                className="rounded accent-[#0F172B]"
              />
              <span className="text-[12px] text-[#0F172B]">{s.name}</span>
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

export function L2MultiDispatchTab() {
  // Picker options — L2-specific (skills, config keys, groups-with-config_key)
  const [skills, setSkills] = useState<L2Skill[]>([]);
  const [skillSlugs, setSkillSlugs] = useState<string[]>([]);
  const [configKeys, setConfigKeys] = useState<L2ConfigKeyOption[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyGroups, setCompanyGroups] = useState<L2CompanyGroupOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Company selection — owned by this tab only. L2 has no default ticker list, so start on Manual.
  const [source, setSource] = useState<TickerSource>("manual");
  const [tickers, setTickers] = useState<string[]>([]);
  const [groupSlug, setGroupSlug] = useState("");
  const [groupCounts, setGroupCounts] = useState<Record<string, number | "loading" | "error">>({});

  // Form state
  // Incremental (unchecked) is disabled for now — Historic mode is forced on and the checkbox is locked.
  const [historic, setHistoric] = useState(true);
  const [force, setForce] = useState(false);

  // Preview
  const [preview, setPreview] = useState<L2PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<L2SortSource>("transcript");
  const [multiSkillNotice, setMultiSkillNotice] = useState(false);
  const multiSkillNoticeShown = useRef(false);

  // CSV export
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Run trigger
  const [confirmArmed, setConfirmArmed] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRunIds, setActiveRunIds] = useState<string[]>([]);

  // Run history
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

  // Resolve live ticker counts for the group dropdown, lazily once "Saved group" is picked
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

  const sourceUsable = source !== "default"; // L2 has no default ticker list
  const selectedGroup = companyGroups.find((g) => g.slug === groupSlug);

  // Ticker-scope only — Historic/Force are Run-only (Preview ignores them per the backend contract),
  // so they're deliberately excluded here and mixed in separately at each call site below.
  const tickerBody = useMemo<Omit<L2DispatchOptions, "slug" | "historic" | "force">>(() => {
    const b: Omit<L2DispatchOptions, "slug" | "historic" | "force"> = {};
    if (source === "all") b.all = true;
    else if (source === "group" && groupSlug) b.groupSlug = groupSlug;
    else if (source === "manual" && tickers.length > 0) b.tickers = tickers;
    return b;
  }, [source, groupSlug, tickers]);

  // Two independent concepts, deliberately decoupled:
  //  - "preview mode" (previewKey): exactly what Preview queried — ticker scope + the first
  //    selected skill only, since /preview accepts one slug and ignores Historic/Force entirely.
  //    This is the ONLY thing that gates Run — toggling Historic/Force or picking additional skills
  //    never invalidates an already-matching preview.
  //  - "run mode" (skillSlugs + historic + force): every skill Run will actually dispatch to,
  //    concurrently, plus the Run-only flags.
  const previewSlug = skillSlugs[0];
  const previewKey = JSON.stringify({ ...tickerBody, previewSlug });
  const canPreview = sourceUsable && skillSlugs.length > 0 && !previewLoading;
  const canRun = sourceUsable && skillSlugs.length > 0 && previewedKey === previewKey && !previewLoading && !triggering && !isRunLive;

  function doPreview(targetPage = 1) {
    if (!previewSlug) return;
    if (skillSlugs.length > 1 && !multiSkillNoticeShown.current) {
      multiSkillNoticeShown.current = true;
      setMultiSkillNotice(true);
    }
    const key = previewKey;
    const reqBody = { ...tickerBody, slug: previewSlug, ...(targetPage > 1 ? { page: targetPage } : {}) };
    rawPost<L2PreviewResponse>(`${BASE}/preview`, {
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
    }, { ...tickerBody, slug: previewSlug }, `l2-preview-${previewSlug}.csv`);
  }

  // Fires one /run POST per selected skill concurrently (not one at a time) — all requests go out
  // in this same tick, and we wait for every one to settle before surfacing the result.
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
      rawPost<L2RunTriggerResponse>(`${BASE}/run`, {
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

  // Ascending = least-covered first, i.e. the most critical gap for the chosen source
  const rows = useMemo(
    () => [...(preview?.perTicker ?? [])].sort((a, b) => a[sortBy].total - b[sortBy].total),
    [preview, sortBy]
  );

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Intro */}
      <div className="rounded-md border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3">
        <p className="text-[13px] text-[#0F172B] font-medium">On-demand L2 skill dispatch</p>
        <p className="text-[12px] text-[#888888] mt-1">
          Runs a skill against the chosen ticker set — an untagged ticker hard-fails with a 400.
          Always Preview before Run. See Help (top right) for the full flow.
        </p>
      </div>

      {optionsError && !optionsLoading && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      {/* Config tag for the group selected above — full width, always editable even if already tagged */}
      {source === "group" && selectedGroup && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Group Config Tag</span>
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
      <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-4 space-y-4">
        <div>
          <label className={LABEL_CLS}>
            Skills {optionsLoading && <span className="normal-case tracking-normal font-normal">— loading…</span>}
          </label>
          <SkillMultiSelect skills={skills} selected={skillSlugs} onChange={setSkillSlugs} loading={optionsLoading} />
        </div>

        <div className="flex flex-wrap gap-6 pt-1 border-t border-[#F0F0F0]">
          <CheckboxField
            checked={historic}
            onChange={setHistoric}
            disabled
            label="Historic mode"
            hint="Runs the full base-context build instead of incremental. Run only — ignored by Preview. Incremental bulk dispatch is disabled for now, so this is locked on."
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
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {previewError}
        </div>
      )}
      {csvError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {csvError}
        </div>
      )}
      {runError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {runError}
        </div>
      )}

      {multiSkillNotice && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="size-4 shrink-0 mt-px" />
          <span className="flex-1">
            Preview only queries {skills.find((s) => s.slug === previewSlug)?.name ?? previewSlug} (the
            first selected skill) — Run will still dispatch all {skillSlugs.length} selected skills
            concurrently, each resolving its own per-ticker config.
          </span>
          <button onClick={() => setMultiSkillNotice(false)} className="text-amber-600 hover:text-amber-900 shrink-0">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => doPreview(1)}
          disabled={!canPreview}
          className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40"
        >
          {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
          Preview
        </button>

        <button
          onClick={doExportCsv}
          disabled={!sourceUsable || skillSlugs.length === 0 || csvLoading}
          title="CSV reports total signal coverage of any type per period — it does not filter to this skill's whitelist the way the JSON preview above does, so the numbers won't match exactly."
          className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40"
        >
          {csvLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Export CSV
        </button>

        <button
          onClick={handleRunClick}
          disabled={!canRun}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
            confirmArmed ? "bg-red-600 hover:opacity-90" : "bg-[#0F172B] hover:opacity-90"
          }`}
        >
          {triggering && <Loader2 className="size-3.5 animate-spin" />}
          {confirmArmed ? "Confirm dispatch" : "Run"}
        </button>

        {confirmArmed && (
          <button onClick={() => setConfirmArmed(false)} className="text-sm text-[#888888] hover:text-[#0F172B]">
            Cancel
          </button>
        )}

        <span className="text-[11px] text-[#888888]">
          {confirmArmed
            ? `This queues real jobs for ${skillSlugs.length} skill${skillSlugs.length === 1 ? "" : "s"} concurrently and can't be cancelled once started.`
            : previewedKey === previewKey
            ? "Preview matches current options — Run is enabled."
            : "Preview before running — options changed since the last preview."}
        </span>
      </div>
      <p className="text-[11px] text-[#888888] -mt-3">
        CSV numbers are total signal coverage (any type) per period — the JSON preview above counts
        only signals relevant to this skill&rsquo;s whitelist, so the two won&rsquo;t match exactly.
      </p>

      {previewLoading && (
        <div className="flex items-center gap-2 text-[12px] text-[#888888]">
          <Loader2 className="size-3.5 animate-spin" />
          Previewing…
        </div>
      )}

      {/* Active run banners — one per skill dispatched concurrently */}
      {activeRuns.length > 0 && (
        <div className="space-y-1.5">
          {activeRuns.map((r) => (
            <div key={r.job_id} className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Loader2 className="size-4 shrink-0 animate-spin" />
              Dispatching run {r.job_id}… check back under Run History.
            </div>
          ))}
        </div>
      )}

      {/* Preview results */}
      {preview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Preview</span>
              <span className="text-[10px] text-[#C8C8C8]">{preview.tickerCount} companies total</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {preview.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => doPreview(page - 1)}
                    disabled={page <= 1 || previewLoading || previewedKey !== previewKey}
                    className="flex items-center justify-center size-6 rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] disabled:opacity-40 disabled:hover:border-[#E2E2E2] disabled:hover:text-[#888888] transition-colors"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <span className="text-[11px] text-[#888888]">Page {preview.page} of {preview.totalPages}</span>
                  <button
                    onClick={() => doPreview(page + 1)}
                    disabled={page >= preview.totalPages || previewLoading || previewedKey !== previewKey}
                    className="flex items-center justify-center size-6 rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] disabled:opacity-40 disabled:hover:border-[#E2E2E2] disabled:hover:text-[#888888] transition-colors"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#888888]">Sort by least covered:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as L2SortSource)}
                  className="rounded-md border border-[#E2E2E2] px-2 py-1 text-[11px] text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B]"
                >
                  {(Object.keys(SORT_LABEL) as L2SortSource[]).map((s) => (
                    <option key={s} value={s}>{SORT_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {rows.map((row) => <PreviewTickerRow key={row.ticker} row={row} />)}
          </div>
        </div>
      )}

      {/* Run history */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Run History</span>
          <button
            onClick={loadRuns}
            disabled={runsLoading}
            className="flex items-center gap-1.5 text-[11px] text-[#888888] hover:text-[#0F172B] disabled:opacity-40"
          >
            {runsLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            Refresh
          </button>
        </div>

        {runsError && !runsLoading && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" /> {runsError}
          </div>
        )}

        {runs.length === 0 && !runsLoading && !runsError && (
          <p className="text-[12px] text-[#888888]">No runs yet.</p>
        )}

        <div className="space-y-1.5">
          {runs.map((run) => <RunHistoryRow key={run.job_id} run={run} />)}
        </div>
      </div>
    </div>
  );
}
