"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  Percent,
  Building2,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionPanel } from "@/components/molecules/section-panel";
import { MetricTile } from "@/components/molecules/metric-tile";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { useFinancials } from "@/hooks/useFinancials";
import type { FinancialRow, FinancialTable } from "@/types/financials";

function fmt(value: number | null | undefined, format?: string): string {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${value}%`;
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function fmtCr(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
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
  const [plTab, setPlTab] = useState("Quarterly");

  const { data, loading, error } = useFinancials(symbol);

  if (!symbol) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-red-600">Error: No symbol provided in query parameters</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">No financial data found for {symbol}</div>
      </div>
    );
  }

  const { standardized } = data;
  const { ttm, valuation, metrics, quarterly, annual, balanceSheet, cashFlow } = standardized;

  const plTable = plTab === "Quarterly" ? quarterly : annual;

  return (
    <div className="min-h-screen bg-white pt-8 mb-8 px-4">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-xs font-semibold text-white">
        CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
      </div>

      {/* Company Header */}
      <div className="flex items-start justify-between gap-4 mb-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="space-y-1.5">
            <h2>{symbol}</h2>
            <div className="flex items-center gap-2">
              <Badge>{data.exchange}: {symbol}</Badge>
              <p>{data.currency}</p>
              <p className="text-zinc-400">{data.unit.replace("_", " ")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {valuation.peRatio && (
            <Badge className="shrink-0">P/E {valuation.peRatio}</Badge>
          )}
          {valuation.marketCap && (
            <Badge className="shrink-0">Mkt Cap ₹{valuation.marketCap.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr</Badge>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="container mx-auto max-w-7xl space-y-6">

        {/* Row 1 — TTM Snapshot + Valuation */}
        <div className="grid grid-cols-2 gap-6 items-stretch">

          {/* TTM Snapshot */}
          <SectionPanel
            title="TTM Snapshot"
            subtitle="Trailing twelve-month financial summary"
          >
            <div className="grid grid-cols-2 gap-4 pb-4">
              <MetricTile
                icon={TrendingUp}
                label="Revenue"
                value={fmtCr(ttm.revenue)}
                sublabel="TTM Sales"
              />
              <MetricTile
                icon={BarChart2}
                label="EBITDA"
                value={fmtCr(ttm.ebitda)}
                sublabel="TTM EBITDA"
              />
              <MetricTile
                icon={DollarSign}
                label="Net Profit"
                value={ttm.netProfit !== null ? fmtCr(ttm.netProfit) : "—"}
                sublabel="TTM Net Profit"
              />
              <MetricTile
                icon={Activity}
                label="EPS"
                value={ttm.eps !== null ? `₹${ttm.eps}` : "—"}
                sublabel="Earnings per share"
              />
            </div>
          </SectionPanel>

          {/* Valuation Multiples */}
          <SectionPanel
            title="Valuation Multiples"
            subtitle="Key price and value ratios"
          >
            <div className="grid grid-cols-3 gap-4 pb-4">
              <MetricTile
                icon={Percent}
                label="P/E Ratio"
                value={valuation.peRatio !== null ? `${valuation.peRatio}x` : "—"}
                sublabel="Trailing P/E"
              />
              <MetricTile
                icon={Percent}
                label="Forward P/E"
                value={valuation.forwardPE !== null ? `${valuation.forwardPE}x` : "—"}
                sublabel="Next 12M earnings"
              />
              <MetricTile
                icon={Percent}
                label="P/B Ratio"
                value={valuation.pbRatio !== null ? `${valuation.pbRatio}x` : "—"}
                sublabel="Price / Book"
              />
              <MetricTile
                icon={BarChart2}
                label="EV / EBITDA"
                value={valuation.evToEbitda !== null ? `${valuation.evToEbitda}x` : "—"}
                sublabel="Enterprise value"
              />
              <MetricTile
                icon={BarChart2}
                label="EV / Revenue"
                value={valuation.evToRevenue !== null ? `${valuation.evToRevenue}x` : "—"}
                sublabel="Revenue multiple"
              />
              <MetricTile
                icon={DollarSign}
                label="Dividend Yield"
                value={valuation.dividendYield !== null ? `${valuation.dividendYield}%` : "—"}
                sublabel="Annual yield"
              />
            </div>
          </SectionPanel>
        </div>

        {/* Row 2 — P&L Table (Quarterly / Annual toggle) */}
        <SectionPanel
          title="Profit & Loss"
          subtitle="Income statement across reporting periods"
        >
          <div className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: 12, color: "#888888" }}>
                All values in INR Crores
              </span>
              <TabToggle
                options={["Quarterly", "Annual"]}
                value={plTab}
                onChange={setPlTab}
              />
            </div>
            <FinancialDataTable table={plTable} />
          </div>
        </SectionPanel>

        {/* Row 3 — Balance Sheet + Cash Flow */}
        <div className="grid grid-cols-2 gap-6 items-stretch">

          {/* Balance Sheet */}
          <SectionPanel
            title="Balance Sheet"
            subtitle="Annual assets and liabilities"
          >
            <div className="pb-4">
              <FinancialDataTable table={balanceSheet.annual} />
            </div>
          </SectionPanel>

          {/* Cash Flow */}
          <SectionPanel
            title="Cash Flow"
            subtitle="Annual operating, free, and capex cash flows"
          >
            <div className="pb-4">
              <FinancialDataTable table={cashFlow} cashFlowMode />
            </div>
          </SectionPanel>
        </div>

        {/* Row 4 — Growth & Returns */}
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
  );
}

export default function FinancialsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-sm">Loading...</div>
        </div>
      }
    >
      <FinancialsContent />
    </Suspense>
  );
}
