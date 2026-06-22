"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { TestTicker, RunResponse, RunJobResponse, JobStatusResponse, LiveSkillConfig } from "./types";
import { BACKEND_URL } from "@/lib/constants";

export interface PreviewControls {
  running: boolean;
  result: RunResponse | null;
  run: (force?: boolean) => void;
}

interface Props {
  slug: string;
  ticker: TestTicker;
  liveConfig: LiveSkillConfig | null;
  onControls: (controls: PreviewControls) => void;
}

function stripHtmlFences(raw: string): string {
  return raw.replace(/^```html\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export function PreviewPane({ slug, ticker, liveConfig, onControls }: Props) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResponse | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount (or slug/ticker change): load the latest saved output
  useEffect(() => {
    setResult(null);
    setError(null);
    fetch(`${BACKEND_URL}/api/html-skills/${slug}/outputs/${ticker}`)
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
  }, [slug, ticker]);

  async function fetchOutput() {
    const res = await fetch(`${BACKEND_URL}/api/html-skills/${slug}/outputs/${ticker}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
    const output = json as RunResponse["output"];
    output.raw_html = stripHtmlFences(output.raw_html);
    return output;
  }

  function runSkill(force = false) {
    if (pollRef.current) clearInterval(pollRef.current);
    setRunning(true);
    setError(null);

    const isPreview = liveConfig !== null;
    const url = isPreview
      ? `${BACKEND_URL}/api/html-skills/run-preview`
      : `${BACKEND_URL}/api/html-skills/${slug}/run`;
    const body = isPreview
      ? {
          ticker,
          force,
          skill_prompt: liveConfig.prompt,
          signal_types: liveConfig.signalTypes,
          model: liveConfig.model,
          max_tokens: liveConfig.maxTokens,
          max_transcript_qtrs: liveConfig.maxTranscriptQtrs,
          max_ppt_qtrs: liveConfig.maxPptQtrs,
          max_annual_report_years: liveConfig.maxAnnualReportYears,
        }
      : { ticker, force };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
              if (statusJson.data?.output) {
                // Preview job — output is embedded in the job status response
                const embeddedOutput = statusJson.data.output;
                setResult({
                  cached: false,
                  output: {
                    ...embeddedOutput,
                    raw_html: stripHtmlFences(embeddedOutput.raw_html),
                    id: "", skill_id: "", ticker, fiscal_year: null, quarter: null,
                    prompt_v: "", model: "", created_at: "", updated_at: "",
                  },
                });
              } else {
                // Saved-skill job — fetch output separately
                const output = await fetchOutput();
                setResult({ cached: false, output });
              }
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
    onControls({ running, result, run: runSkill });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, result]);

  const html = result?.output?.raw_html ?? null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--qc-section)]">
      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {error && (
          <div className="absolute inset-x-4 top-4 z-10 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {running && !html && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[#888888]">
              <Loader2 className="size-8 animate-spin" />
              <span className="text-[13px]">Running skill on {ticker}…</span>
            </div>
          </div>
        )}

        {!running && !html && !error && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[#888888]">
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
