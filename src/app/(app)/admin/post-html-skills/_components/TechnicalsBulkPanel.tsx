"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  AlertCircle, X, Play, Loader2, CheckCircle2, XCircle, ChevronDown, RotateCcw,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthPost, rawFetch, authFetch } from "@/lib/api";
import { normalizeTechnicals } from "@/lib/technicals-normalize";
import type { TechnicalsApiResponse, TechnicalsResponse } from "@/types/technicals";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import {
  BulkAnalyzeBody, BulkAnalyzeResponse, BulkStatusBody, BulkStatusResponse, BulkRow,
} from "./technicals-config-types";
import { TechnicalsResultCard } from "./TechnicalsResultCard";

const BULK_API = `${BACKEND_URL}/admin/technicals`;
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";
const POLL_MS = 7000;
const MAX_POLL_ATTEMPTS = 45; // ~5 min ceiling

const PENDING = new Set(["queued", "processing"]);
const VIEWABLE = new Set(["ready", "exists"]);

interface StocksApiResponseLite {
  data?: { company: string }[];
}

interface DetailState {
  loading: boolean;
  error: string | null;
  data: TechnicalsResponse | null;
}

interface Props {
  /** Page-level selected ticker, used to pre-seed the picker once. */
  initialTicker?: string | null;
}

