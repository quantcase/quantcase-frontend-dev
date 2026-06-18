"use client";

import { useState, useEffect } from "react";
import { Play, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { TestTicker, RunResponse } from "./types";
import { BACKEND_URL } from "@/lib/constants";

export interface PreviewControls {
  running: boolean;
  result: RunResponse | null;
  run: (force?: boolean) => void;
}

interface Props {
  slug: string;
  ticker: TestTicker;
  onControls: (controls: PreviewControls) => void;
}

function stripHtmlFences(raw: string): string {
  return raw.replace(/^```html\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export function PreviewPane({ slug, ticker, onControls }: Props) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResponse | null>(null);

  // On mount (or slug/ticker change): load the latest saved output
  useEffect(() => {
    setResult(null);
    setError(null);
    fetch(`${BACKEND_URL}/api/html-skills/${slug}/outputs/${ticker}`)
      .then(async (res) => {
        if (res.status === 404) return; // no prior output — stay empty
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        const output = json as RunResponse["output"];
        output.raw_html = stripHtmlFences(output.raw_html);
        setResult({ cached: true, output });
      })
      .catch(() => {}); // silently ignore — user can still Run
  }, [slug, ticker]);

  function runSkill(force = false) {
    setRunning(true);
    setError(null);

    fetch(`${BACKEND_URL}/api/html-skills/${slug}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, force }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status} ${res.statusText}`);
        const r = json as RunResponse;
        r.output.raw_html = stripHtmlFences(r.output.raw_html);
        setResult(r);
      })
      .catch((err) => setError(err.message ?? "Run failed"))
      .finally(() => setRunning(false));
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
