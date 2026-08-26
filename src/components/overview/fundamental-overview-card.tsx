"use client";

import { useState, useMemo } from "react";
import type { ScreenerData } from "@/types/screener";
import type { OverviewAnalysis } from "@/types/overview";
import { SectionShell, SectionLabel } from "./primitives";
import { ValuationHeroSection } from "./fundamentals/valuation-hero-section";
import { ValuationChartSidebar, type ChartMetricKey } from "./fundamentals/valuation-chart-sidebar";
import { KpiGrid } from "./fundamentals/kpi-grid";
import { ReturnsLeveragePanel } from "./fundamentals/returns-leverage-panel";
import { ShareholdingPanel } from "./fundamentals/shareholding-panel";
import { useShareholding } from "@/hooks/useShareholding";
import { formatINR } from "@/lib/utils";

interface Props {
  data: ScreenerData;
  symbol: string;
  overviewData?: OverviewAnalysis | null;
}

const METRIC_LABELS: Record<ChartMetricKey, string> = {
  revenue: "PAT",
  ebitda: "ROCE",
  netIncome: "ROA",
  eps: "EPS",
  cfo: "CFO to PAT Conversion",
  totalDebt: "Debt",
  totalEquity: "Reserves",
  interestCoverage: "Retained Profits as % of PAT",
  dividendYield: "Dividend Payout Ratio",
  pegRatio: "PEG",
  evToEbitda: "Enterprise Value",
  pbRatio: "P/B (Book value)",
  pe: "P/E",
};

function formatForMetric(key: ChartMetricKey, v: number): string {
  if (key === "eps") return `₹${v.toFixed(2)}`;
  if (key === "pegRatio" || key === "pbRatio" || key === "pe") return `${v.toFixed(1)}x`;
  if (key === "dividendYield" || key === "ebitda" || key === "netIncome" || key === "cfo" || key === "interestCoverage") return `${v.toFixed(2)}%`;
  return formatINR(v);
}