export function TechnicalsBulkPanel({ initialTicker }: Props) {
  const [companies, setCompanies] = useState<string[]>([]);
  const [tickers, setTickers] = useState<string[]>(initialTicker ? [initialTicker] : []);
  const [force, setForce] = useState(false);
  const [armed, setArmed] = useState(false);

  const [enqueuing, setEnqueuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const [rows, setRows] = useState<BulkRow[]>([]);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [polling, setPolling] = useState(false);
  const pollAttemptsRef = useRef(0);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<Record<string, DetailState>>({});

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/transcript/stocks`)
      .then(async (res) => {
        const json: StocksApiResponseLite = await res.json();
        setCompanies((json.data ?? []).map((s) => s.company));
      })
      .catch(() => {});
  }, []);

  const pollStatus = useCallback((list: string[]) => {
    const body: BulkStatusBody = { tickers: list };
    apiAuthPost<BulkStatusResponse>(`${BULK_API}/bulk-status`, {
      onSuccess: (res) => {
        const byTicker = new Map(res.results.map((r) => [r.ticker, r]));
        setRows((prev) =>
          prev.map((row) => {
            const upd = byTicker.get(row.ticker);
            return upd ? { ...row, status: upd.status, updatedAt: upd.updatedAt, error: upd.error } : row;
          })
        );
        setCounts(res.counts ?? null);
        const stillPending = res.results.some((r) => PENDING.has(r.status));
        pollAttemptsRef.current += 1;
        if (!stillPending || pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) setPolling(false);
      },
      onError: () => {
        // Transient status failure shouldn't kill the run; retry within budget.
        pollAttemptsRef.current += 1;
        if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) setPolling(false);
      },
    }, body);
  }, []);

  // Drive polling while any submitted ticker is still queued/processing.
  useEffect(() => {
    if (!polling || submitted.length === 0) return;
    const iv = setInterval(() => pollStatus(submitted), POLL_MS);
    return () => clearInterval(iv);
  }, [polling, submitted, pollStatus]);

  function handleRunClick() {
    if (tickers.length === 0) return;
    if (!armed) { setArmed(true); return; }
    setArmed(false);

    const body: BulkAnalyzeBody = { tickers, force };
    apiAuthPost<BulkAnalyzeResponse>(`${BULK_API}/bulk-analyze`, {
      onStart: () => { setEnqueuing(true); setError(null); },
      onSuccess: (res) => {
        const seeded: BulkRow[] = res.results.map((r) => ({
          ticker: r.ticker, status: r.status, updatedAt: null, error: r.error,
        }));
        setRows(seeded);
        setCounts(res.counts ?? null);
        const list = res.results.map((r) => r.ticker);
        setSubmitted(list);
        setExpanded({});
        setDetails({});
        pollAttemptsRef.current = 0;
        // Kick an immediate status read, then let the interval take over.
        setPolling(true);
        pollStatus(list);
      },
      onError: setError,
      onComplete: () => setEnqueuing(false),
    }, body);
  }

  function fetchDetail(ticker: string) {
    if (details[ticker]?.loading || details[ticker]?.data) return;
    setDetails((prev) => ({ ...prev, [ticker]: { loading: true, error: null, data: null } }));
    rawFetch<TechnicalsApiResponse>(`${BACKEND_URL}/api/screener/${ticker}/technicals`, {
      onSuccess: (raw) => setDetails((prev) => ({ ...prev, [ticker]: { loading: false, error: null, data: normalizeTechnicals(raw) } })),
      onError: (err) => setDetails((prev) => ({ ...prev, [ticker]: { loading: false, error: err, data: null } })),
    });
  }

  function toggleExpand(ticker: string) {
    const next = !expanded[ticker];
    setExpanded((prev) => ({ ...prev, [ticker]: next }));
    if (next) fetchDetail(ticker);
  }

  const pendingCount = rows.filter((r) => PENDING.has(r.status)).length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="rounded-md border border-hair bg-secondary px-4 py-3">
          <p className="text-[13px] text-ink font-medium">Bulk technicals analysis</p>
          <p className="text-[12px] text-ink-3 mt-1">
            Enqueues a technicals insight job per ticker (1–500). <code>Force</code> regenerates even when
            an insight already exists; otherwise existing tickers are skipped. Status is polled until every
            ticker settles.
          </p>
        </div>

        <div>
          <label className={LABEL_CLS}>Tickers <span className="normal-case tracking-normal font-normal text-ink-3">— type to add, Enter to confirm</span></label>
          <TagMultiPicker
            options={companies}
            selected={tickers}
            onChange={(t) => { setTickers(t); setArmed(false); }}
            disabled={enqueuing}
            placeholder="Add tickers (e.g. HDFCBANK)…"
          />
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <CheckboxField
            checked={force}
            onChange={(v) => { setForce(v); setArmed(false); }}
            label="Force regenerate"
            hint="Re-runs the LLM even for tickers that already have an insight."
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
            <AlertCircle className="size-4 shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-down hover:text-down"><X className="size-4" /></button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {armed ? (
            <>
              <button
                onClick={handleRunClick}
                disabled={enqueuing}
                className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {enqueuing ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                Confirm — run {tickers.length} ticker{tickers.length === 1 ? "" : "s"}
              </button>
              <button onClick={() => setArmed(false)} className="text-[12px] text-ink-3 hover:text-ink">Cancel</button>
            </>
          ) : (
            <button
              onClick={handleRunClick}
              disabled={enqueuing || tickers.length === 0}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Play className="size-3.5" />
              Run bulk analysis
            </button>
          )}
          {polling && (
            <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <Loader2 className="size-3 animate-spin" /> polling status{pendingCount > 0 ? ` (${pendingCount} pending)` : ""}…
            </span>
          )}
        </div>

        {rows.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Results</span>
              {counts && (
                <span className="text-[11px] text-ink-3">
                  {Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(" · ")}
                </span>
              )}
              {!polling && submitted.length > 0 && (
                <button
                  onClick={() => { pollAttemptsRef.current = 0; setPolling(true); pollStatus(submitted); }}
                  className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink ml-auto"
                >
                  <RotateCcw className="size-3" /> Re-check
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {rows.map((r) => {
                const viewable = VIEWABLE.has(r.status);
                const detail = details[r.ticker];
                const isOpen = !!expanded[r.ticker];
                return (
                  <div key={r.ticker} className="rounded-md border border-hair bg-card overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2">
                      {PENDING.has(r.status) && <Loader2 className="size-3.5 text-blue animate-spin shrink-0" />}
                      {r.status === "ready" && <CheckCircle2 className="size-3.5 text-up shrink-0" />}
                      {r.status === "exists" && <CheckCircle2 className="size-3.5 text-ink-3 shrink-0" />}
                      {(r.status === "failed" || r.status === "error") && <XCircle className="size-3.5 text-down shrink-0" />}
                      {r.status === "missing" && <AlertCircle className="size-3.5 text-warn shrink-0" />}
                      <span className="text-[12px] font-medium text-ink font-mono w-28 shrink-0">{r.ticker}</span>
                      <span className="text-[11px] text-ink-3 capitalize">{r.status}</span>
                      {r.error && <span className="text-[11px] text-down truncate" title={r.error}>{r.error}</span>}
                      <div className="flex-1" />
                      {r.updatedAt && <span className="text-[10px] text-ink-3">{new Date(r.updatedAt).toLocaleString()}</span>}
                      {viewable && (
                        <button
                          onClick={() => toggleExpand(r.ticker)}
                          className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink"
                        >
                          View <ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {viewable && isOpen && (
                      <div className="border-t border-hair px-3 py-3 bg-secondary">
                        {detail?.loading && (
                          <div className="flex items-center gap-2 text-[12px] text-ink-3"><Loader2 className="size-3.5 animate-spin" /> Loading analysis…</div>
                        )}
                        {detail?.error && !detail.loading && (
                          <div className="flex items-center gap-2 text-[12px] text-down"><AlertCircle className="size-3.5" /> {detail.error}</div>
                        )}
                        {detail?.data && !detail.loading && (
                          <TechnicalsResultCard symbol={r.ticker} data={detail.data} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
