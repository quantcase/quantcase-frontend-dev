"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { SignalSourceDocType, PipelineSignal, PipelineSignalsResponse } from "./types";

const BASE = `${BACKEND_URL}/admin/pipeline-jobs`;
const SIZE = 20;

const INPUT_CLS =
  "rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-mono text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B]";

const DOC_TYPE_OPTIONS: { value: SignalSourceDocType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "transcript", label: "Transcript" },
  { value: "ppt", label: "PPT" },
  { value: "annual_report", label: "Annual Report" },
];

const DOC_TYPE_LABEL: Record<SignalSourceDocType, string> = {
  transcript: "Transcript",
  ppt: "PPT",
  annual_report: "Annual Report",
};

function humanize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  onClose: () => void;
}

// GET /admin/pipeline-jobs/signals requires a ticker — an unscoped query times out (11.8M rows,
// no date index). Nothing fires until the admin searches a specific ticker; after that, page/
// isInvalidated/sourceDocType changes re-fetch automatically since the scoped query is sub-second.
export function SignalBrowserModal({ onClose }: Props) {
  const [tickerInput, setTickerInput] = useState("");
  const [appliedTicker, setAppliedTicker] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isInvalidated, setIsInvalidated] = useState(false);
  const [docType, setDocType] = useState<SignalSourceDocType | "all">("all");

  const [data, setData] = useState<PipelineSignalsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appliedTicker) return;
    const params = new URLSearchParams({
      ticker: appliedTicker,
      page: String(page),
      size: String(SIZE),
      isInvalidated: String(isInvalidated),
    });
    if (docType !== "all") params.set("sourceDocType", docType);

    rawFetch<PipelineSignalsResponse>(`${BASE}/signals?${params}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: setData,
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, [appliedTicker, page, isInvalidated, docType]);

  function handleSearch() {
    const t = tickerInput.trim().toUpperCase();
    if (!t) return;
    setData(null);
    setPage(1);
    setAppliedTicker(t);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / (data.size || SIZE))) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[840px] max-h-[85vh] rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E2E2] px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-[#0F172B]">Signal Browser</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-[#888888] hover:text-[#0F172B] hover:border-[#E2E2E2] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-[12px] text-[#888888]">
            Browse extracted signals for a single ticker — search is required, since an unscoped scan
            of the signals table would time out.
          </p>

          {/* Ticker search */}
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Ticker
              </label>
              <input
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="e.g. CERA"
                className={`${INPUT_CLS} w-40 uppercase`}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!tickerInput.trim() || loading}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
              Search
            </button>
          </div>

          {appliedTicker && (
            <>
              {/* Filters */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                  {DOC_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setDocType(opt.value); setPage(1); }}
                      className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                        docType === opt.value
                          ? "border-[#0F172B] bg-[#0F172B] text-white"
                          : "border-[#E2E2E2] text-[#0F172B] hover:border-[#0F172B]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="inline-flex rounded-md border border-[#E2E2E2] p-0.5 bg-[#F5F5F5]">
                  {[
                    { v: false, label: "Normal" },
                    { v: true, label: "Invalidated" },
                  ].map((opt) => (
                    <button
                      key={String(opt.v)}
                      onClick={() => { setIsInvalidated(opt.v); setPage(1); }}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                        isInvalidated === opt.v ? "bg-white text-[#0F172B] shadow-sm" : "text-[#888888] hover:text-[#0F172B]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && !loading && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="size-4 shrink-0" /> {error}
                </div>
              )}

              {loading && !data && (
                <div className="flex items-center gap-2 text-sm text-[#888888]">
                  <Loader2 className="size-4 animate-spin" /> Loading signals…
                </div>
              )}

              {data && (
                <>
                  <p className="text-[11px] text-[#888888]">
                    {data.total.toLocaleString("en-IN")} signal{data.total === 1 ? "" : "s"} for{" "}
                    <span className="font-medium text-[#0F172B]">{appliedTicker}</span>
                    {docType !== "all" ? ` · ${DOC_TYPE_LABEL[docType]}` : ""}
                    {isInvalidated ? " · invalidated only" : ""}
                  </p>

                  {data.signals.length === 0 ? (
                    <p className="text-[12px] text-[#888888]">No signals in this scope.</p>
                  ) : (
                    <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Period</th>
                            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Doc Type</th>
                            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Signal Type</th>
                            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Model</th>
                            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.signals.map((s: PipelineSignal) => (
                            <tr key={s.id} className="border-b border-[#F0F0F0] last:border-0">
                              <td className="px-3 py-2 text-[#0F172B] font-medium whitespace-nowrap">
                                {s.fiscalYear} {s.quarter}
                              </td>
                              <td className="px-3 py-2 text-[#888888] whitespace-nowrap">{DOC_TYPE_LABEL[s.sourceDocType] ?? s.sourceDocType}</td>
                              <td className="px-3 py-2 text-[#0F172B] whitespace-nowrap">{humanize(s.signalType)}</td>
                              <td className="px-3 py-2 text-[#888888] font-mono whitespace-nowrap">{s.extractorModel}</td>
                              <td className="px-3 py-2 text-[#888888] whitespace-nowrap">{new Date(s.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || loading}
                      className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-3 py-1.5 text-[12px] font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="size-3.5" /> Prev
                    </button>
                    <span className="text-[12px] text-[#888888]">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || loading}
                      className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-3 py-1.5 text-[12px] font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
