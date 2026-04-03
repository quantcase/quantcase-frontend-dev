"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { FinancialPerformanceCard } from "@/components/overview/financial-performance-card";
import { IMScoreCard } from "@/components/overview/im-score-card";
import { KeyThesisCard } from "@/components/overview/key-thesis-card";
import { AnalystCard } from "@/components/overview/analyst-card";
import { KeyMetricsRow } from "@/components/overview/key-metrics-row";
import { FundamentalOverviewCard } from "@/components/overview/fundamental-overview-card";
import { TechnicalsCard } from "@/components/overview/technicals-card";
import { MarketViewCard } from "@/components/overview/market-view-card";
import { QualityMetricsTrendCard } from "@/components/overview/quality-metrics-card";
import { formatINR, formatPrice } from "@/lib/utils";
import { useScreenerData } from "@/hooks/useScreenerData";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { useDealAnalysis } from "@/hooks/useDealAnalysis";
import { useTechnicals } from "@/hooks/useTechnicals";
import type { ManagementDashboardData } from "@/types/management";
import type { OFactorResponse } from "@/types/opportunity";
import type { DFactorResponse } from "@/types/deal";

function getRating(scorePct: number): string {
  if (scorePct >= 0.80) return "Strong Buy";
  if (scorePct >= 0.65) return "Buy";
  if (scorePct >= 0.50) return "Hold";
  if (scorePct >= 0.35) return "Underperform";
  return "Sell";
}

