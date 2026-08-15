"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { TestTicker, RunResponse, RunJobResponse, JobStatusResponse, API_BASE } from "./types";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import { TabToggle } from "@/components/molecules/tab-toggle";

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
  skillMode: "Detailed" | "Compressed";
  onControls: (controls: PreviewControls) => void;
}

function stripHtmlFences(raw: string): string {
  return raw.replace(/^```html\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export function PreviewPane({ slug, ticker, callId, fiscalYear, quarter, historic, configKey, skillMode, onControls }: Props) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [hasBase, setHasBase] = useState<boolean | null>(null);
  const [hasDetailedOutput, setHasDetailedOutput] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<"html" | "json" | "audit">("html");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Unscoped existence check — does *any* output (historic or incremental) exist yet for this ticker?
  // Incremental runs need a base to build on; without one they'd just produce a confusing, context-free output.
  useEffect(() => {
    setHasBase(null);
    const urlPath = skillMode === "Compressed" ? `/api/html-compressed-skills/${slug}-compressed` : `${API_BASE}/${slug}`;
    authFetch(`${BACKEND_URL}${urlPath}/outputs/${ticker}`)
      .then((res) => setHasBase(res.status !== 404))
      .catch(() => {});
  }, [slug, ticker, skillMode]);

  // For Compressed mode, check if detailed output exists to prevent errors.
  useEffect(() => {
    if (skillMode === "Compressed") {
      authFetch(`${BACKEND_URL}${API_BASE}/${slug}/outputs/${ticker}`)
        .then((res) => setHasDetailedOutput(res.status !== 404))
        .catch(() => {});
    } else {
      setHasDetailedOutput(null);
    }
  }, [slug, ticker, skillMode]);

  // Exact-period fetch of the output to display — scoped to the selected call's fiscal_year/quarter,
  // not just "latest for this mode". 404 (no analysis for this exact period yet) means an empty preview.
  useEffect(() => {
    setResult(null);
    setError(null);
    if (!fiscalYear || !quarter) return;
    const urlPath = skillMode === "Compressed" 
      ? `/api/html-compressed-skills/${slug}-compressed/outputs/${ticker}?historic=${historic}`
      : `${API_BASE}/${slug}/outputs/${ticker}/${fiscalYear}/${quarter}?historic=${historic}`;

    authFetch(`${BACKEND_URL}${urlPath}`)
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
  }, [slug, ticker, historic, fiscalYear, quarter, skillMode]);

  async function fetchOutput() {
    const urlPath = skillMode === "Compressed" 
      ? `/api/html-compressed-skills/${slug}-compressed/outputs/${ticker}?historic=${historic}`
      : `${API_BASE}/${slug}/outputs/${ticker}/${fiscalYear}/${quarter}?historic=${historic}`;

    const res = await authFetch(`${BACKEND_URL}${urlPath}`);
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
    if (skillMode === "Compressed" && hasDetailedOutput === false) {
      setError("Detailed view must be generated first before running the compressed flow.");
      return;
    }
    if (!historic && hasBase === false) {
      setError("No base output exists for this ticker yet — run Historic first");
      return;
    }
    if (pollRef.current) clearInterval(pollRef.current);
    setRunning(true);
    setError(null);

    const runUrlPath = skillMode === "Compressed"
      ? `/api/html-compressed-skills/${slug}-compressed/run`
      : `${API_BASE}/${slug}/run`;

    authFetch(`${BACKEND_URL}${runUrlPath}`, {
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
            const statusRes = await authFetch(`${BACKEND_URL}/api/jobs/${job.id}`);
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
  }, [running, result, hasBase, callId, historic, fiscalYear, quarter, configKey, skillMode]);

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
          <div className="absolute top-4 right-8 z-10 flex border border-[var(--qc-border-default)] rounded-md overflow-hidden bg-[var(--qc-card)] text-[12px] font-medium shadow-sm">
            <button
              onClick={() => setViewMode("html")}
              className={`px-3 py-1.5 transition-colors ${viewMode === "html" ? "bg-ink text-[var(--qc-on-dark)]" : "text-ink-3 hover:text-ink"}`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("json")}
              className={`px-3 py-1.5 transition-colors ${viewMode === "json" ? "bg-ink text-[var(--qc-on-dark)]" : "text-ink-3 hover:text-ink"}`}
            >
              Extracted JSON
            </button>
            <button
              onClick={() => setViewMode("audit")}
              className={`px-3 py-1.5 transition-colors ${viewMode === "audit" ? "bg-ink text-[var(--qc-on-dark)]" : "text-ink-3 hover:text-ink"}`}
            >
              Audit Logs
            </button>
          </div>
        )}

        {html && viewMode === "html" && (
          <iframe
            srcDoc={html}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            title={`Preview — ${slug} / ${ticker}`}
          />
        )}
        
        {html && viewMode === "json" && (
          <div className="w-full h-full overflow-y-auto p-6 bg-[var(--qc-card)] font-mono text-[12px] leading-relaxed text-[var(--qc-ink-2)]">
            <h3 className="text-[14px] font-bold text-[var(--qc-ink)] mb-4">Extracted JSON Data</h3>
            <div className="bg-[var(--qc-section)] rounded-md border border-[var(--qc-border-default)] p-4 overflow-x-auto">
              <pre>{result?.output?.extracted_json ? JSON.stringify(result.output.extracted_json, null, 2) : "No JSON extracted"}</pre>
            </div>
          </div>
        )}

        {html && viewMode === "audit" && (
          <div className="w-full h-full overflow-y-auto p-6 bg-[var(--qc-card)] font-mono text-[12px] leading-relaxed text-[var(--qc-ink-2)]">
            <h3 className="text-[14px] font-bold text-[var(--qc-ink)] mb-4">Pipeline Audit Logs</h3>
            
            <div className="mb-6">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[var(--qc-ink-3)] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue"></span>
                Fact Validation Critiques
              </h4>
              {result?.output?.audit_logs?.fact_validation && result.output.audit_logs.fact_validation.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {result.output.audit_logs.fact_validation.map((log: any, i: number) => (
                    <div key={i} className="bg-[var(--qc-section)] rounded-md border border-[var(--qc-border-default)] p-4">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(log, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[var(--qc-section)] rounded-md border border-[var(--qc-border-default)] p-4 text-ink-3 italic">
                  No fact validation issues found or validation was skipped.
                </div>
              )}
            </div>

            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[var(--qc-ink-3)] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warn"></span>
                Visual QA UI Bugs Caught
              </h4>
              {result?.output?.audit_logs?.visual_qa && result.output.audit_logs.visual_qa.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {result.output.audit_logs.visual_qa.map((log: any, i: number) => (
                    <div key={i} className="bg-[var(--qc-section)] rounded-md border border-[var(--qc-border-default)] p-4">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(log, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[var(--qc-section)] rounded-md border border-[var(--qc-border-default)] p-4 text-ink-3 italic">
                  No visual bugs found or visual QA was skipped.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
