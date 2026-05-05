"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { usePeerData } from "@/hooks/usePeerData";
import type { OFactorResponse } from "@/types/opportunity";

import { TrendingUp, BarChart3, DollarSign, Users } from "lucide-react";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { ScreenerScorecard } from "@/components/molecules/screener-scorecard";
import { OpportunityScoreBreakdownCard } from "@/components/opportunity/opportunity-score-breakdown-card";
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
import { IndustryAnalysisCard } from "@/components/opportunity/industry-analysis-card";
import { IndustryIntelligenceCard } from "@/components/opportunity/industry-intelligence-card";
import { CompetitionIntelligenceCard } from "@/components/opportunity/competition-intelligence-card";
import { CustomerIntelligenceCard } from "@/components/opportunity/customer-intelligence-card";
import { TranscriptDriversCard } from "@/components/opportunity/transcript-drivers-card";
import { CompanyMetricsTable } from "@/components/opportunity/company-metrics-table";
import { InvestmentImplicationsCard } from "@/components/opportunity/investment-implications-card";
import { PageEmptyState } from "@/components/opportunity/page-empty-state";
import { AnalyzePromptCard } from "@/components/opportunity/analyze-prompt-card";
import { FinancialIntelligenceCard } from "@/components/opportunity/financial-intelligence-card";

const NAV_ITEMS = [
  { id: "section-score", label: "Score" },
  { id: "section-industry-intelligence", label: "Industry" },
  { id: "section-competition", label: "Competition" },
  { id: "section-financial", label: "Financial Strength" },
  { id: "section-customer", label: "Customer Traction" },
];

const ICON_MAP: Record<string, typeof TrendingUp> = {
  "Industry": TrendingUp,
  "Competition": BarChart3,
  "Financial Strength": DollarSign,
  "Customer Traction": Users,
};

const SCROLL_MAP: Record<string, string> = {
  "Industry": "section-industry",
  "Competition": "section-competition",
  "Financial Strength": "section-financial",
  "Customer Traction": "section-customer",
};

function opportunityLevel(score: number, max: number) {
  const pct = max > 0 ? score / max : 0;
  if (pct <= 0.4) return "LOW";
  if (pct <= 0.7) return "MODERATE";
  return "HIGH";
}

function OpportunityContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const [selectedSection, setSelectedSection] = useState("industry_overview");
  const [showSideWindow, setShowSideWindow] = useState(false);
  const [patchedSections, setPatchedSections] = useState<Partial<OFactorResponse>>({});
  const [activeFinancialTab, setActiveFinancialTab] = useState(0);

  const { data: transcriptCalls, loading: transcriptLoading, error: transcriptError } = useTranscriptCalls(symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";
  const { data: opportunityData, totalScore, loading: opportunityLoading } = useOpportunityAnalysis(firstCallId);
  const { data: peerData, loading: peerLoading } = usePeerData(firstCallId);

  const loading = transcriptLoading || opportunityLoading;

  if (!symbol) {
    return <PageEmptyState><span style={{ color: "var(--qc-down)" }}>Error: No symbol provided in query parameters</span></PageEmptyState>;
  }
  if (loading) {
    return <PageEmptyState>Loading...</PageEmptyState>;
  }
  if (transcriptError) {
    return <PageEmptyState><span style={{ color: "var(--qc-down)" }}>Error: {transcriptError}</span></PageEmptyState>;
  }
  if (transcriptCalls.length === 0) {
    return <PageEmptyState>No transcript calls found for {symbol}</PageEmptyState>;
  }

  if (Object.keys(opportunityData).length === 0) {
    return <AnalyzePromptCard transcriptCall={transcriptCalls[0]} />;
  }

  // Analysis available — render full dashboard
  const data = { ...opportunityData, ...patchedSections } as OFactorResponse;

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

  const industryScoring = normScoring(data.industry_overview?.final_scoring ?? ftScoring("industry", 25), 25);
  const competitionScoring = normScoring(data.competition?.final_scoring ?? ftScoring("competition", 10), 10);
  const financialScoring = normScoring(data.financial_strength?.final_scoring ?? ftScoring("financial_strength", 10), 10);
  const customerScoring = normScoring(data.customer_traction?.analysis?.final_scoring ?? ftScoring("customer_traction", 10), 10);

  const handleSectionUpdate = (sectionKey: string, sectionResult: unknown) => {
    setPatchedSections(prev => ({ ...prev, [sectionKey]: sectionResult }));
  };

  const overallScore = totalScore?.total_score ?? data.final_takeaways?.overall_score ?? 0;
  const overallMax = 100;

  const scorecardItems = (
    [
      { name: "Industry", scoring: industryScoring, takeaway: data.final_takeaways?.section_scores?.industry?.status },
      { name: "Competition", scoring: competitionScoring, takeaway: data.final_takeaways?.section_scores?.competition?.status },
      { name: "Financial Strength", scoring: financialScoring, takeaway: data.final_takeaways?.section_scores?.financial_strength?.status },
      { name: "Customer Traction", scoring: customerScoring, takeaway: data.final_takeaways?.section_scores?.customer_traction?.status },
    ] as const
  ).map((row) => {
    const s = row.scoring;
    const parsedScore = s ? parseFloat(String(s.score)) : NaN;
    return {
      label: row.name,
      descriptor: row.takeaway ?? s?.status ?? undefined,
      rating: s?.max_score && !isNaN(parsedScore) ? opportunityLevel(parsedScore, s.max_score) : undefined,
      barValue: s?.max_score && !isNaN(parsedScore) ? (parsedScore / s.max_score) * 100 : null,
      icon: ICON_MAP[row.name],
      scrollToId: SCROLL_MAP[row.name],
    };
  });

  return (
    <ScreenerPageShell navItems={NAV_ITEMS}>
      <div className="mb-8 px-4 space-y-6">

        {/* Floating Prompt Toggle */}
        {/* <button
          onClick={() => setShowSideWindow(v => !v)}
          className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all ${
            showSideWindow
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-zinc-900/30"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/40 hover:shadow-blue-600/60"
          }`}
        >
          <PanelRight className="h-4 w-4" />
          Prompt
        </button> */}

        {/* Score */}
        <div id="section-score" className="flex gap-4 items-stretch pt-4">
          <div style={{ flex: "0 0 40%", minWidth: 0 }}>
            <ScreenerScorecard
              title="VERDICT"
              overallLevel={opportunityLevel(overallScore, overallMax)}
              score={overallScore}
              maxScore={overallMax}
              items={scorecardItems}
              verdictAfter={data.final_takeaways?.investment_thesis ?? undefined}
            />
          </div>
          <div style={{ flex: "0 0 60%", minWidth: 0 }}>
            <OpportunityScoreBreakdownCard
              overallScore={overallScore}
              overallMax={overallMax}
              overallStatus={data.final_takeaways?.overall_status ?? opportunityLevel(overallScore, overallMax)}
              sectionScores={data.final_takeaways?.section_scores ?? {}}
              title={data.final_takeaways?.key_highlights?.[0] ?? undefined}
              subtitle={data.final_takeaways?.key_highlights?.[1] ?? undefined}
            />
          </div>
        </div>

        {/* Industry Analysis */}
        <div id="section-industry-intelligence">
          <SectionPanel
            title="Industry Analysis"
            subtitle="Cross-company synthesis from earnings transcripts & filings"
            scoring={industryScoring}
          >
            <div className="flex gap-6">
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
                  <CompanyMetricsTable data={data.industry_analysis} period={data.industry_overview?.period} />
                )}
                {data.industry_analysis?.investment_implications && (
                  <InvestmentImplicationsCard data={data.industry_analysis.investment_implications} />
                )}
              </div>
              {data.industry_overview?.final_scoring && (
                <div className="w-[400px] shrink-0">
                  <IndustryIntelligenceCard
                    data={data.industry_overview}
                    investmentImplications={data.industry_analysis}
                  />
                </div>
              )}
            </div>
          </SectionPanel>
        </div>

        {/* Competition */}
        <div id="section-competition">
          <SectionPanel
            title="Competitive Benchmarking vs Industry Peers"
            subtitle="Peer comparison from public filings & market data"
            scoring={competitionScoring}
            contentClassName="px-6 space-y-4"
          >
            <div className="flex gap-6">
              <div className="flex-1 min-w-0 space-y-4">
                <CompetitionCard data={data.competition} />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: "var(--qc-ink)" }}>KPI Benchmarking</h4>
                  <p className="text-xs mb-3" style={{ color: "var(--qc-ink-2)" }}>Latest KPI values across industry peers</p>
                  <KpiBenchmarkingTable data={peerData?.peer_kpi_timeseries} loading={peerLoading} />
                </div>
                <CompetitiveBenchmarking data={data.competition} peers={peerData?.competition?.peers ?? []} loading={peerLoading} />
              </div>
              {data.competition?.final_scoring && (
                <div className="w-[400px] shrink-0">
                  <CompetitionIntelligenceCard data={data.competition} />
                </div>
              )}
            </div>
          </SectionPanel>
        </div>

        {/* Financial Strength */}
        <div id="section-financial">
          <SectionPanel
            title="Financial Strength"
            subtitle="Snapshot from financial statements, investor decks & management commentary"
            scoring={financialScoring}
          >
            <div className="flex gap-6">
              <div className="flex-1 min-w-0 space-y-4">
                <div className="pb-0 space-y-4">
                  <FinancialStrengthCard
                    data={data.financial_strength}
                  />
                </div>
                {(() => {
                  const FINANCIAL_TABS = [
                    { label: "Operating Leverage", subtitle: "Fixed cost absorption, DOL trend & leverage verdict" },
                    { label: "Free Cash Flow", subtitle: "FCF conversion, growth trajectory, capex drag & yield" },
                    { label: "Working Capital", subtitle: "DSO, DIO, DPO, CCC trends & WC as % of revenue" },
                    { label: "Capital Structure & Capex", subtitle: "Balance sheet position, debt trajectory, equity allocation & capex intensity" },
                    { label: "KPI Timeseries", subtitle: "Industry-specific KPI trends over time" },
                  ];
                  return (
                    <div className="rounded-[10px] p-2" style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
                      <div className="flex gap-1 overflow-x-auto pb-2 px-1 pt-1">
                        {FINANCIAL_TABS.map((tab, i) => (
                          <button
                            key={tab.label}
                            onClick={() => setActiveFinancialTab(i)}
                            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap"
                            style={
                              activeFinancialTab === i
                                ? { background: "var(--qc-ink)", color: "var(--qc-on-dark)" }
                                : { background: "var(--qc-card)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink-2)" }
                            }
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-1 text-[11px] px-2 pb-2" style={{ color: "var(--qc-ink-2)" }}>
                        {FINANCIAL_TABS[activeFinancialTab].subtitle}
                      </div>
                      <div className="rounded-[10px] p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}>
                        {activeFinancialTab === 0 && <OperatingLeverageCard data={data.financial_strength?.operating_leverage} />}
                        {activeFinancialTab === 1 && <FreeCashFlowCard data={data.financial_strength?.free_cash_flow} />}
                        {activeFinancialTab === 2 && <WorkingCapitalCard data={data.financial_strength?.working_capital} />}
                        {activeFinancialTab === 3 && <CapitalStructureCard data={data.financial_strength?.capital_structure} />}
                        {activeFinancialTab === 4 && <IndustryKpiTable data={peerData?.industry_kpis} loading={peerLoading} />}
                      </div>
                    </div>
                  );
                })()}
              </div>
              {data.financial_strength?.final_scoring && (
                <div className="w-[400px] shrink-0">
                  <FinancialIntelligenceCard data={data.financial_strength} />
                </div>
              )}
            </div>
          </SectionPanel>
        </div>

        {/* Customer Traction */}
        <div id="section-customer">
          <SectionPanel
            title="Client/Customer Traction"
            subtitle="Customer growth, retention & revenue trajectory with alt data projections"
            scoring={customerScoring}
            contentClassName="px-6 space-y-4"
          >
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <CustomerTractionCard data={data.customer_traction} />
              </div>
              {data.customer_traction?.analysis?.final_scoring && (
                <div className="w-[400px] shrink-0">
                  <CustomerIntelligenceCard data={data.customer_traction} />
                </div>
              )}
            </div>
          </SectionPanel>
        </div>

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
    <Suspense fallback={<PageEmptyState>Loading...</PageEmptyState>}>
      <OpportunityContent />
    </Suspense>
  );
}
