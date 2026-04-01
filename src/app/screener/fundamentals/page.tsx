"use client";

import { Suspense } from "react";
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
import { PeerComparisonDataTable } from "@/components/molecules/peer-comparison-table";
import { MultiLineBarComboChart } from "@/components/molecules/multi-line-bar-combo-chart";
import type { FinancialRow, FinancialTable } from "@/types/financials";

const FUNDAMENTALS_NAV = [
  { id: "section-charts",         label: "Charts" },
  { id: "section-swot",           label: "SWOT Analysis" },
  { id: "section-pnl",            label: "Profit & Loss" },
  { id: "section-balance-sheet",  label: "Balance Sheet" },
  { id: "section-cash-flow",      label: "Cash Flow" },
  { id: "section-peer-comparison", label: "Peer Comparison" },
  { id: "section-growth-returns", label: "Growth & Returns" },
];

function fmt(value: number | null | undefined, format?: string): string {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${value}%`;
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function growthColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return "text-zinc-400";
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-600";
  return "text-zinc-500";
}

function FinancialDataTable({
  table,
  cashFlowMode = false,
}: {
  table: FinancialTable;
  cashFlowMode?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              className="sticky left-0 bg-white"
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#888888",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "8px 12px 8px 0",
                whiteSpace: "nowrap",
                minWidth: 160,
              }}
            >
              Item
            </th>
            {table.periods.map((period) => (
              <th
                key={period}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#888888",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}
              >
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row: FinancialRow, idx: number) => {
            const isHighlighted = row.highlight;
            return (
              <tr
                key={row.key}
                style={{
                  background: isHighlighted ? "#F5F5F5" : idx % 2 === 0 ? "#ffffff" : "#fafafa",
                  borderTop: isHighlighted ? "1px solid #E2E2E2" : "1px solid transparent",
                }}
              >
                <td
                  className="sticky left-0"
                  style={{
                    fontSize: 13,
                    fontWeight: isHighlighted ? 600 : 400,
                    color: isHighlighted ? "#0F172B" : "#888888",
                    padding: "8px 12px 8px 0",
                    whiteSpace: "nowrap",
                    background: isHighlighted ? "#F5F5F5" : idx % 2 === 0 ? "#ffffff" : "#fafafa",
                  }}
                >
                  {row.label}
                </td>
                {row.values.map((val, vi) => {
                  let cellColor = isHighlighted ? "#0F172B" : "#121212";
                  if (cashFlowMode && val !== null && val !== undefined) {
                    cellColor = val >= 0 ? "#16a34a" : "#dc2626";
                  }
                  return (
                    <td
                      key={vi}
                      style={{
                        fontSize: 13,
                        fontWeight: isHighlighted ? 600 : 400,
                        color: val === null || val === undefined ? "#888888" : cellColor,
                        padding: "8px 12px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmt(val, row.format)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GrowthMetricRow({
  label,
  ttm,
  threeYear,
}: {
  label: string;
  ttm?: number | null;
  threeYear?: number | null;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 px-2"
      style={{ borderBottom: "1px solid #F5F5F5" }}
    >
      <span style={{ fontSize: 13, color: "#888888" }}>{label}</span>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div style={{ fontSize: 10, color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            TTM / Last
          </div>
          <div className={`text-sm font-semibold ${growthColor(ttm)}`}>
            {fmtPct(ttm)}
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontSize: 10, color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            3 Year
          </div>
          <div className={`text-sm font-semibold ${growthColor(threeYear)}`}>
            {fmtPct(threeYear)}
          </div>
        </div>
      </div>
    </div>
  );
}


function FinancialsContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";

  const { data, loading, error } = useFinancials(symbol);
  const { data: chartsData } = useFinancialsCharts(symbol);
  const { data: peersData, loading: peersLoading } = useScreenerPeers(symbol);

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
                <p style={{ fontSize: 13, color: "#888888", lineHeight: 1.6 }}>
                  Market leader with ~17 GW installed capacity and consistent EBITDA margins above 35%, backed by long-term PPAs that provide strong revenue visibility.
                </p>
              </div>

              {/* Weaknesses */}
              <div className="px-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
                    <AlertTriangle className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Weaknesses</span>
                </div>
                <p style={{ fontSize: 13, color: "#888888", lineHeight: 1.6 }}>
                  High leverage (net D/E above 2x) combined with DISCOM receivables risk creates a fragile balance sheet sensitive to payment delays from state utilities.
                </p>
              </div>

              {/* Opportunities */}
              <div className="px-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
                    <Lightbulb className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Opportunities</span>
                </div>
                <p style={{ fontSize: 13, color: "#888888", lineHeight: 1.6 }}>
                  India&apos;s persistent peak power deficit and a 6+ GW capacity pipeline position the company to capture incremental demand while DISCOM reforms reduce payment friction.
                </p>
              </div>

              {/* Threats */}
              <div className="pl-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)]">
                    <Zap className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Threats</span>
                </div>
                <p style={{ fontSize: 13, color: "#888888", lineHeight: 1.6 }}>
                  Accelerating renewables adoption and unresolved governance concerns post-Hindenburg report may compress long-run thermal valuations and limit institutional investor appetite.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Row 2 — P&L Table (Quarterly / Annual toggle) */}
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

        {/* Row 3 — Balance Sheet */}
        <div id="section-balance-sheet">
          <TabularCard
            title="Balance Sheet"
            subtitle="All values in INR Crores"
            tabs={balanceSheet.quarterly ? ["Quarterly", "Annual"] : undefined}
            defaultTab="Annual"
          >
            {(activeTab) => (
              <FinancialDataTable
                table={activeTab === "Quarterly" && balanceSheet.quarterly ? balanceSheet.quarterly : balanceSheet.annual}
              />
            )}
          </TabularCard>
        </div>

        {/* Row 4 — Cash Flow */}
        <div id="section-cash-flow">
          <TabularCard
            title="Cash Flow"
            subtitle="All values in INR Crores"
            tabs={cashFlowQuarterly ? ["Quarterly", "Annual"] : undefined}
            defaultTab="Annual"
          >
            {(activeTab) => (
              <FinancialDataTable
                table={activeTab === "Quarterly" && cashFlowQuarterly ? cashFlowQuarterly : cashFlow}
                cashFlowMode
              />
            )}
          </TabularCard>
        </div>

        {/* Row 5 — Peer Comparison */}
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

        {/* Row 6 — Growth & Returns */}
        <div id="section-growth-returns">
        <SectionPanel
          title="Growth & Returns"
          subtitle="Revenue growth, profitability trends, and return metrics"
        >
          <div className="pb-4">
            <div className="grid grid-cols-2 gap-x-8">
              <GrowthMetricRow
                label="Sales Growth"
                ttm={metrics.salesGrowth.ttm}
                threeYear={metrics.salesGrowth["3y"]}
              />
              <GrowthMetricRow
                label="Profit Growth"
                ttm={metrics.profitGrowth.ttm}
                threeYear={metrics.profitGrowth["3y"]}
              />
              <GrowthMetricRow
                label="Return on Equity (ROE)"
                ttm={metrics.roe.last}
                threeYear={metrics.roe["3y"]}
              />
              <GrowthMetricRow
                label="Stock Price CAGR"
                ttm={metrics.stockPriceCagr["1y"]}
                threeYear={metrics.stockPriceCagr["3y"]}
              />
            </div>
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
