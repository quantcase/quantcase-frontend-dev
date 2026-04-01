"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SectionPanel } from "@/components/molecules/section-panel";
import { FinancialPerformanceCard } from "@/components/overview/financial-performance-card";
import { IMScoreCard } from "@/components/overview/im-score-card";
import { ValuationCard } from "@/components/overview/valuation-card";
import { KeyThesisCard } from "@/components/overview/key-thesis-card";
import { MarketDataCard } from "@/components/overview/market-data-card";
import { AnalystCard } from "@/components/overview/analyst-card";
import { KeyMetricsRow } from "@/components/overview/key-metrics-row";
import { QualityMetricsTrendCard } from "@/components/overview/quality-metrics-card";
import { useScreenerData } from "@/hooks/useScreenerData";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { useDealAnalysis } from "@/hooks/useDealAnalysis";
import type { ManagementDashboardData } from "@/types/management";
import type { OFactorResponse } from "@/types/opportunity";
import type { DFactorResponse } from "@/types/deal";

function OverviewContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  const { data, loading, error } = useScreenerData(symbol);

  const { data: transcriptCalls } = useTranscriptCalls(symbol === "—" ? "" : symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";

  const { data: managementData } = useManagementAnalysis(firstCallId);
  const { data: opportunityData, totalScore: oppTotalScore } = useOpportunityAnalysis(firstCallId);
  const { data: dealData, totalScore: dealTotalScore } = useDealAnalysis(firstCallId);

  const mgmtDashboard = Object.keys(managementData).length > 0
    ? (managementData as ManagementDashboardData)
    : null;
  const oppData = Object.keys(opportunityData).length > 0
    ? (opportunityData as OFactorResponse)
    : null;
  const dFactorData = Object.keys(dealData).length > 0
    ? (dealData as DFactorResponse)
    : null;

  // Derive deal score: prefer totalScore from API wrapper, fall back to overview.deal_factor_score
  const derivedDealScore = dealTotalScore?.total_score
    ?? (dFactorData?.overview?.deal_factor_score?.overall ?? null);
  const derivedDealMax = dealTotalScore?.max_score
    ?? (dFactorData?.overview?.deal_factor_score?.overall != null ? 20 : null);

  const formattedDate = data?.quote.lastUpdated
    ? new Date(data.quote.lastUpdated).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const confidenceLevel = (mgmtDashboard as unknown as { company?: { confidenceLevel?: string } })?.company?.confidenceLevel;

  return (
    <div className="min-h-screen bg-white mb-8 px-4">

      {/* Company Header */}
      <div className="flex items-start justify-between gap-4 mb-6 mt-8">
        <div className="space-y-1.5">
          <h2 className="leading-tight" style={{ fontSize: 32, fontWeight: 600 }}>
            {loading ? "Loading…" : (data?.company.name ?? symbol)}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>{data?.company.exchange ?? "NSE"}: {symbol}</Badge>
            <p className="text-[#888888]">{data?.company.industry ?? "—"}</p>
            {data?.company.sector && data.company.sector !== data.company.industry && (
              <p className="text-zinc-400">{data.company.sector}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-900 text-white text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wide">
              Full IM
            </span>
            {confidenceLevel === "HIGH" && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wide">
                High Confidence
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400">{formattedDate}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          Failed to load data: {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="mx-auto space-y-6 ">

        {/* Section A: IM Score — full-width 2-panel */}
        <IMScoreCard
          managementScore={mgmtDashboard?.consistency.score ?? null}
          managementMax={mgmtDashboard?.consistency.maxScore ?? null}
          opportunityScore={oppTotalScore?.total_score ?? null}
          opportunityMax={oppTotalScore?.max_score ?? null}
          dealScore={derivedDealScore}
          dealMax={derivedDealMax}
        />

        {/* Section B: Key Metrics Tiles */}
        <KeyMetricsRow
          peRatio={data?.valuation.peRatio ?? null}
          forwardPE={data?.valuation.forwardPE ?? null}
          ebitda={data?.financialPerformance.ebitda ?? null}
          enterpriseValue={data?.valuation.enterpriseValue ?? null}
          totalCash={data?.efficiency.totalCash ?? null}
          totalDebt={data?.efficiency.totalDebt ?? null}
          operatingCashflow={data?.financialPerformance.operatingCashflow || null}
          earningsQuarterlyGrowth={data?.keyStats.earningsQuarterlyGrowth ?? null}
          epsCagrFromDeal={dFactorData?.target_price_matrix?.base?.eps_cagr ?? null}
        />

        {/* Section C: Charts 2-up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialPerformanceCard
            revenue={data?.financialPerformance.revenue ?? null}
            revenueGrowth={data?.financialPerformance.revenueGrowth ?? null}
            ebitda={data?.financialPerformance.ebitda ?? null}
            ebitdaMargins={data?.financialPerformance.ebitdaMargins ?? null}
            earningsGrowth={data?.financialPerformance.earningsGrowth ?? null}
            quarterlyTrend={data?.financialPerformance.quarterlyTrend ?? null}
          />
          <QualityMetricsTrendCard
            quarterlyTrend={data?.financialPerformance.quarterlyTrend ?? null}
            grossMargins={data?.financialPerformance.grossMargins ?? null}
            operatingMargins={data?.financialPerformance.operatingMargins ?? null}
            profitMargins={data?.financialPerformance.profitMargins ?? null}
            ebitda={data?.financialPerformance.ebitda ?? null}
            totalCash={data?.efficiency.totalCash ?? null}
            totalDebt={data?.efficiency.totalDebt ?? null}
            debtToEquity={data?.efficiency.debtToEquity ?? null}
          />
        </div>


        {/* Section E: Analyst Coverage + Key Thesis */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <KeyThesisCard
              governanceSignals={mgmtDashboard?.governanceSignals}
              opportunityTakeaway={oppData?.final_takeaways?.investment_thesis ?? null}
            />
          </div>
          <AnalystCard
            targetMeanPrice={data?.analystRatings.targetMeanPrice ?? null}
            targetHighPrice={data?.analystRatings.targetHighPrice ?? null}
            targetLowPrice={data?.analystRatings.targetLowPrice ?? null}
            recommendationKey={data?.analystRatings.recommendationKey ?? null}
            numberOfAnalysts={data?.analystRatings.numberOfAnalystOpinions ?? null}
            currentPrice={data?.quote.price ?? null}
            heldPercentInsiders={data?.keyStats.heldPercentInsiders ?? null}
            heldPercentInstitutions={data?.keyStats.heldPercentInstitutions ?? null}
          />
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <OverviewContent />
    </Suspense>
  );
}
