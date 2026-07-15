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
      <div className="flex flex-col w-full max-w-[720px] max-h-[85vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-ink">Truncated Chunks</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-[12px] text-ink-3">
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
                    ? "border-[var(--qc-ink)] bg-ink text-[var(--qc-on-dark)]"
                    : "border-hair text-ink hover:border-[var(--qc-ink)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {previewError && !previewLoading && (
            <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
              <AlertCircle className="size-4 shrink-0" /> {previewError}
            </div>
          )}
          {splitError && (
            <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
              <AlertCircle className="size-4 shrink-0" /> {splitError}
            </div>
          )}

          {previewLoading && !jobs && (
            <div className="flex items-center gap-2 text-sm text-ink-3">
              <Loader2 className="size-4 animate-spin" /> Scanning queues…
            </div>
          )}

          {splitResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md border border-up bg-up-soft px-4 py-3 text-sm text-up">
                <CheckCircle2 className="size-4 shrink-0" />
                Split &amp; requeued {splitResult.succeeded} of {splitResult.processed}
                {splitResult.failed > 0 ? ` — ${splitResult.failed} couldn't be split further` : ""}.
              </div>
              <div className="rounded-[10px] border border-hair bg-card overflow-hidden max-h-[160px] overflow-y-auto">
                {splitResult.results.map((r, i) => (
                  <div
                    key={`${r.queue}-${r.originalJobId}-${i}`}
                    className="px-3 py-2 border-b border-hair last:border-0 text-[11px]"
                  >
                    <span className="font-medium text-ink font-mono">#{r.originalJobId}</span>{" "}
                    <span className="text-ink-3">({r.originalRange})</span>{" "}
                    {r.success ? (
                      <span className="text-up">
                        → {r.newJobs?.map((j) => `#${j.id} (${j.pages})`).join(", ")}
                      </span>
                    ) : (
                      <span className="text-down">{r.error}</span>
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
                <p className="text-[12px] text-ink-3">No truncated jobs in this scope.</p>
              ) : (
                <div className="rounded-[10px] border border-hair bg-card overflow-hidden max-h-[320px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0">
                      <tr className="bg-secondary border-b border-hair">
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Job</th>
                        {queue === "all" && (
                          <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Queue</th>
                        )}
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Pages</th>
                        <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-ink-3">Chunk</th>
                        <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-ink-3">Attempts</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Failed Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr key={`${j.queue}-${j.id}`} className="border-b border-hair last:border-0">
                          <td className="px-3 py-2 text-ink font-medium font-mono">#{j.id}</td>
                          {queue === "all" && (
                            <td className="px-3 py-2 text-ink-3">{QUEUE_LABEL[j.queue] ?? j.queue}</td>
                          )}
                          <td className="px-3 py-2 text-ink font-mono">{j.pages}</td>
                          <td className="px-3 py-2 text-right text-ink-3">
                            {j.chunkIndex + 1}/{j.totalChunks}
                          </td>
                          <td className="px-3 py-2 text-right text-ink-3">{j.attemptsMade}</td>
                          <td className="px-3 py-2 text-ink-3 max-w-[220px] truncate" title={j.failedReason}>
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
        <div className="flex items-center gap-3 flex-wrap border-t border-hair px-5 py-3 shrink-0">
          <button
            onClick={doPreview}
            disabled={previewLoading}
            className="flex items-center gap-1.5 rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40"
          >
            {previewLoading && <Loader2 className="size-3.5 animate-spin" />}
            {jobs ? "Refresh Preview" : "Load Preview"}
          </button>

          <button
            onClick={handleSplitClick}
            disabled={!canSplit}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${
              confirmArmed ? "bg-down hover:opacity-90" : "bg-ink hover:opacity-90"
            }`}
          >
            {splitting && <Loader2 className="size-3.5 animate-spin" />}
            {confirmArmed ? "Confirm Split & Requeue" : "Split & Requeue All"}
          </button>

          {confirmArmed && (
            <button onClick={() => setConfirmArmed(false)} className="text-sm text-ink-3 hover:text-ink">
              Cancel
            </button>
          )}

          <span className="text-[11px] text-ink-3">
            {confirmArmed
              ? `This splits and requeues ${jobs?.length ?? 0} job${jobs?.length === 1 ? "" : "s"} now.`
              : "Load Preview first to see what would be split."}
          </span>
        </div>
      </div>
    </div>
  );
}
