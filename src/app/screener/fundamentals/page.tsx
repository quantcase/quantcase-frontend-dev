"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Zap,
  TableIcon,
  BarChart2,
} from "lucide-react";
import ApexChart from "@/components/molecules/apex-chart";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TabularCard } from "@/components/molecules/tabular-card";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { useFinancials } from "@/hooks/useFinancials";
import { useFinancialsCharts } from "@/hooks/useFinancialsCharts";
import { useScreenerPeers } from "@/hooks/useScreenerPeers";
import { useShareholding } from "@/hooks/useShareholding";
import type { ShareholdingSection } from "@/hooks/useShareholding";
import { PeerComparisonDataTable } from "@/components/molecules/peer-comparison-table";
import { MultiLineBarComboChart } from "@/components/molecules/multi-line-bar-combo-chart";
import type { FinancialRow, FinancialTable } from "@/types/financials";


const FUNDAMENTALS_NAV = [
  { id: "section-charts",         label: "Charts" },
  { id: "section-swot",           label: "SWOT Analysis" },
  { id: "section-pnl",            label: "Profit & Loss" },
  { id: "section-balance-sheet",  label: "Balance Sheet" },
  { id: "section-cash-flow",      label: "Cash Flow" },
  { id: "section-peer-comparison",    label: "Peer Comparison" },
  { id: "section-shareholding",       label: "Shareholding Pattern" },
  { id: "section-growth-returns",     label: "Growth & Returns" },
];

