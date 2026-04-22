"use client";

import { MetricBar, SidebarPanelLayout } from "@/components/overview/primitives";

interface ReturnsLeveragePanelProps {
  roce: number | null;
  roe: number | null;
  debtToEquity: number | null;
  roce3yAvg: number | null;
  roe3yAvg: number | null;
}

export function ReturnsLeveragePanel({
  roce, roe, debtToEquity, roce3yAvg, roe3yAvg,
}: ReturnsLeveragePanelProps) {
  const roceIsGood = roce != null && roce > 15;
  const roeIsGood = roe != null && roe > 12;
  const deIsGood = debtToEquity != null && debtToEquity < 1;

  const roceFillPct = roce != null ? Math.min((roce / 50) * 100, 100) : 0;
  const roeFillPct = roe != null ? Math.min((roe / 50) * 100, 100) : 0;
  const deFillPct = debtToEquity != null ? Math.min((debtToEquity / 3) * 100, 100) : 0;

  const heading =
    roceIsGood && roeIsGood
      ? "Strong capital efficiency"
      : deIsGood
      ? "Conservative balance sheet"
      : "Capital metrics in review";

  const description = roceIsGood
    ? "ROCE is comfortably above industry benchmarks, reflecting efficient use of capital."
    : "Return metrics are being tracked against industry peers.";

  return (
    <SidebarPanelLayout
      eyebrow="Returns & Leverage"
      heading={heading}
      description={description}
      style={{ marginBottom: 14 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <MetricBar
          label="ROCE"
          value={roce != null ? `${roce.toFixed(1)}%` : "—"}
          fillPct={roceFillPct}
          fillColor={roceIsGood ? "var(--qc-up)" : "var(--qc-warn)"}
          benchmarkPct={30}
          subLeft="Industry avg"
          subRight={roce3yAvg != null ? `~${roce3yAvg.toFixed(0)}%` : "~15%"}
        />
        <MetricBar
          label="ROE"
          value={roe != null ? `${roe.toFixed(1)}%` : "—"}
          fillPct={roeFillPct}
          fillColor={roeIsGood ? "var(--qc-up)" : "var(--qc-warn)"}
          benchmarkPct={25}
          subLeft="Industry avg"
          subRight={roe3yAvg != null ? `~${roe3yAvg.toFixed(0)}%` : "~12%"}
        />
        <MetricBar
          label="Debt / Equity"
          value={debtToEquity != null ? `${debtToEquity.toFixed(2)}x` : "—"}
          fillPct={deFillPct}
          fillColor={deIsGood ? "var(--qc-warn)" : "var(--qc-down)"}
          benchmarkPct={33}
          subLeft={deIsGood ? "Moderate" : "Elevated"}
          subRight="≤1.0 healthy"
        />
      </div>
    </SidebarPanelLayout>
  );
}
