"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Target, Shield, Briefcase } from "lucide-react";
import type { TimeframeOption, JobCreateResponse, JobStatusResponse, JobStatus } from "@/types/management";

import { SectionPanel } from "@/components/molecules/section-panel";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { ScreenerScorecard } from "@/components/molecules/screener-scorecard";
import { GuidanceTrackTable, GuidanceFilterControls, useGuidanceFilterState } from "@/components/management/guidance-track-table";
import { PromoterSection } from "@/components/management/promoter-section";
import { RedFlagsSection } from "@/components/management/red-flags-section";
import { InvestmentThesisSection } from "@/components/management/investment-thesis-section";
import { ManagementIntelligenceCard } from "@/components/management/management-intelligence-card";

const NAV_ITEMS = [
  { id: "section-score", label: "Score" },
  { id: "section-guidance", label: "Guidance Accuracy" },
  { id: "section-red-flags", label: "Red Flags" },
  { id: "section-thesis", label: "Investment Thesis" },
  { id: "section-promoter", label: "Promoter Activity" },
];

/** Map mqi_score.label to a colour-driving level string. */
function mqiLabelToLevel(label: string): string {
  const l = label.toLowerCase();
  if (l === "high" || l === "strong" || l === "good") return "HIGH";
  if (l === "low" || l === "poor" || l === "weak") return "LOW";
  return label; // "Average", "Moderate", etc. → amber by default in scorecard
}