function fmt(value: number | null | undefined, format?: string): string {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${parseFloat(value.toFixed(1))}%`;
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${parseFloat(value.toFixed(1))}%`;
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


function ShareholdingTable({ sections, quarters, mode = "Quarterly" }: { sections: ShareholdingSection[]; quarters: string[]; mode?: string }) {
  const filteredIndices = mode === "Annual"
    ? quarters.reduce<number[]>((acc, q, i) => { if (q.startsWith("MAR") || q.startsWith("Mar")) acc.push(i); return acc; }, [])
    : quarters.map((_, i) => i);
  const filteredQuarters = filteredIndices.map((i) => quarters[i]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function fmtPctVal(v: number | null | undefined) {
    if (v === null || v === undefined) return "—";
    return `${parseFloat(v.toFixed(1)).toLocaleString("en-IN")}%`;
  }

  const rows: { key: string; label: string; depth: number; isParent: boolean; isExpandable: boolean; parentId?: string; values: (number | null)[] }[] = [];
  for (const section of sections) {
    rows.push({ key: section.id, label: section.label, depth: 0, isParent: section.isExpandable, isExpandable: section.isExpandable, values: filteredIndices.map((i) => section.data[i]?.value ?? null) });
    if (section.isExpandable && expanded.has(section.id)) {
      for (const child of section.children) {
        rows.push({ key: child.id, label: child.label, depth: 1, isParent: false, isExpandable: false, parentId: section.id, values: filteredIndices.map((i) => child.data[i]?.value ?? null) });
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              className="sticky left-0 bg-white"
              style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px 8px 0", whiteSpace: "nowrap", minWidth: 200 }}
            >
              Category
            </th>
            {filteredQuarters.map((q) => (
              <th
                key={q}
                style={{ fontSize: 10, fontWeight: 500, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px", whiteSpace: "nowrap", textAlign: "right" }}
              >
                {q}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const bg = row.depth === 1 ? "#ffffff" : idx % 2 === 0 ? "#ffffff" : "#fafafa";
            return (
              <tr key={row.key} style={{ background: bg, borderTop: row.depth === 0 && row.isParent ? "1px solid #F0F0F0" : "1px solid transparent" }}>
                <td
                  className="sticky left-0"
                  style={{ background: bg, fontSize: 13, fontWeight: row.depth === 0 ? 600 : 400, color: row.depth === 0 ? "#0F172B" : "#888888", padding: "8px 12px 8px 0", whiteSpace: "nowrap", paddingLeft: row.depth === 1 ? 20 : 0 }}
                >
                  {row.isExpandable ? (
                    <button
                      onClick={() => toggle(row.key)}
                      className="flex items-center gap-1.5 text-left"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: "inherit", fontWeight: "inherit" }}
                    >
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 16, height: 16, borderRadius: 4,
                          border: "1px solid #E2E2E2", background: "#F5F5F5",
                          fontSize: 10, color: "#888888", flexShrink: 0,
                          transition: "transform 0.15s",
                          transform: expanded.has(row.key) ? "rotate(90deg)" : "none",
                        }}
                      >
                        ›
                      </span>
                      {row.label}
                    </button>
                  ) : (
                    row.label
                  )}
                </td>
                {row.values.map((val, vi) => (
                  <td
                    key={vi}
                    style={{ fontSize: 13, fontWeight: row.depth === 0 ? 600 : 400, color: val === null || val === undefined ? "#888888" : row.depth === 0 ? "#0F172B" : "#121212", padding: "8px 12px", textAlign: "right", whiteSpace: "nowrap" }}
                  >
                    {fmtPctVal(val)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Balance Sheet Treemap ──────────────────────────────────────────────────────

const ASSET_KEYS = ["net_block", "fixed_asset", "capital_wip", "cwip", "investments", "inventories", "inventory", "receivables", "debtors", "cash", "short_term_invest", "other_assets", "loans_advances"];
const LIABILITY_KEYS = ["equity", "share_capital", "reserves", "borrowings", "debt", "payables", "creditors", "other_liabilities", "provisions"];

function classifyRow(key: string): "asset" | "liability" | null {
  const k = key.toLowerCase();
  if (ASSET_KEYS.some((ak) => k.includes(ak))) return "asset";
  if (LIABILITY_KEYS.some((lk) => k.includes(lk))) return "liability";
  return null;
}

function fmtCr(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
}

function BalanceSheetTreemap({ table }: { table: FinancialTable }) {
  const lastIdx = table.periods.length - 1;
  const period = table.periods[lastIdx];

  const assets: { x: string; y: number }[] = [];
  const liabilities: { x: string; y: number }[] = [];

  for (const row of table.rows) {
    const val = row.values[lastIdx];
    if (val === null || val === undefined || val <= 0) continue;
    if (row.label.toLowerCase().includes("total")) continue;
    const side = classifyRow(row.key);
    if (side === "asset") assets.push({ x: row.label, y: val });
    else if (side === "liability") liabilities.push({ x: row.label, y: val });
  }

  // Fallback: split rows 50/50 if classification yields nothing
  if (assets.length === 0 && liabilities.length === 0) {
    const mid = Math.ceil(table.rows.length / 2);
    table.rows.forEach((row, i) => {
      const val = row.values[lastIdx];
      if (val === null || val === undefined || val <= 0) return;
      if (row.label.toLowerCase().includes("total")) return;
      if (i < mid) assets.push({ x: row.label, y: val });
      else liabilities.push({ x: row.label, y: val });
    });
  }

  const assetTotal = assets.reduce((s, r) => s + r.y, 0);
  const liabilityTotal = liabilities.reduce((s, r) => s + r.y, 0);

  const series = [
    { name: "Assets", data: assets },
    { name: "Liabilities", data: liabilities },
  ];

  const options: ApexCharts.ApexOptions = {
    legend: { show: false },
    chart: {
      type: "treemap",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors: ["#4ade80", "#f87171"],
    dataLabels: {
      enabled: true,
      style: { fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-ibm-plex-sans, sans-serif)" },
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
        enableShades: false,
        useFillColorAsStroke: false,
      },
    },
  };

  return (
    <div>
      <div className="grid grid-cols-2 mb-3">
        <div style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
          Assets {assetTotal > 0 && <span style={{ fontWeight: 400, textTransform: "none" }}>· {fmtCr(assetTotal)}</span>}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
          Liabilities {liabilityTotal > 0 && <span style={{ fontWeight: 400, textTransform: "none" }}>· {fmtCr(liabilityTotal)}</span>}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#888888", textAlign: "right", marginBottom: 4 }}>
        Period: {period}
      </div>
      <ApexChart type="treemap" series={series} options={options} height={420} />
    </div>
  );
}

// ── Cash Flow Waterfall Chart ─────────────────────────────────────────────────

// Keys that represent totals/subtotals — rendered in blue
const CF_TOTAL_KEYS = ["cfo", "operating", "fcff", "fcfe", "net_cash", "core_cash", "total"];

function isTotalRow(key: string, label: string): boolean {
  const k = key.toLowerCase();
  const l = label.toLowerCase();
  return CF_TOTAL_KEYS.some((t) => k.includes(t) || l.includes(t));
}

function CashFlowWaterfall({ table }: { table: FinancialTable }) {
  // Use the most recent period (last column)
  const lastIdx = table.periods.length - 1;
  const period = table.periods[lastIdx];

  // Build waterfall data points — skip "total" rows that summarise others
  // and skip rows with null values
  const rows = table.rows.filter((r) => {
    const val = r.values[lastIdx];
    return val !== null && val !== undefined;
  });

  const categories: string[] = rows.map((r) => r.label);
  const values: number[] = rows.map((r) => r.values[lastIdx] as number);

  // Classify each bar
  const isTotal: boolean[] = rows.map((r) => isTotalRow(r.key, r.label));

  // Build waterfall stacks:
  // - spacer: invisible bottom stack that lifts each incremental bar
  // - positive / negative / total: visible bars
  const spacerData: number[] = [];
  const positiveData: (number | null)[] = [];
  const negativeData: (number | null)[] = [];
  const totalData: (number | null)[] = [];

  let runningTotal = 0;

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (isTotal[i]) {
      // Total bar starts from 0
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
      // Negative bar: spacer goes to the top of where the bar will end
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
      formatter: (seriesName: string) => seriesName === "spacer" ? "" : seriesName,
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

// ── Shareholding Charts ───────────────────────────────────────────────────────

// A neutral-but-distinct palette that works on white backgrounds
const SHAREHOLDING_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8", "#52525b", "#3f3f46", "#27272a"];

function ShareholdingCharts({ sections, quarters }: { sections: ShareholdingSection[]; quarters: string[] }) {
  // Find the latest quarter where at least one section has a non-null value
  const period = [...quarters].reverse().find((q) =>
    sections.some((s) => {
      const dp = s.data.find((d) => d.quarter === q);
      return dp?.value !== null && dp?.value !== undefined;
    })
  ) ?? quarters[quarters.length - 1];

  // Use only top-level sections (not children) and filter out zero/null
  const items = sections
    .map((s) => {
      const dp = s.data.find((d) => d.quarter === period);
      return { label: s.label, value: dp?.value ?? null };
    })
    .filter((item): item is { label: string; value: number } => item.value !== null && item.value > 0);

  const maxValue = Math.max(...items.map((i) => i.value));

  // Donut chart config
  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", toolbar: { show: false }, animations: { enabled: false } },
    labels: items.map((i) => i.label),
    colors: SHAREHOLDING_COLORS,
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "58%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "12px",
              fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
              color: "#888888",
              formatter: () => "100%",
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(1)}%` },
    },
    stroke: { width: 2, colors: ["#ffffff"] },
  };

  return (
    <div className="grid grid-cols-2 gap-8" style={{ alignItems: "start" }}>
      {/* Left — horizontal bar chart */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Latest Quarter · {period}
        </div>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.label}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B", marginBottom: 6 }}>{item.label}</div>
              <div className="flex items-center gap-3">
                <div style={{ flex: 1, height: 28, background: "#F5F5F5", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      height: "100%",
                      background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length],
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172B", minWidth: 52, textAlign: "right" }}>
                  {item.value.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — donut chart */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Shareholding Summary
        </div>
        <ApexChart
          type="donut"
          series={items.map((i) => i.value)}
          options={donutOptions}
          height={300}
        />
        {/* Custom legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-center">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#888888" }}>{item.label}: <strong style={{ color: "#0F172B" }}>{item.value.toFixed(1)}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: "table" | "chart"; onChange: (v: "table" | "chart") => void }) {
  return (
    <div className="inline-flex items-center gap-0.5" style={{ border: "1px solid #E2E2E2", borderRadius: 6, padding: 2 }}>
      {(["table", "chart"] as const).map((v) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 4,
              border: "none",
              background: active ? "#0F172B" : "transparent",
              color: active ? "#fff" : "#888888",
              cursor: "pointer",
            }}
          >
            {v === "table" ? <TableIcon size={13} /> : <BarChart2 size={13} />}
          </button>
        );
      })}
    </div>
  );
}

function FinancialsContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "";
  const [balanceSheetView, setBalanceSheetView] = useState<"table" | "chart">("table");
  const [cashFlowView, setCashFlowView] = useState<"table" | "chart">("table");
  const [shareholdingView, setShareholdingView] = useState<"table" | "chart">("table");

  const { data, loading, error } = useFinancials(symbol);
  const { data: chartsData } = useFinancialsCharts(symbol);
  const { data: peersData, loading: peersLoading } = useScreenerPeers(symbol);
  const { data: shareholdingData, loading: shareholdingLoading } = useShareholding(symbol);

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
            tabs={balanceSheetView === "table" && balanceSheet.quarterly ? ["Quarterly", "Annual"] : undefined}
            defaultTab="Annual"
            headerAction={<ViewToggle view={balanceSheetView} onChange={setBalanceSheetView} />}
          >
            {(activeTab) =>
              balanceSheetView === "chart" ? (
                <BalanceSheetTreemap table={balanceSheet.annual} />
              ) : (
                <FinancialDataTable
                  table={activeTab === "Quarterly" && balanceSheet.quarterly ? balanceSheet.quarterly : balanceSheet.annual}
                />
              )
            }
          </TabularCard>
        </div>

        {/* Row 4 — Cash Flow */}
        <div id="section-cash-flow">
          <TabularCard
            title="Cash Flow"
            subtitle="All values in INR Crores"
            tabs={cashFlowView === "table" && cashFlowQuarterly ? ["Quarterly", "Annual"] : undefined}
            defaultTab="Annual"
            headerAction={<ViewToggle view={cashFlowView} onChange={setCashFlowView} />}
          >
            {(activeTab) =>
              cashFlowView === "chart" ? (
                <CashFlowWaterfall table={cashFlow} />
              ) : (
                <FinancialDataTable
                  table={activeTab === "Quarterly" && cashFlowQuarterly ? cashFlowQuarterly : cashFlow}
                  cashFlowMode
                />
              )
            }
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

        {/* Row 6 — Shareholding Pattern */}
        {(shareholdingLoading || shareholdingData) && (
          <div id="section-shareholding">
            <TabularCard
              title="Shareholding Pattern"
              subtitle="Numbers in percentages"
              tabs={shareholdingView === "table" ? ["Quarterly", "Annual"] : undefined}
              headerAction={<ViewToggle view={shareholdingView} onChange={setShareholdingView} />}
            >
              {(activeTab) => shareholdingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-zinc-600 animate-spin" />
                </div>
              ) : shareholdingView === "chart" ? (
                <ShareholdingCharts sections={shareholdingData!.sections} quarters={shareholdingData!.quarters} />
              ) : (
                <ShareholdingTable sections={shareholdingData!.sections} quarters={shareholdingData!.quarters} mode={activeTab} />
              )}
            </TabularCard>
          </div>
        )}

        {/* Row 7 — Growth & Returns */}
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
