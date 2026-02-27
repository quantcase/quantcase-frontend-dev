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
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FileText, Calendar, Target } from "lucide-react";
import { EntryPointCallout } from "@/components/deal/entry-point-callout";
import { ScenarioFramework } from "@/components/deal/scenario-framework";
import { TargetPriceMatrix } from "@/components/deal/target-price-matrix";
import { RiskRewardSummary } from "@/components/deal/risk-reward-summary";

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
        <div className="sticky top-0 w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 py-2 px-4 text-center text-xs font-semibold text-red-600 dark:text-red-400">
          ⚠️ HIGHLY CONFIDENTIAL — FOR INVESTMENT COMMITTEE USE ONLY
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Deal Factor Analysis</h1>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{transcriptCall.company_name}</h2>
                <p className="text-sm text-muted-foreground">{transcriptCall.basic_industry}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Ticker</p>
                  <p className="font-medium">{transcriptCall.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quarter</p>
                  <p className="font-medium">{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call Date</p>
                  <p className="font-medium">{transcriptCall.call_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call ID</p>
                  <p className="font-medium text-xs">{transcriptCall.id}</p>
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
                          <p className={`text-sm font-medium ${aggregateStatus === "completed" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
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
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="min-h-screen bg-background p-4">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 py-2 px-4 text-center text-xs font-semibold text-red-600 dark:text-red-400 mb-4">
        ⚠️ HIGHLY CONFIDENTIAL — FOR INVESTMENT COMMITTEE USE ONLY
      </div>

      {/* Company Header */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{transcriptCall.company_name}</h1>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                    NSE: {symbol}
                  </span>
                  <span>•</span>
                  <span>{transcriptCall.basic_industry}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" size="sm" className="font-semibold">
                FULL IM
              </Button>
              <Badge className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-0">
                ⊙ DATA CONFIDENCE: HIGH
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                {transcriptCall.call_date}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Page Title */}
      <div className="container mx-auto max-w-7xl mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Target className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Deal Factor</h2>
      </div>

      {/* Page Content */}
      <div className="container mx-auto max-w-7xl space-y-6">
        <EntryPointCallout />
        <ScenarioFramework data={data.scenario_framework} />
        <TargetPriceMatrix data={data.target_price_matrix} />
        {data.risk_reward_summary && <RiskRewardSummary data={data.risk_reward_summary} />}
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
