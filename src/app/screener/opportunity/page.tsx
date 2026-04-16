"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { usePeerData } from "@/hooks/usePeerData";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { FullPipelineResponse, PipelineJobStatusResponse, PipelineStep } from "@/types/management";
import type { OFactorResponse } from "@/types/opportunity";

import { PanelRight, TrendingUp, BarChart3, DollarSign, Users } from "lucide-react";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { ScreenerScorecard } from "@/components/molecules/screener-scorecard";
import { PromptSideWindow } from "@/components/opportunity/prompt-side-window";
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
import { IndustryAnalysisCard } from "@/components/opportunity/industry-analysis-card";
import { IndustryIntelligenceCard } from "@/components/opportunity/industry-intelligence-card";
import { TranscriptDriversCard } from "@/components/opportunity/transcript-drivers-card";
import { CompanyMetricsTable } from "@/components/opportunity/company-metrics-table";
import { InvestmentImplicationsCard } from "@/components/opportunity/investment-implications-card";

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
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: transcriptCalls, loading: transcriptLoading, error: transcriptError } = useTranscriptCalls(symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";
  const { data: opportunityData, totalScore, loading: opportunityLoading } = useOpportunityAnalysis(firstCallId);
  const { data: peerData, loading: peerLoading } = usePeerData(firstCallId);

  const loading = transcriptLoading || opportunityLoading;

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const pollJob = (jobId: string) => {
    const url = `${BACKEND_URL}/api/jobs/${jobId}`;
    apiCall<PipelineJobStatusResponse>(url, {
      onSuccess: (response) => {
        const job = response.data;
        const steps = job.all_steps ?? [];
        if (steps.length > 0) setPipelineSteps(steps);

        // Derive pipeline completion from steps, not from the root job's own status
        // (the root job completes after its first step, not after the full pipeline)
        const failedStep = steps.find(s => s.status === "failed");
        const allDone = steps.length > 0 && steps.every(s => s.status === "completed");

        if (failedStep) {
          stopPolling();
          setIsAnalyzing(false);
          setAnalyzeError(`Step "${failedStep.label}" failed`);
        } else if (allDone) {
          stopPolling();
          setIsAnalyzing(false);
          setTimeout(() => window.location.reload(), 1500);
        }
      },
      onError: (error: string) => {
        stopPolling();
        setIsAnalyzing(false);
        setAnalyzeError(error);
      },
    });
  };

  const handleAnalyzeClick = () => {
    setAnalyzeError(null);
    setPipelineSteps([]);
    setIsAnalyzing(true);

    const url = `${BACKEND_URL}/api/calls/${firstCallId}/opportunity/analysis/full`;
    apiPost<FullPipelineResponse>(url, {
      onSuccess: (response) => {
        const job = response.job;
        if (job.all_steps) setPipelineSteps(job.all_steps);
        pollJob(job.id);
        pollingIntervalRef.current = setInterval(() => pollJob(job.id), 2000);
      },
      onError: (error: string) => {
        setIsAnalyzing(false);
        setAnalyzeError(error);
      },
    });
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

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

    const completedCount = pipelineSteps.filter(s => s.status === "completed").length;
    const totalSteps = pipelineSteps.length;
    const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    const overallFailed = pipelineSteps.some(s => s.status === "failed");
    const overallDone = totalSteps > 0 && completedCount === totalSteps;

    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-4">

          {/* Company header card */}
          <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-5">
            <p className="text-[11px] uppercase tracking-wider text-[#888888] font-medium mb-1">Opportunity Factor Analysis</p>
            <h2 className="text-[22px] font-[400] text-[#0F172B] leading-tight">{transcriptCall.company_name}</h2>
            <p className="text-[13px] text-[#888888] mt-0.5">{transcriptCall.basic_industry}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-[#E2E2E2]">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#888888]">Ticker</p>
                <p className="text-[13px] font-semibold text-[#0F172B] mt-0.5">{transcriptCall.company}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#888888]">Quarter</p>
                <p className="text-[13px] font-semibold text-[#0F172B] mt-0.5">{transcriptCall.quarter} {transcriptCall.fiscal_year}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#888888]">Call Date</p>
                <p className="text-[13px] font-semibold text-[#0F172B] mt-0.5">{transcriptCall.call_date}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#888888]">Call ID</p>
                <p className="text-[11px] font-semibold text-[#0F172B] mt-0.5 font-mono">{transcriptCall.id}</p>
              </div>
            </div>
          </div>

          {/* Analysis card */}
          <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-5 space-y-4">

            {/* Idle state */}
            {!isAnalyzing && pipelineSteps.length === 0 && !analyzeError && (
              <p className="text-[13px] text-[#888888]">
                No opportunity analysis available for this transcript yet.
              </p>
            )}

            {/* Error banner */}
            {analyzeError && (
              <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-red-50 border border-red-200">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[12px] text-red-600">{analyzeError}</p>
              </div>
            )}

            {/* Step tracker */}
            {pipelineSteps.length > 0 && (
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[#0F172B]">
                    {overallDone ? "Analysis Complete" : overallFailed ? "Analysis Failed" : "Running Analysis Pipeline"}
                  </p>
                  <span className="text-[11px] font-semibold text-[#888888]">
                    {completedCount}/{totalSteps} steps
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[#E2E2E2] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${overallFailed ? "bg-red-500" : overallDone ? "bg-emerald-600" : "bg-[#0F172B]"}`}
                    style={{ width: `${overallDone ? 100 : progressPct}%` }}
                  />
                </div>

                {/* Steps list */}
                <div className="space-y-0 border border-[#E2E2E2] rounded-[8px] overflow-hidden">
                  {pipelineSteps.map((step, idx) => {
                    const isProcessing = step.status === "processing";
                    const isDone = step.status === "completed";
                    const isFailed = step.status === "failed";
                    const isWaiting = step.status === "waiting";
                    return (
                      <div
                        key={step.analysis_type}
                        className={`flex items-center gap-3 px-4 py-3 ${idx !== pipelineSteps.length - 1 ? "border-b border-[#E2E2E2]" : ""} ${isProcessing ? "bg-[#F5F5F5]" : "bg-white"}`}
                      >
                        {/* Status icon */}
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                          {isDone && (
                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isFailed && (
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {isProcessing && (
                            <svg className="w-4 h-4 text-[#0F172B] animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          )}
                          {isWaiting && (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D1D5DB]" />
                          )}
                        </div>

                        {/* Label */}
                        <span className={`text-[13px] flex-1 ${isDone ? "text-[#0F172B]" : isFailed ? "text-red-600" : isProcessing ? "text-[#0F172B] font-medium" : "text-[#888888]"}`}>
                          {step.label}
                        </span>

                        {/* Status badge */}
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm ${
                          isDone    ? "bg-emerald-50 text-emerald-700" :
                          isFailed  ? "bg-red-50 text-red-600" :
                          isProcessing ? "bg-[#0F172B]/5 text-[#0F172B]" :
                          "bg-[#F5F5F5] text-[#888888]"
                        }`}>
                          {step.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="w-full bg-[#0F172B] text-white hover:bg-[#1e293b] font-semibold py-3 px-4 rounded-[8px] text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing
                ? pipelineSteps.length === 0 ? "Starting..." : "Analyzing..."
                : analyzeError ? "Retry Analysis" : "Analyze"}
            </button>

            {transcriptCall.ppt_url && (
              <a
                href={transcriptCall.ppt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[12px] text-[#888888] hover:text-[#0F172B] transition-colors"
              >
                View Presentation →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Analysis available — render full dashboard
  const data = { ...opportunityData, ...patchedSections } as OFactorResponse;

  // Derive per-section scoring from final_takeaways.section_scores when individual final_scoring is absent
  const ft = data.final_takeaways;
  const ftColor = ft?.status_color;
  function ftScoring(key: keyof NonNullable<typeof ft>["section_scores"], maxScore: number) {
    const ss = ft?.section_scores?.[key];
    if (!ss) return undefined;
    return { score: ss.score, max_score: maxScore, status: ss.status, status_color: ftColor, title: ss.takeaway, body: "" };
  }
  function normScoring(s: { score: number; max_score?: number; status?: string; status_color?: string; title?: string; body?: string } | undefined, defaultMax: number) {
    if (!s) return undefined;
    return { ...s, max_score: s.max_score ?? defaultMax };
  }
  const industryScoring = normScoring(data.industry_overview?.final_scoring ?? ftScoring("industry", 10), 10);
  const competitionScoring = normScoring(data.competition?.final_scoring ?? ftScoring("competition", 10), 10);
  const financialScoring = normScoring(data.financial_strength?.final_scoring ?? ftScoring("financial_strength", 10), 10);
  const customerScoring = normScoring(data.customer_traction?.final_scoring ?? ftScoring("customer_traction", 10), 10);

  const handleSectionUpdate = (sectionKey: string, sectionResult: unknown) => {
    setPatchedSections((prev) => ({ ...prev, [sectionKey]: sectionResult }));
  };

  const NAV_ITEMS = [
    { id: "section-score", label: "Score" },
    { id: "section-industry-intelligence", label: "Industry" },
    ...(data.industry_analysis ? [{ id: "section-industry-analysis", label: "Industry Analysis" }] : []),
    { id: "section-competition", label: "Competition" },
    { id: "section-financial", label: "Financial Strength" },
    { id: "section-customer", label: "Customer Traction" },
  ];

  const opportunityLevel = (() => {
    const score = totalScore?.total_score ?? data.final_takeaways?.overall_score ?? 0;
    const max = totalScore?.max_score ?? data.final_takeaways?.max_score ?? 40;
    const pct = max > 0 ? score / max : 0;
    if (pct <= 0.4) return "LOW";
    if (pct <= 0.7) return "MODERATE";
    return "HIGH";
  })();

  const iconMap: Record<string, typeof TrendingUp> = {
    "Industry": TrendingUp,
    "Competition": BarChart3,
    "Financial Strength": DollarSign,
    "Customer Traction": Users,
  };

  const scrollMap: Record<string, string> = {
    "Industry": "section-industry",
    "Competition": "section-competition",
    "Financial Strength": "section-financial",
    "Customer Traction": "section-customer",
  };

  return (
    <ScreenerPageShell navItems={NAV_ITEMS}>
      <div className="mb-8 px-4 space-y-6">

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

        {/* Opportunity Factor Score */}
        <div id="section-score" className="pt-4">
          <ScreenerScorecard
            title="OPPORTUNITY FACTOR"
            overallLevel={opportunityLevel}
            score={totalScore?.total_score ?? data.final_takeaways?.overall_score ?? 0}
            maxScore={totalScore?.max_score ?? data.final_takeaways?.max_score ?? 40}
            items={[
              { name: "Industry", scoring: industryScoring, takeaway: data.industry_overview?.text?.takeaway },
              { name: "Competition", scoring: competitionScoring, takeaway: data.competition?.text?.takeaway },
              { name: "Financial Strength", scoring: financialScoring, takeaway: data.financial_strength?.text?.takeaway },
              { name: "Customer Traction", scoring: customerScoring, takeaway: data.customer_traction?.text?.takeaway },
            ].map((row) => {
              const s = row.scoring;
              const parsedScore = s ? parseFloat(String(s.score)) : NaN;
              const barValue = s?.max_score ? (parsedScore / s.max_score) * 100 : null;
              return {
                label: row.name,
                descriptor: row.takeaway ?? s?.status ?? undefined,
                rating: (() => {
                  const pct = s?.max_score ? parsedScore / s.max_score : 0;
                  if (isNaN(parsedScore)) return undefined;
                  if (pct <= 0.4) return "LOW";
                  if (pct <= 0.7) return "MODERATE";
                  return "HIGH";
                })(),
                barValue: isNaN(parsedScore) ? null : barValue,
                icon: iconMap[row.name],
                scrollToId: scrollMap[row.name],
              };
            })}
          />
        </div>


        {/* 4.1 Industry — left: analysis card, right: intelligence card */}
        <div id="section-industry-intelligence">
          <SectionPanel
            title="Industry Analysis"
            subtitle="Cross-company synthesis from earnings transcripts & filings"
            scoring={industryScoring}
          >
            <div className="flex gap-6">
              {/* Left (~80%) */}
              <div className="flex-1 min-w-0 space-y-6">
                <IndustryAnalysisCard data={data.industry_overview} />
                {data.industry_analysis && (
                  <TranscriptDriversCard
                    demandPositive={data.industry_analysis.demand_drivers?.positive ?? []}
                    demandNegative={data.industry_analysis.demand_drivers?.negative ?? []}
                    supplyPositive={data.industry_analysis.supply_drivers?.tightness_indicators ?? []}
                    supplyNegative={data.industry_analysis.supply_drivers?.excess_indicators ?? []}
                  />
                )}
                {data.industry_analysis && (
                  <CompanyMetricsTable
                    data={data.industry_analysis}
                    period={data.industry_overview?.period}
                  />
                )}
                {data.industry_analysis?.investment_implications && (
                  <InvestmentImplicationsCard data={data.industry_analysis.investment_implications} />
                )}
              </div>
              {/* Right (~20%): intelligence card */}
              {data.industry_overview?.final_scoring && (
                <div className="w-[400px] shrink-0">
                  <IndustryIntelligenceCard
                    data={data.industry_overview}
                    investmentImplications={data.industry_analysis?.investment_implications}
                  />
                </div>
              )}
            </div>
          </SectionPanel>
        </div>

        {/* 4.2 Competitive Benchmarking vs Industry Peers */}
        <div id="section-competition">
        <SectionPanel
          title="Competitive Benchmarking vs Industry Peers"
          subtitle="Peer comparison from public filings & market data"
          scoring={competitionScoring}
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
                <hr className="border-zinc-200 dark:border-zinc-700 border-dashed my-6" />
                <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-0.5">KPI Benchmarking</h4>
                <p className="text-xs text-zinc-400 mb-3">Latest KPI values across industry peers</p>
                <KpiBenchmarkingTable data={peerData?.peer_kpi_timeseries} loading={peerLoading} />
              </div>
              <CompetitiveBenchmarking data={data.competition} peers={peerData?.competition?.peers ?? []} loading={peerLoading} />
            </>
          )}
          <TakeawayBox title="COMPETITION TAKEAWAY" text={data.competition?.text?.takeaway} color="emerald" />
        </SectionPanel>
        </div>

        {/* 4.3 Financial Strength */}
        <div id="section-financial">
        <SectionPanel
          title="Financial Strength"
          subtitle="Snapshot from financial statements, investor decks & management commentary"
          scoring={financialScoring}
          contentClassName=""
        >
          <div className="pb-4 space-y-4">
            <FinancialStrengthCard
              data={data.financial_strength}
              showDetails={showFinancialDetails}
              onToggle={() => setShowFinancialDetails(v => !v)}
            />
          </div>
          {showFinancialDetails && (
            <>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 space-y-4">
                <SubsectionHeader
                  title="Operating Leverage Analysis"
                  subtitle="Fixed cost absorption, DOL trend & leverage verdict"
                />
                <OperatingLeverageCard data={data.financial_strength?.operating_leverage} />
              </div>
              <div className="pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="Free Cash Flow Analysis"
                  subtitle="FCF conversion, growth trajectory, capex drag & yield"
                />
                <FreeCashFlowCard data={data.financial_strength?.free_cash_flow} />
              </div>
              <div className="pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="Working Capital"
                  subtitle="DSO, DIO, DPO, CCC trends & WC as % of revenue"
                />
                <WorkingCapitalCard data={data.financial_strength?.working_capital} />
              </div>
              <div className="pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="Capital Structure & Capex"
                  subtitle="Balance sheet position, debt trajectory, equity allocation & capex intensity"
                />
                <CapitalStructureCard data={data.financial_strength?.capital_structure} />
              </div>
              <div className="pt-4 pb-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <SubsectionHeader
                  title="KPI Timeseries"
                  subtitle="Industry-specific KPI trends over time"
                />
                <IndustryKpiTable data={peerData?.industry_kpis} loading={peerLoading} />
              </div>
            </>
          )}
          <div>
            <TakeawayBox title="FINANCIAL TAKEAWAY" text={data.financial_strength?.text?.key_takeaway} />
          </div>
        </SectionPanel>
        </div>

        {/* 4.4 Client/Customer Traction */}
        <div id="section-customer">
        <SectionPanel
          title="Client/Customer Traction"
          subtitle="Customer growth, retention & revenue trajectory with alt data projections"
          scoring={customerScoring}
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
    </ScreenerPageShell>
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
