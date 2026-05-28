"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useAnalyzeTrigger } from "@/hooks/useAnalyzeTrigger";
import { useLenses } from "@/hooks/useLenses";
import { useSignals } from "@/hooks/useSignals";

import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { AssetActionBar } from "@/components/molecules/asset-action-bar";
import { ReanalyzeButton } from "@/components/management/reanalyze-button";
import { InsightScorecard } from "@/components/insight/insight-scorecard";
import { InsightLenses } from "@/components/insight/insight-lenses";
import { InsightSignalMap } from "@/components/insight/insight-signal-map";
import { LensDrawer } from "@/components/insight/lens-drawer";

import type { InsightType } from "@/types/analysis";
import type { TranscriptCall } from "@/types/management";


const TYPE_LABELS: Record<InsightType, string> = {
  management: "Management Factor",
  opportunity: "Opportunity Factor",
  deal: "Deal Factor",
};

const TYPE_VERDICT_LABELS: Record<InsightType, string> = {
  management: "MANAGEMENT VERDICT",
  opportunity: "OPPORTUNITY VERDICT",
  deal: "DEAL VERDICT",
};

// ─── Analyze prompt ────────────────────────────────────────────────────────────

function AnalyzePromptCard({
  transcriptCall,
  type,
  isAnalyzing,
  aggregateStatus,
  progress,
  analyzeError,
  onAnalyze,
}: {
  transcriptCall: TranscriptCall;
  type: InsightType;
  isAnalyzing: boolean;
  aggregateStatus: string | null;
  progress: number;
  analyzeError: string | null;
  onAnalyze: () => void;
}) {
  const buttonLabel = isAnalyzing
    ? aggregateStatus === "pending" ? "Queued..."
    : aggregateStatus === "processing" ? "Processing..."
    : "Starting..."
    : "Analyze";

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--qc-bg)" }}>
      <div className="w-full max-w-lg space-y-4">
        {/* Call info card */}
        <div className="rounded-[10px] p-5" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginBottom: 4 }}>
            {TYPE_LABELS[type]} Analysis
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 400, color: "var(--qc-ink)", margin: "0 0 2px" }}>{transcriptCall.company_name}</h2>
          {transcriptCall.basic_industry && (
            <p style={{ fontSize: 13, color: "var(--qc-ink-3)" }}>{transcriptCall.basic_industry}</p>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--qc-hair)" }}>
            {transcriptCall.company && (
              <div>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)" }}>Ticker</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{transcriptCall.company}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)" }}>Quarter</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)" }}>Call Date</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{transcriptCall.call_date}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)" }}>Call ID</p>
              <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "var(--qc-ink)" }}>{transcriptCall.id}</p>
            </div>
          </div>
        </div>

        {/* Action card */}
        <div className="rounded-[10px] p-5 space-y-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
          {!isAnalyzing && !analyzeError && (
            <p style={{ fontSize: 13, color: "var(--qc-ink-3)" }}>No {TYPE_LABELS[type].toLowerCase()} analysis available yet.</p>
          )}
          {analyzeError && (
            <p style={{ fontSize: 12, color: "var(--qc-down)" }}>{analyzeError}</p>
          )}
          {aggregateStatus === "processing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p style={{ fontSize: 13, color: "var(--qc-blue)" }}>Analyzing transcripts...</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-blue)" }}>{progress}%</p>
              </div>
              <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "var(--qc-blue-soft)" }}>
                <div className="h-full transition-all duration-300 ease-linear" style={{ width: `${progress}%`, background: "var(--qc-blue)" }} />
              </div>
            </div>
          )}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full font-semibold py-3 px-4 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--qc-ink)", color: "var(--qc-on-dark)", fontSize: 13 }}
          >
            {buttonLabel}
          </button>
          {transcriptCall.ppt_url && (
            <a
              href={transcriptCall.ppt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center hover:underline transition-colors"
              style={{ fontSize: 12, color: "var(--qc-ink-3)" }}
            >
              View Presentation →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty / error states ──────────────────────────────────────────────────────

function CenteredMessage({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
      <p style={{ fontSize: 13, color: error ? "var(--qc-down)" : "var(--qc-ink-3)" }}>{children}</p>
    </div>
  );
}

// ─── Dashboard layout ──────────────────────────────────────────────────────────

function InsightDashboard({
  insight,
  type,
  ticker,
}: {
  insight: import("@/types/analysis").InsightData;
  type: InsightType;
  ticker: string;
}) {
  const [activeLensSlug, setActiveLensSlug] = useState<string | null>(null);
  const { lenses: lensDetails } = useLenses(ticker);
  const { signals } = useSignals(ticker);

  const handleLensClick = useCallback((slug: string) => {
    setActiveLensSlug(slug);
  }, []);

  const activeLens = activeLensSlug
    ? (lensDetails[type] ?? []).find((l) => l.slug === activeLensSlug) ?? null
    : null;

  const lensHeading = `${TYPE_LABELS[type]} lenses`;

  return (
    <>
      <div className="mb-8 px-4 pt-4 space-y-8">
        <div id="section-score">
          <InsightScorecard insight={insight} verdictLabel={TYPE_VERDICT_LABELS[type]} onLensClick={handleLensClick} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 24, alignItems: "stretch" }}>
          {insight.lenses.length > 0 && (
            <div id="section-lenses" style={{ display: "flex", flexDirection: "column" }}>
              <InsightLenses lenses={insight.lenses} heading={lensHeading} onLensClick={handleLensClick} />
            </div>
          )}
          {insight.signal_map.length > 0 && (
            <div id="section-signal-map" style={{ display: "flex", flexDirection: "column" }}>
              <InsightSignalMap signals={insight.signal_map} heading="Signals" />
            </div>
          )}
        </div>
      </div>

      <LensDrawer lens={activeLens} signals={signals} onClose={() => setActiveLensSlug(null)} ticker={ticker} />
    </>
  );
}

// ─── Inner content (needs useSearchParams so must be wrapped in Suspense) ─────

function InsightTabContent({ type }: { type: InsightType }) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const { data: transcriptCalls, loading: callsLoading, error: callsError } = useTranscriptCalls(symbol);
  const firstCallId = transcriptCalls[0]?.id ?? "";
  const { getInsight, loading: insightLoading } = useAnalysis(symbol);
  const insight = getInsight(type);

  const { isAnalyzing, analyzeError, aggregateStatus, progress, trigger } = useAnalyzeTrigger({
    callId: firstCallId,
    types: [type],
    onComplete: () => window.location.reload(),
  });

  if (!symbol) return <CenteredMessage error>No symbol provided</CenteredMessage>;
  if (callsLoading || insightLoading) return <CenteredMessage>Loading...</CenteredMessage>;
  if (callsError) return <CenteredMessage error>Error: {callsError}</CenteredMessage>;
  if (transcriptCalls.length === 0) return <CenteredMessage>No transcript calls found for {symbol}</CenteredMessage>;

  if (!insight) {
    return (
      <AnalyzePromptCard
        transcriptCall={transcriptCalls[0]}
        type={type}
        isAnalyzing={isAnalyzing}
        aggregateStatus={aggregateStatus}
        progress={progress}
        analyzeError={analyzeError}
        onAnalyze={trigger}
      />
    );
  }

  return (
    <>
      <ScreenerPageShell
        headerRight={
          <ReanalyzeButton
            isAnalyzing={isAnalyzing}
            aggregateStatus={aggregateStatus}
            progress={progress}
            analyzedAt={insight.analyzed_at ?? null}
            analyzeError={analyzeError}
            onClick={trigger}
          />
        }
      >
        <InsightDashboard insight={insight} type={type} ticker={symbol} />
      </ScreenerPageShell>
      <AssetActionBar ticker={symbol} />
    </>
  );
}

// ─── Public component ──────────────────────────────────────────────────────────

export function InsightTab({ type }: { type: InsightType }) {
  return (
    <Suspense fallback={<CenteredMessage>Loading...</CenteredMessage>}>
      <InsightTabContent type={type} />
    </Suspense>
  );
}
