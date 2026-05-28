"use client";

import type { JobStatus } from "@/types/management";

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

interface ReanalyzeButtonProps {
  isAnalyzing: boolean;
  aggregateStatus: JobStatus | null;
  progress: number;
  analyzedAt: string | null;
  analyzeError: string | null;
  onClick: () => void;
}

export function ReanalyzeButton({ isAnalyzing, aggregateStatus, progress, analyzedAt, analyzeError, onClick }: ReanalyzeButtonProps) {
  const label = isAnalyzing
    ? aggregateStatus === "pending" ? "Queued…"
    : aggregateStatus === "processing" ? `Analyzing… ${progress}%`
    : "Starting…"
    : "Reanalyze";

  return (
    <div className="flex flex-col items-end gap-1">
      {isAnalyzing && (
        <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: "var(--qc-hair)" }}>
          <div
            className="h-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%`, background: "var(--qc-ink)" }}
          />
        </div>
      )}
      <button
        onClick={onClick}
        disabled={isAnalyzing}
        style={{
          fontSize: "var(--qc-fz-12)",
          fontWeight: "var(--qc-w-semi)",
          fontFamily: "var(--qc-font-sans)",
          color: isAnalyzing ? "var(--qc-ink-2)" : "var(--qc-on-dark)",
          background: isAnalyzing ? "var(--qc-section)" : "var(--qc-ink)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 6,
          padding: "6px 14px",
          cursor: isAnalyzing ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </button>
      {analyzedAt && !isAnalyzing && (
        <span style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>
          Updated {formatRelativeTime(analyzedAt)}
        </span>
      )}
      {analyzeError && (
        <span style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-down)" }}>{analyzeError}</span>
      )}
    </div>
  );
}
