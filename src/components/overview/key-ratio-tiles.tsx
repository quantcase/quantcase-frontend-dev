"use client";

import { formatPrice, formatINR } from "@/lib/utils";
import type { ScreenerData } from "@/types/screener";

interface MetricTileProps {
  label: string;
  value: string;
  sublabel?: string | null;
  sublabelColor?: "emerald" | "red" | "muted";
}

function MetricTile({ label, value, sublabel, sublabelColor = "muted" }: MetricTileProps) {
  const sublabelClass =
    sublabelColor === "emerald" ? "text-emerald-600" :
    sublabelColor === "red" ? "text-red-600" :
    "text-[var(--qc-text-muted)]";

  return (
    <div className="rounded-lg border border-[var(--qc-border-default)] bg-[var(--qc-surface-white)] px-4 py-4 flex flex-col gap-1.5 min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-[var(--qc-text-muted)] font-medium">{label}</p>
      <p className="text-[22px] font-medium text-[var(--qc-text-heading)] leading-none truncate">{value}</p>
      {sublabel && (
        <p className={`text-[11px] font-semibold ${sublabelClass}`}>{sublabel}</p>
      )}
    </div>
  );
}

interface Props {
  data: ScreenerData;
}

export function KeyRatioTiles({ data }: Props) {
  const qt = data.quote;
  const ps = data.perShare;
  const fin = data.financials;
  const ks = data.keyStats;

  // CMP
  const priceDisplay = qt.price != null ? formatPrice(qt.price, 0) : "—";
  const priceChange = qt.changePercent;
  const priceChangeSublabel = priceChange != null
    ? `${priceChange >= 0 ? "▲ +" : "▼ "}${(priceChange * 100).toFixed(1)}% today`
    : null;

  // Market Cap
  const marketCapDisplay = qt.marketCap != null ? formatINR(qt.marketCap) : "—";
  const marketCapLabel = qt.marketCapLabel ?? null;

  // 52W Range
  const week52Display = qt.week52Low != null && qt.week52High != null
    ? `${formatPrice(qt.week52Low, 0)}–${formatPrice(qt.week52High, 0)}`
    : "—";
  const week52Spread = qt.week52Low != null && qt.week52High != null && qt.week52Low > 0
    ? `±${Math.round(((qt.week52High - qt.week52Low) / qt.week52Low) * 100)}%`
    : null;

  // EPS CAGR 3Y
  const epsCagrRaw = fin.eps_cagr_3y;
  const epsCagrDisplay = epsCagrRaw != null
    ? `${epsCagrRaw >= 0 ? "+" : ""}${(epsCagrRaw * 100).toFixed(1)}%`
    : ks.earningsQuarterlyGrowth != null
      ? `${ks.earningsQuarterlyGrowth >= 0 ? "+" : ""}${(ks.earningsQuarterlyGrowth * 100).toFixed(1)}%`
      : "—";
  const epsCagrIsPositive = epsCagrDisplay !== "—" && !epsCagrDisplay.startsWith("-");
  const epsCagrLabel = fin.eps_cagr_3y_label ?? null;

  // Dividend Yield
  const divYield = ps.dividendYield != null ? `${(ps.dividendYield * 100).toFixed(1)}%` : "—";

  return (
    <div className="px-4 pb-2 pt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricTile
          label="CMP"
          value={priceDisplay}
          sublabel={priceChangeSublabel}
          sublabelColor={(priceChange ?? 0) >= 0 ? "emerald" : "red"}
        />
        <MetricTile
          label="Market Cap"
          value={marketCapDisplay}
          sublabel={marketCapLabel}
        />
        <MetricTile
          label="52W Range"
          value={week52Display}
          sublabel={week52Spread}
        />
        <MetricTile
          label="EPS CAGR 3Y"
          value={epsCagrDisplay}
          sublabel={epsCagrLabel}
          sublabelColor={epsCagrDisplay !== "—" ? (epsCagrIsPositive ? "emerald" : "red") : "muted"}
        />
        <MetricTile
          label="Dividend Yield"
          value={divYield}
          sublabel="Annual"
        />
      </div>
    </div>
  );
}