export function FundamentalOverviewCard({ data, symbol, overviewData }: Props) {
  const fp = data.financialPerformance;
  const val = data.valuation;
  const eff = data.efficiency;
  const own = data.ownership;
  const ratios = data.ratios;
  const perShare = data.perShare;

  const [selectedMetric, setSelectedMetric] = useState<ChartMetricKey | null>(null);

  const { data: shareholdingData } = useShareholding(symbol);

  const pe = val.peRatio;
  const industryPE = val.industryPE;

  const verdictLabel =
    val.peValuationLabel === "Discount" || val.peValuationLabel === "Undervalued"
      ? "Undervalued"
      : val.peValuationLabel === "Premium" || val.peValuationLabel === "Overvalued"
      ? "Overvalued"
      : val.peValuationLabel === "Fair"
      ? "Fair Value"
      : val.peValuationLabel ?? "—";

  const benchmarkPct =
    industryPE && pe
      ? Math.min(Math.max((pe / (industryPE * 2)) * 100, 5), 95)
      : 33;

  const roceVal = ratios.roce;
  const roeVal = ratios.roe;
  const deVal = eff.debtToEquity;
  const roceIsGood = roceVal != null && roceVal > 15;
  const deIsGood = deVal != null && deVal < 1;

  const derivedNarrative = (() => {
    const parts: string[] = [];
    if (verdictLabel === "Undervalued") parts.push("Trading at a discount to the sector median.");
    else if (verdictLabel === "Overvalued") parts.push("Trading at a premium to the sector median.");
    else parts.push("Valuation is broadly in line with sector peers.");
    if (roceIsGood) parts.push("Returns on capital are strong.");
    if (deIsGood) parts.push("Balance sheet leverage is modest.");
    return parts.join(" ");
  })();

  // Use overview snapshot first sentence as fundamentals narrative when available
  const narrative = overviewData?.snapshot
    ? overviewData.snapshot.replace(/\*\*/g, "").split(".").slice(0, 2).join(".") + "."
    : derivedNarrative;

  const shareholdingMap = useMemo(() => {
    const map = new Map<string, number | null>();
    if (!shareholdingData) return map;
    for (const s of shareholdingData.sections) {
      map.set(s.id, s.data.reduce<number | null>((acc, d) => (d.value != null ? d.value : acc), null));
      for (const child of s.children) {
        map.set(child.id, child.data.reduce<number | null>((acc, d) => (d.value != null ? d.value : acc), null));
      }
    }
    return map;
  }, [shareholdingData]);

  const promoterPct = shareholdingMap.get("promoters") ?? (own.promoter != null ? own.promoter * 100 : null);
  const fiiPct = shareholdingMap.get("npFiis") ?? (own.fii != null ? own.fii * 100 : own.institutions != null ? own.institutions * 100 : null);
  const diiPct = shareholdingMap.get("npMutualFunds") ?? (own.dii != null ? own.dii * 100 : null);
  const publicPct = shareholdingMap.get("npNonInst") ?? (own.public != null ? own.public * 100 : null);

  const shareholdingSegments = [
    { label: "Promoter", pct: promoterPct, color: "var(--qc-ink)" },
    { label: "FII", pct: fiiPct, color: "var(--qc-ink-2)" },
    { label: "DII", pct: diiPct, color: "var(--qc-ink-3)" },
    { label: "Public", pct: publicPct, color: "var(--qc-hair)" },
  ];

  const trend = fp.quarterlyTrend ?? [];
  const fundamentalsTrend = fp.fundamentalsTrend ?? null;

  return (
    <SectionShell>
      <SectionLabel>Fundamentals</SectionLabel>

      {/* Hero row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]" style={{ gap: 14, marginBottom: 14 }}>
        <ValuationHeroSection
          pe={pe}
          industryPE={industryPE}
          verdictLabel={verdictLabel}
          benchmarkPct={benchmarkPct}
          narrative={narrative}
          footer={
            <KpiGrid
              embedded
              pegRatio={val.pegRatio}
              evToEbitda={val.evToEbitda}
              pbRatio={val.pbRatio}
              dividendYield={perShare.dividendYield}
              dividendYieldTrend={fp.dividendYieldTrend ?? null}
              revenue={fp.revenue}
              revenueGrowth={fp.revenueGrowth}
              ebitda={fp.ebitda}
              ebitdaGrowth={fp.ebitdaGrowth}
              ebitdaLabel={fp.quarterlyTrendMeta?.ebitdaLabel ?? "EBITDA"}
              netProfit={fp.netProfit}
              netProfitGrowth={fp.netProfitGrowth}
              operatingCashflow={fp.operatingCashflow}
              cfoGrowth={fp.cfoGrowth}
              freeCashflow={fp.freeCashflow}
              fcfGrowth={fp.fcfGrowth}
              reserves={fp.reserves}
              reservesGrowth={fp.reservesGrowth}
              totalDebt={eff.totalDebt}
              debtGrowth={eff.debtGrowth}
              interestCoverage={eff.interestCoverage ?? null}
              interestCoverageGrowth={eff.interestCoverageGrowth ?? null}
              showInterestCoverage={fp.quarterlyTrendMeta?.showInterestCoverage ?? !data.company.isBfsi}
              trend={trend}
              fundamentalsTrend={fundamentalsTrend}
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
            />
          }
        />
        <ValuationChartSidebar
          trend={trend}
          dividendYieldTrend={fp.dividendYieldTrend ?? null}
          fundamentalsTrend={fundamentalsTrend}
          selectedMetric={selectedMetric}
          selectedLabel={selectedMetric ? METRIC_LABELS[selectedMetric] : null}
          formatValue={selectedMetric ? (v) => formatForMetric(selectedMetric, v) : () => ""}
        />
      </div>

      <ReturnsLeveragePanel
        roce={roceVal}
        roe={roeVal}
        debtToEquity={deVal}
        roce3yAvg={ratios.roce3yAvg}
        roe3yAvg={ratios.roe3yAvg}
      />

      <ShareholdingPanel segments={shareholdingSegments} />
    </SectionShell>
  );
}
