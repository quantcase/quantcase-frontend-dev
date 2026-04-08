"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useDealAnalysis } from "@/hooks/useDealAnalysis";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { JobCreateResponse, JobStatusResponse, JobStatus } from "@/types/management";
import type { DFactorResponse } from "@/types/deal";

import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { TargetPriceMatrix } from "@/components/deal/target-price-matrix";
import { RiskRewardSummary } from "@/components/deal/risk-reward-summary";
import { DetailedAnalysis } from "@/components/deal/detailed-analysis";
import { DealOverview } from "@/components/deal/deal-overview";
import { EpsEngine } from "@/components/deal/eps-engine";
import { HistoricalPerformance } from "@/components/deal/historical-performance";
import { PeReratingPotential } from "@/components/deal/pe-rerating-potential";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TabularCard } from "@/components/molecules/tabular-card";
import type { InPageNavItem } from "@/components/molecules/in-page-nav";

const DEAL_NAV_ITEMS: InPageNavItem[] = [
  { id: "score", label: "Score" },
  { id: "target-price", label: "Target Price" },
  { id: "past-trend", label: "Past Trend" },
  { id: "forecast", label: "Forecast" },
  { id: "pe-rerating", label: "P/E Re-Rating Potential" },
];

function DealContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [progress, setProgress] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: transcriptCalls, loading: transcriptLoading, error: transcriptError } = useTranscriptCalls(symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";
  const { data: dealData, loading: dealLoading } = useDealAnalysis(firstCallId);

  const loading = transcriptLoading || dealLoading;

  const allStatuses = Object.values(jobStatuses);
  const aggregateStatus: JobStatus | null = allStatuses.length === 0
    ? null
    : allStatuses.some(s => s === "failed")
    ? "failed"
    : allStatuses.every(s => s === "completed")
    ? "completed"
    : allStatuses.some(s => s === "processing")
    ? "processing"
    : "pending";

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const pollAllJobs = (ids: string[]) => {
    ids.forEach(jobId => {
      const url = `${BACKEND_URL}/api/jobs/${jobId}`;
      apiCall<JobStatusResponse>(url, {
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

    const url = `${BACKEND_URL}/api/calls/${firstCallId}/deal/analysis`;

    try {
      const jobId = await new Promise<string>((resolve, reject) => {
        apiPost<JobCreateResponse>(url, {
          onSuccess: (response) => resolve(response.job.id),
          onError: reject,
        });
      });

      const initialStatuses: Record<string, JobStatus> = { [jobId]: "pending" };
      setJobStatuses(initialStatuses);
      pollAllJobs([jobId]);
      pollingIntervalRef.current = setInterval(() => pollAllJobs([jobId]), 2000);
    } catch (error: unknown) {
      setIsAnalyzing(false);
      setAnalyzeError(error instanceof Error ? error.message : "Failed to start analysis");
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

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
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
        setProgress(Math.round(currentProgress));
      }, updateInterval);
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [aggregateStatus]);

  // Render content based on state
  const renderContent = () => {
    if (!symbol) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-red-600">Error: No symbol provided in query parameters</div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm">Loading...</div>
        </div>
      );
    }

    if (transcriptError) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-red-600">Error: {transcriptError}</div>
        </div>
      );
    }

    if (transcriptCalls.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm">No transcript calls found for {symbol}</div>
        </div>
      );
    }

    // No analysis yet — show Analyze prompt
    if (Object.keys(dealData).length === 0) {
      const transcriptCall = transcriptCalls[0];
      return (
        <div className="px-4 py-8 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quarter</p>
                  <p className="font-semibold">{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call Date</p>
                  <p className="font-semibold">{transcriptCall.call_date}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  No deal analysis available for this transcript yet.
                </p>

                {analyzeError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{analyzeError}</p>
                  </div>
                )}

                {aggregateStatus && (
                  <div className={`mb-4 p-3 rounded-md border ${
                    aggregateStatus === "completed"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : aggregateStatus === "failed"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  }`}>
                    {aggregateStatus === "processing" || aggregateStatus === "completed" ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${aggregateStatus === "completed" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
                            {aggregateStatus === "completed" ? "Analysis complete!" : "Analyzing transcripts..."}
                          </p>
                          <p className={`text-sm font-semibold ${aggregateStatus === "completed" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
                            {progress}%
                          </p>
                        </div>
                        <div className={`w-full rounded-full h-2 overflow-hidden ${aggregateStatus === "completed" ? "bg-green-200 dark:bg-green-800" : "bg-blue-200 dark:bg-blue-800"}`}>
                          <div
                            className={`h-full transition-all duration-300 ease-linear ${aggregateStatus === "completed" ? "bg-green-600 dark:bg-green-400" : "bg-blue-600 dark:bg-blue-400"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm ${aggregateStatus === "failed" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
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
                    ? aggregateStatus === "pending" ? "Queued..." : aggregateStatus === "processing" ? "Processing..." : "Starting..."
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
      );
    }

    // Analysis available — render full dashboard
    const data = dealData as DFactorResponse;

    return (
      <div className="mb-8 px-4 space-y-6 pt-6">
        {data.overview && (
          <div id="score">
            <DealOverview data={data.overview} />
          </div>
        )}
        <div id="target-price">
          <SectionPanel
            title={data.target_price_matrix?.meta?.title ?? "Target Price Matrix"}
            subtitle={[
              data.target_price_matrix?.holding_period,
              data.target_price_matrix?.current_price ? `Current Price: ${data.target_price_matrix.current_price}` : undefined,
            ].filter(Boolean).join(" | ") || undefined}
            contentClassName="px-6 pb-6"
          >
            <TargetPriceMatrix data={data.target_price_matrix} />
          </SectionPanel>
        </div>
        <div id="past-trend">
          <TabularCard
            title={data.detailed_analysis?.historical_performance?.meta?.title ?? "Historical Performance: Company EPS CAGR vs Industry Earnings Growth"}
            subtitle={data.detailed_analysis?.historical_performance?.meta?.subtitle}
          >
            <HistoricalPerformance data={data.detailed_analysis?.historical_performance} hideHeader />
          </TabularCard>
        </div>
        <div id="forecast">
          <TabularCard title="Forecast">
            <EpsEngine data={data.detailed_analysis?.eps_engine} />
          </TabularCard>
        </div>
        <div id="pe-rerating">
          <TabularCard title="P/E Re-Rating Potential" titleCase>
            <PeReratingPotential data={data.detailed_analysis?.valuation_vs_peers} />
          </TabularCard>
        </div>
      </div>
    );
  };

  return (
    <ScreenerPageShell navItems={dealData && Object.keys(dealData).length > 0 ? DEAL_NAV_ITEMS : undefined}>
      {renderContent()}
    </ScreenerPageShell>
  );
}

export default function DealFactorPage() {
  return <DealContent />;
}
