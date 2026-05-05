"use client";

import type { ScreenerData } from "@/types/screener";
import { SectionShell, SectionLabel, MonoEyebrow, NarrativeSidebar } from "./primitives";
import { ValuationHeroSection } from "./fundamentals/valuation-hero-section";
import { KpiGrid } from "./fundamentals/kpi-grid";
import { ReturnsLeveragePanel } from "./fundamentals/returns-leverage-panel";
import { ShareholdingPanel } from "./fundamentals/shareholding-panel";
import { useShareholding } from "@/hooks/useShareholding";

interface Props {
  data: ScreenerData;
  symbol: string;
}

export function FundamentalOverviewCard({ data, symbol }: Props) {
  const fp = data.financialPerformance;
  const val = data.valuation;
  const eff = data.efficiency;
  const own = data.ownership;
  const ratios = data.ratios;
  const perShare = data.perShare;

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
  const roeIsGood = roeVal != null && roeVal > 12;
  const deIsGood = deVal != null && deVal < 1;

  const narrative = (() => {
    const parts: string[] = [];
    if (verdictLabel === "Undervalued") parts.push("Trading at a discount to the sector median.");
    else if (verdictLabel === "Overvalued") parts.push("Trading at a premium to the sector median.");
    else parts.push("Valuation is broadly in line with sector peers.");
    if (roceIsGood) parts.push("Returns on capital are strong.");
    if (deIsGood) parts.push("Balance sheet leverage is modest.");
    return parts.join(" ");
  })();

  const tags: { label: string; color: string }[] = [];
  if (verdictLabel === "Undervalued") tags.push({ label: "Undervalued", color: "var(--qc-up)" });
  if (verdictLabel === "Overvalued") tags.push({ label: "Overvalued", color: "var(--qc-down)" });
  if (roceIsGood) tags.push({ label: "High ROCE", color: "var(--qc-up)" });
  if (roeIsGood) tags.push({ label: "High ROE", color: "var(--qc-up)" });
  if (!deIsGood && deVal != null) tags.push({ label: "Elevated D/E", color: "var(--qc-warn)" });
  if (deIsGood && deVal != null) tags.push({ label: "Low leverage", color: "var(--qc-ink-2)" });

  const getLatestById = (id: string): number | null => {
    if (!shareholdingData) return null;
    for (const s of shareholdingData.sections) {
      if (s.id === id) return s.data.reduce<number | null>((acc, d) => (d.value != null ? d.value : acc), null);
      const child = s.children.find((c) => c.id === id);
      if (child) return child.data.reduce<number | null>((acc, d) => (d.value != null ? d.value : acc), null);
    }
    return null;
  };

  const promoterPct = getLatestById("promoters") ?? (own.promoter != null ? own.promoter * 100 : null);
  const fiiPct = getLatestById("npFiis") ?? (own.fii != null ? own.fii * 100 : own.institutions != null ? own.institutions * 100 : null);
  const diiPct = getLatestById("npMutualFunds") ?? (own.dii != null ? own.dii * 100 : null);
  const publicPct = getLatestById("npNonInst") ?? (own.public != null ? own.public * 100 : null);

  const shareholdingSegments = [
    { label: "Promoter", pct: promoterPct, color: "var(--qc-ink)" },
    { label: "FII", pct: fiiPct, color: "var(--qc-blue)" },
    { label: "DII", pct: diiPct, color: "var(--qc-up)" },
    { label: "Public", pct: publicPct, color: "var(--qc-ink-2)" },
  ];

  return (
    <SectionShell>
      <SectionLabel>Fundamentals</SectionLabel>

      {/* Hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: 14 }}>
        <ValuationHeroSection
          pe={pe}
          industryPE={industryPE}
          verdictLabel={verdictLabel}
          benchmarkPct={benchmarkPct}
          pegRatio={val.pegRatio}
          evToEbitda={val.evToEbitda}
          pbRatio={val.pbRatio}
          dividendYield={perShare.dividendYield}
          narrative={narrative}
        />
        <NarrativeSidebar
          eyebrow="What the numbers say"
          headline={
            verdictLabel === "Undervalued"
              ? "Cheap on earnings — potential upside if growth holds."
              : verdictLabel === "Overvalued"
              ? "Priced at a premium — execution must justify the multiple."
              : "Fairly valued against sector peers."
          }
          body={
            narrative +
            (roceIsGood || roeIsGood
              ? " Return metrics indicate efficient capital deployment."
              : " Return metrics warrant monitoring.")
          }
          tags={tags}
        />
      </div>

      <MonoEyebrow style={{ margin: "4px 0 10px" }}>Key Metrics · Latest fiscal</MonoEyebrow>

      <KpiGrid
        revenue={fp.revenue}
        revenueGrowth={fp.revenueGrowth}
        ebitda={fp.ebitda}
        ebitdaGrowth={fp.ebitdaGrowth}
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
      />

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
