import ApexChart from "@/components/molecules/apex-chart";
import type { FinancialTable } from "@/types/financials";

const CF_TOTAL_KEYS = ["cfo", "operating", "fcff", "fcfe", "net_cash", "core_cash", "total"];

function isTotalRow(key: string, label: string): boolean {
  const k = key.toLowerCase();
  const l = label.toLowerCase();
  return CF_TOTAL_KEYS.some((t) => k.includes(t) || l.includes(t));
}

export function CashFlowWaterfall({ table }: { table: FinancialTable }) {
  const lastIdx = table.periods.length - 1;
  const period = table.periods[lastIdx];

  const rows = table.rows.filter((r) => {
    const val = r.values[lastIdx];
    return val !== null && val !== undefined;
  });

  const categories: string[] = rows.map((r) => r.label);
  const values: number[] = rows.map((r) => r.values[lastIdx] as number);
  const isTotal: boolean[] = rows.map((r) => isTotalRow(r.key, r.label));

  const spacerData: number[] = [];
  const positiveData: (number | null)[] = [];
  const negativeData: (number | null)[] = [];
  const totalData: (number | null)[] = [];

  let runningTotal = 0;

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (isTotal[i]) {
      spacerData.push(0);
      positiveData.push(null);
      negativeData.push(null);
      totalData.push(Math.abs(v));
      runningTotal = v;
    } else if (v >= 0) {
      spacerData.push(runningTotal);
      positiveData.push(v);
      negativeData.push(null);
      totalData.push(null);
      runningTotal += v;
    } else {
      spacerData.push(runningTotal + v);
      positiveData.push(null);
      negativeData.push(Math.abs(v));
      totalData.push(null);
      runningTotal += v;
    }
  }

  const series = [
    { name: "spacer", data: spacerData },
    { name: "Increase", data: positiveData },
    { name: "Decrease", data: negativeData },
    { name: "Total", data: totalData },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 2,
        dataLabels: { position: "top" },
      },
    },
    colors: ["transparent", "#6bba7f", "#e07070", "#5b9bd5"],
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1, 2, 3],
      formatter: (val: number) => {
        if (val === null || val === undefined) return "";
        return `${Math.round(val).toLocaleString("en-IN")} Cr`;
      },
      style: {
        fontSize: "11px",
        fontWeight: "500",
        fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
        colors: ["#0F172B"],
      },
      offsetY: -4,
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: { fontSize: "11px", colors: "#888888", fontFamily: "var(--font-ibm-plex-sans, sans-serif)" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${Math.round(val).toLocaleString("en-IN")}`,
        style: { fontSize: "11px", colors: ["#888888"], fontFamily: "var(--font-ibm-plex-sans, sans-serif)" },
      },
    },
    grid: {
      borderColor: "#F0F0F0",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "12px",
      fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
      fontWeight: 500,
      markers: { size: 10 },
      onItemClick: { toggleDataSeries: false },
      formatter: (seriesName: string) => (seriesName === "spacer" ? "" : seriesName),
    },
    tooltip: {
      shared: false,
      intersect: true,
      y: {
        formatter: (val: number) => `${Math.round(val).toLocaleString("en-IN")} Cr`,
      },
    },
    states: {
      hover: { filter: { type: "lighten" } },
    },
  };

  return (
    <div>
      <div style={{ fontSize: 11, color: "#888888", textAlign: "right", marginBottom: 4 }}>
        Period: {period}
      </div>
      <ApexChart type="bar" series={series} options={options} height={420} />
    </div>
  );
}
