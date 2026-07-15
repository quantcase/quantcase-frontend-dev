"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { TestTicker, RunResponse, RunJobResponse, JobStatusResponse, API_BASE } from "./types";
import { BACKEND_URL } from "@/lib/constants";

export interface PreviewControls {
  running: boolean;
  result: RunResponse | null;
  hasBase: boolean | null; // null = unknown/checking, false = no output exists yet for this ticker in any mode
  run: (force?: boolean) => void;
}

interface Props {
  slug: string;
  ticker: TestTicker;
  callId: string | null;
  fiscalYear: string | null;
  quarter: string | null;
  historic: boolean;
  configKey: string | null;
  onControls: (controls: PreviewControls) => void;
}

function stripHtmlFences(raw: string): string {
  return raw.replace(/^```html\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export function PreviewPane({ slug, ticker, callId, fiscalYear, quarter, historic, configKey, onControls }: Props) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [hasBase, setHasBase] = useState<boolean | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Unscoped existence check — does *any* output (historic or incremental) exist yet for this ticker?
  // Incremental runs need a base to build on; without one they'd just produce a confusing, context-free output.
  useEffect(() => {
    setHasBase(null);
    fetch(`${BACKEND_URL}${API_BASE}/${slug}/outputs/${ticker}`)
      .then((res) => setHasBase(res.status !== 404))
      .catch(() => {});
  }, [slug, ticker]);

  // Exact-period fetch of the output to display — scoped to the selected call's fiscal_year/quarter,
  // not just "latest for this mode". 404 (no analysis for this exact period yet) means an empty preview.
  useEffect(() => {
    setResult(null);
    setError(null);
    if (!fiscalYear || !quarter) return;
    fetch(`${BACKEND_URL}${API_BASE}/${slug}/outputs/${ticker}/${fiscalYear}/${quarter}?historic=${historic}`)
      .then(async (res) => {
        if (res.status === 404) return;
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        const output = json as RunResponse["output"];
        output.raw_html = stripHtmlFences(output.raw_html);
        setResult({ cached: true, output });
      })
      .catch(() => {});
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [slug, ticker, historic, fiscalYear, quarter]);

  async function fetchOutput() {
    const res = await fetch(`${BACKEND_URL}${API_BASE}/${slug}/outputs/${ticker}/${fiscalYear}/${quarter}?historic=${historic}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
    const output = json as RunResponse["output"];
    output.raw_html = stripHtmlFences(output.raw_html);
    return output;
  }

  function runSkill(force = false) {
    if (!callId) {
      setError("Select a call/period first");
      return;
    }
    if (!historic && hasBase === false) {
      setError("No base output exists for this ticker yet — run Historic first");
      return;
    }
    if (pollRef.current) clearInterval(pollRef.current);
    setRunning(true);
    setError(null);

    fetch(`${BACKEND_URL}${API_BASE}/${slug}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, callId, force, historic, ...(configKey ? { configKey } : {}) }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status} ${res.statusText}`);
        const { job } = json as RunJobResponse;

        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`${BACKEND_URL}/api/jobs/${job.id}`);
            const statusJson: JobStatusResponse = await statusRes.json();
            const status = statusJson.data?.status;
            if (status === "completed") {
              clearInterval(pollRef.current!);
              pollRef.current = null;
              const output = await fetchOutput();
              setResult({ cached: false, output });
              setHasBase(true);
              setRunning(false);
            } else if (status === "failed") {
              clearInterval(pollRef.current!);
              pollRef.current = null;
              setError(statusJson.data?.error ?? statusJson.data?.failedReason ?? "Run failed — context too long (reduce signals being sent)");
              setRunning(false);
            }
          } catch (err) {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setError(err instanceof Error ? err.message : "Failed to check job status");
            setRunning(false);
          }
        }, 2000);
      })
      .catch((err) => {
        setError(err.message ?? "Run failed — context too long (reduce signals being sent)");
        setRunning(false);
      });
  }

  useEffect(() => {
    onControls({ running, result, hasBase, run: runSkill });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, result, hasBase, callId, historic, fiscalYear, quarter, configKey]);

  const html = result?.output?.raw_html ?? null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--qc-section)]">
      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {error && (
          <div className="absolute inset-x-4 top-4 z-10 flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-[12px] text-down">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {running && !html && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-ink-3">
              <Loader2 className="size-8 animate-spin" />
              <span className="text-[13px]">Running skill on {ticker}…</span>
            </div>
          </div>
        )}

        {!running && !html && !error && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-ink-3">
              <Play className="size-8 opacity-20" />
              <span className="text-[13px]">Select a ticker and click Run to preview</span>
            </div>
          </div>
        )}

        {html && (
          <iframe
            srcDoc={html}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            title={`Preview — ${slug} / ${ticker}`}
          />
        )}
      </div>
    </div>
  );
}
