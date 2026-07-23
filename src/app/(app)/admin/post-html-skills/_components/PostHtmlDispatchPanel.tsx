"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, X, Play, Loader2, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch, rawPost, authFetch } from "@/lib/api";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { TickerSearch, TickerOption } from "../../html-skills/_components/TickerSearch";
import { FAVORITE_TICKERS } from "../../html-skills/_components/types";
import {
  PostHtmlLayer,
  PostHtmlType,
  L3_TYPES,
  POST_HTML_TYPE_LABELS,
  PostHtmlEnqueueBody,
  PostHtmlEnqueueResponse,
  PostHtmlResultsResponse,
  PostHtmlResult,
  TrackedJob,
} from "./types";
import { ResultCard } from "./ResultCard";

const API = `${BACKEND_URL}/api/post-html-analysis`;
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";
const POLL_MS = 2000;
const JOB_TIMEOUT_MS = 3 * 60 * 1000; // give up watching a job after 3 min of no matching result

interface StocksApiResponseLite {
  data?: { company: string; company_name?: string }[];
}

/**
 * PostHtmlDispatchPanel — on-demand L3/L4 post-HTML analysis dispatch.
 * Self-contained: owns its own ticker selection and results.
 */
export function PostHtmlDispatchPanel() {
  const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
  const [ticker, setTicker] = useState<string | null>(null);

  const [layer, setLayer] = useState<PostHtmlLayer>("l3");
  const [types, setTypes] = useState<PostHtmlType[]>([...L3_TYPES]);
  const [fiscalYear, setFiscalYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);

  const [enqueuing, setEnqueuing] = useState(false);
  const [enqueueError, setEnqueueError] = useState<string | null>(null);
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);

  const [results, setResults] = useState<PostHtmlResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // L4 has exactly one implicit type (summary) — reset type selection when switching layer.
  function handleLayerChange(next: PostHtmlLayer) {
    setLayer(next);
    setTypes(next === "l3" ? [...L3_TYPES] : []);
  }

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/transcript/stocks`)
      .then(async (res) => {
        const json: StocksApiResponseLite = await res.json();
        setTickerOptions((json.data ?? []).map((s) => ({ symbol: s.company, name: s.company_name || s.company })));
      })
      .catch(() => {});
  }, []);

  const loadResults = useCallback(() => {
    if (!ticker) return;
    const params = new URLSearchParams({ ticker, layer_id: layer });
    rawFetch<PostHtmlResultsResponse>(`${API}?${params}`, {
      onStart: () => { setResultsLoading(true); setResultsError(null); setResults([]); },
      onSuccess: (res) => setResults(res.data?.results ?? []),
      onError: setResultsError,
      onComplete: () => setResultsLoading(false),
    });
  }, [ticker, layer]);

  useEffect(() => { loadResults(); }, [loadResults]);

  // ── Poll while any job is pending: re-fetch results and mark tracked jobs done once a fresher row appears ─

  useEffect(() => {
    const hasPending = trackedJobs.some((j) => j.status === "pending");
    if (!hasPending || !ticker) return;
    const iv = setInterval(() => {
      const params = new URLSearchParams({ ticker, layer_id: layer });
      rawFetch<PostHtmlResultsResponse>(`${API}?${params}`, {
        onSuccess: (res) => {
          const rows = res.data?.results ?? [];
          setResults(rows);
          setTrackedJobs((prev) =>
            prev.map((j) => {
              if (j.status !== "pending") return j;
              const row = rows.find((r) => r.type === j.type);
              const fresh = row && row.updated_at !== j.baselineUpdatedAt;
              if (fresh) return { ...j, status: "done" as const };
              if (Date.now() - j.enqueuedAt > JOB_TIMEOUT_MS) return { ...j, status: "timeout" as const };
              return j;
            })
          );
        },
        onError: () => {},
      });
    }, POLL_MS);
    return () => clearInterval(iv);
  }, [trackedJobs, ticker, layer]);

  function toggleType(t: PostHtmlType) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleEnqueue() {
    if (!ticker) return;
    const body: PostHtmlEnqueueBody = { ticker, layer_id: layer };
    if (layer === "l3" && types.length > 0 && types.length < L3_TYPES.length) body.types = types;
    if (fiscalYear.trim()) body.fiscal_year = fiscalYear.trim();
    if (quarter.trim()) body.quarter = quarter.trim();
    if (forceRefresh) body.forceRefresh = true;

    rawPost<PostHtmlEnqueueResponse>(API, {
      onStart: () => { setEnqueuing(true); setEnqueueError(null); },
      onSuccess: (res) => {
        const baseline = new Map(results.map((r) => [r.type, r.updated_at]));
        const now = Date.now();
        const newJobs: TrackedJob[] = (res.jobs ?? []).map((j) => ({
          type: j.type,
          jobId: j.jobId,
          bullmqId: j.bullmqId,
          enqueuedAt: now,
          status: "pending",
          baselineUpdatedAt: baseline.get(j.type) ?? null,
        }));
        setTrackedJobs((prev) => [...newJobs, ...prev.filter((j) => !newJobs.some((n) => n.type === j.type))]);
      },
      onError: setEnqueueError,
      onComplete: () => setEnqueuing(false),
    }, body);
  }

  const canEnqueue = !!ticker && !enqueuing && (layer === "l4" || types.length > 0);
  const pendingCount = trackedJobs.filter((j) => j.status === "pending").length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Intro */}
        <div className="rounded-md border border-hair bg-secondary px-4 py-3">
          <p className="text-[13px] text-ink font-medium">On-demand post-HTML analysis dispatch</p>
          <p className="text-[12px] text-ink-3 mt-1">
            Enqueues an LLM analysis job per type against the most recent HTML available for each lens.
            There&rsquo;s no dedicated job-status endpoint for this queue yet — this page polls the results
            endpoint below and treats a fresh <code>updated_at</code> as &ldquo;done&rdquo;. L4 requires at
            least one L3 type to have run first.
          </p>
        </div>

        {/* Ticker + layer */}
        <div className="rounded-[10px] border border-hair bg-card p-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className={LABEL_CLS}>Ticker</label>
              <TickerSearch value={ticker} onChange={setTicker} options={tickerOptions} favorites={[...FAVORITE_TICKERS]} />
            </div>
            <div>
              <label className={LABEL_CLS}>Layer</label>
              <TabToggle variant="outline" options={["L3", "L4"]} value={layer.toUpperCase()} onChange={(v) => handleLayerChange(v.toLowerCase() as PostHtmlLayer)} />
            </div>
          </div>

          {layer === "l3" && (
            <div>
              <label className={LABEL_CLS}>Types <span className="normal-case tracking-normal font-normal text-ink-3">— omit all to default to all three</span></label>
              <div className="flex gap-5 flex-wrap">
                {L3_TYPES.map((t) => (
                  <CheckboxField key={t} checked={types.includes(t)} onChange={() => toggleType(t)} label={POST_HTML_TYPE_LABELS[t]} />
                ))}
              </div>
            </div>
          )}

          {layer === "l4" && (
            <p className="text-[12px] text-ink-3">
              L4 has a single implicit type (<span className="font-medium text-ink">summary</span>) —
              no type selection needed.
            </p>
          )}

          <div className="flex items-end gap-3 flex-wrap pt-1 border-t border-hair">
            <div>
              <label className={LABEL_CLS}>Fiscal year <span className="normal-case tracking-normal font-normal">(optional)</span></label>
              <input
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                placeholder="FY2026"
                className="w-28 rounded-md border border-hair bg-card px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-hair-strong"
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Quarter <span className="normal-case tracking-normal font-normal">(optional)</span></label>
              <input
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                placeholder="Q3"
                className="w-20 rounded-md border border-hair bg-card px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-hair-strong"
              />
            </div>
            <CheckboxField
              checked={forceRefresh}
              onChange={setForceRefresh}
              label="Force refresh"
              hint="Bypasses cache — re-runs the LLM even if inputs are unchanged."
            />
          </div>
        </div>

        {enqueueError && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
            <AlertCircle className="size-4 shrink-0" /> {enqueueError}
            <button onClick={() => setEnqueueError(null)} className="ml-auto text-down hover:text-down"><X className="size-4" /></button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleEnqueue}
            disabled={!canEnqueue}
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {enqueuing ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Enqueue {layer.toUpperCase()} analysis
          </button>
          {!ticker && <span className="text-[11px] text-ink-3">Select a ticker first</span>}
        </div>

        {/* Tracked jobs */}
        {trackedJobs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                Enqueued jobs {pendingCount > 0 && `(${pendingCount} pending)`}
              </span>
            </div>
            <div className="space-y-1.5">
              {trackedJobs.map((j) => (
                <div key={j.jobId} className="flex items-center gap-3 rounded-md border border-hair bg-card px-3 py-2">
                  {j.status === "pending" && <Loader2 className="size-3.5 text-blue animate-spin shrink-0" />}
                  {j.status === "done" && <CheckCircle2 className="size-3.5 text-up shrink-0" />}
                  {j.status === "timeout" && <Clock className="size-3.5 text-warn shrink-0" />}
                  <span className="text-[12px] font-medium text-ink w-24 shrink-0">{POST_HTML_TYPE_LABELS[j.type] ?? j.type}</span>
                  <span className="font-mono text-[11px] text-ink-3 truncate">{j.jobId}</span>
                  <span className="text-[11px] text-ink-3 ml-auto shrink-0">
                    {j.status === "pending" ? "watching for result…" : j.status === "done" ? "result updated" : "no update yet — check worker logs"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
              Results {layer.toUpperCase()} {ticker ? `— ${ticker}` : ""}
            </span>
            <button
              onClick={loadResults}
              disabled={resultsLoading || !ticker}
              className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
            >
              {resultsLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Refresh
            </button>
          </div>

          {resultsError && !resultsLoading && (
            <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
              <AlertCircle className="size-4 shrink-0" /> {resultsError}
            </div>
          )}

          {!ticker && <p className="text-[12px] text-ink-3">Select a ticker to view results.</p>}
          {ticker && results.length === 0 && !resultsLoading && !resultsError && (
            <p className="text-[12px] text-ink-3">
              No results yet — either nothing has been enqueued, or the job hasn&rsquo;t completed. This
              endpoint doesn&rsquo;t surface a distinct &ldquo;pending&rdquo; state.
            </p>
          )}

          <div className="space-y-2">
            {results.map((r) => <ResultCard key={r.id} result={r} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
