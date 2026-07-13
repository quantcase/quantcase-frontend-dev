"use client";

import { X, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { PostHtmlConfigPreviewResponse } from "./types";

interface Props {
  ticker: string;
  loading: boolean;
  error: string | null;
  preview: PostHtmlConfigPreviewResponse | null;
  onClose: () => void;
}

export function ConfigPreviewModal({ ticker, loading, error, preview, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] rounded-[10px] bg-white border border-[#E2E2E2] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2E2E2] shrink-0">
          <span className="text-[14px] font-semibold text-[#0F172B]">Prompt preview</span>
          <span className="text-[11px] text-[#888888]">{ticker} — dry run, no LLM call</span>
          <button onClick={onClose} className="ml-auto text-[#888888] hover:text-[#0F172B]">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-[13px] text-[#888888]">
              <Loader2 className="size-4 animate-spin" /> Building preview…
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}

          {preview && !loading && (
            <>
              {/* Source availability */}
              {preview.sourceMeta?.lenses && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                    Lens HTML availability
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.sourceMeta.lenses.map((l) => (
                      <span
                        key={l.slug}
                        title={l.available ? `${l.fiscal_year ?? ""} ${l.quarter ?? ""}`.trim() : "No data available"}
                        className={`flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium ${
                          l.available ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {l.available ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                        {l.slug}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {preview.sourceMeta?.sourceTypes && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                    L3 source types found
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.sourceMeta.sourceTypes.map((t) => (
                      <span key={t} className="flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="size-3" /> {t}
                      </span>
                    ))}
                    {preview.sourceMeta.sourceTypes.length === 0 && (
                      <span className="text-[11px] text-[#888888]">None found — L4 needs at least one L3 result first.</span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">Data block</p>
                <pre className="rounded-md bg-[#F5F5F5] border border-[#E2E2E2] p-3 text-[11px] text-[#121212] overflow-x-auto whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {preview.dataBlock || "(empty)"}
                </pre>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">Full prompt</p>
                <pre className="rounded-md bg-[#F5F5F5] border border-[#E2E2E2] p-3 text-[11px] text-[#121212] overflow-x-auto whitespace-pre-wrap max-h-[320px] overflow-y-auto">
                  {preview.prompt}
                </pre>
              </div>

              <p className="text-[10px] text-[#888888]">
                {preview.config.name} · {preview.config.model ?? "default model"} · updated {new Date(preview.config.updated_at).toLocaleString()}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
