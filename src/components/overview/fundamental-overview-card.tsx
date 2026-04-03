"use client";

import { TabularCard } from "@/components/molecules/tabular-card";
import { formatINR } from "@/lib/utils";
import type { ScreenerData } from "@/types/screener";

function pct(val: number | null | undefined, decimals = 1): string {
  if (val == null) return "—";
  return `${(val * 100).toFixed(decimals)}%`;
}

function growthDisplay(val: number | null | undefined): { text: string; positive: boolean | null } {
  if (val == null) return { text: "", positive: null };
  const sign = val >= 0 ? "+" : "";
  return {
    text: `${sign}${(val * 100).toFixed(1)}% YoY`,
    positive: val >= 0,
  };
}

interface MetricTileProps {
  label: string;
  value: string;
  growth: number | null | undefined;
  invertGrowth?: boolean; // for DEBT: lower is better
}

function MetricTile({ label, value, growth, invertGrowth }: MetricTileProps) {
  const g = growthDisplay(growth);
  const isPositive = g.positive === null ? null : invertGrowth ? !g.positive : g.positive;
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-4 flex flex-col gap-1.5">
      <small className="text-[10px] uppercase tracking-wider text-[#888888] font-medium">{label}</small>
      <p className="text-xl font-semibold text-[#0F172B] leading-tight">{value}</p>
      {g.text && (
        <small className={`text-[11px] font-semibold flex items-center gap-1 ${
          isPositive === true ? "text-emerald-600" : isPositive === false ? "text-red-600" : "text-[#888888]"
        }`}>
          {isPositive === true ? "▲" : isPositive === false ? "▼" : ""} {g.text}
        </small>
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
    <div className="flex items-center justify-between py-2.5 border-b border-[#E2E2E2] last:border-0">
      <span className="text-sm text-[#121212]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#0F172B]">{value}</span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${badgeClass}`}>
            {badge}
          </span>
        )}
        {sublabel && !badge && (
          <span className="text-[11px] text-[#888888]">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

interface RatioTileProps {
  label: string;
  value: string;
  sublabel?: string | null;
  trend?: number | null; // positive = good
  invertTrend?: boolean;
}

function RatioTile({ label, value, sublabel, trend, invertTrend }: RatioTileProps) {
  const isPositive = trend == null ? null : invertTrend ? trend < 0 : trend > 0;
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-4 flex flex-col gap-1">
      <small className="text-[10px] uppercase tracking-wider text-[#888888] font-medium">{label}</small>
      <div className="flex items-baseline gap-1.5">
        <p className="text-xl font-semibold text-[#0F172B] leading-tight">{value}</p>
        {isPositive !== null && (
          <span className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "▲" : "▼"}
          </span>
        )}
      </div>
      {sublabel && <small className="text-[11px] text-[#888888]">{sublabel}</small>}
    </div>
  );
}

interface Props {
  data: ScreenerData;
}

export function FundamentalOverviewCard({ data }: Props) {
  const fp = data.financialPerformance;
  const val = data.valuation;
  const eff = data.efficiency;
  const rat = data.ratios;
  const own = data.ownership;

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

  return (
    <TabularCard title="Fundamentals">
      <div className="space-y-5">

        {/* KEY METRICS */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-3">Key Metrics</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricTile label="Revenue" value={formatINR(fp.revenue)} growth={fp.revenueGrowth} />
            <MetricTile label="EBITDA" value={formatINR(fp.ebitda)} growth={fp.ebitdaGrowth} />
            <MetricTile label="Net Profit" value={formatINR(fp.netProfit)} growth={fp.netProfitGrowth} />
            <MetricTile label="CFO" value={formatINR(fp.operatingCashflow)} growth={fp.cfoGrowth} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <MetricTile label="FCF" value={formatINR(fp.freeCashflow)} growth={fp.fcfGrowth} />
            <MetricTile label="Reserves" value={formatINR(fp.reserves)} growth={fp.reservesGrowth} />
            <MetricTile label="Debt" value={formatINR(eff.totalDebt)} growth={eff.debtGrowth} invertGrowth />
          </div>
        </div>

        {/* KEY RATIOS */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-3">Key Ratios</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <RatioTile
              label="ROCE"
              value={rat.roce != null ? `${(rat.roce * 100).toFixed(1)}%` : "—"}
              sublabel={rat.roce3yAvg != null ? `3Y avg ${(rat.roce3yAvg * 100).toFixed(1)}%` : null}
              trend={rat.roce != null && rat.roce3yAvg != null ? rat.roce - rat.roce3yAvg : null}
            />
            <RatioTile
              label="ROE"
              value={rat.roe != null ? `${(rat.roe * 100).toFixed(1)}%` : "—"}
              sublabel={rat.roe3yAvg != null ? `3Y avg ${(rat.roe3yAvg * 100).toFixed(1)}%` : null}
              trend={rat.roe != null && rat.roe3yAvg != null ? rat.roe - rat.roe3yAvg : null}
            />
            <RatioTile
              label="Debt / Equity"
              value={eff.debtToEquity != null ? `${eff.debtToEquity.toFixed(2)}x` : "—"}
              sublabel={rat.debtStatus}
              trend={rat.debtStatus === "Near debt-free" || rat.debtStatus === "Low debt" ? 1 : rat.debtStatus === "High debt" ? -1 : null}
            />
          </div>
        </div>

        {/* VALUATION + OWNERSHIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Valuation */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-2">Valuation</p>
            <div className="rounded-[10px] border border-[#E2E2E2] px-4 divide-y-0">
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
            <p className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-2">Ownership</p>
            <div className="rounded-[10px] border border-[#E2E2E2] px-4 divide-y-0">
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
