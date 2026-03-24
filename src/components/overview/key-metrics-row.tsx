"use client";

import { MetricTile } from "@/components/molecules/metric-tile";

interface KeyMetricsRowProps {
  peRatio: number | null;
  forwardPE: number | null;
  ebitda: number | null;
  enterpriseValue: number | null;
  totalCash: number | null;
  totalDebt: number | null;
  operatingCashflow: number | null;
  earningsQuarterlyGrowth: number | null;
  epsCagrFromDeal?: string | null;
}

function fmtPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function KeyMetricsRow({
  peRatio,
  forwardPE,
  ebitda,
  enterpriseValue,
  totalCash,
  totalDebt,
  operatingCashflow,
  earningsQuarterlyGrowth,
  epsCagrFromDeal,
}: KeyMetricsRowProps) {
  // EPS CAGR (3Y): prefer deal analysis string, fallback to quarterly growth rate
  const epsCagrValue = epsCagrFromDeal
    ? epsCagrFromDeal
    : earningsQuarterlyGrowth != null
    ? fmtPct(earningsQuarterlyGrowth)
    : "—";
  const epsCagrLabel = epsCagrFromDeal ? "EPS CAGR (3Y)" : "EPS Growth (QoQ)";

  // P/E Range
  const peRangeValue =
    peRatio != null && forwardPE != null
      ? `${peRatio.toFixed(1)}x — ${forwardPE.toFixed(1)}x`
      : peRatio != null
      ? `${peRatio.toFixed(1)}x`
      : "—";

  // ROCE = EBITDA / EV * 100
  const roceValue =
    ebitda != null && enterpriseValue != null && enterpriseValue > 0
      ? `${((ebitda / enterpriseValue) * 100).toFixed(1)}%`
      : "—";

  // Net Debt / EBITDA
  const netDebtEbitdaValue =
    totalDebt != null && totalCash != null && ebitda != null && ebitda > 0
      ? `${((totalDebt - totalCash) / ebitda).toFixed(1)}x`
      : "—";

  // CFO / EBITDA — show as % (e.g. 39% means OCF covers 39% of EBITDA)
  const cfoEbitdaValue =
    operatingCashflow != null && operatingCashflow !== 0 && ebitda != null && ebitda > 0
      ? `${((operatingCashflow / ebitda) * 100).toFixed(0)}%`
      : "—";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MetricTile label={epsCagrLabel} value={epsCagrValue} />
      <MetricTile label="P/E Range" value={peRangeValue} sublabel="Trailing — Forward" />
      <MetricTile label="ROCE (FY25)" value={roceValue} sublabel="EBITDA / EV" />
      <MetricTile label="CFO / EBITDA" value={cfoEbitdaValue} sublabel="OCF as % of EBITDA" />
      <MetricTile label="Net Debt / EBITDA" value={netDebtEbitdaValue} />
    </div>
  );
}
