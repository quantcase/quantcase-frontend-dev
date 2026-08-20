"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  AlertCircle, X, Play, Loader2, CheckCircle2, XCircle, RotateCcw,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { HtmlSkillConfig, HtmlSkill } from "./types";

const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";
const POLL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // ~5 min ceiling

const PENDING = new Set(["queued", "processing"]);
const VIEWABLE = new Set(["ready", "exists"]);

interface BulkRow {
  ticker: string;
  jobId: string | null;
  status: string;
  error?: string | null;
  updatedAt?: string | null;
}

interface Props {
  skill: HtmlSkill;
  configs: HtmlSkillConfig[];
  skillMode: "Detailed" | "Compressed";
  historic: boolean;
  onHistoricChange: (v: boolean) => void;
  configKey: string | null;
  onConfigChange: (v: string | null) => void;
}

export function HtmlSkillsBulkPanel({
  skill,
  configs,
  skillMode,
  historic,
  onHistoricChange,
  configKey,
  onConfigChange,
}: Props) {
  const [companies, setCompanies] = useState<string[]>([]);
  const [tickers, setTickers] = useState<string[]>([]);
  const [armed, setArmed] = useState(false);

  const [enqueuing, setEnqueuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<BulkRow[]>([]);
  const [submittedJobs, setSubmittedJobs] = useState<{ ticker: string; jobId: string }[]>([]);
  const [polling, setPolling] = useState(false);
  const pollAttemptsRef = useRef(0);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/transcript/stocks`)
      .then(async (res) => {
        const json = await res.json();
        setCompanies((json.data ?? []).map((s: any) => s.company));
      })
      .catch(() => {});
  }, []);

  const getApiBase = () => {
    return skillMode === "Compressed"
      ? `/api/html-compressed-skills/${skill.slug}-compressed`
      : `/api/html-incremental-skills/${skill.slug}`;
  };

  const pollStatus = useCallback(
    (jobsList: { ticker: string; jobId: string }[]) => {
      authFetch(`${BACKEND_URL}${getApiBase()}/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: jobsList }),
      })
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok) throw new Error(json?.error ?? "Failed to poll status");
          const byTicker = new Map<string, any>(json.results.map((r: any) => [r.ticker, r]));
          setRows((prev) =>
            prev.map((row) => {
              const upd = byTicker.get(row.ticker);
              return upd ? { ...row, status: upd.status, error: upd.error } : row;
            })
          );
          const stillPending = json.results.some((r: any) => PENDING.has(r.status));
          pollAttemptsRef.current += 1;
          if (!stillPending || pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) setPolling(false);
        })
        .catch(() => {
          pollAttemptsRef.current += 1;
          if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) setPolling(false);
        });
    },
    [skillMode, skill.slug]
  );

  useEffect(() => {
    if (!polling || submittedJobs.length === 0) return;
    const iv = setInterval(() => pollStatus(submittedJobs), POLL_MS);
    return () => clearInterval(iv);
  }, [polling, submittedJobs, pollStatus]);

  function handleRunClick() {
    if (tickers.length === 0) return;
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);

    setEnqueuing(true);
    setError(null);

    authFetch(`${BACKEND_URL}${getApiBase()}/bulk-regenerate-html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers, historic, configKey }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to enqueue bulk regenerate");
        
        const seeded: BulkRow[] = json.results.map((r: any) => ({
          ticker: r.ticker,
          status: r.status,
          jobId: r.jobId,
          error: r.error,
          updatedAt: r.updatedAt,
        }));
        setRows(seeded);

        const list = json.results
          .filter((r: any) => r.jobId)
          .map((r: any) => ({ ticker: r.ticker, jobId: r.jobId }));
          
        setSubmittedJobs(list);
        pollAttemptsRef.current = 0;
        
        if (list.length > 0) {
          setPolling(true);
          pollStatus(list);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setEnqueuing(false));
  }

  const pendingCount = rows.filter((r) => PENDING.has(r.status)).length;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="rounded-md border border-hair bg-secondary px-4 py-3">
          <p className="text-[13px] text-ink font-medium">Bulk Regenerate HTML</p>
          <p className="text-[12px] text-ink-3 mt-1">
            Enqueues HTML regeneration jobs for the selected tickers based on the latest existing 
            <code> extracted_json</code> for the chosen mode (<strong>{historic ? "Historic" : "Incremental"}</strong>) and config (<strong>{configKey ?? "Default"}</strong>).
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className={LABEL_CLS}>Mode</label>
            <TabToggle
              variant="outline"
              options={["Historic", "Incremental"]}
              value={historic ? "Historic" : "Incremental"}
              onChange={(v) => onHistoricChange(v === "Historic")}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Config Bundle</label>
            <select
              value={configKey ?? ""}
              onChange={(e) => onConfigChange(e.target.value || null)}
              className="appearance-none rounded-md border border-[var(--qc-border-default)] bg-card pl-3 pr-8 py-1.5 text-[12px] font-medium text-ink outline-none"
            >
              <option value="">Default config</option>
              {configs.map((c) => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>
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
              Run Bulk Regenerate
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
              {!polling && submittedJobs.length > 0 && (
                <button
                  onClick={() => { pollAttemptsRef.current = 0; setPolling(true); pollStatus(submittedJobs); }}
                  className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink ml-auto"
                >
                  <RotateCcw className="size-3" /> Re-check
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {rows.map((r) => {
                return (
                  <div key={r.ticker} className="rounded-md border border-hair bg-card overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2">
                      {PENDING.has(r.status) && <Loader2 className="size-3.5 text-blue animate-spin shrink-0" />}
                      {r.status === "ready" && <CheckCircle2 className="size-3.5 text-up shrink-0" />}
                      {(r.status === "failed" || r.status === "error") && <XCircle className="size-3.5 text-down shrink-0" />}
                      {(r.status === "missing" || r.status === "missing_json") && <AlertCircle className="size-3.5 text-warn shrink-0" />}
                      <span className="text-[12px] font-medium text-ink font-mono w-28 shrink-0">{r.ticker}</span>
                      <span className="text-[11px] text-ink-3 capitalize">{r.status}</span>
                      {r.error && <span className="text-[11px] text-down truncate" title={r.error}>{r.error}</span>}
                    </div>
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
