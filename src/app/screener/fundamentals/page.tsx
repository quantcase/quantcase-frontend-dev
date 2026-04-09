"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Zap,
} from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TabularCard } from "@/components/molecules/tabular-card";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { useFinancials } from "@/hooks/useFinancials";
import { useFinancialsCharts } from "@/hooks/useFinancialsCharts";
import { useScreenerPeers } from "@/hooks/useScreenerPeers";
import { useShareholding } from "@/hooks/useShareholding";
import { PeerComparisonDataTable } from "@/components/molecules/peer-comparison-table";
import { MultiLineBarComboChart } from "@/components/molecules/multi-line-bar-combo-chart";
import { FinancialDataTable } from "@/components/fundamentals/financial-data-table";
import { GrowthStatCard } from "@/components/fundamentals/growth-stat-card";
import { ShareholdingTable } from "@/components/fundamentals/shareholding-table";
import { BalanceSheetTreemap } from "@/components/fundamentals/balance-sheet-treemap";
import { CashFlowWaterfall } from "@/components/fundamentals/cash-flow-waterfall";
import { ShareholdingCharts } from "@/components/fundamentals/shareholding-charts";
import { ViewToggle } from "@/components/fundamentals/view-toggle";


const FUNDAMENTALS_NAV = [
  { id: "section-charts",           label: "Charts" },
  { id: "section-swot",             label: "SWOT Analysis" },
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
  const [balanceSheetView, setBalanceSheetView] = useState<"table" | "chart">("table");
  const [cashFlowView, setCashFlowView] = useState<"table" | "chart">("table");
  const [shareholdingView, setShareholdingView] = useState<"table" | "chart">("table");

  const { data, loading, error } = useFinancials(symbol);
  const { data: chartsData } = useFinancialsCharts(symbol);
  const { data: peersData, loading: peersLoading } = useScreenerPeers(symbol);
  const { data: shareholdingData, loading: shareholdingLoading } = useShareholding(symbol);

  if (!symbol) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
        <div className="text-sm text-red-600 px-4 pt-6">Error: No symbol provided in query parameters</div>
      </ScreenerPageShell>
    );
  }

  if (loading) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
        <div className="text-sm px-4 pt-6">Loading...</div>
      </ScreenerPageShell>
    );
  }

  if (error) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
        <div className="text-sm text-red-600 px-4 pt-6">Error: {error}</div>
      </ScreenerPageShell>
    );
  }

  if (!data) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
        <div className="text-sm px-4 pt-6">No financial data found for {symbol}</div>
      </ScreenerPageShell>
    );
  }

  const { standardized } = data;
  const { metrics, quarterly, annual, balanceSheet, cashFlow, cashFlowQuarterly } = standardized;

  return (
    <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
      <div className="mx-auto space-y-6 px-4 pt-6">

        {/* Price / PE / Sales chart */}
        {chartsData && (
          <div id="section-charts">
            <MultiLineBarComboChart
              chartGroups={chartsData.chartGroups}
              height={300}
              title="Charts"
              subtitle="Price, valuation, and sales trends"
            />
          </div>
        )}

        {/* SWOT Analysis */}
        <div id="section-swot" className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
          <div className="px-2 pt-1 pb-3 flex items-center justify-between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
                SWOT Analysis
              </div>
              <div style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>Strategic assessment across four dimensions</div>
            </div>
          </div>
          <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4">
            <div className="grid grid-cols-4 divide-x divide-[#E2E2E2]">

              {/* Strengths */}
              <div className="pr-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
                    <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Strengths</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "#1 thermal producer, ~17 GW capacity",
                    "EBITDA margins >35%",
                    "Long-term PPAs, 5–25 yr revenue lock-in",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2" style={{ fontSize: 13, color: "#888888" }}>
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="px-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
                    <AlertTriangle className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Weaknesses</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Net D/E >2x, high interest burden",
                    "DISCOM receivables delay cash flows",
                    "Fuel cost pass-through lag hurts margins",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2" style={{ fontSize: 13, color: "#888888" }}>
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="px-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
                    <Lightbulb className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Opportunities</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "India peak-power deficit drives baseload demand",
                    "6+ GW pipeline to monetise post-reform",
                    "Green-bond access as renewables expand",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2" style={{ fontSize: 13, color: "#888888" }}>
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="pl-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
                    <Zap className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Threats</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Renewables may structurally reprice thermal",
                    "Hindenburg report dampens institutional appetite",
                    "CERC tariff revisions risk merchant margins",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2" style={{ fontSize: 13, color: "#888888" }}>
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* P&L Table */}
        <div id="section-pnl">
          <TabularCard
            title="Profit & Loss"
            subtitle="All values in INR Crores"
            tabs={["Quarterly", "Annual"]}
          >
            {(activeTab) => (
              <FinancialDataTable table={activeTab === "Quarterly" ? quarterly : annual} />
            )}
          </TabularCard>
        </div>

        {/* Balance Sheet */}
        <div id="section-balance-sheet">
          <TabularCard
            title="Balance Sheet"
            subtitle="All values in INR Crores"
            tabs={balanceSheetView === "table" && balanceSheet.quarterly ? ["Quarterly", "Annual"] : undefined}
            defaultTab="Annual"
            headerAction={<ViewToggle view={balanceSheetView} onChange={setBalanceSheetView} />}
          >
            {(activeTab) =>
              balanceSheetView === "chart" ? (
                <BalanceSheetTreemap table={balanceSheet.annual} />
              ) : (
                <FinancialDataTable
                  table={activeTab === "Quarterly" && balanceSheet.quarterly ? balanceSheet.quarterly : balanceSheet.annual}
                />
              )
            }
          </TabularCard>
        </div>

        {/* Cash Flow */}
        <div id="section-cash-flow">
          <TabularCard
            title="Cash Flow"
            subtitle="All values in INR Crores"
            tabs={cashFlowView === "table" && cashFlowQuarterly ? ["Quarterly", "Annual"] : undefined}
            defaultTab="Annual"
            headerAction={<ViewToggle view={cashFlowView} onChange={setCashFlowView} />}
          >
            {(activeTab) =>
              cashFlowView === "chart" ? (
                <CashFlowWaterfall table={cashFlow} />
              ) : (
                <FinancialDataTable
                  table={activeTab === "Quarterly" && cashFlowQuarterly ? cashFlowQuarterly : cashFlow}
                  cashFlowMode
                />
              )
            }
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
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-zinc-600 animate-spin" />
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
              tabs={shareholdingView === "table" ? ["Quarterly", "Annual"] : undefined}
              headerAction={<ViewToggle view={shareholdingView} onChange={setShareholdingView} />}
            >
              {(activeTab) =>
                shareholdingLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-zinc-600 animate-spin" />
                  </div>
                ) : shareholdingView === "chart" ? (
                  <ShareholdingCharts sections={shareholdingData!.sections} quarters={shareholdingData!.quarters} />
                ) : (
                  <ShareholdingTable sections={shareholdingData!.sections} quarters={shareholdingData!.quarters} mode={activeTab} />
                )
              }
            </TabularCard>
          </div>
        )}

        {/* Growth & Returns */}
        <div id="section-growth-returns">
          <SectionPanel
            title="Growth & Returns"
            subtitle="Compounded growth rates and return metrics"
          >
            <div className="grid grid-cols-4 gap-4 pb-2">
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
                rows={[
                  { label: "10 Years:", value: metrics.profitGrowth["10y"] },
                  { label: "5 Years:", value: metrics.profitGrowth["5y"] },
                  { label: "3 Years:", value: metrics.profitGrowth["3y"] },
                  { label: "TTM:", value: metrics.profitGrowth.ttm },
                ]}
              />
              <GrowthStatCard
                title="Stock Price CAGR"
                rows={[
                  { label: "10 Years:", value: metrics.stockPriceCagr["10y"] },
                  { label: "5 Years:", value: metrics.stockPriceCagr["5y"] },
                  { label: "3 Years:", value: metrics.stockPriceCagr["3y"] },
                  { label: "1 Year:", value: metrics.stockPriceCagr["1y"] },
                ]}
              />
              <GrowthStatCard
                title="Return on Equity"
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
    </ScreenerPageShell>
  );
}

export default function FinancialsPage() {
  return (
    <Suspense fallback={null}>
      <FinancialsContent />
    </Suspense>
  );
}
