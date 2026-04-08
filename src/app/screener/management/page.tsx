"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Target, Shield, Briefcase, Users } from "lucide-react";
import type { TimeframeOption, JobCreateResponse, JobStatusResponse, JobStatus } from "@/types/management";

import { SectionPanel } from "@/components/molecules/section-panel";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { ScreenerScorecard } from "@/components/molecules/screener-scorecard";
import { GuidanceTrackTable } from "@/components/management/guidance-track-table";
import { DisclosuresTable } from "@/components/management/disclosures-table";
import type { DisclosureRow, DisclosuresTableConfig } from "@/components/management/disclosures-table";
import { CapexBreakdownChart } from "@/components/management/capex-breakdown-chart";
import { RoceTrendChart } from "@/components/management/roce-trend-chart";

const NAV_ITEMS = [
  { id: "section-score", label: "Score" },
  { id: "section-guidance", label: "Guidance Accuracy" },
  { id: "section-disclosures", label: "Disclosure Honesty" },
  { id: "section-capital-allocation", label: "Capital Allocation" },
];

function ManagementDashboardContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [selectedTimeframe] = useState<TimeframeOption>("rolling_3_year");
  const [activeDisclosureTab, setActiveDisclosureTab] = useState<"Risk" | "Bad News" | "Legal">("Risk");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [progress, setProgress] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // First, fetch all transcript calls for the symbol
  const { data: transcriptCalls, loading: transcriptLoading, error: transcriptError } = useTranscriptCalls(symbol);

  // Get the first call ID from the transcript calls
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";

  // Then fetch the management analysis for the first call
  const { data: managementData, loading: managementLoading } = useManagementAnalysis(
    firstCallId,
    selectedTimeframe
  );

  const loading = transcriptLoading || managementLoading;

  // Derive an aggregate status from all job statuses for display
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

    // Take top 4 latest calls and submit all in parallel
    const callIds = transcriptCalls.slice(0, 4).map(c => c.id);

    const submitCall = (callId: string): Promise<string> =>
      new Promise<string>((resolve, reject) => {
        const url = `${BACKEND_URL}/api/calls/${callId}/summarize`;
        apiPost<JobCreateResponse>(url, {
          onSuccess: (response) => resolve(response.job.id),
          onError: reject,
        });
      });

    try {
      const ids = await Promise.all(callIds.map(submitCall));

      const initialStatuses: Record<string, JobStatus> = {};
      ids.forEach(id => { initialStatuses[id] = "pending"; });
      setJobStatuses(initialStatuses);

      // Initial poll then every 2 seconds
      pollAllJobs(ids);
      pollingIntervalRef.current = setInterval(() => pollAllJobs(ids), 2000);
    } catch (error: unknown) {
      setIsAnalyzing(false);
      setAnalyzeError(error instanceof Error ? error.message : "Failed to start analysis");
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Manage progress animation when any job is processing
  useEffect(() => {
    if (aggregateStatus === "processing") {
      const totalDuration = 40000; // 40 seconds
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

  // Handle case where analysis is not found - show transcript details with Analyze button
  if (Object.keys(managementData).length === 0) {
    const transcriptCall = transcriptCalls[0];
    return (
      <div className="min-h-screen bg-background p-4">

        {/* Main Container */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-sm font-bold mb-6">Management Factor Analysis</h1>

          {/* Transcript Details Card */}
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
                          <p className={`text-sm ${
                            aggregateStatus === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}>
                            {aggregateStatus === "completed" ? "Analysis complete!" : "Analyzing transcripts..."}
                          </p>
                          <p className={`text-sm font-semibold ${
                            aggregateStatus === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}>
                            {progress}%
                          </p>
                        </div>
                        <div className={`w-full rounded-full h-2 overflow-hidden ${
                          aggregateStatus === "completed"
                            ? "bg-green-200 dark:bg-green-800"
                            : "bg-blue-200 dark:bg-blue-800"
                        }`}>
                          <div
                            className={`h-full transition-all duration-300 ease-linear ${
                              aggregateStatus === "completed"
                                ? "bg-green-600 dark:bg-green-400"
                                : "bg-blue-600 dark:bg-blue-400"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm ${
                        aggregateStatus === "failed"
                          ? "text-red-600 dark:text-red-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}>
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
                    ? aggregateStatus === "pending"
                      ? "Queued..."
                      : aggregateStatus === "processing"
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

  // Build disclosure rows from the structured disclosures object
  const disclosures = managementData.disclosures;

  const riskRows: DisclosureRow[] = (disclosures?.risk ?? []).map((r) => ({
    title: r.risk_title,
    tag: r.risk_type ?? undefined,
    severity: r.severity ?? undefined,
    detail: r.mitigation_strategy ?? null,
  }));

  const badNewsRows: DisclosureRow[] = (disclosures?.bad_news ?? []).map((r) => ({
    title: r.news_title,
    tag: r.disclosure_type ?? undefined,
    severity: r.severity ?? undefined,
    detail: r.mitigation_strategy ?? null,
  }));

  const legalRows: DisclosureRow[] = (disclosures?.legal_issues ?? []).map((r) => ({
    title: r.issue_title,
    tag: r.issue_type ?? undefined,
    severity: r.severity ?? undefined,
    detail: r.impact ?? null,
  }));

  const allDisclosureRows = [...riskRows, ...badNewsRows, ...legalRows];

  function ratingFromRows(rows: DisclosureRow[]): DisclosuresTableConfig["rating"] | undefined {
    if (rows.length === 0) return undefined;
    const highCount = rows.filter((r) => r.severity?.toLowerCase() === "high").length;
    const ratio = highCount / rows.length;
    return ratio <= 0.25
      ? { label: "Strong", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" }
      : ratio <= 0.5
      ? { label: "Moderate", color: "#d97706", bg: "#fffbeb", border: "#fde68a" }
      : { label: "Weak", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
  }

  const disclosureTabConfigs: Record<string, { rows: DisclosureRow[]; config: DisclosuresTableConfig }> = {
    Risk: {
      rows: riskRows,
      config: {
        title: "Risk Disclosures",
        subtitle: "Key risks identified by management",
        leftHeader: "Risk & Type",
        rightHeader: "Mitigation Strategy",
        detailPlaceholder: "No mitigation guidance provided",
        rating: ratingFromRows(riskRows),
      },
    },
    "Bad News": {
      rows: badNewsRows,
      config: {
        title: "Bad News Disclosures",
        subtitle: "Adverse developments disclosed by management",
        leftHeader: "News & Type",
        rightHeader: "Mitigation Strategy",
        detailPlaceholder: "No mitigation guidance provided",
        rating: ratingFromRows(badNewsRows),
      },
    },
    Legal: {
      rows: legalRows,
      config: {
        title: "Legal Issues",
        subtitle: "Legal and regulatory matters disclosed by management",
        leftHeader: "Issue & Type",
        rightHeader: "Impact",
        detailPlaceholder: "No impact details provided",
        rating: ratingFromRows(legalRows),
      },
    },
  };

  return (
    <ScreenerPageShell navItems={NAV_ITEMS}>
      <div className="mb-8 px-4 space-y-6">

        {/* Score */}
        <div id="section-score" className="pt-4">
          <ScreenerScorecard
            title="MANAGEMENT CREDIBILITY"
            overallLevel={managementData.trust?.overall}
            score={managementData.consistency?.score ?? 0}
            maxScore={managementData.consistency?.maxScore ?? 20}
            items={(() => {
              const subfactorKeyMap: Record<string, keyof typeof managementData.trust.subfactors> = {
                "Guidance Accuracy": "guidanceAccuracy",
                "Disclosure Honesty": "disclosureHonesty",
                "Capital Allocation": "capitalAllocation",
              };
              const iconMap: Record<string, typeof Target> = {
                "Guidance Accuracy": Target,
                "Disclosure Honesty": Shield,
                "Capital Allocation": Briefcase,
                "Customer Traction": Users,
              };
              const scrollMap: Record<string, string> = {
                "Guidance Accuracy": "section-guidance",
                "Disclosure Honesty": "section-disclosures",
                "Capital Allocation": "section-capital-allocation",
              };
              return (managementData.scores ?? []).map((s) => ({
                label: s.factor,
                descriptor: s.descriptor,
                rating: s.rating,
                barValue: subfactorKeyMap[s.factor] ? managementData.trust?.subfactors?.[subfactorKeyMap[s.factor]] ?? null : null,
                icon: iconMap[s.factor],
                scrollToId: scrollMap[s.factor],
              }));
            })()}
          />
        </div>

        {/* Guidance Accuracy */}
        <div id="section-guidance">
          <SectionPanel
            title="Guidance Track Record"
            headerAction={
              managementData.consistency?.hitRate != null ? (
                <div className="flex flex-col items-end gap-0.5 rounded-xl border border-[#E2E2E2] bg-white px-4 py-2 min-w-[90px]">
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase" }}>Hit Rate</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#0F172B", lineHeight: 1.1 }}>
                    {managementData.consistency.hitRate}%
                  </span>
                </div>
              ) : undefined
            }
          >
            <GuidanceTrackTable records={managementData.guidanceRecords} />
          </SectionPanel>
        </div>

        {/* Disclosure Honesty */}
        {allDisclosureRows.length > 0 && (
          <div id="section-disclosures">
            <DisclosuresTable
              config={disclosureTabConfigs[activeDisclosureTab].config}
              rows={disclosureTabConfigs[activeDisclosureTab].rows}
              tabs={(["Risk", "Bad News", "Legal"] as const).map((tab) => ({
                label: tab,
                count: disclosureTabConfigs[tab].rows.length,
              }))}
              activeTab={activeDisclosureTab}
              onTabChange={(tab) => setActiveDisclosureTab(tab as "Risk" | "Bad News" | "Legal")}
            />
          </div>
        )}

        {/* Capital Allocation */}
        {managementData.capital_allocation && (
          <div id="section-capital-allocation" className="flex flex-col gap-4">
            {managementData.capital_allocation.capex_breakdown && (
              <CapexBreakdownChart data={managementData.capital_allocation.capex_breakdown} />
            )}
            {managementData.capital_allocation.roce_trend && (
              <RoceTrendChart data={managementData.capital_allocation.roce_trend} />
            )}
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
