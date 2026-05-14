"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { IMScoreCard } from "@/components/overview/im-score-card";
import { FundamentalOverviewCard } from "@/components/overview/fundamental-overview-card";
import { TechnicalsCard, PriceLevelsSection } from "@/components/overview/technicals-card";
import { InvestmentConclusionCard } from "@/components/overview/investment-conclusion-card";
import { DecisionIntelligencePanel } from "@/components/overview/decision-intelligence-panel";
import { useScreenerData } from "@/hooks/useScreenerData";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { useDealAnalysis } from "@/hooks/useDealAnalysis";
import { useTechnicals } from "@/hooks/useTechnicals";
import { KeyRatioTiles } from "@/components/overview/key-ratio-tiles";
import { CompanyProfileCard } from "@/components/overview/company-profile-card";
import { ReanalyzeButton } from "@/components/management/reanalyze-button";
import { OverviewAnalyzePrompt } from "@/components/overview/overview-analysis";
import { useOverviewFetch, useOverviewTrigger } from "@/hooks/useOverviewAnalysis";

const OVERVIEW_NAV = [
  { id: "section-about",                  label: "About" },
  { id: "section-qc-insight",             label: "QC Insight" },
  { id: "section-technicals",             label: "Technicals" },
  { id: "section-fundamentals",           label: "Fundamentals" },
  { id: "section-investment-conclusion",  label: "Investment Conclusion" },
];

function getRating(scorePct: number): string {
  if (scorePct >= 0.80) return "Strong Buy";
  if (scorePct >= 0.65) return "Buy";
  if (scorePct >= 0.50) return "Hold";
  if (scorePct >= 0.35) return "Underperform";
  return "Sell";
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  const { data, error } = useScreenerData(symbol);

  const { data: transcriptCalls } = useTranscriptCalls(symbol === "—" ? "" : symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";

  const { data: managementInsight } = useManagementAnalysis(firstCallId);
  const { data: opportunityInsight } = useOpportunityAnalysis(firstCallId);
  const { data: dealInsight } = useDealAnalysis(firstCallId);
  const { data: technicalsData } = useTechnicals(symbol === "—" ? "" : symbol);

  // Overview analysis
  const { data: overviewData, loading: overviewLoading, refetch: refetchOverview } = useOverviewFetch(firstCallId);

  const handleOverviewComplete = useCallback(() => {
    refetchOverview();
  }, [refetchOverview]);

  const { isAnalyzing, analyzeError, jobStatus, progress, trigger } = useOverviewTrigger({
    callId: firstCallId,
    onComplete: handleOverviewComplete,
  });

  const mScore = managementInsight?.score ?? null;
  const oScore = opportunityInsight?.score ?? null;
  const dScore = dealInsight?.score ?? null;

  let partialSum = 0, partialCount = 0;
  if (mScore !== null) { partialSum += mScore; partialCount++; }
  if (oScore !== null) { partialSum += oScore; partialCount++; }
  if (dScore !== null) { partialSum += dScore; partialCount++; }
  const rating = partialCount > 0 ? getRating((partialSum / partialCount) / 100) : null;

  return (
    <ScreenerPageShell
      navItems={OVERVIEW_NAV}
      headerRight={
        overviewData ? (
          <ReanalyzeButton
            isAnalyzing={isAnalyzing}
            aggregateStatus={jobStatus}
            progress={progress}
            analyzedAt={overviewData.analyzed_at ?? null}
            analyzeError={analyzeError}
            onClick={trigger}
          />
        ) : undefined
      }
    >
      <div className="pb-8 pt-6">

        {error && (
          <div className="mx-4 mt-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            Failed to load data: {error}
          </div>
        )}

        {/* Metric tiles — full width across top */}
        {data && (
          <div className="mb-5">
            <KeyRatioTiles data={data} />
          </div>
        )}

        {/* 2-column layout: 70% left, 30% right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: 16,
            alignItems: "start",
            padding: "0 16px",
            marginBottom: 16,
          }}
        >
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

            {/* About */}
            <div id="section-about">
              {data && <CompanyProfileCard data={data} overviewData={overviewData} />}
            </div>

            {/* QC Insight */}
            <div id="section-qc-insight">
              <IMScoreCard
                management={managementInsight ?? null}
                opportunity={opportunityInsight ?? null}
                deal={dealInsight ?? null}
                overviewData={overviewData}
              />
            </div>

            {/* Overview Analysis — trigger prompt only; data flows into existing section components */}
            {!overviewData && firstCallId && (
              <div id="section-overview-analysis">
                <OverviewAnalyzePrompt
                  isAnalyzing={isAnalyzing}
                  jobStatus={jobStatus}
                  progress={progress}
                  analyzeError={analyzeError}
                  onAnalyze={trigger}
                  callId={firstCallId}
                />
              </div>
            )}

            {/* Technicals */}
            <div id="section-technicals">
              {technicalsData && <TechnicalsCard data={technicalsData} overviewSummary={overviewData?.technical_summary ?? null} />}
            </div>

          </div>

          {/* ── Right column: Decision Intelligence ── */}
          <div>
            <DecisionIntelligencePanel
              management={managementInsight ?? null}
              opportunity={opportunityInsight ?? null}
              deal={dealInsight ?? null}
              technicalsData={technicalsData ?? null}
              screenerData={data ?? null}
              rating={rating}
              symbol={symbol}
            />
          </div>

        </div>

        {/* Full-width sections below the 2-column grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 16px" }}>

          {/* Price Levels */}
          {technicalsData && <PriceLevelsSection data={technicalsData} overviewSummary={overviewData?.technical_summary ?? null} />}

          {/* Fundamentals */}
          <div id="section-fundamentals">
            {data && <FundamentalOverviewCard data={data} symbol={symbol} overviewData={overviewData} />}
          </div>

          {/* Investment Conclusion */}
          <div id="section-investment-conclusion">
            <InvestmentConclusionCard
              dealData={null}
              oppTakeaways={null}
              technicalsData={technicalsData ?? null}
              rating={rating}
              oppInsight={opportunityInsight ?? null}
              overviewData={overviewData}
            />
          </div>

        </div>
      </div>
    </ScreenerPageShell>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <OverviewContent />
    </Suspense>
  );
}
