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
    { name: "spacer",   data: spacerData },
    { name: "Increase", data: positiveData },
    { name: "Decrease", data: negativeData },
    { name: "Total",    data: totalData },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      animations: { enabled: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 3,
        dataLabels: { position: "top" },
      },
    },
    // transparent spacer, --qc-up, --qc-down, --qc-ink (ApexCharts requires hex)
    colors: ["transparent", "#1F7A4A", "#B23A2F", "#5A5A54"],
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1, 2, 3],
      formatter: (val: number) => {
        if (val === null || val === undefined) return "";
        return `${Math.round(val).toLocaleString("en-IN")} Cr`;
      },
      style: {
        fontSize: "10px",
        fontWeight: "500",
        fontFamily: "'IBM Plex Mono', monospace",
        colors: ["var(--qc-ink)"], // --qc-ink
      },
      offsetY: -4,
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: "10px",
          colors: "#9A9A92", // --qc-ink-2
          fontFamily: "'IBM Plex Mono', monospace",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${Math.round(val).toLocaleString("en-IN")}`,
        style: {
          fontSize: "10px",
          colors: ["#9A9A92"], // --qc-ink-2
          fontFamily: "'IBM Plex Mono', monospace",
        },
      },
    },
    grid: {
      borderColor: "#EFEDE7", // --qc-section / --qc-hair-2
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "11px",
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 500,
      markers: { size: 8 },
      onItemClick: { toggleDataSeries: false },
      formatter: (seriesName: string) => (seriesName === "spacer" ? "" : seriesName),
      labels: { colors: "#5A5A54" }, // --qc-ink
    },
    tooltip: {
      shared: false,
      intersect: true,
      theme: "light",
      y: { formatter: (val: number) => `${Math.round(val).toLocaleString("en-IN")} Cr` },
    },
    states: {
      hover: { filter: { type: "lighten" } },
    },
  };

  return (
    <div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: "var(--qc-ink-2)",
          textAlign: "right",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Period: {period}
      </div>
      <ApexChart type="bar" series={series} options={options} height={420} />
    </div>
  );
}
