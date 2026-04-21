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
import { QcScoreHeroCard } from "@/components/overview/qc-score-hero-card";
import type { ManagementDashboardData } from "@/types/management";
import type { OFactorResponse } from "@/types/opportunity";
import type { DFactorResponse } from "@/types/deal";

const OVERVIEW_NAV = [
  { id: "section-qc-insight",            label: "QC Insight" },
  { id: "section-fundamentals",          label: "Fundamentals" },
  { id: "section-technicals",            label: "Technicals" },
  { id: "section-market-view",           label: "Market View" },
  { id: "section-investment-conclusion", label: "Investment Conclusion" },
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

  const { data: managementData } = useManagementAnalysis(firstCallId);
  const { data: opportunityData, totalScore: oppTotalScore } = useOpportunityAnalysis(firstCallId);
  const { data: dealData, totalScore: dealTotalScore } = useDealAnalysis(firstCallId);
  const { data: technicalsData } = useTechnicals(symbol === "—" ? "" : symbol);

  const mgmtDashboard = Object.keys(managementData).length > 0
    ? (managementData as ManagementDashboardData)
    : null;
  const oppData = Object.keys(opportunityData).length > 0
    ? (opportunityData as OFactorResponse)
    : null;
  const dFactorData = Object.keys(dealData).length > 0
    ? (dealData as DFactorResponse)
    : null;

  const derivedDealScore = dealTotalScore?.total_score
    ?? (dFactorData?.overview?.deal_factor_score?.overall ?? null);
  const derivedDealMax = dealTotalScore?.max_score
    ?? (dFactorData?.overview?.deal_factor_score?.overall != null ? 20 : null);

  const mScore = mgmtDashboard?.mqi_score?.total ?? null;
  const mMax = 100;
  const oScore = oppTotalScore?.total_score ?? null;
  const oMax = oppTotalScore?.max_score ?? 40;
  const dScore = derivedDealScore;
  const dMax = derivedDealMax ?? 40;

  let partialScore = 0;
  let partialMax = 0;
  if (mScore !== null) { partialScore += mScore; partialMax += mMax; }
  if (oScore !== null) { partialScore += oScore; partialMax += oMax; }
  if (dScore !== null) { partialScore += dScore; partialMax += dMax; }

  const totalMax = mMax + oMax + dMax;
  const hasAnyScore = partialMax > 0;
  const rating = hasAnyScore ? getRating(partialScore / totalMax) : null;

  return (
    <ScreenerPageShell navItems={OVERVIEW_NAV}>
      <QcScoreHeroCard
        score={hasAnyScore ? Math.round((partialScore / totalMax) * 100) : null}
        ratingLabel={rating}
        mqiLabel={mgmtDashboard?.mqi_score?.label ?? null}
        thesisHeadline={mgmtDashboard?.management_intelligence?.key_takeaways?.[0] ?? null}
      />
      {data && <KeyRatioTiles data={data} />}
      <div className="px-4 space-y-6 pt-6 mb-8">

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            Failed to load data: {error}
          </div>
        )}

        {/* Section: QC Insight */}
        <div id="section-qc-insight">
          <IMScoreCard
            managementScore={mgmtDashboard?.mqi_score?.total ?? null}
            managementMax={100}
            opportunityScore={oppTotalScore?.total_score ?? null}
            opportunityMax={oppTotalScore?.max_score ?? null}
            dealScore={derivedDealScore}
            dealMax={derivedDealMax}
            managementFactors={undefined}
            opportunityTakeaways={oppData?.final_takeaways ?? null}
            opportunityData={oppData}
            dealOverview={dFactorData?.overview ?? null}
          />
        </div>

        {/* Section: Fundamentals */}
        <div id="section-fundamentals">
          {data && <FundamentalOverviewCard data={data} />}
        </div>

        {/* Section: Technicals */}
        <div id="section-technicals">
          {technicalsData && <TechnicalsCard data={technicalsData} />}
        </div>

        {/* Section: Market View */}
        <div id="section-market-view">
          <MarketViewCard />
        </div>

        {/* Section: Investment Conclusion */}
        <div id="section-investment-conclusion">
          <InvestmentConclusionCard
            dealData={dFactorData}
            oppTakeaways={oppData?.final_takeaways ?? null}
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
