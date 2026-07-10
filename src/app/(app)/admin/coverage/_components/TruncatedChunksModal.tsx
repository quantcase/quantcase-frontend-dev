"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { rawFetch, rawPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { MetricTile } from "@/components/molecules/metric-tile";
import { PipelineJobQueue, TruncatedJob, TruncatedJobsResponse, SplitRetryResponse } from "./types";

const BASE = `${BACKEND_URL}/admin/pipeline-jobs`;

const QUEUE_OPTIONS: { value: PipelineJobQueue | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "summarization_v2", label: "Transcript" },
  { value: "summarization_v2_ppt", label: "PPT" },
  { value: "summarization_v2_annual_report", label: "Annual Report" },
];

const QUEUE_LABEL: Record<string, string> = {
  summarization_v2: "Transcript",
  summarization_v2_ppt: "PPT",
  summarization_v2_annual_report: "Annual Report",
};

interface Props {
  onClose: () => void;
}

// Preview and Split-Retry both scan live BullMQ queues — neither fires until the admin explicitly
// clicks a button inside the modal (no auto-fetch on open/mount), same as the KPI Cleanup modal.
export function TruncatedChunksModal({ onClose }: Props) {
  const [queue, setQueue] = useState<PipelineJobQueue | "all">("all");
  const [jobs, setJobs] = useState<TruncatedJob[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [confirmArmed, setConfirmArmed] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [splitResult, setSplitResult] = useState<SplitRetryResponse | null>(null);

  function queryParam(): string {
    return queue === "all" ? "" : `?queue=${queue}`;
  }

  function doPreview() {
    rawFetch<TruncatedJobsResponse>(`${BASE}/truncated${queryParam()}`, {
      onStart: () => {
        setPreviewLoading(true);
        setPreviewError(null);
        setConfirmArmed(false);
        setSplitResult(null);
        setSplitError(null);
      },
      onSuccess: (res) => setJobs(res.jobs ?? []),
      onError: setPreviewError,
      onComplete: () => setPreviewLoading(false),
    });
  }

  function selectQueue(q: PipelineJobQueue | "all") {
    setQueue(q);
    setJobs(null);
    setSplitResult(null);
    setConfirmArmed(false);
  }

  function handleSplitClick() {
    if (!confirmArmed) { setConfirmArmed(true); return; }
    rawPost<SplitRetryResponse>(`${BASE}/truncated/split-retry${queryParam()}`, {
      onStart: () => { setSplitting(true); setSplitError(null); },
      onSuccess: (res) => { setSplitResult(res); setConfirmArmed(false); doPreview(); },
      onError: setSplitError,
      onComplete: () => setSplitting(false),
    });
  }

  const canSplit = !!jobs && jobs.length > 0 && !previewLoading && !splitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[720px] max-h-[85vh] rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E2E2] px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-[#0F172B]">Truncated Chunks</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-[#888888] hover:text-[#0F172B] hover:border-[#E2E2E2] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-[12px] text-[#888888]">
            Jobs that failed because the LLM response hit the token limit mid-output. Splitting halves
            the page range and requeues both halves. Everything else — rate limits, credits, PDF-parse,
            timeouts — stays in Bull Board, not shown here.
          </p>

          {/* Queue filter */}
          <div className="flex gap-2 flex-wrap">
            {QUEUE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectQueue(opt.value)}
                className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  queue === opt.value
                    ? "border-[#0F172B] bg-[#0F172B] text-white"
                    : "border-[#E2E2E2] text-[#0F172B] hover:border-[#0F172B]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {previewError && !previewLoading && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" /> {previewError}
            </div>
          )}
          {splitError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" /> {splitError}
            </div>
          )}

          {previewLoading && !jobs && (
            <div className="flex items-center gap-2 text-sm text-[#888888]">
              <Loader2 className="size-4 animate-spin" /> Scanning queues…
            </div>
          )}

          {splitResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0" />
                Split &amp; requeued {splitResult.succeeded} of {splitResult.processed}
                {splitResult.failed > 0 ? ` — ${splitResult.failed} couldn't be split further` : ""}.
              </div>
              <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden max-h-[160px] overflow-y-auto">
                {splitResult.results.map((r, i) => (
                  <div
                    key={`${r.queue}-${r.originalJobId}-${i}`}
                    className="px-3 py-2 border-b border-[#F0F0F0] last:border-0 text-[11px]"
                  >
                    <span className="font-medium text-[#0F172B] font-mono">#{r.originalJobId}</span>{" "}
                    <span className="text-[#888888]">({r.originalRange})</span>{" "}
                    {r.success ? (
                      <span className="text-emerald-600">
                        → {r.newJobs?.map((j) => `#${j.id} (${j.pages})`).join(", ")}
                      </span>
                    ) : (
                      <span className="text-red-600">{r.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobs && !previewLoading && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="Truncated Jobs" value={String(jobs.length)} />
                <MetricTile label="Queues Affected" value={String(new Set(jobs.map((j) => j.queue)).size)} />
              </div>

              {jobs.length === 0 ? (
                <p className="text-[12px] text-[#888888]">No truncated jobs in this scope.</p>
              ) : (
                <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden max-h-[320px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0">
                      <tr className="bg-[#F5F5F5] border-b border-[#E2E2E2]">
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Job</th>
                        {queue === "all" && (
                          <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Queue</th>
                        )}
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Pages</th>
                        <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">Chunk</th>
                        <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#888888]">Attempts</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#888888]">Failed Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr key={`${j.queue}-${j.id}`} className="border-b border-[#F0F0F0] last:border-0">
                          <td className="px-3 py-2 text-[#0F172B] font-medium font-mono">#{j.id}</td>
                          {queue === "all" && (
                            <td className="px-3 py-2 text-[#888888]">{QUEUE_LABEL[j.queue] ?? j.queue}</td>
                          )}
                          <td className="px-3 py-2 text-[#0F172B] font-mono">{j.pages}</td>
                          <td className="px-3 py-2 text-right text-[#888888]">
                            {j.chunkIndex + 1}/{j.totalChunks}
                          </td>
                          <td className="px-3 py-2 text-right text-[#888888]">{j.attemptsMade}</td>
                          <td className="px-3 py-2 text-[#888888] max-w-[220px] truncate" title={j.failedReason}>
                            {j.failedReason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap border-t border-[#E2E2E2] px-5 py-3 shrink-0">
          <button
            onClick={doPreview}
            disabled={previewLoading}
            className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40"
          >
            {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
            {jobs ? "Refresh Preview" : "Load Preview"}
          </button>

          <button
            onClick={handleSplitClick}
            disabled={!canSplit}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
              confirmArmed ? "bg-red-600 hover:opacity-90" : "bg-[#0F172B] hover:opacity-90"
            }`}
          >
            {splitting && <Loader2 className="size-3.5 animate-spin" />}
            {confirmArmed ? "Confirm Split & Requeue" : "Split & Requeue All"}
          </button>

          {confirmArmed && (
            <button onClick={() => setConfirmArmed(false)} className="text-sm text-[#888888] hover:text-[#0F172B]">
              Cancel
            </button>
          )}

          <span className="text-[11px] text-[#888888]">
            {confirmArmed
              ? `This splits and requeues ${jobs?.length ?? 0} job${jobs?.length === 1 ? "" : "s"} now.`
              : "Load Preview first to see what would be split."}
          </span>
        </div>
      </div>
    </div>
  );
}
