"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TabularCard } from "@/components/molecules/tabular-card";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { AssetActionBar } from "@/components/molecules/asset-action-bar";
import { useFinancials } from "@/hooks/useFinancials";
import { useFinancialsCharts } from "@/hooks/useFinancialsCharts";
import { useScreenerPeers } from "@/hooks/useScreenerPeers";
import { useShareholding } from "@/hooks/useShareholding";
import { useScreenerData } from "@/hooks/useScreenerData";
import { PeerComparisonDataTable } from "@/components/molecules/peer-comparison-table";
import { MultiLineBarComboChart } from "@/components/molecules/multi-line-bar-combo-chart";
import { FinancialDataTable } from "@/components/fundamentals/financial-data-table";
import { GrowthStatCard } from "@/components/fundamentals/growth-stat-card";
import { ShareholdingTable } from "@/components/fundamentals/shareholding-table";
import { BalanceSheetTreemap } from "@/components/fundamentals/balance-sheet-treemap";
import { CashFlowWaterfall } from "@/components/fundamentals/cash-flow-waterfall";
import { ShareholdingCharts } from "@/components/fundamentals/shareholding-charts";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { ViewToggle } from "@/components/fundamentals/view-toggle";
import { PnLChart } from "@/components/fundamentals/pnl-chart";
import { SectionPanel } from "@/components/molecules/section-panel";
import { FundamentalsIntelligenceBanner } from "@/components/fundamentals/fundamentals-intelligence-banner";

// ─── Inline skeleton components ───────────────────────────────────────────────

function Shimmer({ style, rounded = 8 }: { style?: React.CSSProperties; rounded?: number }) {
  return <div className="skeleton-shimmer" style={{ borderRadius: rounded, ...style }} />;
}

function FundamentalsPageSkeleton() {
  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      {/* Full-width charts card */}
      <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <Shimmer style={{ height: 10, width: "25%" }} rounded={4} />
        <Shimmer style={{ height: 280 }} rounded={10} />
      </div>
      {/* Two-col: Growth & Returns + DI panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-[14px] items-start">
        {/* Growth & Returns */}
        <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Shimmer style={{ height: 10, width: "28%" }} rounded={4} />
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Shimmer style={{ height: 13 }} rounded={4} />
                {Array.from({ length: 4 }).map((_, j) => <Shimmer key={j} style={{ height: 13 }} rounded={4} />)}
              </div>
            ))}
          </div>
        </div>
        {/* DI panel */}
        <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Shimmer style={{ height: 10, width: "40%" }} rounded={4} />
          {Array.from({ length: 3 }).map((_, i) => <Shimmer key={i} style={{ height: 40 }} rounded={8} />)}
        </div>
      </div>
      {/* P&L table */}
      <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <Shimmer style={{ height: 10, width: "20%" }} rounded={4} />
        {Array.from({ length: 6 }).map((_, i) => <Shimmer key={i} style={{ height: 36 }} rounded={6} />)}
      </div>
      {/* Balance sheet */}
      <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 14, background: "var(--qc-card)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <Shimmer style={{ height: 10, width: "22%" }} rounded={4} />
        {Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} style={{ height: 36 }} rounded={6} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const FUNDAMENTALS_NAV = [
  { id: "section-charts",           label: "Charts" },
  { id: "section-pnl",              label: "Profit & Loss" },
  { id: "section-balance-sheet",    label: "Balance Sheet" },
  { id: "section-cash-flow",        label: "Cash Flow" },
  { id: "section-peer-comparison",  label: "Peer Comparison" },
  { id: "section-shareholding",     label: "Shareholding Pattern" },
  { id: "section-growth-returns",   label: "Growth & Returns" },
];

function FinancialsContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";
  const [pnlReportType, setPnlReportType] = useState<"C" | "S">("C");
  const [balanceSheetReportType, setBalanceSheetReportType] = useState<"C" | "S">("C");
  const [cashFlowReportType, setCashFlowReportType] = useState<"C" | "S">("C");
  
  const [pnlView, setPnlView] = useState<"table" | "chart">("table");
  const [balanceSheetView, setBalanceSheetView] = useState<"table" | "chart">("table");
  const [cashFlowView, setCashFlowView] = useState<"table" | "chart">("table");
  const [shareholdingView, setShareholdingView] = useState<"table" | "chart">("table");

  const { data, loading, error } = useFinancials(symbol);
  const { data: chartsData } = useFinancialsCharts(symbol);
  const { data: peersData, loading: peersLoading } = useScreenerPeers(symbol);
  const { data: shareholdingData, loading: shareholdingLoading } = useShareholding(symbol);
  const { data: screenerData } = useScreenerData(symbol);
  const companyInfo = screenerData?.company
    ? { name: screenerData.company.name, exchange: screenerData.company.exchange, sector: screenerData.company.sector, industry: screenerData.company.industry }
    : null;

  // Show P/E only on the "PE Ratio" chart — drop the Earnings Yield bar series.
  const chartGroups = useMemo(
    () =>
      chartsData?.chartGroups
        .filter((g) => g.group !== "Sales & Margin" && g.group !== "EV/EBITDA" && g.group !== "Market Cap / Sales").map((g) =>
        g.group === "PE Ratio"
          ? { ...g, barSeries: g.barSeries.filter((s) => s.dataKey !== "EARNINGS_YIELD_DAILY") }
          : g
      ) ?? null,
    [chartsData]
  );

  if (!symbol) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV} companyInfo={companyInfo}>
        <div style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-down)", padding: "24px 16px" }}>
          Error: No symbol provided in query parameters
        </div>
      </ScreenerPageShell>
    );
  }

  if (error) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV} companyInfo={companyInfo}>
        <div style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-down)", padding: "24px 16px" }}>Error: {error}</div>
      </ScreenerPageShell>
    );
  }

  if (loading || !data) {
    return (
      <>
        <ScreenerPageShell navItems={FUNDAMENTALS_NAV} companyInfo={companyInfo}>
          <FundamentalsPageSkeleton />
        </ScreenerPageShell>
        <AssetActionBar ticker={symbol} />
      </>
    );
  }

  const { standardized } = data;
  const { metrics, quarterly, annual, balanceSheet, cashFlow } = standardized;

  const fi = data.fundamentalsIntelligence;

  return (
    <>
    <ScreenerPageShell navItems={FUNDAMENTALS_NAV} companyInfo={companyInfo}>
      <div className="px-4 pt-6 pb-8 space-y-6">

        {/* Full-width charts */}
        {chartGroups && (
          <div id="section-charts">
            <MultiLineBarComboChart
              chartGroups={chartGroups}
              height={300}
              title="Charts & Trends"
            />
          </div>
        )}

        {/* Two-column section: Left (Growth & Returns) + Right (Decision Intelligence).
            Both columns stretch to the taller of the two so the cards end level. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-[14px] items-stretch">

          {/* Left column */}
          <div className="min-w-0 flex">

            {/* Growth & Returns */}
            <div id="section-growth-returns" className="flex-1">
              <SectionPanel className="h-full" title="Growth & Returns" subtitle="Compounded growth rates and return metrics">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <GrowthStatCard
                    title="Compounded Sales Growth"
                    rows={[
                      { label: "10 Years:", value: metrics.salesGrowth["10y"] },
                      { label: "5 Years:", value: metrics.salesGrowth["5y"] },
                      { label: "3 Years:", value: metrics.salesGrowth["3y"] },
                      { label: "TTM:", value: metrics.salesGrowth.ttm },
                    ]}
                  />
                  <GrowthStatCard
                    title="Compounded Profit Growth"
                    divider
                    rows={[
                      { label: "10 Years:", value: metrics.profitGrowth["10y"] },
                      { label: "5 Years:", value: metrics.profitGrowth["5y"] },
                      { label: "3 Years:", value: metrics.profitGrowth["3y"] },
                      { label: "TTM:", value: metrics.profitGrowth.ttm },
                    ]}
                  />
                  <GrowthStatCard
                    title="Stock Price CAGR"
                    divider
                    rows={[
                      { label: "10 Years:", value: metrics.stockPriceCagr["10y"] },
                      { label: "5 Years:", value: metrics.stockPriceCagr["5y"] },
                      { label: "3 Years:", value: metrics.stockPriceCagr["3y"] },
                      { label: "1 Year:", value: metrics.stockPriceCagr["1y"] },
                    ]}
                  />
                  <GrowthStatCard
                    title="Return on Equity"
                    divider
                    rows={[
                      { label: "10 Years:", value: metrics.roe["10y"] },
                      { label: "5 Years:", value: metrics.roe["5y"] },
                      { label: "3 Years:", value: metrics.roe["3y"] },
                      { label: "Last Year:", value: metrics.roe.last },
                    ]}
                  />
                </div>
              </SectionPanel>
            </div>

          </div>

          {/* Right column: Decision Intelligence (no sticky) */}
          <div className="min-w-0 flex">
            {fi && <FundamentalsIntelligenceBanner fi={fi} className="flex-1" />}
          </div>

        </div>

        {/* Full-width sections stacked below */}

        {/* P&L Table */}
        <div id="section-pnl">
          <TabularCard
            title="Profit & Loss"
            subtitle="All values in INR Crores"
            tabs={["Quarterly", "Annual"]}
            defaultTab="Annual"
            headerAction={
              <div className="flex items-center gap-3">
                <TabToggle
                  options={["Consolidated", "Standalone"]}
                  value={pnlReportType === "C" ? "Consolidated" : "Standalone"}
                  onChange={(val) => setPnlReportType(val === "Consolidated" ? "C" : "S")}
                  variant="outline"
                />
                <ViewToggle view={pnlView} onChange={setPnlView} />
              </div>
            }
          >
            {(activeTab) =>
              pnlView === "chart" ? (
                <PnLChart table={activeTab === "Quarterly" ? quarterly[pnlReportType] : annual[pnlReportType]} />
              ) : (
                <FinancialDataTable table={activeTab === "Quarterly" ? quarterly[pnlReportType] : annual[pnlReportType]} />
              )
            }
          </TabularCard>
        </div>

        {/* Balance Sheet */}
        <div id="section-balance-sheet">
          <TabularCard
            title="Balance Sheet"
            subtitle="All values in INR Crores"
            headerAction={
              <div className="flex items-center gap-3">
                <TabToggle
                  options={["Consolidated", "Standalone"]}
                  value={balanceSheetReportType === "C" ? "Consolidated" : "Standalone"}
                  onChange={(val) => setBalanceSheetReportType(val === "Consolidated" ? "C" : "S")}
                  variant="outline"
                />
                <ViewToggle view={balanceSheetView} onChange={setBalanceSheetView} />
              </div>
            }
          >
            {balanceSheetView === "chart" ? (
              <BalanceSheetTreemap table={balanceSheet.annual[balanceSheetReportType]} />
            ) : (
              <FinancialDataTable table={balanceSheet.annual[balanceSheetReportType]} />
            )}
          </TabularCard>
        </div>

        {/* Cash Flow */}
        <div id="section-cash-flow">
          <TabularCard
            title="Cash Flow"
            subtitle="All values in INR Crores"
            headerAction={
              <div className="flex items-center gap-3">
                <TabToggle
                  options={["Consolidated", "Standalone"]}
                  value={cashFlowReportType === "C" ? "Consolidated" : "Standalone"}
                  onChange={(val) => setCashFlowReportType(val === "Consolidated" ? "C" : "S")}
                  variant="outline"
                />
                <ViewToggle view={cashFlowView} onChange={setCashFlowView} />
              </div>
            }
          >
            {cashFlowView === "chart" ? (
              <CashFlowWaterfall table={cashFlow[cashFlowReportType]} />
            ) : (
              <FinancialDataTable table={cashFlow[cashFlowReportType]} cashFlowMode />
            )}
          </TabularCard>
        </div>

        {/* Peer Comparison */}
        {(peersLoading || (peersData && peersData.peers.length > 0)) && (
          <div id="section-peer-comparison">
            <TabularCard
              title="Peer Comparison"
              subtitle={peersData ? `${peersData.basicIndustry} · ${peersData.latestQuarter} · ${peersData.count} companies` : undefined}
            >
              {peersLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid var(--qc-hair)",
                      borderTopColor: "var(--qc-ink)",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                </div>
              ) : (
                <PeerComparisonDataTable peers={peersData!.peers} />
              )}
            </TabularCard>
          </div>
        )}

        {/* Shareholding Pattern */}
        {(shareholdingLoading || shareholdingData) && (
          <div id="section-shareholding">
            <TabularCard
              title="Shareholding Pattern"
              subtitle="Numbers in percentages"
              headerAction={<ViewToggle view={shareholdingView} onChange={setShareholdingView} />}
            >
              {shareholdingLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid var(--qc-hair)",
                      borderTopColor: "var(--qc-ink)",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                </div>
              ) : shareholdingView === "chart" ? (
                <ShareholdingCharts sections={shareholdingData!.sections} quarters={shareholdingData!.quarters} />
              ) : (
                <ShareholdingTable sections={shareholdingData!.sections} quarters={shareholdingData!.quarters} />
              )}
            </TabularCard>
          </div>
        )}

      </div>
    </ScreenerPageShell>
    <AssetActionBar ticker={symbol} />
    </>
  );
}

export default function FinancialsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ background: "var(--qc-bg)" }}>
        <div className="px-4 pt-6 pb-8">
          <FundamentalsPageSkeleton />
        </div>
      </div>
    }>
      <FinancialsContent />
    </Suspense>
  );
}
