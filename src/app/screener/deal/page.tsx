"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useDealAnalysis } from "@/hooks/useDealAnalysis";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { JobCreateResponse, JobStatusResponse, JobStatus } from "@/types/management";
import type { DFactorResponse } from "@/types/deal";

import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2 } from "lucide-react";
import { EntryPointCallout } from "@/components/deal/entry-point-callout";
import { ScenarioFramework } from "@/components/deal/scenario-framework";
import { TargetPriceMatrix } from "@/components/deal/target-price-matrix";
import { RiskRewardSummary } from "@/components/deal/risk-reward-summary";
import { DetailedAnalysis } from "@/components/deal/detailed-analysis";
import { DealOverview } from "@/components/deal/deal-overview";
import { SectionPanel } from "@/components/molecules/section-panel";

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

  // No analysis yet — show Analyze prompt
  if (Object.keys(dealData).length === 0) {
    const transcriptCall = transcriptCalls[0];
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="sticky top-0 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-xs font-semibold text-white">
          ⚠️ HIGHLY CONFIDENTIAL — FOR INVESTMENT COMMITTEE USE ONLY
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-sm font-bold mb-6">Deal Factor Analysis</h1>
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
      </div>
    );
  }

  // Analysis available — render full dashboard
  const data = dealData as DFactorResponse;
  const transcriptCall = transcriptCalls[0];

  return (
    <div className="min-h-screen bg-white mb-8 px-4">

      {/* Company Header — matches opportunity page style */}
      <div className="flex items-start justify-between gap-4 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="space-y-1.5">
            <h2>{transcriptCall.company_name}</h2>
            <div className="flex items-center gap-2">
              <Badge>NSE: {symbol}</Badge>
              <p>{transcriptCall.basic_industry}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge>
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            FULL IM
          </Badge>
          <Badge>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            DATA CONFIDENCE: HIGH
          </Badge>
          <span className="text-xs text-zinc-400">{transcriptCall.call_date}</span>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto max-w-7xl space-y-6">
        {data.overview && (
          <SectionPanel title="Deal Overview">
            <DealOverview data={data.overview} />
          </SectionPanel>
        )}
        <SectionPanel
          title={data.scenario_framework?.meta?.title ?? "Scenario Framework"}
          contentClassName="px-6 pb-6"
        >
          <ScenarioFramework data={data.scenario_framework} />
        </SectionPanel>
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
        {data.risk_reward_summary && (
          <SectionPanel
            title={data.risk_reward_summary?.meta?.title ?? "Risk / Reward Summary"}
            contentClassName="px-6 pb-6"
          >
            <RiskRewardSummary data={data.risk_reward_summary} />
          </SectionPanel>
        )}
        <SectionPanel
          title="Detailed Analysis"
          subtitle="Earnings trajectory, quality of earnings, and valuation comparisons"
          contentClassName="px-6 pb-6 space-y-6"
        >
          <DetailedAnalysis data={data.detailed_analysis} />
        </SectionPanel>
      </div>
    </div>
  );
}

export default function DealFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <DealContent />
    </Suspense>
  );
}