/** Derive HIGH / MODERATE / LOW from a dimension score percentage. */
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
  const { data: managementData, loading: managementLoading } = useManagementAnalysis(
    firstCallId,
    selectedTimeframe
  );

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-surface-base)" }}>
        <div className="text-sm" style={{ color: "var(--qc-down)" }}>Error: No symbol provided in query parameters</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-surface-base)" }}>
        <div className="text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading...</div>
      </div>
    );
  }

  if (transcriptError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-surface-base)" }}>
        <div className="text-sm" style={{ color: "var(--qc-down)" }}>Error: {transcriptError}</div>
      </div>
    );
  }

  if (transcriptCalls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-surface-base)" }}>
        <div className="text-sm" style={{ color: "var(--qc-text-muted)" }}>No transcript calls found for {symbol}</div>
      </div>
    );
  }

  if (Object.keys(managementData).length === 0) {
    const transcriptCall = transcriptCalls[0];
    return (
      <div className="min-h-screen p-4" style={{ background: "var(--qc-surface-base)" }}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-sm font-bold mb-6" style={{ color: "var(--qc-text-heading)" }}>Management Factor Analysis</h1>
          <div className="rounded-lg p-6" style={{ background: "var(--qc-surface-card)", border: "1px solid var(--qc-border-default)" }}>
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--qc-text-heading)" }}>{transcriptCall.company_name}</h2>
                <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>{transcriptCall.basic_industry}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4" style={{ borderTop: "1px solid var(--qc-border-default)" }}>
                <div>
                  <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>Ticker</p>
                  <p className="font-semibold" style={{ color: "var(--qc-text-heading)" }}>{transcriptCall.company}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>Quarter</p>
                  <p className="font-semibold" style={{ color: "var(--qc-text-heading)" }}>{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>Call Date</p>
                  <p className="font-semibold" style={{ color: "var(--qc-text-heading)" }}>{transcriptCall.call_date}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>Call ID</p>
                  <p className="font-semibold text-xs" style={{ color: "var(--qc-text-heading)" }}>{transcriptCall.id}</p>
                </div>
              </div>
              <div className="pt-4" style={{ borderTop: "1px solid var(--qc-border-default)" }}>
                <p className="text-sm mb-4" style={{ color: "var(--qc-text-muted)" }}>
                  No management analysis available for this transcript yet.
                </p>
                {analyzeError && (
                  <div className="mb-4 p-3 rounded-md" style={{ background: "var(--qc-down-soft)", border: "1px solid var(--qc-down)" }}>
                    <p className="text-sm" style={{ color: "var(--qc-down)" }}>{analyzeError}</p>
                  </div>
                )}
                {aggregateStatus && (
                  <div className="mb-4 p-3 rounded-md" style={{
                    background: aggregateStatus === "completed" ? "var(--qc-up-soft)"
                      : aggregateStatus === "failed" ? "var(--qc-down-soft)"
                      : "var(--qc-blue-soft)",
                    border: `1px solid ${aggregateStatus === "completed" ? "var(--qc-up)" : aggregateStatus === "failed" ? "var(--qc-down)" : "var(--qc-blue)"}`,
                  }}>
                    {aggregateStatus === "processing" || aggregateStatus === "completed" ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm" style={{ color: aggregateStatus === "completed" ? "var(--qc-up)" : "var(--qc-blue)" }}>
                            {aggregateStatus === "completed" ? "Analysis complete!" : "Analyzing transcripts..."}
                          </p>
                          <p className="text-sm font-semibold" style={{ color: aggregateStatus === "completed" ? "var(--qc-up)" : "var(--qc-blue)" }}>
                            {progress}%
                          </p>
                        </div>
                        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: aggregateStatus === "completed" ? "var(--qc-up-soft)" : "var(--qc-blue-soft)" }}>
                          <div
                            className="h-full transition-all duration-300 ease-linear"
                            style={{ width: `${progress}%`, background: aggregateStatus === "completed" ? "var(--qc-up)" : "var(--qc-blue)" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: aggregateStatus === "failed" ? "var(--qc-down)" : "var(--qc-blue)" }}>
                        {aggregateStatus === "failed" && "Analysis failed"}
                        {aggregateStatus === "pending" && "Analysis jobs queued..."}
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isAnalyzing}
                  className="w-full font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }}
                >
                  {isAnalyzing
                    ? aggregateStatus === "pending" ? "Queued..."
                    : aggregateStatus === "processing" ? "Processing..."
                    : "Starting..."
                    : "Analyze"}
                </button>
              </div>
              {transcriptCall.ppt_url && (
                <div className="pt-4" style={{ borderTop: "1px solid var(--qc-border-default)" }}>
                  <a href={transcriptCall.ppt_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "var(--qc-accent-primary)" }}>
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

  // Hit rate from guidance_vs_actuals
  const hitRate = managementData.guidance_vs_actuals?.hit_rate;
  const hitRatePct = hitRate && hitRate.total_trackable > 0
    ? Math.round((hitRate.met_or_beat / hitRate.total_trackable) * 100)
    : null;

  // Derive scorecard items from mqi_score.dimensions
  const dims = managementData.mqi_score?.dimensions;
  const scorecardItems = dims ? [
    {
      label: "Guidance Accuracy",
      descriptor: hitRate
        ? `${hitRatePct}% hit rate — ${hitRate.met_or_beat} met of ${hitRate.total_trackable} trackable`
        : `${dims.guidance_accuracy.score} / ${dims.guidance_accuracy.max} points`,
      rating: pctToRating(dims.guidance_accuracy.score, dims.guidance_accuracy.max),
      barValue: dims.guidance_accuracy.max > 0
        ? (dims.guidance_accuracy.score / dims.guidance_accuracy.max) * 100
        : null,
      icon: Target,
      scrollToId: "section-guidance",
    },
    {
      label: "Red Flags",
      descriptor: `${dims.red_flags.score} / ${dims.red_flags.max} points`,
      rating: pctToRating(dims.red_flags.score, dims.red_flags.max),
      barValue: dims.red_flags.max > 0
        ? (dims.red_flags.score / dims.red_flags.max) * 100
        : null,
      icon: Shield,
      scrollToId: "section-red-flags",
    },
    {
      label: "Investment Thesis",
      descriptor: `${dims.investment_thesis.score} / ${dims.investment_thesis.max} points`,
      rating: pctToRating(dims.investment_thesis.score, dims.investment_thesis.max),
      barValue: dims.investment_thesis.max > 0
        ? (dims.investment_thesis.score / dims.investment_thesis.max) * 100
        : null,
      icon: Briefcase,
      scrollToId: "section-thesis",
    },
    {
      label: "Promoter Activity",
      descriptor: `${dims.promoter_activity.score} / ${dims.promoter_activity.max} points`,
      rating: pctToRating(dims.promoter_activity.score, dims.promoter_activity.max),
      barValue: dims.promoter_activity.max > 0
        ? (dims.promoter_activity.score / dims.promoter_activity.max) * 100
        : null,
      icon: Target,
      scrollToId: "section-promoter",
    },
  ] : [];

  // Format an ISO date string as a short relative label
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

  const analyzedAt = managementData.analyzedAt ?? null;

  const reanalyzeButton = (
    <div className="flex flex-col items-end gap-1">
      {/* Progress bar while analyzing */}
      {isAnalyzing && (
        <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: "var(--qc-border-default)" }}>
          <div
            className="h-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%`, background: "var(--qc-accent-primary)" }}
          />
        </div>
      )}
      <button
        onClick={handleAnalyzeClick}
        disabled={isAnalyzing}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isAnalyzing ? "var(--qc-text-muted)" : "var(--qc-accent-primary-fg)",
          background: isAnalyzing ? "var(--qc-surface-panel)" : "var(--qc-accent-primary)",
          border: "1px solid var(--qc-border-default)",
          borderRadius: 6,
          padding: "6px 14px",
          cursor: isAnalyzing ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
        }}
      >
        {isAnalyzing
          ? aggregateStatus === "pending" ? "Queued…"
          : aggregateStatus === "processing" ? `Analyzing… ${progress}%`
          : "Starting…"
          : "Reanalyze"}
      </button>
      {analyzedAt && !isAnalyzing && (
        <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>
          Updated {formatRelativeTime(analyzedAt)}
        </span>
      )}
      {analyzeError && (
        <span style={{ fontSize: 10, color: "var(--qc-down)" }}>{analyzeError}</span>
      )}
    </div>
  );

  return (
    <ScreenerPageShell navItems={NAV_ITEMS} headerRight={reanalyzeButton}>
      <div className="mb-8 px-4 flex gap-6 items-start pt-4">

        {/* Left column: all sections stacked */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Score */}
          <div id="section-score">
            <ScreenerScorecard
              title="MANAGEMENT CREDIBILITY"
              overallLevel={managementData.mqi_score ? mqiLabelToLevel(managementData.mqi_score.label) : undefined}
              score={managementData.mqi_score?.total ?? 0}
              maxScore={100}
              items={scorecardItems}
            />
          </div>

          {/* Guidance Accuracy */}
          <div id="section-guidance">
            <SectionPanel
              title="Guidance Track Record"
              headerAction={
                hitRatePct !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end gap-0.5 rounded-xl px-4 py-2 min-w-[90px]" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--qc-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hit Rate</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-text-heading)", lineHeight: 1.4 }}>
                        {hitRatePct}%
                      </span>
                    </div>
                    {managementData.guidance_vs_actuals?.guidance_bias && (
                      <div className="flex flex-col items-end gap-0.5 rounded-xl px-4 py-2 min-w-[90px]" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
                        <span style={{ fontSize: 10, fontWeight: 500, color: "var(--qc-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Bias</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--qc-text-heading)", lineHeight: 1.4 }}>
                          {managementData.guidance_vs_actuals.guidance_bias}
                        </span>
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

        {/* Right column: sticky intelligence card */}
        {managementData.management_intelligence && managementData.mqi_score && (
          <div className="w-[380px] shrink-0 sticky top-4">
            <ManagementIntelligenceCard
              intelligence={managementData.management_intelligence}
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
