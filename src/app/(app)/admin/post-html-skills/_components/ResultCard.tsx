"use client";

import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { PostHtmlResult, POST_HTML_TYPE_LABELS } from "./types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ResultCard({ result }: { result: PostHtmlResult }) {
  const [open, setOpen] = useState(true);
  const r = result.result ?? {};
  const score = typeof r.score === "number" ? r.score : null;
  const verdict = typeof r.verdict === "string" ? r.verdict : null;
  const headline = typeof r.headline === "string" ? r.headline : null;
  const summary = typeof r.summary === "string" ? r.summary : null;
  const keyPoints = Array.isArray(r.key_points) ? (r.key_points as unknown[]).filter((x) => typeof x === "string") as string[] : [];

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        <span className="text-[13px] font-semibold text-[#0F172B]">
          {POST_HTML_TYPE_LABELS[result.type] ?? result.type}
        </span>
        {verdict && (
          <span
            className={`text-[10px] font-medium rounded-sm px-2 py-0.5 ${
              verdict === "ACHIEVED" || verdict === "HIGH"
                ? "bg-emerald-50 text-emerald-700"
                : verdict === "MISSED" || verdict === "LOW"
                ? "bg-red-50 text-red-700"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {verdict}
          </span>
        )}
        {score !== null && <span className="text-[11px] text-[#888888]">score {score}</span>}
        {(result.fiscal_year || result.quarter) && (
          <span className="text-[11px] text-[#888888] font-mono">
            {result.quarter ?? ""} {result.fiscal_year ?? ""}
          </span>
        )}
        <div className="flex-1" />
        <span className="flex items-center gap-1 text-[10px] text-[#888888]">
          <Clock className="size-3" />
          {timeAgo(result.updated_at)}
        </span>
        <span className="text-[10px] text-[#888888]">
          {result.input_tokens + result.output_tokens} tok · ${result.cost_usd?.toFixed(5) ?? "—"}
        </span>
        <ChevronDown className={`size-3.5 text-[#888888] transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-[#F0F0F0] px-4 py-3 space-y-3 bg-[#FAFAFA]">
          {headline && <p className="text-[13px] font-medium text-[#0F172B]">{headline}</p>}
          {summary && <p className="text-[13px] text-[#121212] leading-relaxed">{summary}</p>}
          {keyPoints.length > 0 && (
            <ul className="space-y-1">
              {keyPoints.map((kp, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-[#121212]">
                  <span className="mt-1.5 size-1 rounded-full bg-zinc-400 shrink-0" />
                  {kp}
                </li>
              ))}
            </ul>
          )}
          <details className="pt-1">
            <summary className="text-[11px] text-[#888888] cursor-pointer hover:text-[#0F172B]">Raw result JSON</summary>
            <pre className="mt-2 rounded-md bg-white border border-[#E2E2E2] p-3 text-[11px] text-[#121212] overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </details>
          <p className="text-[10px] text-[#888888]">{result.model}</p>
        </div>
      )}
    </div>
  );
}
