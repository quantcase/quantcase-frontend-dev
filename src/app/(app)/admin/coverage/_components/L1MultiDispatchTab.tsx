"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, AlertCircle, ChevronDown, CheckCircle2, XCircle, Clock, RefreshCw, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { rawFetch, rawPost, rawPostDownload } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { CompanySourcePicker } from "./CompanySourcePicker";
import {
  TickerSource,
  L1DispatchOptions,
  L1OptionsResponse,
  L1CompanyGroupOption,
  L1PreviewResponse,
  L1PreviewTicker,
  L1RunTriggerResponse,
  L1Run,
  L1RunsResponse,
} from "./types";

interface ResolveCountResponse {
  data: { tickers: string[]; count: number };
}

const BASE = `${BACKEND_URL}/admin/pipeline-dispatch/l1-multi`;

const INPUT_CLS =
  "rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-mono text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B]";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5";

// ── Small shared cells ───────────────────────────────────────────────────────

function BoolTick({ value }: { value: boolean }) {
  return (
    <span className={`text-[11px] font-medium ${value ? "text-emerald-600" : "text-red-600"}`}>
      {value ? "✓" : "✗"}
    </span>
  );
}

// ── Preview per-ticker row ───────────────────────────────────────────────────

function PreviewTickerRow({ t }: { t: L1PreviewTicker }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[8px] border border-[#F0F0F0] bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-3 py-2 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <span className="font-mono text-[12px] font-medium text-[#0F172B] w-24 shrink-0">{t.symbol}</span>
        <span className="text-[11px] text-[#888888]">
          Calls: <span className="text-[#0F172B] font-medium">{t.calls.shown}</span>/{t.calls.total}
        </span>
        <span className="text-[11px] text-[#888888]">
          Annual: <span className="text-[#0F172B] font-medium">{t.annualReports.shown}</span>/{t.annualReports.total}
        </span>
        <ChevronDown className={`size-3.5 text-[#888888] ml-auto transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-[#F0F0F0] px-3 py-3 bg-[#FAFAFA] space-y-3">
          {t.calls.items.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">Calls</div>
              <div className="rounded-md border border-[#E2E2E2] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F5F5F5] border-b border-[#F0F0F0]">
                      <th className="px-3 py-1 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]" rowSpan={2}>Year</th>
                      <th className="px-3 py-1 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]" rowSpan={2}>Quarter</th>
                      <th className="px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]" colSpan={2}>Transcript</th>
                      <th className="px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]" colSpan={2}>PPT</th>
                    </tr>
                    <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                      <th className="px-3 py-1.5 text-center text-[10px] font-medium text-[#888888]">Doc</th>
                      <th className="px-3 py-1.5 text-center text-[10px] font-medium text-[#888888]">Signal</th>
                      <th className="px-3 py-1.5 text-center text-[10px] font-medium text-[#888888]">Doc</th>
                      <th className="px-3 py-1.5 text-center text-[10px] font-medium text-[#888888]">Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0] bg-white">
                    {t.calls.items.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{c.fiscal_year}</td>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{c.quarter}</td>
                        <td className="px-3 py-1.5 text-center"><BoolTick value={c.hasTranscript} /></td>
                        <td className="px-3 py-1.5 text-center"><BoolTick value={c.hasTranscriptSignal} /></td>
                        <td className="px-3 py-1.5 text-center"><BoolTick value={c.hasPpt} /></td>
                        <td className="px-3 py-1.5 text-center"><BoolTick value={c.hasPptSignal} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {t.annualReports.items.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">Annual Reports</div>
              <div className="rounded-md border border-[#E2E2E2] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                      <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Year</th>
                      <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]">URL</th>
                      <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0] bg-white">
                    {t.annualReports.items.map((a) => (
                      <tr key={a.id}>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-[#888888]">{a.fiscal_year}</td>
                        <td className="px-3 py-1.5 text-center"><BoolTick value={a.hasUrl} /></td>
                        <td className="px-3 py-1.5 text-center"><BoolTick value={a.hasSignal} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Run status badge ─────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: L1Run["status"] }) {
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

function RunHistoryRow({ run }: { run: L1Run }) {
  const [open, setOpen] = useState(false);
  const hasMeta = !!run.metadata;

  return (
    <div className="rounded-[8px] border border-[#F0F0F0] bg-white overflow-hidden">
      <button
        onClick={() => hasMeta && setOpen((v) => !v)}
        className={`w-full flex items-center gap-4 px-3 py-2 text-left transition-colors ${hasMeta ? "hover:bg-[#FAFAFA]" : ""}`}
      >
        <span className="font-mono text-[11px] text-[#888888] w-40 truncate shrink-0">{run.id}</span>
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
        <div className="border-t border-[#F0F0F0] px-3 py-2 text-[11px] text-red-700 bg-red-50">
          {run.error}
          <span className="block text-red-500 mt-0.5">Partial progress before the failure was not rolled back.</span>
        </div>
      )}

      {open && run.metadata && (
        <div className="border-t border-[#F0F0F0] px-3 py-3 bg-[#FAFAFA] space-y-2">
          <div className="flex gap-4 text-[11px] text-[#888888]">
            <span>Queued: <span className="text-[#0F172B] font-medium">{run.metadata.queued}</span></span>
            <span>Skipped: <span className="text-[#0F172B] font-medium">{run.metadata.skipped}</span></span>
            <span>No source: <span className="text-[#0F172B] font-medium">{run.metadata.noSource}</span></span>
            <span>Failed: <span className="text-[#0F172B] font-medium">{run.metadata.failed}</span></span>
          </div>
          {run.metadata.perTicker?.length > 0 && (
            <div className="rounded-md border border-[#E2E2E2] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Ticker</th>
                    <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Queued</th>
                    <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Skipped</th>
                    <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]">No Source</th>
                    <th className="px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Failed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0] bg-white">
                  {run.metadata.perTicker.map((p) => (
                    <tr key={p.symbol}>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-[#0F172B]">{p.symbol}</td>
                      <td className="px-3 py-1.5 text-center text-[11px] text-[#0F172B]">{p.queued}</td>
                      <td className="px-3 py-1.5 text-center text-[11px] text-[#0F172B]">{p.skipped}</td>
                      <td className="px-3 py-1.5 text-center text-[11px] text-[#0F172B]">{p.noSource}</td>
                      <td className="px-3 py-1.5 text-center text-[11px] text-red-600">{p.failed}</td>
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

// ── Main tab ───────────────────────────────────────────────────────────────

export function L1MultiDispatchTab() {
  // Picker options
  const [defaultTickers, setDefaultTickers] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyGroups, setCompanyGroups] = useState<L1CompanyGroupOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Company selection — owned by this tab only
  const [source, setSource] = useState<TickerSource>("default");
  const [tickers, setTickers] = useState<string[]>([]);
  const [groupSlug, setGroupSlug] = useState<string>("");
  const [groupCounts, setGroupCounts] = useState<Record<string, number | "loading" | "error">>({});

  // Form state
  const [startFrom, setStartFrom] = useState("");
  const [limit, setLimit] = useState("");
  const [latest, setLatest] = useState("");
  const [force, setForce] = useState(false);
  const [arOnly, setArOnly] = useState(false);
  const [noAr, setNoAr] = useState(false);

  // Preview
  const [preview, setPreview] = useState<L1PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // CSV export
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Run trigger
  const [confirmArmed, setConfirmArmed] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Run history
  const [runs, setRuns] = useState<L1Run[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);

  // ── Load picker options ──────────────────────────────────────────────────

  useEffect(() => {
    rawFetch<L1OptionsResponse>(`${BASE}/options`, {
      onStart: () => { setOptionsLoading(true); setOptionsError(null); },
      onSuccess: (res) => {
        setDefaultTickers(res.defaultTickers ?? []);
        setCompanies(res.companies ?? []);
        setCompanyGroups(res.companyGroups ?? []);
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

  // ── Run history ──────────────────────────────────────────────────────────

  const loadRuns = useCallback(() => {
    rawFetch<L1RunsResponse>(`${BASE}/runs?limit=20`, {
      onStart: () => setRunsLoading(true),
      onSuccess: (res) => setRuns(res.runs ?? []),
      onError: setRunsError,
      onComplete: () => setRunsLoading(false),
    });
  }, []);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  // Still "live" until the polled history confirms the run has left the running state
  const isRunLive = !!activeRunId && (!activeRun || activeRun.status === "running");

  // Poll while a run is live
  useEffect(() => {
    if (!isRunLive) return;
    const iv = setInterval(loadRuns, 2000);
    return () => clearInterval(iv);
  }, [isRunLive, loadRuns]);

  // ── Options body ─────────────────────────────────────────────────────────

  const body = useMemo<L1DispatchOptions>(() => {
    const b: L1DispatchOptions = {};
    if (source === "all") {
      b.all = true;
    } else if (source === "group" && groupSlug) {
      b.groupSlug = groupSlug;
    } else if (source === "manual" && tickers.length > 0) {
      b.tickers = tickers;
    }
    if (startFrom.trim()) b.startFrom = startFrom.trim().toUpperCase();
    if (limit.trim()) b.limit = Number(limit);
    if (latest.trim()) b.latest = Number(latest);
    if (force) b.force = true;
    if (arOnly) b.arOnly = true;
    if (noAr) b.noAr = true;
    return b;
  }, [source, groupSlug, tickers, startFrom, limit, latest, force, arOnly, noAr]);

  const bodyKey = JSON.stringify(body);
  const canRun = previewedKey === bodyKey && !previewLoading && !triggering && !isRunLive;

  // page is separate from `body`/`bodyKey` — it only affects this /preview request, never /run or
  // /preview/csv, so paging back and forth never invalidates the Run-enabling previewedKey match.
  function doPreview(targetPage = 1) {
    const key = bodyKey;
    const reqBody = targetPage > 1 ? { ...body, page: targetPage } : body;
    rawPost<L1PreviewResponse>(`${BASE}/preview`, {
      onStart: () => { setPreviewLoading(true); setPreviewError(null); },
      onSuccess: (res) => { setPreview(res); setPreviewedKey(key); setPage(targetPage); },
      onError: setPreviewError,
      onComplete: () => setPreviewLoading(false),
    }, reqBody);
  }

  function doExportCsv() {
    rawPostDownload(`${BASE}/preview/csv`, {
      onStart: () => { setCsvLoading(true); setCsvError(null); },
      onError: setCsvError,
      onComplete: () => setCsvLoading(false),
    }, body, "l1-preview.csv");
  }

  function handleRunClick() {
    if (!confirmArmed) { setConfirmArmed(true); return; }
    rawPost<L1RunTriggerResponse>(`${BASE}/run`, {
      onStart: () => { setTriggering(true); setRunError(null); },
      onSuccess: (res) => { setActiveRunId(res.run_id); setConfirmArmed(false); loadRuns(); },
      onError: setRunError,
      onComplete: () => setTriggering(false),
    }, body);
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Intro */}
      <div className="rounded-md border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3">
        <p className="text-[13px] text-[#0F172B] font-medium">On-demand L1 extraction</p>
        <p className="text-[12px] text-[#888888] mt-1">
          Transcript, PPT, and annual-report signal extraction for a chosen ticker set. Preview is
          free to repeat; Run dispatches real, billable jobs. See Help (top right) for the full flow.
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
        defaultTickerCount={defaultTickers.length}
        groupSlug={groupSlug}
        onGroupSlugChange={setGroupSlug}
        companyGroups={companyGroups}
        groupCounts={groupCounts}
        loading={optionsLoading}
      />

      {/* L1-specific extraction options */}
      <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLS}>Start From</label>
            <input
              value={startFrom}
              onChange={(e) => setStartFrom(e.target.value.toUpperCase())}
              placeholder="e.g. MSUMI"
              className={`${INPUT_CLS} w-full uppercase`}
            />
            <p className="text-[11px] text-[#888888] mt-1">Alphabetical cursor — resume a long run.</p>
          </div>
          <div>
            <label className={LABEL_CLS}>Limit</label>
            <input
              type="number"
              min={1}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="all history"
              className={`${INPUT_CLS} w-full`}
            />
            <p className="text-[11px] text-[#888888] mt-1">Most-recent calls/reports considered.</p>
          </div>
          <div>
            <label className={LABEL_CLS}>Latest</label>
            <input
              type="number"
              min={1}
              value={latest}
              onChange={(e) => setLatest(e.target.value)}
              placeholder="—"
              className={`${INPUT_CLS} w-full`}
            />
            <p className="text-[11px] text-[#888888] mt-1">Takes precedence over Limit if both set.</p>
          </div>
        </div>
        <p className="text-[11px] text-[#888888]">
          Leave Limit and Latest blank and Preview shows only the 20 most recent calls per ticker
          (the total count is still shown alongside) — set either one explicitly to look further back.
        </p>

        <div className="flex flex-wrap gap-6 pt-1 border-t border-[#F0F0F0]">
          <CheckboxField
            checked={force}
            onChange={setForce}
            label="Force re-extract"
            hint="Re-run tickers that already have extracted signals (discards the old ones). Off by default."
          />
          <CheckboxField
            checked={arOnly}
            onChange={(v) => { setArOnly(v); if (v) setNoAr(false); }}
            label="Annual reports only"
            hint="Skips transcript and PPT entirely."
          />
          <CheckboxField
            checked={noAr}
            onChange={(v) => { setNoAr(v); if (v) setArOnly(false); }}
            label="Skip annual reports"
            hint="Skips annual reports entirely."
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

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => doPreview(1)}
          disabled={previewLoading}
          className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40"
        >
          {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
          Preview
        </button>

        <button
          onClick={doExportCsv}
          disabled={csvLoading}
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
          <button
            onClick={() => setConfirmArmed(false)}
            className="text-sm text-[#888888] hover:text-[#0F172B]"
          >
            Cancel
          </button>
        )}

        <span className="text-[11px] text-[#888888]">
          {confirmArmed
            ? "This queues real extraction jobs and can't be cancelled once started."
            : previewedKey === bodyKey
            ? "Preview matches current options — Run is enabled."
            : "Preview before running — options changed since the last preview."}
        </span>
      </div>
      <p className="text-[11px] text-[#888888] -mt-3">
        CSV export always covers full uncapped history — Limit, Latest, AR-only, and Skip AR are
        ignored for the export.
      </p>

      {/* Active run banner */}
      {activeRun && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Loader2 className="size-4 shrink-0 animate-spin" />
          Dispatching run {activeRun.id}… this can take a while for large ticker sets. You can
          navigate away — check back under Run History.
        </div>
      )}

      {/* Preview results */}
      {preview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Preview</span>
              <span className="text-[10px] text-[#C8C8C8]">{preview.tickerCount} companies total</span>
            </div>
            {preview.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => doPreview(page - 1)}
                  disabled={page <= 1 || previewLoading || previewedKey !== bodyKey}
                  className="flex items-center justify-center size-6 rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] disabled:opacity-40 disabled:hover:border-[#E2E2E2] disabled:hover:text-[#888888] transition-colors"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-[11px] text-[#888888]">Page {preview.page} of {preview.totalPages}</span>
                <button
                  onClick={() => doPreview(page + 1)}
                  disabled={page >= preview.totalPages || previewLoading || previewedKey !== bodyKey}
                  className="flex items-center justify-center size-6 rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] disabled:opacity-40 disabled:hover:border-[#E2E2E2] disabled:hover:text-[#888888] transition-colors"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {preview.perTicker.map((t) => (
              <PreviewTickerRow key={t.symbol} t={t} />
            ))}
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
          {runs.map((run) => (
            <RunHistoryRow key={run.id} run={run} />
          ))}
        </div>
      </div>
    </div>
  );
}
