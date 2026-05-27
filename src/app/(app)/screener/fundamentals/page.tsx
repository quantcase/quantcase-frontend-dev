"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Zap,
} from "lucide-react";
import { TabularCard } from "@/components/molecules/tabular-card";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { AssetActionBar } from "@/components/molecules/asset-action-bar";
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
import { PnLChart } from "@/components/fundamentals/pnl-chart";
import { SectionPanel } from "@/components/molecules/section-panel";
import { FundamentalsIntelligenceBanner } from "@/components/fundamentals/fundamentals-intelligence-banner";



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

import type { FundamentalsSwot } from "@/types/financials";

const SWOT_CONFIG = [
  { key: "strengths"    as const, icon: ShieldCheck,   label: "Strengths",     color: "var(--qc-up)" },
  { key: "weaknesses"   as const, icon: AlertTriangle,  label: "Weaknesses",    color: "var(--qc-down)" },
  { key: "opportunities"as const, icon: Lightbulb,      label: "Opportunities", color: "var(--qc-warn)" },
  { key: "threats"      as const, icon: Zap,            label: "Threats",       color: "var(--qc-ink-2)" },
];

function SwotSection({ swot }: { swot: FundamentalsSwot }) {
  return (
    <div id="section-swot">
      <SectionPanel title="SWOT Analysis" subtitle="Strategic assessment across four dimensions">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            background: "var(--qc-hair)",
            borderRadius: 10,
            overflow: "hidden",
            margin: "-16px",
          }}
        >
          {SWOT_CONFIG.map(({ key, icon: Icon, label, color }) => (
            <div key={key} style={{ background: "var(--qc-card)", padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div
                  style={{
                    padding: 5,
                    borderRadius: 6,
                    border: "1px solid var(--qc-hair)",
                    background: "var(--qc-chip)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={14} style={{ color: "var(--qc-ink-2)" }} />
                </div>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color,
                  }}
                >
                  {label}
                </span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {swot[key].map((item) => (
                  <li key={item.title} style={{ lineHeight: 1.45 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--qc-ink)" }}>{item.title}</span>
                    {" — "}
                    <span style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>{item.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}

function FinancialsContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";
  const [pnlView, setPnlView] = useState<"table" | "chart">("table");
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
        <div style={{ fontSize: 13, color: "var(--qc-down)", padding: "24px 16px" }}>
          Error: No symbol provided in query parameters
        </div>
      </ScreenerPageShell>
    );
  }

  if (loading) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
        <div style={{ fontSize: 13, color: "var(--qc-ink-2)", padding: "24px 16px" }}>Loading…</div>
      </ScreenerPageShell>
    );
  }

  if (error) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
        <div style={{ fontSize: 13, color: "var(--qc-down)", padding: "24px 16px" }}>Error: {error}</div>
      </ScreenerPageShell>
    );
  }

  if (!data) {
    return (
      <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
        <div style={{ fontSize: 13, color: "var(--qc-ink-2)", padding: "24px 16px" }}>
          No financial data found for {symbol}
        </div>
      </ScreenerPageShell>
    );
  }

  const { standardized } = data;
  const { metrics, quarterly, annual, balanceSheet, cashFlow, cashFlowQuarterly } = standardized;

  const fi = data.fundamentalsIntelligence;

  return (
    <>
    <ScreenerPageShell navItems={FUNDAMENTALS_NAV}>
      <div className="px-4 pt-6 pb-8 space-y-6">

        {/* Two-column section: Left (Charts, SWOT, Growth & Returns) + Right (Decision Intelligence) */}
        <div className="grid grid-cols-3 gap-[14px] items-start">

          {/* Left column */}
          <div className="col-span-2 space-y-6">

            {/* Price / PE / Sales chart */}
            {chartsData && (
              <div id="section-charts">
                <MultiLineBarComboChart
                  chartGroups={chartsData.chartGroups}
                  height={300}
                  title="Charts & Trends"
                />
              </div>
            )}

            {/* SWOT Analysis */}
            {fi?.swot && <SwotSection swot={fi.swot} />}

            {/* Growth & Returns */}
            <div id="section-growth-returns">
              <SectionPanel title="Growth & Returns" subtitle="Compounded growth rates and return metrics">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
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
          <div>
            {fi && <FundamentalsIntelligenceBanner fi={fi} />}
          </div>

        </div>

        {/* Full-width sections stacked below */}

        {/* P&L Table */}
        <div id="section-pnl">
          <TabularCard
            title="Profit & Loss"
            subtitle="All values in INR Crores"
            tabs={pnlView === "table" ? ["Quarterly", "Annual"] : undefined}
            defaultTab="Quarterly"
            headerAction={<ViewToggle view={pnlView} onChange={setPnlView} />}
          >
            {(activeTab) =>
              pnlView === "chart" ? (
                <PnLChart table={quarterly} />
              ) : (
                <FinancialDataTable table={activeTab === "Quarterly" ? quarterly : annual} />
              )
            }
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
              tabs={shareholdingView === "table" ? ["Quarterly", "Annual"] : undefined}
              headerAction={<ViewToggle view={shareholdingView} onChange={setShareholdingView} />}
            >
              {(activeTab) =>
                shareholdingLoading ? (
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
                  <ShareholdingTable sections={shareholdingData!.sections} quarters={shareholdingData!.quarters} mode={activeTab} />
                )
              }
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
    <Suspense fallback={null}>
      <FinancialsContent />
    </Suspense>
  );
}
