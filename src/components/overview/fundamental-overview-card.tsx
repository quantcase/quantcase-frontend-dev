"use client";

import { useState } from "react";
import { TabularCard } from "@/components/molecules/tabular-card";
import { formatINR } from "@/lib/utils";
import type { ScreenerData, QuarterlyTrend } from "@/types/screener";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function pct(val: number | null | undefined, decimals = 1): string {
  if (val == null) return "—";
  return `${(val * 100).toFixed(decimals)}%`;
}

function pctRaw(val: number | null | undefined, decimals = 1): string {
  if (val == null) return "—";
  return `${val.toFixed(decimals)}%`;
}

type MetricKey = "revenue" | "ebitda" | "netProfit" | "cfo" | "fcf" | "reserves" | "debt";

interface MetricTileCardProps {
  label: string;
  value: string;
  growth?: number | null;
  invertGrowth?: boolean;
  metricKey: MetricKey;
  selected: boolean;
  onClick: (key: MetricKey) => void;
}

function MetricTileCard({ label, value, growth, invertGrowth, metricKey, selected, onClick }: MetricTileCardProps) {
  const hasGrowth = growth != null;
  const isPositiveRaw = hasGrowth && growth! >= 0;
  const isPositive = invertGrowth ? !isPositiveRaw : isPositiveRaw;
  const growthText = hasGrowth
    ? `${growth! >= 0 ? "+" : ""}${(growth! * 100).toFixed(1)}% YoY`
    : null;

  return (
    <button
      type="button"
      onClick={() => onClick(metricKey)}
      className={`rounded-lg border px-4 py-4 flex flex-col gap-1.5 min-w-0 text-left transition-colors cursor-pointer w-full ${
        selected
          ? "border-[var(--qc-accent-primary)] bg-[var(--qc-accent-primary)]/5"
          : "border-[var(--qc-border-default)] bg-[var(--qc-surface-white)] hover:border-[var(--qc-accent-primary)]/40"
      }`}
    >
      <p className="text-[11px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-[20px] font-medium text-[var(--qc-text-heading)] leading-none truncate">{value}</p>
        {hasGrowth && (
          <span className={`text-[12px] leading-none ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "▲" : "▼"}
          </span>
        )}
      </div>
      {growthText && (
        <p className={`text-[11px] font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
          {growthText}
        </p>
      )}
    </button>
  );
}

interface RatioTileCardProps {
  label: string;
  value: string;
  sublabel?: string | null;
  trendIcon?: "up" | "down" | null;
}

function RatioTileCard({ label, value, sublabel, trendIcon }: RatioTileCardProps) {
  const isPositive = trendIcon === "up";
  return (
    <div className="rounded-lg border border-[var(--qc-border-default)] bg-[var(--qc-surface-white)] px-4 py-4 flex flex-col gap-1.5 min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-[20px] font-medium text-[var(--qc-text-heading)] leading-none">{value}</p>
        {trendIcon && (
          <span className={`text-[12px] leading-none ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "▲" : "▼"}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="text-[11px] text-[var(--qc-text-muted)]">{sublabel}</p>
      )}
    </div>
  );
}

interface RatioRowProps {
  label: string;
  value: string;
  sublabel?: string | null;
  badge?: string | null;
  badgeColor?: "red" | "amber" | "green" | "zinc";
}

function RatioRow({ label, value, sublabel, badge, badgeColor = "zinc" }: RatioRowProps) {
  const badgeClass = {
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    zinc: "bg-zinc-100 text-zinc-600",
  }[badgeColor];

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--qc-border-default)] last:border-0">
      <span className="text-sm text-[var(--qc-text-body)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[var(--qc-text-heading)]">{value}</span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${badgeClass}`}>
            {badge}
          </span>
        )}
        {sublabel && !badge && (
          <span className="text-[11px] text-[var(--qc-text-muted)]">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

const METRIC_CONFIG: Record<MetricKey, { label: string; dataKey: keyof QuarterlyTrend }> = {
  revenue:   { label: "Revenue Trend",   dataKey: "revenue" },
  ebitda:    { label: "EBITDA Trend",    dataKey: "ebitda" },
  netProfit: { label: "Net Profit Trend", dataKey: "netIncome" },
  cfo:       { label: "CFO Trend",       dataKey: "revenue" },
  fcf:       { label: "FCF Trend",       dataKey: "revenue" },
  reserves:  { label: "Reserves Trend",  dataKey: "totalEquity" },
  debt:      { label: "Debt Trend",      dataKey: "totalDebt" },
};

interface MetricChartProps {
  metricKey: MetricKey;
  quarterlyTrend: QuarterlyTrend[];
}

function MetricChart({ metricKey, quarterlyTrend }: MetricChartProps) {
  const config = METRIC_CONFIG[metricKey];
  const chartData = quarterlyTrend
    .filter((q) => q[config.dataKey] != null)
    .map((q) => ({
      period: q.period,
      value: parseFloat(((q[config.dataKey] as number) / 1e7).toFixed(1)),
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--qc-text-muted)] text-sm">
        No data available
      </div>
    );
  }

  const values = chartData.map((d) => d.value).filter((v) => v != null) as number[];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.15 || maxVal * 0.1 || 1;
  const yMin = Math.max(0, Math.floor(minVal - padding));
  const yMax = Math.ceil(maxVal + padding);

  return (
    <div className="flex flex-col h-full gap-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium">
        {config.label}
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--qc-accent-primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--qc-accent-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="period"
              tick={{ fontSize: 10, fill: "var(--qc-text-muted)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 10, fill: "var(--qc-text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--qc-surface-white)",
                border: "1px solid var(--qc-border-default)",
                borderRadius: 8,
                fontSize: 12,
                padding: "6px 10px",
              }}
              formatter={(v: number) => [`₹${v} Cr`, config.label.replace(" Trend", "")]}
              labelStyle={{ fontSize: 11, color: "var(--qc-text-muted)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--qc-accent-primary)"
              strokeWidth={1.5}
              fill="url(#metricGradient)"
              dot={{ r: 2, fill: "var(--qc-accent-primary)", strokeWidth: 0 }}
              activeDot={{ r: 3, fill: "var(--qc-accent-primary)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface Props {
  data: ScreenerData;
}

export function FundamentalOverviewCard({ data }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("revenue");

  const fp = data.financialPerformance;
  const val = data.valuation;
  const eff = data.efficiency;
  const own = data.ownership;
  const ratios = data.ratios;

  const peLabel = val.peValuationLabel;
  const peLabelColor: "red" | "amber" | "green" | "zinc" =
    peLabel === "Premium" ? "red" : peLabel === "Fair" ? "amber" : peLabel === "Discount" ? "green" : "zinc";

  const industryPELabelColor: "red" | "amber" | "green" | "zinc" =
    val.industryPELabel === "Premium" ? "red"
    : val.industryPELabel === "Fair" ? "amber"
    : val.industryPELabel === "Discount" ? "green"
    : "zinc";

  const publicLabelColor: "red" | "amber" | "green" | "zinc" =
    own.publicLabel === "High" ? "red"
    : own.publicLabel === "Moderate" ? "amber"
    : own.publicLabel === "Low" ? "green"
    : "zinc";

  const quarterlyTrend = fp.quarterlyTrend ?? [];

  return (
    <TabularCard title="Fundamentals">
      <div className="space-y-5">

        {/* KEY METRICS — two-column layout: 60% metrics, 40% chart */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium mb-2">Key Metrics</p>
          <div className="flex gap-4">
            {/* Left: metric tiles (60%) */}
            <div className="flex flex-col gap-3" style={{ flex: "0 0 60%" }}>
              <div className="grid grid-cols-2 gap-3">
                <MetricTileCard label="Revenue" value={formatINR(fp.revenue)} growth={fp.revenueGrowth} metricKey="revenue" selected={selectedMetric === "revenue"} onClick={setSelectedMetric} />
                <MetricTileCard label="EBITDA" value={formatINR(fp.ebitda)} growth={fp.ebitdaGrowth} metricKey="ebitda" selected={selectedMetric === "ebitda"} onClick={setSelectedMetric} />
                <MetricTileCard label="Net Profit" value={formatINR(fp.netProfit)} growth={fp.netProfitGrowth} metricKey="netProfit" selected={selectedMetric === "netProfit"} onClick={setSelectedMetric} />
                <MetricTileCard label="CFO" value={formatINR(fp.operatingCashflow)} growth={fp.cfoGrowth} metricKey="cfo" selected={selectedMetric === "cfo"} onClick={setSelectedMetric} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MetricTileCard label="FCF" value={formatINR(fp.freeCashflow)} growth={fp.fcfGrowth} metricKey="fcf" selected={selectedMetric === "fcf"} onClick={setSelectedMetric} />
                <MetricTileCard label="Reserves" value={formatINR(fp.reserves)} growth={fp.reservesGrowth} metricKey="reserves" selected={selectedMetric === "reserves"} onClick={setSelectedMetric} />
                <MetricTileCard label="Debt" value={formatINR(eff.totalDebt)} growth={eff.debtGrowth} invertGrowth metricKey="debt" selected={selectedMetric === "debt"} onClick={setSelectedMetric} />
              </div>
            </div>

            {/* Right: trend chart (40%) */}
            <div
              className="rounded-lg border border-[var(--qc-border-default)] bg-[var(--qc-surface-white)] px-4 py-4"
              style={{ flex: "0 0 40%" }}
            >
              {quarterlyTrend.length > 0 ? (
                <MetricChart metricKey={selectedMetric} quarterlyTrend={quarterlyTrend} />
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--qc-text-muted)] text-sm">
                  No trend data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KEY RATIOS */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium mb-2">Key Ratios</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <RatioTileCard
              label="ROCE"
              value={ratios.roce != null ? pctRaw(ratios.roce) : "—"}
              sublabel={ratios.roce3yAvg != null ? `3Y avg ${pctRaw(ratios.roce3yAvg)}` : null}
              trendIcon={ratios.roce != null && ratios.roce3yAvg != null ? (ratios.roce >= ratios.roce3yAvg ? "up" : "down") : null}
            />
            <RatioTileCard
              label="ROE"
              value={ratios.roe != null ? pctRaw(ratios.roe) : "—"}
              sublabel={ratios.roe3yAvg != null ? `3Y avg ${pctRaw(ratios.roe3yAvg)}` : null}
              trendIcon={ratios.roe != null && ratios.roe3yAvg != null ? (ratios.roe >= ratios.roe3yAvg ? "up" : "down") : null}
            />
            <RatioTileCard
              label="Debt / Equity"
              value={eff.debtToEquity != null ? `${eff.debtToEquity.toFixed(2)}x` : "—"}
              sublabel={ratios.debtStatus}
            />
          </div>
        </div>

        {/* VALUATION + OWNERSHIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Valuation */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium mb-2">Valuation</p>
            <div className="rounded-[10px] border border-[var(--qc-border-default)] px-4">
              <RatioRow
                label="P/E"
                value={val.peRatio != null ? `${val.peRatio.toFixed(1)}x` : "—"}
                badge={val.peValuationLabel}
                badgeColor={peLabelColor}
              />
              <RatioRow
                label="PEG"
                value={val.pegRatio != null ? `${val.pegRatio.toFixed(1)}x` : "—"}
              />
              <RatioRow
                label="EV / EBITDA"
                value={val.evToEbitda != null ? `${val.evToEbitda.toFixed(1)}x` : "—"}
              />
              <RatioRow
                label="Industry P/E"
                value={val.industryPE != null ? `${val.industryPE.toFixed(1)}x` : "—"}
                badge={val.industryPELabel}
                badgeColor={industryPELabelColor}
              />
            </div>
          </div>

          {/* Ownership */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium mb-2">Ownership</p>
            <div className="rounded-[10px] border border-[var(--qc-border-default)] px-4">
              <RatioRow label="Promoter" value={pct(own.promoter)} />
              <RatioRow
                label="FII"
                value={own.fii != null ? pct(own.fii) : own.institutions != null ? pct(own.institutions) : "—"}
                sublabel={own.fii == null && own.institutions != null ? "Institutions" : null}
              />
              <RatioRow label="DII" value={own.dii != null ? pct(own.dii) : "—"} />
              <RatioRow
                label="Public"
                value={pct(own.public)}
                badge={own.publicLabel}
                badgeColor={publicLabelColor}
              />
            </div>
          </div>
        </div>

      </div>
    </TabularCard>
  );
}
