"use client";

import { TabularCard } from "@/components/molecules/tabular-card";
import { formatINR, formatPrice } from "@/lib/utils";
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

interface MetricRowProps {
  label: string;
  value: string;
  growth: number | null | undefined;
  invertGrowth?: boolean;
}

function MetricRow({ label, value, growth, invertGrowth }: MetricRowProps) {
  const g = growthDisplay(growth);
  const isPositive = g.positive === null ? null : invertGrowth ? !g.positive : g.positive;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E2E2E2] last:border-0">
      <span className="text-sm text-[#121212]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#0F172B]">{value}</span>
        {g.text && (
          <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${
            isPositive === true ? "text-emerald-600" : isPositive === false ? "text-red-600" : "text-[#888888]"
          }`}>
            {isPositive === true ? "▲" : isPositive === false ? "▼" : ""} {g.text}
          </span>
        )}
      </div>
    </div>
  );
}

interface RatioRowProps {
  label: string;
  value: string;
  sublabel?: string | null;
  badge?: string | null;
  badgeColor?: "red" | "amber" | "green" | "zinc";
  trendIcon?: "up" | "down" | null;
  invertTrend?: boolean;
}

function RatioRow({ label, value, sublabel, badge, badgeColor = "zinc", trendIcon, invertTrend }: RatioRowProps) {
  const badgeClass = {
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    zinc: "bg-zinc-100 text-zinc-600",
  }[badgeColor];

  const isPositive = trendIcon == null ? null : invertTrend ? trendIcon === "down" : trendIcon === "up";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E2E2E2] last:border-0">
      <span className="text-sm text-[#121212]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#0F172B]">{value}</span>
        {trendIcon && (
          <span className={`text-[11px] font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "▲" : "▼"}
          </span>
        )}
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

interface Props {
  data: ScreenerData;
}

export function FundamentalOverviewCard({ data }: Props) {
  const fp = data.financialPerformance;
  const val = data.valuation;
  const eff = data.efficiency;
  const rat = data.ratios;
  const own = data.ownership;
  const qt = data.quote;
  const ps = data.perShare;
  const ks = data.keyStats;
  const fin = data.financials;

  // Market strip values
  const priceDisplay = qt.price != null ? formatPrice(qt.price, 0) : "—";
  const priceChange = qt.changePercent;
  const priceChangeSublabel = priceChange != null
    ? `${priceChange >= 0 ? "+" : ""}${(priceChange * 100).toFixed(1)}% today`
    : null;

  const week52Display = qt.week52Low != null && qt.week52High != null
    ? `${formatPrice(qt.week52Low, 0)}–${formatPrice(qt.week52High, 0)}`
    : "—";
  const week52Spread = qt.week52Low != null && qt.week52High != null && qt.week52Low > 0
    ? `±${Math.round(((qt.week52High - qt.week52Low) / qt.week52Low) * 100)}% spread`
    : null;

  const epsCagrRaw = fin.eps_cagr_3y;
  const epsCagrDisplay = epsCagrRaw != null
    ? epsCagrRaw
    : ks.earningsQuarterlyGrowth != null
      ? `${ks.earningsQuarterlyGrowth >= 0 ? "+" : ""}${(ks.earningsQuarterlyGrowth * 100).toFixed(1)}%`
      : "—";
  const epsCagrIsPositive = typeof epsCagrDisplay === "number"
    ? epsCagrDisplay >= 0
    : typeof epsCagrDisplay === "string" && epsCagrDisplay !== "—" && !epsCagrDisplay.startsWith("-");
  const epsCagrFormatted = typeof epsCagrDisplay === "number"
    ? `${epsCagrDisplay >= 0 ? "+" : ""}${(epsCagrDisplay * 100).toFixed(1)}%`
    : epsCagrDisplay;

  const dividendYieldDisplay = ps.dividendYield != null
    ? `${(ps.dividendYield * 100).toFixed(1)}%`
    : "—";

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

        {/* KEY METRICS + KEY RATIOS side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Key Metrics */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-2">Key Metrics</p>
            <div className="rounded-[10px] border border-[#E2E2E2] px-4 divide-y-0">
              <MetricRow label="Revenue" value={formatINR(fp.revenue)} growth={fp.revenueGrowth} />
              <MetricRow label="EBITDA" value={formatINR(fp.ebitda)} growth={fp.ebitdaGrowth} />
              <MetricRow label="Net Profit" value={formatINR(fp.netProfit)} growth={fp.netProfitGrowth} />
              <MetricRow label="CFO" value={formatINR(fp.operatingCashflow)} growth={fp.cfoGrowth} />
              <MetricRow label="FCF" value={formatINR(fp.freeCashflow)} growth={fp.fcfGrowth} />
              <MetricRow label="Reserves" value={formatINR(fp.reserves)} growth={fp.reservesGrowth} />
              <MetricRow label="Debt" value={formatINR(eff.totalDebt)} growth={eff.debtGrowth} invertGrowth />
            </div>
          </div>

          {/* Key Ratios */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#888888] font-medium mb-2">Key Ratios</p>
            <div className="rounded-[10px] border border-[#E2E2E2] px-4 divide-y-0">
              <RatioRow
                label="CMP"
                value={priceDisplay}
                sublabel={priceChangeSublabel}
                trendIcon={priceChange != null ? (priceChange >= 0 ? "up" : "down") : null}
              />
              <RatioRow
                label="52W Range"
                value={week52Display}
                sublabel={week52Spread}
              />
              <RatioRow
                label="EPS CAGR 3Y"
                value={epsCagrFormatted}
                trendIcon={epsCagrFormatted !== "—" ? (epsCagrIsPositive ? "up" : "down") : null}
              />
              <RatioRow
                label="Dividend Yield"
                value={dividendYieldDisplay}
                sublabel="Annual"
              />
              <RatioRow
                label="ROCE"
                value={rat.roce != null ? `${(rat.roce * 100).toFixed(1)}%` : "—"}
                sublabel={rat.roce3yAvg != null ? `3Y avg ${(rat.roce3yAvg * 100).toFixed(1)}%` : null}
                trendIcon={rat.roce != null && rat.roce3yAvg != null ? (rat.roce >= rat.roce3yAvg ? "up" : "down") : null}
              />
              <RatioRow
                label="ROE"
                value={rat.roe != null ? `${(rat.roe * 100).toFixed(1)}%` : "—"}
                sublabel={rat.roe3yAvg != null ? `3Y avg ${(rat.roe3yAvg * 100).toFixed(1)}%` : null}
                trendIcon={rat.roe != null && rat.roe3yAvg != null ? (rat.roe >= rat.roe3yAvg ? "up" : "down") : null}
              />
              <RatioRow
                label="Debt / Equity"
                value={eff.debtToEquity != null ? `${eff.debtToEquity.toFixed(2)}x` : "—"}
                sublabel={rat.debtStatus}
                trendIcon={rat.debtStatus === "Near debt-free" || rat.debtStatus === "Low debt" ? "up" : rat.debtStatus === "High debt" ? "down" : null}
                invertTrend
              />
            </div>
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
