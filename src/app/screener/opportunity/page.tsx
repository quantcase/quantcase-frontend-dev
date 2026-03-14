"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { usePeerData } from "@/hooks/usePeerData";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { JobCreateResponse, JobStatusResponse, JobStatus } from "@/types/management";
import type { OFactorResponse } from "@/types/opportunity";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle2, PanelRight } from "lucide-react";
import { PromptSideWindow } from "@/components/opportunity/prompt-side-window";
import { IndustryOverviewCard } from "@/components/opportunity/industry-overview-card";
import { CompetitionCard } from "@/components/opportunity/competition-card";
import { CompetitiveBenchmarking } from "@/components/opportunity/competitive-benchmarking";
import { FinancialStrengthCard } from "@/components/opportunity/financial-strength-card";
import { OperatingLeverageCard } from "@/components/opportunity/operating-leverage-card";
import { FreeCashFlowCard } from "@/components/opportunity/free-cash-flow-card";
import { WorkingCapitalCard } from "@/components/opportunity/working-capital-card";
import { CapitalStructureCard } from "@/components/opportunity/capital-structure-card";
import { IndustryKpiTable } from "@/components/opportunity/industry-kpi-table";
import { KpiBenchmarkingTable } from "@/components/opportunity/kpi-benchmarking-table";
import { CustomerTractionCard } from "@/components/opportunity/customer-traction-card";
import { SectionPanel } from "@/components/opportunity/section-panel";
import { SubsectionHeader } from "@/components/opportunity/subsection-header";
import { TakeawayBox } from "@/components/opportunity/takeaway-box";

function OpportunityContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [selectedSection, setSelectedSection] = useState("industry_overview");
  const [showSideWindow, setShowSideWindow] = useState(false);
  const [patchedSections, setPatchedSections] = useState<Partial<OFactorResponse>>({});
  const [showCompetitionDetails, setShowCompetitionDetails] = useState(false);
  const [showFinancialDetails, setShowFinancialDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [progress, setProgress] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: transcriptCalls, loading: transcriptLoading, error: transcriptError } = useTranscriptCalls(symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";
  const { data: opportunityData, totalScore, loading: opportunityLoading } = useOpportunityAnalysis(firstCallId);
  const { data: peerData, loading: peerLoading } = usePeerData(firstCallId);

  const loading = transcriptLoading || opportunityLoading;

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

    const sections = ["industry", "competition", "financial_strength", "customer_traction"] as const;
    const url = `${BACKEND_URL}/api/calls/${firstCallId}/opportunity/analysis`;

    try {
      const jobIds = await Promise.all(
        sections.map(
          (section) =>
            new Promise<string>((resolve, reject) => {
              apiPost<JobCreateResponse>(url, {
                onSuccess: (response) => resolve(response.job.id),
                onError: reject,
              }, { section });
            })
        )
      );

      const initialStatuses: Record<string, JobStatus> = Object.fromEntries(jobIds.map(id => [id, "pending"]));
      setJobStatuses(initialStatuses);
      pollAllJobs(jobIds);
      pollingIntervalRef.current = setInterval(() => pollAllJobs(jobIds), 2000);
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
  if (Object.keys(opportunityData).length === 0) {
    const transcriptCall = transcriptCalls[0];
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="sticky top-0 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-sm font-semibold text-white">
          ⚠️ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Opportunity Factor Analysis</h1>
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
                  No opportunity analysis available for this transcript yet.
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
  const data = { ...opportunityData, ...patchedSections } as OFactorResponse;
  const transcriptCall = transcriptCalls[0];

  const handleSectionUpdate = (sectionKey: string, sectionResult: unknown) => {
    setPatchedSections((prev) => ({ ...prev, [sectionKey]: sectionResult }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 mb-20">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-sm font-semibold text-white mb-4">
        ⚠️ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
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
              <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 font-semibold">
                <FileText className="h-4 w-4 mr-1.5" />
                FULL IM
              </Button>
              <Badge className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                HIGH CONFIDENCE
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                {transcriptCall.call_date}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Banner */}
      <div className="container mx-auto max-w-7xl mb-5 flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mr-1">§4</span>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
          Opportunity Factor Score
        </h2>
        {totalScore ? (
          <span className="text-lg font-bold text-zinc-600 dark:text-zinc-400">
            ({totalScore.total_score}/{totalScore.max_score})
          </span>
        ) : (
          <span className="text-lg font-bold text-zinc-400 dark:text-zinc-600">—</span>
        )}
      </div>

      {/* Floating Prompt Toggle */}
      <button
        onClick={() => setShowSideWindow((v) => !v)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all ${
          showSideWindow
            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-zinc-900/30"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/40 hover:shadow-blue-600/60"
        }`}
      >
        <PanelRight className="h-4 w-4" />
        Prompt
      </button>

      {/* Page Content */}
      <div className="container mx-auto max-w-7xl space-y-6">

        {/* 4.1 Industry Overview & Market */}
        <SectionPanel
          title="4.1 Industry Overview & Market"
          subtitle="Synthesized from public company transcripts & filings"
          scoring={data.industry_overview?.final_scoring}
        >
          <IndustryOverviewCard data={data.industry_overview} competition={data.competition} />
        </SectionPanel>

        {/* 4.2 Competitive Benchmarking vs Industry Peers */}
        <SectionPanel
          title="4.2 Competitive Benchmarking vs Industry Peers"
          subtitle="Peer comparison from public filings & market data"
          scoring={data.competition?.final_scoring}
          contentClassName="px-6 space-y-4"
        >
          <CompetitionCard
            data={data.competition}
            showDetails={showCompetitionDetails}
            onToggle={() => setShowCompetitionDetails(v => !v)}
          />
          {showCompetitionDetails && (
            <>
              <div>
                <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-0.5">KPI Benchmarking</h4>
                <p className="text-xs text-zinc-400 mb-3">Latest KPI values across industry peers</p>
                <KpiBenchmarkingTable data={peerData?.peer_kpi_timeseries} loading={peerLoading} />
              </div>
              <CompetitiveBenchmarking data={data.competition} peers={peerData?.competition?.peers ?? []} loading={peerLoading} />
            </>
          )}
          <TakeawayBox title="COMPETITION TAKEAWAY" text={data.competition?.text?.takeaway} color="emerald" />
        </SectionPanel>

        {/* 4.3 Financial Strength */}
        <SectionPanel
          title="4.3 Financial Strength"
          subtitle="Snapshot from financial statements, investor decks & management commentary"
          scoring={data.financial_strength?.final_scoring}
          contentClassName=""
        >
          <div className="px-6 pb-0 space-y-4">
            <FinancialStrengthCard
              data={data.financial_strength}
              showDetails={showFinancialDetails}
              onToggle={() => setShowFinancialDetails(v => !v)}
            />
          </div>
          {showFinancialDetails && (
            <>
              <div className="px-6 pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 mt-4 space-y-4">
                <SubsectionHeader
                  title="Operating Leverage Analysis"
                  subtitle="Fixed cost absorption, DOL trend & leverage verdict"
                />
                <OperatingLeverageCard data={data.financial_strength?.operating_leverage} />
              </div>
              <div className="px-6 pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="Free Cash Flow Analysis"
                  subtitle="FCF conversion, growth trajectory, capex drag & yield"
                />
                <FreeCashFlowCard data={data.financial_strength?.free_cash_flow} />
              </div>
              <div className="px-6 pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="Working Capital"
                  subtitle="DSO, DIO, DPO, CCC trends & WC as % of revenue"
                />
                <WorkingCapitalCard data={data.financial_strength?.working_capital} />
              </div>
              <div className="px-6 pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="Capital Structure & Capex"
                  subtitle="Balance sheet position, debt trajectory, equity allocation & capex intensity"
                />
                <CapitalStructureCard data={data.financial_strength?.capital_structure} />
              </div>
              <div className="px-6 pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="Industry KPI Timeseries"
                  subtitle="Industry-specific KPI trends over time"
                />
                <IndustryKpiTable data={peerData?.industry_kpis} loading={peerLoading} />
              </div>
            </>
          )}
          <div className="px-6 pb-6">
            <TakeawayBox title="FINANCIAL TAKEAWAY" text={data.financial_strength?.text?.key_takeaway} />
          </div>
        </SectionPanel>

        {/* 4.4 Client/Customer Traction */}
        <SectionPanel
          title="4.4 Client/Customer Traction"
          subtitle="Customer growth, retention & revenue trajectory with alt data projections"
          scoring={data.customer_traction?.final_scoring}
          contentClassName="px-6"
        >
          <CustomerTractionCard data={data.customer_traction} />
        </SectionPanel>

      </div>

      {/* Prompt Side Window — fixed overlay */}
      {showSideWindow && (
        <PromptSideWindow
          callId={firstCallId}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          onSectionUpdate={handleSectionUpdate}
          onClose={() => setShowSideWindow(false)}
        />
      )}
    </div>
  );
}

export default function OpportunityFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <OpportunityContent />
    </Suspense>
  );
}
