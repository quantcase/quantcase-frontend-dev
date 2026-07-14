"use client";

import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, AlertCircle, ChevronDown, CheckCircle2, XCircle, Clock, RefreshCw, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { rawFetch, rawPost, rawPostDownload } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { CompanySourcePicker } from "./CompanySourcePicker";
import {
  TickerSource,
  L3LayerId,
  L3DispatchOptions,
  L3OptionsResponse,
  L3PreviewResponse,
  L3PreviewTickerRow,
  L3RunTriggerResponse,
  L3Run,
  L3RunTickerSummary,
  L3RunsResponse,
} from "./types";

interface ResolveCountResponse {
  data: { tickers: string[]; count: number };
}

const BASE = `${BACKEND_URL}/admin/pipeline-dispatch/l3-multi`;

const INPUT_CLS =
  "rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-mono text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B]";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5";

const LAYER_OPTIONS: { id: L3LayerId; label: string }[] = [
  { id: "l3", label: "L3 — Lens Verdicts" },
  { id: "l4", label: "L4 — Summary" },
];

function humanize(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Preview per-ticker row ───────────────────────────────────────────────────

function TypeAvailabilityBlock({ t }: { t: L3PreviewTickerRow["types"][number] }) {
  return (
    <div className="rounded-md border border-[#E2E2E2] bg-white px-3 py-2 space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-[#0F172B]">{humanize(t.type)}</span>
        {t.ready ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <CheckCircle2 className="size-3" /> Ready
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-medium text-red-600">
            <XCircle className="size-3" /> Not ready
          </span>
        )}
      </div>
      {t.available.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {t.available.map((a) => (
            <span key={a} className="rounded-sm bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-700">
              {a}
            </span>
          ))}
        </div>
      )}
      {t.missing.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {t.missing.map((m) => (
            <span key={m} className="rounded-sm bg-[#F5F5F5] border border-[#E2E2E2] px-1.5 py-0.5 text-[10px] text-[#888888]">
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewTickerRow({ row }: { row: L3PreviewTickerRow }) {
  const [open, setOpen] = useState(false);
  const readyCount = row.types.filter((t) => t.ready).length;

  return (
    <div className="rounded-[8px] border border-[#F0F0F0] bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-3 py-2 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <span className="font-mono text-[12px] font-medium text-[#0F172B] w-24 shrink-0">{row.ticker}</span>
        <span className="text-[11px] text-[#888888]">
          Ready: <span className="text-[#0F172B] font-medium">{readyCount}</span>/{row.types.length}
        </span>
        <div className="flex gap-1">
          {row.types.map((t) => (
            <span
              key={t.type}
              title={`${humanize(t.type)} — ${t.ready ? "ready" : "not ready"}`}
              className={`size-2 rounded-full ${t.ready ? "bg-emerald-500" : "bg-red-400"}`}
            />
          ))}
        </div>
        <ChevronDown className={`size-3.5 text-[#888888] ml-auto transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-[#F0F0F0] px-3 py-3 bg-[#FAFAFA] grid grid-cols-1 sm:grid-cols-2 gap-2">
          {row.types.map((t) => (
            <TypeAvailabilityBlock key={t.type} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Run status badge ─────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: L3Run["status"] }) {
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

function TickerRunDetail({ p }: { p: L3RunTickerSummary }) {
  if (p.status === "failed") {
    return <div className="text-[11px] text-red-700">{p.error}</div>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {(p.jobs ?? []).map((j) => (
        <span key={j.jobId} className="rounded-sm bg-white border border-[#E2E2E2] px-1.5 py-0.5 text-[10px] text-[#888888]">
          <span className="font-medium text-[#0F172B]">{humanize(j.type)}</span> — {j.jobId}
        </span>
      ))}
    </div>
  );
}

function RunHistoryRow({ run }: { run: L3Run }) {
  const [open, setOpen] = useState(false);
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const hasMeta = !!run.metadata;

  return (
    <div className="rounded-[8px] border border-[#F0F0F0] bg-white overflow-hidden">
      <button
        onClick={() => hasMeta && setOpen((v) => !v)}
        className={`w-full flex items-center gap-4 px-3 py-2 text-left transition-colors ${hasMeta ? "hover:bg-[#FAFAFA]" : ""}`}
      >
        <span className="font-mono text-[11px] text-[#888888] w-40 truncate shrink-0">{run.id}</span>
        <RunStatusBadge status={run.status} />
        {run.metadata && (
          <span className="text-[11px] text-[#888888] uppercase">{run.metadata.layerId}</span>
        )}
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
          <div className="flex gap-4 text-[11px] text-[#888888]">
            <span>Types: <span className="text-[#0F172B] font-medium">{run.metadata.types.map(humanize).join(", ")}</span></span>
            <span>Queued: <span className="text-[#0F172B] font-medium">{run.metadata.queued}</span></span>
            <span>Failed: <span className="text-[#0F172B] font-medium">{run.metadata.failed}</span></span>
          </div>
          {run.metadata.perTicker?.length > 0 && (
            <div className="rounded-md border border-[#E2E2E2] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Ticker</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0] bg-white">
                  {run.metadata.perTicker.map((p) => {
                    const rowOpen = expandedTicker === p.ticker;
                    return (
                      <Fragment key={p.ticker}>
                        <tr>
                          <td className="px-3 py-1.5 font-mono text-[11px] text-[#0F172B]">{p.ticker}</td>
                          <td className="px-3 py-1.5 text-[11px]">
                            <button
                              onClick={() => setExpandedTicker(rowOpen ? null : p.ticker)}
                              className={`inline-flex items-center gap-0.5 font-medium hover:underline ${
                                p.status === "failed" ? "text-red-600" : "text-[#0F172B]"
                              }`}
                            >
                              {p.status}
                              <ChevronDown className={`size-3 transition-transform duration-150 ${rowOpen ? "rotate-180" : ""}`} />
                            </button>
                          </td>
                        </tr>
                        {rowOpen && (
                          <tr>
                            <td colSpan={2} className="border-t border-[#F0F0F0] bg-[#FAFAFA] px-3 py-2">
                              <TickerRunDetail p={p} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
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

export function L3MultiDispatchTab() {
  // Picker options
  const [defaultTickers, setDefaultTickers] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyGroups, setCompanyGroups] = useState<L3OptionsResponse["companyGroups"]>([]);
  const [layerTypes, setLayerTypes] = useState<Record<L3LayerId, string[]>>({ l3: [], l4: [] });
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Company selection — owned by this tab only
  const [source, setSource] = useState<TickerSource>("default");
  const [tickers, setTickers] = useState<string[]>([]);
  const [groupSlug, setGroupSlug] = useState("");
  const [groupCounts, setGroupCounts] = useState<Record<string, number | "loading" | "error">>({});

  // Form state
  const [layerId, setLayerId] = useState<L3LayerId>("l3");
  const [types, setTypes] = useState<string[]>([]);
  const [startFrom, setStartFrom] = useState("");
  const [force, setForce] = useState(false);

  // Preview
  const [preview, setPreview] = useState<L3PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewedKey, setPreviewedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showNotReadyFirst, setShowNotReadyFirst] = useState(true);

  // CSV export
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Run trigger
  const [confirmArmed, setConfirmArmed] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Run history
  const [runs, setRuns] = useState<L3Run[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);

  useEffect(() => {
    rawFetch<L3OptionsResponse>(`${BASE}/options`, {
      onStart: () => { setOptionsLoading(true); setOptionsError(null); },
      onSuccess: (res) => {
        setDefaultTickers(res.defaultTickers ?? []);
        setCompanies(res.companies ?? []);
        setCompanyGroups(res.companyGroups ?? []);
        setLayerTypes(res.layerTypes ?? { l3: [], l4: [] });
      },
      onError: setOptionsError,
      onComplete: () => setOptionsLoading(false),
    });
  }, []);

  // Selecting all of a layer's types by default once options load, and whenever layer changes
  useEffect(() => {
    setTypes(layerTypes[layerId] ?? []);
  }, [layerId, layerTypes]);

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
    rawFetch<L3RunsResponse>(`${BASE}/runs?limit=20`, {
      onStart: () => setRunsLoading(true),
      onSuccess: (res) => setRuns(res.runs ?? []),
      onError: setRunsError,
      onComplete: () => setRunsLoading(false),
    });
  }, []);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null;
  const isRunLive = !!activeRunId && (!activeRun || activeRun.status === "running");

  useEffect(() => {
    if (!isRunLive) return;
    const iv = setInterval(loadRuns, 2000);
    return () => clearInterval(iv);
  }, [isRunLive, loadRuns]);

  const availableTypes = layerTypes[layerId] ?? [];

  function toggleType(t: string) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  const body = useMemo<L3DispatchOptions>(() => {
    const b: L3DispatchOptions = { layerId };
    if (types.length > 0 && types.length < availableTypes.length) b.types = types;
    if (source === "all") b.all = true;
    else if (source === "group" && groupSlug) b.groupSlug = groupSlug;
    else if (source === "manual" && tickers.length > 0) b.tickers = tickers;
    if (startFrom.trim()) b.startFrom = startFrom.trim().toUpperCase();
    if (force) b.force = true;
    return b;
  }, [layerId, types, availableTypes.length, source, groupSlug, tickers, startFrom, force]);

  const bodyKey = JSON.stringify(body);
  const canPreview = types.length > 0 && !previewLoading;
  const canRun = types.length > 0 && !previewLoading && !triggering && !isRunLive;

  function doPreview(targetPage = 1) {
    if (types.length === 0) return;
    const key = bodyKey;
    const reqBody = targetPage > 1 ? { ...body, page: targetPage } : body;
    rawPost<L3PreviewResponse>(`${BASE}/preview`, {
      onStart: () => { setPreviewLoading(true); setPreviewError(null); },
      onSuccess: (res) => { setPreview(res); setPreviewedKey(key); setPage(targetPage); },
      onError: setPreviewError,
      onComplete: () => setPreviewLoading(false),
    }, reqBody);
  }

  function doExportCsv() {
    if (types.length === 0) return;
    rawPostDownload(`${BASE}/preview/csv`, {
      onStart: () => { setCsvLoading(true); setCsvError(null); },
      onError: setCsvError,
      onComplete: () => setCsvLoading(false),
    }, body, `l3-multi-${layerId}-preview.csv`);
  }

  function handleRunClick() {
    if (!confirmArmed) { setConfirmArmed(true); return; }
    rawPost<L3RunTriggerResponse>(`${BASE}/run`, {
      onStart: () => { setTriggering(true); setRunError(null); },
      onSuccess: (res) => { setActiveRunId(res.run_id); setConfirmArmed(false); loadRuns(); },
      onError: setRunError,
      onComplete: () => setTriggering(false),
    }, body);
  }

  const rows = useMemo(() => {
    const list = preview?.perTicker ?? [];
    if (!showNotReadyFirst) return list;
    return [...list].sort((a, b) => {
      const aReady = a.types.filter((t) => t.ready).length;
      const bReady = b.types.filter((t) => t.ready).length;
      return aReady - bReady;
    });
  }, [preview, showNotReadyFirst]);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Intro */}
      <div className="rounded-md border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3">
        <p className="text-[13px] text-[#0F172B] font-medium">On-demand L3/L4 dispatch</p>
        <p className="text-[12px] text-[#888888] mt-1">
          Bulk-enqueues management/opportunity/deal lens analysis (L3) or the top-level summary (L4)
          for a chosen ticker set. Preview only checks whether the backing signals a ticker needs
          already exist — it&rsquo;s not a full prompt build, so it stays fast at 100+ tickers.
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

      {/* L3/L4-specific dispatch options */}
      <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-4 space-y-4">
        <div>
          <label className={LABEL_CLS}>Layer</label>
          <div className="inline-flex rounded-md border border-[#E2E2E2] p-0.5 bg-[#F5F5F5]">
            {LAYER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLayerId(opt.id)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                  layerId === opt.id ? "bg-white text-[#0F172B] shadow-sm" : "text-[#888888] hover:text-[#0F172B]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={LABEL_CLS}>
            Types {optionsLoading && <span className="normal-case tracking-normal font-normal">— loading…</span>}
          </label>
          {availableTypes.length === 0 && !optionsLoading ? (
            <p className="text-[12px] text-[#888888]">No types available for this layer.</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {availableTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    types.includes(t)
                      ? "border-[#0F172B] bg-[#0F172B] text-white"
                      : "border-[#E2E2E2] text-[#0F172B] hover:border-[#0F172B]"
                  }`}
                >
                  {humanize(t)}
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-[#888888] mt-1.5">
            Omitting a type entirely (leave all checked) dispatches every valid type for this layer.
          </p>
        </div>

        <div>
          <label className={LABEL_CLS}>Start From</label>
          <input
            value={startFrom}
            onChange={(e) => setStartFrom(e.target.value.toUpperCase())}
            placeholder="e.g. MSUMI"
            className={`${INPUT_CLS} w-full max-w-xs uppercase`}
          />
          <p className="text-[11px] text-[#888888] mt-1">Alphabetical cursor — resume a long run over &ldquo;All companies&rdquo;.</p>
        </div>

        <div className="flex flex-wrap gap-6 pt-1 border-t border-[#F0F0F0]">
          <CheckboxField
            checked={force}
            onChange={setForce}
            label="Force refresh"
            hint="Bypasses the cached result. Run only — ignored by Preview."
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
          disabled={!canPreview}
          className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40"
        >
          {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
          Preview
        </button>

        <button
          onClick={doExportCsv}
          disabled={types.length === 0 || csvLoading}
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
            ? "This queues real jobs (one per ticker, fanning out across the selected types) and can't be cancelled once started."
            : "Preview is optional — Run dispatches with the current options whether or not you've previewed them."}
        </span>
      </div>

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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Preview</span>
              <span className="text-[10px] text-[#C8C8C8]">{preview.tickerCount} companies total</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
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
              <label className="flex items-center gap-1.5 text-[11px] text-[#888888] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNotReadyFirst}
                  onChange={(e) => setShowNotReadyFirst(e.target.checked)}
                  className="accent-[#0F172B]"
                />
                Not-ready first
              </label>
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
          {runs.map((run) => <RunHistoryRow key={run.id} run={run} />)}
        </div>
      </div>
    </div>
  );
}
