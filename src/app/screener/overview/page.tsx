"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Calendar, Plug, FileDown, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FinancialPerformanceCard } from "@/components/overview/financial-performance-card";
import { IMScoreCard } from "@/components/overview/im-score-card";
import { ValuationCard } from "@/components/overview/valuation-card";
import { EfficiencyCard } from "@/components/overview/efficiency-card";
import { KeyThesisCard } from "@/components/overview/key-thesis-card";
import { MarketDataCard } from "@/components/overview/market-data-card";
import { AnalystCard } from "@/components/overview/analyst-card";
import { useScreenerData } from "@/hooks/useScreenerData";
import { useTranscriptCalls } from "@/hooks/useTranscriptCalls";
import { useManagementAnalysis } from "@/hooks/useManagementAnalysis";
import { useOpportunityAnalysis } from "@/hooks/useOpportunityAnalysis";
import { useDealAnalysis } from "@/hooks/useDealAnalysis";
import type { ManagementDashboardData } from "@/types/management";
import type { OFactorResponse } from "@/types/opportunity";

function OverviewContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  const { data, loading, error } = useScreenerData(symbol);

  const { data: transcriptCalls } = useTranscriptCalls(symbol === "—" ? "" : symbol);
  const firstCallId = transcriptCalls.length > 0 ? transcriptCalls[0].id : "";

  const { data: managementData } = useManagementAnalysis(firstCallId);
  const { data: opportunityData, totalScore: oppTotalScore } = useOpportunityAnalysis(firstCallId);
  const { totalScore: dealTotalScore } = useDealAnalysis(firstCallId);

  const mgmtDashboard = Object.keys(managementData).length > 0
    ? (managementData as ManagementDashboardData)
    : null;
  const oppData = Object.keys(opportunityData).length > 0
    ? (opportunityData as OFactorResponse)
    : null;

  const formattedDate = data?.quote.lastUpdated
    ? new Date(data.quote.lastUpdated).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 py-2 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 mb-4 rounded">
        ⏱ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
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
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {loading ? "Loading…" : (data?.company.name ?? symbol)}
                  </h1>
                  {data?.quote.marketState && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      data.quote.marketState === "REGULAR"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {data.quote.marketState === "REGULAR" ? "Live" : data.quote.marketState}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                    {data?.company.exchange ?? "NSE"}: {symbol}
                  </span>
                  <span>•</span>
                  <span>{data?.company.industry ?? "—"}</span>
                  {data?.company.sector && data.company.sector !== data.company.industry && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-400">{data.company.sector}</span>
                    </>
                  )}
                </div>
                {data?.quote.price != null && (
                  <div className="flex items-center gap-3 pt-0.5">
                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      ₹{data.quote.price.toFixed(2)}
                    </span>
                    <span className={`flex items-center gap-0.5 text-sm font-semibold ${
                      (data.quote.changePercent ?? 0) >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400"
                    }`}>
                      {(data.quote.changePercent ?? 0) >= 0
                        ? <TrendingUp className="h-3.5 w-3.5" />
                        : <TrendingDown className="h-3.5 w-3.5" />}
                      {data.quote.change >= 0 ? "+" : ""}{data.quote.change.toFixed(2)} ({data.quote.changePercent >= 0 ? "+" : ""}{data.quote.changePercent.toFixed(2)}%)
                    </span>
                    {data.quote.marketCap != null && (
                      <span className="text-xs text-zinc-400">
                        Mkt Cap ₹{(data.quote.marketCap / 1e12).toFixed(2)}L Cr
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="text-zinc-600 gap-1.5">
                <Plug className="h-3.5 w-3.5" />
                AI Plugins
              </Button>
              <Button variant="outline" size="sm" className="text-zinc-600 gap-1.5">
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </Button>
              <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Widget
              </Button>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500 ml-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load data: {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Row 1: Financial Performance (2/3) + IM Score (1/3) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FinancialPerformanceCard
              revenue={data?.financialPerformance.revenue ?? null}
              revenueGrowth={data?.financialPerformance.revenueGrowth ?? null}
              ebitda={data?.financialPerformance.ebitda ?? null}
              ebitdaMargins={data?.financialPerformance.ebitdaMargins ?? null}
              earningsGrowth={data?.financialPerformance.earningsGrowth ?? null}
              quarterlyTrend={data?.financialPerformance.quarterlyTrend ?? null}
            />
          </div>
          <div className="lg:col-span-1">
            <IMScoreCard
              managementScore={mgmtDashboard?.consistency.score ?? null}
              managementMax={mgmtDashboard?.consistency.maxScore ?? null}
              opportunityScore={oppTotalScore?.total_score ?? null}
              opportunityMax={oppTotalScore?.max_score ?? null}
              dealScore={dealTotalScore?.total_score ?? null}
              dealMax={dealTotalScore?.max_score ?? null}
            />
          </div>
        </div>

        {/* Row 2: Valuation + Efficiency + Market Data */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ValuationCard
            peRatio={data?.valuation.peRatio ?? null}
            forwardPE={data?.valuation.forwardPE ?? null}
            pbRatio={data?.valuation.pbRatio ?? null}
            evToEbitda={data?.valuation.evToEbitda ?? null}
          />
          <EfficiencyCard
            ebitda={data?.financialPerformance.ebitda ?? null}
            enterpriseValue={data?.valuation.enterpriseValue ?? null}
            totalCash={data?.efficiency.totalCash ?? null}
            totalDebt={data?.efficiency.totalDebt ?? null}
            grossMargins={data?.financialPerformance.grossMargins ?? null}
            operatingMargins={data?.financialPerformance.operatingMargins ?? null}
            profitMargins={data?.financialPerformance.profitMargins ?? null}
            debtToEquity={data?.efficiency.debtToEquity ?? null}
          />
          <MarketDataCard
            week52High={data?.quote.week52High ?? null}
            week52Low={data?.quote.week52Low ?? null}
            price={data?.quote.price ?? null}
            fiftyDayAverage={data?.keyStats.fiftyDayAverage ?? null}
            twoHundredDayAverage={data?.keyStats.twoHundredDayAverage ?? null}
            volume={data?.quote.volume ?? null}
            avgVolume={data?.quote.avgVolume ?? null}
            eps={data?.perShare.eps ?? null}
            epsForward={data?.perShare.epsForward ?? null}
            dividendYield={data?.perShare.dividendYield ?? null}
          />
        </div>

        {/* Row 3: Analyst Coverage + Key Thesis */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
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
          <KeyThesisCard
            governanceSignals={mgmtDashboard?.governanceSignals}
            opportunityTakeaway={oppData?.final_takeaways?.investment_thesis ?? null}
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
