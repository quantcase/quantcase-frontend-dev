"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Target, Shield } from "lucide-react";
import type { TimeframeOption, JobCreateResponse, JobStatusResponse, JobStatus } from "@/types/management";

import { SectionPanel } from "@/components/molecules/section-panel";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { ScreenerScorecard } from "@/components/molecules/screener-scorecard";
import { GuidanceTrackTable, GuidanceFilterControls, useGuidanceFilterState } from "@/components/management/guidance-track-table";
import { PromoterSection } from "@/components/management/promoter-section";
import { RedFlagsSection } from "@/components/management/red-flags-section";
import { InvestmentThesisSection } from "@/components/management/investment-thesis-section";
import { ScoreBreakdownCard } from "@/components/management/score-breakdown-card";
import { ReanalyzeButton } from "@/components/management/reanalyze-button";
import { AnalyzePrompt } from "@/components/management/analyze-prompt";

const NAV_ITEMS = [
  { id: "section-score", label: "Score" },
  { id: "section-guidance", label: "Guidance Accuracy" },
  { id: "section-red-flags", label: "Red Flags" },
  { id: "section-thesis", label: "Investment Thesis" },
  { id: "section-promoter", label: "Promoter Activity" },
];

function mqiLabelToLevel(label: string): string {
  const l = label.toLowerCase();
  if (l === "high" || l === "strong" || l === "good") return "HIGH";
  if (l === "low" || l === "poor" || l === "weak") return "LOW";
  return label;
}

function pctToRating(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "HIGH";
  if (pct >= 0.4) return "MODERATE";
  return "LOW";
}

function ManagementDashboardContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [selectedTimeframe] = useState<TimeframeOption>("rolling_3_year");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [progress, setProgress] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: transcriptCalls, loading: transcriptLoading, error: transcriptError } = useTranscriptCalls(symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";
  const { data: managementData, loading: managementLoading } = useManagementAnalysis(firstCallId, selectedTimeframe);

  const loading = transcriptLoading || managementLoading;
  const guidanceFilterState = useGuidanceFilterState();

  const allStatuses = Object.values(jobStatuses);
  const aggregateStatus: JobStatus | null = allStatuses.length === 0
    ? null
    : allStatuses.some(s => s === "failed") ? "failed"
    : allStatuses.every(s => s === "completed") ? "completed"
    : allStatuses.some(s => s === "processing") ? "processing"
    : "pending";

  const stopPolling = () => {
    if (pollingIntervalRef.current) { clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null; }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
  };

  const pollAllJobs = (ids: string[]) => {
    ids.forEach(jobId => {
      apiCall<JobStatusResponse>(`${BACKEND_URL}/api/jobs/${jobId}`, {
        onSuccess: (response) => {
          const status = response.data.status;
          setJobStatuses(prev => {
            const updated = { ...prev, [jobId]: status };
            const statuses = Object.values(updated);
            if (statuses.every(s => s === "completed")) {
              setProgress(100);
              stopPolling();
              setIsAnalyzing(false);
              setTimeout(() => window.location.reload(), 1000);
            } else if (statuses.some(s => s === "failed")) {
              stopPolling();
              setIsAnalyzing(false);
              setAnalyzeError(response.data.error || "One or more jobs failed");
            }
            return updated;
          });
        },
        onError: (error: string) => {
          stopPolling();
          setIsAnalyzing(false);
          setAnalyzeError(error);
        },
      });
    });
  };

  const handleAnalyzeClick = async () => {
    setAnalyzeError(null);
    setJobStatuses({});
    setProgress(0);
    setIsAnalyzing(true);

    try {
      const jobId = await new Promise<string>((resolve, reject) => {
        apiPost<JobCreateResponse>(`${BACKEND_URL}/api/management/${firstCallId}/analyze`, {
          onSuccess: (response) => resolve(response.job.id),
          onError: reject,
        });
      });

      setJobStatuses({ [jobId]: "pending" });
      pollAllJobs([jobId]);
      pollingIntervalRef.current = setInterval(() => pollAllJobs([jobId]), 2000);
    } catch (error: unknown) {
      setIsAnalyzing(false);
      setAnalyzeError(error instanceof Error ? error.message : "Failed to start analysis");
    }
  };

  useEffect(() => { return () => stopPolling(); }, []);

  useEffect(() => {
    if (aggregateStatus === "processing") {
      const totalDuration = 40000;
      const targetProgress = 95;
      const updateInterval = 100;
      const progressPerStep = targetProgress / (totalDuration / updateInterval);
      let currentProgress = 0;

      progressIntervalRef.current = setInterval(() => {
        currentProgress += progressPerStep;
        if (currentProgress >= targetProgress) {
          currentProgress = targetProgress;
          if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
        }
        setProgress(Math.round(currentProgress));
      }, updateInterval);
    }
    return () => {
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    };
  }, [aggregateStatus]);

  if (!symbol) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
        <div className="text-sm" style={{ color: "var(--qc-down)" }}>Error: No symbol provided in query parameters</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
        <div className="text-sm" style={{ color: "var(--qc-ink-2)" }}>Loading...</div>
      </div>
    );
  }

  if (transcriptError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
        <div className="text-sm" style={{ color: "var(--qc-down)" }}>Error: {transcriptError}</div>
      </div>
    );
  }

  if (transcriptCalls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
        <div className="text-sm" style={{ color: "var(--qc-ink-2)" }}>No transcript calls found for {symbol}</div>
      </div>
    );
  }

  if (Object.keys(managementData).length === 0) {
    return (
      <AnalyzePrompt
        transcriptCall={transcriptCalls[0]}
        isAnalyzing={isAnalyzing}
        aggregateStatus={aggregateStatus}
        progress={progress}
        analyzeError={analyzeError}
        onAnalyze={handleAnalyzeClick}
      />
    );
  }

  const hitRate = managementData.guidance_vs_actuals?.hit_rate;
  const hitRatePct = hitRate && hitRate.total_trackable > 0
    ? Math.round((hitRate.met_or_beat / hitRate.total_trackable) * 100)
    : null;

  const dims = managementData.mqi_score?.dimensions;
  const scorecardItems = dims ? [
    {
      label: "Guidance",
      descriptor: hitRate ? `${hitRatePct}% hit rate` : `${dims.guidance_accuracy.score} / ${dims.guidance_accuracy.max} points`,
      rating: pctToRating(dims.guidance_accuracy.score, dims.guidance_accuracy.max),
      barValue: dims.guidance_accuracy.max > 0 ? (dims.guidance_accuracy.score / dims.guidance_accuracy.max) * 100 : null,
      icon: Target,
      scrollToId: "section-guidance",
    },
    {
      label: "Red Flags",
      descriptor: `${dims.red_flags.score} / ${dims.red_flags.max} points`,
      rating: pctToRating(dims.red_flags.score, dims.red_flags.max),
      barValue: dims.red_flags.max > 0 ? (dims.red_flags.score / dims.red_flags.max) * 100 : null,
      icon: Shield,
      scrollToId: "section-red-flags",
    },
  ] : [];

  return (
    <ScreenerPageShell
      navItems={NAV_ITEMS}
      headerRight={
        <ReanalyzeButton
          isAnalyzing={isAnalyzing}
          aggregateStatus={aggregateStatus}
          progress={progress}
          analyzedAt={managementData.analyzedAt ?? null}
          analyzeError={analyzeError}
          onClick={handleAnalyzeClick}
        />
      }
    >
      <div className="mb-8 px-4 space-y-6 pt-4">

        {/* Score row */}
        <div id="section-score" className="flex gap-4 items-stretch">
          <div style={{ flex: "0 0 40%", minWidth: 0 }}>
            <ScreenerScorecard
              title="VERDICT"
              overallLevel={managementData.mqi_score ? mqiLabelToLevel(managementData.mqi_score.label) : undefined}
              score={managementData.mqi_score?.total ?? 0}
              maxScore={100}
              items={scorecardItems}
              verdictAfter={managementData.management_intelligence?.key_takeaways?.[0] ?? undefined}
              verdictSubtitle={managementData.management_intelligence?.recommended_strategy?.thesis ?? undefined}
            />
          </div>
          {managementData.mqi_score && managementData.management_intelligence && (
            <div style={{ flex: "0 0 60%", minWidth: 0 }}>
              <ScoreBreakdownCard
                mqiScore={managementData.mqi_score}
                signals={managementData.management_intelligence.signals_breakdown}
                action={managementData.management_intelligence?.recommended_strategy?.action ?? undefined}
                rationale={managementData.management_intelligence?.recommended_strategy?.rationale ?? undefined}
              />
            </div>
          )}
        </div>

        {/* Guidance Accuracy */}
        <div id="section-guidance">
          <SectionPanel
            title="Guidance Track Record"
            headerAction={
              hitRatePct !== null ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-0.5 rounded-xl px-4 py-2 min-w-[90px]" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
                    <span style={{ fontSize: 10, fontWeight: 500, color: "var(--qc-ink-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hit Rate</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-ink)", lineHeight: 1.4 }}>{hitRatePct}%</span>
                  </div>
                  {managementData.guidance_vs_actuals?.guidance_bias && (
                    <div className="flex flex-col items-end gap-0.5 rounded-xl px-4 py-2 min-w-[90px]" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--qc-ink-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Bias</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-ink)", lineHeight: 1.4 }}>{managementData.guidance_vs_actuals.guidance_bias}</span>
                    </div>
                  )}
                </div>
              ) : undefined
            }
            subHeader={<GuidanceFilterControls state={guidanceFilterState} />}
          >
            <GuidanceTrackTable rows={managementData.guidance_vs_actuals?.rows ?? []} filterState={guidanceFilterState} />
          </SectionPanel>
        </div>

        {/* Red Flags */}
        {managementData.red_flags && managementData.red_flags.length > 0 && (
          <div id="section-red-flags">
            <RedFlagsSection flags={managementData.red_flags} />
          </div>
        )}

        {/* Investment Thesis */}
        {managementData.investment_thesis && (
          <div id="section-thesis">
            <InvestmentThesisSection thesis={managementData.investment_thesis} />
          </div>
        )}

        {/* Promoter Activity */}
        {managementData.promoter_activity && (
          <div id="section-promoter">
            <PromoterSection
              promoterActivity={managementData.promoter_activity}
              mqiScore={managementData.mqi_score}
            />
          </div>
        )}

      </div>
    </ScreenerPageShell>
  );
}

export default function ManagementDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <ManagementDashboardContent />
    </Suspense>
  );
}
