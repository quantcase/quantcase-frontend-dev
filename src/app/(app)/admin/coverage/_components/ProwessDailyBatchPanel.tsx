"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock, RefreshCw, Play, Ban } from "lucide-react";
import { apiAuthGet, apiAuthPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import {
  ProwessBatch,
  ProwessBatchTriggerResponse,
  ProwessBatchCheckResponse,
  ProwessBatchGetResponse,
  ProwessBatchListResponse,
  ProwessBatchAbortResponse,
} from "./types";
import { SchedulerControl } from "./SchedulerControl";

const BASE = `${BACKEND_URL}/admin/prowess/batch`;
const POLL_MS = 12000;

// ── Status badge ─────────────────────────────────────────────────────────────

function BatchStatusBadge({ status }: { status: ProwessBatch["status"] }) {
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
      <Clock className="size-3.5" /> Pending
    </span>
  );
}

// ── Active batch card — the one just triggered, polled live until it resolves ──

function ActiveBatchCard({ batch }: { batch: ProwessBatch }) {
  return (
    <div className="rounded-[10px] border border-hair bg-card p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[12px] text-ink-3">{batch.token}</span>
        <BatchStatusBadge status={batch.status} />
      </div>

      {batch.status === "pending" && (
        <p className="flex items-center gap-2 text-[12px] text-ink-3">
          <Loader2 className="size-3.5 shrink-0 animate-spin" />
          Submitted to CMIE — historically resolves in 1-2 minutes. Checking every ~12s.
        </p>
      )}

      {batch.status === "failed" && batch.error && (
        <p className="flex items-start gap-1.5 text-[12px] text-down bg-down-soft border border-down-soft rounded-md px-2.5 py-1.5">
          <AlertCircle className="size-3.5 shrink-0 mt-px" /> {batch.error}
        </p>
      )}

      {batch.status === "completed" && batch.result && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-[12px] text-up bg-up-soft border border-up-soft rounded-md px-2.5 py-1.5">
            <CheckCircle2 className="size-3.5 shrink-0" />
            {batch.result.totalRowsIngested.toLocaleString("en-IN")} rows ingested into nse_equity_new
            — already committed, no separate confirm step.
          </p>
          {batch.result.files.length > 0 && (
            <div className="rounded-md border border-hair overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary border-b border-hair">
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">File</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">Type</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wider text-ink-3">Parsed</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wider text-ink-3">Skipped</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wider text-ink-3">Expected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair bg-card">
                  {batch.result.files.map((f) => (
                    <tr key={f.file}>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-ink">{f.file}</td>
                      <td className="px-3 py-1.5 text-[11px] text-ink-3 uppercase">{f.type}</td>
                      <td className="px-3 py-1.5 text-right text-[11px] text-ink">{f.recordsParsed.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-1.5 text-right text-[11px] text-ink-3">{f.skippedName.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-1.5 text-right text-[11px] text-ink-3">{f.nrowExpected.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-[11px] text-ink-3">
            A large Skipped count is normal — this query&rsquo;s domain is Prowess&rsquo;s entire
            company universe, most of which aren&rsquo;t NSE-listed/tracked by this app.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Recent batch row ─────────────────────────────────────────────────────────

function RecentBatchRow({ batch, onRefresh, refreshing }: { batch: ProwessBatch; onRefresh: () => void; refreshing: boolean }) {
  return (
    <div className="rounded-[8px] border border-hair bg-card px-3 py-2 flex items-center gap-4 flex-wrap">
      <span className="font-mono text-[11px] text-ink-3 w-40 truncate shrink-0">{batch.token}</span>
      <BatchStatusBadge status={batch.status} />
      {batch.result && (
        <span className="text-[11px] text-ink-3">
          {batch.result.totalRowsIngested.toLocaleString("en-IN")} rows
        </span>
      )}
      {batch.status === "failed" && batch.error && (
        <span className="text-[11px] text-down truncate max-w-[280px]">{batch.error}</span>
      )}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        title="Read-only DB state check — doesn't call CMIE"
        className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40 ml-auto"
      >
        {refreshing ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
      </button>
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────

export function ProwessDailyBatchPanel() {
  // Trigger + live-polled active batch
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [activeBatch, setActiveBatch] = useState<ProwessBatch | null>(null);

  // Recent/pending batch list
  const [recentBatches, setRecentBatches] = useState<ProwessBatch[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState<string | null>(null);

  // Abort-all — two-step confirm since it cancels every pending batch, not just one
  const [aborting, setAborting] = useState(false);
  const [abortArmed, setAbortArmed] = useState(false);
  const [abortError, setAbortError] = useState<string | null>(null);

  const loadRecent = useCallback(() => {
    const url = pendingOnly ? `${BASE}?status=pending` : BASE;
    apiAuthGet<ProwessBatchListResponse>(url, {
      onStart: () => { setRecentLoading(true); setRecentError(null); },
      onSuccess: (res) => setRecentBatches(res.data ?? []),
      onError: setRecentError,
      onComplete: () => setRecentLoading(false),
    });
  }, [pendingOnly]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const checkActiveBatch = useCallback((token: string) => {
    apiAuthPost<ProwessBatchCheckResponse>(`${BASE}/${token}/check`, {
      onSuccess: (res) => {
        setActiveBatch(res.data);
        if (res.data.status !== "pending") loadRecent();
      },
      onError: () => {}, // transient poll failure — next tick retries, no need to surface/kill the poll
    });
  }, [loadRecent]);

  const isPolling = activeBatch?.status === "pending";
  const activeToken = activeBatch?.token;

  // Re-created each time activeBatch updates (i.e. once per poll tick) — functionally identical to
  // a single long-lived interval, just re-armed with a fresh 12s window on every tick.
  useEffect(() => {
    if (!isPolling || !activeToken) return;
    const iv = setInterval(() => checkActiveBatch(activeToken), POLL_MS);
    return () => clearInterval(iv);
  }, [isPolling, activeToken, checkActiveBatch]);

  function triggerDaily() {
    apiAuthPost<ProwessBatchTriggerResponse>(`${BASE}/daily/run`, {
      onStart: () => { setTriggering(true); setTriggerError(null); },
      onSuccess: (res) => { setActiveBatch(res.data); loadRecent(); },
      onError: setTriggerError,
      onComplete: () => setTriggering(false),
    });
  }

  function refreshRow(token: string) {
    apiAuthGet<ProwessBatchGetResponse>(`${BASE}/${token}`, {
      onStart: () => setRefreshingToken(token),
      onSuccess: (res) => {
        setRecentBatches((prev) => prev.map((b) => (b.token === token ? res.data : b)));
        if (activeBatch?.token === token) setActiveBatch(res.data);
      },
      onError: () => {},
      onComplete: () => setRefreshingToken(null),
    });
  }

  function handleAbortAll() {
    if (!abortArmed) { setAbortArmed(true); return; }
    apiAuthPost<ProwessBatchAbortResponse>(`${BASE}/abort-all`, {
      onStart: () => { setAborting(true); setAbortError(null); },
      onSuccess: () => { setAbortArmed(false); loadRecent(); },
      onError: setAbortError,
      onComplete: () => setAborting(false),
    });
  }

  const hasPending = recentBatches.some((b) => b.status === "pending");

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Intro */}
      <div className="rounded-md border border-hair bg-secondary px-4 py-3">
        <p className="text-[13px] text-ink font-medium">Prowess Daily — direct CMIE batch trigger</p>
        <p className="text-[12px] text-ink-3 mt-1 leading-relaxed">
          Calls CMIE&rsquo;s live Prowess batch API directly — no CSV export/upload needed. Submits a
          fixed, checked-in query file automatically. Async: submit → poll → resolve, unlike the
          synchronous CSV upload below. Ingestion into <code>nse_equity_new</code> happens
          automatically the moment a batch resolves as completed — there&rsquo;s no separate
          confirm step.
        </p>
      </div>

      <SchedulerControl slug="prowess-daily-batch" label="Prowess Daily" />

      {/* Trigger */}
      <div className="rounded-[10px] border border-hair bg-card p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={triggerDaily}
            disabled={triggering || isPolling}
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {(triggering || isPolling) ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Run Daily Ingestion
          </button>
          <span className="text-[11px] text-ink-3">
            {isPolling ? "A batch is already in flight — wait for it to resolve." : "No inputs needed — submits the fixed daily OHLCV query."}
          </span>
        </div>

        {triggerError && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
            <AlertCircle className="size-3.5 shrink-0" /> {triggerError}
          </div>
        )}

        {activeBatch && <ActiveBatchCard batch={activeBatch} />}
      </div>

      {/* Recent / pending batches */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Recent Batches</span>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} />
              Pending only
            </label>
            <button
              onClick={loadRecent}
              disabled={recentLoading}
              className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
            >
              {recentLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Refresh
            </button>
            <button
              onClick={handleAbortAll}
              disabled={aborting || !hasPending}
              title={hasPending ? "Cancel every pending batch" : "No pending batches to cancel"}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                abortArmed ? "bg-down text-[var(--qc-on-dark)] border-down hover:opacity-90" : "border-hair text-ink-3 hover:text-down hover:border-down"
              }`}
            >
              {aborting && <Loader2 className="size-3 animate-spin" />}
              <Ban className="size-3" />
              {abortArmed ? "Confirm abort all" : "Abort all pending"}
            </button>
            {abortArmed && (
              <button onClick={() => setAbortArmed(false)} className="text-[11px] text-ink-3 hover:text-ink">
                Cancel
              </button>
            )}
          </div>
        </div>

        {abortError && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
            <AlertCircle className="size-4 shrink-0" /> {abortError}
          </div>
        )}

        {recentError && !recentLoading && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
            <AlertCircle className="size-4 shrink-0" /> {recentError}
          </div>
        )}

        {recentBatches.length === 0 && !recentLoading && !recentError && (
          <p className="text-[12px] text-ink-3">No batches yet.</p>
        )}

        <div className="space-y-1.5">
          {recentBatches.map((b) => (
            <RecentBatchRow
              key={b.token}
              batch={b}
              onRefresh={() => refreshRow(b.token)}
              refreshing={refreshingToken === b.token}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
