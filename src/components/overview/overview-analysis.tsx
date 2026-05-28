"use client";

interface OverviewAnalyzePromptProps {
  isAnalyzing: boolean;
  jobStatus: string | null;
  progress: number;
  analyzeError: string | null;
  onAnalyze: () => void;
  callId: string;
}

export function OverviewAnalyzePrompt({
  isAnalyzing,
  jobStatus,
  progress,
  analyzeError,
  onAnalyze,
  callId,
}: OverviewAnalyzePromptProps) {
  const buttonLabel = isAnalyzing
    ? jobStatus === "pending" ? "Queued..."
    : jobStatus === "processing" ? "Processing..."
    : "Starting..."
    : "Run Overview Analysis";

  return (
    <div
      className="rounded-[10px] p-5 space-y-4"
      style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
    >
      <div>
        <p style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-mono)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginBottom: 4 }}>
          Overview Analysis
        </p>
        <p style={{ fontSize: "var(--qc-fz-14)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)" }}>
          Generate an AI-synthesized overview combining management quality, opportunity, deal attractiveness, and technicals into a single investment verdict.
        </p>
      </div>

      {callId && (
        <p style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-3)" }}>{callId}</p>
      )}

      {analyzeError && (
        <p style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-down)" }}>{analyzeError}</p>
      )}

      {jobStatus === "processing" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-blue, #2563EB)" }}>Synthesizing analysis...</p>
            <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-blue, #2563EB)" }}>{progress}%</p>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "var(--qc-hair)" }}>
            <div
              className="h-full transition-all duration-300 ease-linear"
              style={{ width: `${progress}%`, background: "var(--qc-ink)" }}
            />
          </div>
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full font-semibold py-3 px-4 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--qc-ink)", color: "var(--qc-on-dark)", fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)" }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
