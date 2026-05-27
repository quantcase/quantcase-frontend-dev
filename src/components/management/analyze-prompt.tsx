"use client";

import type { TranscriptCall } from "@/types/management";
import type { JobStatus } from "@/types/management";

interface AnalyzePromptProps {
  transcriptCall: TranscriptCall;
  isAnalyzing: boolean;
  aggregateStatus: JobStatus | null;
  progress: number;
  analyzeError: string | null;
  onAnalyze: () => void;
}

export function AnalyzePrompt({ transcriptCall, isAnalyzing, aggregateStatus, progress, analyzeError, onAnalyze }: AnalyzePromptProps) {
  const buttonLabel = isAnalyzing
    ? aggregateStatus === "pending" ? "Queued..."
    : aggregateStatus === "processing" ? "Processing..."
    : "Starting..."
    : "Analyze";

  return (
    <div className="min-h-screen p-4" style={{ background: "var(--qc-bg)" }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-sm font-bold mb-6" style={{ color: "var(--qc-ink)" }}>Management Factor Analysis</h1>
        <div className="rounded-lg p-6" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--qc-ink)" }}>{transcriptCall.company_name}</h2>
              <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>{transcriptCall.basic_industry}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4" style={{ borderTop: "1px solid var(--qc-hair)" }}>
              <div>
                <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>Ticker</p>
                <p className="font-semibold" style={{ color: "var(--qc-ink)" }}>{transcriptCall.company}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>Quarter</p>
                <p className="font-semibold" style={{ color: "var(--qc-ink)" }}>{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>Call Date</p>
                <p className="font-semibold" style={{ color: "var(--qc-ink)" }}>{transcriptCall.call_date}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>Call ID</p>
                <p className="font-semibold text-xs" style={{ color: "var(--qc-ink)" }}>{transcriptCall.id}</p>
              </div>
            </div>
            <div className="pt-4" style={{ borderTop: "1px solid var(--qc-hair)" }}>
              <p className="text-sm mb-4" style={{ color: "var(--qc-ink-2)" }}>
                No management analysis available for this transcript yet.
              </p>
              {analyzeError && (
                <div className="mb-4 p-3 rounded-md" style={{ background: "var(--qc-down-soft)", border: "1px solid var(--qc-down)" }}>
                  <p className="text-sm" style={{ color: "var(--qc-down)" }}>{analyzeError}</p>
                </div>
              )}
              {aggregateStatus && (
                <JobStatusBanner status={aggregateStatus} progress={progress} />
              )}
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="w-full font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--qc-ink)", color: "var(--qc-on-dark)" }}
              >
                {buttonLabel}
              </button>
            </div>
            {transcriptCall.ppt_url && (
              <div className="pt-4" style={{ borderTop: "1px solid var(--qc-hair)" }}>
                <a href={transcriptCall.ppt_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "var(--qc-ink)" }}>
                  View Presentation →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobStatusBanner({ status, progress }: { status: JobStatus; progress: number }) {
  const isProgress = status === "processing" || status === "completed";
  const bg = status === "completed" ? "var(--qc-up-soft)" : status === "failed" ? "var(--qc-down-soft)" : "var(--qc-blue-soft)";
  const border = status === "completed" ? "var(--qc-up)" : status === "failed" ? "var(--qc-down)" : "var(--qc-blue)";
  const color = status === "completed" ? "var(--qc-up)" : status === "failed" ? "var(--qc-down)" : "var(--qc-blue)";

  return (
    <div className="mb-4 p-3 rounded-md" style={{ background: bg, border: `1px solid ${border}` }}>
      {isProgress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color }}>
              {status === "completed" ? "Analysis complete!" : "Analyzing transcripts..."}
            </p>
            <p className="text-sm font-semibold" style={{ color }}>{progress}%</p>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: status === "completed" ? "var(--qc-up-soft)" : "var(--qc-blue-soft)" }}>
            <div className="h-full transition-all duration-300 ease-linear" style={{ width: `${progress}%`, background: color }} />
          </div>
        </div>
      ) : (
        <p className="text-sm" style={{ color }}>
          {status === "failed" ? "Analysis failed" : "Analysis jobs queued..."}
        </p>
      )}
    </div>
  );
}
