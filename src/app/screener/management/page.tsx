"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { TimeframeOption, JobCreateResponse, JobStatusResponse, JobStatus } from "@/types/management";

import { CallHeader } from "@/components/management/call-header";
import { ScoreOverviewCards } from "@/components/management/score-overview-cards";
import { TrustPanel } from "@/components/management/trust-panel";
import { GovernanceSignals } from "@/components/management/governance-signals";
import { ConsistencyAnalysis } from "@/components/management/consistency-analysis";
import { GuidanceTrackTable } from "@/components/management/guidance-track-table";
import { NotablePatterns } from "@/components/management/notable-patterns";
import { TimeframeSelector } from "@/components/management/timeframe-selector";

export default function ManagementDashboardPage() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>("rolling_3_year");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // First, fetch all transcript calls for the symbol
  const { data: transcriptCalls, loading: transcriptLoading, error: transcriptError } = useTranscriptCalls(symbol);

  // Get the first call ID from the transcript calls
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";

  // Then fetch the management analysis for the first call
  const { data: managementData, loading: managementLoading, error: managementError } = useManagementAnalysis(
    firstCallId,
    selectedTimeframe
  );

  const loading = transcriptLoading || managementLoading;

  const handleFullLLMClick = () => {
    console.log("Open full LLM analysis modal");
  };

  const pollJobStatus = (jobId: string) => {
    const url = `${BACKEND_URL}/api/jobs/${jobId}`;

    apiCall<JobStatusResponse>(url, {
      onSuccess: (response) => {
        const status = response.data.status;
        setJobStatus(status);

        if (status === "completed") {
          // Set progress to 100%
          setProgress(100);
          // Stop polling and reload
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setIsAnalyzing(false);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (status === "failed") {
          // Stop polling and show error
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setIsAnalyzing(false);
          setAnalyzeError(response.data.error || "Job failed");
        }
        // If pending or processing, keep polling
      },
      onError: (error: string) => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setIsAnalyzing(false);
        setAnalyzeError(error);
      },
    });
  };

  const handleAnalyzeClick = () => {
    setAnalyzeError(null);
    setJobId(null);
    setJobStatus(null);
    setProgress(0);

    const url = `${BACKEND_URL}/api/calls/${firstCallId}/summarize`;

    apiPost<JobCreateResponse>(
      url,
      {
        onStart: () => {
          setIsAnalyzing(true);
        },
        onSuccess: (response) => {
          const newJobId = response.job.id;
          setJobId(newJobId);
          setJobStatus(response.job.status);

          // Start polling every 2 seconds
          pollingIntervalRef.current = setInterval(() => {
            pollJobStatus(newJobId);
          }, 2000);

          // Initial poll
          pollJobStatus(newJobId);
        },
        onError: (error: string) => {
          setIsAnalyzing(false);
          setAnalyzeError(error);
        },
      }
    );
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Manage progress animation when processing
  useEffect(() => {
    if (jobStatus === "processing") {
      const totalDuration = 40000; // 40 seconds
      const targetProgress = 95;
      const updateInterval = 100; // Update every 100ms
      const totalSteps = totalDuration / updateInterval;
      const progressPerStep = targetProgress / totalSteps;

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
  }, [jobStatus]);

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

  // Handle case where analysis is not found - show transcript details with Analyze button
  if (Object.keys(managementData).length === 0) {
    const transcriptCall = transcriptCalls[0];
    return (
      <div className="min-h-screen bg-background">
        {/* Confidential Banner */}
        <div className="sticky top-0 z-50 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-sm font-semibold text-white">
          ⚠️ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
        </div>

        {/* Main Container */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Management Factor Analysis</h1>

          {/* Transcript Details Card */}
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
                  No management analysis available for this transcript yet.
                </p>

                {analyzeError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{analyzeError}</p>
                  </div>
                )}

                {jobStatus && (
                  <div className={`mb-4 p-3 rounded-md border ${
                    jobStatus === "completed"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : jobStatus === "failed"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  }`}>
                    {jobStatus === "processing" || jobStatus === "completed" ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${
                            jobStatus === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}>
                            {jobStatus === "completed" ? "Analysis complete!" : "Analyzing transcript..."}
                          </p>
                          <p className={`text-sm font-medium ${
                            jobStatus === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}>
                            {progress}%
                          </p>
                        </div>
                        <div className={`w-full rounded-full h-2 overflow-hidden ${
                          jobStatus === "completed"
                            ? "bg-green-200 dark:bg-green-800"
                            : "bg-blue-200 dark:bg-blue-800"
                        }`}>
                          <div
                            className={`h-full transition-all duration-300 ease-linear ${
                              jobStatus === "completed"
                                ? "bg-green-600 dark:bg-green-400"
                                : "bg-blue-600 dark:bg-blue-400"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm ${
                        jobStatus === "failed"
                          ? "text-red-600 dark:text-red-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}>
                        {jobStatus === "failed" && "Analysis failed"}
                        {jobStatus === "pending" && "Analysis job queued..."}
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
                    ? jobStatus === "pending"
                      ? "Queued..."
                      : jobStatus === "processing"
                      ? "Processing..."
                      : "Starting..."
                    : "Analyze"}
                </button>
              </div>

              {transcriptCall.ppt_url && (
                <div className="pt-4 border-t border-border">
                  <a
                    href={transcriptCall.ppt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
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


  return (
    <div className="min-h-screen bg-background">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-50 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-sm font-semibold text-white">
        ⚠️ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Company Header */}
        <div className="mb-6">
          <CallHeader
            company={managementData.company}
            onFullLLMClick={handleFullLLMClick}
          />
        </div>

        {/* Main Layout: 2 columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Main Content (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Score Overview Cards */}
            <ScoreOverviewCards scores={managementData.scores} />

            {/* Governance Signals */}
            <GovernanceSignals signals={managementData.governanceSignals} />

            {/* Consistency Analysis */}
            <ConsistencyAnalysis consistency={managementData.consistency} />

            {/* Guidance Track Table */}
            <GuidanceTrackTable records={managementData.guidanceRecords} />
          </div>

          {/* Right Sidebar: Trust Panel + Notable Patterns (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <TrustPanel trust={managementData.trust} />
            <NotablePatterns patterns={managementData.notablePatterns} />
          </div>
        </div>
      </div>
    </div>
  );
}
