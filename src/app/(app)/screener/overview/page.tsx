"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { IMScoreCard } from "@/components/overview/im-score-card";
import { FundamentalOverviewCard } from "@/components/overview/fundamental-overview-card";
import { TechnicalsCard } from "@/components/overview/technicals-card";
import { MarketViewCard } from "@/components/overview/market-view-card";
import { InvestmentConclusionCard } from "@/components/overview/investment-conclusion-card";
import { useScreenerData } from "@/hooks/useScreenerData";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { useDealAnalysis } from "@/hooks/useDealAnalysis";
import { useTechnicals } from "@/hooks/useTechnicals";
import { KeyRatioTiles } from "@/components/overview/key-ratio-tiles";
import { CompanyProfileCard } from "@/components/overview/company-profile-card";

const OVERVIEW_NAV = [
  { id: "section-about",                  label: "About" },
  { id: "section-qc-insight",             label: "QC Insight" },
  { id: "section-fundamentals",           label: "Fundamentals" },
  { id: "section-technicals",             label: "Technicals" },
  { id: "section-market-view",            label: "Market View" },
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

  const mScore = managementInsight?.score ?? null;
  const oScore = opportunityInsight?.score ?? null;
  const dScore = dealInsight?.score ?? null;

  let partialSum = 0;
  let partialCount = 0;
  if (mScore !== null) { partialSum += mScore; partialCount++; }
  if (oScore !== null) { partialSum += oScore; partialCount++; }
  if (dScore !== null) { partialSum += dScore; partialCount++; }

  const hasAnyScore = partialCount > 0;
  const avgScore = hasAnyScore ? partialSum / partialCount : 0;
  const rating = hasAnyScore ? getRating(avgScore / 100) : null;

  return (
    <ScreenerPageShell navItems={OVERVIEW_NAV}>
      <div className="space-y-6 pb-8 pt-6">

        {error && (
          <div className="mx-4 mt-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            Failed to load data: {error}
          </div>
        )}

        {/* Row 1: About + Company Facts */}
        <div id="section-about">
          {data && <CompanyProfileCard data={data} />}
        </div>

        {/* Row 2: Key metric tiles */}
        {data && <KeyRatioTiles data={data} />}

        {/* Row 3: QC Insight */}
        <div id="section-qc-insight" className="px-4">
          <IMScoreCard
            managementScore={mScore}
            managementMax={100}
            opportunityScore={oScore}
            opportunityMax={100}
            dealScore={dScore}
            dealMax={100}
            managementIntelligence={null}
            opportunityTakeaways={null}
            opportunityData={null}
            dealOverview={null}
          />
        </div>

        {/* Section: Fundamentals */}
        <div id="section-fundamentals" className="px-4">
          {data && <FundamentalOverviewCard data={data} symbol={symbol} />}
        </div>

        {/* Section: Technicals */}
        <div id="section-technicals" className="px-4">
          {technicalsData && <TechnicalsCard data={technicalsData} />}
        </div>

        {/* Section: Market View */}
        <div id="section-market-view" className="px-4">
          <MarketViewCard />
        </div>

        {/* Section: Investment Conclusion */}
        <div id="section-investment-conclusion" className="px-4">
          <InvestmentConclusionCard
            dealData={null}
            oppTakeaways={null}
            technicalsData={technicalsData ?? null}
            rating={rating}
          />
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
