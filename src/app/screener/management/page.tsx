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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-red-600">Error: No symbol provided in query parameters</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    );
  }

  if (transcriptError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-red-600">Error: {transcriptError}</div>
      </div>
    );
  }

  if (transcriptCalls.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">No transcript calls found for {symbol}</div>
      </div>
    );
  }

  if (Object.keys(managementData).length === 0) {
    const transcriptCall = transcriptCalls[0];
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-sm font-bold mb-6">Management Factor Analysis</h1>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold mb-2">{transcriptCall.company_name}</h2>
                <p className="text-sm text-muted-foreground">{transcriptCall.basic_industry}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Ticker</p>
                  <p className="font-semibold">{transcriptCall.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quarter</p>
                  <p className="font-semibold">{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call Date</p>
                  <p className="font-semibold">{transcriptCall.call_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call ID</p>
                  <p className="font-semibold text-xs">{transcriptCall.id}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  No management analysis available for this transcript yet.
                </p>
                {analyzeError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{analyzeError}</p>
                  </div>
                )}
                {aggregateStatus && (
                  <div className={`mb-4 p-3 rounded-md border ${
                    aggregateStatus === "completed" ? "bg-green-50 border-green-200"
                    : aggregateStatus === "failed" ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                  }`}>
                    {aggregateStatus === "processing" || aggregateStatus === "completed" ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${aggregateStatus === "completed" ? "text-green-600" : "text-blue-600"}`}>
                            {aggregateStatus === "completed" ? "Analysis complete!" : "Analyzing transcripts..."}
                          </p>
                          <p className={`text-sm font-semibold ${aggregateStatus === "completed" ? "text-green-600" : "text-blue-600"}`}>
                            {progress}%
                          </p>
                        </div>
                        <div className={`w-full rounded-full h-2 overflow-hidden ${aggregateStatus === "completed" ? "bg-green-200" : "bg-blue-200"}`}>
                          <div
                            className={`h-full transition-all duration-300 ease-linear ${aggregateStatus === "completed" ? "bg-green-600" : "bg-blue-600"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm ${aggregateStatus === "failed" ? "text-red-600" : "text-blue-600"}`}>
                        {aggregateStatus === "failed" && "Analysis failed"}
                        {aggregateStatus === "pending" && "Analysis jobs queued..."}
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isAnalyzing}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing
                    ? aggregateStatus === "pending" ? "Queued..."
                    : aggregateStatus === "processing" ? "Processing..."
                    : "Starting..."
                    : "Analyze"}
                </button>
              </div>
              {transcriptCall.ppt_url && (
                <div className="pt-4 border-t border-border">
                  <a href={transcriptCall.ppt_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
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
        : `${dims.guidance_credibility.score} / ${dims.guidance_credibility.max} points`,
      rating: pctToRating(dims.guidance_credibility.score, dims.guidance_credibility.max),
      barValue: dims.guidance_credibility.max > 0
        ? (dims.guidance_credibility.score / dims.guidance_credibility.max) * 100
        : null,
      icon: Target,
      scrollToId: "section-guidance",
    },
    {
      label: "Disclosure Honesty",
      descriptor: `${dims.disclosure_honesty.score} / ${dims.disclosure_honesty.max} points`,
      rating: pctToRating(dims.disclosure_honesty.score, dims.disclosure_honesty.max),
      barValue: dims.disclosure_honesty.max > 0
        ? (dims.disclosure_honesty.score / dims.disclosure_honesty.max) * 100
        : null,
      icon: Shield,
    },
    {
      label: "Capital Allocation",
      descriptor: `${dims.capital_allocation.score} / ${dims.capital_allocation.max} points`,
      rating: pctToRating(dims.capital_allocation.score, dims.capital_allocation.max),
      barValue: dims.capital_allocation.max > 0
        ? (dims.capital_allocation.score / dims.capital_allocation.max) * 100
        : null,
      icon: Briefcase,
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
        <div className="w-32 h-1 rounded-full overflow-hidden bg-zinc-200">
          <div
            className="h-full bg-[#0F172B] transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <button
        onClick={handleAnalyzeClick}
        disabled={isAnalyzing}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isAnalyzing ? "#888888" : "#ffffff",
          background: isAnalyzing ? "#F5F5F5" : "#0F172B",
          border: "1px solid #E2E2E2",
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
        <span style={{ fontSize: 10, color: "#888888" }}>
          Updated {formatRelativeTime(analyzedAt)}
        </span>
      )}
      {analyzeError && (
        <span style={{ fontSize: 10, color: "#dc2626" }}>{analyzeError}</span>
      )}
    </div>
  );

  return (
    <ScreenerPageShell navItems={NAV_ITEMS} headerRight={reanalyzeButton}>
      <div className="mb-8 px-4 space-y-6">

        {/* Score */}
        <div id="section-score" className="pt-4">
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
                  <div className="flex flex-col items-end gap-0.5 rounded-xl border border-[#E2E2E2] bg-white px-4 py-2 min-w-[90px]">
                    <span style={{ fontSize: 10, fontWeight: 500, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hit Rate</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172B", lineHeight: 1.4 }}>
                      {hitRatePct}%
                    </span>
                  </div>
                  {managementData.guidance_vs_actuals?.guidance_bias && (
                    <div className="flex flex-col items-end gap-0.5 rounded-xl border border-[#E2E2E2] bg-white px-4 py-2 min-w-[90px]">
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase" }}>Bias</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172B", lineHeight: 1.4 }}>
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