function getCapCategory(marketCap: number): string {
  const cr = marketCap / 1e7;
  if (cr >= 20000) return "Large cap";
  if (cr >= 5000) return "Mid cap";
  return "Small cap";
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  const { data, loading, error } = useScreenerData(symbol);

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

  // Derive deal score: prefer totalScore from API wrapper, fall back to overview.deal_factor_score
  const derivedDealScore = dealTotalScore?.total_score
    ?? (dFactorData?.overview?.deal_factor_score?.overall ?? null);
  const derivedDealMax = dealTotalScore?.max_score
    ?? (dFactorData?.overview?.deal_factor_score?.overall != null ? 20 : null);

  // Compute total IM score for QC Score display
  const mScore = mgmtDashboard?.consistency.score ?? null;
  const mMax = mgmtDashboard?.consistency.maxScore ?? 20;
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
  const qcScore = hasAnyScore ? Math.round(partialScore * 10) / 10 : null;
  const rating = hasAnyScore ? getRating(partialScore / totalMax) : null;

  const formattedDate = data?.quote.lastUpdated
    ? new Date(data.quote.lastUpdated).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const confidenceLevel = (mgmtDashboard as unknown as { company?: { confidenceLevel?: string } })?.company?.confidenceLevel;

  // Header metric tiles derived values
  const price = data?.quote.price ?? null;
  const changePercent = data?.quote.changePercent ?? null;
  const marketCap = data?.quote.marketCap ?? null;
  const week52High = data?.quote.week52High ?? null;
  const week52Low = data?.quote.week52Low ?? null;
  const dividendYield = data?.perShare.dividendYield ?? null;
  const earningsQuarterlyGrowth = data?.keyStats.earningsQuarterlyGrowth ?? null;
  const epsCagrFromDeal = dFactorData?.target_price_matrix?.base?.eps_cagr ?? null;

  const epsCagrDisplay = epsCagrFromDeal
    ?? (earningsQuarterlyGrowth != null
      ? `${earningsQuarterlyGrowth >= 0 ? "+" : ""}${(earningsQuarterlyGrowth * 100).toFixed(1)}%`
      : "—");
  const epsCagrSublabel = epsCagrFromDeal ? "3Y CAGR estimate" : "Earnings growth (QoQ)";
  const isEpsCagrPositive = epsCagrDisplay !== "—" && !epsCagrDisplay.startsWith("-");

  const week52RangeDisplay = week52Low != null && week52High != null
    ? `${formatPrice(week52Low, 0)}–${formatPrice(week52High, 0)}`
    : "—";
  const week52Spread = week52Low != null && week52High != null && week52Low > 0
    ? `±${Math.round(((week52High - week52Low) / week52Low) * 100)}%`
    : null;

  const priceChangeDisplay = changePercent != null
    ? `${changePercent >= 0 ? "+" : ""}${(changePercent * 100).toFixed(1)}% today`
    : null;

  const dividendYieldDisplay = dividendYield != null
    ? `${(dividendYield * 100).toFixed(1)}%`
    : "—";

  return (
    <div className="min-h-screen bg-white mb-8 px-4">

      {/* Company Header */}
      <div className="flex items-start justify-between gap-4 mb-4 pt-8">
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
            {rating && (
              <span className="border border-zinc-300 text-zinc-700 text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wide">
                {rating}
              </span>
            )}
            {confidenceLevel === "HIGH" && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wide">
                High Confidence
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400">
            {formattedDate}
            {qcScore !== null && (
              <> &middot; QC Score: {qcScore} / {totalMax}</>
            )}
          </span>
        </div>
      </div>

      {/* Market Data Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {/* CMP */}
        <div className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-1">
          <small className="uppercase tracking-wider text-[#888888]">CMP</small>
          <p className="text-2xl font-semibold text-[#0F172B] leading-tight">
            {price != null ? formatPrice(price, 0) : "—"}
          </p>
          {priceChangeDisplay && (
            <small className={`text-[11px] font-semibold flex items-center gap-1 ${
              (changePercent ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"
            }`}>
              {(changePercent ?? 0) >= 0 ? "▲" : "▼"} {priceChangeDisplay}
            </small>
          )}
        </div>

        {/* Market Cap */}
        <div className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-1">
          <small className="uppercase tracking-wider text-[#888888]">Market Cap</small>
          <p className="text-2xl font-semibold text-[#0F172B] leading-tight">
            {marketCap != null ? formatINR(marketCap) : "—"}
          </p>
          {marketCap != null && (
            <small className="text-[11px] text-[#888888]">{getCapCategory(marketCap)}</small>
          )}
        </div>

        {/* 52W Range */}
        <div className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-1">
          <small className="uppercase tracking-wider text-[#888888]">52W Range</small>
          <p className="text-2xl font-semibold text-[#0F172B] leading-tight">
            {week52RangeDisplay}
          </p>
          {week52Spread && (
            <small className="text-[11px] text-[#888888]">{week52Spread}</small>
          )}
        </div>

        {/* EPS CAGR */}
        <div className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-1">
          <small className="uppercase tracking-wider text-[#888888]">EPS CAGR 3Y</small>
          <p className="text-2xl font-semibold text-[#0F172B] leading-tight">
            {epsCagrDisplay}
          </p>
          {epsCagrDisplay !== "—" && (
            <small className={`text-[11px] font-semibold flex items-center gap-1 ${isEpsCagrPositive ? "text-emerald-600" : "text-red-600"}`}>
              {isEpsCagrPositive ? "▲" : "▼"} {epsCagrSublabel}
            </small>
          )}
        </div>

        {/* Dividend Yield */}
        <div className="rounded-lg border border-zinc-100 bg-white px-4 py-4 flex flex-col gap-1">
          <small className="uppercase tracking-wider text-[#888888]">Dividend Yield</small>
          <p className="text-2xl font-semibold text-[#0F172B] leading-tight">
            {dividendYieldDisplay}
          </p>
          <small className="text-[11px] text-[#888888]">Annual</small>
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
          governanceSignals={mgmtDashboard?.governanceSignals}
          opportunityTakeaways={oppData?.final_takeaways ?? null}
          dealOverview={dFactorData?.overview ?? null}
        />

        {/* Section B: Fundamental Overview */}
        {data && <FundamentalOverviewCard data={data} />}

        {/* Section B2: Technicals */}
        {technicalsData && <TechnicalsCard data={technicalsData} />}

        {/* Section B3: Market View */}
        <MarketViewCard />

        {/* Section C: Key Metrics Tiles */}
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
