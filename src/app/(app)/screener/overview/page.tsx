"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { AssetActionBar } from "@/components/molecules/asset-action-bar";
import { IMScoreCard } from "@/components/overview/im-score-card";
import { FundamentalOverviewCard } from "@/components/overview/fundamental-overview-card";
import { TechnicalsCard, PriceLevelsSection } from "@/components/overview/technicals-card";
import { InvestmentConclusionCard } from "@/components/overview/investment-conclusion-card";
import { DecisionIntelligencePanel } from "@/components/overview/decision-intelligence-panel";
import { useScreenerData } from "@/hooks/useScreenerData";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useTechnicals } from "@/hooks/useTechnicals";
import { KeyRatioTiles } from "@/components/overview/key-ratio-tiles";
import { CompanyProfileCard } from "@/components/overview/company-profile-card";
import { useOverviewFetch } from "@/hooks/useOverviewAnalysis";
import {
  KeyRatioTilesSkeleton,
  IMScoreCardSkeleton,
  TechnicalsCardSkeleton,
  DecisionIntelligenceSkeleton,
  CompanyProfileSkeleton,
} from "@/components/overview/skeletons";

// Sub-section labels deliberately DON'T repeat the top-bar page labels
// ("Technicals" / "Fundamentals" are dedicated pages). These are on-page
// summaries, so they read as "Technical Snapshot" / "Financial Snapshot"
// to remove the double-navigation ambiguity (audit /overview).
const OVERVIEW_NAV = [
  { id: "section-about",                  label: "About" },
  { id: "section-qc-insight",             label: "QC Insight" },
  { id: "section-technicals",             label: "Technical Snapshot" },
  { id: "section-fundamentals",           label: "Financial Snapshot" },
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

  const { data, error, loading: screenerLoading } = useScreenerData(symbol);

  const ticker = symbol === "—" ? "" : symbol;
  const { getInsight, loading: analysisLoading } = useAnalysis(ticker);
  const managementInsight = getInsight("management");
  const opportunityInsight = getInsight("opportunity");
  const dealInsight = getInsight("deal");
  const { data: technicalsData, loading: technicalsLoading } = useTechnicals(symbol === "—" ? "" : symbol);

  // Overview analysis
  const { data: overviewData } = useOverviewFetch(ticker);

  const mScore = managementInsight?.score ?? null;
  const oScore = opportunityInsight?.score ?? null;
  const dScore = dealInsight?.score ?? null;

  let partialSum = 0, partialCount = 0;
  if (mScore !== null) { partialSum += mScore; partialCount++; }
  if (oScore !== null) { partialSum += oScore; partialCount++; }
  if (dScore !== null) { partialSum += dScore; partialCount++; }
  const rating = partialCount > 0 ? getRating((partialSum / partialCount) / 100) : null;

  const companyInfo = data?.company
    ? { name: data.company.name, exchange: data.company.exchange, sector: data.company.sector, industry: data.company.industry }
    : null;

  return (
    <>
    <ScreenerPageShell
      navItems={OVERVIEW_NAV}
      headerRight={undefined}
      companyInfo={companyInfo}
    >
      <div className="pb-8 pt-6">

        {error && (
          <div className="mx-4 mt-4 rounded border border-down/25 bg-down-soft px-4 py-2 text-sm text-down">
            Failed to load data: {error}
          </div>
        )}

        {/* Metric tiles — full width across top */}
        <div className="mb-5">
          {screenerLoading ? <KeyRatioTilesSkeleton /> : data ? <KeyRatioTiles data={data} /> : null}
        </div>

        {/* 2-column layout: 70% left, 30% right — stacks to 1 column on mobile */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_420px]"
          style={{
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
              {screenerLoading ? (
                <CompanyProfileSkeleton />
              ) : data ? (
                <CompanyProfileCard data={data} overviewData={overviewData} />
              ) : null}
            </div>

            {/* QC Insight */}
            <div id="section-qc-insight">
              {analysisLoading ? (
                <IMScoreCardSkeleton />
              ) : (
                <IMScoreCard
                  management={managementInsight ?? null}
                  opportunity={opportunityInsight ?? null}
                  deal={dealInsight ?? null}
                  overviewData={overviewData}
                />
              )}
            </div>

{/* Technicals */}
            <div id="section-technicals">
              {technicalsLoading ? (
                <TechnicalsCardSkeleton />
              ) : technicalsData ? (
                <TechnicalsCard data={technicalsData} overviewSummary={overviewData?.technical_summary ?? null} />
              ) : null}
            </div>

          </div>

          {/* ── Right column: Decision Intelligence ── */}
          <div className="lg:sticky lg:top-[60px]">
            {screenerLoading && analysisLoading && technicalsLoading ? (
              <DecisionIntelligenceSkeleton />
            ) : (
              <DecisionIntelligencePanel
                management={managementInsight ?? null}
                opportunity={opportunityInsight ?? null}
                deal={dealInsight ?? null}
                technicalsData={technicalsData ?? null}
                screenerData={data ?? null}
                rating={rating}
                overviewData={overviewData}
                symbol={symbol}
              />
            )}
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
    <AssetActionBar ticker={symbol} />
    </>
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
