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

  let seenFirstTotal = false;
  for (const row of table.rows) {
    const labelLower = row.label.toLowerCase();
    const isTotal = labelLower.includes("total");
    if (isTotal) { seenFirstTotal = true; continue; }
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

  const baseOptions = (color: string): ApexCharts.ApexOptions => ({
    legend: { show: false },
    chart: {
      type: "treemap",
      toolbar: { show: false },
      animations: { enabled: false },
      background: "transparent",
    },
    colors: [color],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "500",
        fontFamily: "'IBM Plex Mono', monospace",
        colors: ["#FBFAF7"], // --qc-surface-white resolved (text on dark treemap fills)
      },
      formatter: (text: string, op?: ApexCharts.ApexFormatterOpts) =>
        op?.value !== undefined ? [`${text}`, fmtCr(op.value as number)] : text,
    },
    tooltip: {
      theme: "light",
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
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: "var(--qc-text-muted)",
          textAlign: "right",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Period: {period}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              color: "var(--qc-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Assets{" "}
            {assetTotal > 0 && (
              <span style={{ fontWeight: 400, textTransform: "none", color: "var(--qc-text-body)" }}>
                · {fmtCr(assetTotal)}
              </span>
            )}
          </div>
          <ApexChart type="treemap" series={[{ name: "Assets", data: assets }]} options={baseOptions("#1F7A4A" /* --qc-up */)} height={380} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              color: "var(--qc-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Liabilities{" "}
            {liabilityTotal > 0 && (
              <span style={{ fontWeight: 400, textTransform: "none", color: "var(--qc-text-body)" }}>
                · {fmtCr(liabilityTotal)}
              </span>
            )}
          </div>
          <ApexChart type="treemap" series={[{ name: "Liabilities", data: liabilities }]} options={baseOptions("#B23A2F" /* --qc-down */)} height={380} />
        </div>
      </div>
    </div>
  );
}
