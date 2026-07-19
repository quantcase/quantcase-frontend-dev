"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, RefreshCw } from "lucide-react";
import type { InsightStatus } from "@/hooks/useTechnicals";
import type { TechnicalsScores } from "@/types/technicals";
import { TechnicalsScoreDial } from "./TechnicalsScoreDial";

function Shimmer({ height, width, rounded = 8 }: { height: number; width?: string; rounded?: number }) {
  return <div className="skeleton-shimmer" style={{ height, width: width ?? "100%", borderRadius: rounded }} />;
}

function ElapsedNote() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)" }}>
      {seconds}s elapsed
    </span>
  );
}

interface Props {
  status: Exclude<InsightStatus, "ready">;
  progress?: number | null;
  onRetry: () => void;
  isRefreshing: boolean;
  scores?: TechnicalsScores | null;
}

const COPY: Record<Exclude<InsightStatus, "ready" | "generating">, { label: string; body: string }> = {
  failed: {
    label: "Failed",
    body: "The AI analysis job failed. All technical data on this page is live and complete — retry the analysis below.",
  },
  absent: {
    label: "Not Generated",
    body: "No AI analysis has been generated for this stock yet. All technical data on this page is live — you can request one below.",
  },
  unavailable: {
    label: "Still Working",
    body: "The AI analysis is taking longer than expected. All technical data on this page is live — check back shortly or retry below.",
  },
};

/**
 * Rendered in place of the banner while `decisionIntelligence` is null. Mirrors
 * the banner's outer shell so the sticky rail doesn't jump when the real
 * insight arrives.
 */
export function DecisionIntelligenceState({ status, progress, onRetry, isRefreshing, scores = null }: Props) {
  const generating = status === "generating";
  const copy = generating ? null : COPY[status];

  return (
    <div style={{
      background: "var(--qc-section)",
      border: "1px solid var(--qc-hair)",
      borderRadius: 18,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      {/* Header — identical to the banner's */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 2px" }}>
        <div style={{ padding: 6, borderRadius: 8, display: "grid", placeItems: "center", border: "1px solid var(--qc-hair)", background: "var(--qc-chip)" }}>
          <Brain style={{ width: 14, height: 14, color: "var(--qc-ink)" }} />
        </div>
        <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", letterSpacing: "0.01em", fontFamily: "var(--qc-font-sans)" }}>
          Decision Intelligence
        </span>
        {/* The score is computed server-side from price data, so it is available
            even while the AI narrative is still generating. */}
        <div style={{ flex: 1 }} />
        <TechnicalsScoreDial scores={scores} />
      </div>

      <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14, overflow: "hidden" }}>
        {/* Status row — blue is the token reserved for processing jobs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "10px 14px",
          background: generating ? "var(--qc-blue-soft)" : "var(--qc-section)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {generating && (
              <Loader2
                className="animate-spin"
                style={{ width: 13, height: 13, color: "var(--qc-blue)" }}
              />
            )}
            <span style={{
              fontFamily: "var(--qc-font-mono)",
              fontSize: "var(--qc-fz-9)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: generating ? "var(--qc-blue)" : "var(--qc-ink-2)",
            }}>
              {generating ? "Generating" : copy!.label}
            </span>
            {generating && progress != null && (
              <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-blue)" }}>
                {Math.round(progress)}%
              </span>
            )}
          </div>
          {generating && <ElapsedNote />}
        </div>

        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.55, fontFamily: "var(--qc-font-sans)" }}>
            {generating
              ? "AI analysis is generating — this usually takes 60–90 seconds. The technical data on this page is live and complete; the narrative will appear here automatically."
              : copy!.body}
          </p>

          {generating ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Shimmer height={52} rounded={10} />
              <div className="grid grid-cols-2" style={{ gap: 8 }}>
                {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} height={56} rounded={10} />)}
              </div>
              {Array.from({ length: 3 }).map((_, i) => <Shimmer key={i} height={36} rounded={8} />)}
            </div>
          ) : (
            <button
              onClick={onRetry}
              disabled={isRefreshing}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                width: "100%", padding: "9px 14px",
                background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 10,
                cursor: isRefreshing ? "not-allowed" : "pointer",
                opacity: isRefreshing ? 0.6 : 1,
              }}
            >
              <RefreshCw style={{ width: 12, height: 12, color: "var(--qc-ink-2)" }} />
              <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink)", textTransform: "uppercase" }}>
                Try Again
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
