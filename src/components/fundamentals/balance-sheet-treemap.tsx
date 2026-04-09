import ApexChart from "@/components/molecules/apex-chart";
import type { FinancialTable } from "@/types/financials";

function fmtCr(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
}

export function BalanceSheetTreemap({ table }: { table: FinancialTable }) {
  const lastIdx = table.periods.length - 1;
  const period = table.periods[lastIdx];

  const assets: { x: string; y: number }[] = [];
  const liabilities: { x: string; y: number }[] = [];

  // Balance sheets list liabilities first, then assets (separated by a "Total Liabilities" row).
  let seenFirstTotal = false;
  for (const row of table.rows) {
    const labelLower = row.label.toLowerCase();
    const isTotal = labelLower.includes("total");
    if (isTotal) {
      seenFirstTotal = true;
      continue;
    }
    const val = row.values[lastIdx];
    if (val === null || val === undefined || val <= 0) continue;
    if (!seenFirstTotal) {
      liabilities.push({ x: row.label, y: val });
    } else {
      assets.push({ x: row.label, y: val });
    }
  }

  const assetTotal = assets.reduce((s, r) => s + r.y, 0);
  const liabilityTotal = liabilities.reduce((s, r) => s + r.y, 0);

  const assetSeries = [{ name: "Assets", data: assets }];
  const liabilitySeries = [{ name: "Liabilities", data: liabilities }];

  const baseOptions = (color: string): ApexCharts.ApexOptions => ({
    legend: { show: false },
    chart: {
      type: "treemap",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors: [color],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "600",
        fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
        colors: ["#ffffff"],
      },
      formatter: (text: string, op?: ApexCharts.ApexFormatterOpts) =>
        op?.value !== undefined ? [`${text}`, fmtCr(op.value as number)] : text,
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (val: number) => fmtCr(val) },
    },
    plotOptions: {
      treemap: {
        distributed: false,
        enableShades: true,
        useFillColorAsStroke: false,
      },
    },
  });

  return (
    <div>
      <div style={{ fontSize: 11, color: "#888888", textAlign: "right", marginBottom: 4 }}>
        Period: {period}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#888888",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Assets{" "}
            {assetTotal > 0 && (
              <span style={{ fontWeight: 400, textTransform: "none" }}>· {fmtCr(assetTotal)}</span>
            )}
          </div>
          <ApexChart type="treemap" series={assetSeries} options={baseOptions("#4ade80")} height={380} />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#888888",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Liabilities{" "}
            {liabilityTotal > 0 && (
              <span style={{ fontWeight: 400, textTransform: "none" }}>· {fmtCr(liabilityTotal)}</span>
            )}
          </div>
          <ApexChart
            type="treemap"
            series={liabilitySeries}
            options={baseOptions("#f87171")}
            height={380}
          />
        </div>
      </div>
    </div>
  );
}
